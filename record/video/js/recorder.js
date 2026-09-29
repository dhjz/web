import { pickMimeType } from './utils.js';

const AUDIO_BITS_PER_SECOND = 128_000;

/** 画质档位：0 表示不设上限，交给浏览器按分辨率和硬件自己决定 */
export const QUALITY_BITRATES = {
  smooth: 1_000_000,
  standard: 2_500_000,
  high: 0,
};

/** 把多条音轨混成一条，避免导出文件里出现多条音轨 */
export function mixAudioTracks(tracks, sampleRate = 48_000) {
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0].clone();

  const ctx = new AudioContext({ sampleRate });
  const dest = ctx.createMediaStreamDestination();
  tracks.forEach((track) => {
    ctx.createMediaStreamSource(new MediaStream([track])).connect(dest);
  });
  // 关闭 AudioContext 会一并停掉输出音轨，这里保留到录制结束由调用方释放
  dest.stream.getAudioTracks()[0].addEventListener('ended', () => ctx.close());
  return dest.stream.getAudioTracks()[0];
}

/**
 * 按显示轨 + 音轨组装录制流：视频经 canvas 重绘（保证尺寸是编码器友好的偶数），
 * 音轨用已经混好的那一条，再由 MediaRecorder 统一编码。
 */
function createRecordingStream({ displayTrack, audioTrack, onVideoResize }) {
  const display = new MediaStream([displayTrack]);
  const video = document.createElement('video');
  video.srcObject = display;
  video.muted = true;
  video.playsInline = true;
  video.play().catch(() => {});

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const settings = displayTrack.getSettings ? displayTrack.getSettings() : {};
  const initialWidth = settings.width || 1280;
  const initialHeight = settings.height || 720;
  canvas.width = initialWidth;
  canvas.height = initialHeight;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, initialWidth, initialHeight);

  const draw = () => {
    if (video.videoWidth && video.videoWidth !== canvas.width) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      onVideoResize(canvas.width, canvas.height);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  // 用 30fps 手动推帧：captureStream(0) 的帧由 requestFrame 触发，
  // 比依赖自动采样更稳，也不会因为画面静止而丢掉时间轴
  const stream = canvas.captureStream(0);
  const canvasTrack = stream.getVideoTracks()[0];
  const timer = setInterval(() => {
    draw();
    if (canvasTrack.requestFrame) canvasTrack.requestFrame();
  }, 1000 / 30);

  stream.addTrack(displayTrack);
  if (audioTrack) stream.addTrack(audioTrack);
  onVideoResize(canvas.width, canvas.height);

  return {
    stream,
    async ready() {
      await video.play().catch(() => {});
      for (let i = 0; i < 50 && !video.videoWidth; i += 1) {
        await new Promise((r) => setTimeout(r, 40));
      }
      if (video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        onVideoResize(canvas.width, canvas.height);
      }
      draw();
    },
    stop() {
      clearInterval(timer);
      video.pause();
      video.srcObject = null;
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

export class ScreenRecorder {
  constructor({ onResize }) {
    this.onResize = onResize;
    this.mediaRecorder = null;
    this.capture = null;
    this.audioTracks = [];
    this.chunks = [];
    this.mimeType = '';
    this.bytes = 0;
    this.width = 0;
    this.height = 0;
    this.startedAt = 0;
    this.pausedTotal = 0;
    this.pausedAt = 0;
    this.ended = null;
    /** 浏览器里点「停止共享」也会走到 stop()，用这个标记避免重复结束 */
    this.stopping = false;
  }

  get active() {
    const state = this.mediaRecorder?.state;
    return state === 'recording' || state === 'paused';
  }

  get elapsed() {
    if (!this.startedAt) return 0;
    return Math.max(0, (this.pausedAt || performance.now()) - this.startedAt - this.pausedTotal);
  }

  get size() {
    return this.bytes;
  }

  async start({ displayStream, audioTrack, audioLabels, videoBitsPerSecond, preferH264 = false, qualityLabel = '' }) {
    this.audioTracks = audioTrack ? [audioTrack] : [];
    this.audioLabels = audioLabels;
    this.chunks = [];
    this.bytes = 0;
    this.pausedTotal = 0;
    this.pausedAt = 0;
    this.ended = new Promise((resolve) => {
      this.resolveEnd = resolve;
    });

    const displayTrack = displayStream.getVideoTracks()[0];
    this.capture = createRecordingStream({
      displayTrack,
      audioTrack,
      onVideoResize: (w, h) => {
        this.width = w;
        this.height = h;
        this.onResize(w, h);
      },
    });
    await this.capture.ready();

    this.mimeType = pickMimeType(Boolean(audioTrack), { preferH264 });
    // 伪 WebM 里编出来的是 H.264，历史列表、MP4 转封装都按这个来判断
    this.videoCodec = /h264/i.test(this.mimeType) ? 'H.264' : /av01/i.test(this.mimeType) ? 'AV1' : 'VP9';
    this.qualityLabel = qualityLabel;
    this.mediaRecorder = new MediaRecorder(this.capture.stream, {
      mimeType: this.mimeType || undefined,
      // 不设上限时把 key 去掉，传 undefined 有的实现会当成 0 直接不录
      ...(videoBitsPerSecond ? { videoBitsPerSecond } : {}),
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
    });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size) {
        this.chunks.push(e.data);
        this.bytes += e.data.size;
      }
    };
    this.mediaRecorder.onstop = () => {
      const mimeType = this.mediaRecorder?.mimeType || this.mimeType || 'video/webm';
      this.resolveEnd({
        blob: new Blob(this.chunks, { type: mimeType.split(';')[0] }),
        mimeType,
      });
    };
    // 用户点浏览器的「停止共享」时同样结束录制
    displayTrack.addEventListener('ended', () => this.stop());

    this.startedAt = performance.now();
    this.mediaRecorder.start(1000);
    return this;
  }

  /** 返回 { blob, mimeType, duration, width, height, bitrate, audioLabels, videoCodec, qualityLabel } */
  async stop() {
    if (!this.active || this.stopping) return null;
    this.stopping = true;
    const duration = this.elapsed;
    this.mediaRecorder.stop();
    const result = await this.ended;
    this.teardown();
    return {
      ...result,
      duration,
      width: this.width,
      height: this.height,
      bitrate: duration > 0 ? (result.blob.size * 8) / (duration / 1000) : 0,
      audioLabels: this.audioLabels,
      videoCodec: this.videoCodec,
      qualityLabel: this.qualityLabel,
    };
  }

  pause() {
    if (this.mediaRecorder?.state !== 'recording') return;
    this.mediaRecorder.pause();
    this.pausedAt = performance.now();
  }

  resume() {
    if (this.mediaRecorder?.state !== 'paused') return;
    this.pausedTotal += performance.now() - this.pausedAt;
    this.pausedAt = 0;
    this.mediaRecorder.resume();
  }

  /** 停止所有采集资源；重复调用是安全的 */
  teardown() {
    this.capture?.stop();
    this.capture = null;
    this.audioTracks.forEach((t) => t.stop());
    this.audioTracks = [];
    this.startedAt = 0;
  }
}
