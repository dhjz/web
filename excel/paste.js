/* ============================================================
 * paste.js  表格粘贴 → Excel 导入插件（原生 JS，零外部依赖）
 * ------------------------------------------------------------
 * 支持三种粘贴来源：
 *   1. 复制的 Excel 文件（.xlsx / .xls）—— 由 index.html 原有监听处理，本文件直接放行
 *   2. Excel / WPS / Word / 网页复制的表格（剪贴板带 text/html 的 <table>）
 *   3. 纯文本表格：TSV（Excel 直接复制）、CSV、Markdown 表格、HTML 源码文本
 *
 * 转成 ExcelJS.Workbook 后，通过隐藏的 input.file-input 的 change 事件交给宿主，
 * 复用 index.html 已有的 loadFile / applyLoadedWorkbook / 缓存 / 预览流程。
 *
 * 对 index.html 的侵入只有 1 行：
 *   <script src="paste.js"></script>
 * ============================================================ */
(function () {
  'use strict';

  function normalizeCellText(text) {
    return String(text == null ? '' : text)
      .replace(/[ \t]*<br\s*\/?>[ \t]*/gi, '\n')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u00a0\u200b]/g, ' ')
      .split('\n')
      .map(function (line) { return line.replace(/[ \t]+$/, ''); })
      .join('\n')
      .trim();
  }

  function positiveInt(value, fallback) {
    var n = parseInt(value, 10);
    return isNaN(n) || n < 1 ? (fallback || 1) : n;
  }

  /* ---------- HTML 表格解析：DOM 法，完整保留 rowspan / colspan ---------- */

  function cellTextFromDom(cell) {
    function walk(node) {
      if (node.nodeType === 3) return node.nodeValue || '';
      if (node.nodeType !== 1) return '';
      var tag = node.tagName.toLowerCase();
      if (tag === 'br') return '\n';
      if (tag === 'script' || tag === 'style') return '';
      var inner = '';
      for (var i = 0; i < node.childNodes.length; i++) inner += walk(node.childNodes[i]);
      if (/^(p|div|li|h[1-6]|tr)$/.test(tag)) return inner + '\n';
      return inner;
    }
    var raw = walk(cell);
    // Word 常把 \v 当软回车，这里换成真正的换行
    return normalizeCellText(raw.replace(/\v/g, '\n'));
  }

  function parseColor(raw) {
    var value = String(raw || '').trim();
    var m = value.match(/^#?([0-9a-f]{6})$/i) || value.match(/^#?([0-9a-f]{3})$/i);
    if (!m) return null;
    var hex = m[1].toUpperCase();
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return { argb: 'FF' + hex };
  }

  function parseCellStyle(cell, isHeader) {
    var style = {};
    var tag = cell.tagName.toLowerCase();
    var align = (cell.getAttribute('align') || '').toLowerCase();
    var valign = (cell.getAttribute('valign') || '').toLowerCase();
    var bg = cell.getAttribute('bgcolor') || '';
    var color = cell.getAttribute('color') || '';
    var css = cell.getAttribute('style') || '';

    if (/\bfont-weight\s*:\s*(bold|[6-9]00)\b/i.test(css) || tag === 'th' || isHeader) style.bold = true;
    if (/\bfont-style\s*:\s*italic\b/i.test(css)) style.italic = true;
    if (/\btext-decoration\s*:\s*underline\b/i.test(css)) style.underline = true;

    var mColor = /\bcolor\s*:\s*([^;]+)/i.exec(css);
    var c = parseColor(mColor ? mColor[1] : color);
    if (c) style.color = c;

    var mBg = /\b(?:background|background-color)\s*:\s*([^;]+)/i.exec(css);
    var b = parseColor(mBg ? mBg[1] : bg);
    if (b) style.fill = { type: 'pattern', pattern: 'solid', fgColor: b };

    var mAlign = /\btext-align\s*:\s*(left|center|right|justify)/i.exec(css);
    if (mAlign) align = mAlign[1].toLowerCase();
    var mValign = /\bvertical-align\s*:\s*(top|middle|bottom)/i.exec(css);
    if (mValign) valign = mValign[1].toLowerCase();
    if (align === 'center' || align === 'right' || align === 'left') style.horizontal = align;
    if (valign === 'middle' || valign === 'top' || valign === 'bottom') {
      style.vertical = valign === 'middle' ? 'middle' : valign;
    }

    if (/\bwhite-space\s*:\s*(pre|pre-wrap)\b/i.test(css)) style.wrapText = true;
    return style;
  }

  function expandTable(table) {
    var sourceRows = [];
    [].forEach.call(table.rows, function (tr) {
      var cells = [];
      [].forEach.call(tr.cells, function (cell) {
        cells.push({
          text: cellTextFromDom(cell),
          colspan: positiveInt(cell.getAttribute('colspan'), 1),
          rowspan: positiveInt(cell.getAttribute('rowspan'), 1),
          style: parseCellStyle(cell, cell.tagName.toLowerCase() === 'th')
        });
      });
      if (cells.length) sourceRows.push(cells);
    });
    if (!sourceRows.length) return null;

    var grid = [];
    var seen = {}; // "row,col" -> true，标记被 colspan/rowspan 覆盖的槽位
    sourceRows.forEach(function (cells, r) {
      if (!grid[r]) grid[r] = [];
      var col = 0;
      cells.forEach(function (cell) {
        while (seen[r + ',' + col]) col++;
        grid[r][col] = cell.text;
        for (var dr = 0; dr < cell.rowspan; dr++) {
          for (var dc = 0; dc < cell.colspan; dc++) {
            var rr = r + dr;
            var cc = col + dc;
            if (!grid[rr]) grid[rr] = [];
            if (dr === 0 && dc === 0) {
              grid[rr][cc] = { text: cell.text, spanRow: cell.rowspan, spanCol: cell.colspan, style: cell.style };
            } else {
              seen[rr + ',' + cc] = true;
              grid[rr][cc] = '';
            }
          }
        }
        col += cell.colspan;
      });
    });

    var width = grid.reduce(function (n, row) { return Math.max(n, row.length); }, 0);
    var rows = grid.map(function (row) {
      var out = [];
      for (var c = 0; c < width; c++) out.push(row[c] == null ? '' : row[c]);
      return out;
    });
    if (!rows.some(function (row) { return row.some(function (v) { return String(v && v.text !== undefined ? v.text : v).trim(); }); })) return null;
    return { rows: rows, width: width };
  }

  function parseHtmlTables(html) {
    var doc = new DOMParser().parseFromString(
      '<!doctype html><html><body><div id="__paste_root__">' + html + '</div></body></html>',
      'text/html'
    );
    var root = doc.getElementById('__paste_root__');
    if (!root) return [];
    var tables = [];
    function insideAnotherTable(table) {
      var node = table.parentElement;
      while (node) {
        if (node.tagName && node.tagName.toLowerCase() === 'table') return true;
        node = node.parentElement;
      }
      return false;
    }
    // 只解析最外层表格；嵌套表格的文字留在父单元格里，避免同一份数据出两次
    [].forEach.call(root.querySelectorAll('table'), function (table) {
      if (insideAnotherTable(table)) return;
      var parsed = expandTable(table);
      if (parsed) tables.push(parsed);
    });
    return tables;
  }

  /* ---------- 纯文本表格解析：TSV / CSV / Markdown / HTML 源码 ---------- */

  function splitDelimited(text, delimiter) {
    var rows = [];
    var row = [];
    var buf = '';
    var quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { buf += '"'; i++; }
          else quoted = false;
        } else if (ch === '\n') { buf += '\n'; }
        else if (ch !== '\r') buf += ch;
        continue;
      }
      if (ch === '"') { quoted = true; continue; }
      if (ch === delimiter) { row.push(normalizeCellText(buf)); buf = ''; continue; }
      if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(normalizeCellText(buf));
        rows.push(row); row = []; buf = '';
        continue;
      }
      buf += ch;
    }
    row.push(normalizeCellText(buf));
    rows.push(row);
    return rows.filter(function (r) {
      return r.some(function (c) { return c !== ''; });
    });
  }

  function splitMarkdownRow(line) {
    var s = line.replace(/\r$/, '').trim();
    s = s.replace(/^\|/, '').replace(/\|$/, '');
    var cells = [];
    var buf = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '\\' && i + 1 < s.length && (s[i + 1] === '|' || s[i + 1] === '\\')) {
        buf += s[i + 1]; i++; continue;
      }
      if (ch === '|') { cells.push(normalizeCellText(buf)); buf = ''; continue; }
      buf += ch;
    }
    cells.push(normalizeCellText(buf));
    return cells;
  }

  function isMarkdownSeparator(line) {
    return /^\s*\|?[\s:\-|]+\|?\s*$/.test(line) && /-/.test(line) && /\|/.test(line);
  }

  function parseMarkdown(text) {
    var lines = text.split(/\r?\n/);
    var rows = [];
    for (var i = 0; i < lines.length; i++) {
      if (!/\|/.test(lines[i])) continue;
      if (isMarkdownSeparator(lines[i])) continue;
      rows.push(splitMarkdownRow(lines[i]));
    }
    return rows.length && rows[0].length > 1 ? { rows: rows, width: rows[0].length } : null;
  }

  function looksLikeHtml(text) {
    return /<\s*\/?\s*(table|tr|td|th)\b/i.test(text);
  }

  function detectPlainKind(text) {
    var sample = text.slice(0, 200);
    if (looksLikeHtml(sample)) return 'html';
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length > 1) {
      for (var i = 0; i < lines.length - 1; i++) {
        if (/\t/.test(lines[i]) && /\|/.test(lines[i + 1]) && isMarkdownSeparator(lines[i + 1])) return 'markdown';
      }
    }
    if (lines.some(function (l) { return /\|/.test(l); }) && lines.some(isMarkdownSeparator)) return 'markdown';
    if (/\t/.test(sample)) return 'tsv';
    if (/[,，;]/.test(sample) && lines.length > 1) return 'csv';
    return 'unknown';
  }

  function tableFromRows(rows) {
    if (!rows || !rows.length) return null;
    var width = rows.reduce(function (n, r) { return Math.max(n, r.length); }, 0);
    if (width < 2) return null; // 单列纯文本交给浏览器默认粘贴，避免误伤普通文字
    var padded = rows.map(function (row) {
      var out = [];
      for (var c = 0; c < width; c++) {
        out.push(typeof row[c] === 'string' ? row[c] : (row[c] && row[c].text !== undefined ? row[c].text : ''));
      }
      return out;
    });
    return { rows: padded, width: width };
  }

  function parsePlainText(text) {
    // HTML 源码文本：优先走 DOM 解析器，保留合并单元格与样式
    if (looksLikeHtml(text)) {
      var tables = parseHtmlTables(text);
      if (tables.length) return tables;
    }
    var kind = detectPlainKind(text);
    if (kind === 'markdown') {
      var md = parseMarkdown(text);
      return md ? [md] : [];
    }
    if (kind === 'tsv') {
      var tsv = tableFromRows(splitDelimited(text, '\t'));
      return tsv ? [tsv] : [];
    }
    if (kind === 'csv') {
      var delim = /；/.test(text) ? '；' : (/;/.test(text) ? ';' : (/，/.test(text) ? '，' : ','));
      var csv = tableFromRows(splitDelimited(text, delim));
      return csv ? [csv] : [];
    }
    return [];
  }

  /* ---------- 组装 ExcelJS.Workbook ---------- */

  function looksLikeNumber(text) {
    return /^-?\d+(\.\d+)?$/.test(text) && text.replace('-', '').replace('.', '').length <= 15;
  }

  function cellValue(text) {
    return looksLikeNumber(text) ? Number(text) : text;
  }

  function buildWorkbook(tables, sourceLabel) {
    if (!window.ExcelJS) throw new Error('ExcelJS 未加载');
    var wb = new ExcelJS.Workbook();
    wb.creator = 'ExcelPaste';
    wb.created = new Date();

    tables.forEach(function (table, index) {
      var ws = wb.addWorksheet('Sheet' + (index + 1));
      table.rows.forEach(function (cells, r) {
        cells.forEach(function (cell, c) {
          var excelCell = ws.getCell(r + 1, c + 1);
          var style = {};
          var text = null;
          if (cell && typeof cell === 'object' && cell.text !== undefined) {
            text = cell.text;
            style = cell.style || {};
          } else if (typeof cell === 'string') {
            text = cell;
          }
          if (text === null) return;

          excelCell.value = cellValue(text);
          // ExcelJS 新工作簿的默认字体是 Calibri 11，宿主的预览会把 font.size 原样写成
          // font-size:11px，导致从网页粘过来的表格特别小。这里给每个单元格显式写入字体
          // （无样式时为空对象），覆盖默认值；源 HTML 里的 font-size 本来就不解析。
          var font = {};
          if (style.bold || r === 0) font.bold = true;
          if (style.italic) font.italic = true;
          if (style.underline) font.underline = true;
          if (style.color) font.color = style.color;
          excelCell.font = font;
          if (style.fill) excelCell.fill = style.fill;
          var align = {};
          if (style.horizontal) align.horizontal = style.horizontal;
          if (style.vertical) align.vertical = style.vertical;
          if (style.wrapText) align.wrapText = true;
          if (Object.keys(align).length) excelCell.alignment = align;
        });
      });
      // 合并单元格：ExcelJS 的 merge 起点写值后，子格自动成为被覆盖单元格
      table.rows.forEach(function (cells, r) {
        cells.forEach(function (cell, c) {
          if (cell && typeof cell === 'object' && cell.text !== undefined &&
              (cell.spanRow > 1 || cell.spanCol > 1)) {
            ws.mergeCells(r + 1, c + 1, r + cell.spanRow, c + cell.spanCol);
          }
        });
      });
      ws.views = [{ state: 'frozen', ySplit: 1, activeCell: 'A2', selection: { activeCell: 'A2' } }];
    });

    var totalRows = tables.reduce(function (n, t) { return n + t.rows.length; }, 0);
    var totalCols = tables.reduce(function (n, t) { return Math.max(n, t.width); }, 0);
    if (!sourceLabel) sourceLabel = tables.length > 1 ? '粘贴的 ' + tables.length + ' 张表格' : '粘贴表格';
    return {
      workbook: wb,
      fileName: sourceLabel + '.xlsx',
      rowCount: totalRows,
      colCount: totalCols,
      tableCount: tables.length
    };
  }

  /* ---------- 把 workbook 送进宿主 index.html 的现有流程 ---------- */

  async function deliverToApp(wb, fileName) {
    var input = document.querySelector('input.file-input');
    if (!input) throw new Error('找不到 input.file-input，paste.js 需要 index.html 引入');
    var buffer = await wb.xlsx.writeBuffer();
    var file = new File([buffer], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function getToast() {
    var appEl = document.getElementById('app');
    if (!appEl || !appEl.__vue_app__ || !appEl.__vue_app__._instance) return null;
    var setup = appEl.__vue_app__._instance.setupState;
    return setup && typeof setup.showToast === 'function' ? setup.showToast : null;
  }

  function notify(message, type) {
    var toast = getToast();
    if (toast) toast(message, type);
    else console.log('[paste.js] ' + message);
  }

  function getData(data, type) {
    if (!data || typeof data.getData !== 'function') return '';
    try { return data.getData(type) || ''; } catch (e) { return ''; }
  }

  function isExcelFilePaste(items) {
    if (!items || !items.length) return false;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item && item.kind === 'file' && /\.(xlsx|xls)$/i.test(item.name || '')) return true;
    }
    return false;
  }

  async function handlePaste(event) {
    // 文本框内的粘贴交给浏览器默认行为（比如 Markdown 导入弹窗的输入框）
    var target = event.target;
    if (target && (target.isContentEditable ||
        target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) return;

    var data = event.clipboardData || window.clipboardData;
    if (!data) return;

    // 场景 1：复制的 Excel 文件 —— 放行，交给 index.html 原有监听
    if (isExcelFilePaste(data.items)) return;

    var html = getData(data, 'text/html');
    var plain = getData(data, 'text/plain');
    var tables = [];
    var label = '';

    // 场景 2：Excel / Word / 网页复制的表格（带 HTML 的 table）
    if (html && looksLikeHtml(html)) {
      tables = parseHtmlTables(html);
      if (tables.length) label = '粘贴表格';
    }
    // 场景 3：纯文本表格 / HTML 源码文本
    if (!tables.length && plain && plain.trim()) {
      tables = parsePlainText(plain);
      if (tables.length) label = '粘贴数据';
    }
    if (!tables.length) return; // 普通文本不拦，交给浏览器默认粘贴

    try {
      var built = buildWorkbook(tables, label);
      event.preventDefault();
      await deliverToApp(built.workbook, built.fileName);
      notify('已粘贴导入 ' + built.tableCount + ' 张表，共 ' + built.rowCount + ' 行 × ' + built.colCount + ' 列', 'success');
    } catch (err) {
      console.error('[paste.js] 导入失败:', err);
      event.preventDefault();
      notify('粘贴导入失败: ' + (err && err.message || err), 'error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.addEventListener('paste', handlePaste);
    });
  } else {
    window.addEventListener('paste', handlePaste);
  }

  window.ExcelPaste = {
    parseHtml: parseHtmlTables,
    parseText: parsePlainText,
    toWorkbook: buildWorkbook,
    version: '1.0.0'
  };
})();
