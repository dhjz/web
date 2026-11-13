/**
 * todot.js —— 把 Markdown 里的 ```dot 代码块渲染成 SVG。
 *
 * 引入：先加载 @viz-js/viz 的 CDN（window.Viz），再引入本文件。
 *   <script src="https://registry.npmmirror.com/@viz-js/viz/3.31.0/files/dist/viz-global.js"></script>
 *   <script src="./todot.js"></script>
 *
 * 使用：Markdown 渲染进 DOM 之后调用一次后处理，重复调用不会重复挂载。
 *   ToDot.mount(container, fileName)
 *
 * 中文标签处理（三级字体注入、属性块修复、按浏览器实宽压回节点框）
 * 参考 web-docx/src/flowchart.js；这里只出 SVG，不做 PNG 栅格化。
 */
(function (global) {
  'use strict';

  var VIZ_CDNS = [
    'https://registry.npmmirror.com/@viz-js/viz/3.31.0/files/dist/viz-global.js',
    'https://cdn.jsdelivr.net/npm/@viz-js/viz@3.31.0/dist/viz-global.js',
    'https://unpkg.com/@viz-js/viz@3.31.0/dist/viz-global.js'
  ];

  // WASM 自带字体度量里 Verdana 的汉字回退宽度 ≈1em，用它排版才不会把框算窄；
  // 出图前再换成「西文 Verdana + 系统中文字体」的显示字体栈。
  var LAYOUT_FONT = 'Verdana';
  var DISPLAY_FONT = LAYOUT_FONT + ', Microsoft YaHei, PingFang SC, sans-serif';
  // fontname 在 graph / node / edge 上互不继承，三级都要写；每条语句必须自带分号独占一行，
  // 否则 WASM 会把后面的 `a -> b` 当成属性语句的延续而报语法错误。
  var DEFAULTS = [
    'graph [fontname="{font}"];',
    'node [fontname="{font}"];',
    'edge [fontname="{font}"];',
    ''
  ].join('\n');

  var SHAPE_TAGS = { path: 1, polygon: 1, polyline: 1, ellipse: 1, rect: 1, circle: 1 };
  var LABEL_PADDING = 4;
  var vizPromise = null;
  var docName = 'dot';
  var diagramSeq = 0;

  function errText(e) {
    var msg = (e && (e.message || String(e))) || '未知错误';
    return msg.split('\n')[0].slice(0, 300);
  }

  function vizGlobal() {
    return global.Viz && typeof global.Viz.instance === 'function' ? global.Viz : null;
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('无法加载 ' + url)); };
      document.head.appendChild(script);
    });
  }

  // CDN 脚本加载失败时再补一次；成功过就只实例化一次 WASM
  async function loadVizInstance() {
    var api = vizGlobal();
    if (!api) {
      var lastError = null;
      for (var i = 0; i < VIZ_CDNS.length && !api; i++) {
        try {
          await loadScript(VIZ_CDNS[i]);
          api = vizGlobal();
        } catch (e) {
          lastError = e;
        }
      }
      if (!api) throw lastError || new Error('@viz-js/viz 未提供 Viz.instance()');
    }
    return api.instance();
  }

  function ensureViz() {
    if (!vizPromise) {
      vizPromise = loadVizInstance().catch(function (e) {
        vizPromise = null;
        throw e;
      });
    }
    return vizPromise;
  }

  /** 在图体内注入字体默认值；写在 digraph 之前是语法错误，必须放在 { 之后 */
  function injectDefaults(dotText) {
    var head = dotText.replace(/^\s+/, '').toLowerCase();
    if (head.indexOf('digraph') !== 0 && head.indexOf('graph') !== 0 && head.indexOf('strict') !== 0) {
      return dotText;
    }
    var brace = dotText.indexOf('{');
    if (brace < 0) return dotText;
    return dotText.slice(0, brace + 1) + '\n' +
      DEFAULTS.replace(/\{font\}/g, LAYOUT_FONT) + dotText.slice(brace + 1);
  }

  /** Graphviz WASM 解析不了「属性块紧接箭头」：a [x] -> b，拆成两条语句 */
  function repairDot(dotText) {
    return dotText.replace(
      /([A-Za-z0-9_"\u4e00-\u9fa5]+)([ \t]*)\[([^\]]*)\]([ \t]*(?:\r?\n[ \t]*)?)(->|--)/g,
      function (match, id, sp, attrs, gap, arrow) {
        return id + '[' + attrs + '];\n' + id + ' ' + arrow;
      }
    );
  }

  /** 排版字体只负责算框宽，出图时换回中文字体栈；用户自己写的 fontname 不动 */
  function useDisplayFont(svg) {
    Array.prototype.forEach.call(svg.querySelectorAll('[font-family]'), function (el) {
      if (el.getAttribute('font-family') === LAYOUT_FONT) {
        el.setAttribute('font-family', DISPLAY_FONT);
      }
    });
    return svg;
  }

  function unionBox(a, b) {
    if (!a) return b;
    var x = Math.min(a.x, b.x);
    var y = Math.min(a.y, b.y);
    return {
      x: x,
      y: y,
      width: Math.max(a.x + a.width, b.x + b.width) - x,
      height: Math.max(a.y + a.height, b.y + b.height) - y
    };
  }

  /** 用浏览器真实字宽复核，超宽标签用 textLength 压回框内（只压横向） */
  function fitLabelsToShapes(svg) {
    if (!svg || !document.body || typeof svg.querySelectorAll !== 'function') return;
    var host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none';
    host.appendChild(svg);
    document.body.appendChild(host);
    try {
      Array.prototype.forEach.call(svg.querySelectorAll('g.node'), function (node) {
        var box = null;
        Array.prototype.forEach.call(node.children, function (el) {
          if (!SHAPE_TAGS[String(el.tagName).toLowerCase()] || typeof el.getBBox !== 'function') return;
          var b = el.getBBox();
          if (b && b.width > 0 && b.height > 0) box = unionBox(box, b);
        });
        var limit = box ? box.width - 2 * LABEL_PADDING : 0;
        if (!(limit > 0)) return;
        Array.prototype.forEach.call(node.querySelectorAll('text'), function (text) {
          if (typeof text.getComputedTextLength !== 'function') return;
          var width = text.getComputedTextLength();
          if (!(width > limit)) return;
          text.setAttribute('textLength', limit.toFixed(2));
          text.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        });
      });
    } catch (e) {
      // 某些浏览器量不了字宽：宁可放过，也别让整张图渲染挂掉
    } finally {
      if (svg.parentNode === host) host.removeChild(svg);
      host.remove();
    }
  }

  function setStatus(diagram, message, isError, source) {
    if (!document.body.contains(diagram)) return;
    diagram.textContent = '';
    var box = document.createElement('div');
    box.className = isError ? 'mermaid-error' : 'dot-status';
    box.textContent = message;
    diagram.appendChild(box);
    if (isError && source) {
      var pre = document.createElement('pre');
      pre.textContent = source;
      diagram.appendChild(pre);
    }
  }

  function flash(button, text) {
    var original = button.textContent;
    button.textContent = text;
    setTimeout(function () { button.textContent = original; }, 1800);
  }

  function fallbackCopy(text) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (e) {
      return false;
    }
  }

  async function copyText(text, button) {
    var ok = false;
    try {
      if (navigator.clipboard && global.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) { /* 退回 execCommand */ }
    if (!ok) ok = fallbackCopy(text);
    flash(button, ok ? '已复制' : '复制失败');
  }

  /** 生成能独立打开的 SVG：补命名空间、尺寸与白底 */
  function buildSvgCode(diagram) {
    var svg = diagram.querySelector('svg');
    if (!svg) return null;
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    var vb = (clone.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    var hasVB = vb.length === 4 && vb.every(function (n) { return !isNaN(n); });
    if (hasVB) {
      var pad = 6;
      var vx = vb[0] - pad, vy = vb[1] - pad;
      var vw = vb[2] + pad * 2, vh = vb[3] + pad * 2;
      clone.setAttribute('viewBox', [vx, vy, vw, vh].join(' '));
      clone.setAttribute('width', String(vw));
      clone.setAttribute('height', String(vh));
      clone.removeAttribute('style');
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', vx);
      rect.setAttribute('y', vy);
      rect.setAttribute('width', vw);
      rect.setAttribute('height', vh);
      rect.setAttribute('fill', '#ffffff');
      clone.insertBefore(rect, clone.firstChild);
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg(diagram) {
    var code = buildSvgCode(diagram);
    if (!code) return false;
    var index = diagram.getAttribute('data-index') || (++diagramSeq);
    var url = URL.createObjectURL(new Blob([code], { type: 'image/svg+xml;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = docName + '-dot-' + index + '.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return true;
  }

  function makeButton(label, handler) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mermaid-btn';
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function createActions(diagram, source) {
    var actions = document.createElement('div');
    actions.className = 'mermaid-actions';
    actions.appendChild(makeButton('复制源码', function () { copyText(source, this); }));
    actions.appendChild(makeButton('复制SVG', function () {
      var button = this;
      var code = buildSvgCode(diagram);
      if (code) copyText(code, button);
      else flash(button, '尚未渲染完成');
    }));
    actions.appendChild(makeButton('下载SVG', function () {
      if (!downloadSvg(diagram)) flash(this, '尚未渲染完成');
    }));
    return actions;
  }

  async function renderBlock(diagram) {
    var source = diagram.getAttribute('data-code') || '';
    setStatus(diagram, 'Graphviz WASM 加载中…');
    var viz;
    try {
      if (typeof global.WebAssembly !== 'object') throw new Error('当前环境不支持 WebAssembly');
      viz = await ensureViz();
    } catch (e) {
      setStatus(diagram, 'Graphviz WASM 加载失败：' + errText(e), true, source);
      return;
    }
    if (!document.body.contains(diagram)) return; // 文档已切换，丢弃过期渲染
    setStatus(diagram, 'Graphviz 渲染中…');
    try {
      var svg = viz.renderSVGElement(repairDot(injectDefaults(source)));
      useDisplayFont(svg);
      fitLabelsToShapes(svg);
      if (!document.body.contains(diagram)) return;
      diagram.textContent = '';
      diagram.appendChild(svg);
    } catch (e) {
      setStatus(diagram, 'DOT 渲染失败：' + errText(e), true, source);
    }
  }

  /** 扫描容器里的 ```dot / ```graphviz 代码块并替换成渲染容器 */
  function mount(container, fileName) {
    if (!container) return;
    if (fileName) docName = String(fileName).replace(/\.[^.]+$/, '') || 'dot';
    var codes = Array.prototype.slice.call(container.querySelectorAll('pre > code'))
      .filter(function (code) {
        return /(^|\s)(language|lang)-(dot|graphviz)(\s|$)/.test(code.className);
      });
    codes.forEach(function (code) {
      var pre = code.parentElement;
      var source = (code.textContent || '').replace(/\n$/, '');
      var wrapper = document.createElement('div');
      wrapper.className = 'mermaid-wrapper dot-wrapper';
      var diagram = document.createElement('div');
      diagram.className = 'dot-diagram';
      diagram.setAttribute('data-code', source);
      diagram.setAttribute('data-index', String(++diagramSeq));
      wrapper.appendChild(diagram);
      wrapper.appendChild(createActions(diagram, source));
      pre.replaceWith(wrapper);
      renderBlock(diagram);
    });
  }

  /** 主题切换等场景可手动重渲染已挂载的图 */
  function renderAll(container) {
    if (!container) return;
    Array.prototype.forEach.call(container.querySelectorAll('.dot-diagram'), renderBlock);
  }

  global.ToDot = { mount: mount, renderAll: renderAll, buildSvgCode: buildSvgCode };
})(window);
