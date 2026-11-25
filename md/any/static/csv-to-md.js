/*!
 * csv-to-md.js — CSV 平铺 Markdown 视图
 *
 * 复用 xlsx-to-md.js 的格式化逻辑，输出与 .xlsx/.xls 完全一致：
 *   ## sheet名（CSV 取文件主名）
 *
 *   ---
 *
 *   年龄: 18
 *   姓名: 张三
 *
 * 纯前端解析，零依赖：支持引号包裹、字段内逗号/换行、"" 转义与 UTF-8 BOM。
 * CSV 无签名，因此只按扩展名或 formatHint 识别，不做内容猜测。
 */
(function () {
  'use strict';

  const VERSION = '1.0.0';

  function isCsvPayload(payload) {
    const p = payload || {};
    const name = String(p.name || '').toLowerCase();
    const hint = String(p.formatHint || '').toLowerCase();
    if (/\.csv$/.test(name)) return true;
    if (hint === 'csv') return true;
    return false;
  }

  // RFC 4180 风格解析：引号包裹、字段内逗号/换行、"" 转义。
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    const s = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (quoted) {
        if (c === '"') {
          if (s[i + 1] === '"') { field += '"'; i++; }
          else quoted = false;
        } else {
          field += c;
        }
        continue;
      }
      if (c === '"' && field === '') { quoted = true; continue; }
      if (c === ',') { row.push(field); field = ''; continue; }
      if (c === '\n' || c === '\r') {
        if (c === '\r' && s[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = ''; continue;
      }
      field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  async function convertCsv(payload) {
    const p = payload || {};
    const bytes = p.bytes instanceof Uint8Array ? p.bytes : new Uint8Array(p.bytes || []);
    const started = Date.now();
    const rows = parseCsv(new TextDecoder('utf-8').decode(bytes));
    // 格式化逻辑统一复用 xlsx-to-md.js，保证 .csv/.xlsx/.xls 输出完全一致
    const formatter = (typeof window !== 'undefined' && window.any2mdXlsx && window.any2mdXlsx.sheetToMarkdown)
      || (typeof require === 'function' ? (() => { try { return require('./xlsx-to-md.js').sheetToMarkdown; } catch (_) { return null; } })() : null);
    if (!formatter) {
      const e = new Error('格式化模块 xlsx-to-md.js 未加载');
      e.code = 'csvFormatterMissing';
      throw e;
    }
    const name = String(p.name || 'csv').replace(/\.csv$/i, '') || 'csv';
    const markdown = rows.length ? formatter(name, rows) : '';
    const ms = Date.now() - started;
    return {
      markdown,
      format: 'csv',
      detectedFormat: 'csv',
      extensionFormat: 'csv',
      renderMode: 'csv-own',
      engineVersion: VERSION,
      sheets: markdown ? [{ name, rows }] : [],
      imageStats: { images: 0, embedded: 0, external: 0, unavailable: 0, assetBytes: 0, assetCount: 0 },
      assets: [],
      timings: { ms },
      sizes: { input: bytes.length, output: new TextEncoder().encode(markdown).length },
    };
  }

  const api = { version: VERSION, isCsvPayload, convertCsv, parseCsv };
  if (typeof window !== 'undefined') window.any2mdCsv = api;
})();
