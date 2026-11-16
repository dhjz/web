/*!
 * toaudio.js — 浏览器原生音轨抽取（零重编码 / 零依赖 / 不用 ffmpeg.wasm）
 *
 * 只做两件事：
 *   MP4 / MOV / M4V / 3GP（ISOBMFF）→ 按样本表把音轨字节切出来：AAC 补 ADTS 头（.aac）、
 *                                    MP3 原样（.mp3）、未压缩 PCM 加 WAV 头（.wav）；
 *                                    索引在 moov（普通 MP4）或 moof/trun（分片 MP4）里都支持
 *   WebM / MKV（Matroska）         → 按 Tracks/Cluster 取 Opus 包封成 Ogg（.opus），AAC 包补 ADTS 头（.aac）
 *
 * 两条路都是 Stream Copy：只读索引和音轨扇区，不解码、不重编码，几百 MB 的视频毫秒级出结果，
 * 也不会把整部视频读进内存。容器/编码不在上面范围（AVI/FLV/ALAC/AC-3/Vorbis/分片 MP4…）时返回 null。
 *
 * 格式怎么认：先读文件头（EBML 魔数 / 第 5~8 字节的 4CC + 长度），再让对应解复用器走通索引结构才算数；
 * 后缀名和 MIME 只用来决定先试哪个 —— 改名、转存、content-type 给错的文件也一样能认。
 *
 * 踩过的坑（别再改回去，改回去就是负优化）
 *   · 成本全在「读盘次数」上。113MB 的视频只有 23MB 音轨，音频被切成上千个 chunk 夹在视频数据中间，
 *     「一个 chunk 读一次」= 上千次 file.slice().arrayBuffer()，每次几十 ms，实测 100 多秒。
 *     现在按 4MB 连续窗口合并读（COPY_WIN）、1MB 以内的空洞也带着走（COPY_GAP），同一份文件降到
 *     几十次读、2~3 秒。参考实现用的是 4MB 窗口 / 64KB 空洞，量级一致 —— 别退回逐 chunk 读。
 *   · 输出按总长一次性预分配（Uint8Array + 写入位置），ADTS 头用 writeAdts() 就地写进缓冲区；
 *     不要逐帧 new 一个 7 字节小数组，也不要凑成几十万个片段再 new Blob（帧多时这一项就上秒）。
 *   · 别在浏览器里对视频整段 decodeAudioData 换时长：60s 的片子要几十秒，还吃内存，而结果只用来
 *     显示时长；时长问播放器（只读容器头）或留给网关。
 *   · 内存里测出来的差距很小（1180 次读 92ms vs 33 次读 65ms），所以「本地跑得快」证明不了浏览器里快，
 *     决定性指标是 slice 次数。控制台里 [toAudio] copy … windows=N 就是读盘次数。
 *   · 分片 MP4（fMP4）同理：顶层盒子头按窗口扫（topWin = 文件 1/64，64KB~4MB），从第一个 moof 起
 *     顺着文件走 4MB 窗口，moof 就地解析、mdat 按长度跳过，全片一遍过完；别退回「一个 moof 读一次」，
 *     1200 个 fragment 的片子那么写就是 1250 次读盘，现在是 59 次。
 *
 * 用法
 *   <script src="toaudio.js"></script>
 *   const r = await toAudio(file);                 // file: File | Blob
 *   if (r) upload(r.blob, 'a.' + r.ext);           // 抽不出来（null）就自己兜底：整段解码或原样上传
 *
 * 返回值
 *   { blob, ext, mime, codec, container, rate, channels, duration, frames }
 *
 * 选项
 *   toAudio(file, { onProgress(ratio), onStage(name, info), signal })
 *     ratio 0~1（粗粒度）；signal 是 AbortSignal，可中途取消；
 *     onStage 会在 sniff / moov / codec / samples / tracks / packets / miss 各阶段回调，便于打日志定位耗时
 *
 * 额外
 *   toAudio.sniff(file)                            // 只看文件头：'iso' | 'mkv' | ''（不读全文件）
 *   toAudio.canHandle(file)                        // 名字/MIME 像不像；真正判断靠 sniff + 解复用器
 *   toAudio.reason()                               // 上一次返回 null 的人话原因
 *   toAudio.extract === toAudio
 */
(function (root, factory) {
  if (typeof module === 'object' && module && module.exports) module.exports = factory();
  else root.toAudio = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MIB = 1048576;

  async function sliceU8(blob, start, end) {
    const b = blob.slice(start, Math.min(end, blob.size));
    return new Uint8Array(await b.arrayBuffer());
  }

  function bail(signal) {
    if (!signal || !signal.aborted) return;
    if (typeof DOMException === 'function') throw new DOMException('已取消', 'AbortError');
    const e = new Error('已取消');
    e.name = 'AbortError';
    throw e;
  }

  // 每个解复用器放弃时留一句人话，调用方（或控制台）能直接说清「为什么抽不出来」
  let misses = [];
  function miss(reason) {
    if (misses.indexOf(reason) < 0) misses.push(reason);
    trace('miss', { reason });
    return null;
  }

  // ---------------------------------------------------------------- 调试日志
  // 每个阶段往控制台打一行（带上从开始抽轨算起的耗时），大文件卡在哪一步一眼就看出来
  let T0 = 0;
  const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  function trace(name, info) {
    try {
      let tail = '';
      if (info) {
        const p = [];
        for (const k in info) {
          if (info[k] === undefined || info[k] === null || info[k] === '') continue;
          p.push(k + '=' + info[k]);
        }
        if (p.length) tail = ' ' + p.join(' ');
      }
      console.log('[toAudio] ' + name + ' @' + (T0 ? Math.round(nowMs() - T0) : 0) + 'ms' + tail);
    } catch (_) {}
  }

  // 顺序读的窗口缓冲：Element 头很碎，一次读 4MB，够用很久
  class ByteReader {
    constructor(blob, win) {
      this.blob = blob;
      this.win = win || 4 * MIB;
      this.buf = new Uint8Array(0);
      this.base = 0;
      this.off = 0;
    }
    get pos() { return this.base + this.off; }
    async ensure(n) {
      if (this.off + n <= this.buf.length) return true;
      const start = this.pos;
      const end = Math.min(this.blob.size, start + Math.max(this.win, n));
      if (end <= start) return false;
      this.buf = await sliceU8(this.blob, start, end);
      this.base = start;
      this.off = 0;
      return this.buf.length >= n;
    }
    async take(n) {
      if (n < 0 || !(await this.ensure(n))) return null;
      const v = this.buf.subarray(this.off, this.off + n);
      this.off += n;
      return v;
    }
    seek(pos) {
      if (pos >= this.base && pos <= this.base + this.buf.length) { this.off = pos - this.base; return; }
      this.base = pos;
      this.buf = new Uint8Array(0);
      this.off = 0;
    }
  }

  // ------------------------------------------------------------ ISOBMFF（MP4 / MOV / M4V / 3GP）
  const AAC_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
  const fourcc = (u8, p) => String.fromCharCode(u8[p], u8[p + 1], u8[p + 2], u8[p + 3]);

  function boxesIn(u8, from, to) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const out = [];
    let p = from;
    while (p + 8 <= to) {
      let size = dv.getUint32(p);
      const type = fourcc(u8, p + 4);
      let head = 8;
      if (size === 1) {
        if (p + 16 > to) break;
        size = dv.getUint32(p + 8) * 4294967296 + dv.getUint32(p + 12);
        head = 16;
      } else if (size === 0) size = to - p;
      if (size < head || p + size > to) break;
      out.push({ type, body: p + head, end: p + size });
      p += size;
    }
    return out;
  }

  // 顶层盒子扫描：只解析头部，mdat 再大也不拖进内存。
  // 分片 MP4 有成千上万个 moof/mdat，一个盒子读一次 16 字节就是上千次读盘 —— 所以按窗口读，
  // 窗口里的头直接解析，跳出窗口才重读（窗口起点永远是当前盒子，不跨盒子边）。
  // 窗口大小取文件的 1/64（64KB~4MB）：头挨得密的时候窗口扫过一串，头稀疏的大文件也不会白读太多。
  function topWin(size) {
    return Math.max(64 * 1024, Math.min(4 * MIB, Math.floor(size / 64)));
  }

  async function topBoxes(file) {
    const out = [];
    const WIN = topWin(file.size);
    let p = 0;
    let base = 0;
    let win = new Uint8Array(0);
    let dv = null;
    let seenMoov = false;
    while (p + 8 <= file.size) {
      if (p < base || p + 16 > base + win.length) {
        base = p;
        win = new Uint8Array(await file.slice(base, Math.min(base + WIN, file.size)).arrayBuffer());
        dv = new DataView(win.buffer, win.byteOffset, win.byteLength);
      }
      const o = p - base;
      if (o + 8 > win.length) break;                    // 文件尾巴不够一个头
      const type = fourcc(win, o + 4);
      if (!/^[\x20-\x7e]{4}$/.test(type)) break;
      let size = dv.getUint32(o);
      let head = 8;
      if (size === 1) {
        if (o + 16 > win.length) break;                 // 64 位头被窗口截断（只在文件尾出现）
        size = dv.getUint32(o + 8) * 4294967296 + dv.getUint32(o + 12);
        head = 16;
      } else if (size === 0) size = file.size - p;
      if (size < head) break;
      out.push({ type, start: p, body: p + head, end: Math.min(p + size, file.size) });
      p += size;
      if (type === 'moov') seenMoov = true;
      else if (type === 'moof' && seenMoov) break;   // 分片 MP4：后面的 moof 交给 fragTable 顺着走
    }
    return out;
  }

  function descLen(u8, p) {
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const b = u8[p + i];
      if (b === undefined) return null;
      n = (n << 7) | (b & 0x7f);
      if (!(b & 0x80)) return { size: n, len: i + 1 };
    }
    return null;
  }

  // esds → ES_Descriptor → DecoderConfigDescriptor → AudioSpecificConfig
  function parseEsds(u8, from, to) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let p = from + 4;                                  // version/flags
    if (u8[p] === 0x03) {
      p++;
      const l1 = descLen(u8, p);
      if (!l1) return null;
      p += l1.len + 2;                                 // ES_ID
      const flags = u8[p++];
      if (flags & 0x80) p += 2;
      if (flags & 0x40) { const l = descLen(u8, p); if (!l) return null; p += l.len + l.size; }
      if (flags & 0x20) p += 2;
    }
    if (u8[p] !== 0x04) return null;
    p++;
    const l2 = descLen(u8, p);
    if (!l2) return null;
    p += l2.len;
    const objType = u8[p];
    p += 13;                                           // objectTypeIndication + streamType + bufferSizeDB + 两个码率
    let asc = null;
    if (u8[p] === 0x05) {
      p++;
      const l3 = descLen(u8, p);
      if (l3) { p += l3.len; asc = u8.subarray(p, Math.min(p + l3.size, to)); }
    }
    return { objType, asc };
  }

  function audioEntry(u8, dv, stsd) {
    const n = dv.getUint32(stsd.body + 4);
    let p = stsd.body + 8;
    for (let i = 0; i < n && p + 36 <= stsd.end; i++) {
      const size = dv.getUint32(p);
      if (size < 36) return null;
      const ver = dv.getUint16(p + 16);
      const ent = {
        fmt: fourcc(u8, p + 4),
        channels: dv.getUint16(p + 24),
        bits: dv.getUint16(p + 26),
        rate: dv.getUint32(p + 32) / 65536,
        ver,
        end: p + size,
        kids: [],
      };
      const kidsFrom = p + 36 + (ver === 1 ? 16 : ver === 2 ? 36 : 0);
      if (kidsFrom + 8 <= ent.end) ent.kids = boxesIn(u8, kidsFrom, ent.end);
      return ent;
    }
    return null;
  }

  // MOV/MP4 里的未压缩 PCM（相机、QuickTime 导出的 .mov 常见）：字节搬过去加个 WAV 头就行
  function pcmFormat(ent) {
    const f = ent.fmt;
    if (f === 'sowt') return { bits: 16, big: false };            // 16bit 小端
    if (f === 'twos') return { bits: 16, big: true };             // 16bit 大端
    if (f === 'in24') return { bits: 24, big: true };
    if (f === 'in32') return { bits: 32, big: true };
    if (f === 'raw ') return { bits: 8, big: false };             // 8bit 无符号
    return null;                                                  // lpcm/fl32/fl64/alac 需要额外信息，不猜
  }

  // 统一转成 WAV 能放的 16bit LE（8bit 原样）
  function convPcm(buf, fmt) {
    const n = buf.length;
    if (fmt.bits === 8) return buf;
    const out = new Uint8Array(fmt.big ? Math.floor(n / (fmt.bits / 8)) * 2 : n);
    if (!fmt.big && fmt.bits === 16) return buf;
    const step = fmt.bits / 8;
    const cnt = Math.floor(n / step);
    for (let i = 0, j = 0; i < cnt; i++, j += step) {
      out[i * 2] = buf[j + 1];                                    // 低字节
      out[i * 2 + 1] = buf[j];                                    // 高字节
    }
    return out;
  }

  function wavHeader(dataLen, channels, rate, bits) {
    const b = new Uint8Array(44);
    const dv = new DataView(b.buffer);
    const tag = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    const blockAlign = channels * bits / 8;
    tag(0, 'RIFF');
    dv.setUint32(4, 36 + dataLen, true);
    tag(8, 'WAVE');
    tag(12, 'fmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);                                    // PCM
    dv.setUint16(22, channels, true);
    dv.setUint32(24, rate, true);
    dv.setUint32(28, rate * blockAlign, true);
    dv.setUint16(32, blockAlign, true);
    dv.setUint16(34, bits, true);
    tag(36, 'data');
    dv.setUint32(40, dataLen, true);
    return b;
  }

  // 分片 MP4（moof/traf/trun）：样本表在每片的 moof 里，字节照样原样搬。
  // moof 是碎的（一段一个），一个 moof 读一次的话长片子上千次读盘 —— 所以从第一个 moof 起
  // 顺着文件走 4MB 窗口，moof 就地解析、mdat 按长度跳过，全片一遍过完（约几十次读）。
  async function fragTable(file, tops, trackId, opts) {
    const sizes = [];
    const offs = [];
    const first = tops.find((t) => t.type === 'moof');
    if (!first) return null;
    let p = first.start;
    let base = 0;
    let win = new Uint8Array(0);
    let dv = null;
    while (p + 8 <= file.size) {
      bail(opts && opts.signal);
      if (p < base || p + 16 > base + win.length) {
        base = p;
        win = new Uint8Array(await file.slice(base, Math.min(base + COPY_WIN, file.size)).arrayBuffer());
        dv = new DataView(win.buffer, win.byteOffset, win.byteLength);
      }
      const o = p - base;
      if (o + 8 > win.length) break;
      const type = fourcc(win, o + 4);
      let size = dv.getUint32(o);
      let head = 8;
      if (size === 1) {
        if (o + 16 > win.length) break;
        size = dv.getUint32(o + 8) * 4294967296 + dv.getUint32(o + 12);
        head = 16;
      } else if (size === 0) size = file.size - p;
      if (size < head) break;
      if (type === 'moof') {
        if (o + size <= win.length) {
          readMoof(win, dv, o + head, o + size, p);
        } else {                                            // moof 比窗口还大（极少见）：单独读
          const one = await sliceU8(file, p + head, p + size);
          readMoof(one, new DataView(one.buffer, one.byteOffset, one.byteLength), 0, one.length, p);
        }
      }
      p += size;
    }
    // 解析窗口里的一个 moof：[from, to) 是它在窗口内的范围，moofStart 是它在文件里的绝对偏移
    function readMoof(u8, dv, from, to, moofStart) {
      for (const traf of boxesIn(u8, from, to).filter((b) => b.type === 'traf')) {
        const kids = boxesIn(u8, traf.body, traf.end);
        const tfhd = kids.find((b) => b.type === 'tfhd');
        if (!tfhd) continue;
        const tfFlags = dv.getUint32(tfhd.body) & 0xffffff;
        if (dv.getUint32(tfhd.body + 4) !== trackId) continue;
        let p = tfhd.body + 8;
        let base = 0;
        if (tfFlags & 0x01) { base = dv.getUint32(p) * 4294967296 + dv.getUint32(p + 4); p += 8; }
        if (tfFlags & 0x02) p += 4;                               // sample_description_index
        let defSize = 0;
        if (tfFlags & 0x08) p += 4;                               // default_sample_duration
        if (tfFlags & 0x10) { defSize = dv.getUint32(p); p += 4; }
        if (tfFlags & 0x20) p += 4;                               // default_sample_flags
        let cursor = base || moofStart;                           // 没给 base 就按 moof 起点算
        for (const trun of kids.filter((b) => b.type === 'trun')) {
          const trFlags = dv.getUint32(trun.body) & 0xffffff;
          const cnt = dv.getUint32(trun.body + 4);
          let q = trun.body + 8;
          let dataOff = 0;
          if (trFlags & 0x01) { dataOff = dv.getInt32(q); q += 4; }
          if (trFlags & 0x04) q += 4;                             // first_sample_flags
          let pos = cursor + dataOff;
          for (let i = 0; i < cnt; i++) {
            let size = defSize;
            if (trFlags & 0x100) q += 4;                          // sample_duration
            if (trFlags & 0x200) { size = dv.getUint32(q); q += 4; }
            if (trFlags & 0x400) q += 4;                          // sample_flags
            if (trFlags & 0x800) q += 4;                          // composition_offset
            if (!size) break;
            offs.push(pos);
            sizes.push(size);
            pos += size;
          }
          cursor = pos;
        }
      }
    }
    if (!sizes.length) return null;
    return { sizes: Uint32Array.from(sizes), offs: Float64Array.from(offs), count: sizes.length };
  }

  // ASC 里能直接拿到 ADTS 需要的三项；拿不到就按采样率表兜底
  function aacCfg(asc, ent) {
    let aot = 2;
    let fi = -1;
    let ch = ent.channels || 2;
    if (asc && asc.length >= 2) {
      aot = asc[0] >> 3;
      fi = ((asc[0] & 7) << 1) | (asc[1] >> 7);
      ch = ((asc[1] >> 3) & 0x0f) || ch;
      if (aot > 4) aot = 2;                            // HE-AAC/PS：ADTS 里写 LC，SBR 由解码器从码流认
    }
    if (fi < 0 || fi > 12) {
      const r = Math.round(ent.rate || 0);
      fi = AAC_RATES.indexOf(r);
      if (fi < 0) {
        fi = 0;
        for (let i = 1; i < AAC_RATES.length; i++) {
          if (Math.abs(AAC_RATES[i] - r) < Math.abs(AAC_RATES[fi] - r)) fi = i;
        }
      }
    }
    return { profile: Math.max(0, Math.min(3, aot - 1)), fi, ch: Math.max(1, Math.min(7, ch)) };
  }

  function adtsHeader(len, cfg) {
    const n = len + 7;
    return Uint8Array.from([
      0xFF, 0xF1,                                      // 12 位同步字 + MPEG-4 + 无 CRC
      ((cfg.profile & 3) << 6) | ((cfg.fi & 0xf) << 2) | ((cfg.ch >> 2) & 1),
      ((cfg.ch & 3) << 6) | ((n >> 11) & 3),
      (n >> 3) & 0xff,
      ((n & 7) << 5) | 0x1f,                           // 缓冲满度全 1
      0xfc,                                            // 1 个 raw block
    ]);
  }

  // stsd/stsz/stsc/stco → 每个样本在文件里的 (偏移, 长度)
  function sampleTable(u8, dv, sb) {
    const stsz = sb.find((b) => b.type === 'stsz');
    const stz2 = sb.find((b) => b.type === 'stz2');
    const stsc = sb.find((b) => b.type === 'stsc');
    const stco = sb.find((b) => b.type === 'stco');
    const co64 = sb.find((b) => b.type === 'co64');
    const cb = stco || co64;
    if (!stsc || !cb) return null;                     // 分片 MP4（moof）没有样本表

    let count = 0;
    let sizes = null;
    if (stsz) {
      const def = dv.getUint32(stsz.body + 4);
      count = dv.getUint32(stsz.body + 8);
      if (!count || count > 1e7) return null;
      sizes = new Uint32Array(count);
      if (def) sizes.fill(def);
      else {
        if (stsz.body + 12 + count * 4 > stsz.end) return null;
        for (let i = 0; i < count; i++) sizes[i] = dv.getUint32(stsz.body + 12 + i * 4);
      }
    } else if (stz2) {
      const field = u8[stz2.body + 7];
      count = dv.getUint32(stz2.body + 8);
      if (!count || count > 1e7) return null;
      sizes = new Uint32Array(count);
      for (let i = 0; i < count; i++) {
        sizes[i] = field === 16 ? dv.getUint16(stz2.body + 12 + i * 2)
          : field === 8 ? u8[stz2.body + 12 + i]
          : (u8[stz2.body + 12 + (i >> 1)] >> ((i & 1) ? 0 : 4)) & 0x0f;
      }
    }
    if (!sizes) return null;

    const cn = dv.getUint32(cb.body + 4);
    if (!cn || cb.body + 8 + cn * (stco ? 4 : 8) > cb.end) return null;
    const chunks = new Float64Array(cn);
    for (let i = 0; i < cn; i++) {
      chunks[i] = stco ? dv.getUint32(cb.body + 8 + i * 4)
        : dv.getUint32(cb.body + 8 + i * 8) * 4294967296 + dv.getUint32(cb.body + 12 + i * 8);
    }

    const rn = dv.getUint32(stsc.body + 4);
    if (!rn || stsc.body + 8 + rn * 12 > stsc.end) return null;
    const runs = [];
    for (let i = 0; i < rn; i++) {
      const p = stsc.body + 8 + i * 12;
      runs.push({ first: dv.getUint32(p), spc: dv.getUint32(p + 4) });
    }

    const offs = new Float64Array(count);
    let si = 0;
    for (let i = 0; i < runs.length && si < count; i++) {
      const from = runs[i].first - 1;
      const to = i + 1 < runs.length ? runs[i + 1].first - 1 : cn;
      for (let c = from; c < to && si < count; c++) {
        let off = chunks[c];
        for (let k = 0; k < runs[i].spc && si < count; k++) {
          offs[si] = off;
          off += sizes[si];
          si++;
        }
      }
    }
    if (si < count) return null;
    return { sizes, offs, count };
  }

  function trackId(u8, dv, tk) {
    const tkhd = tk.find((b) => b.type === 'tkhd');
    if (!tkhd || tkhd.body + 12 > tkhd.end) return 0;
    return u8[tkhd.body] === 1 ? dv.getUint32(tkhd.body + 20) : dv.getUint32(tkhd.body + 12);
  }

  // ADTS 头直接写进输出缓冲区，不逐帧新建 7 字节小数组（几十万帧时这就是主要开销之一）
  function writeAdts(out, at, len, cfg) {
    const n = len + 7;
    out[at] = 0xFF;
    out[at + 1] = 0xF1;
    out[at + 2] = ((cfg.profile & 3) << 6) | ((cfg.fi & 0xf) << 2) | ((cfg.ch >> 2) & 1);
    out[at + 3] = ((cfg.ch & 3) << 6) | ((n >> 11) & 3);
    out[at + 4] = (n >> 3) & 0xff;
    out[at + 5] = ((n & 7) << 5) | 0x1f;
    out[at + 6] = 0xfc;
  }

  // 按样本表把字节搬到目标封装里。aac→ADTS、mp3 原样、pcm→WAV，都是零重编码。
  // 快就快在这三件事：相邻样本合并成 ≤4MB 的连续窗口读（碎块 I/O 是主要开销，
  // 中间夹着几十 KB 视频数据也照样合并）、输出缓冲区一次性按总长预分配、
  // 每 4 个窗口让出一次主线程（进度条才不会等结束才跳）。
  const COPY_WIN = 4 * MIB;                 // 单次读取窗口上限
  const COPY_GAP = 1 * MIB;                 // 窗口内允许带着走的空洞（夹在中间的视频数据）

  async function copyTrack(file, table, plan, info) {
    const opts = info.opts;
    const { sizes, offs, count } = table;
    const pcm = plan.kind === 'pcm' ? plan.pcm : null;
    const isAac = plan.kind === 'aac';

    // 先扫一遍：有效帧数 + 原音轨总字节（aac 每帧多发 7 字节头）
    let frames = 0;
    let total = 0;
    for (let i = 0; i < count; i++) {
      const n = sizes[i];
      if (isAac && (n <= 0 || n + 7 > 0x1fff)) continue;
      total += n;
      frames++;
    }
    if (!frames) return null;

    // 窗口：尽量往后吞，跨度不超过 4MB，中间空洞不超过 64KB
    const wins = [];
    let w0 = 0;
    while (w0 < count) {
      let w1 = w0;
      let end = offs[w0] + sizes[w0];
      while (w1 + 1 < count) {
        const s = offs[w1 + 1];
        const e = s + sizes[w1 + 1];
        if (s < offs[w0] || s - end > COPY_GAP || e - offs[w0] > COPY_WIN) break;
        w1++;
        end = e;
      }
      wins.push({ from: w0, to: w1, start: offs[w0], end });
      w0 = w1 + 1;
    }

    const out = isAac ? new Uint8Array(total + frames * 7) : new Uint8Array(total);
    const pcmParts = pcm ? [] : null;
    let w = 0;
    let done = 0;
    let read = 0;
    let lastYield = nowMs();

    for (let b = 0; b < wins.length; b++) {
      bail(opts && opts.signal);
      const win = wins[b];
      const buf = new Uint8Array(
        await file.slice(win.start, Math.min(win.end, file.size)).arrayBuffer());
      read += buf.length;
      for (let i = win.from; i <= win.to; i++) {
        const n = sizes[i];
        if (isAac && (n <= 0 || n + 7 > 0x1fff)) continue;
        const c = offs[i] - win.start;
        if (c < 0 || c + n > buf.length) continue;          // 文件被截断：跳过，别越界
        const src = buf.subarray(c, c + n);
        if (pcm) {
          const conv = convPcm(src, pcm);
          if (conv && conv.length) pcmParts.push(conv);
        } else {
          if (isAac) { writeAdts(out, w, n, plan.cfg); w += 7; }
          out.set(src, w);
          w += n;
        }
        done += n;
      }
      if (opts && opts.onProgress && total) opts.onProgress(Math.min(1, done / total));
      // 真慢的时候才让出主线程（读盘慢才有必要），窗口一多也不至于自己被 setTimeout 拖死
      if (nowMs() - lastYield > 16) {
        lastYield = nowMs();
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    trace('copy', {
      windows: wins.length, read: (read / MIB).toFixed(1) + 'MB',
      out: (w / MIB).toFixed(1) + 'MB', frames,
    });

    if (pcm) {
      let dataLen = 0;
      for (const p of pcmParts) dataLen += p.length;
      if (!dataLen) return null;
      const bits = pcm.bits === 8 ? 8 : 16;
      const rate = info.rate || 44100;
      return {
        blob: new Blob([wavHeader(dataLen, info.channels, rate, bits)].concat(pcmParts), { type: 'audio/wav' }),
        ext: 'wav', codec: 'PCM',
        rate, channels: info.channels,
        duration: info.duration || dataLen / (info.channels * bits / 8) / rate,
        frames: count,
      };
    }
    if (!w) return null;
    const rate = plan.cfg ? AAC_RATES[plan.cfg.fi] : info.rate;
    return {
      blob: new Blob([w === out.length ? out : out.subarray(0, w)],
        { type: isAac ? 'audio/aac' : 'audio/mpeg' }),
      ext: plan.kind,
      codec: isAac ? 'AAC' : 'MP3',
      rate,
      channels: plan.cfg ? plan.cfg.ch : info.channels,
      duration: info.duration || (plan.cfg ? frames * 1024 / (rate || 44100) : 0),
      frames,
    };
  }

  async function demuxMp4(file, opts) {
    const stage = (n, o) => { trace(n, o); if (opts && opts.onStage) opts.onStage(n, o); };
    const tops = await topBoxes(file);
    const moov = tops.find((b) => b.type === 'moov');
    if (!moov) return miss('找不到 moov 索引（文件不完整？）');
    const mlen = moov.end - moov.body;
    if (mlen <= 0 || mlen > 96 * MIB) return miss('moov 大小异常：' + mlen + ' 字节');
    stage('moov', { bytes: mlen });
    const u8 = await sliceU8(file, moov.body, moov.end);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const kids = boxesIn(u8, 0, u8.length);
    let why = '';

    for (const trak of kids.filter((b) => b.type === 'trak')) {
      const tk = boxesIn(u8, trak.body, trak.end);
      const mdia = tk.find((b) => b.type === 'mdia');
      if (!mdia) continue;
      const md = boxesIn(u8, mdia.body, mdia.end);
      const hdlr = md.find((b) => b.type === 'hdlr');
      if (!hdlr || hdlr.body + 12 > hdlr.end || fourcc(u8, hdlr.body + 8) !== 'soun') continue;

      const mdhd = md.find((b) => b.type === 'mdhd');
      let timescale = 0;
      let duration = 0;
      if (mdhd) {
        if (u8[mdhd.body] === 1) {
          timescale = dv.getUint32(mdhd.body + 20);
          duration = dv.getUint32(mdhd.body + 24) * 4294967296 + dv.getUint32(mdhd.body + 28);
        } else {
          timescale = dv.getUint32(mdhd.body + 12);
          duration = dv.getUint32(mdhd.body + 16);
        }
      }

      const minf = md.find((b) => b.type === 'minf');
      if (!minf) continue;
      const stbl = boxesIn(u8, minf.body, minf.end).find((b) => b.type === 'stbl');
      if (!stbl) continue;
      const sb = boxesIn(u8, stbl.body, stbl.end);
      const stsd = sb.find((b) => b.type === 'stsd');
      if (!stsd) continue;
      const ent = audioEntry(u8, dv, stsd);
      if (!ent) continue;

      let esds = ent.kids.find((b) => b.type === 'esds');
      if (!esds) {
        const wave = ent.kids.find((b) => b.type === 'wave');   // QuickTime 会把 esds 藏在 wave 里
        if (wave) esds = boxesIn(u8, wave.body, wave.end).find((b) => b.type === 'esds');
      }
      const info = esds ? parseEsds(u8, esds.body, esds.end) : null;
      const objType = info ? info.objType : -1;

      let plan = null;
      if (ent.fmt === '.mp3' || ent.fmt === 'mp3 ') {
        plan = { kind: 'mp3' };
      } else if (ent.fmt === 'mp4a') {
        plan = (objType === 0x69 || objType === 0x6b)
          ? { kind: 'mp3' }
          : { kind: 'aac', cfg: aacCfg(info && info.asc, ent) };
      } else {
        const pf = pcmFormat(ent);                     // MOV 里的未压缩 PCM
        if (pf) plan = { kind: 'pcm', pcm: pf };
      }
      if (!plan) {
        why = '音频编码 ' + ent.fmt + ' 不支持零重编码（只认 AAC / MP3 / PCM）';
        continue;
      }
      stage('codec', { fmt: ent.fmt, kind: plan.kind });

      let table = sampleTable(u8, dv, sb);
      if (table) stage('samples', { count: table.count, from: 'stbl' });
      if (!table) {                                     // 分片 MP4：索引在 moof 里
        table = await fragTable(file, tops, trackId(u8, dv, tk), opts);
        if (table) stage('samples', { count: table.count, from: 'moof' });
      }
      if (!table) { why = '样本表为空，也没有可用的 moof'; continue; }

      const out = await copyTrack(file, table, plan, {
        rate: Math.round(ent.rate || 0),
        channels: ent.channels || 2,
        duration: timescale ? duration / timescale : 0,
        opts,
      });
      if (!out) { why = '样本都在但搬不出来'; continue; }
      out.container = 'MP4/MOV';
      return out;
    }
    return miss(why || '没有音频轨');
  }

  // ------------------------------------------------------------ Matroska（WebM / MKV）的 Opus
  const EB = {
    HEADER: 0x1A45DFA3, SEGMENT: 0x18538067, INFO: 0x1549A966, TIMECODE_SCALE: 0x2AD7B1,
    DURATION: 0x4489, TRACKS: 0x1654AE6B, TRACK_ENTRY: 0xAE, TRACK_NUMBER: 0xD7,
    TRACK_TYPE: 0x83, CODEC_ID: 0x86, CODEC_PRIVATE: 0x63A2, CODEC_DELAY: 0x56AA,
    AUDIO: 0xE1, SAMPLING_FREQ: 0xB5, CHANNELS: 0x9F, CLUSTER: 0x1F43B675,
    TIMECODE: 0xE7, SIMPLE_BLOCK: 0xA3, BLOCK_GROUP: 0xA0, BLOCK: 0xA1,
    CUES: 0x1C53BB6B, TAGS: 0x1254C367, SEEKHEAD: 0x114D9B74,
  };

  // EBML 的 id / 长度都是「变长整数」，而且长度可能是「未知」（全 1）
  async function ebmlEl(r) {
    if (!(await r.ensure(2))) return null;
    const o = r.off;
    const b0 = r.buf[o];
    if (!b0) return null;
    let ilen = 1;
    let mask = 0x80;
    while (ilen <= 4 && !(b0 & mask)) { ilen++; mask >>= 1; }
    if (ilen > 4) return null;
    if (!(await r.ensure(ilen + 9)) && !(await r.ensure(ilen + 2))) return null;
    let id = 0;
    for (let i = 0; i < ilen; i++) id = id * 256 + r.buf[o + i];
    const s0 = r.buf[o + ilen];
    if (s0 === undefined) return null;
    let slen = 1;
    let smask = 0x80;
    while (slen <= 8 && !(s0 & smask)) { slen++; smask >>= 1; }
    if (slen > 8) return null;
    let unknown = true;
    let val = 0;
    for (let i = 0; i < slen; i++) {
      const raw = r.buf[o + ilen + i];
      if (raw === undefined) return null;
      const byte = i === 0 ? (s0 & (smask - 1)) : raw;
      if (byte !== (i === 0 ? smask - 1 : 0xff)) unknown = false;
      val = val * 256 + byte;
    }
    const start = r.pos + ilen + slen;
    r.seek(start);
    return { id, size: unknown ? -1 : val, start, end: unknown ? -1 : start + val };
  }

  async function ebmlUint(r, el) {
    if (el.size < 1 || el.size > 8) return null;
    r.seek(el.start);
    const d = await r.take(el.size);
    if (!d) return null;
    let v = 0;
    for (let i = 0; i < d.length; i++) v = v * 256 + d[i];
    return v;
  }

  async function ebmlFloat(r, el) {
    if (el.size !== 4 && el.size !== 8) return null;
    r.seek(el.start);
    const d = await r.take(el.size);
    if (!d) return null;
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    return el.size === 4 ? dv.getFloat32(0) : dv.getFloat64(0);
  }

  async function ebmlBytes(r, el, cap) {
    if (el.size < 0 || el.size > (cap || 8 * MIB)) return null;
    r.seek(el.start);
    return r.take(el.size);
  }

  const TEXT = new TextDecoder();

  async function parseTrackEntry(r, el) {
    const t = { number: 0, type: 0, codec: '', cpriv: null, delayNs: 0, rate: 0, channels: 0 };
    let p = el.start;
    while (p < el.end) {
      r.seek(p);
      const e = await ebmlEl(r);
      if (!e || e.end < 0) break;
      if (e.id === EB.TRACK_NUMBER) t.number = (await ebmlUint(r, e)) || 0;
      else if (e.id === EB.TRACK_TYPE) t.type = (await ebmlUint(r, e)) || 0;
      else if (e.id === EB.CODEC_ID) {
        const b = await ebmlBytes(r, e, 4096);
        t.codec = TEXT.decode(b || new Uint8Array(0)).replace(/\0+$/, '');
      } else if (e.id === EB.CODEC_PRIVATE) t.cpriv = await ebmlBytes(r, e, 64 * 1024);
      else if (e.id === EB.CODEC_DELAY) t.delayNs = (await ebmlUint(r, e)) || 0;
      else if (e.id === EB.AUDIO) {
        let q = e.start;
        while (q < e.end) {
          r.seek(q);
          const a = await ebmlEl(r);
          if (!a || a.end < 0) break;
          if (a.id === EB.SAMPLING_FREQ) t.rate = (await ebmlFloat(r, a)) || 0;
          else if (a.id === EB.CHANNELS) t.channels = (await ebmlUint(r, a)) || 0;
          q = a.end;
        }
      }
      p = e.end;
    }
    return t;
  }

  const OGG_CRC = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let r = (i << 24) >>> 0;
      for (let j = 0; j < 8; j++) r = ((r & 0x80000000) ? ((r << 1) ^ 0x04c11db7) : (r << 1)) >>> 0;
      t[i] = r >>> 0;
    }
    return t;
  })();

  function oggCrc(bytes) {
    let c = 0;
    for (let i = 0; i < bytes.length; i++) {
      c = (((c << 8) >>> 0) ^ OGG_CRC[((c >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
    }
    return c >>> 0;
  }

  function oggPage(type, granule, packets, serial, seq) {
    const lacing = [];
    let bodyLen = 0;
    for (const p of packets) {
      let n = p.length;
      while (n >= 255) { lacing.push(255); n -= 255; }
      lacing.push(n);
      bodyLen += p.length;
    }
    const out = new Uint8Array(27 + lacing.length + bodyLen);
    const dv = new DataView(out.buffer);
    out[0] = 0x4f; out[1] = 0x67; out[2] = 0x67; out[3] = 0x53;   // OggS
    out[4] = 0;
    out[5] = type;
    const g = granule < 0 ? 0 : granule;
    dv.setUint32(6, g >>> 0, true);
    dv.setUint32(10, Math.floor(g / 4294967296), true);
    dv.setUint32(14, serial >>> 0, true);
    dv.setUint32(18, seq >>> 0, true);
    dv.setUint32(22, 0, true);                        // CRC 先清零再算
    out[26] = lacing.length;
    out.set(Uint8Array.from(lacing), 27);
    let o = 27 + lacing.length;
    for (const p of packets) { out.set(p, o); o += p.length; }
    dv.setUint32(22, oggCrc(out), true);
    return out;
  }

  function opusHead(ch, preSkip, rate) {
    const b = new Uint8Array(19);
    b.set([0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], 0);   // OpusHead
    b[8] = 1;
    b[9] = ch;
    b[10] = preSkip & 0xff;
    b[11] = (preSkip >> 8) & 0xff;
    b[12] = rate & 0xff;
    b[13] = (rate >> 8) & 0xff;
    b[14] = (rate >> 16) & 0xff;
    b[15] = (rate >> 24) & 0xff;
    return b;
  }

  function opusTags(vendor) {
    const v = new TextEncoder().encode(vendor);
    const b = new Uint8Array(8 + 4 + v.length + 4);
    b.set([0x4f, 0x70, 0x75, 0x73, 0x54, 0x61, 0x67, 0x73], 0);   // OpusTags
    new DataView(b.buffer).setUint32(8, v.length, true);
    b.set(v, 12);
    return b;
  }

  // Block/SimpleBlock：轨道号(vint) + 相对时间(int16) + flags，flags 的 bit1~2 是 lacing
  function parseBlock(data) {
    if (!data || data.length < 4) return null;
    const b0 = data[0];
    let len = 1;
    let mask = 0x80;
    while (len <= 8 && !(b0 & mask)) { len++; mask >>= 1; }
    if (len > 8 || data.length < len + 3) return null;
    let track = b0 & (mask - 1);
    for (let i = 1; i < len; i++) track = track * 256 + data[i];
    let p = len;
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const rel = dv.getInt16(p);
    p += 2;
    const lacing = (data[p] >> 1) & 3;
    p += 1;
    const frames = [];
    if (!lacing) {
      frames.push(data.subarray(p));
    } else if (lacing === 1) {                        // Xiph
      const n = data[p++] + 1;
      const sizes = [];
      let total = 0;
      for (let i = 0; i < n - 1; i++) {
        let s = 0;
        let b;
        do { b = data[p++]; s += b; } while (b === 255 && p < data.length);
        sizes.push(s);
        total += s;
      }
      sizes.push(data.length - p - total);
      for (const s of sizes) { frames.push(data.subarray(p, p + s)); p += s; }
    } else if (lacing === 2) {                        // 定长
      const n = data[p++] + 1;
      const each = Math.floor((data.length - p) / n);
      for (let i = 0; i < n; i++) frames.push(data.subarray(p + i * each, p + (i + 1) * each));
    } else {
      return null;                                    // EBML lacing：音频里几乎见不到
    }
    return { track, rel, frames };
  }

  async function demuxMatroska(file, opts) {
    const stage = (n, o) => { trace(n, o); if (opts && opts.onStage) opts.onStage(n, o); };
    const r = new ByteReader(file);
    const head = await ebmlEl(r);
    if (!head || head.id !== EB.HEADER) return miss('不是 EBML（WebM/MKV）');
    r.seek(head.end >= 0 ? head.end : head.start);
    const seg = await ebmlEl(r);
    if (!seg || seg.id !== EB.SEGMENT) return miss('EBML 里找不到 Segment');
    const segEnd = seg.end >= 0 ? seg.end : -1;

    // 第一趟只找 Info / Tracks，碰到第一个 Cluster 就停 —— 头部很小，几乎不花时间
    let tracks = null;
    let scale = 1000000;
    let durUnits = 0;
    let firstCluster = -1;
    let p = seg.start;
    for (;;) {
      if ((segEnd > 0 && p >= segEnd) || p >= file.size) break;
      r.seek(p);
      const e = await ebmlEl(r);
      if (!e) break;
      if (e.id === EB.CLUSTER) { firstCluster = p; break; }
      if (e.id === EB.TRACKS && e.end > 0) {
        tracks = [];
        let q = e.start;
        while (q < e.end) {
          r.seek(q);
          const t = await ebmlEl(r);
          if (!t || t.end < 0) break;
          if (t.id === EB.TRACK_ENTRY) tracks.push(await parseTrackEntry(r, t));
          q = t.end;
        }
      } else if (e.id === EB.INFO && e.end > 0) {
        let q = e.start;
        while (q < e.end) {
          r.seek(q);
          const a = await ebmlEl(r);
          if (!a || a.end < 0) break;
          if (a.id === EB.TIMECODE_SCALE) scale = (await ebmlUint(r, a)) || scale;
          else if (a.id === EB.DURATION) durUnits = (await ebmlFloat(r, a)) || 0;
          q = a.end;
        }
      }
      p = e.end >= 0 ? e.end : e.start;
    }
    if (!tracks || firstCluster < 0) return miss('找不到 Tracks 或 Cluster');
    stage('tracks', { count: tracks.length, codecs: tracks.map((t) => t.codec).join(',') });
    // 只认「能原样搬」的音轨：Opus → Ogg，AAC → ADTS 头。Vorbis/AC-3/DTS 没有现成裸流封装，交给兜底
    const track = tracks.find((t) => t.type === 2 && (t.codec === 'A_OPUS' || t.codec === 'A_AAC'));
    if (!track || !track.number) {
      const audio = tracks.filter((t) => t.type === 2).map((t) => t.codec);
      return miss('音轨编码 ' + (audio.join(',') || '未知') + ' 不支持零重编码（只认 Opus / AAC）');
    }

    const isOpus = track.codec === 'A_OPUS';
    const ch = Math.max(1, Math.min(track.channels || 2, 8));
    const rate = Math.round(track.rate || (isOpus ? 48000 : 44100));
    // MKV 里 AAC 的 CodecPrivate 就是 AudioSpecificConfig，正好能填 ADTS 头
    const cfg = isOpus ? null : aacCfg(track.cpriv, { channels: ch, rate });

    const parts = [];
    let packets = 0;
    const durationMs = durUnits * scale / 1e6;

    // Opus 要封 Ogg 页，AAC 一帧一个 ADTS 头
    const preSkip = isOpus ? Math.max(0, Math.round((track.delayNs || 0) * 48000 / 1e9)) : 0;
    let seq = 0;
    let pend = [];
    let pendBytes = 0;
    let pageGranule = 0;
    let lastGranule = 0;
    const push = (type, granule, pkts) => parts.push(oggPage(type, granule, pkts, 0x2f2f6c70, seq++));
    const flush = (eos) => {
      if (!pend.length) return;
      push(eos ? 0x04 : 0x00, pageGranule, pend);
      pend = [];
      pendBytes = 0;
    };
    if (isOpus) {
      push(0x02, 0, [opusHead(ch, preSkip, rate)]);
      push(0x00, 0, [opusTags('toaudio.js')]);
    }

    const addFrame = (tsMs, data) => {
      if (!data.length) return;
      if (!isOpus) {
        if (data.length + 7 > 0x1fff) return;         // 超过 ADTS 13 位帧长的怪帧
        packets++;
        parts.push(adtsHeader(data.length, cfg));
        parts.push(data);
        return;
      }
      packets++;
      pend.push(data);
      pendBytes += data.length;
      // granulepos 按 48kHz 采样数算，时间轴用的是 Cluster 里的毫秒时间戳
      const g = preSkip + Math.max(0, Math.round(tsMs * 48));
      if (g > lastGranule) lastGranule = g;
      if (g > pageGranule) pageGranule = g;
      if (pend.length >= 96 || pendBytes >= 96 * 1024) {
        flush(false);
        pageGranule = lastGranule;
      }
    };

    // 第二趟顺着 Cluster 走，只搬音频轨的包
    let cp = firstCluster;
    let guard = 0;
    while (cp >= 0 && (segEnd < 0 || cp < segEnd) && cp < file.size && guard++ < 200000) {
      bail(opts && opts.signal);
      r.seek(cp);
      const cl = await ebmlEl(r);
      if (!cl || cl.id !== EB.CLUSTER) break;
      const clEnd = cl.end;
      let q = cl.start;
      let clusterTs = 0;
      for (;;) {
        if (clEnd > 0 ? q >= clEnd : q >= file.size) break;
        r.seek(q);
        const e = await ebmlEl(r);
        if (!e) break;
        // 未知长度的 Cluster：见到下一个 Cluster/顶层元素就收手
        if (clEnd < 0 && (e.id === EB.CLUSTER || e.id === EB.TRACKS || e.id === EB.CUES ||
                          e.id === EB.TAGS || e.id === EB.SEEKHEAD)) break;
        if (e.id === EB.TIMECODE) clusterTs = (await ebmlUint(r, e)) || 0;
        else if (e.id === EB.SIMPLE_BLOCK) {
          const b = parseBlock(await ebmlBytes(r, e, 8 * MIB));
          if (b && b.track === track.number) for (const fr of b.frames) addFrame(clusterTs + b.rel, fr);
        } else if (e.id === EB.BLOCK_GROUP && e.end > 0) {
          let z = e.start;
          while (z < e.end) {
            r.seek(z);
            const g = await ebmlEl(r);
            if (!g || g.end < 0) break;
            if (g.id === EB.BLOCK) {
              const b = parseBlock(await ebmlBytes(r, g, 8 * MIB));
              if (b && b.track === track.number) for (const fr of b.frames) addFrame(clusterTs + b.rel, fr);
            }
            z = g.end;
          }
        }
        if (e.end >= 0 && e.end <= e.start) break;
        q = e.end >= 0 ? e.end : e.start;
      }
      cp = clEnd < 0 ? (q > cp ? q : cp + 1) : clEnd;
      if (opts && opts.onProgress) opts.onProgress(Math.min(1, cp / file.size));
    }

    if (isOpus) flush(true);
    if (!packets) return miss('Cluster 里没找到音频包');
    stage('packets', { count: packets });

    const rateOut = isOpus ? rate : (cfg ? AAC_RATES[cfg.fi] : rate);
    return {
      blob: new Blob(parts, { type: isOpus ? 'audio/ogg' : 'audio/aac' }),
      ext: isOpus ? 'opus' : 'aac',
      codec: isOpus ? 'Opus' : 'AAC',
      container: 'WebM/MKV',
      rate: rateOut,
      channels: isOpus ? ch : (cfg ? cfg.ch : ch),
      duration: durationMs ? durationMs / 1000
        : isOpus ? Math.max(0, lastGranule - preSkip) / 48000
        : packets * 1024 / (rateOut || 44100),
      frames: packets,
    };
  }

  // ------------------------------------------------------------ 入口
  const ISO_EXT = /\.(mp4|m4v|mov|qt|3gp|3g2|f4v|m4a|m4b)$/i;
  const MKV_EXT = /\.(webm|mkv|mka)$/i;

  // ------------------------------------------------------------ 格式识别
  // 后缀和 MIME 都可能骗人（改名、转存、服务器给错 content-type），所以**先看文件头**，
  // 名字只用来决定「先试哪个」，认不出来也会两个都试（不匹配时只读几十字节就返回 null）：
  //   1A 45 DF A3                     → Matroska / WebM
  //   第 5~8 字节是可打印 4CC、长度合理 → ISOBMFF（MP4 / MOV / M4V / 3GP …）
  // 真正认下来的是各自的解复用器：ISOBMFF 必须走通 ftyp→moov→trak→stbl，
  // Matroska 必须 EBML Header + Segment→Tracks 都能解析，光看魔数不会误判。
  async function sniff(file) {
    if (!file || typeof file.slice !== 'function' || !file.size) return '';
    const head = await sliceU8(file, 0, 16);
    if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return 'mkv';
    if (head.length >= 8) {
      const dv = new DataView(head.buffer, head.byteOffset, head.byteLength);
      const size = dv.getUint32(0);
      if (/^[\x20-\x7e]{4}$/.test(fourcc(head, 4))) {
        if (size === 1) { if (head.length >= 16) return 'iso'; }
        else if (size === 0 || (size >= 8 && size <= file.size)) return 'iso';
      }
    }
    return '';
  }

  // 名字/MIME 这一层的猜测，只影响尝试顺序
  function namedFns(file) {
    const name = (file && file.name) || '';
    const type = (file && file.type) || '';
    const fns = [];
    if (ISO_EXT.test(name) || /mp4|quicktime|3gpp/i.test(type)) fns.push(demuxMp4);
    if (MKV_EXT.test(name) || /webm|matroska/i.test(type)) fns.push(demuxMatroska);
    return fns;
  }

  /**
   * 抽出视频里的音轨（零重编码）。
   * 格式以二进制嗅探为准，后缀/MIME 只用来排尝试顺序；都不匹配也照样试一遍。
   * @param {File|Blob} file
   * @param {{onProgress?: (ratio: number) => void, signal?: AbortSignal}} [opts]
   * @returns {Promise<null | {blob: Blob, ext: string, codec: string, container: string,
   *   rate: number, channels: number, duration: number, frames: number}>}
   */
  async function toAudio(file, opts) {
    if (!file || typeof file.slice !== 'function') throw new TypeError('toAudio(file)：需要一个 File 或 Blob');
    opts = opts || {};
    misses = [];
    T0 = nowMs();                                   // 每次抽轨从 0 开始算耗时
    const stage = (n, o) => { trace(n, o); if (opts.onStage) opts.onStage(n, o); };
    const magic = await sniff(file);
    stage('sniff', { magic: magic || '(none)', name: (file.name || ''), size: file.size });
    const order = [];
    const add = (fn) => { if (!order.includes(fn)) order.push(fn); };
    if (magic === 'iso') add(demuxMp4);
    else if (magic === 'mkv') add(demuxMatroska);
    namedFns(file).forEach(add);
    add(demuxMp4);
    add(demuxMatroska);
    for (const fn of order) {
      bail(opts.signal);
      const r = await fn(file, opts);
      if (r) return r;
    }
    const reason = misses.length ? misses.join('；') : '既不是 ISOBMFF 也不是 Matroska，认不出封装';
    stage('miss', { reason });
    return null;
  }

  toAudio.extract = toAudio;
  toAudio.sniff = sniff;                            // 'iso' | 'mkv' | ''（只看文件头）
  toAudio.canHandle = (file) => namedFns(file).length > 0;   // 只看名字/MIME，快速判断
  toAudio.reason = () => misses.join('；');          // 上一次返回 null 的过程原因（人话）
  toAudio.isoExt = ISO_EXT;
  toAudio.mkvExt = MKV_EXT;
  toAudio.version = '1.3.0';


  return toAudio;
});
