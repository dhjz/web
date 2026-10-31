/*!
 * excel2md.js — 表格转 Markdown 通用库（纯原生，零依赖）
 *
 * 能力：
 *  - 传入 HTML，提取全部 <table> 转成 Markdown；表头相同的表格自动合并并标注「(N表合并)」
 *  - 净化：剔除样式/脚本/冗余标签，只留 table/tr/td/th 等结构 + 文本
 *  - 粘贴监听：解析 Word / Excel / 浏览器复制的表格（可含多个表格、表格外的文字）
 *  - 也吃 Markdown 源码、TSV/CSV 文本（从 Excel 直接复制常是这种格式）
 *  - 不依赖浏览器：Node 下可 require，粘贴监听相关逻辑自动跳过
 *
 * API：
 *  excel2md.html('<table>...</table>', opts)   // HTML / 元素 -> markdown 字符串，没有表格返回 ''
 *  excel2md.parse(input, opts)                 // 同 html，返回 { markdown, kind }
 *  excel2md.parseAny({ html, text }, opts)     // 返回 { markdown, tables, groups, texts, segments, kind }
 *  excel2md.clipboard(event.clipboardData)     // 剪贴板 -> parseAny 结果
 *  excel2md.bind(target, { onResult, onText })  // 监听粘贴（真粘贴 + 手写 HTML 源码），返回解绑函数
 *  excel2md.detect(text)                       // 'html' | 'markdown' | 'tsv' | 'csv' | 'unknown'
 *  excel2md.clean(html)                        // 净化后按表格返回模型 [{ caption, rows, merged, spans }]
 *  excel2md.toMarkdown(tableOrTables, opts)    // 表格模型 -> markdown
 *  excel2md.toHtmlTables(tableOrTables, opts)  // 表格模型 -> 保留合并的 HTML 表格（Markdown 表达不了合并时用）
 *  excel2md.htmlClean(src)                     // 净化 HTML：只留表格结构 + rowspan/colspan，样式全剥（Node 可用）
 *  excel2md.escapeCell('a|b')                  // 单元格转义
 *
 * format（决定 parseAny 结果里 html 那一格装什么）：
 *  'markdown'  只出 Markdown 表格（默认），html 留空
 *  'raw'       原始 HTML：表格用源里的原文（Word/Excel 的样式、mso-* 类名、内联字体全在），
 *              表格外的文字按原顺序落成 <p>，不含表格时返回 ''
 *  'clean'     净化 HTML：只留 table/tr/td/th + colspan/rowspan，样式、脚本、图片、装饰标签全剥
 *
 * clean() 返回的每张表带 `source`——该表在原 HTML 里的原文，逐字未改；
 * 被合并成一组的多张表没有单段原文，raw 输出时按模型重建（样式不带）。
 *
 * opts：
 *  merge            表头相同的表格合并，默认 true
 *  compareDepth     参与表头比较的列数，默认 0（整行表头比较；只比首列可设 1）
 *  heading          多表时输出 #### 标题，默认 true
 *  titlePrefix      标题前缀，默认 '表格' ->「#### 表格1(3表合并)」
 *  keepText         表格外的文字，默认 true；false 时只留表格（Word 里的前言后记全丢）
 *                   开启时按原文顺序穿插在表格之间，不是堆到最前面
 *  showMergeCount   标题里标注 (N表合并)，默认 true
 *  delimiter        TSV/CSV 分隔符，默认自动
 *  headingAsHash    标题转成 # 号：h1-h6 -> # / ## ..., # 后面跟一个空格；默认 false
 *                   只作用在 markdown 输出：净化 HTML 里仍是 <hN>，原始 HTML 更不动
 *                   纯文字一行一个标题，同一行后面的正文另起一段，标题之下留空行
 *  mergeCells       colspan/rowspan 的填法，默认 'blank'
 *                   'blank'   平铺 + 空占位，只保留左上角的值（标准 Markdown 做法，行列不丢）
 *                   'fill'    把合并单元格的值复制到它覆盖的每一格
 *                   'section' 合并单元格单独成一行，用「↕ 跨N行」/「↔ 跨N列」标注，便于人读
 *                   'html'    该表降级成 HTML 表格输出，完整保留 rowspan/colspan
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define(factory);
  else root.excel2md = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. 净化
   * ------------------------------------------------------------------ */

  // 内容直接丢弃的标签
  var DROP_TAGS = [
    'script', 'style', 'link', 'meta', 'noscript', 'iframe', 'object', 'embed',
    'svg', 'canvas', 'img', 'audio', 'video', 'input', 'button', 'select',
    'textarea', 'template', 'head'
  ];
  // 绝对路径 / 本地盘符 / Office 临时目录：从 Word 复制出来的图片 src 长这样，页面里必然加载失败
  var LOCAL_SRC = /^(?:file:|[a-zA-Z]:[\\/]|\\\\|\.\.[\\/])/;
  // 无意义但内容要保留的行内标签：直接拆掉
  var UNWRAP_TAGS = [
    'html', 'body', 'div', 'p', 'span', 'font', 'b', 'strong', 'i', 'em', 'u',
    's', 'strike', 'del', 'ins', 'sub', 'sup', 'small', 'big', 'mark', 'label',
    'a', 'o:p', 'st1', 'section', 'article', 'header', 'footer', 'main'
  ];
  // 结构标签
  var KEEP_TAGS = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption'];

  var CHAR_ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

  function decodeEntities(str) {
    return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, function (all, code) {
      var lower = code.toLowerCase();
      if (CHAR_ENTITIES[lower] !== undefined) return CHAR_ENTITIES[lower];
      if (lower.charAt(0) === '#') {
        var num = lower.charAt(1) === 'x' ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
        return isNaN(num) || num === 160 ? ' ' : String.fromCodePoint(num);
      }
      return all;
    });
  }

  // 表格单元格里不该出现换行，统一压成空格（<br> 已在 tokenize 前转成占位符时单独处理）
  function cleanText(text) {
    return text.replace(/[ \t\r\n\f\v\u00a0]+/g, ' ').trim();
  }

  // 把 HTML 切成 token：丢弃标签、拆掉无意义标签、只留结构标签
  // 表格外的文字单独记一份：ParseTables 的 cells 里只该有单元格文本
  function tokenize(html) {
    var tokens = [];
    var outside = [];
    var pos = 0;
    var re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/?([a-zA-Z][a-zA-Z0-9:_-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
    var m;

    function pushText(raw) {
      if (!raw) return;
      var text = cleanText(decodeEntities(raw));
      if (!text) return;
      // 表格外（或未闭合 table 之前）的文字留着，raw 输出按原文顺序放回 <p>
      var last = tokens[tokens.length - 1];
      if (!last || last.type === 'close' || (last.type === 'open' && last.tag === 'table')) {
        outside.push(text);
      }
      tokens.push({ type: 'text', value: text });
    }

    while ((m = re.exec(html))) {
      pushText(html.slice(pos, m.index));
      pos = re.lastIndex;
      if (!m[1]) continue; // 注释、doctype

      var tag = m[1].toLowerCase();
      var isEnd = m[0].charAt(1) === '/';
      var attrsRaw = m[2] || '';

      if (tag === 'br') {
        if (!isEnd) tokens.push({ type: 'br' });
        continue;
      }
      if (DROP_TAGS.indexOf(tag) > -1) {
        // 丢弃标签本身，成对标签的内容也一起丢
        if (!isEnd && !/\/>$/.test(m[0])) {
          var closeRe = new RegExp('</' + tag + '\\s*>', 'i');
          var rest = html.slice(pos);
          var cm = rest.match(closeRe);
          if (cm) {
            pos += cm.index + cm[0].length;
            re.lastIndex = pos;
          }
        }
        continue;
      }
      if (UNWRAP_TAGS.indexOf(tag) > -1) continue;
      if (KEEP_TAGS.indexOf(tag) === -1) continue; // 未知标签：保留内容、丢弃壳

      if (isEnd) {
        tokens.push({ type: 'close', tag: tag, end: m.index + m[0].length });
      } else {
        tokens.push({ type: 'open', tag: tag, attrs: parseAttrs(attrsRaw), start: m.index });
      }
    }
    pushText(html.slice(pos));
    tokens.outside = outside;
    return tokens;
  }

  function parseAttrs(raw) {
    var attrs = {};
    var re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    var m;
    while ((m = re.exec(raw))) {
      var name = m[1].toLowerCase();
      var value = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5] !== undefined ? m[5] : '';
      attrs[name] = decodeEntities(value);
    }
    return attrs;
  }

  // 按 spans 还原成 HTML 表格（Markdown 表达不了合并时用这个兜底）
  function htmlTableRows(rows, spans) {
    var covered = {};
    var byRow = {};
    (spans || []).forEach(function (s) {
      (byRow[s.row] = byRow[s.row] || []).push(s);
      for (var i = 0; i < s.rowspan; i++) {
        for (var j = 0; j < s.colspan; j++) covered[(s.row + i) + ',' + (s.col + j)] = true;
      }
    });
    var out = ['<table>'];
    for (var r = 0; r < rows.length; r++) {
      out.push('<tr>');
      var anchors = {};
      (byRow[r] || []).forEach(function (s) { anchors[s.col] = s; });
      for (var c = 0; c < rows[r].length; c++) {
        if (covered[r + ',' + c] && !anchors[c]) continue;
        var s = anchors[c];
        var tag = r === 0 ? 'th' : 'td';
        var attr = '';
        if (s) {
          if (s.colspan > 1) attr += ' colspan="' + s.colspan + '"';
          if (s.rowspan > 1) attr += ' rowspan="' + s.rowspan + '"';
        }
        out.push('<' + tag + attr + '>' + htmlEscape(rows[r][c]) + '</' + tag + '>');
      }
      out.push('</tr>');
    }
    out.push('</table>');
    return out.join('');
  }

  /* ------------------------------------------------------------------ *
   * 2. 结构解析：token -> 表格模型
   * ------------------------------------------------------------------ */

  function spanOf(value, max) {
    var n = parseInt(value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (max && n > max) n = max;
    return n;
  }

  // 从 col 起连续 width 列里是否已被上方 rowspan 占用
  function occupied(base, col, width) {
    for (var i = 0; i < width; i++) if (base[col + i] > 0) return true;
    return false;
  }

  // 表格构建器：直接吃 token，嵌套表格各自独立成表
  function TableBuilder() {
    this.rows = [];      // 每行已收集的单元格
    this.rowspans = [];  // rowspans[r] = { col: rowspanLeft }，用于跳过被占用的列
    this.caption = '';
    this.captionDepth = 0;
    this.nested = [];    // 嵌套表格（先于外层输出）
    this.start = -1;     // 原 HTML 里的起止下标，raw 输出时直接切原文
    this.end = -1;
  }

  TableBuilder.prototype.startRow = function () {
    this.rows.push([]);
    this.current = null;
  };

  TableBuilder.prototype.cell = function (colspan, rowspan) {
    if (!this.rows.length) this.startRow();
    var r = this.rows.length - 1;
    var base = this.rowspans[r] || (this.rowspans[r] = {});
    // 从本行已排到的最右列继续往后找一段连续空位（colspan 要整段都空着）
    var col = 0;
    this.rows[r].forEach(function (c) { col = Math.max(col, c.col + c.colspan); });
    while (occupied(base, col, colspan)) col++;
    var cell = { text: '', colspan: colspan, rowspan: rowspan, col: col };
    this.rows[r].push(cell);
    for (var i = 0; i < colspan; i++) {
      for (var j = 1; j < rowspan; j++) {
        var next = this.rowspans[r + j] || (this.rowspans[r + j] = {});
        next[col + i] = (next[col + i] || 0) + 1;
      }
    }
    this.current = cell;
    return cell;
  };

  TableBuilder.prototype.build = function () {
    var self = this;
    var colCount = 0;
    var cells = this.rows.map(function (row) {
      var map = {};
      row.forEach(function (c) { map[c.col] = c; });
      var width = 0;
      row.forEach(function (c) { width = Math.max(width, c.col + c.colspan); });
      colCount = Math.max(colCount, width);
      return map;
    });
    var matrix = cells.map(function (map) {
      var out = [];
      for (var c = 0; c < colCount; c++) out.push(map[c] ? map[c].text : '');
      return out;
    });
    // spans：合并单元格锚点 [{row, col, rowspan, colspan}]，Markdown 表达不了合并，交给调用方决策
    var spans = [];
    self.rows.forEach(function (row, r) {
      row.forEach(function (c) {
        if (c.rowspan > 1 || c.colspan > 1) {
          spans.push({ row: r, col: c.col, rowspan: c.rowspan, colspan: c.colspan, text: c.text });
        }
      });
    });
    var result = {
      caption: cleanText(self.caption),
      rows: matrix,
      merged: spans.length > 0,
      spans: spans,
      start: self.start,
      end: self.end,
      source: ''
    };
    return result;
  };

  /* 表格原文：定位得到就按开合标签配对切出来（样式/属性全在）；定位不到（片段被截断）
   * 返回 ''，由 rawSlot() 按模型重新拼一份。
   * 不用 tokenizer 记下的 start/end：那条路径跳过 <style> 内容时会连带跳过标签，
   * 下标照样是原文坐标，但 end 常常落在闭合的 > 之前。开合配对更稳。 */
  function rawOf(table, html) {
    var source = String(html == null ? '' : html);
    table.htmlSource = source;
    table.sliceAt = table.start >= 0 ? source.indexOf('<table', table.start) : -1;
    if (table.sliceAt < 0) table.sliceAt = table.start;
    var slice = table.sliceAt >= 0 ? tableSlice(source, table.sliceAt) : '';
    table.sourceIsRaw = !!slice;
    table.source = slice;
    return slice;
  }

  function parseTables(html) {
    var tokens = tokenize(html);
    var tables = [];
    tables.outside = tokens.outside || [];
    var stack = [];

    function top() { return stack[stack.length - 1] || null; }
    function ensure() {
      var t = top();
      if (!t) { t = new TableBuilder(); stack.push(t); }
      return t;
    }
    function finish() {
      var t = stack.pop();
      if (!t) return;
      tables.push.apply(tables, t.nested);
      var table = t.build();
      if (table.rows.length) tables.push(table);
    }

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var cur = top();

      if (t.type === 'text' || t.type === 'br') {
        if (!cur) continue;
        var text = t.type === 'br' ? ' ' : t.value;
        if (cur.captionDepth > 0) { cur.caption += text; continue; }
        if (cur.current) cur.current.text += text;
        continue;
      }

      if (t.type === 'open') {
        if (t.tag === 'table') {
          // 嵌套：另起一个 builder，出来时挂到外层，先于外层输出
          var fresh = new TableBuilder();
          fresh.start = t.start; // 原文区间：raw 输出时直接切这一段，不重新拼
          stack.push(fresh);
          continue;
        }
        if (t.tag === 'caption') { ensure().captionDepth++; continue; }
        if (t.tag === 'tr') { ensure().startRow(); continue; }
        if (t.tag === 'td' || t.tag === 'th') {
          ensure().cell(spanOf(t.attrs.colspan), spanOf(t.attrs.rowspan));
          continue;
        }
        continue;
      }

      // close
      if (t.tag === 'caption') {
        if (cur && cur.captionDepth > 0) cur.captionDepth--;
        continue;
      }
      if (t.tag === 'td' || t.tag === 'th') {
        // 单元格内的文本已经累积完毕，后续 token 不再属于它
        if (cur) cur.current = null;
        continue;
      }
      if (t.tag === 'table') {
        var done = stack.pop();
        if (!done) continue;
        if (t.end >= 0) done.end = t.end;
        var built = done.build();
        var owner = top();
        if (owner) {
          if (built.rows.length) owner.nested.push(built);
        } else if (built.rows.length) {
          tables.push.apply(tables, done.nested);
          tables.push(built);
        }
      }
    }
    // 未闭合的 table（片段被截断）
    while (stack.length) finish();
    return tables;
  }

  /* ------------------------------------------------------------------ *
   * 3. Markdown 输出
   * ------------------------------------------------------------------ */

  function escapeCell(text) {
    return String(text == null ? '' : text)
      .replace(/([\\|])/g, '\\$1')
      .replace(/\r?\n/g, ' ');
  }

  function mdTableRows(rows) {
    var head = rows[0] || [];
    var lines = ['| ' + head.map(escapeCell).join(' | ') + ' |'];
    lines.push('| ' + head.map(function () { return '---'; }).join(' | ') + ' |');
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i].slice();
      while (row.length < head.length) row.push('');
      lines.push('| ' + row.map(escapeCell).join(' | ') + ' |');
    }
    return lines.join('\n');
  }

  function mdTable(table) {
    return mdTableRows(table.rows);
  }

  /* 合并单元格的四种填法：blank / fill / section / html */

  function spanLabel(span) {
    var parts = [];
    if (span.rowspan > 1) parts.push('\u2195 跨' + span.rowspan + '行');
    if (span.colspan > 1) parts.push('\u2194 跨' + span.colspan + '列');
    return parts.join(' ');
  }

  // 把合并覆盖到的格子填上同一个值
  function fillSpans(rows, spans) {
    var out = rows.map(function (r) { return r.slice(); });
    spans.forEach(function (s) {
      for (var i = 0; i < s.rowspan; i++) {
        for (var j = 0; j < s.colspan; j++) {
          if (!out[s.row + i]) out[s.row + i] = [];
          out[s.row + i][s.col + j] = s.text;
        }
      }
    });
    return out;
  }

  // 主表保持空白平铺，另加一段「合并单元格」清单，一行一个合并块
  function sectionRows(table) {
    var rows = table.rows;
    var spans = table.spans || [];
    var lines = mdTableRows(rows).split('\n');
    if (!spans.length) return lines.join('\n');
    lines.push('');
    lines.push('**合并单元格**');
    lines.push('');
    lines.push('| 内容 | 位置 | 合并 |');
    lines.push('| --- | --- | --- |');
    spans.forEach(function (s) {
      lines.push('| ' + escapeCell(s.text || '（空）') + ' | 第' + (s.row + 1) + '行第' + (s.col + 1) + '列 | ' +
        spanLabel(s) + ' |');
    });
    return lines.join('\n');
  }

  function htmlEscape(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------ *
   * 3.5 HTML 输出：原样 / 净化 / 按版面重建
   * ------------------------------------------------------------------ */

  /**
   * 净化 HTML：按版面重建，只留 table/tr/th/td + colspan/rowspan。
   * 表格外的文字按原顺序落成 <p>（keepText: false 时丢）。
   */
  function cleanHtml(layout, opts) {
    return layoutHtml(layout, collectGroups(layout, opts), opts, cleanSlot(opts));
  }

  // 表头那行包一层 thead，跟源里的真实结构对上（合并单元格跨到表头行时不包）
  function decorate(tableHtml, spans) {
    var headSpan = (spans || []).some(function (s) { return s.row === 0 && s.rowspan > 1; });
    if (headSpan) return tableHtml;
    return tableHtml.replace(/<tr>([\s\S]*?)<\/tr>/, function (all, inner) {
      return /<th\b/.test(inner) ? '<thead><tr>' + inner + '</tr></thead>' : all;
    });
  }

  // 没有版面（非 HTML 输入 / 定位不到表格原文）时的兜底：先文字后表格，按原文顺序
  function modelHtml(tables, outside, opts, slot) {
    var groups = collectGroups({ tables: tables, segments: tables.map(function (t) {
      return { type: 'table', table: t };
    }) }, opts);
    var parts = [];
    if (opts.keepText) (outside || []).forEach(function (t) { parts.push(slot.text(t)); });
    groups.forEach(function (g) { parts.push(slot.table(g)); });
    return parts.join('\n');
  }

  // 按版面重建整页 HTML：文字块 / 表格 / 文字块…，同表头的表格只在第一次出现处出一次。
  // slot 决定表格用原文还是净化版
  function layoutHtml(layout, groups, opts, slot) {
    var groupOf = new Map();
    groups.forEach(function (g) {
      for (var i = 0; i < g.tables.length; i++) groupOf.set(g.tables[i], g);
    });
    var done = new Set();
    var parts = [];
    layout.segments.forEach(function (seg) {
      if (seg.type === 'text') {
        if (opts.keepText) parts.push(slot.text(seg));
        return;
      }
      var g = groupOf.get(seg.table);
      if (!g || done.has(g)) return;
      done.add(g);
      parts.push(slot.table(g));
    });
    return parts.join('\n');
  }

  // 原文槽：文字退回 <p>，表格用源里的原文（逐字未改，Word/Excel 的样式全在）；
  // 没有原文的（TSV 贴过来、片段被截断）按模型拼一份，保证这一路永远有东西可出。
  // 同表头的表合并成一组时，模型里的 rows 已经接好了，绝不能只吐第一张表的原文
  function rawSlot(notes) {
    return {
      // 文字块带原始标签：h1-h6 还是 h1-h6，font-size / font-family / 颜色全在
      text: function (seg) {
        var block = seg && seg.block;
        if (block && typeof block.html === 'function') return block.html(notes);
        return '<p>' + htmlEscape(typeof seg === 'string' ? seg : (seg && seg.text) || '') + '</p>';
      },
      table: function (g) {
        var first = g.tables[0];
        // 单表逐字用原文；合并组拼不成一段原文，按模型重建（样式不带，README 里写明了）
        if (g.count <= 1) {
          var slice = first.sourceIsRaw ? first.source : sourceOrModel(first, notes);
          if (slice) return repairHtml(slice, notes);
        }
        return htmlTableRows(g.rows, g.spans || []);
      }
    };
  }

  /* 标题转 # 号（opts.headingAsHash）。
   * h1-h6 -> # * 层级 + 一个空格；标题这一行只放标题，同一行后面的正文另起一行，
   * 标题之下留空行 —— 跟表格外文字一样，Markdown 里用空行断段才不会被并成一行。
   * 只认真正的 <hN> 标签，不猜「短句 + 粗体」。 */

  var HASH_BLOCK_RE = /(<h([1-6])\b[^>]*>)([\s\S]*?)(<\/h\2\s*>)/gi;

  // 一段带标签的 HTML -> 标题行。返回 null 表示这段里没有标题
  function hashHeadings(html) {
    var src = String(html == null ? '' : html);
    if (!/<h[1-6]\b/i.test(src)) return null;
    var parts = [];
    var pos = 0;
    var m;
    HASH_BLOCK_RE.lastIndex = 0;
    while ((m = HASH_BLOCK_RE.exec(src))) {
      var before = plainText(src.slice(pos, m.index));
      if (before) parts.push({ head: false, text: before });
      var level = Math.min(6, Math.max(1, Number(m[2]) || 1));
      var body = plainText(m[3]);
      if (body) parts.push({ head: true, level: level, text: body });
      pos = HASH_BLOCK_RE.lastIndex;
    }
    var rest = plainText(src.slice(pos));
    if (rest) parts.push({ head: false, text: rest });
    return parts.length ? parts : null;
  }

  // 带标签的一段 -> 纯文本：块级标签断行，<br> 断行，实体解码，行尾空白收掉
  function plainText(html) {
    return String(html == null ? '' : html)
      .replace(/<br\b[^>]*>/gi, '\n')
      .replace(/<\/(?:p|div|li|tr|blockquote|pre|h[1-6])\s*>/gi, '\n')
      .replace(TAG_RE, '')
      .split('\n')
      .map(function (line) { return cleanText(decodeEntities(line)); })
      .filter(function (line) { return line !== ''; })
      .join('\n');
  }

  // 标题写成「# 文字」，一段里多个标题按行排开
  function headingText(parts) {
    var out = [];
    parts.forEach(function (p) {
      if (p.head) {
        out.push(p.text.split('\n').map(function (line) {
          return new Array(p.level + 1).join('#') + ' ' + line;
        }).join('\n'));
        return;
      }
      out.push(p.text);
    });
    return out.join('\n');
  }

  /* Markdown 结果按段落重排：带 <hN> 的文字块写成标题行，
   * 其余段落和表格照旧 —— 顺序就是版面顺序（同 renderLayout）。 */
  function markdownFromBlocks(layout, opts) {
    var groups = collectGroups(layout, opts);
    var groupOf = new Map();
    groups.forEach(function (g) {
      for (var i = 0; i < g.tables.length; i++) groupOf.set(g.tables[i], g);
    });
    var only = {};
    for (var k in opts) only[k] = opts[k];
    only.tablesOnly = true;

    var parts = [];
    var done = new Set();
    layout.segments.forEach(function (seg) {
      if (seg.type === 'text') {
        var text = isHeadingBlock(seg) ? headingTexts(headingSource(seg)) : seg.text;
        if (opts.keepText && parts[parts.length - 1] !== text) parts.push(text);
        return;
      }
      var g = groupOf.get(seg.table);
      if (!g || done.has(g)) return;
      done.add(g);
      parts.push(renderGroups([g], only, groups.indexOf(g), groups.length).trim());
    });
    return parts.filter(function (p) { return p; }).join('\n\n');
  }

  // Markdown 口径的文字块：段里的 markup 转成标题行 + 正文行
  function headingTexts(html) {
    var parts = hashHeadings(html);
    return parts ? headingText(parts) : String(html == null ? '' : html);
  }

  // 这段是不是「带标题的文字块」：只有 <hN> 才转，纯段落不动
  function isHeadingBlock(seg) {
    if (typeof seg === 'string') return false;
    var block = seg && seg.block;
    return !!(block && block.markup && /<h[1-6]\b/i.test(block.markup));
  }

  // 标题标记只存在于原始标签里：段里带了 markup（<h1>…</h1>）就用它，否则退回纯文本
  function headingSource(seg) {
    if (typeof seg === 'string') return seg;
    var block = seg && seg.block;
    return block && block.markup ? block.markup : String((seg && seg.text) || '');
  }

  // 净化槽：单元格重建，colspan/rowspan 保留（HTML 本身就能表达合并，不需要 mergeCells 策略）
  function cleanSlot(opts) {
    return {
      text: function (seg) {
        var block = seg && seg.block;
        // 净化 HTML 只留结构（h1-h6 / p / blockquote…），标题转 # 只发生在 Markdown 那一路：
        // 「净化 HTML」的产出必须是 HTML，混进来的 `# 标题` 是纯文本，退出去既不是 HTML 也不是合法 Markdown
        if (block && typeof block.html === 'function') return cleanBlock(block.markup, block.text);
        return '<p>' + htmlEscape(typeof seg === 'string' ? seg : (seg && seg.text) || '') + '</p>';
      },
      table: function (g) {
        var spans = g.spans || [];
        return decorate(htmlTableRows(g.rows, spans), spans);
      }
    };
  }

  // 表格原文 + 版面信息可能对不上（<style> 里的注释骗过正则之类）：
  // 这一张表退回按模型重建，别让整次转换因为一张表就交白卷
  function sourceOrModel(table, notes) {
    var slice = table.sliceAt >= 0 ? tableSlice(table.htmlSource || '', table.sliceAt) : '';
    if (slice && /^<table\b/i.test(slice)) return slice;
    dropNote(notes, '定位不到原文的表格');
    return '';
  }

  /* ------------------------------------------------------------------ *
   * 4. 相同表头的表格合并
   * ------------------------------------------------------------------ */

  function normHeader(cells) {
    return cells.map(function (c) { return cleanText(String(c)).toLowerCase(); }).join('\u0001');
  }

  // 多表合并后，每张表的 spans 行号要按它被接在第几行重新计算
  function groupSpans(tables) {
    var spans = [];
    var offset = 0;
    tables.forEach(function (t) {
      (t.spans || []).forEach(function (s) {
        if (s.row === 0) return; // 表头只保留第一张表的
        spans.push({ row: s.row + offset, col: s.col, rowspan: s.rowspan, colspan: s.colspan, text: s.text });
      });
      offset += t.rows.length - 1;
    });
    return spans;
  }

  function groupTables(tables, compareDepth) {
    var groups = [];
    tables.forEach(function (table) {
      var head = table.rows[0] || [];
      // compareDepth 为空 = 整行表头比较，避免只撞首列就被误合并
      var depth = compareDepth > 0 ? Math.min(compareDepth, head.length || 1) : head.length;
      var key = normHeader(head.slice(0, depth)) + '\u0002' + head.length;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].key === key) { groups[i].tables.push(table); return; }
      }
      groups.push({ key: key, head: table.rows[0] || [], tables: [table] });
    });
    return groups.map(function (g) {
      if (g.tables.length === 1) {
        var only = g.tables[0];
        return { head: g.head, rows: only.rows, spans: only.spans || [], count: 1, tables: [only] };
      }
      // 合并成一组：表头只留第一张表的，其余表的数据行接上去
      var rows = [g.head];
      g.tables.forEach(function (t) {
        for (var i = 1; i < t.rows.length; i++) rows.push(t.rows[i]);
      });
      return { head: g.head, rows: rows, spans: groupSpans(g.tables), count: g.tables.length, tables: g.tables };
    });
  }

  /**
   * @param {Array} groups 分组结果
   * @param {Object} opts 选项
   * @param {number} [offset] 标题编号偏移（按原文顺序渲染时用整体序号）
   * @param {number} [total] 全部组数（决定是否加标题）
   */
  function renderGroups(groups, opts, offset, total) {
    if (!groups.length) return '';
    var shift = offset || 0;
    var count = total == null ? groups.length : total;
    // tablesOnly：只交表格行，不加「#### 表格N」标题（标题转 # 号时用，免得两种标题打架）
    var useHeading = opts.heading && count > 1 && !opts.tablesOnly; // 只有一个表时标题没有信息量
    return groups.map(function (g, i) {
      var lines = [];
      if (useHeading) {
        var tail = g.count > 1 && opts.showMergeCount !== false ? '(' + g.count + '表合并)' : '';
        if (opts.titlePrefix) lines.push('#### ' + opts.titlePrefix + (shift + i + 1) + tail);
      }
      return lines.concat(renderTable(g, opts)).join('\n') + '\n';
    }).join('\n');
  }

  // 单个表格 -> markdown 行数组（按 mergeCells 策略决定合并单元格怎么处理）
  function renderTable(g, opts) {
    var spans = g.spans || [];
    var mode = opts.mergeCells || 'blank';
    if (!spans.length) return mdTableRows(g.rows).split('\n');
    if (mode === 'fill') return mdTableRows(fillSpans(g.rows, spans)).split('\n');
    if (mode === 'html') return [htmlTableRows(g.rows, spans)];
    if (mode === 'section') return sectionRows({ rows: g.rows, spans: spans }).split('\n');
    return mdTableRows(g.rows).split('\n');
  }

  /* ------------------------------------------------------------------ *
   * 5. 文本型输入：Markdown 源码 / TSV / CSV
   * ------------------------------------------------------------------ */

  function looksLikeHtml(text) {
    return /<\/?(table|tr|td|th)\b/i.test(text) || /<table\b/i.test(text);
  }

  function looksLikeMarkdown(text) {
    var lines = String(text).trim().split(/\r?\n/);
    for (var i = 0; i < lines.length - 1; i++) {
      if (/\|/.test(lines[i]) && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) return true;
    }
    return false;
  }

  function looksLikeTsv(text) {
    return /\t/.test(text) && /\S/.test(text);
  }

  // 简易 CSV 解析（支持引号、转义引号、CRLF）
  function parseCsv(text, delimiter) {
    var rows = [];
    var row = [];
    var cell = '';
    var quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; }
          else quoted = false;
        } else cell += ch;
        continue;
      }
      if (ch === '"') { quoted = true; continue; }
      if (ch === delimiter) { row.push(cell); cell = ''; continue; }
      if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
      if (ch === '\r') continue;
      cell += ch;
    }
    row.push(cell);
    rows.push(row);
    return rows.filter(function (r) {
      return r.some(function (c) { return c.trim() !== ''; });
    });
  }

  function fromDelimited(text, opts) {
    var table = splitDelimited(text, opts);
    if (!table.rows.length) return '';
    var groups = groupTables([{ caption: '', rows: table.rows, spans: table.spans }], opts.compareDepth);
    var md = renderGroups(groups, opts);
    if (!opts.keepText || !table.texts.length) return md;
    // 表格外的文字按原位置插回去：at = 它出现在第几个表格行之前（不计表头与分隔行）。
    // 文字插在整块表格的前后（Markdown 表格一旦断开就成了两张表），中间的说明放到表后。
    var lines = md.split('\n');
    var rows = lines.filter(function (l) { return /^\s*\|/.test(l); }).length;
    var dataRows = Math.max(0, rows - 2);   // 表头 + 分隔行
    var before = [];
    var after = [];
    table.texts.forEach(function (t) {
      var at = Math.min(t.at, dataRows);
      if (at <= 0) before.push(t.text);
      else after.push(t.text);
    });
    var mdLines = lines.slice();
    var insertAt = mdLines.length;
    while (insertAt > 0 && /^\s*$/.test(mdLines[insertAt - 1])) insertAt--;
    var out = before.concat(mdLines.slice(0, insertAt));
    if (after.length) out.push('', after.join('\n\n'));
    return out.concat(mdLines.slice(insertAt)).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  // TSV / CSV 一行只有一格有内容 —— 那是夹在中间的说明文字，不是表格行。
  // 表格行占多数时把文字提出来（keepText 决定留不留），并记下它出现在第几行之前。
  function splitDelimited(text, opts) {
    var delimiter = opts.delimiter || (looksLikeTsv(text) ? '\t' : ',');
    var cells = parseCsv(text, delimiter).map(function (r) {
      return r.map(function (c) { return cleanText(c); });
    });
    var isRow = function (r) {
      return r.filter(function (c) { return c !== ''; }).length >= 2;
    };
    if (cells.filter(isRow).length < 2) {
      return { rows: cells, spans: [], texts: [] };
    }
    var rows = [];
    var texts = [];
    cells.forEach(function (r) {
      if (isRow(r)) {
        rows.push(r);
        return;
      }
      var line = cleanText(r.join(' '));
      if (line) texts.push({ at: rows.length, text: line });
    });
    return { rows: rows, spans: [], texts: texts };
  }

  /* ------------------------------------------------------------------ *
   * 6. 剪贴板
   * ------------------------------------------------------------------ */

  /**
   * 解析剪贴板 / DataTransfer
   * @param {DataTransfer|ClipboardEvent.clipboardData|{getData:Function}} data
   * @returns {{markdown:string, tables:Array, groups:Array, texts:Array, segments:Array, kind:string}}
   */
  function clipboard(data, options) {
    return parseAny({ html: getData(data, 'text/html'), text: getData(data, 'text/plain') }, options);
  }

  function getData(data, type) {
    if (!data || typeof data.getData !== 'function') return '';
    try { return data.getData(type) || ''; } catch (e) { return ''; }
  }


  /* 版面片段：把文档拆成「文字块 / 表格」两类，按原顺序排好。
   * 一次扫描定位完整的 <table> 片段（顺带数出中间夹着的 table 开标签），
   * 文字块在表格之间切开 —— Word 里的前言、后记、小标题都能回到本来该在的位置，
   * 而不是像以前那样一股脑堆到最前面。 */
  function htmlSegments(html) {
    /* <script>/<style> 里的 HTML 注释和 < 会带偏正则的配对，
     * 但要按原文坐标切表格（raw 输出要用），所以不能用「先删再解析」那套 ——
     * 换成等长替换：注释正文变空格，长度和换行都不变，下标仍然对得上原文。
     * 整个注释（含 <![endif]-->）都要挖空：Word 的 <!--[if gte mso 9]><xml><o:Revision>1
     * 就藏在这里，只留开头的 < 的话，注释里扫出来的正文文字会变成一屏 "1"。 */
    var scan = html.replace(/<!--[\s\S]*?-->/g, function (all) {
      return all.replace(/[^\n]/g, ' ');
    });
    var tables = parseTables(scan);
    var blocks = [];
    var at = [];    // at[i] = 第 i 段文字之前出现过几张表
    var index = []; // index[i] = 第 i 段文字在第几个 <table> 之前
    var cursor = 0;
    var seq = 0;
    var re = /<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi;
    var m;

    while ((m = re.exec(scan))) {
      seq += countTableTags(m[1]) + 1;
      at.push(seq);
      index.push(m.index);
      blocks.push(blocksFromHtml(html.slice(cursor, m.index)));
      cursor = re.lastIndex;
    }
    index.push(cursor);
    at.push(seq);
    blocks.push(blocksFromHtml(html.slice(cursor)));

    // 累计数可能偏大（未配对的 <table> 被当成表格片段），以 parseTables 的真实结果为准裁剪
    var segments = [];
    var used = 0;
    var total = tables.length;
    blocks.forEach(function (list, i) {
      var stop = Math.min(at[i], total);
      list.forEach(function (part) { segments.push({ type: 'text', text: part.text, block: part }); });
      while (used < stop) {
        segments.push({ type: 'table', table: tables[used], group: i });
        used++;
      }
    });
    while (used < total) {
      segments.push({ type: 'table', table: tables[used], group: blocks.length - 1 });
      used++;
    }
    // 原文逐字切出来（样式/属性全在）；定位不到（片段截断）留空，由 rawSlot() 按模型重拼。
    // 只挂在这一层：clean() 之类不碰原文的路径就不白算
    tables.forEach(function (t) { rawOf(t, html); });
    return { tables: tables, blocks: blocks, segments: segments, index: index };
  }

  // 一张表的原文：从 <table 起按开合标签配对，配对不上返回 ''（片段被截断）
  function tableSlice(html, at) {
    var re = /<table\b[^>]*>|<!--[\s\S]*?-->|<\/table\s*>/gi;
    re.lastIndex = at;
    var depth = 0;
    var m;
    while ((m = re.exec(html))) {
      if (m[0].charAt(1) === '!') continue;
      if (m[0].charAt(1) === '/') {
        depth--;
        if (!depth) return html.slice(at, re.lastIndex);
      } else depth++;
    }
    return '';
  }

  // 没有 HTML 源（贴的是 TSV / CSV / Markdown 源码）时，按同一套版面结构造一份：
  // 段落 -> 文字块，一张表 -> 一个表格片段，后面走同一条渲染路径
  function blockFromModel(text, tables, opts) {
    var items = [];   // 空格子 + 表格片段，建完再摊平成 segments
    var blocks = [];
    var kind = detect(text);
    var lines = String(text).replace(/\r\n/g, '\n').split('\n');
    var para = [];

    function flushText() {
      if (!para.length) return;
      var list = [];
      blocks.push(list);
      var item = { type: 'text', text: para.join(' '), block: new Block(para.join(' '), 0, '') };
      list.push(item);
      items.push(item);
      para = [];
    }

    var tableAt = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var isRow = (kind === 'tsv' || kind === 'csv')
        ? line.indexOf('\t') > -1 || line.indexOf(',') > -1
        : /^\s*\|/.test(line);
      var value = cleanText(line);
      if (isRow) {
        flushText();
        // 一段连续的表格行 = 一张表
        var next = i + 1;
        while (next < lines.length && (kind === 'tsv' || kind === 'csv'
          ? lines[next].indexOf('\t') > -1 || lines[next].indexOf(',') > -1
          : /^\s*\|/.test(lines[next]))) next++;
        if (tableAt < tables.length) {
          var list = [];
          blocks.push(list);
          var item = { type: 'table', table: tables[tableAt] };
          list.push({ type: 'table', table: tables[tableAt] });
          items.push(item);
          tableAt++;
        }
        i = next - 1;
        continue;
      }
      if (value) para.push(value);
      else flushText();
    }
    flushText();
    return { tables: tables, blocks: blocks, segments: items };
  }

  function countTableTags(html) {
    var m = String(html).match(/<table\b/gi);
    return m ? m.length : 0;
  }

  /* 表格外的一段文字。
   * 按块级标签断段，行内标签并在一段里；markup 是原始标签片段（h1-h6、字号、颜色、
   * 粗斜体、<img> 都在里面），raw 输出直接拼上，净化输出由 cleanBlock 自己重建。 */
  function Block(text, at, markup, image) {
    this.text = text;    // 纯文本：Markdown / 表格外文字用
    this.at = at;        // 在原文里的起点
    this.markup = markup || '';
    this.image = !!image; // 只有图片的一段：纯文本是空的，但 HTML 输出里要有
  }

  Block.prototype.html = function (notes) {
    return repairHtml(markupOf(this.markup) || htmlEscape(this.text), notes);
  };

  /* 文档级噪音：head / title / style / script / <xml> 文档属性块，以及 <o:p> 这类 Office 命名空间标签。
   * 它们一个字符都不该出现在结果里 —— Word 粘出来的 <title>1</title>、条件注释里的
   * <o:Revision>1</o:Revision> 全是文档元信息，漏出来就是满屏莫名其妙的「1」。 */
  function stripDocNoise(html) {
    return String(html == null ? '' : html)
      // 注释（含 <!--[if gte mso 9]><xml>…<![endif]--> 这种条件注释）整段丢
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // head 整个丢；没写 </head> 的片段（Word 导出常这样）丢到 <body> 为止
      .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi, ' ')
      .replace(/<head\b[^>]*>[\s\S]*?(?=<body\b)/gi, ' ')
      .replace(/<(script|style|title|xml)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      // 没闭合的 <style>/<script>（片段被截断）：到下一个 > 只会剩半个壳
      .replace(/<\/?(?:script|style|title|head|xml)\b[^>]*>/gi, ' ')
      .replace(/<\/?[a-z][\w-]*:[\w.:-]+(?:\s[^>]*)?>/gi, ' '); // <o:p> / <w:xyz> / <v:shape>
  }

  /* 把一段片段里文档级的东西剥掉，只留文字和它的样式（h1-h6、字号颜色、粗斜体、图片）。
   * 表格不走这条路（表格由模型重建），<style> 那种在 splice 阶段已经挖空了。 */
  function markupOf(html) {
    return stripDocNoise(html)
      .replace(/<\/?(?:!doctype|html|body|table|thead|tbody|tfoot|tr|td|th|caption|colgroup|col)\b[^>]*>/gi, '')
      .replace(/<\/?(?:o:p|st1:[a-z0-9]+|w:[a-z]+|v:[a-z]+)\b[^>]*>/gi, '') // Office 命名空间垃圾
      .trim();
  }

  /* 一段 HTML 里的文字块。
   * 按标签切成 token 再拼回段落：文字和行内标签留在段内，块级开标签起新段、闭标签收尾。
   * <h1 style=...>一级</h1> 因此整段原样当 markup，Word 的标题层级、字号、颜色都保得住；
   * 照块级标签切开、只取文字的话壳被切走，标题就退化成一个 <p>。 */
  function blocksFromHtml(html) {
    html = stripDocNoise(html);
    var TAG = /<[^>]+>/g;
    var tags = [];
    var m;
    while ((m = TAG.exec(html))) {
      if (m.index === TAG.lastIndex) TAG.lastIndex++;   // 空匹配：避免死循环
      tags.push({ at: m.index, end: TAG.lastIndex, close: m[0].charAt(1) === '/', raw: m[0] });
    }

    var parts = [];
    var cur = null;
    var pos = 0;
    var open = [];   // 还没闭合的块级标签：<h6><span> 这种闭标签要按栈倒着补回段尾

    function current(at) {
      if (!cur) cur = { open: '', close: '', body: '', at: at };
      return cur;
    }

    function flush() {
      if (!cur) return;
      var whole = cur.open + cur.body + cur.close;
      // 只有开闭标签、没有正文的（空段落 / 只有空 span）：留着也是空行
      var tokens = whole.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (tokens || /<img\b/i.test(whole)) parts.push({ raw: whole, at: cur.at });
      cur = null;
    }

    tags.forEach(function (tag) {
      // 文字可能是「闭标签之后」的（<h1>x</h1>一级），不能先无脑开段
      if (cur) cur.body += html.slice(pos, tag.at);
      else if (html.slice(pos, tag.at).trim()) current(pos).body += html.slice(pos, tag.at);
      pos = tag.end;
      var name = tagName(tag.raw);
      if (!name) return;                     // <!doctype> / <!-- -->：不参与配对
      if (isInlineTagName(name)) {
        current(tag.at).body += tag.raw;     // 行内标签原样留在段内
        return;
      }
      if (tag.close) {
        var series = '';
        while (open.length) {
          var top = open.pop();
          series += '</' + top + '>';
          if (top === name) break;
        }
        current(tag.at).close = series + (cur ? cur.close : '');
        flush();
        return;
      }
      flush();                               // 块级开标签：上一段收尾，这段以它开头
      cur = { open: tag.raw, close: '', body: '', at: tag.at };
      open.push(name);
    });
    if (cur) cur.body += html.slice(pos);
    else if (pos < html.length) current(pos).body += html.slice(pos);
    // 片段被截断时收尾标签没来（Word 粘出来常缺最后几行 </p>）：正文已经有了，
    // 按栈倒着把壳补齐再 flush —— 不然这一段就直接丢了
    while (open.length && cur) cur.close += '</' + open.pop() + '>';
    flush();

    return parts
      .map(function (part) {
        var stripped = part.raw
          .replace(/<!--[\s\S]*?-->/g, ' ')
          .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
        // 带 src 的 img 没有文字，但它是内容（Word 里图片独占一段），不该当成空段落丢掉
        var hasImg = /<img\b/i.test(stripped);
        var text = cleanText(decodeEntities(stripped.replace(/<[^>]*>/g, ' ')));
        return new Block(text, part.at, markupOf(stripped), hasImg);
      })
      .filter(function (part) { return part.text !== '' || part.image; });
  }

  // 行内标签：成对出现时不该把段落切断
  var INLINE = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup',
    'small', 'big', 'mark', 'code', 'span', 'font', 'a', 'img', 'br', 'label'];

  function tagName(tag) {
    var m = /^<\/?\s*([a-zA-Z][\w:-]*)/.exec(tag);
    return m ? m[1].toLowerCase() : '';
  }

  function isInlineTagName(name) {
    return INLINE.indexOf(name) > -1;
  }

  /* 修 src：Word 复制出来的图片指向 %TEMP%\ksohtml 下的本地文件，
   * 粘到网页里必然「Not allowed to load local resource」，这里换成一个空的 data URI 占位，
   * 图不是真的能显示，但至少不报错、不破坏排版，note 里会说清楚有几张。
   * 相对路径（.html 另存后旁边的图片目录）也一样处理：在线预览时同样取不到。 */
  function repairHtml(html, notes) {
    return stripHeadingEmphasis(String(html == null ? '' : html)).replace(/<img\b[^>]*>/gi, function (tag) {
      var src = (tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s">]+))/i) || []);
      var url = src[2] !== undefined ? src[2] : src[3] !== undefined ? src[3] : src[4] !== undefined ? src[4] : '';
      var broken = /^file:/i.test(url) || /^[a-zA-Z]:[\\/]/.test(url) || /^\\\\/.test(url) || url === '' || /^\.\.?[\\/]/.test(url);
      if (!broken) return tag;
      if (/^file:/i.test(url) || /^[a-zA-Z]:[\\/]/.test(url)) dropNote(notes, '本地图片（file://）');
      else dropNote(notes, '相对路径图片');
      // 透明 1x1，尺寸由 alt 兜住：浏览器不会因为取不到文件而报错
      return tag.replace(/\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s">]+))/i,
        'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"');
    });
  }

  function dropNote(notes, what) {
    if (!notes) return;
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].indexOf(what) === 0) {
        notes[i] = what + ' ×' + (parseInt(notes[i].split('×')[1], 10) + 1) + '，已替换为占位（预览里看不到）';
        return;
      }
    }
    notes.push(what + ' ×1，已替换为占位（预览里看不到）');
  }

  // 净化时文字块保留结构（h1-h6 / p / blockquote / ul…），只剥样式属性和冗余行内壳
  var CLEAN_KEEP = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'b', 'strong', 'em', 'i', 'code', 'br'];
  var CLEAN_ALIAS = { b: 'strong', i: 'em' };

  // 标题里不保留行内壳：标题本身已经够重，再包一层 <strong> 是冗余标记而不是样式信息
  // （em 留着 —— 它标的是「这几个字是术语」，标题里有用）
  function dropInHeading(name) {
    return name === 'strong';
  }

  /* 去掉 h1-h6 里包着的 <strong> 开闭标签（两种 HTML 输出都走这里）。
   * 只动标题边界之内：正文里的 <strong> 一个字不碰，标题里字号 / 颜色那些 span 照旧。
   * 不能拿全局正则一把梭 —— 那会连正文里的粗体一起删掉。 */
  var HEADING_OPEN = /<(h[1-6])\b[^>]*>/gi;
  function stripHeadingEmphasis(html) {
    var src = String(html);
    if (!/<h[1-6]\b/i.test(src)) return src;
    var out = '';
    var pos = 0;
    var m;
    HEADING_OPEN.lastIndex = 0;
    while ((m = HEADING_OPEN.exec(src))) {
      var name = m[1].toLowerCase();
      if (/\/>$/.test(m[0])) continue;              // <h3/> 这种自闭合的不当标题
      var close = new RegExp('</' + name + '\\s*>', 'gi');
      close.lastIndex = HEADING_OPEN.lastIndex;
      var end = close.exec(src);
      var bodyEnd = end ? end.index : src.length;
      out += src.slice(pos, HEADING_OPEN.lastIndex) +
        stripEmphasisTags(src.slice(HEADING_OPEN.lastIndex, bodyEnd));
      pos = end ? bodyEnd : src.length;
      HEADING_OPEN.lastIndex = pos;
    }
    if (!pos) return src;
    // 标题之间剩下的原文（含正文里的 <strong>）原样带出来
    return out + src.slice(pos);
  }

  function stripEmphasisTags(html) {
    return String(html).replace(TAG_RE, function (all, closing, name) {
      if (!name) return all;                        // 注释 / doctype 原样
      return dropInHeading(name.toLowerCase()) ? '' : all;
    });
  }

  function cleanBlock(markup, text) {
    var inner = stripTags(markupOf(markup), function (name, closing) {
      // 行内别名统一：<b>/<strong>、<i>/<em> 是同一个意思，净化后只留一种写法
      var tag = CLEAN_ALIAS[name] || name;
      if (CLEAN_KEEP.indexOf(tag) === -1) return '';
      if (dropInHeading(tag)) return '';   // 标题里的加粗壳不要
      if (closing) return '</' + tag + '>';
      return tag === 'br' ? '<br>' : '<' + tag + '>';
    });
    // 只留下闭标签、正文全空（<p> 里只有个 span）时退回纯文本
    if (!cleanText(inner)) return '<p>' + htmlEscape(text) + '</p>';
    return trimBlock(inner);
  }

  /* 净化后的文字块收尾：Word 复制出来的每段尾巴都挂着一个只装空格的 span
   * （<span style="font-family:'Times New Roman'">  </span>），源里的 1-2 个空格是排版软回车，不是内容。
   * 两层：先在所有位置拆掉正文全空的行内壳（<strong>  </strong>），再裁块首块尾的空白 ——
   * 中间的空格一个字不动，只清两头的。 */
  function trimBlock(html) {
    var out = html;
    // 从里往外剥：<strong><span> </span></strong> 要两轮才干净
    for (var i = 0; i < 8; i++) {
      var next = out.replace(EMPTY_INLINE, '');
      if (next === out) break;
      out = next;
    }
    // 首尾空白落在块级壳里（<p> 文字  </p>），不能当整串的首尾裁，逐块进去收拾
    return out.replace(BLOCK_RE, function (all, open, name, body, close) {
      return body ? open + trimEdges(body) + close : all;
    });
  }

  // 顶层块级标签：<p>…</p> / <h1>…</h1> / <li>…</li>
  var BLOCK_RE = /(<(h[1-6]|p|blockquote|li|pre)\b[^>]*>)([\s\S]*?)(<\/(?:h[1-6]|p|blockquote|li|pre)\s*>)/gi;

  // 正文里只剩空白（空格 / &nbsp; / 注释）的行内标签对，壳本身没有意义
  var EMPTY_INLINE = new RegExp('<(strong|em|b|i|code|span|font)>((?:[ \t\r\n]|&nbsp;|&#160;|<!--[\\s\\S]*?-->)*)<\\/\\1\\s*>', 'gi');

  // 块首块尾的空白（含 &nbsp;）；行内壳贴着边界时，壳内那层空白一起收
  var SPACE_EDGE = /^(?:[\s\u00a0]|&nbsp;|&#160;)+|(?:[\s\u00a0]|&nbsp;|&#160;)+$/g;
  function trimEdges(html) {
    var out = String(html).replace(SPACE_EDGE, '');
    if (!out) return out;
    return out.replace(/^(<(strong|em|b|i|code)>)[\s\u00a0]+/i, '$1')
              .replace(/[\s\u00a0]+(<\/(?:strong|em|b|i|code)>)$/i, '$1');
  }

  /* 只按标签剥壳，属性一律丢。
   * 不能用 /<[^>]+>/ 去截：alt="a>b"、data-x=">" 会被切在半截上，
   * <div data-x=">你好</div> 就会漏出一个 ">你好。这里跟 tokenize 用同一套引号感知的正则。 */
  function stripTags(html, keep) {
    return String(html == null ? '' : html).replace(TAG_RE, function (all, closing, name) {
      if (!name) return '';                       // <!-- --> / <!doctype>：整段丢
      var lower = name.toLowerCase();
      // 净化模式不留图片：alt 也容易断句，干脆丢
      if (lower === 'img') return ' ';
      return keep(lower, !!closing);
    });
  }

  var TAG_RE = /<!--[\s\S]*?-->|<!\[[\s\S]*?\]\]>|<![^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9:_-]*)(?:[^>"']|"[^"]*"|'[^']*')*>/g;

  /* 兜底补闭合：源片段被截断、或某条渲染路径漏了收尾，出口处按栈把标签补齐。
   * 只补结构标签（+ p），<br>/<img> 这类空元素不碰；栈上暂不定论的就先留着。
   * 补不上总比输出一段浏览器一渲染就吞掉后半页的残缺 HTML 强。 */
  var VOID_TAGS = ['br', 'img', 'hr', 'input', 'meta', 'link', 'col', 'wbr', 'source', 'area', 'base'];
  var STRUCT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li',
    'pre', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'div', 'span',
    'b', 'strong', 'i', 'em', 'code', 'u', 's', 'del', 'ins', 'sub', 'sup', 'small', 'big', 'mark'];

  function closeTags(html) {
    var src = String(html == null ? '' : html);
    var stack = [];
    src.replace(TAG_RE, function (all, closing, name) {
      if (!name) return all;
      var lower = name.toLowerCase();
      if (VOID_TAGS.indexOf(lower) > -1) return all;
      if (STRUCT_TAGS.indexOf(lower) === -1) return all;   // 不认识的标签不猜，原样跳过
      if (!closing) { stack.push(lower); return all; }
      var at = stack.lastIndexOf(lower);
      if (at > -1) stack.length = at;                       // 连它上面的都算闭合了
      return all;
    });
    if (!stack.length) return src;
    var tail = '';
    for (var i = stack.length - 1; i >= 0; i--) tail += '</' + stack[i] + '>';
    return src.replace(/\s*$/, '') + tail;
  }

  /**
   * 把结果补齐成固定外壳：markdown / html / htmlClean / text 一格不缺，
   * format 只决定 html 装哪一种（htmlClean 总会填好，切格式不用重解析）。
   * @param {Object} base 已算好的 markdown 等字段
   * @param {Object} layout 版面，builders 缺省时从这里现算
   * @param {Object} opts 已归一化的选项
   * @param {Object} [builders] { raw(), clean() }
   * @param {Array}  [outside] 表格外文字，builders 缺省时用
   */
  function shaped(base, layout, opts, builders, outside, notes) {
    var withFormat = base;
    // 标题转 # 号只改 Markdown 这一格，两种 HTML 输出（raw / htmlClean）里 <hN> 原样保留
    if (opts.headingAsHash && layout && layout.segments.length) {
      base.markdown = markdownFromBlocks(layout, opts);
    }
    withFormat.markdown = base.markdown || '';
    withFormat.text = base.markdown || '';
    withFormat.html = '';
    withFormat.htmlClean = '';
    // 转换过程中的提示（本地图片被替换之类），页面拿它告诉用户「图不是丢了，是取不到」
    withFormat.notes = notes || [];
    var make = builders || {};
    var texts = outside === undefined ? base.texts : outside;
    var rawOf = make.raw || function () {
      if (!layout || !layout.tables.length) return '';
      // 定位不到原文（片段被截断）时没有版面信息，退化成「先文字后表格」
      if (!layout.tables.every(function (t) { return t.sourceIsRaw; })) {
        return modelHtml(layout.tables, texts, opts, rawSlot(withFormat.notes));
      }
      return layoutHtml(layout, collectGroups(layout, opts), opts, rawSlot(withFormat.notes));
    };
    var cleanOf = make.clean || function () {
      if (!layout || !layout.tables.length) return '';
      return cleanHtml(layout, opts);
    };
    // 两种 HTML 都填：format 只决定 html 装哪一种，htmlClean 永远可用
    var pick = opts.format === 'clean' ? cleanOf() : rawOf();
    withFormat.html = closeTags(pick);
    withFormat.htmlClean = closeTags(cleanOf());
    return withFormat;
  }

  // Markdown 源码里的表格行 -> 表格模型（简单切分，够 HTML 输出用）
  function mdTablesFromLines(lines) {
    var rows = [];
    lines.forEach(function (line) {
      var cells = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
      if (cells.length === 1 && !cells[0].trim()) return;
      if (cells.every(function (c) { return /^\s*:?-{1,}:?\s*$/.test(c); })) return; // |---| 分隔行
      cells = cells.map(function (c) {
        return cleanText(c.replace(/\\([\\|])/g, '$1')).replace(/\\\|/g, '|');
      });
      rows.push(cells);
    });
    if (!rows.length) return [];
    var width = rows.reduce(function (n, r) { return Math.max(n, r.length); }, 0);
    rows = rows.map(function (r) {
      while (r.length < width) r.push('');
      return r;
    });
    return [{ rows: rows, spans: [], merged: false, caption: '', source: '' }];
  }

  function parseAny(input, options) {
    var opts = normalizeOpts(options);
    var html = input && input.html ? String(input.html) : '';
    var text = input && input.text ? String(input.text) : '';

    if (html && (looksLikeHtml(html) || parseTables(html).length)) {
      var layout = htmlSegments(html);
      if (layout.tables.length) {
        var groups = collectGroups(layout, opts);
        var texts = opts.keepText
          ? layout.blocks.reduce(function (a, b) { return a.concat(b.map(function (x) { return x.text; })); }, [])
          : [];
        // headingAsHash 只管输出（Markdown / 净化 HTML），texts 里留原文 */

        var markdown = renderLayout(layout, groups, opts);
        var htmlNotes = [];
        return shaped({
          markdown: markdown ? markdown + '\n' : '',
          tables: layout.tables,
          groups: groups,
          texts: texts,
          segments: layout.segments,
          kind: 'html'
        }, layout, opts, {
          raw: function () { return layoutHtml(layout, groups, opts, rawSlot(htmlNotes)); },
          clean: function () { return cleanHtml(layout, opts); }
        }, layout.tables.outside, htmlNotes);
      }
    }

    if (text) {
      var kind = detect(text);
      if (kind === 'html') {
        // 直接粘 HTML 源码（没有 text/html 的场合）：这条路上本来就没有表格外的段落排版
        var sourceTables = parseTables(text);
        if (sourceTables.length) {
          var sourceGroups = collectGroups({ tables: sourceTables, segments: sourceTables.map(function (t) {
            return { type: 'table', table: t };
          }) }, opts);
          var sourceNotes = [];
          var sourceLayout = { tables: sourceTables, segments: sourceTables.map(function (t) {
            return { type: 'table', table: t };
          }) };
          return shaped({
            markdown: renderGroups(sourceGroups, opts, 0, sourceGroups.length),
            tables: sourceTables,
            groups: sourceGroups,
            texts: [],
            segments: [],
            kind: 'html'
          }, sourceLayout, opts, {
            raw: function () { return modelHtml(sourceTables, [], opts, rawSlot(sourceNotes)); },
            clean: function () {
              return modelHtml(sourceTables, [], opts, cleanSlot(opts));
            }
          }, [], sourceNotes);
        }
      }
      if (kind === 'markdown') {
        // Markdown 源码：表格行和表格外的行按原顺序分开，keepText=false 时只留表格块
        var kept = text.replace(/\r\n/g, '\n').split('\n');
        var tableLines = kept.filter(function (line) { return /^\s*\|/.test(line); });
        var outsideLines = kept.filter(function (line) {
          return /\S/.test(line) && !/^\s*\|/.test(line);
        });
        var mdOut = opts.keepText || !tableLines.length ? kept.join('\n') : tableLines.join('\n');
        // 源码表格按 Markdown 语法还原成模型，HTML 那两路才有东西可出
        var mdTables = mdTablesFromLines(tableLines);
        var mdLayout = blockFromModel(text, mdTables, opts);
        return shaped({
          markdown: mdOut.trim() + '\n',
          tables: mdTables,
          groups: mdTables.map(function (t) { return { head: t.rows[0] || [], rows: t.rows, spans: [], count: 1, tables: [t] }; }),
          texts: opts.keepText ? outsideLines.map(function (l) { return cleanText(l); }) : [],
          segments: [],
          kind: 'markdown'
        }, mdLayout, opts);
      }
      if (kind === 'tsv' || kind === 'csv') {
        var delim = splitDelimited(text, opts);
        var md = fromDelimited(text, opts);
        var outside = delim.texts.map(function (t) { return t.text; });
        var textTables = delim.rows.length
          ? [{ rows: delim.rows, spans: delim.spans || [], merged: (delim.spans || []).length > 0 }]
          : [];
        var textLayout = blockFromModel(text, textTables, opts);
        return shaped({
          markdown: md,
          tables: textTables,
          groups: [],
          texts: opts.keepText ? outside : [],
          segments: [],
          kind: kind
        }, textLayout, opts);
      }
    }
    var fallback = html && looksLikeHtml(html) ? 'html' : 'unknown';
    return shaped({ markdown: '', tables: [], groups: [], texts: [], segments: [], kind: fallback }, null, opts);
  }

  // 分组：先按原文顺序分组，再按第一次出现的位置排回来
  function collectGroups(layout, opts) {
    if (!opts.merge) return plainGroups(layout.tables);
    var ordered = layout.segments
      .filter(function (s) { return s.type === 'table'; })
      .map(function (s) { return s.table; });
    var groups = groupTables(ordered, opts.compareDepth);
    // groupTables 保持入参顺序，groups[0] 就是原文里第一张表所在组
    return groups;
  }

  // 文字与表格按原顺序穿插；同一组的表格只在第一次出现处渲染一次
  function renderLayout(layout, groups, opts) {
    var groupOf = new Map();
    groups.forEach(function (g) {
      for (var i = 0; i < g.tables.length; i++) groupOf.set(g.tables[i], g);
    });

    var parts = [];
    var done = new Set();
    layout.segments.forEach(function (seg) {
      if (seg.type === 'text') {
        // 标题转 # 号：带 <hN> 的文字块落成「# 标题」行（不带标签的段落照样是纯文本）
        if (opts.headingAsHash && isHeadingBlock(seg)) {
          if (parts[parts.length - 1] !== seg.text) parts.push(headingTexts(headingSource(seg)));
          return;
        }
        if (opts.keepText && parts[parts.length - 1] !== seg.text) parts.push(seg.text);
        return;
      }
      var g = groupOf.get(seg.table);
      if (!g || done.has(g)) return;
      done.add(g);
      parts.push(renderGroups([g], opts, groups.indexOf(g), groups.length).trim());
    });
    return parts.filter(function (p) { return p; }).join('\n\n');
  }

  function detect(text) {
    if (looksLikeHtml(text)) return 'html';
    if (looksLikeMarkdown(text)) return 'markdown';
    if (looksLikeTsv(text)) return 'tsv';
    if (/^[^\n]*,[^\n]*$/m.test(text) && text.split('\n').length > 1) return 'csv';
    return 'unknown';
  }

  /* ------------------------------------------------------------------ *
   * 7. 对外的 html() / parse()
   * ------------------------------------------------------------------ */

  function plainGroups(tables) {
    return tables.map(function (t) {
      return { head: t.rows[0] || [], rows: t.rows, spans: t.spans || [], count: 1, tables: [t] };
    });
  }

  // 复用一份选项、只换 format（粘贴时三种格式都要算）
  function mergeOpts(opts, format) {
    var next = {};
    for (var k in opts) next[k] = opts[k];
    next.format = format;
    return next;
  }

  function normalizeOpts(options) {
    var opts = {};
    for (var k in defaultOptions) opts[k] = defaultOptions[k];
    for (var j in options || {}) opts[j] = options[j];
    return opts;
  }

  var defaultOptions = {
    merge: true,          // 表头相同的表格合并
    compareDepth: 0,      // 参与比较的表头列数，0 = 整行表头
    heading: true,        // 多表时输出 #### 标题
    titlePrefix: '表格',  // 标题前缀，如「#### 表格1(3表合并)」
    keepText: true,       // 表格外的文字：true 按原文顺序保留，false 只留表格
    showMergeCount: true, // 标题里标注 (N表合并)
    headingAsHash: false, // 标题转 # 号：h1-h6 -> # / ## ...
    delimiter: '',        // TSV/CSV 分隔符，空 = 自动
    mergeCells: 'blank',  // 合并单元格：blank | fill | section | html
    format: 'markdown'    // 输出格式：markdown | raw（原样 HTML）| clean（净化 HTML）
  };

  function extractHtml(input) {
    if (typeof input === 'string') return input;
    if (input && typeof input.outerHTML === 'string') return input.outerHTML;
    if (input && typeof input.innerHTML === 'string') return input.innerHTML;
    if (input && typeof input === 'object' && input.html) return String(input.html);
    return '';
  }

  function html(input, options) {
    var opts = normalizeOpts(options);
    var source = extractHtml(input);

    var tables = parseTables(source);
    if (!tables.length) return '';
    var groups = opts.merge ? groupTables(tables, opts.compareDepth) : plainGroups(tables);
    return renderGroups(groups, opts);
  }

  function parse(input, options) {
    var opts = normalizeOpts(options);
    if (typeof input === 'string' && !looksLikeHtml(input)) {
      return parseAny({ text: input }, opts);
    }
    return parseAny({ html: extractHtml(input) }, opts);
  }

  /* ------------------------------------------------------------------ *
   * 8. 粘贴监听
   * ------------------------------------------------------------------ */

  function targetList(target) {
    if (!target) return [];
    if (typeof target === 'string') {
      var found = document.querySelectorAll(target);
      return Array.prototype.slice.call(found);
    }
    if (target.length && typeof target !== 'string' && target.item) {
      return Array.prototype.slice.call(target);
    }
    return [target];
  }

  /**
   * 监听粘贴事件（页面或指定元素）
   * @param {string|Element|NodeList} target 选择器 / 元素 / 元素集合
   * @param {Function|Object} handler 回调，或 { onResult, onText, preventDefault, keepText }
   *   onResult(result, event)  成功转出表格时调用
   *   onText(text, event)      粘贴的是 HTML 源码文本时调用（库里不替你替换，交给你决定放哪）
   * @returns {Function} 解绑函数
   */
  function bind(target, handler) {
    if (typeof document === 'undefined') return function () {};
    var cfg = typeof handler === 'function' ? { onResult: handler } : handler || {};
    var prevent = cfg.preventDefault !== false;
    // 选项在每次粘贴时现读：调用方改了 handler 上的 keepText / merge 等字段要能生效
    var readOpts = function () { return normalizeOpts(cfg); };
    // 粘贴是「一次事件，三种可能」，所以 onResult 一次性把三份都给出去：
    // r.markdown / r.html（原始 HTML）/ r.htmlClean（净化 HTML），页面自己挑着显示。
    // 这时 format 只决定 r.html 里装原文还是净化版，不影响三份是否都算好。
    var allFormats = function (input) {
      var base = parseAny(input, readOpts());
      if (!base.tables.length) return base;
      var keep = readOpts();
      var raw = parseAny(input, mergeOpts(keep, 'raw'));
      base.html = raw.html;
      base.htmlClean = parseAny(input, mergeOpts(keep, 'clean')).html;
      return base;
    };

    var listener = function (event) {
      var data = event.clipboardData || (typeof window !== 'undefined' && window.clipboardData);
      if (!data) return;
      var html = getData(data, 'text/html');
      var plain = getData(data, 'text/plain');

      // 场景一：从 Word / Excel / 网页复制，剪贴板里带 HTML —— 这就是表格的来源
      var result = html && looksLikeHtml(html) ? allFormats({ html: html, text: plain }) : null;
      if (result && (result.tables.length || isTableText(plain))) {
        if (prevent) event.preventDefault();
        if (typeof cfg.onResult === 'function') cfg.onResult(result, event);
        return;
      }

      // 场景二：粘贴的是一段 HTML 源码文本（手动贴代码调试用）
      if (plain && looksLikeHtml(plain) && parseTables(plain).length) {
        if (prevent) event.preventDefault();
        var fromSource = allFormats({ html: plain });
        if (typeof cfg.onText === 'function') cfg.onText(plain, fromSource, event);
        else if (typeof cfg.onResult === 'function') cfg.onResult(fromSource, event);
        return;
      }

      // 场景三：TSV / CSV / Markdown 表格纯文本
      var kind = plain ? detect(plain) : 'unknown';
      if (kind === 'tsv' || kind === 'csv' || kind === 'markdown') {
        var textResult = allFormats({ text: plain });
        if (!textResult.markdown) return;
        if (prevent) event.preventDefault();
        if (typeof cfg.onResult === 'function') cfg.onResult(textResult, event);
        return;
      }

      // 普通文本：不拦，交给浏览器默认粘贴
    };

    var unbinds = targetList(target).map(function (el) {
      el.addEventListener('paste', listener);
      return function () { el.removeEventListener('paste', listener); };
    });
    return function unbind() { unbinds.forEach(function (fn) { fn(); }); };
  }

  function isTableText(text) {
    var kind = text ? detect(text) : 'unknown';
    return kind === 'tsv' || kind === 'csv' || kind === 'markdown';
  }

  /* ------------------------------------------------------------------ *
   * 9. 导出
   * ------------------------------------------------------------------ */

  var api = {
    html: html,
    parse: parse,
    parseAny: parseAny,
    clipboard: clipboard,
    bind: bind,
    detect: detect,
    clean: function (htmlStr) {
      // 表模型带 source（该表原文，逐字未改）：想保留样式就走 <table>…</table> 那段
      var tables = parseTables(htmlStr);
      tables.forEach(function (t) { rawOf(t, htmlStr); });
      return tables;
    },
    escapeCell: escapeCell,
    toHtmlTables: function (tables, options) {
      var opts = normalizeOpts(options);
      var list = Array.isArray(tables) ? tables : [tables];
      var groups = opts.merge ? groupTables(list, opts.compareDepth) : plainGroups(list);
      return groups.map(function (g) { return htmlTableRows(g.rows, g.spans || []); }).join('\n');
    },
    // 净化 HTML：字符串进字符串出，Node 下也能跑（给后端 / 命令行用）
    htmlClean: function (input, options) {
      var opts = normalizeOpts(options);
      var layout = htmlSegments(extractHtml(input));
      if (!layout.tables.length) return '';
      if (opts.format === 'raw') return layoutHtml(layout, collectGroups(layout, opts), opts, rawSlot());
      return cleanHtml(layout, opts);
    },
    toMarkdown: function (tables, options) {
      var opts = normalizeOpts(options);
      var list = Array.isArray(tables) ? tables : [tables];
      var groups = opts.merge ? groupTables(list, opts.compareDepth) : plainGroups(list);
      return renderGroups(groups, opts);
    },
    version: '1.4.0'
  };

  return api;
});
