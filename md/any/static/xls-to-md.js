/*!
 * xls-to-md.js — Excel(.xls, BIFF8) 平铺 Markdown 视图
 *
 * 复用页面已加载的 xlsx-to-md.js 做 Markdown 格式化，输出与 .xlsx 完全一致：
 *   ## sheet名
 *
 *   ---
 *
 *   年龄: 18
 *   姓名: 张三
 *
 * 解析层按需加载本地 vendor/xls-reader.js（MIT，零运行时依赖）。
 */
(function () {
  'use strict';

  const VERSION = '1.0.0';

  // 脚本顶层捕获自身 URL（异步调用时 document.currentScript 已为 null）
  const scriptUrl = (typeof document !== 'undefined' && document.currentScript)
    ? document.currentScript.src
    : (typeof __filename !== 'undefined' ? 'file://' + __filename : '');

  let readerPromise = null;
  function loadReader() {
    if (!readerPromise) {
      const url = new URL('./vendor/xls-reader.js', scriptUrl || 'file:///');
      readerPromise = import(/* @vite-ignore */ url.href);
    }
    return readerPromise;
  }

  function cellToText(cell) {
    if (cell == null) return '';
    if (cell instanceof Date) return cell.toISOString();
    if (typeof cell === 'object' && typeof cell.code === 'string' && typeof cell.toString === 'function') return cell.toString();
    return String(cell);
  }

  function isXlsPayload(payload) {
    const p = payload || {};
    const name = String(p.name || '').toLowerCase();
    const hint = String(p.formatHint || '').toLowerCase();
    if (/\.xls$/.test(name)) return true;
    if (hint === 'xls') return true;
    const bytes = p.bytes instanceof Uint8Array ? p.bytes : new Uint8Array(p.bytes || []);
    // OLE2/CFB signature: D0 CF 11 E0 A1 B1 1A E1。
    // 只用于文件名/提示都缺失时兜底，避免把 doc/xls 混淆的文件误判。
    return bytes.length > 8 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1 && !name && !hint;
  }

  async function convertXls(payload) {
    const p = payload || {};
    const bytes = p.bytes instanceof Uint8Array ? p.bytes : new Uint8Array(p.bytes || []);
    const started = Date.now();
    let reader;
    try {
      reader = await loadReader();
    } catch (err) {
      const e = new Error(`xls 解析模块加载失败: ${err?.message || err}`);
      e.code = 'xlsModuleError';
      throw e;
    }
    let workbook;
    try {
      workbook = reader.readXls(bytes);
    } catch (err) {
      const e = new Error(`xls 读取失败: ${err?.message || err}`);
      e.code = 'xlsReadError';
      throw e;
    }
    // 格式化逻辑统一复用 xlsx-to-md.js，保证 .xls/.xlsx 输出完全一致
    const formatter = (typeof window !== 'undefined' && window.any2mdXlsx && window.any2mdXlsx.sheetToMarkdown)
      || (typeof require === 'function' ? (() => { try { return require('./xlsx-to-md.js').sheetToMarkdown; } catch (_) { return null; } })() : null);
    if (!formatter) {
      const e = new Error('格式化模块 xlsx-to-md.js 未加载');
      e.code = 'xlsFormatterMissing';
      throw e;
    }
    const sheets = (workbook.sheets || [])
      .map(sheet => {
        const rows = (sheet.rows || []).map(row => (row || []).map(cellToText));
        return { name: sheet.name, rows, markdown: formatter(sheet.name, rows) };
      })
      .filter(s => s.markdown); // 空表不纳入输出
    const markdown = sheets.length ? sheets.map(s => s.markdown).join('\n\n') + '\n' : '';
    const ms = Date.now() - started;
    return {
      markdown,
      format: 'xls',
      detectedFormat: 'xls',
      extensionFormat: 'xls',
      renderMode: 'xls-own',
      engineVersion: VERSION,
      sheets: sheets.map(s => ({ name: s.name, rows: s.rows })),
      imageStats: { images: 0, embedded: 0, external: 0, unavailable: 0, assetBytes: 0, assetCount: 0 },
      assets: [],
      timings: { ms },
      sizes: { input: bytes.length, output: new TextEncoder().encode(markdown).length },
    };
  }

  const api = { version: VERSION, isXlsPayload, convertXls };
  if (typeof window !== 'undefined') window.any2mdXls = api;
})();
