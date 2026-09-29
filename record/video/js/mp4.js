const FPS = 30;
const SAMPLE_RATE = 48_000;
const CHANNELS = 2;
const AUDIO_FRAME = 1024;
const AAC_CODEC = 'mp4a.40.2';
/** 没有 duration 元数据时，画面停滞超过这个时间就认为播放结束 */
const STALL_TIMEOUT = 1000;
const IDLE = () => new Promise((r) => setTimeout(r, 0));

/**
 * 录制结果转 MP4（H.264，能编 AAC 时附加音轨）。
 * WebM 和 MP4 容器结构不同，没法只改后缀，必须逐帧解码再编码。
 * 返回 { blob, audioDropped }，audioDropped 表示源有声音但本浏览器编不出 AAC。
 */
export async function convertToMp4(source, { width, height, bitrate }, onProgress = () => {}) {
  if (!window.VideoEncoder || !window.AudioEncoder) {
    throw new Error('当前浏览器不支持 WebCodecs，无法转码为 MP4');
  }
  if (!window.Mp4Muxer) {
    throw new Error('mp4-muxer 未加载，请检查 js/vendor/mp4-muxer.js');
  }

  const decoded = await decodeAudio(source);
  const audio = decoded && (await canEncodeAac()) ? await encodeAudio(decoded) : null;
  const video = await encodeVideo(source, width, height, bitrate, onProgress);

  const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height },
    ...(audio ? { audio: { codec: 'aac', numberOfChannels: CHANNELS, sampleRate: SAMPLE_RATE } } : {}),
    fastStart: 'in-memory',
  });

  audio?.forEach(({ chunk, meta }) => muxer.addAudioChunk(chunk, meta));
  video.forEach(({ chunk, meta }) => muxer.addVideoChunk(chunk, meta));
  muxer.finalize();
  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), audioDropped: Boolean(decoded) && !audio };
}

/**
 * AAC 编码依赖系统平台编码器：macOS 用 AudioToolbox、Windows 用 MediaFoundation，
 * Linux 没有实现。而 isConfigSupported 在 Linux 上会误报 true，所以实际编一小段
 * 音频来确认编码器真的可用。
 */
async function canEncodeAac() {
  const encoder = new AudioEncoder({ output: () => {}, error: () => {} });
  try {
    const support = await AudioEncoder.isConfigSupported({
      codec: AAC_CODEC,
      sampleRate: SAMPLE_RATE,
      numberOfChannels: CHANNELS,
      bitrate: 128_000,
    });
    if (!support?.supported) return false;

    let produced = false;
    let failed = false;
    const probe = new AudioEncoder({
      output: () => {
        produced = true;
      },
      error: () => {
        failed = true;
      },
    });
    probe.configure({ codec: AAC_CODEC, sampleRate: SAMPLE_RATE, numberOfChannels: CHANNELS, bitrate: 128_000 });
    const data = new AudioData({
      format: 'f32-planar',
      sampleRate: SAMPLE_RATE,
      numberOfFrames: AUDIO_FRAME,
      numberOfChannels: CHANNELS,
      timestamp: 0,
      data: new Float32Array(AUDIO_FRAME * CHANNELS),
    });
    probe.encode(data);
    data.close();
    await probe.flush().catch(() => {
      failed = true;
    });
    probe.close();
    return produced && !failed;
  } catch {
    return false;
  } finally {
    try {
      encoder.close();
    } catch {
      /* 未 configure 的编码器无需关闭 */
    }
  }
}

/**
 * 取出录制结果的音频；静音录制的 WebM 没有音频轨道，
 * decodeAudioData 会抛错，用 null 表示“没有音轨可转”。
 */
async function decodeAudio(source) {
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(await source.arrayBuffer());
  } catch {
    return null;
  } finally {
    ctx.close();
  }
}

/** 把解码后的音频重采样到 48kHz 双声道，按 1024 帧喂给 AAC 编码器 */
async function encodeAudio(decoded) {
  const offline = new OfflineAudioContext(CHANNELS, Math.ceil(decoded.duration * SAMPLE_RATE), SAMPLE_RATE);
  const node = offline.createBufferSource();
  node.buffer = decoded;
  node.connect(offline.destination);
  node.start();
  const buffer = await offline.startRendering();

  const chunks = [];
  const encoder = new AudioEncoder({
    output: (chunk, meta) => chunks.push({ chunk, meta }),
    error: (e) => console.error('音频编码失败', e),
  });
  encoder.configure({ codec: AAC_CODEC, sampleRate: SAMPLE_RATE, numberOfChannels: CHANNELS, bitrate: 128_000 });

  const planes = [];
  for (let c = 0; c < CHANNELS; c += 1) planes.push(buffer.getChannelData(c));

  for (let offset = 0; offset < buffer.length; offset += AUDIO_FRAME) {
    const frames = Math.min(AUDIO_FRAME, buffer.length - offset);
    const data = new Float32Array(frames * CHANNELS);
    for (let c = 0; c < CHANNELS; c += 1) data.set(planes[c].subarray(offset, offset + frames), c * frames);
    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate: SAMPLE_RATE,
      numberOfFrames: frames,
      numberOfChannels: CHANNELS,
      timestamp: Math.round((offset / SAMPLE_RATE) * 1e6),
      data,
    });
    encoder.encode(audioData);
    audioData.close();
    if (encoder.encodeQueueSize > 16) await IDLE();
  }

  await encoder.flush();
  encoder.close();
  return chunks;
}

/** 逐帧重绘到 canvas 再编码，帧时间戳按标称帧率推进，画面不会丢时长 */
async function encodeVideo(source, width, height, bitrate, onProgress) {
  const url = URL.createObjectURL(source);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error('无法解码录制文件'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });

    const chunks = [];
    const encoder = new VideoEncoder({
      output: (chunk, meta) => chunks.push({ chunk, meta }),
      error: (e) => console.error('视频编码失败', e),
    });
    encoder.configure({
      codec: 'avc1.640028',
      width,
      height,
      bitrate: Math.max(1_000_000, Math.round(bitrate || 4_000_000)),
      framerate: FPS,
    });

    const frameDuration = 1e6 / FPS;
    // MediaRecorder 产出的 WebM 常缺 duration 元数据，total 为 0 时只能靠画面停滞判结束
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    let lastTime = -1;
    let lastReport = 0;
    let stalledSince = 0;
    let nextIndex = 0;

    await video.play();
    while (!video.ended) {
      await new Promise((r) => requestAnimationFrame(r));
      if (video.currentTime === lastTime) {
        if (total === 0) {
          stalledSince ||= performance.now();
          if (performance.now() - stalledSince > STALL_TIMEOUT) break;
        }
        continue;
      }
      stalledSince = 0;
      lastTime = video.currentTime;

      // 时间戳直接由源视频时间轴推出，rAF 间隔抖动就不会让总帧数漂移
      const index = Math.floor(video.currentTime * FPS);
      for (; nextIndex <= index; nextIndex += 1) {
        ctx.drawImage(video, 0, 0, width, height);
        const timestamp = Math.round(nextIndex * frameDuration);
        const frame = new VideoFrame(canvas, { timestamp, duration: frameDuration });
        encoder.encode(frame, { keyFrame: timestamp % 2e6 < frameDuration });
        frame.close();
      }
      const progress = total ? Math.min(1, video.currentTime / total) : 0;
      if (progress - lastReport > 0.02) {
        lastReport = progress;
        onProgress(progress);
      }
      if (encoder.encodeQueueSize > 16) await IDLE();
    }

    await encoder.flush();
    encoder.close();
    return chunks;
  } finally {
    URL.revokeObjectURL(url);
  }
}
