// anydoc wasm worker — owns the single-threaded wasm so the UI never blocks.
const ADAPTER_VERSION = '1.3.0';
const ENGINE_VERSION = '0.2.5';

let api = null;
let initPromise = null;

const engineInfo = {
  name: '@firecrawl/anydoc-wasm',
  version: ENGINE_VERSION,
  adapterVersion: ADAPTER_VERSION,
  wasmFile: 'anydoc_wasm_bg.wasm.gz',
};

function extOf(mime) {
  const map = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
    'image/svg+xml': 'svg', 'image/bmp': 'bmp', 'image/x-icon': 'ico', 'image/tiff': 'tiff',
    'image/avif': 'avif', 'application/pdf': 'pdf',
  };
  return map[mime] || (mime && /^image\//.test(mime) ? mime.slice(6).replace(/[^a-z0-9]/g, '') : '') || 'bin';
}

function assetExt(asset) {
  const m = /\.([a-z0-9]{2,6})$/i.exec(String(asset.originPart || ''));
  if (m && !/^application\/vnd/.test(asset.mediaType || '')) return m[1].toLowerCase();
  return extOf(asset.mediaType);
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function walkInlines(inlines, visit) {
  for (const node of inlines || []) {
    visit(node);
    if (node.content) walkInlines(node.content, visit);
  }
}
function walkBlocks(blocks, visit) {
  for (const block of blocks || []) {
    if (block.content) walkInlines(block.content, visit);
    if (block.blocks) walkBlocks(block.blocks, visit);
    if (block.list) for (const item of block.list.items || []) walkBlocks(item.blocks, visit);
    if (block.table) for (const row of block.table.grid || []) {
      for (const slot of row || []) if (slot.cell) walkBlocks(slot.cell.blocks, visit);
    }
  }
}

// anydoc's toMarkdownBytes drops embedded images entirely (no alt, no link),
// so counting the document model is the only reliable way to know they exist.
function collectImageInfo(doc) {
  const counts = { images: 0, embedded: 0, external: 0, unavailable: 0 };
  const visit = (node) => {
    if (node.kind !== 'image') return;
    const source = node.source || {};
    if (source.kind === 'external') counts.external++;
    else if (source.kind === 'unavailable') counts.unavailable++;
    else if (source.kind === 'asset' && Number.isInteger(source.assetId)) counts.embedded++;
  };
  walkBlocks(doc.blocks, visit);
  for (const note of doc.notes || []) walkBlocks(note.blocks, visit);
  counts.images = counts.embedded + counts.external + counts.unavailable;
  return counts;
}

async function buildAssets(doc) {
  const result = [];
  const byHash = new Map();
  for (const a of doc.assets || []) {
    if (!/^image\//.test(a.mediaType || '')) continue; // Skip OLE/object payloads.
    const bytes = a.data instanceof Uint8Array ? a.data : new Uint8Array(a.data || []);
    const hash = (await sha256(bytes)).slice(0, 16);
    let path = byHash.get(hash);
    if (!path) {
      path = `media/${hash}.${assetExt(a)}`;
      byHash.set(hash, path);
    }
    // Keep every id so image sources can resolve; identical bytes share a path
    // and are written once during export (zip.files dedups by path).
    result.push({
      id: a.id, path, bytes,
      bytesBase64: bytesToBase64(bytes),
      mediaType: a.mediaType || 'application/octet-stream',
      originPart: a.originPart || '', size: bytes.length,
    });
  }
  return result;
}

// ---- Document-model Markdown renderer ----------------------------------
// anydoc renders embedded images as nothing at all in its native Markdown.
// When a document has embedded images we render the model ourselves so each
// image lands at its real position as ![alt](media/xxx.png).
// Text-only documents keep the native converter (unchanged behaviour).

function escapeMdText(s) {
  return String(s || '').replace(/([\\`*_{}\[\]()#+\-.!|>])/g, '\\$1');
}

function renderInline(node, ctx) {
  if (!node) return '';
  switch (node.kind) {
    case 'text': {
      let t = String(node.text || '');
      const st = node.style || {};
      if (st.code) t = '`' + String(node.text || '').replace(/`/g, '\\`') + '`';
      if (st.bold) t = '**' + t + '**';
      if (st.italic) t = '*' + t + '*';
      if (st.strike) t = '~~' + t + '~~';
      return t;
    }
    case 'image': {
      const src = node.source || {};
      const alt = String(node.alt || '').replace(/[\[\]\n\r]/g, ' ').trim();
      if (src.kind === 'external' && src.url) return `![${alt}](${src.url})`;
      if (src.kind === 'asset' && Number.isInteger(src.assetId)) {
        const asset = ctx.assetById.get(src.assetId);
        if (asset) return `![${alt}](${asset.path})`;
      }
      // Missing/unavailable image: keep a visible trace instead of silently
      // dropping it, but never emit a broken-looking empty link.
      return alt ? `*[图片: ${alt}]*` : '';
    }
    case 'link': {
      const text = (node.content || []).map(n => renderInline(n, ctx)).join('');
      const target = node.target || {};
      if ((target.kind === 'external' || target.kind === 'relative') && target.value) {
        return `[${text}](${target.value})`;
      }
      return text; // internal anchors: keep the label only.
    }
    case 'lineBreak': return '  \n';
    case 'checkbox': return (node.checked ? '[x]' : '[ ]') + ' ';
    case 'math': return '$' + String(node.text || '') + '$';
    case 'noteRef': return node.noteId ? `[^${node.noteId}]` : '';
    case 'anchor': return '';
    default: return String(node.text || '');
  }
}

function inlineText(inlines, ctx) {
  return (inlines || []).map(n => renderInline(n, ctx)).join('');
}

function renderList(list, ctx, indent) {
  const out = [];
  let n = Number.isFinite(list.start) ? list.start : 1;
  for (const item of list.items || []) {
    let marker = '-';
    if (item.markerLabel) marker = item.markerLabel;
    else if (list.marker && list.marker !== 'bullet') marker = n + '.';
    const inner = renderBlocks(item.blocks || [], ctx, indent + '  ');
    const lines = inner.split('\n');
    out.push(indent + marker + ' ' + (lines[0] || ''));
    for (let i = 1; i < lines.length; i++) out.push(indent + '  ' + lines[i]);
    n++;
  }
  return out.join('\n');
}

function renderTable(table, ctx) {
  const rows = (table.grid || []).map(row => (row || []).map(slot => {
    if (!slot || slot.kind !== 'origin' || !slot.cell) return '';
    return inlineBlocksCompact(slot.cell.blocks || [], ctx);
  }));
  if (!rows.length) return '';
  const cols = Math.max(1, ...rows.map(r => r.length));
  const pad = r => {
    const cells = r.slice();
    while (cells.length < cols) cells.push('');
    return '| ' + cells.map(c => String(c).replace(/\|/g, '\\|')).join(' | ') + ' |';
  };
  const out = [pad(rows[0]), '| ' + Array(cols).fill('---').join(' | ') + ' |'];
  for (let i = 1; i < rows.length; i++) out.push(pad(rows[i]));
  return out.join('\n');
}

function inlineBlocksCompact(blocks, ctx) {
  return (blocks || []).map(b => {
    if (b.kind === 'paragraph' || b.kind === 'heading') return inlineText(b.content, ctx);
    if (b.text) return String(b.text);
    return inlineText(b.content, ctx);
  }).filter(Boolean).join('<br>').replace(/\n/g, '<br>');
}

function renderBlocks(blocks, ctx, indent = '') {
  const out = [];
  for (const b of blocks || []) {
    let part = '';
    switch (b.kind) {
      case 'heading':
        part = '#'.repeat(Math.max(1, Math.min(6, b.level || 1))) + ' ' + inlineText(b.content, ctx);
        break;
      case 'paragraph':
        part = inlineText(b.content, ctx);
        break;
      case 'list':
        part = renderList(b.list || {}, ctx, indent);
        break;
      case 'table':
        part = renderTable(b.table || {}, ctx);
        break;
      case 'blockQuote': {
        const inner = renderBlocks(b.blocks || [], ctx, indent);
        part = inner.split('\n').map(l => '> ' + l).join('\n');
        break;
      }
      case 'codeBlock':
        part = '```' + String(b.lang || '') + '\n' + String(b.text || '') + '\n```';
        break;
      case 'math':
        part = '$$\n' + String(b.text || '') + '\n$$';
        break;
      case 'rule':
        part = '---';
        break;
      default:
        part = b.text ? String(b.text) : inlineText(b.content, ctx);
    }
    if (part) out.push(indent + part);
  }
  return out.join('\n\n');
}

function renderDocument(doc, assets) {
  const ctx = { assetById: new Map(assets.map(a => [a.id, a])) };
  const parts = [renderBlocks(doc.blocks || [], ctx)];
  for (const note of doc.notes || []) {
    parts.push(`[^${note.id}]: ` + renderBlocks(note.blocks || [], ctx).replace(/\n/g, '\n    '));
  }
  return parts.filter(Boolean).join('\n\n').trim() + '\n';
}

async function convertPayload({ name, bytes: raw, formatHint }) {
  const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw || []);
  const started = performance.now();
  const inputSize = bytes.length;

  const detected = api.formatFromBytes(bytes) || null;
  const fromExt = api.formatFromPath(name) || null;
  // Content signature wins; extension covers signature-less formats (CSV).
  // The manual hint is a last resort for misnamed/extension-less files.
  const format = detected || fromExt || formatHint;

  let markdown;
  try {
    markdown = api.toMarkdownBytes(bytes, format);
  } catch (err) {
    const e = new Error(err?.message || String(err));
    e.code = err?.code || 'convertError';
    e.pages = err?.pages;
    e.pageCount = err?.pageCount;
    throw e;
  }

  let assets = [];
  let imageStats = { images: 0, embedded: 0, external: 0, unavailable: 0, assetBytes: 0, assetCount: 0 };
  let renderMode = 'native';

  if (format && format !== 'pdf' && format !== 'csv') {
    try {
      const doc = api.toDocument(bytes, format);
      const counts = collectImageInfo(doc);
      if (counts.embedded > 0) {
        // Native Markdown loses embedded images; render from the model so
        // every image is emitted at its real position with a media file.
        assets = await buildAssets(doc);
        markdown = renderDocument(doc, assets);
        renderMode = 'native-model';
      }
      imageStats = {
        ...counts,
        assetBytes: assets.reduce((s, a) => s + a.size, 0),
        assetCount: assets.length,
      };
    } catch (err) {
      imageStats.note = String(err?.message || err);
    }
  }

  const ms = Math.round(Math.max(0.1, performance.now() - started) * 10) / 10;
  return {
    markdown, format, detectedFormat: detected, extensionFormat: fromExt,
    imageStats, assets, renderMode,
    timings: { ms },
    sizes: { input: inputSize, output: new TextEncoder().encode(markdown).length },
  };
}

// anydoc ships the ~6.7MB wasm as a ~2.9MB gzip file (a zip mirror is kept
// for reference). Fetch only the compressed bytes and inflate in-browser,
// then hand the raw bytes to wasm-bindgen's initSync — no intermediate .wasm
// file is ever stored or requested. Decompression is done by the browser's
// native DecompressionStream; no third-party decompressor is bundled.
// Progress messages are broadcasts (no `id`) so the main thread handles them
// separately from the per-request promise replies.
function postProgress(payload) {
  self.postMessage({ type: 'engine-progress', payload });
}

async function fetchCompressedWasm() {
  const url = new URL('./anydoc/anydoc_wasm_bg.wasm.gz', import.meta.url);
  postProgress({ stage: 'fetch', label: '连接引擎服务器…', percent: 0, loaded: 0, total: 0 });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch wasm.gz failed: HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  // Stream the body when available so the download has a real percentage;
  // older browsers fall back to arrayBuffer with an indeterminate bar.
  if (!res.body || !res.body.getReader) {
    postProgress({ stage: 'fetch', label: '下载引擎…', percent: null, loaded: 0, total });
    return new Uint8Array(await res.arrayBuffer());
  }
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  let lastReport = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    const now = performance.now();
    if (now - lastReport >= 80) {
      postProgress({
        stage: 'fetch', label: '下载引擎…',
        percent: total ? Math.min(100, Math.round(loaded * 100 / total)) : null,
        loaded, total,
      });
      lastReport = now;
    }
  }
  postProgress({ stage: 'fetch', label: '下载引擎…', percent: 100, loaded, total });
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

async function decompressGzip(compressed) {
  postProgress({ stage: 'decompress', label: '解压引擎…', percent: null, loaded: compressed.length, total: compressed.length });
  if (typeof DecompressionStream !== 'function') {
    throw new Error('当前浏览器不支持 DecompressionStream，请使用新版 Chrome / Edge / Firefox / Safari');
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function loadAdapter() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const [mod, compressed] = await Promise.all([
      import('./anydoc/anydoc_wasm.js'),
      fetchCompressedWasm(),
    ]);
    const wasmBytes = await decompressGzip(compressed);
    postProgress({ stage: 'instantiate', label: '初始化 wasm…', percent: null, loaded: wasmBytes.length, total: wasmBytes.length });
    mod.initSync({ module: wasmBytes });
    api = mod;
    postProgress({ stage: 'done', label: '引擎就绪', percent: 100, loaded: 1, total: 1 });
    return engineInfo;
  })();
  return initPromise;
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data || {};
  try {
    if (type === 'init') {
      self.postMessage({ id, type: 'ready', payload: await loadAdapter() });
    } else if (type === 'convert') {
      if (!api) await loadAdapter();
      self.postMessage({ id, type: 'result', payload: await convertPayload(payload) });
    } else if (type === 'version') {
      self.postMessage({ id, type: 'version', payload: engineInfo });
    }
  } catch (error) {
    self.postMessage({
      id, type: 'error',
      payload: {
        code: error?.code || 'unknown',
        message: error?.message || String(error),
        pages: error?.pages, pageCount: error?.pageCount,
      },
    });
  }
};
