const pad2 = (n) => String(n).padStart(2, '0');

/** 毫秒 → mm:ss，超过一小时用 hh:mm:ss */
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

export function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(i === 0 || value >= 100 ? 0 : 1)} ${units[i]}`;
}

export function formatBitrate(bps) {
  if (!bps) return '—';
  return bps >= 1e6 ? `${(bps / 1e6).toFixed(1)} Mbps` : `${Math.round(bps / 1e3)} kbps`;
}

export function formatTime(ts) {
  const d = new Date(ts);
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** 录制前的倒计时，返回取消函数 */
export function countdown(seconds, onTick) {
  let left = seconds;
  onTick(left);
  const timer = setInterval(() => {
    left -= 1;
    if (left > 0) {
      onTick(left);
      return;
    }
    clearInterval(timer);
    onTick(0);
  }, 1000);
  return () => clearInterval(timer);
}

/**
 * 挑一个当前浏览器支持的录制容器。
 * 优先 V 系列编码；开了 H.264 偏好才试伪 WebM（video/webm;codecs=h264），
 * 但它不是哪家 Chromium 都有，所以只是一条插在最后的备选，挑不到就正常回退。
 */
export function pickMimeType(hasAudio, { preferH264 = false } = {}) {
  const isSupported = (t) => Boolean(window.MediaRecorder?.isTypeSupported?.(t));
  const ordered = (list, profile) => {
    const [head, ...rest] = list;
    return head.includes(';')
      ? [`${head.split(';')[0]};codecs=${profile}`, `${head.split(';')[0]};codecs=${profile},opus`, ...rest]
      : list;
  };

  const vp9 = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const av1 = ['video/webm;codecs=av01', 'video/webm;codecs=vp9', 'video/webm'];
  const h264Webm = ['video/webm;codecs=h264', 'video/webm'];

  const candidates = (hasAudio
    ? [...ordered(vp9, 'vp9,opus'), ...ordered(av1, 'av01,opus'), ...ordered(h264Webm, 'h264,opus')]
    : [...vp9, ...av1, ...h264Webm]
  ).concat(['video/mp4']);

  const usable = preferH264
    ? [...candidates.filter((t) => t.includes('h264')), ...candidates.filter((t) => !t.includes('h264'))]
    : candidates;

  return usable.find(isSupported) || '';
}

/** H.264 编进 WebM（伪 WebM）只有部分 Chromium 认，且不同版本行为不一致，只能实探 */
export function supportsH264Webm() {
  return ['video/webm;codecs=h264', 'video/webm;codecs=h264,opus'].some((t) =>
    Boolean(window.MediaRecorder?.isTypeSupported?.(t)),
  );
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function aspectRatio(width, height) {
  const d = gcd(width, height) || 1;
  return `${width / d}:${height / d}`;
}

export function filename(ext, ts = Date.now()) {
  const d = new Date(ts);
  const stamp = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  return `record-${stamp}.${ext}`;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
