// HTML -> Markdown (main thread). Uses the browser's native DOM, so no
// domino / ESM shims are needed: Turndown, its GFM plugin and DOMPurify are
// plain <script> globals loaded from static/vendor/.
(function () {
  'use strict';

  const HTML_HINT_RE = /<html|<head|<body|<div|<table|<p[\s>]|<img|<ul|<ol|<li|<br\s*\/?>|<a[\s>]/i;
  const EMPTY_REMOVABLE = /^(span|i|em|b|strong|u|s|strike|del|font|small|mark|abbr|cite|label|center|div|p)$/;
  const DATA_URI = /^data:image\/(png|jpe?g|gif|webp|bmp|avif|x-icon|tiff|svg\+xml)(;|,)/i;

  function looksLikeHtml(name, text) {
    const ext = String(name || '').toLowerCase().split('?')[0];
    if (/\.(html?|htm|shtml|xhtml)$/i.test(ext)) return true;
    if (/\.txt$/i.test(ext)) return HTML_HINT_RE.test(text || '');
    return false;
  }
  function isHtmlPayload({ name, bytes, formatHint }) {
    if (String(formatHint || '').toLowerCase() === 'html') return true;
    let text = '';
    try { text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes || [])); } catch (e) {}
    return looksLikeHtml(name, text);
  }

function stripEmptyInline(el) {
  if (!el.firstChild) return;
  let child = el.firstChild;
  while (child) {
    const next = child.nextSibling;
    if (child.nodeType === 3) {
      if (!child.nodeValue) {
        el.removeChild(child);
      } else if (!child.nodeValue.trim()) {
        // Keep one space when it separates a word from a following element,
        // e.g. <td>cell one <span>extra</span></td>.
        const prev = child.previousSibling;
        const next2 = child.nextSibling;
        const hasWord = (n) => n && ((n.nodeType === 3 && /\S/.test(n.nodeValue || '')) || n.nodeType === 1);
        if (hasWord(prev) && hasWord(next2)) child.nodeValue = ' ';
        else el.removeChild(child);
      } else if (/^\s+$/.test(child.nodeValue)) {
        child.nodeValue = ' ';
      }
    } else {
      stripEmptyInline(child);
      if (child.nodeType === 1 && !child.firstChild && EMPTY_REMOVABLE.test(child.nodeName.toLowerCase())) el.removeChild(child);
    }
    child = next;
  }
}

function unwrapKeepChildren(parent, node) {
  const text = node.textContent || '';
  const children = [];
  let child = node.firstChild;
  while (child) {
    const next = child.nextSibling;
    children.push(child);
    node.removeChild(child);
    child = next;
  }
  // Preserve leading/trailing whitespace: "cell one " + "extra" must not
  // collapse into "cell oneextra" after the wrapper is removed.
  const leading = /^\s/.test(text[0] || '') ? parent.ownerDocument.createTextNode(' ') : null;
  const trailing = /\s$/.test(text[text.length - 1] || '') ? parent.ownerDocument.createTextNode(' ') : null;
  if (leading) parent.insertBefore(leading, node);
  if (children.length) {
    const frag = parent.ownerDocument ? parent.ownerDocument.createDocumentFragment() : null;
    for (const c of children) if (frag) frag.appendChild(c);
    if (frag) parent.insertBefore(frag, node);
    else for (const c of children) parent.insertBefore(c, node);
  }
  if (trailing) parent.insertBefore(trailing, node);
  parent.removeChild(node);
}

function cleanHtmlTree(doc) {
  // Structural cleanup first: strip formatting-only wrappers that Turndown
  // otherwise turns into stray blank lines / broken table cells.
  const wrappers = 'span,i,em,b,strong,u,s,strike,del,font,small,mark,abbr,cite,label,center';
  const blockWrappers = `${wrappers},div,p`;
  for (let pass = 0; pass < 2; pass++) for (const el of Array.from(doc.querySelectorAll(blockWrappers))) {
    const parent = el.parentNode;
    if (!parent || parent.nodeType !== 1) continue;
    const tag = el.nodeName.toLowerCase();
    const isBlock = tag === 'div' || tag === 'p';
    const inTableCell = parent.nodeName === 'TD' || parent.nodeName === 'TH';
    if (inTableCell && isBlock) {
      unwrapKeepChildren(parent, el); // table>td>p -> plain cell content
      continue;
    }
    if (inTableCell && !isBlock) {
      unwrapKeepChildren(parent, el); // td>span/i/... -> plain cell content
      continue;
    }
    if (!isBlock && (parent.nodeName === 'DIV' || parent.nodeName === 'P' || parent.nodeName === 'LI')) {
      unwrapKeepChildren(parent, el); // div/p/li>span/i/... -> plain content
      continue;
    }
    if (!isBlock && el.childNodes.length === 1 && el.firstChild.nodeType === 1 && el.firstChild.nodeName === el.nodeName) {
      unwrapKeepChildren(parent, el); // nested same inline wrappers
    }
  }
  const body = doc.body || doc.documentElement;
  for (const el of Array.from(body.querySelectorAll('*'))) {
    if (el.nodeType !== 1) continue;
    const tag = el.nodeName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'iframe' || tag === 'object' || tag === 'embed' || tag === 'form' || tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea' || tag === 'video' || tag === 'audio' || tag === 'svg' || tag === 'canvas') {
      if (el.parentNode) el.parentNode.removeChild(el);
      continue;
    }
    // Keep only the few attributes that carry meaning in Markdown; everything
    // else is copy/paste noise (class, style, data-*, tracking attrs, ...).
    const keep = tag === 'img' ? ['src', 'alt', 'title']
      : tag === 'a' ? ['href', 'title']
      : (tag === 'td' || tag === 'th') ? ['colspan', 'rowspan']
      : ['href', 'title'];
    for (const attr of Array.from(el.attributes || [])) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || !keep.includes(name)) el.removeAttribute(attr.name);
    }
  }
  stripEmptyInline(body);
  return body.innerHTML;
}

function base64ToBytes(base64) {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function collectDataImages(body, assets) {
  const bySrc = new Map();
  const byHash = new Map();
  for (const img of Array.from(body.querySelectorAll('img'))) {
    const src = img.getAttribute('src') || '';
    if (!/^data:image\//i.test(src)) continue;
    const m = /^data:([^;,]+)?(;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i.exec(src);
    if (!m) continue;
    const mediaType = (m[1] || 'image/png').toLowerCase();
    let bytes;
    try {
      if (m[3]) bytes = base64ToBytes(m[4]);
      else bytes = new TextEncoder().encode(decodeURIComponent(m[4]));
    } catch (e) {
      continue;
    }
    if (!bytes.length) continue;
    let path = bySrc.get(src);
    if (!path) {
      const hash = hashImageBytes(bytes).slice(0, 16);
      path = `media/${hash}.${extOf(mediaType)}`;
      bySrc.set(src, path);
      if (!byHash.has(hash)) {
        byHash.set(hash, path);
        assets.push({
          path, bytes, bytesBase64: bytesToBase64(bytes),
          mediaType, originPart: '', size: bytes.length,
        });
      } else {
        // Same bytes under a different data URI: reuse the first asset path.
        bySrc.set(src, byHash.get(hash));
      }
    }
    img.setAttribute('src', bySrc.get(src));
  }
}

// A tiny deterministic digest is enough to dedupe identical inline images;
function hashImageBytes(bytes) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < bytes.length; i++) {
    h1 = Math.imul(h1 ^ bytes[i], 0x01000193);
    h2 = Math.imul(h2 + bytes[i], 0x85ebca6b) ^ (h2 >>> 13);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

  function extOf(mime) {
    const map = {
      'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
      'image/svg+xml': 'svg', 'image/bmp': 'bmp', 'image/x-icon': 'ico', 'image/tiff': 'tiff',
      'image/avif': 'avif',
    };
    return map[mime] || (mime && /^image\//.test(mime) ? mime.slice(6).replace(/[^a-z0-9]/g, '') : '') || 'bin';
  }
  function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  }

  function allowImageDataUri(node) {
    if (node.nodeName === 'IMG' && node.hasAttribute && node.hasAttribute('src')) {
      const src = node.getAttribute('src') || '';
      if (DATA_URI.test(src)) node.setAttribute('src', src);
    }
  }

  // Turndown keeps <table> blocks as literal HTML. Convert only real grids
  // (at least 2 rows and at least 2 columns) into GFM tables; 1-row/1-column
  // tables stay as HTML because they are usually layout artifacts.
  // Merged cells (colspan/rowspan) are expanded into a rectangular grid:
  // a spanned cell keeps its text in the top-left slot, the covered slots
  // become empty cells. The header row is the first row that contains <th>
  // (or the first row when no <th> exists), so preceding title rows stay as
  // regular data rows instead of becoming the header.
  // We pull qualifying tables out before Turndown and stitch the GFM back
  // afterwards, so backslashes in cell text are not escaped by Turndown.
  //
  // When mergeContinuationTables is true (Word paste), adjacent tables that
  // are clearly pieces of one page-split table are joined first. The signal
  // is deliberately strict: identical column count, only <br>/whitespace
  // between them, and the next table's first row has an empty leading cell
  // while the previous table's last row is non-empty. Plain HTML code paste
  // never sets this flag, so independent tables are left untouched.

  function rawCellText(cell, td) {
    if (!cell || cell === '__SPAN__') return '';
    if (typeof cell === 'string') return cell;
    if (!td) return (cell.textContent || '').replace(/\s+/g, ' ').trim();
    return (td.turndown(cell.innerHTML) || '').replace(/\s+/g, ' ').trim();
  }

  function escapeGfmCell(text) {
    return text.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  }

  function parseTable(table) {
    const sourceRows = Array.from(table.querySelectorAll('tr')).map(tr =>
      Array.from(tr.children).filter(c => /^(TD|TH)$/i.test(c.nodeName))
    ).filter(r => r.length);
    const cols = sourceRows.reduce((m, r) =>
      Math.max(m, r.reduce((sum, c) => sum + (parseInt(c.getAttribute('colspan'), 10) || 1), 0)), 0);
    if (cols < 2) return null;

    // Expand colspan/rowspan into a rectangular (rows x cols) grid.
    const grid = sourceRows.map(() => Array.from({ length: cols }, () => null));
    const occupied = sourceRows.map(() => Array.from({ length: cols }, () => false));
    sourceRows.forEach((cells, ri) => {
      let ci = 0;
      for (const cell of cells) {
        while (ci < cols && occupied[ri][ci]) ci++;
        if (ci >= cols) break;
        const cs = Math.max(1, parseInt(cell.getAttribute('colspan'), 10) || 1);
        const rs = Math.max(1, parseInt(cell.getAttribute('rowspan'), 10) || 1);
        for (let dr = 0; dr < rs && ri + dr < grid.length; dr++) {
          for (let dc = 0; dc < cs && ci + dc < cols; dc++) {
            if (occupied[ri + dr][ci + dc]) continue;
            occupied[ri + dr][ci + dc] = true;
            // Only the top-left slot carries the cell content; the rest
            // are placeholders with a marker so turndown keeps them empty.
            grid[ri + dr][ci + dc] = (dr === 0 && dc === 0) ? cell : '__SPAN__';
          }
        }
        ci += cs;
      }
    });

    const headerIndex = sourceRows.findIndex(cells => cells.some(c => /^TH$/i.test(c.nodeName)));
    return { table, cols, grid, headerIndex: headerIndex >= 0 ? headerIndex : 0, rowCount: sourceRows.length };
  }

  function isVisualOnly(node) {
    if (node.nodeType === 3) return !(node.nodeValue || '').trim();
    if (node.nodeType !== 1) return false;
    const walker = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) {
        if ((n.nodeValue || '').trim()) return false;
      } else if (n.nodeName.toLowerCase() !== 'br') {
        return false;
      }
    }
    return true;
  }

  function onlyVisualBetween(doc, prev, next) {
    const range = doc.createRange();
    range.setStartAfter(prev);
    range.setEndBefore(next);
    for (const child of range.cloneContents().childNodes) {
      if (!isVisualOnly(child)) return false;
    }
    return true;
  }

  function canMergeContinuation(doc, group, next) {
    if (!group || !next || group.cols !== next.cols) return false;
    const lastRow = group.grid[group.grid.length - 1];
    const firstRow = next.grid[0];
    if (!lastRow || !firstRow) return false;
    // The continuation row repeats the first column as empty; otherwise it
    // is an ordinary independent table and must stay separate.
    if (rawCellText(firstRow[0], null) !== '') return false;
    if (!lastRow.some(c => rawCellText(c, null) !== '')) return false;
    const prevTable = group.tables[group.tables.length - 1];
    if (prevTable === next.table) return false;
    return onlyVisualBetween(doc, prevTable, next.table);
  }

  function mergeContinuation(group, next, td) {
    const lastRow = group.grid[group.grid.length - 1];
    const firstRow = next.grid[0];
    for (let c = 0; c < group.cols; c++) {
      const a = rawCellText(lastRow[c], td);
      const b = rawCellText(firstRow[c], td);
      if (a && b) lastRow[c] = a + b;
      else if (!a && b) lastRow[c] = b;
    }
    for (let r = 1; r < next.grid.length; r++) group.grid.push(next.grid[r]);
    group.tables.push(next.table);
  }

  function groupGfm(group, td) {
    const cellText = (cell) => escapeGfmCell(rawCellText(cell, td));
    return group.grid.map((cells, ri) => {
      const line = `| ${cells.map(cellText).join(' | ')} |`;
      if (ri !== group.headerIndex) return line;
      return `${line}\n| ${Array.from({ length: group.cols }, () => '---').join(' | ')} |`;
    }).join('\n');
  }

  function extractLargeTables(html, td, mergeContinuationTables) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = Array.from(doc.body.querySelectorAll('table'));
    const placeholders = [];
    // Choose a prefix that never occurs in the source, so restoring markers
    // can't touch real document text.
    let prefix = 'ANY2MDTABLEPLACEHOLDER';
    while (html.includes(prefix)) prefix += 'X';

    const groups = [];
    let current = null;
    for (const table of tables) {
      const parsed = parseTable(table);
      if (!parsed) continue;
      parsed.tables = [table];
      if (mergeContinuationTables && canMergeContinuation(doc, current, parsed)) {
        mergeContinuation(current, parsed, td);
        continue;
      }
      if (current) groups.push(current);
      current = parsed;
    }
    if (current) groups.push(current);

    groups.forEach((group, i) => {
      // A lone 1-row grid is a layout artifact unless it was merged into a
      // real continuation table.
      if (group.rowCount < 2 && group.tables.length < 2) return;
      const marker = `${prefix}${i}END`;
      placeholders.push({ marker, gfm: groupGfm(group, td) });
      for (const table of group.tables) {
        if (table === group.tables[0]) table.replaceWith(doc.createTextNode(marker));
        else table.remove();
      }
    });
    return { html: doc.body.innerHTML, placeholders };
  }

  function restoreTables(markdown, placeholders) {
    for (const { marker, gfm } of placeholders) {
      markdown = markdown.split(marker).join(gfm);
    }
    return markdown;
  }

  function convertHtml({ name, bytes: raw, mergeContinuationTables = false }) {
    if (typeof TurndownService !== 'function' || !window.turndownPluginGfm || !window.DOMPurify) {
      throw Object.assign(new Error('HTML 转换组件尚未加载完成'), { code: 'htmlNotReady' });
    }
    const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw || []);
    const started = performance.now();
    let text;
    try { text = new TextDecoder('utf-8', { fatal: false }).decode(bytes); }
    catch (e) { text = new TextDecoder().decode(bytes); }
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    if (!looksLikeHtml(name, text)) {
      throw Object.assign(new Error('文件不是 HTML（未检测到常见 HTML 标签）'), { code: 'unsupportedHtml' });
    }

    // DOMPurify first, then structural cleanup, using the real document.
    const doc = new DOMParser().parseFromString(text, 'text/html');
    // DOMPurify strips data: URIs by default; re-allow only <img src> data:image
    // so collectDataImages can decode it into a local media asset. The hook is
    // scoped to this call and removed right after sanitizing.
    DOMPurify.addHook('afterSanitizeAttributes', allowImageDataUri);
    let html = DOMPurify.sanitize(cleanHtmlTree(doc), { ADD_ATTR: ['target'] });
    DOMPurify.removeHook('afterSanitizeAttributes', allowImageDataUri);

    const cleanDoc = new DOMParser().parseFromString(html, 'text/html');
    const body = cleanDoc.body || cleanDoc.documentElement;
    const assets = [];
    collectDataImages(body, assets);
    html = cleanHtmlTree(cleanDoc);

    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    td.use(window.turndownPluginGfm.gfm);
    const extracted = extractLargeTables(html, td, mergeContinuationTables);
    let markdown = td.turndown(extracted.html) || '';
    markdown = restoreTables(markdown, extracted.placeholders).replace(/\n{3,}/g, '\n\n').trim() + '\n';

    const imageNodes = Array.from(body.querySelectorAll('img'));
    const embedded = assets.length;
    const external = imageNodes.filter(img => /^https?:\/\//i.test(img.getAttribute('src') || '') || (img.getAttribute('src') || '').startsWith('//')).length;
    const unavailable = imageNodes.filter(img => {
      const src = (img.getAttribute('src') || '').trim();
      return !src || /^blob:/i.test(src) || (src.startsWith('media/') && embedded === 0);
    }).length;
    const ms = Math.round(Math.max(0.1, performance.now() - started) * 10) / 10;
    return {
      markdown, cleanHtml: html, format: 'html', detectedFormat: 'html', extensionFormat: 'html',
      imageStats: {
        images: imageNodes.length, embedded, external, unavailable,
        assetBytes: assets.reduce((s, a) => s + a.size, 0), assetCount: assets.length,
      },
      assets, renderMode: 'turndown',
      timings: { ms },
      sizes: { input: bytes.length, output: new TextEncoder().encode(markdown).length },
    };
  }

  window.any2mdConvertHtml = { convertHtml, isHtmlPayload, looksLikeHtml };
})();
