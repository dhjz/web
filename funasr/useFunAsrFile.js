// ========================================================================
// FunASR 音频文件识别 Hook —— 完全独立于 useFunAsr, 不需要改动实时识别逻辑
//
// 用法:
//   <script src="./useFunAsr.js"></script>
//   <script src="./useFunAsrFile.js"></script>
//   const asr = useFunASR(config)                       // 实时识别, 原样不动
//   const fileAsr = useFunAsrFile(config, {             // sinks 可复用实时识别的状态, UI 零改动
//     logs: asr.logs, result: asr.result, finalText: asr.finalText,
//   })
//   fileAsr.recognizeFile(file).then((ok) => console.log('识别完成:', ok))
//
// 原理:
//   1) 浏览器 AudioContext.decodeAudioData 解码(wav/mp3/m4a/aac/ogg/webm/flac 等浏览器可解格式)
//   2) 混为单声道 + 重采样到 config.audioFs(默认 16k) + 转 16bit PCM
//   3) 用一条"独立的临时 WebSocket"按 chunk_size 粒度发送 PCM, 末尾发 { is_speaking: false }
//   4) 服务端静默 FILE_IDLE_MS 后关闭临时连接
//
//   临时连接与 useFunASR 的实时连接完全独立, 互不影响; 识别结果/日志可选择写入传入的 sinks,
//   也可以不传 sinks, 用自己返回的 result / finalText / logs。
// ========================================================================
(function (global) {
  const ref = global.Vue.ref;

  /** 每个 PCM 分片发送后让出事件循环的等待时间(ms), 0 = 尽快发送 */
  const FILE_SEND_INTERVAL_MS = 0;
  /** 音频发完后, 服务端静默多久视为识别结束(ms) */
  const FILE_IDLE_MS = 3000;
  /** 兜底超时: 基础值(ms) + 音频时长 × 系数 */
  const FILE_FINISH_BASE_MS = 60000;
  /** 与 useFunAsr.js 保持一致的默认地址 */
  const DEFAULT_WS_URL_FALLBACK = 'ws://127.0.0.1:10095';

  /**
   * @param {object} config 与 useFunASR 同形的配置(只读取 wsUrl / mode / itn / chunkSize / audioFs)
   * @param {object} [sinks] 输出目标, 不传则内部自建; 传入即可与实时识别共用同一套 UI 状态
   *   - logs:      Vue Ref<string[]>  日志(格式与 useFunASR 一致, 可直接进日志面板)
   *   - result:    Vue Ref<string>    识别结果(中间句 + 最终句)
   *   - finalText: Vue Ref<string>    已确认的最终文本
   * @returns {{
   *   recognizeFile: (file: Blob, onProgress?: (percent: number) => void) => Promise<boolean>,
   *   cancel: () => void,
   *   recognizing: any, fileProgress: any,
   *   result: any, finalText: any, logs: any,
   * }}
   */
  function useFunAsrFile(config = {}, sinks = {}) {
    const logs = sinks.logs || ref([]);
    const result = sinks.result || ref('');
    const finalTextRef = sinks.finalText || ref('');
    /** 是否有文件正在识别 */
    const recognizing = ref(false);
    /** 音频发送进度 0-100 */
    const fileProgress = ref(0);

    let finalText = '';
    /** 当前这一句的"线上累积", 句尾(final)时归并到 finalText */
    let onlineBuf = '';
    /** 取消当前识别(无任务时为 null) */
    let abortCurrent = null;

    const addLog = (type, text) => {
      logs.value.push(`[${new Date().toLocaleTimeString()}][${type}] ${text}`);
    };

    /** 清洗 FunASR 附带的标记 token (<|zh|> <|SAD|> <|Speech|> 等) */
    function cleanFunASRText(raw) {
      return (raw || '')
        .replace(/<\|[^|]*\|>/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
    }

    /**
     * 规范化热词 JSON 字符串(如 {"阿里巴巴":20,"hello world":40})。
     * 返回压缩后的字符串; 空返回 ''; 非法返回 null。
     */
    function parseHotwords(raw) {
      const s = (raw ?? '').trim();
      if (!s) return '';
      try {
        const obj = JSON.parse(s);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
        return JSON.stringify(obj);
      } catch {
        return null;
      }
    }

    /** 服务端消息 → result / finalText / logs */
    function handleMessage(raw) {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        addLog('error', '文件识别: 收到非 JSON 消息');
        return;
      }
      const text = cleanFunASRText(data.text || '');
      const isOffline = data.mode === '2pass-offline';
      const isOnline = data.mode === '2pass-online';

      if (isOnline) {
        // online 文本本身已是"本句累计"
        onlineBuf += text;
        result.value = finalText + onlineBuf;
        addLog('中间句', text);
      } else if (isOffline || data.is_final) {
        // offline 是修正后的整句, 清空 onlineBuf 后并入 finalText, 防止重复
        onlineBuf = '';
        finalText += text;
        finalTextRef.value = finalText;
        result.value = finalText;
        addLog(isOffline ? '最终句' : '收尾', text);
      } else if (data.mode === 'offline') {
        // offline 模式: 每个 VAD 段落返回一条整句结果
        onlineBuf = '';
        finalText += text;
        finalTextRef.value = finalText;
        result.value = finalText;
        addLog('最终句', text);
      } else {
        addLog(data.mode ?? 'unknown', text);
      }
    }

    /**
     * 本地音频文件 → 文字
     * @param {Blob|File} file 音频文件
     * @param {(percent:number)=>void} [onProgress] 发送进度回调 0-100
     * @returns {Promise<boolean>} 是否识别完成(取消/出错返回 false)
     */
    async function recognizeFile(file, onProgress) {
      if (!file) return false;
      if (recognizing.value) {
        addLog('error', '文件识别: 已有文件正在识别, 请稍候');
        return false;
      }

      recognizing.value = true;
      fileProgress.value = 0;
      const name = file.name || 'audio';
      addLog('system', `文件识别: ${name} (${(file.size / 1024).toFixed(1)} KB), 解码中...`);

      try {
        const audioBuffer = await decodeAudioFile(file);
        const fs = config.audioFs ?? 16000;
        const pcm = resampleToInt16(toMono(audioBuffer), audioBuffer.sampleRate, fs);
        const durationSec = pcm.length / fs;
        addLog('system', `文件识别: 解码完成 ${durationSec.toFixed(2)}s · ${audioBuffer.sampleRate}Hz → ${fs}Hz · ${audioBuffer.numberOfChannels} 声道`);

        // 清空上一轮字幕, 避免新旧文本混在一起
        finalText = '';
        onlineBuf = '';
        finalTextRef.value = '';
        result.value = '';

        return await sendPcmFile(pcm, name, fs, durationSec, onProgress);
      } catch (e) {
        addLog('error', '文件识别失败: ' + (e?.message ?? String(e)));
        return false;
      } finally {
        recognizing.value = false;
        abortCurrent = null;
      }
    }

    /** 取消当前文件识别(无任务时 noop) */
    function cancel() {
      if (abortCurrent) abortCurrent();
    }

    /**
     * 把 PCM 通过一条独立的临时 WebSocket 发给 FunASR, 结束后自动关闭。
     * 以"服务端静默"判断结束, 兼容 online / 2pass / offline 三种模式。
     */
    function sendPcmFile(pcm, name, fs, durationSec, onProgress) {
      const url = config.wsUrl || DEFAULT_WS_URL_FALLBACK;

      return new Promise((resolve) => {
        let done = false;
        /** 音频是否已全部发完(发完后的"静默"才算识别结束) */
        let sent = false;
        let idleTimer = null;
        let overallTimer = null;

        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';

        const finish = (ok, msg) => {
          if (done) return;
          done = true;
          abortCurrent = null;
          if (idleTimer != null) { global.clearTimeout(idleTimer); idleTimer = null; }
          if (overallTimer != null) { global.clearTimeout(overallTimer); overallTimer = null; }
          try { socket.close(); } catch { /* noop */ }
          if (msg) addLog(ok ? 'system' : 'error', msg);
          resolve(ok);
        };

        /** 收到结果后重置静默计时: FILE_IDLE_MS 内没有新消息就认为识别结束 */
        const armIdle = () => {
          if (idleTimer != null) global.clearTimeout(idleTimer);
          idleTimer = global.setTimeout(() => finish(true, '文件识别: 完成'), FILE_IDLE_MS);
        };

        abortCurrent = () => finish(false, '文件识别: 已取消');

        socket.onopen = async () => {
          addLog('system', `文件识别: 已连接 ${url}`);
          const initPayload = {
            mode: config.mode ?? '2pass',
            wav_name: name,
            wav_format: 'pcm',
            is_speaking: true,
            audio_fs: fs,
            chunk_size: config.chunkSize ?? [5, 10, 5],
            itn: config.itn ?? true,
          };
          // 热词: 与实时识别共用 config.hotwords, 非空时随首条消息一起发出
          const hotwords = parseHotwords(config.hotwords);
          if (hotwords === null) {
            addLog('error', '文件识别: 热词格式错误, 需要 JSON 对象字符串, 如 {"阿里巴巴":20}');
          } else if (hotwords) {
            initPayload.hotwords = hotwords;
          }
          try {
            socket.send(JSON.stringify(initPayload));
            addLog('system', `文件识别: 已发送 init mode=${initPayload.mode}, fs=${fs}${hotwords ? ', hotwords=' + hotwords : ''}`);
          } catch (e) {
            finish(false, '文件识别: 发送 init 失败: ' + (e?.message ?? String(e)));
            return;
          }

          // 按服务端 chunk_size 推荐粒度分片(60ms/格), 与实时流的节奏保持一致
          const stride = Math.max(1600, (config.chunkSize?.[1] ?? 10) * Math.round(0.06 * fs));
          for (let off = 0; off < pcm.length; off += stride) {
            if (done || socket.readyState !== WebSocket.OPEN) {
              finish(false, '文件识别: 连接已关闭, 发送中断');
              return;
            }
            socket.send(pcm.slice(off, Math.min(off + stride, pcm.length)).buffer);
            fileProgress.value = Math.min(100, Math.round(((off + stride) / pcm.length) * 100));
            try { onProgress?.(fileProgress.value) } catch { /* ignore */ }
            await delay(FILE_SEND_INTERVAL_MS);
          }

          fileProgress.value = 100;
          try { socket.send(JSON.stringify({ is_speaking: false })); } catch { /* noop */ }
          sent = true;
          addLog('system', `文件识别: 音频发送完毕(${durationSec.toFixed(2)}s), 等待识别结果...`);
          armIdle();
          // 兜底: 服务端长时间无响应时强制结束, 避免按钮一直处于"识别中"
          overallTimer = global.setTimeout(
            () => finish(true, '文件识别: 等待结果超时, 已结束'),
            FILE_FINISH_BASE_MS + durationSec * 2000,
          );
        };

        socket.onmessage = (evt) => {
          handleMessage(evt.data);
          if (sent) armIdle();
        };

        socket.onerror = () => finish(false, '文件识别: WebSocket 错误');
        socket.onclose = () => (sent ? finish(true, '文件识别: 完成') : finish(false, '文件识别: WebSocket 已断开'));
      });
    }

    return { recognizeFile, cancel, recognizing, fileProgress, result, finalText: finalTextRef, logs };
  }

  /** 简单延时 */
  function delay(ms) {
    return new Promise((resolve) => global.setTimeout(resolve, ms));
  }

  /** AudioBuffer → 单声道 Float32(多声道取平均) */
  function toMono(audioBuffer) {
    const channels = audioBuffer.numberOfChannels;
    const len = audioBuffer.length;
    if (channels <= 1) return audioBuffer.getChannelData(0);

    const out = new Float32Array(len);
    for (let c = 0; c < channels; c++) {
      const data = audioBuffer.getChannelData(c);
      for (let i = 0; i < len; i++) out[i] += data[i];
    }
    for (let i = 0; i < len; i++) out[i] /= channels;
    return out;
  }

  /**
   * Float32 -> 目标采样率 Int16(线性插值重采样)。
   * 与 useFunAsr.js 里的实现同算法, 但按目标采样率参数化。
   */
  function resampleToInt16(buffer, inRate, outRate) {
    if (!buffer || !buffer.length) return new Int16Array(0);
    const target = outRate || 16000;

    if (!inRate || inRate === target) {
      const out = new Int16Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        const s = Math.max(-1, Math.min(1, buffer[i]));
        out[i] = s < 0 ? (s * 0x8000) | 0 : (s * 0x7fff) | 0;
      }
      return out;
    }

    const ratio = inRate / target;
    const newLen = Math.round(buffer.length / ratio);
    const out = new Int16Array(newLen);
    let offsetResult = 0;
    let offsetBuffer = 0;

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

  /**
   * 音频文件 → AudioBuffer: 用浏览器 AudioContext 解码,
   * 支持 wav/mp3/m4a/aac/ogg/webm/flac 等浏览器可解格式。
   */
  function decodeAudioFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
      reader.onload = () => {
        const Ctx = global.AudioContext || global.webkitAudioContext;
        if (!Ctx) { reject(new Error('当前浏览器不支持 AudioContext')); return; }

        const ctx = new Ctx();
        let settled = false;
        const close = () => {
          try {
            const p = ctx.close();
            if (p && p.catch) p.catch(() => { /* noop */ });
          } catch { /* noop */ }
        };
        const ok = (buf) => {
          if (settled) return;
          settled = true;
          close();
          buf ? resolve(buf) : reject(new Error('音频解码失败, 可能是不支持的格式'));
        };
        const fail = (err) => {
          if (settled) return;
          settled = true;
          close();
          reject(err instanceof Error ? err : new Error('音频解码失败'));
        };

        try {
          // 老浏览器只支持回调式, 新版返回 Promise: 两条路都接上, 用 settled 去重
          const p = ctx.decodeAudioData(reader.result, ok, fail);
          if (p && typeof p.then === 'function') p.then(ok).catch(fail);
        } catch (e) {
          fail(e);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  global.useFunAsrFile = useFunAsrFile;
})(window);
