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

  /* 打印画布相对「页面可用宽度」的百分比（index.html / pt.html 共用的打印配置）。
     手机自带打印服务常忽略 @page、自带边距且 mm→px 会舍入，留余量可避免横向打印
     多出空白第二页；PC 浏览器按 @page 精确排版，用满幅即可。
     按 UA 判定设备而非窗口宽度：PC 缩窗口、大屏手机横屏都不会误判。
     以 CSS 变量 --print-scale 注入 <html>，两个页面的打印 CSS 都读它。 */
  const MOBILE_PRINT_SCALE = 98;   // 仍有空白第二页就调小（如 90）
  const PC_PRINT_SCALE = 100;      // 若个别 PC 打印机也分页，可改 99
  function isMobileClient() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 桌面 UA
  }
  const PRINT_SCALE = isMobileClient() ? MOBILE_PRINT_SCALE : PC_PRINT_SCALE;
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.style.setProperty('--print-scale', PRINT_SCALE + '%');
  }

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

  /* 只声明纸张方向与零边距；具体尺寸交给 CSS 自适应可用区，避免顶满纸张导致溢出分页。
     手机自带打印服务常忽略 size 里的 orientation，不能依赖它计算页面宽高。 */
  function pageRule(force, landscape) {
    if (!force) return '';
    return `@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:0}`;
  }

  /* 打印态不依赖 print-sheet-mode：系统预览切换纸张方向会重新渲染页面，
     此时 afterprint 往往已触发，class 一旦被移除就会把整个 app 打出来。
     画布位图本身是严格 A4 比例，按 --print-scale 等比缩放即可落在单页内；
     不给 html/body 设 height:100% / overflow:hidden，分页媒体里那样会多算一页。 */
  const PRINT_CSS = `
.print-sheets{display:none}
@media print{
  html,body{margin:0!important;padding:0!important;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body>*:not(#print-sheets){display:none!important}
  #print-sheets{display:block!important;font-size:0;line-height:0}
  #print-sheets .print-sheet{
    display:block;width:var(--print-scale);height:auto;max-width:100%;margin:0 auto;padding:0;border:0;object-fit:contain;object-position:center;
    break-inside:avoid;page-break-inside:avoid;break-after:avoid;page-break-after:avoid}
  #print-sheets .print-sheet:not(:last-child){break-after:page;page-break-after:always}
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
    // 保留打印容器内容与 @page 规则，不要在 afterprint 里清理：
    // 移动端打印预览改动纸张方向时会重新渲染页面，清理后重渲染就只剩空容器或整个 app。
    let rule = document.getElementById('collage-page-rule');
    if (!rule) {
      rule = document.createElement('style');
      rule.id = 'collage-page-rule';
      document.head.appendChild(rule);
    }
    rule.textContent = `@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:0}`;
    rootEl.classList.add('print-sheet-mode');
  }

  function printSheets(canvases, opts) {
    if (typeof window.print !== 'function') return false;
    showSheets(canvases, opts);   // 每次打印都会覆盖上一张，无需额外清理
    window.print();
    return true;
  }

  return { a4Size, composeA4, pageRule, installPrintStyle, showSheets, printSheets, printScale: PRINT_SCALE };
});
