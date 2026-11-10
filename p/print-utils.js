/*
 * A4 输出与打印（零依赖）
 * 浏览器：window.PrintUtils；CommonJS：module.exports
 *
 * index.html 与 pt.html 共用 A4 尺寸换算、白底合成、@page 规则；
 * pt.html 额外使用 showSheets/printSheets（支持多页输出）。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PrintUtils = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  /* 210×297mm 按 DPI 换算为位图尺寸 */
  function a4Size(landscape, dpi) {
    const d = dpi || 200;
    return {
      w: Math.round((landscape ? 297 : 210) / 25.4 * d),
      h: Math.round((landscape ? 210 : 297) / 25.4 * d)
    };
  }

  /* 把一张图等比合成到白底 A4 画布（contain，不裁剪） */
  function composeA4(src, opts) {
    const o = opts || {};
    const W = a4Size(o.landscape, o.dpi).w;
    const H = a4Size(o.landscape, o.dpi).h;
    const maxUpscale = typeof o.maxUpscale === 'number' ? o.maxUpscale : 2;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    if (src && src.width && src.height) {
      const scale = Math.min(maxUpscale, W / src.width, H / src.height);
      const dw = src.width * scale;
      const dh = src.height * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    return c;
  }

  /* index.html 的打印样式：--a4-w/--a4-h 供 .print-sheet 缩放，减 0.4mm 防止分页 */
  function pageRule(force, landscape, wMm, hMm) {
    if (!force) return '';
    return `@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:0}` +
      `html.print-sheet-mode{--a4-w:${(wMm - 0.4).toFixed(1)}mm;--a4-h:${(hMm - 0.4).toFixed(1)}mm}`;
  }

  const PRINT_CSS = `
.print-sheets{display:none}
@media print{
  html,body{margin:0!important;padding:0!important;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html.print-sheet-mode body>*:not(#print-sheets){display:none!important}
  html.print-sheet-mode #print-sheets{display:block!important}
  html.print-sheet-mode #print-sheets .print-sheet{
    display:block;width:var(--sheet-w,209.6mm)!important;height:var(--sheet-h,296.6mm)!important;
    max-width:none!important;max-height:none!important;margin:0;padding:0;border:0;
    break-inside:avoid;page-break-inside:avoid}
  html.print-sheet-mode #print-sheets .print-sheet:not(:last-child){break-after:page;page-break-after:always}
}
`;

  function installPrintStyle() {
    if (document.getElementById('collage-print-style')) return;
    const style = document.createElement('style');
    style.id = 'collage-print-style';
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
  }

  function ensureHost() {
    let host = document.getElementById('print-sheets');
    if (!host) {
      host = document.createElement('div');
      host.id = 'print-sheets';
      host.className = 'print-sheets';
      document.body.appendChild(host);
    }
    return host;
  }

  /**
   * 把若干张「已经按 A4 比例排好版」的画布挂到打印容器。
   * 传入 HTMLCanvasElement 数组，天然预留多页扩展。
   */
  function showSheets(canvases, opts) {
    const o = opts || {};
    const landscape = !!o.landscape;
    installPrintStyle();
    const host = ensureHost();
    host.innerHTML = '';
    (canvases || []).forEach(c => {
      c.removeAttribute('style');
      c.className = 'print-sheet';
      host.appendChild(c);
    });

    const rootEl = document.documentElement;
    rootEl.style.setProperty('--sheet-w', (landscape ? 296.6 : 209.6) + 'mm');
    rootEl.style.setProperty('--sheet-h', (landscape ? 209.6 : 296.6) + 'mm');

    let rule = document.getElementById('collage-page-rule');
    if (!rule) {
      rule = document.createElement('style');
      rule.id = 'collage-page-rule';
      document.head.appendChild(rule);
    }
    rule.textContent = `@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:0}`;
    rootEl.classList.add('print-sheet-mode');
  }

  function clearSheets() {
    const rootEl = document.documentElement;
    rootEl.classList.remove('print-sheet-mode');
    const host = document.getElementById('print-sheets');
    if (host) host.innerHTML = '';
    const rule = document.getElementById('collage-page-rule');
    if (rule) rule.textContent = '';
  }

  function printSheets(canvases, opts) {
    if (typeof window.print !== 'function') return false;
    showSheets(canvases, opts);
    window.print();
    return true;
  }

  return { a4Size, composeA4, pageRule, installPrintStyle, showSheets, clearSheets, printSheets };
});
