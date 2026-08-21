import { ref } from 'vue';
// ========================================================================
// FunASR 实时语音识别 Hook —— 与 useASR 同接口, 可无缝替换
// 用法: const { connect, disconnect, startASR, stop, reset, result, logs, connected, recording, volume, lastBlob, lastAudio, lastBlobBase64 } = useFunASR(config)
//
// 协议说明(参考: https://github.com/modelscope/FunASR/blob/main/runtime/docs/websocket_protocol_zh.md):
//   1) URL 形如 ws://127.0.0.1:10095, 连接成功后立即发送一段 JSON 配置:
//        { mode: '2pass', wav_name: 'browser', wav_format: 'pcm',
//          is_speaking: true, audio_fs: 16000,
//          chunk_size: [5,10,5], itn: true }
//   2) 之后以二进制形式持续发送 16kHz / 16bit / mono PCM 帧(Int16Array.buffer)
//   3) 停止时先发 { is_speaking: false } 表示"一句结束", 再 close
//   4) 服务端返回 JSON 消息:
//        - mode = '2pass-online'  -> 中间句(partial), 频繁刷新
//        - mode = '2pass-offline' -> 修正后的整句(final), VAD 检测到句尾后到达
//        - is_final = true        -> 最后一条, 之后连接即将关闭
//
//   这里把 '2pass-online' 映射成 useASR 的 partial, '2pass-offline' / is_final
//   映射成 final, 让上层 UI 与 useASR 完全一致。
// ========================================================================

const BASE_HOST: string = '127.0.0.1:10095';
const DEFAULT_WS_URL: string = `ws://${BASE_HOST}`;

/**
 * 服务端 → 客户端的消息结构(参考 FunASR websocket_protocol)
 */
type FunASRServerMsg = {
  mode?: '2pass-online' | '2pass-offline' | string;
  wav_name?: string;
  text?: string;
  is_final?: boolean;
  timestamp?: string;
  stamp_sents?: any[];
  [k: string]: any;
};

export interface UseFunASRConfig {
  wsUrl?: string;
  /** 推理模式: 2pass=实时+离线修正, online=纯流式, offline=整句 */
  mode?: '2pass' | 'online' | 'offline';
  /** 是否启用 ITN(数字/日期规范化), 默认 true */
  itn?: boolean;
  /** 流式延迟配置 [左窗, 当前, 右窗] 单位 60ms, 默认 [5,10,5] */
  chunkSize?: [number, number, number];
  /** 采样率, 默认 16000 */
  audioFs?: number;
  /** wav 名称, 仅做标识 */
  wavName?: string;
  /**
   * 麦克风流就绪回调: getUserMedia 拿到 stream 后异步触发, 外部可 clone 一份做 VAD 旁路检测.
   * <p>用微任务异步调, 不阻塞 startASR 主流程; 不传则不触发.</p>
   */
  onStreamReady?: (stream: MediaStream) => void;
}

export interface UseFunASRReturn {
  connect: () => void;
  disconnect: () => void;
  startASR: () => Promise<void>;
  stop: () => void;
  /**
   * 一次性重置所有"上一次录音的产出":
   *   - 字幕栏: result / finalText
   *   - 录音产出: lastBlob / lastAudio / lastBlobBase64
   * 用于发送后或异常时让 UI 回到"等下次录音"状态, 避免下一轮看到上一段话。
   */
  reset: () => void;
  result: import('vue').Ref<string>;
  /** 仅包含已确认的最终句(不含当前正在识别的 partial) */
  finalText: import('vue').Ref<string>;
  logs: import('vue').Ref<string[]>;
  connected: import('vue').Ref<boolean>;
  recording: import('vue').Ref<boolean>;
  /** 实时音量电平 0-100, 由 AnalyserNode 计算(同一 stream, 不开第二个麦克风) */
  volume: import('vue').Ref<number>;
  /**
   * 最近一次录音产出的 blob(可在 stop() 之后的回调里读取)
   * <p>注意: 这是同步给出的引用, 调用方读取完应自行置空, 避免下次录音残留。</p>
   */
  lastBlob: { value: Blob | null };
  /**
   * 最近一次录音的元数据: durationSec(秒) / mimeType / ext(后端需要的扩展名)
   */
  lastAudio: { value: { durationSec: number; mimeType: string; ext: string } | null };
  /**
   * 最近一次录音 blob 的 base64 字符串
   * <p>注意: 这是同步给出的引用, 调用方读取完应自行置空, 避免下次录音残留。</p>
   */
  lastBlobBase64: { value: string | null };
}

export function useFunASR(config: UseFunASRConfig = {}): UseFunASRReturn {
  const result = ref<string>('');
  const finalTextRef = ref<string>('');
  const logs = ref<string[]>([]);
  const connected = ref<boolean>(false);
  const recording = ref<boolean>(false);
  const volume = ref<number>(0);

  let ws: WebSocket | null = null;
  let audioCtx: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let stream: MediaStream | null = null;
  /** 同一 stream 上的电平分析(避免再开第二个麦克风) */
  let analyser: AnalyserNode | null = null;
  let volumeTimer: number | null = null;
  let volumeBuf: Uint8Array | null = null;
  /** 同一 stream 上的 MediaRecorder, 用于产出送后端的音频 blob */
  let mediaRecorder: MediaRecorder | null = null;
  let recorderChunks: BlobPart[] = [];
  /** 录音开始时间戳(ms), stop 时算 durationSec = (now - startMs) / 1000 */
  let recordStartMs: number | null = null;

  let finalText: string = '';
  /** 当前正在识别这一句的"线上累积", 句尾(final)时归并到 finalText */
  let onlineBuf: string = '';
  /**
   * 最近一次录音产出的 blob, stop 后 MediaRecorder.onstop 写入
   */
  const lastBlob: { value: Blob | null } = { value: null };
  /**
   * 最近一次录音的元数据
   */
  const lastAudio: { value: { durationSec: number; mimeType: string; ext: string } | null } = { value: null };
  /**
   * 最近一次录音 blob 的 base64 字符串
   */
  const lastBlobBase64: { value: string | null } = { value: null };

  const addLog = (type: string, text: string) => {
    let val = `[${new Date().toLocaleTimeString()}][${type}] ${text}`
    // console.log(val);
    logs.value.push(val);
  }
    

  function connect(): void {
    ws = new WebSocket(config.wsUrl || DEFAULT_WS_URL);

    ws.onopen = () => {
      connected.value = true;
      addLog('system', 'FunASR WebSocket 已连接');
      // 1. 连接成功后, 立即按 FunASR 协议发送初始化 JSON
      const initPayload = {
        mode: config.mode ?? '2pass',
        wav_name: config.wavName ?? 'browser',
        wav_format: 'pcm',
        is_speaking: true,
        audio_fs: config.audioFs ?? 16000,
        chunk_size: config.chunkSize ?? [5, 10, 5],
        itn: config.itn ?? true,
      };
      try {
        ws?.send(JSON.stringify(initPayload));
        addLog('system', `已发送 init: mode=${initPayload.mode}, fs=${initPayload.audio_fs}`);
      } catch (e: any) {
        addLog('error', '发送 init 失败: ' + (e?.message ?? String(e)));
      }
    };

    ws.onclose = () => {
      connected.value = false;
      recording.value = false;
      addLog('system', 'FunASR WebSocket 已断开');
    };

    ws.onerror = () => addLog('error', 'FunASR WebSocket 错误');

    ws.onmessage = (evt: MessageEvent<string>) => {
      let data: FunASRServerMsg;
      try {
        data = JSON.parse(evt.data) as FunASRServerMsg;
      } catch {
        addLog('error', '收到非 JSON 消息');
        return;
      }
      const text = data.text || '';
      // 2pass-offline 是修正后的整句, 视作 final; 2pass-online 是中间结果, 视作 partial;
      // is_final=true 表示这是最后一条(连接即将关闭), 也归 final
      const isOffline = data.mode === '2pass-offline';
      const isOnline = data.mode === '2pass-online';

      if (isOnline) {
        // online 文本本身已是"本句累计", 直接作为本句缓冲
        onlineBuf += text;
        result.value = finalText + onlineBuf;
        addLog('中间句', text);
      } else if (isOffline || data.is_final) {
        // offline 是修正后的整句, 清空 onlineBuf 后再并入 finalText, 防止重复
        onlineBuf = '';
        finalText += text;
        finalTextRef.value = finalText;
        result.value = finalText;
        addLog(isOffline ? '最终句' : '收尾', text);
      } else {
        addLog(data.mode ?? 'unknown', text);
      }
    };
  }

  function disconnect(): void {
    stop();
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ is_speaking: false })); } catch { /* noop */ }
    }
    ws?.close();
    ws = null;
  }

  // Float32 -> 目标采样率(16k) Int16 简单降采样
  function downsampleTo16k(buffer: Float32Array, inRate: number): Int16Array {
    const outRate = 16000;

    if (inRate === outRate) {
      const out = new Int16Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        const s = Math.max(-1, Math.min(1, buffer[i]));
        out[i] = s < 0 ? (s * 0x8000) | 0 : (s * 0x7fff) | 0;
      }
      return out;
    }

    const ratio = inRate / outRate;
    const newLen = Math.round(buffer.length / ratio);
    const out = new Int16Array(newLen);
    let offsetResult = 0,
      offsetBuffer = 0;

    while (offsetResult < newLen) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;

      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }

      const sample = count ? accum / count : 0;
      const s = Math.max(-1, Math.min(1, sample));
      out[offsetResult] = s < 0 ? (s * 0x8000) | 0 : (s * 0x7fff) | 0;

      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return out;
  }

  async function startASR(): Promise<void> {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addLog('error', '请先点击连接');
      return;
    }

    finalText = '';
    onlineBuf = '';
    finalTextRef.value = '';
    result.value = '';
    volume.value = 0;

    // 1. 只开一次麦克风
    stream = await navigator.mediaDevices.getUserMedia({ audio: {
      echoCancellation: true, // 核心：开启回声消除 (Acoustic Echo Cancellation)
      noiseSuppression: true, // 开启降噪
      autoGainControl: true, // 开启自动增益（防止声音忽大忽小）
    }});
    // 通知外部(异步, 不阻塞): 方便外部 clone 一份做 VAD 等旁路处理
    if (config.onStreamReady) {
      Promise.resolve().then(() => {
        try { config.onStreamReady?.(stream!) } catch { /* ignore */ }
      })
    }

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    source = audioCtx.createMediaStreamSource(stream);

    // 2. AnalyserNode 用于实时音量电平(同 stream)
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    // 显式断言成旧式不带泛型的 Uint8Array, 匹配本项目 tsconfig lib 中
    // AnalyserNode.getByteFrequencyData 的参数签名(避免 TS 推断成 Uint8Array<ArrayBufferLike>)
    volumeBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    volumeTimer = window.setInterval(() => {
      if (!analyser || !volumeBuf) return;
      analyser.getByteFrequencyData(volumeBuf);
      let sum = 0;
      for (let i = 0; i < volumeBuf.length; i++) sum += volumeBuf[i];
      const avg = sum / volumeBuf.length;
      volume.value = Math.min(100, Math.round(avg * 1.5));
    }, 100);

    // 3. ScriptProcessor 把 PCM 推到 ASR ws(注意: processor 自身要从 audioCtx.destination 拉时间轴)
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!audioCtx) return;
      // FunASR 接收 16k / 16bit / mono PCM 二进制帧
      const pcm = downsampleTo16k(e.inputBuffer.getChannelData(0), audioCtx.sampleRate);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(pcm.buffer);
    };

    // 4. 同 stream 上挂 MediaRecorder, 用于产出送后端的音频 blob
    recorderChunks = [];
    recordStartMs = Date.now();
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recorderChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      try {
        const blob = new Blob(recorderChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
        lastBlob.value = blob;
        const durationMs = recordStartMs ? Date.now() - recordStartMs : 0;
        const mime = mediaRecorder?.mimeType || blob.type || 'audio/webm';
        const ext = mimeToExt(mime);
        lastAudio.value = { durationSec: Math.max(1, Math.round(durationMs / 1000)), mimeType: mime, ext };
        blobToBase64(blob)
          .then((b64) => {
            if (lastBlob.value === blob) lastBlobBase64.value = b64;
          })
          .catch(() => { /* ignore */ })
      } catch {
        lastBlob.value = null;
        lastAudio.value = null;
        lastBlobBase64.value = null;
      }
      recordStartMs = null;
      recorderChunks = [];
    };
    mediaRecorder.start();

    recording.value = true;
    addLog('system', '开始录音');
  }

  function stop(): void {
    if (volumeTimer != null) {
      window.clearInterval(volumeTimer);
      volumeTimer = null;
    }
    volume.value = 0;
    if (processor) {
      processor.disconnect();
      processor.onaudioprocess = null;
      processor = null;
    }
    if (analyser) {
      try { analyser.disconnect(); } catch { /* noop */ }
      analyser = null;
    }
    if (source) {
      source.disconnect();
      source = null;
    }
    // 先停 MediaRecorder(异步触发 onstop 写 lastBlob), 再关 stream / ctx
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch { /* noop */ }
    }
    mediaRecorder = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => { /* noop */ });
      audioCtx = null;
    }
    // FunASR 协议: 停止时先发 { is_speaking: false } 表示句尾, 再 close
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ is_speaking: false })); } catch { /* noop */ }
    }

    recording.value = false;
    addLog('system', '停止录音');
  }

  /**
   * 重置"上一次录音的所有产出" — 字幕 + 录音元数据/二进制, 防止 UI 残留。
   */
  function reset(): void {
    finalText = '';
    onlineBuf = '';
    finalTextRef.value = '';
    result.value = '';
    lastBlob.value = null;
    lastAudio.value = null;
    lastBlobBase64.value = null;
  }

  return { connect, disconnect, startASR, stop, reset, result, finalText: finalTextRef, logs, connected, recording, volume, lastBlob, lastAudio, lastBlobBase64 };
}

/**
 * mime → 后端要的扩展名(纯小写, 不含点).
 * 后端用此值传给 FileUploadUtils.uploadFromBase64(..., ext).
 */
function mimeToExt(mime: string): string {
  const m = (mime || '').toLowerCase();
  if (m.includes('webm')) return 'webm';
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('mp4')) return 'mp4';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav')) return 'wav';
  if (m.includes('aac')) return 'aac';
  return 'webm';
}

/**
 * Blob → base64(不带 data:xxx;base64, 前缀).
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const r = fr.result as string | null;
      if (!r) { reject(new Error('empty result')); return; }
      const idx = r.indexOf(',');
      resolve(idx > 0 ? r.slice(idx + 1) : r);
    };
    fr.onerror = () => reject(fr.error || new Error('FileReader error'));
    fr.readAsDataURL(blob);
  });
}