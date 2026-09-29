/**
 * 麦克风设备与权限。
 *
 * 浏览器只在「已经拿到麦克风权限」之后才肯把 deviceId / label 填进
 * enumerateDevices 的结果里，否则给一堆空壳设备。所以这里的顺序是固定的：
 * 先要权限，再枚举，最后按用户选的 deviceId 真正开一条流。
 */

/** 没有麦克风的机器和只有扬声器的机器都会走到这里，统一给一句能给用户看的话 */
export function micErrorMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return '麦克风权限被拒绝，请在浏览器地址栏的权限设置里改回「允许」';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return '没找到可用的麦克风，确认设备已插好并启用';
    case 'NotReadableError':
      return '麦克风被其它程序占用，关掉占用的软件再试';
    default:
      return `麦克风打开失败：${error?.message || error}`;
  }
}

/** 申请麦克风权限并枚举设备。返回的流交给调用方持有，用来让设备名一直可见 */
export async function requestMicAccess() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      // 关掉浏览器自带的三件套，否则录进去的声音和原始麦克风不是一回事
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === 'audioinput',
    );
    return { stream, devices };
  } catch (error) {
    stopStream(stream);
    throw error;
  }
}

/**
 * 在指定设备上开一条实际用于录制的流。
 * deviceId 用 exact 是为了让设备被拔掉时直接报错，而不是悄悄换一个录进去。
 */
export function openMicStream(deviceId) {
  const audio = deviceId ? { deviceId: { exact: deviceId } } : true;
  return navigator.mediaDevices.getUserMedia({ audio });
}

export function stopStream(stream) {
  stream?.getTracks().forEach((t) => t.stop());
}

/** 设备热插拔时浏览器会发 devicechange，用来重新枚举 */
export function onDeviceChange(handler) {
  const md = navigator.mediaDevices;
  if (!md?.addEventListener) return () => {};
  md.addEventListener('devicechange', handler);
  return () => md.removeEventListener('devicechange', handler);
}

/** 输入设备不保证有 label（既有权限也没名字的情况存在），给个兜底的显示名 */
export function deviceLabel(device, index) {
  return device.label || `麦克风 ${index + 1}`;
}
