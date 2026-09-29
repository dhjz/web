/**
 * 给 MediaRecorder 产出的 WebM 补上时长。
 *
 * 浏览器录出来的 WebM 有两个特点凑在一起：
 *   1. Info 里没有 Duration 元素 —— 总时长压根没写进文件
 *   2. Segment 用「未知长度」，没有告诉播放器自己有多长
 * 这两条都在规范允许范围内（WebM 面向流式录制，时长是可选信息），
 * 但播放器只能自己推算：从前往后扫簇、按已见的帧率估尾部。遇到静止画面、
 * 帧间隔不均的录制就会估短，表现成「末尾几秒被吞掉」。
 * 同一份文件换个播放器又正常，是因为各家的估算策略不一样。
 *
 * 这里只改元数据：把 Duration 按最后一个 Block 的时间戳 + 末帧时长算出来写进 Info，
 * 帧数据一个字节都不动，所以不需要重编码、也几乎不花时间。
 * 转成 MP4 之后没问题，正是因为 MP4 的容器必定带时长信息。
 *
 * 但只信文件里的末帧时间戳还不够：编码器在结束时会有一批帧没能及时写进最后一个
 * Cluster，于是文件时间轴比真实录制的墙上时间短。这个缺口在 H.264 上尤其明显
 * （实测 60 秒录制差 0.7 秒以上，VP9 只有 0.5 秒），录得越久、画面越卡，缺口越大，
 * 表现就是「时间条走完了还在播」。所以调用方把真实录制时长传进来，
 * 两者取较大值当 Duration，宁可略长也不要短。
 */

const ID_SEGMENT = 0x18538067;
const ID_INFO = 0x1549a966;
const ID_TIMECODE_SCALE = 0x2ad7b1;
const ID_DURATION = 0x4489;
const ID_TIMECODE = 0xe7;
const ID_SIMPLE_BLOCK = 0xa3;
const ID_BLOCK_GROUP = 0xa0;
const ID_BLOCK = 0xa1;

/** MediaRecorder 写的是未知长度(0x01FFFFFFFFFFFFFF)，按 EBML 规则等于「读到能读的地方为止」 */
const UNKNOWN_SIZE = 2 ** 56 - 1;

/** EBML 尺寸/数值：首位是长度标记，要丢掉 */
function readVint(view, offset) {
  const first = view.getUint8(offset);
  let length = 1;
  while (length <= 8 && !(first >> (8 - length)) & 1) length += 1;
  let value = first & ((1 << (8 - length)) - 1);
  for (let i = 1; i < length; i += 1) value = value * 256 + view.getUint8(offset + i);
  return { value, length };
}

/** EBML ID：长度标记位本身属于 ID */
function readId(view, offset) {
  const first = view.getUint8(offset);
  let length = 1;
  while (length <= 8 && !(first >> (8 - length)) & 1) length += 1;
  let value = 0;
  for (let i = 0; i < length; i += 1) value = value * 256 + view.getUint8(offset + i);
  return { value, length };
}

/** 读一个元素头，返回 { id, payload 起点, size }；size 未知时为 Infinity */
function readElement(view, offset) {
  const id = readId(view, offset);
  const size = readVint(view, offset + id.length);
  const payload = offset + id.length + size.length;
  return { id: id.value, payload, size: size.value >= UNKNOWN_SIZE ? Infinity : size.value };
}

/** 大端读整数（1–6 字节），DataView 只提供定宽方法 */
function readUint(view, offset, length) {
  let value = 0;
  for (let i = 0; i < length; i += 1) value = value * 256 + view.getUint8(offset + i);
  return value;
}

function encodeVint(value, length) {
  const bytes = new Uint8Array(length);
  let rest = BigInt(value) | (BigInt(1) << BigInt(7 * length));
  for (let i = length - 1; i >= 0; i -= 1) {
    bytes[i] = Number(rest & 255n);
    rest >>= 8n;
  }
  return bytes;
}

/** 找出文件里所有 Cluster 的偏移；未知长度元素没法顺序跳，只能扫 ID */
function findClusters(view) {
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const offsets = [];
  for (let i = 0; i < bytes.length - 4; i += 1) {
    if (bytes[i] === 0x1f && bytes[i + 1] === 0x43 && bytes[i + 2] === 0xb6 && bytes[i + 3] === 0x75) {
      offsets.push(i);
    }
  }
  return offsets;
}

/** 找出某个顶层元素的位置；扫描时每个偏移都可能不是元素起点，跳过读越界的 */
function indexOfId(view, bytes, id) {
  for (let i = 0; i < bytes.length - 4; i += 1) {
    try {
      if (readElement(view, i).id === id) return i;
    } catch (e) {
      /* 不是元素起点，继续往后找 */
    }
  }
  return -1;
}

/**
 * 从 Cluster 里找出最后一个 Block 的绝对时间（毫秒）。
 * SimpleBlock 和 BlockGroup/Block 都带 16 位有符号的相对时间戳，
 * 视频音频不区分——取所有轨道里最靠后的那个，总时长才不会被截短。
 */
function lastBlockTime(view, clusters) {
  let last = 0;
  for (let i = 0; i < clusters.length; i += 1) {
    const start = clusters[i];
    const end = i + 1 < clusters.length ? clusters[i + 1] : view.byteLength;
    let clusterTime = 0;
    let offset = readElement(view, start).payload;
    while (offset + 2 < end) {
      let element;
      try {
        element = readElement(view, offset);
      } catch (e) {
        break;
      }
      if (element.payload + element.size > view.byteLength) break;
      if (element.id === ID_TIMECODE) {
        clusterTime = readUint(view, element.payload, element.size);
      } else if (element.id === ID_SIMPLE_BLOCK) {
        last = Math.max(last, clusterTime + view.getInt16(element.payload + 1));
      } else if (element.id === ID_BLOCK_GROUP) {
        const inner = readElement(view, element.payload);
        if (inner.id === ID_BLOCK) last = Math.max(last, clusterTime + view.getInt16(inner.payload + 1));
      }
      offset = element.payload + element.size;
    }
  }
  return last;
}

/**
 * 返回补好时长的 WebM（源文件已经有 Duration 就原样返回）。
 * 不改帧数据，只是重新拼一次 ArrayBuffer。
 */
export async function withDuration(blob, recordedMs = 0) {
  const buffer = await blob.arrayBuffer();
  if (buffer.byteLength < 16) return blob;
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 先确认这真是个 WebM；不是就原样退回，绝不把好好的文件改坏
  if (indexOfId(view, bytes, ID_SEGMENT) < 0) return blob;
  const infoOffset = indexOfId(view, bytes, ID_INFO);
  const clusters = findClusters(view);
  if (infoOffset < 0 || !clusters.length) return blob;

  const info = readElement(view, infoOffset);
  const infoEnd = Math.min(info.payload + info.size, view.byteLength);

  // 走一遍 Info 的子元素：拿到时间刻度，顺便确认没有 Duration、记下插入位置
  let timecodeScale = 1e6;
  let insertAt = null;
  try {
    for (let offset = info.payload; offset + 2 < infoEnd; ) {
      const element = readElement(view, offset);
      if (element.payload + element.size > view.byteLength) break;
      if (element.id === ID_TIMECODE_SCALE) timecodeScale = readUint(view, element.payload, element.size);
      // 已经有 Duration 就不动它，重复调用也就成了幂等操作
      if (element.id === ID_DURATION) return blob;
      offset = element.payload + element.size;
      insertAt = offset;
    }
  } catch (e) {
    return blob;
  }
  if (insertAt === null) return blob;

  // 时长 = 最后一个 Block 的绝对时间 + 末帧自身时长；帧率取不到就按 30fps 算
  const fromFile = (lastBlockTime(view, clusters) + 1000 / 30) * (timecodeScale / 1e6);
  // 文件时间轴常常短于真实录制：编码器结束时会丢下最后一批没写完的帧。
  // 真实录制时长更接近用户感知的「录了多久」，两者取较大值，避免进度条先走完。
  const fromClock = recordedMs > 0 ? recordedMs * (timecodeScale / 1e6) : 0;
  const seconds = Math.max(fromFile, fromClock);
  const payload = new Uint8Array(8);
  new DataView(payload.buffer).setFloat64(0, seconds, false);
  const element = new Uint8Array(11);
  element.set([0x44, 0x89, 0x88]);
  element.set(payload, 3);

  // Info 的尺寸字段跟着变长，宽度不变（各版本通常都留了 1 字节给 25 的 Info）
  const sizeFieldLength = info.payload - infoOffset - readId(view, infoOffset).length;
  const newInfoSize = info.size + element.length;
  if (newInfoSize >= 2 ** (7 * sizeFieldLength) - 1) return blob;

  const output = new Uint8Array(buffer.byteLength + element.length);
  output.set(bytes.subarray(0, insertAt), 0);
  output.set(element, insertAt);
  output.set(bytes.subarray(insertAt), insertAt + element.length);
  output.set(
    encodeVint(newInfoSize, sizeFieldLength),
    infoOffset + readId(view, infoOffset).length,
  );
  return new Blob([output], { type: 'video/webm' });
}
