/**
 * topdf.js —— 通用「转文本 PDF」工具，零第三方依赖、无框架依赖。
 *
 * 引入：<script src="./topdf.js"></script>
 *
 *   ToPdf.toTextPdf(source, options)  文本版 PDF：浏览器打印，文字可选中/复制
 *   ToPdf.exportPdf(source, options)  同上（兼容入口）
 *   ToPdf.toHtml(source, options)     导出可独立打开的 HTML 文件并下载
 *
 * source 可以是：
 *   - HTMLElement：克隆 DOM（保留宿主页面渲染后的排版、图片、代码高亮）
 *   - string：默认按纯文本处理（按行）；传 { isHtml: true } 则按 HTML 解析
 *
 * options：
 *   filename     打印/下载的文件名
 *   title        toHtml 生成的页面标题，默认取文件名
 *   isHtml       字符串是否按 HTML 解析
 *   margin       页边距 mm，默认 20（仅 PDF）
 *   onStatus     状态回调 (message)
 *
 * 原理：PDF 把内容放进临时 #topdf-print-area，注入 @media print 只显示该区域，
 * 调用 window.print() 由浏览器「另存为 PDF」；afterprint 时清理临时节点与样式。
 * HTML 导出会把宿主当前 CSS（主题变量、字号、精调排版）内联进完整文档，
 * 令 <html> 带上相同的 data-theme 与根字号，并把 blob: 本地图片转成 data URL 后下载。
 * 不加载任何外部库，也不修改宿主页面原有的 DOM 与样式。均返回 Promise。
 */
(function (global) {
  'use strict';

  var AREA_ID = 'topdf-print-area';
  var STYLE_ID = 'topdf-style';
  var PRINT_STYLE_ID = 'topdf-print-style';
  var busy = false;

  // 自带一套精简排版，用 ID 前缀隔离，不依赖宿主页面，也不污染宿主页面
  var BASE_CSS = `
#topdf-print-area {
  display: block; padding: 0; margin: 0; background: #ffffff; color: #222222;
  overflow: visible !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 11pt; line-height: 1.6; word-break: break-word;
  --bg-primary: #ffffff; --bg-secondary: #f6f8fa; --text-primary: #222222;
  --text-secondary: #666666; --border-color: #dddddd; --code-bg: #f6f8fa;
  --toc-bg: #ffffff; --accent-color: #3498db;
}
#topdf-print-area * { word-break: break-word; }
/* 宿主的 .markdown-body 带 overflow-x:auto，会让打印区变成滚动容器而裁掉后续内容 */
#topdf-print-area .markdown-body {
  overflow: visible !important; height: auto !important; max-height: none !important;
  padding: 0; background: transparent; border-radius: 0;
}
#topdf-print-area h1 { font-size: 1.7em; margin: 0.8em 0 0.5em; padding-bottom: 0.3em; border-bottom: 1px solid #dddddd; }
#topdf-print-area h2 { font-size: 1.4em; margin: 0.8em 0 0.5em; padding-bottom: 0.25em; border-bottom: 1px solid #dddddd; }
#topdf-print-area h3, #topdf-print-area h4, #topdf-print-area h5, #topdf-print-area h6 { margin: 0.8em 0 0.4em; }
#topdf-print-area p { margin: 0 0 0.5em; }
#topdf-print-area ul, #topdf-print-area ol { margin: 0 0 0.8em; padding-left: 1.6em; }
#topdf-print-area li { margin-bottom: 0.2em; }
#topdf-print-area blockquote { margin: 0.8em 0; padding: 0 1em; color: #666666; border-left: 4px solid #dddddd; }
#topdf-print-area table { border-collapse: collapse; width: 100%; margin-bottom: 0.8em; }
#topdf-print-area th, #topdf-print-area td { border: 1px solid #dddddd; padding: 4px 6px; text-align: left; }
#topdf-print-area th { background: #f6f8fa; font-weight: 600; }
#topdf-print-area code { background: #f6f8fa; padding: 1px 3px; border-radius: 3px; font-family: Consolas, Monaco, monospace; font-size: 0.9em; }
#topdf-print-area pre { background: #f6f8fa; padding: 8px 10px; margin-bottom: 0.8em; border: 1px solid #eeeeee; border-radius: 4px; white-space: pre-wrap; overflow: visible; }
#topdf-print-area pre code { background: none; padding: 0; }
#topdf-print-area img { max-width: 100%; height: auto; }
#topdf-print-area img.local-image-missing { border: 0; padding: 0; min-width: 0; min-height: 0; background-image: none; }
#topdf-print-area hr { border: none; border-top: 1px solid #dddddd; margin: 1.2em 0; }
#topdf-print-area a { color: #222222; text-decoration: none; }
#topdf-print-area .code-block-wrapper { position: static; }
#topdf-print-area .mermaid-wrapper { background: #ffffff; border-color: #eeeeee; }
#topdf-print-area .copy-button, #topdf-print-area .mermaid-actions, #topdf-print-area button { display: none !important; }
`;

  // 代码高亮兜底配色：放在宿主 CSS 之前，外部 Prism 主题可读时会被其覆盖；用主题变量自适应明暗
  var TOKEN_CSS = `
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: var(--text-secondary, #6a737d); }
.token.punctuation, .token.operator, .token.entity, .token.variable { color: var(--text-primary, #24292e); }
.token.keyword, .token.atrule, .token.tag, .token.property, .token.constant, .token.symbol, .token.deleted { color: var(--accent-color, #d73a49); }
.token.string, .token.char, .token.attr-value, .token.number, .token.boolean, .token.selector, .token.attr-name, .token.builtin, .token.inserted { color: #0a7d55; }
.token.function, .token.class-name, .token.regex, .token.important { color: #b06f2c; }
`;

  // 导出页只补容器和残留控件，宿主的主题变量、字号与 .markdown-body 精调规则保持原样
  var EXPORT_CSS = `
html, body { margin: 0; padding: 0; }
#topdf-print-area { max-width: 960px; margin: 0 auto; padding: 24px; box-sizing: border-box; }
#topdf-print-area .copy-button, #topdf-print-area .mermaid-actions, #topdf-print-area button { display: none !important; }
#topdf-print-area img.local-image-missing { border: 0; padding: 0; min-width: 0; min-height: 0; background-image: none; }
`;

  function num(value, fallback) {
    var n = parseFloat(value);
    return isNaN(n) ? fallback : n;
  }

  function notify(opts, message) {
    if (opts && typeof opts.onStatus === 'function') {
      try { opts.onStatus(message); } catch (e) { /* 状态回调不应影响导出 */ }
    }
  }

  function hasContent(source) {
    if (!source) return false;
    if (typeof source === 'string') return source.trim().length > 0;
    if (source.nodeType === 1) return String(source.innerHTML || '').trim().length > 0;
    return false;
  }

  function ensureBaseStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = BASE_CSS;
    document.head.appendChild(style);
  }

  function buildArea(source, opts, withBaseStyle) {
    if (withBaseStyle !== false) ensureBaseStyle();
    var old = document.getElementById(AREA_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var area = document.createElement('div');
    area.id = AREA_ID;
    // 不挂 .markdown-body：宿主该类的 overflow-x:auto 会让打印区变成滚动容器；
    // 传入 DOM 时克隆出来的内层元素仍带这个类，排版样式照常生效
    if (source && source.nodeType === 1) {
      var clone = source.cloneNode(true);
      // Vue 的 v-show 会留下内联 display:none，克隆后整篇内容在打印区里就是空的
      if (clone.style && clone.style.display === 'none') clone.style.display = '';
      area.appendChild(clone);
    } else if (opts.isHtml) {
      area.innerHTML = String(source == null ? '' : source);
    } else {
      area.style.whiteSpace = 'pre-wrap';
      String(source == null ? '' : source).split('\n').forEach(function (line) {
        var row = document.createElement('div');
        row.className = 'topdf-line';
        row.textContent = line.length ? line : ' ';
        area.appendChild(row);
      });
    }
    // 去掉预览页的操作控件，PDF 里不需要按钮
    area.querySelectorAll('.copy-button, .mermaid-actions, .back-to-top, button').forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    return area;
  }

  // 把内容放进临时打印区，注入 @media print 只显示该区域，调用系统打印
  function toTextPdf(source, opts) {
    opts = opts || {};
    if (busy) return Promise.reject(new Error('正在生成 PDF，请稍候'));
    if (!hasContent(source)) return Promise.reject(new Error('没有可转换的内容'));
    busy = true;

    var area = buildArea(source, opts);
    area.style.position = 'fixed';
    area.style.left = '-10000px';
    area.style.top = '0';
    area.style.zIndex = '1000';
    document.body.appendChild(area);

    var printStyle = document.createElement('style');
    printStyle.id = PRINT_STYLE_ID;
    printStyle.textContent = `
@page { margin: ${num(opts.margin, 20)}mm; }
@media print {
  html, body {
    display: block !important; height: auto !important; min-height: 0 !important;
    overflow: visible !important; background: #ffffff !important;
  }
  body > *:not(#${AREA_ID}) { display: none !important; }
  #${AREA_ID} {
    display: block !important; position: static !important; left: auto !important; top: auto !important;
    width: auto !important; height: auto !important; max-height: none !important;
    overflow: visible !important; z-index: auto !important;
  }
  #${AREA_ID} img, #${AREA_ID} tr { break-inside: avoid; }
}
`;
    document.head.appendChild(printStyle);

    var oldTitle = document.title;
    if (opts.filename) document.title = String(opts.filename).replace(/\.pdf$/i, '');
    notify(opts, '正在打开打印窗口…');

    return new Promise(function (resolve) {
      var timer;
      var done = function () {
        if (!printStyle.parentNode && !area.parentNode) return;   // 防止重复清理
        global.removeEventListener('afterprint', done);
        clearTimeout(timer);
        if (printStyle.parentNode) printStyle.parentNode.removeChild(printStyle);
        if (area.parentNode) area.parentNode.removeChild(area);
        document.title = oldTitle;
        busy = false;
        notify(opts, '打印窗口已关闭');
        resolve();
      };
      global.addEventListener('afterprint', done);
      timer = setTimeout(done, 300000);   // 兜底：极少数环境不触发 afterprint
      setTimeout(function () { global.print(); }, 50);
    });
  }

  // 收集宿主页面当前生效的 CSS：内联 <style> 直接取文本，外部样式表能读到规则就一并带上
  function collectHostCss() {
    var parts = [];
    Array.prototype.forEach.call(document.styleSheets || [], function (sheet) {
      var node = sheet.ownerNode;
      if (node && (node.id === STYLE_ID || node.id === PRINT_STYLE_ID)) return;
      if (node && node.tagName === 'STYLE') {
        parts.push(node.textContent || '');
        return;
      }
      try {
        var rules = sheet.cssRules;
        if (rules && rules.length) {
          parts.push(Array.prototype.map.call(rules, function (rule) { return rule.cssText; }).join('\n'));
        }
      } catch (e) { /* 跨域样式表不允许读 cssRules，忽略 */ }
    });
    return parts.join('\n');
  }

  function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (ch) { return map[ch]; });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error || new Error('图片读取失败')); };
      reader.readAsDataURL(blob);
    });
  }

  // 预览页里的本地图片是 blob: URL，离开页面就失效，导出时内嵌为 data URL
  function inlineLocalImages(area) {
    if (typeof global.fetch !== 'function') return Promise.resolve(area);
    var imgs = Array.prototype.slice.call(area.querySelectorAll('img'));
    return Promise.all(imgs.map(function (img) {
      var src = img.getAttribute('src') || '';
      if (!/^blob:/i.test(src)) return Promise.resolve();
      return global.fetch(src)
        .then(function (res) { return res.blob(); })
        .then(blobToDataUrl)
        .then(function (dataUrl) { img.setAttribute('src', dataUrl); })
        .catch(function () { /* 取不到就保留原地址，不影响其余内容 */ });
    })).then(function () { return area; });
  }

  function triggerDownload(blob, filename) {
    var url = global.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) link.parentNode.removeChild(link);
    setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
  }

  // 生成完整 HTML 文档：内联宿主当前样式，保留主题与字号，无外部依赖，直接下载
  function toHtml(source, opts) {
    opts = opts || {};
    if (!hasContent(source)) return Promise.reject(new Error('没有可导出的内容'));
    var filename = String(opts.filename || 'document.html').replace(/\.pdf$/i, '.html');
    if (!/\.html?$/i.test(filename)) filename += '.html';
    var title = escapeHtml(opts.title || filename.replace(/\.html?$/i, ''));
    var area = buildArea(source, opts, false);
    // 未关联图片的占位提示在静态文件里没有意义
    area.querySelectorAll('img.local-image-missing').forEach(function (img) {
      img.removeAttribute('title');
    });
    notify(opts, '正在生成 HTML…');

    // [data-theme] 与根字号决定预览页的配色和字体大小，导出页要带上同样的属性
    var root = document.documentElement || {};
    var theme = root.getAttribute ? root.getAttribute('data-theme') : '';
    var themeAttr = theme ? ' data-theme="' + escapeHtml(theme) + '"' : '';
    var fontSize = '';
    try {
      var cs = global.getComputedStyle ? global.getComputedStyle(root) : null;
      fontSize = (cs && cs.fontSize) || (root.style && root.style.fontSize) || '';
    } catch (e) { /* 取不到就沿用宿主 CSS 里的默认字号 */ }
    var sizeAttr = fontSize ? ' style="font-size:' + escapeHtml(fontSize) + '"' : '';

    return inlineLocalImages(area).then(function () {
      var html = '<!DOCTYPE html>\n' +
        '<html lang="zh-CN"' + themeAttr + sizeAttr + '>\n<head>\n' +
        '<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '<title>' + title + '</title>\n' +
        '<style>\n' + TOKEN_CSS + '\n' + collectHostCss() + '\n' + EXPORT_CSS + '</style>\n' +
        '</head>\n<body>\n' + area.outerHTML + '\n</body>\n</html>\n';
      triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), filename);
      notify(opts, 'HTML 已导出');
      return html;
    });
  }

  global.ToPdf = {
    toTextPdf: toTextPdf,
    toHtml: toHtml,
    exportPdf: function (source, opts) {
      return toTextPdf(source, opts);
    }
  };
})(typeof window !== 'undefined' ? window : this);
