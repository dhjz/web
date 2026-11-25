/*!
 * xlsx-to-md.js — Excel(.xlsx/.xlsm) 平铺 Markdown 视图
 *
 * 解析交给开源库 read-excel-file（MIT，本地 vendor，gzip ~14KB）：
 * 支持多 sheet、共享字符串/内联字符串、日期序列号、数字与布尔。
 * 本文件只负责按需求格式输出 Markdown：
 *   ## sheet名
 *
 *   ---
 *
 *   年龄: 18
 *   姓名: 张三
 *
 * 没有可用表头时退化为平铺行：每个非空行一行，行内单元格用 · 连接。
 */
(function () {
  'use strict';

  const VERSION = '2.0.0';

  const scriptUrl = (typeof document !== 'undefined' && document.currentScript)
    ? document.currentScript.src
    : (typeof __filename !== 'undefined' ? 'file://' + __filename : '');

  let readerPromise = null;
  function loadReader() {
    if (!readerPromise) {
      const url = new URL('./vendor/read-excel-file.js', scriptUrl || 'file:///');
      readerPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url.href;
        script.onload = () => resolve(window.readXlsxFile);
        script.onerror = () => reject(new Error('read-excel-file 加载失败'));
        document.head.appendChild(script);
      });
    }
    return readerPromise;
  }

  function isXlsxPayload(payload) {
    const p = payload || {};
    const name = String(p.name || '').toLowerCase();
    const hint = String(p.formatHint || '').toLowerCase();
    if (/\.(xlsx|xlsm)$/.test(name)) return true;
    if (hint === 'xlsx' || hint === 'xlsm') return true;
    const bytes = p.bytes instanceof Uint8Array ? p.bytes : new Uint8Array(p.bytes || []);
    // PK zip signature; docx/pptx also match, so only use it when the name
    // gives no clue and let those files keep their original engine.
    return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && !name && !hint;
  }

  function cellToText(cell) {
    if (cell == null) return '';
    if (cell instanceof Date) {
      const pad = n => String(n).padStart(2, '0');
      return Number.isNaN(cell.getTime()) ? '' :
        `${cell.getFullYear()}-${pad(cell.getMonth() + 1)}-${pad(cell.getDate())}`;
    }
    if (typeof cell === 'object' && typeof cell.code === 'string') return cell.code;
    return String(cell);
  }

  function normalizeRows(rows) {
    const out = [];
    for (const row of rows || []) {
      const cells = (row || []).map(cellToText)
        .map(c => c.replace(/[\r\n]+/g, ' ').trim());
      while (cells.length && cells[cells.length - 1] === '') cells.pop();
      if (cells.some(Boolean)) out.push(cells);
    }
    return out;
  }

  function looksNumeric(s) {
    return /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(String(s || '').trim());
  }

  function sheetToMarkdown(name, rawRows) {
    const rows = normalizeRows(rawRows);
    // 空表不输出任何内容
    if (!rows.length) return '';
    const safeName = String(name || 'Sheet').replace(/[\r\n]+/g, ' ').trim() || 'Sheet';
    const out = [`## ${safeName}`, ''];
    const header = rows[0];
    const hasHeader = rows.length > 1 && header.length > 1 && header.some(Boolean) && header.every(c => !looksNumeric(c));
    if (hasHeader) {
      const names = header.map((h, i) => h || `列${i + 1}`);
      for (const row of rows.slice(1)) {
        out.push('---', '');
        names.forEach((h, i) => out.push(`${h}: ${row[i] == null ? '' : row[i]}  `));
        out.push('');
      }
      return out.join('\n').trimEnd();
    }
    for (const row of rows) out.push('---', '', row.join(' · '), '');
    return out.join('\n').trimEnd();
  }

  async function convertXlsx(payload) {
    const p = payload || {};
    const bytes = p.bytes instanceof Uint8Array ? p.bytes : new Uint8Array(p.bytes || []);
    const started = Date.now();
    const read = await loadReader();
    if (typeof read !== 'function') {
      const e = new Error('read-excel-file 未暴露读表函数');
      e.code = 'xlsxReaderMissing';
      throw e;
    }
    let sheetsRaw;
    try {
      sheetsRaw = await read(bytes);
    } catch (err) {
      const e = new Error(`xlsx 读取失败: ${err?.message || err}`);
      e.code = 'xlsxReadError';
      throw e;
    }
    const sheets = (sheetsRaw || [])
      .map(s => {
        const rows = normalizeRows(s.data);
        return { name: s.sheet, rows, markdown: sheetToMarkdown(s.sheet, s.data) };
      })
      .filter(s => s.markdown); // 空表不纳入输出
    const markdown = sheets.length ? sheets.map(s => s.markdown).join('\n\n') + '\n' : '';
    const ms = Date.now() - started;
    return {
      markdown,
      format: 'xlsx',
      detectedFormat: 'xlsx',
      extensionFormat: 'xlsx',
      renderMode: 'xlsx-own',
      engineVersion: VERSION,
      sheets: sheets.map(s => ({ name: s.name, rows: s.rows })),
      imageStats: { images: 0, embedded: 0, external: 0, unavailable: 0, assetBytes: 0, assetCount: 0 },
      assets: [],
      timings: { ms },
      sizes: { input: bytes.length, output: new TextEncoder().encode(markdown).length },
    };
  }

  const api = { version: VERSION, isXlsxPayload, convertXlsx, sheetToMarkdown };
  if (typeof window !== 'undefined') window.any2mdXlsx = api;
})();
