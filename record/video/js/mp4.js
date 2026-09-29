const FPS = 30;
const SAMPLE_RATE = 48_000;
const CHANNELS = 2;
/**
 * 每次喂给编码器的采样数。Opus 原生按 20ms 一帧工作（48kHz 下 960 样本），
 * AAC 用 1024；统一取 960 就够两种编码器自己切帧，也不会让时间戳出现零头。
 */
const AUDIO_FRAME = 960;
const AAC_CODEC = 'mp4a.40.2';
/**
 * AAC 依赖系统平台编码器（macOS 用 AudioToolbox、Windows 用 MediaFoundation，Linux 没有），
 * 编不出来时退到 Opus。Opus 在浏览器里是内置的软件编码器，各平台都有，
 * 且 MP4 里允许封装 Opus（ISO/IEC 14496-12 + Opus in ISOBMFF），所以不会因此丢掉声音。
 */
const OPUS_CODEC = 'opus';
const AAC_BITRATE = 128_000;
const OPUS_BITRATE = 128_000;
/** 没有 duration 元数据时，画面停滞超过这个时间就认为播放结束 */
const STALL_TIMEOUT = 1000;
const IDLE = () => new Promise((r) => setTimeout(r, 0));

/**
 * 录制结果转 MP4（视频优先 H.264，超纲时退 VP9；音频优先 AAC，编不出就退 Opus）。
 * WebM 和 MP4 容器结构不同，没法只改后缀，必须逐帧解码再编码。
 *
 * 音频为什么不像视频那样只做转封装：源 WebM 里的 Opus 块常是 2×10ms 的双帧包，
 * mp4-muxer 会把这些包原样写进 MP4，但不会补 Opus 必需的 sgpd/sbgp 预滚（pre-roll）分组。
 * 缺了它，解码器会把 pre-skip 的 312 个样本当成真实音频，整条轨道从一开始就错位，
 * 实测 ffmpeg 只解出 2 秒、浏览器直接卡死。所以音频走重新编码，编出来的包结构干净。
 *
 * 返回 { blob, audioCodec, audioDropped, videoCodec }：audioDropped 表示源有声音但
 * 本浏览器既编不出 AAC 也编不出 Opus；audioCodec 是音轨实际用的编码（'AAC' / 'Opus' / null）。
 */
export async function convertToMp4(source, { width, height, bitrate }, onProgress = () => {}) {
  if (!window.VideoEncoder || !window.AudioEncoder) {
    throw new Error('当前浏览器不支持 WebCodecs，无法转码为 MP4');
  }
  if (!window.Mp4Muxer) {
    throw new Error('mp4-muxer 未加载，请检查 js/vendor/mp4-muxer.js');
  }

  const decoded = await decodeAudio(source);
  const audio = decoded ? await encodeAudioTrack(decoded) : null;
  const video = await encodeVideo(source, width, height, bitrate, onProgress);

  const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: video.muxerCodec, width, height },
    ...(audio ? { audio: { codec: audio.muxerCodec, numberOfChannels: CHANNELS, sampleRate: SAMPLE_RATE } } : {}),
    fastStart: 'in-memory',
  });

  audio?.chunks.forEach(({ chunk, meta }) => muxer.addAudioChunk(chunk, meta));
  video.chunks.forEach(({ chunk, meta }) => muxer.addVideoChunk(chunk, meta));
  muxer.finalize();
  return {
    blob: new Blob([target.buffer], { type: 'video/mp4' }),
    audioCodec: audio?.label ?? null,
    audioDropped: Boolean(decoded) && !audio,
    videoCodec: video.label,
  };
}

/**
 * 音轨编码：AAC 优先（兼容性最好），系统平台没有 AAC 编码器时退 Opus。
 * Opus 是浏览器内置的软件编码器，Linux 上也有，所以这条路几乎总能出声。
 */
async function encodeAudioTrack(decoded) {
  if (await canEncodeAac()) {
    const chunks = await encodeAudio(decoded, { codec: AAC_CODEC, bitrate: AAC_BITRATE });
    if (chunks?.length) return { chunks, muxerCodec: 'aac', label: 'AAC' };
  }
  const chunks = await encodeAudio(decoded, { codec: OPUS_CODEC, bitrate: OPUS_BITRATE });
  return chunks?.length ? { chunks, muxerCodec: 'opus', label: 'Opus' } : null;
}

/**
 * 音频编码器「真的编得动吗」要实测，不能只信 isConfigSupported：
 * Linux 上没有 AAC 实现，但它照样报 supported = true，
 * 只有真喂一包数据、看有没有出 chunk，才知道能不能用。
 */
async function canEncodeAudio(config) {
  if (AudioEncoder.isConfigSupported) {
    try {
      const support = await AudioEncoder.isConfigSupported(config);
      if (support && support.supported === false) return false;
    } catch {
      return false;
    }
  }

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
  try {
    probe.configure(config);
    const data = new AudioData({
      format: 'f32-planar',
      sampleRate: config.sampleRate,
      numberOfFrames: AUDIO_FRAME,
      numberOfChannels: config.numberOfChannels,
      timestamp: 0,
      data: new Float32Array(AUDIO_FRAME * config.numberOfChannels),
    });
    probe.encode(data);
    data.close();
    await probe.flush().catch(() => {
      failed = true;
    });
    return produced && !failed;
  } catch {
    return false;
  } finally {
    try {
      probe.close();
    } catch {
      /* 未 configure 的编码器无需关闭 */
    }
  }
}

/** AAC 依赖系统平台编码器：macOS 用 AudioToolbox、Windows 用 MediaFoundation，Linux 没有实现 */
function canEncodeAac() {
  return canEncodeAudio({
    codec: AAC_CODEC,
    sampleRate: SAMPLE_RATE,
    numberOfChannels: CHANNELS,
    bitrate: AAC_BITRATE,
  });
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

/**
 * 把解码后的音频重采样到 48kHz 双声道，按 AUDIO_FRAME 一包喂给编码器。
 * codec 决定容器里最终装的是 AAC 还是 Opus；编码器不认这组参数时返回 null，
 * 交给调用方换一种编码再试，而不是让整个导出失败。
 */
async function encodeAudio(decoded, { codec, bitrate }) {
  const offline = new OfflineAudioContext(CHANNELS, Math.ceil(decoded.duration * SAMPLE_RATE), SAMPLE_RATE);
  const node = offline.createBufferSource();
  node.buffer = decoded;
  node.connect(offline.destination);
  node.start();
  const buffer = await offline.startRendering();

  const config = { codec, sampleRate: SAMPLE_RATE, numberOfChannels: CHANNELS, bitrate };
  if (!(await canEncodeAudio(config))) return null;

  const chunks = [];
  let failed = false;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => chunks.push({ chunk, meta }),
    error: (e) => {
      failed = true;
      console.error('音频编码失败', e);
    },
  });
  encoder.configure(config);

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

/**
 * AVC level 表。两个约束都要看：MaxFS（每帧 macroblock 数上限，单位 16×16 块）
 * 和 MaxMBPS（每秒 macroblock 数上限，4.0 与 4.1 的 MaxFS 相同、靠 MaxMBPS 区分），
 * 只按面积挑会选出编码器其实不认的档。MaxFS 与 level 的对应写死在规范里，
 * 不靠浏览器的 isConfigSupported 猜。
 * 数组按 level 升序，codec 字符串是 avc1.<profile><level 十六进制>（High profile = 64）。
 */
const AVC_LEVELS = [
  { level: '1f', maxFs: 3_600, maxMbps: 108_000 }, // 3.1  720p
  { level: '20', maxFs: 8_192, maxMbps: 245_760 }, // 3.2
  { level: '28', maxFs: 8_192, maxMbps: 245_760 }, // 4.0  1080p
  { level: '29', maxFs: 8_192, maxMbps: 245_760 }, // 4.1
  { level: '2a', maxFs: 8_704, maxMbps: 522_240 }, // 4.2
  { level: '32', maxFs: 22_080, maxMbps: 589_824 }, // 5.0  1440p
  { level: '33', maxFs: 36_864, maxMbps: 983_040 }, // 5.1
  { level: '34', maxFs: 36_864, maxMbps: 2_073_600 }, // 5.2  4K
  { level: '3c', maxFs: 139_264, maxMbps: 4_177_920 }, // 6.0
  { level: '3d', maxFs: 139_264, maxMbps: 8_355_840 }, // 6.1
  { level: '3e', maxFs: 139_264, maxMbps: 16_711_680 }, // 6.2
];

/** macroblock 边长固定 16 像素；宽度和高度都要向上取整成整数个 mb */
const macroblocks = (width, height) => Math.ceil(width / 16) * Math.ceil(height / 16);

/**
 * 选编码器：H.264 优先（兼容性最好），硬件编不出就退 VP9 —— VP9 在 MP4 里
 * 合规，只是部分老软件不认，总比导不出来强。
 */
async function pickVideoCodec(width, height, bitrate) {
  const avc = await tryAvc(width, height, bitrate);
  if (avc) return avc;
  if (await canEncode('vp09.00.10.08', width, height, bitrate)) {
    return { codec: 'vp09.00.10.08', muxerCodec: 'vp9', label: 'VP9' };
  }
  throw new Error(
    `${width}×${height} 这个尺寸当前浏览器既编不出 H.264 也编不出 VP9，无法导出 MP4。`
    + '请降低录制分辨率，或改导出 WebM（录制时就是 WebM，不需要重新编码）',
  );
}

/** 探一下编码器认不认这组参数 */
async function canEncode(codec, width, height, bitrate) {
  try {
    if (!VideoEncoder.isConfigSupported) return true;
    const support = await VideoEncoder.isConfigSupported({ codec, width, height, bitrate, framerate: FPS });
    return Boolean(support?.supported);
  } catch {
    return false;
  }
}

/**
 * 试 H.264。硬件编码器普遍停在 level 5.1/5.2，2K、4K 屏幕录下来常常超纲，
 * 挑不出档就返回 null 交给 VP9 兜底，而不是把「导出失败」甩给用户。
 */
async function tryAvc(width, height, bitrate) {
  const mb = macroblocks(width, height);
  const mbps = mb * FPS;
  // 面积最紧的排在前面，避免一上来就用 6.2 这种又大又慢的档
  const fit = AVC_LEVELS.filter((item) => item.maxFs >= mb && item.maxMbps >= mbps);
  const candidates = fit.length ? fit : [AVC_LEVELS[AVC_LEVELS.length - 1]];

  for (const { level } of candidates) {
    const codec = `avc1.64${level}`;
    if (await canEncode(codec, width, height, bitrate)) {
      return { codec, muxerCodec: 'avc', label: 'H.264' };
    }
  }
  return null;
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
    const targetBitrate = Math.max(1_000_000, Math.round(bitrate || 4_000_000));
    const { codec, muxerCodec, label } = await pickVideoCodec(width, height, targetBitrate);
    encoder.configure({ codec, width, height, bitrate: targetBitrate, framerate: FPS });

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
    return { chunks, muxerCodec, label };
  } finally {
    URL.revokeObjectURL(url);
  }
}
