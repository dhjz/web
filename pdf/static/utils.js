/* 工具集合：原 core.js / image-encode.js / compress-compat.js / image-extract.js 合并 */
(function () {
  const G = (window.myComponents = window.myComponents || {});
  const PDFLib = window.PDFLib;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pdf:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('pdf:' + k, JSON.stringify(v)); } catch (e) {} },
  };
  function toast(msg) {
    const box = document.getElementById('toasts'); if (!box) return;
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    box.appendChild(el); setTimeout(() => el.remove(), 2800);
  }
  G.toast = toast;
  const errMsg = (e) => (e && e.message) || String(e || '处理失败');
  async function readFile(file) { return new Uint8Array(await file.arrayBuffer()); }
  function dataUrlToBytesLocal(dataUrl) {
    const bin = atob(dataUrl.split(',')[1] || '');
    return Uint8Array.from(bin, ch => ch.charCodeAt(0));
  }
  async function readHttpPdf(url) {
    if (!url || !String(url).trim()) throw new Error('请输入 PDF 的 HTTP(S) 地址');
    const res = await fetch(String(url).trim(), { credentials: 'omit' });
    if (!res.ok) throw new Error('HTTP ' + res.status + (res.statusText ? ' ' + res.statusText : ''));
    const buf = await res.arrayBuffer();
    if (!buf || !buf.byteLength) throw new Error('HTTP 返回内容为空');
    const bytes = new Uint8Array(buf);
    const head = String.fromCharCode(...bytes.slice(0, 5));
    if (head !== '%PDF-') throw new Error('HTTP 返回的不是 PDF 文件');
    return bytes;
  }
  async function fileToDataUrl(file) { return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); }); }
  function download(data, name, mime) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function loadPdf(bytes) { return PDFLib.PDFDocument.load(bytes, { throwOnInvalidObject: false }); }
  let cjkFontPromise = null;
  async function cjkFont(doc) {
    if (!cjkFontPromise) {
      if (!window.fontkit) throw new Error('中文字体引擎未加载');
      cjkFontPromise = fetch('./static/fonts/AlibabaPuHuiTi.ttf')
        .then((res) => { if (!res.ok) throw new Error('中文字体加载失败：HTTP ' + res.status); return res.arrayBuffer(); });
    }
    let bytes;
    try {
      bytes = await cjkFontPromise;
      doc.registerFontkit(window.fontkit);
      return await doc.embedFont(bytes, { subset: true });
    } catch (e) {
      cjkFontPromise = null;
      throw e;
    }
  }
  function supportsCustomFont(font, text) {
    try {
      for (const ch of String(text || '')) font.encodeText(ch);
      return true;
    } catch (e) { return false; }
  }
  async function textFont(doc, text, standard) {
    const base = await doc.embedFont(standard || PDFLib.StandardFonts.Helvetica);
    if (!/[^\x00-\xff]/.test(String(text || ''))) return base;
    try {
      const cjk = await cjkFont(doc);
      return supportsCustomFont(cjk, text) ? cjk : base;
    } catch (e) { return base; }
  }
  async function getPageCount(bytes) {
    try { return (await PDFLib.PDFDocument.load(bytes, { throwOnInvalidObject:false })).getPageCount(); }
    catch (e) { return null; }
  }
  function parseRange(input, n) {
    const out = [];
    String(input || '').split(/[,，\s]+/).filter(Boolean).forEach((rawPart) => {
      const part = rawPart.toLowerCase();
      if (!Number.isFinite(n) || n <= 0) return;
      if (part === 'all' || part === '全部' || part === '所有') {
        for (let i = 1; i <= n; i++) out.push(i);
        return;
      }
      if (part === 'odd' || part === 'even' || part === '奇数页' || part === '偶数页') {
        const wantOdd = part === 'odd' || part === '奇数页';
        for (let i = 1; i <= n; i++) if ((i % 2 === 1) === wantOdd) out.push(i);
        return;
      }
      const m = part.match(/^(\d+)\s*[-~]\s*(\d+)$/);
      if (m) { for (let i = Math.max(1, +m[1]); i <= Math.min(n, +m[2]); i++) out.push(i); }
      else if (/^\d+$/.test(part)) { const p = +part; if (p >= 1 && p <= n) out.push(p); }
    });
    return [...new Set(out)].sort((a, b) => a - b);
  }
  // 按中英文分号拆分为多组页码范围；无分号时返回 null，保持原有拆分行为。
  // 每组仍使用 parseRange 解析，因此逗号/空格分隔、连续范围及 odd/even/all 写法都兼容。
  function parseRangeGroups(input, n) {
    const raw = String(input || '');
    if (!/[;；]/.test(raw)) return null;
    const parts = raw.split(/[;；]/).map(part => part.trim());
    const groups = parts.map(part => parseRange(part, n));
    if (groups.some(g => !g.length)) throw new Error('分号分隔的每组页码范围都需要至少匹配一页：' + raw);
    return groups;
  }
  function parsePartialOrder(input, n) {
    const out = [];
    const tokens = String(input || '').trim().split(/[,，\s]+/).filter(Boolean);
    if (!tokens.length) return null;
    for (const token of tokens) {
      const num = Number(token);
      if (!Number.isInteger(num) || num < 1 || num > n) throw new Error('页码必须是 1 到 ' + n + ' 之间的整数：' + token);
      out.push(num - 1);
    }
    if (new Set(out).size !== out.length) throw new Error('重排页码不能重复');
    const min = Math.min(...out), max = Math.max(...out);
    if (max - min + 1 !== out.length) throw new Error('填写的页码必须连续，不能漏页：' + Array.from({length:n},(_,i)=>i+1).join(',') + ' 中 ' + (min+1) + '-' + (max+1) + ' 之间不能缺页');
    const order = Array.from({ length:n }, (_, i) => i);
    out.forEach((page, i) => { order[min + i] = page; });
    return order;
  }
  function parseOrder(input, n) {
    const out = [];
    String(input || '').split(/[,，\s]+/).filter(Boolean).forEach((part) => {
      const num = Number(part);
      if (Number.isInteger(num) && num >= 1 && num <= n) out.push(num - 1);
    });
    if (out.length !== n || new Set(out).size !== n) {
      throw new Error('页面顺序需要包含全部 '+n+' 页且不重复，例如：'+Array.from({length:n},(_,i)=>i+1).join(','));
    }
    return out;
  }

  const LOCAL_CMAP_URL = './cmaps/';
  const CDN_CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/cmaps/';
  const CMAP_PROBE_FILE = '78-EUC-H.bcmap';
  let cMapUrlPromise = null;
  async function getPdfCMapUrl() {
    if (!cMapUrlPromise) {
      cMapUrlPromise = (async () => {
        try {
          const res = await fetch(LOCAL_CMAP_URL + CMAP_PROBE_FILE, { credentials: 'omit' });
          const type = (res.headers.get('content-type') || '').toLowerCase();
          if (res.ok && !type.includes('text/html')) return LOCAL_CMAP_URL;
        } catch (e) { /* 本地 CMap 不可用时回退 CDN */ }
        return CDN_CMAP_URL;
      })().catch((e) => {
        cMapUrlPromise = null;
        throw e;
      });
    }
    return cMapUrlPromise;
  }

  async function renderPages(bytes, scale, password, opts) {
    const pdfjs = await import('./pdfjs.js');
    pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
    const pdf = await pdfjs.getDocument({ data: bytes.slice(), cMapUrl: await getPdfCMapUrl(), cMapPacked: true, useSystemFonts: true, disableFontFace: true, isEvalSupported: false, password: password || undefined }).promise;
    const out = [];
    const onPage = opts && typeof opts.onPage === 'function' ? opts.onPage : null;
    const list = (opts && opts.pages && opts.pages.length) ? opts.pages : Array.from({length:pdf.numPages},(_,i)=>i+1);
    for (const i of list) {
      // 每页之前让出主线程，让进度条和界面有机会重绘，避免多页任务把页面卡死。
      await new Promise(resolve => setTimeout(resolve, 0));
      const page = await pdf.getPage(i);
      const baseVp = page.getViewport({ scale: 1 });
      const targetDpi = opts && Number(opts.targetDpi);
      const targetMax = opts && Number(opts.maxDim);
      const baseScale = scale || 1.5;
      let renderScale = baseScale;
      if (Number.isFinite(targetDpi) && targetDpi > 0) {
        renderScale = targetDpi / 72;
        log('栅格化页面尺寸', {
          page: i,
          originalPt: Math.round(baseVp.width) + 'x' + Math.round(baseVp.height),
          targetDpi: targetDpi,
          renderScale: Number(renderScale.toFixed(4)),
          outputPx: Math.round(baseVp.width * renderScale) + 'x' + Math.round(baseVp.height * renderScale)
        });
      } else if (Number.isFinite(targetMax) && targetMax > 0) {
        const longest = Math.max(baseVp.width, baseVp.height);
        renderScale = Math.min(baseScale, targetMax / longest);
        log('栅格化页面尺寸', {
          page: i,
          originalPt: Math.round(baseVp.width) + 'x' + Math.round(baseVp.height),
          maxDim: targetMax,
          baseScale: baseScale,
          renderScale: Number(renderScale.toFixed(4)),
          outputPx: Math.round(baseVp.width * renderScale) + 'x' + Math.round(baseVp.height * renderScale),
          capped: targetMax < longest
        });
      }
      const vp = page.getViewport({ scale: renderScale });
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      c._pdfWidth = baseVp.width; c._pdfHeight = baseVp.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      if (onPage) {
        await onPage(c, i, list.length);
        // 流式消费后立刻释放像素缓冲，避免几十页 canvas 同时占用内存。
        c.width = 0; c.height = 0;
      } else {
        out.push(c);
      }
    }
    return out;
  }
  function resizeCanvasToWidth(canvas, targetWidth) {
    const width = Math.floor(Number(targetWidth));
    if (!Number.isFinite(width) || width <= 0 || !canvas || !canvas.width || width === canvas.width) return canvas;
    const height = Math.max(1, Math.round(canvas.height * width / canvas.width));
    const scaled = document.createElement('canvas');
    scaled.width = width; scaled.height = height;
    const ctx = scaled.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, width, height);
    return scaled;
  }
  async function canvasToBytes(canvas, format, opts) {
    const mime = format==='png' ? 'image/png' : 'image/jpeg';
    const quality = Math.max(0.01, Math.min(1, Number(opts && opts.quality) || 0.8));
    if (format!=='png' && opts && opts.useJsquash) {
      try {
        const bytes = await encodeJpegOffThread(canvas, quality, 'jsquash');
        if (bytes && bytes.length) return bytes;
      } catch (e) { /* 回退逻辑已在 encodeJpegOffThread 内 */ }
    }
    if (format==='png' && opts && opts.upng) {
      try {
        const bytes = await encodePngOffThread(canvas);
        if (bytes && bytes.length) return bytes;
      } catch (e) { /* UPNG 不可用时退回 Canvas */ }
    }
    if (canvas.toBlob) {
      const blob = await new Promise(res => canvas.toBlob(res, mime, format==='png' ? undefined : quality));
      if (blob) return new Uint8Array(await blob.arrayBuffer());
    }
    const data = canvas.toDataURL(mime, format==='png' ? undefined : quality);
    const bin = atob(data.split(',')[1] || '');
    return Uint8Array.from(bin, ch => ch.charCodeAt(0));
  }
  async function extractText(bytes, password) {
    const pdfjs = await import('./pdfjs.js');
    pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
    const pdf = await pdfjs.getDocument({ data: bytes.slice(), cMapUrl: await getPdfCMapUrl(), cMapPacked: true, useSystemFonts: true, password: password || undefined }).promise;
    const parts = [];
    for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const c = await p.getTextContent(); parts.push('--- 第 ' + i + ' 页 ---\n' + c.items.map((x) => x.str).join(' ')); }
    return parts.join('\n\n');
  }

  const TOOLS = [
    { name: 'merge', title: '合并 PDF', desc: '将多个 PDF 合并为一个文档', icon: '📚', cat: 'Edit' },
    { name: 'split', title: '拆分 PDF', desc: '提取指定页面或页码范围', icon: '✂️', cat: 'Edit' },
    { name: 'compress', title: '压缩 PDF', desc: '压缩文件体积便于分享', icon: '⚡', cat: 'Optimize' },
    { name: 'protect', title: '加密 PDF', desc: '使用密码保护文档', icon: '🔒', cat: 'Secure' },
    { name: 'unlock', title: '解除密码', desc: '移除 PDF 密码', icon: '🔓', cat: 'Secure' },
    { name: 'rotate', title: '旋转 PDF', desc: '永久修正页面方向', icon: '🔄', cat: 'Edit' },
    { name: 'rearrange', title: '重排 PDF', desc: '调整页面顺序，可只重排连续区间', icon: '↔️', cat: 'Edit' },
    { name: 'add-blank', title: '插入空白页', desc: '在开头、结尾或指定页后插入空白页', icon: '➕', cat: 'Edit' },
    { name: 'delete-pages', title: '删除页面', desc: '按页码范围删除指定页面', icon: '🗑️', cat: 'Edit' },
    { name: 'page-numbers', title: '添加页码', desc: '自动添加页码', icon: '#️⃣', cat: 'Edit' },
    { name: 'watermark', title: '水印', desc: '添加文字水印', icon: '💧', cat: 'Edit' },
    { name: 'metadata', title: '元数据', desc: '编辑文档属性', icon: '🏷️', cat: 'Secure' },
    { name: 'signature', title: '签名', desc: '添加电子签名', icon: '✍️', cat: 'Edit' },
    { name: 'grayscale', title: '灰度转换', desc: '转为黑白页面', icon: '🎨', cat: 'Optimize' },
    { name: 'pdf-to-image', title: 'PDF 转图片', desc: '导出 JPG / PNG', icon: '🖼️', cat: 'Convert' },
    { name: 'image-to-pdf', title: '图片转 PDF', desc: '将图片合成 PDF', icon: '📷', cat: 'Convert' },
    { name: 'extract-images', title: '提取图片', desc: '提取 PDF 内嵌图片', icon: '🖼️', cat: 'Convert' },
    { name: 'pdf-to-text', title: 'PDF 转文字', desc: '提取文档纯文本', icon: '📄', cat: 'Convert' },
    { name: 'repair', title: '修复 PDF', desc: '尝试修复损坏文档', icon: '🔧', cat: 'Optimize' },
  ];
  window.PdfCore = { store, toast, errMsg, readFile, readHttpPdf, fileToDataUrl, download, loadPdf, cjkFont, textFont, getPageCount, parseRange, parseRangeGroups, parseOrder, parsePartialOrder, renderPages, resizeCanvasToWidth, canvasToBytes, extractText, TOOLS, PDFLib };

  // UPNG needs pako.deflate; without it the encoder would silently fall back to Canvas.
  function upngReady() { return !!(window.UPNG && window.UPNG.encode && window.pako && window.pako.deflate); }
  async function encodePngWithUPNG(rgba, width, height) {
    if (!upngReady()) return null;
    try {
      const copy = new Uint8Array(rgba.byteLength); copy.set(rgba);
      return new Uint8Array(window.UPNG.encode([copy.buffer], width, height, 0));
    } catch (e) { return null; }
  }
  window.ImageEncode = { encodePngWithUPNG };

  // 同步 JPEG/PNG 编码改到 Worker，避免 MozJPEG wasm / UPNG 长时间独占主线程。
  // Worker 不可用时退回原有主线程编码，保证功能可用。
  let imageEncoderWorker = null;
  let imageEncoderFailed = false;
  let imageEncoderSeq = 0;
  const imageEncoderJobs = new Map();
  function getImageEncoderWorker() {
    if (imageEncoderFailed) return null;
    if (!imageEncoderWorker) {
      try {
        imageEncoderWorker = new Worker('./static/image-encoder.worker.js', { type: 'module' });
        imageEncoderWorker.onmessage = (event) => {
          const msg = event.data || {};
          const job = imageEncoderJobs.get(msg.id);
          if (!job) return;
          imageEncoderJobs.delete(msg.id);
          if (msg.ok) job.resolve(new Uint8Array(msg.buffer));
          else job.reject(new Error(msg.error || '图片编码失败'));
        };
        imageEncoderWorker.onerror = () => {
          imageEncoderFailed = true;
          imageEncoderWorker = null;
          imageEncoderJobs.forEach(job => job.reject(new Error('图片编码 Worker 不可用')));
          imageEncoderJobs.clear();
        };
      } catch (e) {
        imageEncoderFailed = true;
        return null;
      }
    }
    return imageEncoderWorker;
  }
  function encodeInWorker(type, pixels, width, height, options) {
    const worker = getImageEncoderWorker();
    if (!worker) return Promise.reject(new Error('图片编码 Worker 不可用'));
    return new Promise((resolve, reject) => {
      const id = ++imageEncoderSeq;
      imageEncoderJobs.set(id, { resolve, reject });
      // 像素缓冲转交给 Worker，主线程不再持有这份副本。
      worker.postMessage({ id, type, width, height, buffer: pixels.buffer, options }, [pixels.buffer]);
    });
  }
  async function encodeJpegOffThread(canvas, quality, encoder) {
    const q = clamp(quality, 0.01, 1, 0.65);
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const options = { quality: Math.round(q * 100), progressive: true, optimize_coding: true, chroma_subsample: 0 };
    try {
      return await encodeInWorker('jpeg', pixels, canvas.width, canvas.height, options);
    } catch (e) {
      log('Worker JPEG 编码不可用，回退主线程', e);
      return encodeJpeg(canvas, quality, encoder, () => ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  }
  async function encodePngOffThread(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    try {
      return await encodeInWorker('png', pixels, canvas.width, canvas.height, null);
    } catch (e) {
      log('Worker PNG 编码不可用，回退主线程', e);
      // pixels.buffer 已转交 Worker，失败后需重新读取画布像素。
      const retry = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return encodePngWithUPNG(retry, canvas.width, canvas.height);
    }
  }


  const C = window.PdfCore;

  const clamp = (v, min, max, fallback) => Math.max(min, Math.min(max, Number(v) || fallback));
  const dataUrlToBytes = (url) => {
    const bin = atob(url.split(',')[1] || '');
    return Uint8Array.from(bin, ch => ch.charCodeAt(0));
  };

  const jsquashLoaders = {
    jpeg: () => import('./jsquash/jpeg-encode.js'),
  };
  const jsquashModules = {};
  const jsquashPromises = {};
  async function loadJsquash(name) {
    if (Object.prototype.hasOwnProperty.call(jsquashModules, name)) return jsquashModules[name];
    if (!jsquashPromises[name]) {
      jsquashPromises[name] = jsquashLoaders[name]().then((mod) => {
        jsquashModules[name] = mod.default || mod;
        return jsquashModules[name];
      }).catch((e) => {
        delete jsquashPromises[name];
        throw e;
      });
    }
    return jsquashPromises[name];
  }
  async function encodeJpeg(canvas, quality, encoder, getImageData) {
    const q = clamp(quality, 0.01, 1, 0.65);
    let canvasBytes = null;
    if (encoder !== 'jsquash') canvasBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', q));
    if (encoder === 'canvas') return canvasBytes;
    try {
      const encodeMozJpeg = await loadJsquash('jpeg');
      const img = getImageData
        ? getImageData(0, 0, canvas.width, canvas.height)
        : canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const encoded = await encodeMozJpeg(img, {
        quality: Math.round(q * 100), progressive: true, optimize_coding: true, chroma_subsample: 0
      });
      const candidate = encoded instanceof Uint8Array ? encoded : new Uint8Array(encoded);
      if (!canvasBytes || candidate.length < canvasBytes.length) return candidate;
    } catch (e) { log('jSquash JPEG 不可用，使用 Canvas 结果', e); }
    if (encoder === 'jsquash' && !canvasBytes) canvasBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', q));
    return canvasBytes;
  }

  async function rasterize(bytes, quality, encoder, tick, targetDpi) {
    const t0 = performance.now();
    log('栅格化开始', { targetDpi, quality, encoder });
    const out = await PDFLib.PDFDocument.create();
    const stats = { photos: 0, shrunk: 0, totalImages: 0, compressedImages: 0, reducedBytes: 0 };
    // 逐页渲染并立即编码入 PDF，不缓存全部 canvas，避免多页时主线程和内存被长时间占用。
    await C.renderPages(bytes, 1, undefined, {
      targetDpi,
      onPage: async (canvas, pageNo, pageTotal) => {
        stats.photos++; stats.totalImages++;
        const jpg = encoder === 'jsquash'
          ? await encodeJpegOffThread(canvas, quality, encoder)
          : await encodeJpeg(canvas, quality, encoder, () => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
        log('栅格化第' + pageNo + '页', {
          rendered: canvas.width + 'x' + canvas.height,
          encoded: canvas.width + 'x' + canvas.height,
          jpegBytes: jpg ? jpg.byteLength : 0
        });
        if (jpg && jpg.byteLength) { stats.shrunk++; stats.compressedImages++; stats.reducedBytes += Math.max(0, canvas.width * canvas.height * 3 - jpg.byteLength); }
        const img = await out.embedJpg(jpg);
        const pageW = Number(canvas._pdfWidth) || canvas.width;
        const pageH = Number(canvas._pdfHeight) || canvas.height;
        const page = out.addPage([pageW, pageH]);
        page.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
        tick(0.1 + 0.7 * stats.photos / (pageTotal || 1));
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    });
    log('栅格化完成', { pages: stats.photos, ms: Math.round(performance.now() - t0), stats });
    return { bytes: await out.save({ useObjectStreams: true }), stats };
  }

  const log = (...args) => console.log('[PDF压缩]', ...args);

  function ascii85Decode(bytes) {
    const out = [];
    let tuple = 0, count = 0;
    for (let i = 0; i < bytes.length; i++) {
      const c = bytes[i];
      if (c === 0x7e) break;
      if (c <= 0x20) continue;
      if (c === 0x7a) { out.push(0, 0, 0, 0); continue; }
      if (c < 0x21 || c > 0x75) continue;
      tuple = tuple * 85 + (c - 0x21);
      if (++count === 5) {
        out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
        tuple = 0; count = 0;
      }
    }
    if (count > 1) {
      for (let i = count; i < 5; i++) tuple = tuple * 85 + 84;
      const tail = [(tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255];
      for (let i = 0; i < count - 1; i++) out.push(tail[i]);
    }
    return Uint8Array.from(out);
  }

  function paethPredictor(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : (pb <= pc ? b : c);
  }

  function undoPngPredictor(data, width, height, colors, bpc, predictor) {
    const rowBytes = Math.ceil(width * colors * bpc / 8);
    const stride = rowBytes + 1;
    if (data.byteLength < stride * height) return null;
    const out = new Uint8Array(rowBytes * height);
    let pos = 0;
    for (let y = 0; y < height; y++) {
      const ft = data[pos++];
      for (let x = 0; x < rowBytes; x++) {
        const raw = data[pos + x];
        const left = x >= colors ? out[y * rowBytes + x - colors] : 0;
        const above = y > 0 ? out[(y - 1) * rowBytes + x] : 0;
        const upperLeft = (y > 0 && x >= colors) ? out[(y - 1) * rowBytes + x - colors] : 0;
        let v = raw;
        if (ft === 1) v = raw + left;
        else if (ft === 2) v = raw + above;
        else if (ft === 3) v = raw + ((left + above) >> 1);
        else if (ft === 4) v = raw + paethPredictor(left, above, upperLeft);
        out[y * rowBytes + x] = v & 255;
      }
      pos += rowBytes;
    }
    return out;
  }

  function decodeRawFlatePixels(obj, dict, width, height) {
    const contents = obj.getContents();
    const filter = dict.lookup(PDFLib.PDFName.of('Filter'));
    const filterStr = filter ? filter.toString() : '';
    if (!contents || !window.pako || !window.pako.inflate || !filterStr.includes('FlateDecode')) return null;
    let bytes = contents;
    if (filterStr.includes('ASCII85Decode')) bytes = ascii85Decode(bytes);
    let inflated;
    try { inflated = window.pako.inflate(bytes); } catch (e) { log('Flate 解压失败', e); return null; }
    const bpcObj = dict.lookup(PDFLib.PDFName.of('BitsPerComponent'));
    const bpc = bpcObj ? Number(bpcObj.toString()) : 8;
    if (bpc !== 8) return null;
    const csObj = dict.lookup(PDFLib.PDFName.of('ColorSpace'));
    const cs = csObj ? csObj.toString() : '/DeviceRGB';
    const colors = cs.includes('Gray') ? 1 : (cs.includes('CMYK') ? 4 : 3);
    const dp = dict.lookup(PDFLib.PDFName.of('DecodeParms'));
    let predictor = 0;
    if (dp instanceof PDFLib.PDFDict) predictor = Number(dp.lookup(PDFLib.PDFName.of('Predictor')) || 0);
    else if (dp instanceof PDFLib.PDFArray && dp.size()) {
      const first = dp.lookup(0);
      if (first instanceof PDFLib.PDFDict) predictor = Number(first.lookup(PDFLib.PDFName.of('Predictor')) || 0);
    }
    let pixels = inflated;
    if (predictor >= 10 && predictor <= 15) {
      pixels = undoPngPredictor(inflated, width, height, colors, bpc, predictor);
    } else if (predictor === 2) {
      const rowBytes = width * colors;
      if (inflated.byteLength < rowBytes * height) return null;
      pixels = inflated.slice();
      for (let y = 0; y < height; y++) {
        const base = y * rowBytes;
        for (let x = colors; x < rowBytes; x++) pixels[base + x] = (pixels[base + x] + pixels[base + x - colors]) & 255;
      }
    }
    const needed = width * height * colors;
    if (!pixels || pixels.byteLength < needed) { log('原始像素长度不足', pixels && pixels.byteLength, '需要', needed); return null; }
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0, p = 0, d = 0; i < width * height; i++, p += colors, d += 4) {
      if (colors === 1) { const v = pixels[p]; rgba[d] = v; rgba[d + 1] = v; rgba[d + 2] = v; }
      else if (colors === 3) { rgba[d] = pixels[p]; rgba[d + 1] = pixels[p + 1]; rgba[d + 2] = pixels[p + 2]; }
      else {
        const c = pixels[p], m = pixels[p + 1], y2 = pixels[p + 2], k = pixels[p + 3];
        rgba[d] = ((255 - c) * (255 - k) / 255) | 0;
        rgba[d + 1] = ((255 - m) * (255 - k) / 255) | 0;
        rgba[d + 2] = ((255 - y2) * (255 - k) / 255) | 0;
      }
      rgba[d + 3] = 255;
    }
    return { rgba, width, height };
  }

  async function tryDecodeImage(bytes, filterName) {
    if (typeof createImageBitmap === 'function') {
      try {
        if (filterName === '/DCTDecode' || filterName === '/JPXDecode') {
          return await createImageBitmap(new Blob([bytes], { type: filterName === '/DCTDecode' ? 'image/jpeg' : 'image/jp2' }));
        }
        return await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      } catch (e) { /* 下面尝试 <img> 解码 */ }
    }
    const mime = filterName === '/DCTDecode' ? 'image/jpeg' : filterName === '/JPXDecode' ? 'image/jp2' : 'image/png';
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(new Blob([bytes], { type: mime }));
    });
  }

  function imageSize(bitmap) { return { width: bitmap.naturalWidth || bitmap.width, height: bitmap.naturalHeight || bitmap.height }; }

  async function optimizeImages(bytes, maxDim, quality, jpegEncoder, pngEncoder, tick) {
    const t0 = performance.now();
    const doc = await PDFLib.PDFDocument.load(bytes, { throwOnInvalidObject: false, updateMetadata: false });
    const entries = typeof doc.context.enumerateIndirectObjects === 'function'
      ? doc.context.enumerateIndirectObjects() : [];
    const stats = { photos: 0, totalImages: 0, compressedImages: 0, shrunk: 0, skippedFormat: 0, skippedSmall: 0, decodeFail: 0, noGain: 0, pngOptimized: 0, failed: 0, reducedBytes: 0 };
    log('扫描 PDF 对象', entries.length, '个；maxDim=', maxDim, 'quality=', quality, 'jpegEncoder=', jpegEncoder, 'pngEncoder=', pngEncoder);
    for (let idx = 0; idx < entries.length; idx++) {
      tick(0.1 + 0.7 * idx / Math.max(1, entries.length));
      const [ref, obj] = entries[idx];
      if (!(obj instanceof PDFLib.PDFRawStream) || !obj.dict) continue;
      const dict = obj.dict;
      const subtype = dict.lookup(PDFLib.PDFName.of('Subtype'));
      if (!subtype || subtype.toString() !== '/Image') continue;
      stats.photos++; stats.totalImages++;
      const filter = dict.lookup(PDFLib.PDFName.of('Filter'));
      const filterName = filter ? filter.toString() : '';
      const width = Number(dict.lookup(PDFLib.PDFName.of('Width')) || 0);
      const height = Number(dict.lookup(PDFLib.PDFName.of('Height')) || 0);
      const contents = obj.getContents();
      const originalSize = contents ? contents.byteLength : 0;
      const info = { ref: String(ref), filter: filterName || '(none)', size: originalSize, width, height };
      const isJpeg = filterName.includes('DCTDecode') || filterName.includes('JPXDecode');
      const isPng = filterName.includes('FlateDecode');
      if (!isJpeg && !isPng) { stats.skippedFormat++; log('跳过-格式', info); continue; }
      if (!width || !height || originalSize < 10 * 1024) { stats.skippedSmall++; log('跳过-尺寸或过小', info); continue; }
      let bitmap = null;
      let rawFlate = false;
      try { bitmap = await tryDecodeImage(contents, isJpeg ? '/DCTDecode' : '/FlateDecode'); } catch (e) { /* 解码失败 */ }
      if (!bitmap && !isJpeg) {
        const raw = decodeRawFlatePixels(obj, dict, width, height);
        if (raw) {
          const c = document.createElement('canvas');
          c.width = width; c.height = height;
          c.getContext('2d').putImageData(new ImageData(raw.rgba, width, height), 0, 0);
          bitmap = c; rawFlate = true;
          log('原始 Flate 像素解码成功', info);
        }
      }
      if (!bitmap) { stats.decodeFail++; log('跳过-解码失败', info); continue; }
      const dim = imageSize(bitmap);
      if (!dim.width || !dim.height) { stats.decodeFail++; log('跳过-解码尺寸无效', info); continue; }
      const scale = Math.min(1, maxDim / Math.max(dim.width, dim.height));
      const targetW = Math.max(1, Math.round(dim.width * scale));
      const targetH = Math.max(1, Math.round(dim.height * scale));
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetW; canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { stats.failed++; continue; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        let imageData = null;
        if (isJpeg) ctx.fillStyle = '#fff', ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close && bitmap.close();
        if (isJpeg || rawFlate || pngEncoder === 'upng' || pngEncoder === 'auto') imageData = ctx.getImageData(0, 0, targetW, targetH);
        let data;
        if (isJpeg || rawFlate) data = jpegEncoder === 'jsquash'
          ? await encodeJpegOffThread(canvas, quality, jpegEncoder)
          : await encodeJpeg(canvas, quality, jpegEncoder, () => imageData);
        else {
          if (window.ImageEncode) {
            data = await window.ImageEncode.encodePngWithUPNG(imageData.data, targetW, targetH);
          }
          if (!data) data = dataUrlToBytes(canvas.toDataURL('image/png'));
        }
        if (rawFlate) {
          dict.set(PDFLib.PDFName.of('Filter'), PDFLib.PDFName.of('DCTDecode'));
          dict.delete(PDFLib.PDFName.of('DecodeParms'));
          dict.delete(PDFLib.PDFName.of('SMask'));
          dict.set(PDFLib.PDFName.of('ColorSpace'), PDFLib.PDFName.of('DeviceRGB'));
          dict.set(PDFLib.PDFName.of('BitsPerComponent'), PDFLib.PDFNumber.of(8));
        }
        dict.set(PDFLib.PDFName.of('Width'), PDFLib.PDFNumber.of(targetW));
        dict.set(PDFLib.PDFName.of('Height'), PDFLib.PDFNumber.of(targetH));
        // 保留原字典和对象引用，只替换压缩后的图像数据；Width/Height 与编码后像素一致。
        doc.context.assign(ref, PDFLib.PDFRawStream.of(dict, data));
        stats.shrunk++; stats.compressedImages++;
        if (isJpeg || rawFlate) stats.jpegOptimized = (stats.jpegOptimized || 0) + 1;
        else stats.pngOptimized++;
        stats.reducedBytes += originalSize - data.byteLength;
        log('压缩成功', info, targetW + 'x' + targetH, originalSize + 'B -> ' + data.byteLength + 'B');
      } catch (e) { stats.failed++; log('处理失败', info, e); }
    }
    const out = await doc.save({ useObjectStreams: true });
    if (stats.shrunk + stats.pngOptimized === 0) {
      log('无图片可压缩，保留原文件', stats);
      tick(0.9);
      return { bytes, stats };
    }
    log('完成，用时', Math.round(performance.now() - t0) + 'ms', '统计', stats, '输出', out.byteLength + 'B');
    tick(0.9);
    return { bytes: out, stats };
  }

  async function longestPageSidePt(bytes) {
    try {
      const doc = await PDFLib.PDFDocument.load(bytes, { throwOnInvalidObject: false });
      let longest = 0;
      for (const page of doc.getPages()) {
        const box = page.getMediaBox();
        longest = Math.max(longest, Math.abs(box.width), Math.abs(box.height));
      }
      return longest || 842;
    } catch (e) {
      log('读取页面尺寸失败，按 A4 高度估算', e);
      return 842;
    }
  }

  window.CompressCompat = {
    async compressForWorkbench(bytes, params, tick) {
      const p = params || {};
      tick = tick || function () {};
      const hasLegacyMaxDim = p.maxDim !== undefined && p.maxDim !== null && p.maxDim !== '';
      const hasTargetDpi = p.targetDpi !== undefined && p.targetDpi !== null && p.targetDpi !== '';
      const targetDpi = hasLegacyMaxDim && !hasTargetDpi ? undefined : clamp(p.targetDpi, 50, 300, 130);
      const maxDim = targetDpi === undefined ? clamp(p.maxDim, 640, 4096, 1920) : undefined;
      const qPercent = clamp(p.jpegQ, 1, 100, 80);
      const quality = qPercent / 100;
      const jpegEncoder = p.jpegEncoder || 'jsquash';
      log('开始压缩', { targetDpi, maxDim, jpegQ: qPercent + '%', rasterizeAll: p.rasterizeAll, jpegEncoder, pngEncoder: p.pngEncoder || 'auto', inputBytes: bytes.byteLength });
      let input = bytes.slice();
      if (p.password && window.PdfEncrypt && window.PdfEncrypt.decryptPDF) {
        input = await window.PdfEncrypt.decryptPDF(input, p.password);
      }
      let out, stats = null;
      if (p.rasterizeAll) {
        const r = await rasterize(input, quality, jpegEncoder, tick, targetDpi); out = r.bytes; stats = r.stats;
      } else {
        const effectiveMaxDim = targetDpi === undefined ? maxDim : Math.round((await longestPageSidePt(input) || 842) / 72 * targetDpi);
        try { const r = await optimizeImages(input, effectiveMaxDim, quality, jpegEncoder, p.pngEncoder || 'auto', tick); out = r.bytes; stats = r.stats; }
        catch (e) {
          log('内嵌图片压缩失败，保留原文件（未开启栅格化，不回退）', e);
          out = input;
          stats = { compressionError: errMsg(e), usedRaster: false };
        }
      }
      tick(1);
      log('压缩结果', out.byteLength + 'B');
      const compression = { originalBytes: bytes.byteLength, outputBytes: out.byteLength, ratio: bytes.byteLength ? (1 - out.byteLength / bytes.byteLength) * 100 : 0 };
      log('压缩比例', compression.ratio.toFixed(1) + '%', '图片统计', stats);
      return { bytes: out, stats: stats || {}, compression };
    }
  };


async function extractImagesForWorkbench(bytes, password, options) {
    const opts = typeof options === 'function' ? { tick: options } : (options || {});
    const tick = opts.tick;
    const fmt = opts.format === 'jpg' ? 'jpg' : 'png';
    const ext = fmt === 'png' ? 'png' : 'jpg';
    const encodeOpts = fmt === 'png' ? { upng: !!opts.useUpng } : { quality: opts.quality, useJsquash: !!opts.useJsquash };
    const rawMaxWidth = Number(opts.maxWidth);
    const maxWidth = Number.isFinite(rawMaxWidth) && rawMaxWidth > 0 ? Math.floor(rawMaxWidth) : 0;
    const pdfjs = await import('./pdfjs.js');
    pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
    const pdf = await pdfjs.getDocument({
      data: bytes.slice(), cMapUrl: await getPdfCMapUrl(), cMapPacked: true,
      password: password || undefined, disableFontFace: true, isEvalSupported: false
    }).promise;
    const ops = pdfjs.OPS;
    const imageOps = new Set([
      ops.paintImageXObject, ops.paintImageXObjectRepeat,
      ops.paintInlineImageXObject, ops.paintInlineImageXObjectGroup
    ].filter(Number.isInteger));
    const seen = new Set();
    const out = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const list = await page.getOperatorList();
      // pdf.js resolves image XObjects from the operator list asynchronously in
      // a later task; waiting one macrotask makes page.objs.get reliable.
      await new Promise(resolve => setTimeout(resolve, 0));
      for (let j = 0; j < list.fnArray.length; j++) {
        if (!imageOps.has(list.fnArray[j])) continue;
        const args = list.argsArray[j] || [];
        const depName = typeof args[0] === 'string' ? args[0]
          : (args[0] && typeof args[0].data === 'string' ? args[0].data : null);
        if (!depName || seen.has(depName)) continue;
        seen.add(depName);
        try {
          const img = await page.objs.get(depName);
          if (!img) continue;
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          if (img instanceof ImageData) {
            ctx.putImageData(img, 0, 0);
          } else if (img.bitmap) {
            canvas.width = img.bitmap.width || canvas.width;
            canvas.height = img.bitmap.height || canvas.height;
            ctx.drawImage(img.bitmap, 0, 0);
          } else if (img.data && img.width && img.height) {
            canvas.width = img.width; canvas.height = img.height;
            if (img.data instanceof ImageData) {
              ctx.putImageData(img.data, 0, 0);
            } else if (img.kind === 2 /* GRAYSCALE_1BPP */) {
              const src = img.data, rowBytes = Math.ceil(img.width / 8);
              const imageData = ctx.createImageData(img.width, img.height);
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  const bit = (src[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
                  const di = (y * img.width + x) * 4, v = bit ? 255 : 0;
                  imageData.data[di] = imageData.data[di + 1] = imageData.data[di + 2] = v;
                  imageData.data[di + 3] = 255;
                }
              }
              ctx.putImageData(imageData, 0, 0);
            } else if (img.kind === 3 /* RGB_24BPP */) {
              const src = img.data, rowBytes = img.width * 3;
              const imageData = ctx.createImageData(img.width, img.height);
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  const si = y * rowBytes + x * 3, di = (y * img.width + x) * 4;
                  imageData.data[di] = src[si];
                  imageData.data[di + 1] = src[si + 1];
                  imageData.data[di + 2] = src[si + 2];
                  imageData.data[di + 3] = 255;
                }
              }
              ctx.putImageData(imageData, 0, 0);
            } else if (img.kind === 4 /* RGBA_32BPP */) {
              ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
            } else continue;
          } else continue;
          if (maxWidth && canvas.width > maxWidth) {
            const scaled = document.createElement('canvas');
            scaled.width = maxWidth;
            scaled.height = Math.max(1, Math.round(canvas.height * maxWidth / canvas.width));
            const scaledCtx = scaled.getContext('2d');
            if (!scaledCtx) continue;
            scaledCtx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
            canvas.width = 0; canvas.height = 0;
            out.push({ ext, bytes: await window.PdfCore.canvasToBytes(scaled, fmt, encodeOpts), width: scaled.width, height: scaled.height });
          } else {
            out.push({ ext, bytes: await window.PdfCore.canvasToBytes(canvas, fmt, encodeOpts), width: canvas.width, height: canvas.height });
          }
        } catch (e) { /* 单个图片失败跳过 */ }
      }
      tick && tick(i / pdf.numPages);
    }
    return out;
  }
  window.ImageExtract = { extractImagesForWorkbench };


})();
