/* ============================================================
 * md.js  Markdown 表格 → Excel 导入插件
 * ------------------------------------------------------------
 *  - 解析 GFM 风格 Markdown 表格(管道符 + 分隔行)
 *  - 支持对齐标记(:---/:---:/---:)
 *  - 支持行内 \| 与 \\\ 转义
 *  - 写入到当前 workbook 的新 sheet(或新建 workbook)
 *  - 与 theme.js 完全独立,可单独使用
 *
 *  调用:
 *    window.ExcelMarkdownImport.open({
 *      workbook,          // 可选:已加载的 ExcelJS.Workbook(默认新建)
 *      sheetName,         // 可选:目标 sheet 名,默认 "Markdown"
 *      fileName,          // 可选:初始 Markdown 名,默认空
 *      onDone,            // 可选:导入完成回调 (wb) => void
 *      onError,           // 可选:失败回调 (err) => void
 *    })
 *
 *  对 index.html 的侵入:1 行 <script src="md.js"></script>
 *  (UI、解析、写入、导出全部在本文件内完成)
 * ============================================================ */

(function () {
  if (!window.Vue) {
    console.error('[md.js] Vue 未加载');
    return;
  }
  if (!window.ExcelJS) {
    console.error('[md.js] ExcelJS 未加载');
    return;
  }

  const { createApp, ref, reactive, computed, watch } = Vue;

  /* ============================================================
   * Markdown 表格解析
   * ============================================================ */

  /**
   * 把一行 Markdown 拆成单元格数组。
   * 支持行内 \| 与 \\\ 转义(其它反斜杠保留原样)。
   * 同时去掉首尾空白,并剥离外层可有可无的前后 | 。
   */
  function splitRow(line) {
    let trimmed = line.replace(/\r$/, '');
    // 去掉首尾的 |
    trimmed = trimmed.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
    const cells = [];
    let buf = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '\\' && i + 1 < trimmed.length) {
        // \| → |,  \\ → \
        const next = trimmed[i + 1];
        if (next === '|' || next === '\\') {
          buf += next;
          i++;
          continue;
        }
        buf += ch;
        continue;
      }
      if (ch === '|') {
        cells.push(buf);
        buf = '';
        continue;
      }
      buf += ch;
    }
    cells.push(buf);
    return cells.map((c) => c.trim());
  }

  /**
   * 判断一行是否是分隔行(只含 : - 空格 |)
   * 同时返回该行每列的对齐:'left' | 'center' | 'right' | null
   */
  function parseSeparatorRow(line) {
    if (!/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)) {
      return null;
    }
    const cells = splitRow(line);
    const aligns = cells.map((c) => {
      const t = c.trim();
      const left = t.startsWith(':');
      const right = t.endsWith(':');
      if (left && right) return 'center';
      if (right) return 'right';
      if (left) return 'left';
      return null;
    });
    return aligns;
  }

  /**
   * 把 Markdown 文本解析成 { header, rows, aligns }。
   * - header: string[]
   * - rows:   string[][]
   * - aligns: Array<'left'|'center'|'right'|null>
   *
   * 要求:
   * 1. 文本中至少有一行 separator(分隔行);
   * 2. separator 上方视为表头;
   * 3. separator 下方所有"看起来像表格行"的行视为数据行
   *    (以 | 开头,或包含至少一个 | 的行)。
   *
   * 返回 null 表示未找到表格。
   */
  function parseMarkdownTable(text) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split('\n');

    let sepIdx = -1;
    let aligns = null;
    for (let i = 0; i < lines.length; i++) {
      const a = parseSeparatorRow(lines[i]);
      if (a) {
        sepIdx = i;
        aligns = a;
        break;
      }
    }
    if (sepIdx < 1) return null; // 没有合法的 separator

    // 表头行:取 separator 上方最后一个非空行(通常是上一行)
    let headerIdx = sepIdx - 1;
    while (headerIdx >= 0 && lines[headerIdx].trim() === '') headerIdx--;
    if (headerIdx < 0) return null;

    const header = splitRow(lines[headerIdx]);

    // 数据行:separator 下方所有"看起来像表格行"的行
    const rows = [];
    for (let i = sepIdx + 1; i < lines.length; i++) {
      const raw = lines[i];
      if (raw == null) continue;
      const t = raw.trim();
      if (t === '') continue;
      // 必须是管道符行
      if (!t.includes('|')) continue;
      rows.push(splitRow(raw));
    }

    if (header.length === 0) return null;

    return { header, rows, aligns };
  }

  /* ============================================================
   * 把解析结果写入 ExcelJS worksheet
   * ============================================================ */

  /**
   * 写入到指定 workbook 的新 sheet。
   * - 返回新创建的 worksheet
   * - 列宽按表头和前 200 行估算
   * - 应用表头加粗 / 浅灰底色 / 边框
   * - 按 aligns 设置水平对齐
   */
  function writeTableToWorksheet(workbook, table, sheetName) {
    const finalName = makeUniqueSheetName(workbook, sheetName || 'Markdown');
    const ws = workbook.addWorksheet(finalName, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // 用 cols 模式统一控制对齐
    const colCount = Math.max(
      table.header.length,
      ...table.rows.map((r) => r.length),
      1
    );
    const aligns = new Array(colCount).fill(null);
    for (let i = 0; i < Math.min(table.aligns.length, colCount); i++) {
      aligns[i] = table.aligns[i];
    }

    // header
    ws.addRow(padRow(table.header, colCount));
    // rows
    for (const r of table.rows) {
      ws.addRow(padRow(r, colCount));
    }

    // 列宽(粗略自适应)
    ws.columns = new Array(colCount).fill(0).map((_, c) => {
      const headerCell = String(table.header[c] || '');
      let maxLen = headerCell.length;
      const sample = Math.min(table.rows.length, 200);
      for (let r = 0; r < sample; r++) {
        const s = String(table.rows[r][c] || '');
        if (s.length > maxLen) maxLen = s.length;
      }
      const align = aligns[c];
      return {
        width: Math.min(Math.max(maxLen * 1.6 + 4, 12), 48),
      };
    });

    // 应用样式
    applyStylesToWorksheet(ws, colCount, aligns);

    return ws;
  }

  function padRow(arr, len) {
    const out = arr.slice(0, len);
    while (out.length < len) out.push('');
    return out;
  }

  function makeUniqueSheetName(wb, base) {
    let name = base;
    let i = 2;
    const exists = (n) => wb.worksheets.some((ws) => ws.name === n);
    while (exists(name)) {
      name = `${base} (${i++})`;
    }
    return name;
  }

  function applyStylesToWorksheet(ws, colCount, aligns) {
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }, // slate-200
    };
    const headerFont = { bold: true, color: { argb: 'FF1F2937' } };
    const border = {
      top:    { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left:   { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right:  { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };

    const rowCount = ws.rowCount;

    for (let r = 1; r <= rowCount; r++) {
      const row = ws.getRow(r);
      const isHeader = (r === 1);
      for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        const oldStyle = cell.style || {};
        const align = aligns[c - 1];
        cell.style = {
          ...oldStyle,
          font: isHeader ? headerFont : { color: { argb: 'FF1F2937' } },
          fill: isHeader ? headerFill : undefined,
          border,
          alignment: {
            ...(oldStyle.alignment || {}),
            horizontal: align || (isHeader ? 'center' : 'left'),
            vertical: 'middle',
            wrapText: true,
          },
        };
      }
      row.commit();
    }

    // 行高(表头稍高,便于看清)
    ws.getRow(1).height = 22;
  }

  /* ============================================================
   * 示例 Markdown(占位符,用户可在 UI 里改)
   * ============================================================ */
  const SAMPLE_MD = `| 部门   | 姓名 | 金额     |
| :----: | :--- | -------: |
| 研发部 | 张三 | ¥ 12,800 |
| 研发部 | 李四 | ¥  9,600 |
| 市场部 | 王五 | ¥ 15,400 |
| 市场部 | 赵六 | ¥  8,200 |
| 人事部 | 孙七 | ¥  7,500 |
`;

  /* ============================================================
   * 弹窗样式(scoped 到 .md- 前缀,与 theme.js 的 .td- 不冲突)
   * ============================================================ */
  const style = /* css */ `
    .md-mask {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15, 23, 42, .45);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      animation: mdFadeIn .18s ease-out;
    }
    @keyframes mdFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes mdScaleIn {
      from { opacity: 0; transform: scale(.95) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .md-dialog {
      width: 1400px; max-width: calc(100vw - 32px);
      height: calc(100vh - 64px);
      background: var(--bg-elev, #fff);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, .28);
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: mdScaleIn .22s cubic-bezier(.2,.9,.3,1.1);
    }
    .md-header {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 22px;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      flex-shrink: 0;
    }
    .md-header-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: white;
      box-shadow: 0 2px 6px rgba(14,165,233,.3);
    }
    .md-title { font-size: 15px; font-weight: 700; color: var(--text, #1a202c); letter-spacing: -.01em; }
    .md-subtitle { font-size: 12px; color: var(--text-faint, #718096); margin-top: 2px; }
    .md-close {
      margin-left: auto;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; border: none; background: transparent;
      color: var(--text-faint, #718096); cursor: pointer;
      font-size: 18px; line-height: 1; transition: all .15s;
    }
    .md-close:hover { background: var(--bg-elev-2, #f0f3f7); color: var(--text, #1a202c); }
    .md-body {
      display: grid;
      grid-template-columns: 560px 1fr;
      flex: 1; min-height: 0;
      overflow: hidden;
    }
    .md-pane {
      display: flex; flex-direction: column;
      min-width: 0; min-height: 0;
    }
    .md-pane + .md-pane { border-left: 1px solid var(--border, #e2e8f0); }
    .md-pane-head {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev-2, #f8fafc);
      flex-shrink: 0;
    }
    .md-pane-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: var(--text-dim, #4a5568);
      display: flex; align-items: center; gap: 6px;
    }
    .md-pane-actions { display: flex; align-items: center; gap: 6px; }
    .md-mini-btn {
      padding: 5px 10px;
      border-radius: 5px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      color: var(--text-dim, #4a5568);
      font-size: 11px; font-weight: 600;
      cursor: pointer; transition: all .12s;
      font-family: inherit;
    }
    .md-mini-btn:hover { background: var(--bg-elev-2, #f0f3f7); color: var(--text, #1a202c); }
    .md-pane-body {
      flex: 1; min-height: 0; overflow: auto;
      padding: 14px 16px;
      background: var(--bg-elev, #fff);
    }
    /* 右侧布局:预览区可滚动,选项区始终固定在底部 */
    .md-pane-body--split {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }
    .md-pane-body--split .md-preview-scroll {
      flex: 1; min-height: 0;
      overflow: auto;
      padding: 14px 16px;
    }
    .md-pane-body--split .md-options-fixed {
      flex-shrink: 0;
      border-top: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      padding: 6px;
    }
    .md-pane-body--split .md-options {
      margin: 0;
      padding: 12px 16px 14px;
    }
    .md-pane-body--split .md-options + .md-options {
      margin-top: 8px;
    }
    .md-input {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      resize: none;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      padding: 12px 14px;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.55;
      color: var(--text, #1a202c);
      background: var(--bg-elev-2, #f8fafc);
      outline: none;
      white-space: pre;
      tab-size: 2;
    }
    .md-input:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .md-preview {
      display: block;
      width: 100%;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }
    .md-preview-empty {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-faint, #718096);
      font-size: 13px;
    }
    .md-preview table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
    }
    .md-preview th, .md-preview td {
      padding: 8px 12px;
      border: 1px solid var(--border, #e2e8f0);
      color: var(--text, #1a202c);
      vertical-align: middle;
      word-break: break-word;
    }
    .md-preview thead th {
      background: #e2e8f0;
      font-weight: 700;
      color: #1f2937;
    }
    .md-preview th.md-row-num,
    .md-preview td.md-row-num {
      width: 44px; min-width: 44px;
      text-align: center;
      color: var(--text-faint, #718096);
      font-family: Consolas, monospace;
      font-size: 11px;
      background: var(--bg-elev-2, #f8fafc);
      font-weight: 600;
      user-select: none;
    }
    .md-preview tbody tr.row-out td:not(.md-row-num) {
      opacity: .42;
      text-decoration: line-through;
      text-decoration-color: rgba(148, 163, 184, .55);
    }
    .md-preview tbody tr.row-out td.md-row-num {
      background: rgba(220, 38, 38, .06);
      color: var(--danger, #dc2626);
    }
    .md-preview td.align-left   { text-align: left; }
    .md-preview td.align-center { text-align: center; }
    .md-preview td.align-right  { text-align: right; }
    .md-error {
      margin-top: 10px;
      padding: 10px 12px;
      border: 1px solid var(--danger, #dc2626);
      border-radius: 8px;
      background: rgba(220, 38, 38, .06);
      color: var(--danger, #dc2626);
      font-size: 12px;
      line-height: 1.5;
    }
    .md-stats {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: var(--text-faint, #718096);
      font-family: Consolas, monospace;
    }
    .md-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 10px;
      background: var(--bg-elev-2, #f0f3f7);
      color: var(--text-dim, #4a5568);
      font-weight: 600;
    }
    .md-stat-pill b { color: var(--accent, #2563eb); font-weight: 700; }
    .md-options {
      display: flex; flex-direction: column; gap: 8px;
      padding: 10px 12px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-elev-2, #f8fafc);
    }
    .md-options-row {
      display: flex; align-items: center; gap: 10px;
      font-size: 12px;
      color: var(--text-dim, #4a5568);
    }
    .md-options-row label {
      display: flex; align-items: center; gap: 6px;
      cursor: pointer; user-select: none;
    }
    .md-options-row input[type="text"] {
      flex: 1;
      padding: 5px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 5px;
      font-family: inherit;
      font-size: 12px;
      color: var(--text, #1a202c);
      background: var(--bg-elev, #fff);
      outline: none;
    }
    .md-options-row input[type="text"]:focus { border-color: var(--accent, #2563eb); }
    .md-options-row input.md-num {
      width: 72px;
      padding: 5px 8px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 5px;
      font-family: Consolas, monospace;
      font-size: 12px;
      color: var(--text, #1a202c);
      background: var(--bg-elev, #fff);
      outline: none;
      text-align: center;
    }
    .md-options-row input.md-num:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .md-options-row input.md-num:disabled { background: var(--bg-elev-2, #f0f3f7); color: var(--text-faint, #718096); cursor: not-allowed; }
    .md-options-row input.md-num::placeholder { color: var(--text-faint, #94a3b8); font-style: italic; opacity: .85; }
    /* 固定在右下角的统计行(列 / 数据行 / sheet) */
    .md-stats-fixed {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      font-family: Consolas, monospace;
      font-size: 12px;
      margin-bottom: 6px;
    }
    /* 排除行输入框(沿用 text input 样式,加 invalid 状态) */
    .md-options-row input.md-exclude-input {
      width: 100%;
      padding: 5px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 5px;
      font-family: Consolas, monospace;
      font-size: 12px;
      color: var(--text, #1a202c);
      background: var(--bg-elev, #fff);
      outline: none;
    }
    .md-options-row input.md-exclude-input:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .md-options-row input.md-exclude-input:disabled { background: var(--bg-elev-2, #f0f3f7); color: var(--text-faint, #718096); cursor: not-allowed; }
    .md-options-row input.md-exclude-input.invalid { border-color: var(--danger, #dc2626); box-shadow: 0 0 0 3px rgba(220,38,38,.12); }
    .md-toggle { accent-color: var(--accent, #2563eb); cursor: pointer; }
    .md-footer {
      padding: 10px 20px;
      border-top: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    .md-footer .md-hint {
      font-size: 12px; color: var(--text-faint, #718096);
    }
    .md-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      color: var(--text, #1a202c);
      font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit;
      transition: all .12s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .md-btn:hover { background: var(--bg-elev-2, #f0f3f7); border-color: var(--border-strong, #b8c0cc); }
    .md-btn-primary {
      background: var(--accent, #2563eb); border-color: var(--accent, #2563eb);
      color: #fff;
    }
    .md-btn-primary:hover { background: var(--accent-hover, #1d4ed8); border-color: var(--accent-hover, #1d4ed8); }
    .md-btn:disabled { opacity: .5; cursor: not-allowed; }
    .md-mask ::-webkit-scrollbar { width: 8px; height: 8px; }
    .md-mask ::-webkit-scrollbar-track { background: transparent; }
    .md-mask ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .md-mask ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `;

  /* ============================================================
   * Vue 模板
   * ============================================================ */
  const template = /* html */ `
    <div v-if="visible" class="md-mask" @click.self="doCancel">
      <div class="md-dialog" role="dialog" aria-modal="true">

        <div class="md-header">
          <div class="md-header-icon">📋</div>
          <div>
            <div class="md-title">从 Markdown 导入表格</div>
            <div class="md-subtitle">支持 GFM 表格语法(管道符 + 分隔行 + 对齐标记)</div>
          </div>
          <button class="md-close" @click="doCancel" title="关闭">×</button>
        </div>

        <div class="md-body">
          <!-- 左侧:Markdown 输入 -->
          <div class="md-pane">
            <div class="md-pane-head">
              <span class="md-pane-title">📝 Markdown 源</span>
              <div class="md-pane-actions">
                <button class="md-mini-btn" @click="loadSample" title="填入示例">示例</button>
                <button class="md-mini-btn" @click="clearInput" title="清空">清空</button>
                <label class="md-mini-btn" title="从 .md 文件加载" style="cursor:pointer;">
                  导入 .md
                  <input type="file" accept=".md,.markdown,.txt" @change="handleFilePick" style="display:none;" />
                </label>
              </div>
            </div>
            <div class="md-pane-body" style="display:flex; flex-direction:column;">
              <textarea
                class="md-input"
                v-model="source"
                spellcheck="false"
                placeholder="把 Markdown 表格贴在这里,例如:&#10;&#10;| 名称 | 数量 |&#10;| :--- | ---: |&#10;| 苹果 | 3 |&#10;| 香蕉 | 5 |"
              ></textarea>
            </div>
          </div>

          <!-- 右侧:实时预览 -->
          <div class="md-pane">
            <div class="md-pane-head">
              <span class="md-pane-title">👀 实时预览</span>
              <span style="font-size:11px;color:var(--text-faint,#718096);">
                {{ parsed ? '已识别表格' : '等待识别' }}
              </span>
            </div>
            <div class="md-pane-body md-pane-body--split">
              <!-- 上:预览(可滚动) -->
              <div class="md-preview-scroll">
                <div v-if="errorMsg" class="md-error">{{ errorMsg }}</div>

                <div v-if="parsed" class="md-preview" v-html="previewHtml"></div>
                <div v-else-if="!errorMsg" class="md-preview-empty">
                  <div style="font-size:36px;margin-bottom:8px;">📭</div>
                  粘贴或输入包含表格的 Markdown,右侧将自动预览
                </div>
              </div>

              <!-- 下:导入设置(始终固定,不跟随预览滚动) -->
              <div class="md-options-fixed">
                <!-- 统计行(固定) -->
                <div v-if="parsed" class="md-stats md-stats-fixed">
                  <span class="md-stat-pill">列 <b>{{ parsed.header.length }}</b></span>
                  <span class="md-stat-pill">数据行 <b>{{ parsed.rows.length }}</b></span>
                  <span class="md-stat-pill">目标 sheet <b>{{ sheetName || '(未填)' }}</b></span>
                </div>
                <div class="md-options">
                  <div class="md-options-row" style="flex-wrap:wrap;">
                    <label style="flex:1;min-width:200px;">
                      <span style="min-width:80px;color:var(--text-dim,#4a5568);font-weight:600;">新 sheet 名</span>
                      <input type="text" v-model="sheetName" maxlength="31" placeholder="Markdown" />
                    </label>
                    <label style="gap:4px;">
                      <span style="color:var(--text-dim,#4a5568);font-weight:600;">起始行</span>
                      <input
                        type="number"
                        class="md-num"
                        v-model.number="startRow"
                        :min="1"
                        :max="parsed ? parsed.rows.length : 1"
                        :placeholder="parsed ? '1' : '-'"
                        :disabled="!parsed"
                      />
                    </label>
                    <span style="color:var(--text-faint,#718096);">—</span>
                    <label style="gap:4px;">
                      <span style="color:var(--text-dim,#4a5568);font-weight:600;">结束行</span>
                      <input
                        type="number"
                        class="md-num"
                        v-model.number="endRow"
                        :min="1"
                        :max="parsed ? parsed.rows.length : 1"
                        :placeholder="parsed ? String(parsed.rows.length) : '-'"
                        :disabled="!parsed"
                      />
                    </label>
                    <span
                      v-if="endIsAll && parsed"
                      style="font-size:11px;color:var(--accent,#2563eb);font-weight:600;"
                      title="结束行已包含全部数据"
                    >全部</span>
                    <button
                      class="md-mini-btn"
                      style="margin-left:4px;"
                      :disabled="!parsed"
                      @click="resetRange"
                      title="重置为 1 ~ 全部"
                    >重置</button>
                  </div>
                  <div class="md-options-row" style="flex-wrap:wrap;">
                    <label>
                      <input type="checkbox" class="md-toggle" v-model="freezeHeader" />
                      <span>冻结表头</span>
                    </label>
                    <label>
                      <input type="checkbox" class="md-toggle" v-model="applyStyles" />
                      <span>应用默认样式(加粗表头 / 边框)</span>
                    </label>
                    <label style="gap:4px;flex:1;min-width:200px;">
                      <span style="color:var(--text-dim,#4a5568);font-weight:600;">排除行</span>
                      <input
                        type="text"
                        class="md-exclude-input"
                        v-model="excludeText"
                        :placeholder="parsed ? '逗号分隔,如 3, 5, 8-10' : '-'"
                        :disabled="!parsed"
                        :class="{ invalid: !excludeValid }"
                        :title="excludeValid ? '' : '格式错误:只允许数字 / 区间(如 1-5)'"
                      />
                    </label>
                    <span v-if="parsed" style="margin-left:auto;font-size:11px;color:var(--text-faint,#718096);font-family:Consolas,monospace;white-space:nowrap;">
                      实际导入 <b style="color:var(--accent,#2563eb);">{{ actualImportCountAfterExclude }}</b> / {{ parsed.rows.length }} 行
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="md-footer">
          <span class="md-hint">💡 把 Markdown 粘到左侧 → 检查右侧预览 → 点「导入到工作簿」</span>
          <button class="md-btn" @click="doCancel" :disabled="busy">取消</button>
          <button class="md-btn md-btn-primary" @click="doConfirm" :disabled="!parsed || busy">
            <span v-if="busy">导入中...</span>
            <span v-else>导入到工作簿</span>
          </button>
        </div>

      </div>
    </div>
  `;

  /* ============================================================
   * Vue 组件
   * ============================================================ */
  const MarkdownDialog = {
    template,
    setup() {
      const visible = ref(false);
      const source = ref('');
      const sheetName = ref('Markdown');
      const freezeHeader = ref(true);
      const applyStyles = ref(true);
      const busy = ref(false);
      const errorMsg = ref('');
      const startRow = ref(null);
      const endRow = ref(null);
      const excludeText = ref('');   // 逗号分隔的待排除行号,如 "3,5,8-10" 或 "3, 5"

      const parsed = computed(() => {
        errorMsg.value = '';
        const t = (source.value || '').trim();
        if (!t) return null;
        const r = parseMarkdownTable(source.value);
        if (!r) {
          errorMsg.value = '未识别到 Markdown 表格(需要同时包含「表头行」和「分隔行」,如 | --- | --- |)';
          return null;
        }
        if (r.rows.length === 0) {
          errorMsg.value = '已识别表头,但分隔行下方没有数据行';
          return null;
        }
        return r;
      });

      // parsed.rows 变化时,把 startRow/endRow 兜底到合法范围
      // 约定:null / undefined 表示"使用全量默认"(即起始=1,结束=总行数)
      // 用户输入数字后才真正记录;清空 = 恢复"全部"语义
      watch(
        () => (parsed.value ? parsed.value.rows.length : 0),
        (n) => {
          if (!n) {
            startRow.value = null;
            endRow.value = null;
            return;
          }
          // 不强制赋默认值:保持 null,让 placeholder 显示 1 / 总行数
          // 只做越界兜底(用户填了非法值时纠正)
          if (startRow.value != null && startRow.value !== '') {
            const s = Math.floor(Number(startRow.value));
            if (Number.isNaN(s) || s < 1) startRow.value = 1;
            else if (s > n) startRow.value = n;
          }
          if (endRow.value != null && endRow.value !== '') {
            const e = Math.floor(Number(endRow.value));
            if (Number.isNaN(e) || e < 1) endRow.value = n;
            else if (e > n) endRow.value = n;
          }
        },
        { immediate: true }
      );

      // 把用户输入规范到 [1, total],并保证 startRow <= endRow
      // null / 非数字 → 走默认值(起始=1,结束=total)
      const rangeBounds = computed(() => {
        const total = parsed.value ? parsed.value.rows.length : 0;
        if (!total) return { start: 0, end: 0, total: 0 };
        let s;
        if (startRow.value == null || startRow.value === '' || Number.isNaN(Number(startRow.value))) {
          s = 1;
        } else {
          s = Math.floor(Number(startRow.value));
        }
        let e;
        if (endRow.value == null || endRow.value === '' || Number.isNaN(Number(endRow.value))) {
          e = total;
        } else {
          e = Math.floor(Number(endRow.value));
        }
        if (s < 1) s = 1;
        if (s > total) s = total;
        if (e < 1) e = 1;
        if (e > total) e = total;
        if (e < s) e = s;
        return { start: s, end: e, total };
      });

      // "结束"框是否处于"全部"状态(endRow == null 或 == total)
      const endIsAll = computed(() => {
        const total = parsed.value ? parsed.value.rows.length : 0;
        if (!total) return true;
        if (endRow.value == null || endRow.value === '') return true;
        return Math.floor(Number(endRow.value)) >= total;
      });

      const actualImportCount = computed(() => {
        const b = rangeBounds.value;
        return Math.max(0, b.end - b.start + 1);
      });

      // 解析排除行号文本。
      // 支持格式:
      //   "3, 5, 8"          → [3,5,8]
      //   "3 5 8"            → [3,5,8]      (空格 / 制表符也作分隔符)
      //   "3, 8-10"          → [3,8,9,10]   (连字符表示区间)
      //   "3, 8-10, 5"       → [3,5,8,9,10] (自动去重 + 升序)
      // 越界(<1 或 >total)自动剔除。
      const excludedSet = computed(() => {
        const total = parsed.value ? parsed.value.rows.length : 0;
        if (!total) return new Set();
        const raw = (excludeText.value || '').trim();
        if (!raw) return new Set();
        const out = new Set();
        // 同时支持中英文逗号
        const tokens = raw.split(/[,, \t\n\r;]+/).filter(Boolean);
        for (const t of tokens) {
          const m = t.match(/^(\d+)\s*[-~]\s*(\d+)$/);
          if (m) {
            let a = parseInt(m[1], 10);
            let b = parseInt(m[2], 10);
            if (a > b) { const tmp = a; a = b; b = tmp; }
            for (let i = a; i <= b; i++) {
              if (i >= 1 && i <= total) out.add(i);
            }
          } else {
            const n = parseInt(t, 10);
            if (!Number.isNaN(n) && n >= 1 && n <= total) out.add(n);
          }
        }
        return out;
      });

      // 排除后真正会导入的行数
      const actualImportCountAfterExclude = computed(() => {
        const b = rangeBounds.value;
        if (!b.total) return 0;
        let cnt = 0;
        for (let i = b.start; i <= b.end; i++) {
          if (!excludedSet.value.has(i)) cnt++;
        }
        return cnt;
      });

      // 简单的输入是否合法,用来给输入框加边框色
      const excludeValid = computed(() => {
        const total = parsed.value ? parsed.value.rows.length : 0;
        if (!total) return true;
        const raw = (excludeText.value || '').trim();
        if (!raw) return true;
        const tokens = raw.split(/[,, \t\n\r;]+/).filter(Boolean);
        for (const t of tokens) {
          // 区间
          if (/^\d+\s*[-~]\s*\d+$/.test(t)) continue;
          // 单个数字
          if (/^\d+$/.test(t)) continue;
          return false;
        }
        return true;
      });

      const previewHtml = computed(() => {
        const t = parsed.value;
        if (!t) return '';
        const alignClass = (i) => {
          const a = t.aligns[i];
          if (a === 'left')   return 'align-left';
          if (a === 'center') return 'align-center';
          if (a === 'right')  return 'align-right';
          return 'align-left';
        };
        const esc = (s) => String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        const { start, end } = rangeBounds.value;
        const ex = excludedSet.value;
        let html = '<table><thead><tr>';
        // 行号列(表头留空,数据列显示真实行号;表头与序号语义不重复)
        html += '<th class="md-row-num">#</th>';
        t.header.forEach((h, i) => {
          html += `<th class="${alignClass(i)}">${esc(h)}</th>`;
        });
        html += '</tr></thead><tbody>';
        for (let r = 0; r < t.rows.length; r++) {
          const row = t.rows[r];
          const rowNo = r + 1;            // 1-based 行号
          // 三种"出局"原因:超出区间 / 在排除列表
          const inRange = rowNo >= start && rowNo <= end;
          const isExcluded = ex.has(rowNo);
          const cls = (inRange && !isExcluded) ? '' : ' class="row-out"';
          html += `<tr${cls}>`;
          html += `<td class="md-row-num">${rowNo}</td>`;
          for (let i = 0; i < t.header.length; i++) {
            html += `<td class="${alignClass(i)}">${esc(row[i] || '')}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
      });

      function resetRange() {
        const n = parsed.value ? parsed.value.rows.length : 0;
        if (!n) return;
        startRow.value = 1;
        endRow.value = n;
      }

      function loadSample() {
        source.value = SAMPLE_MD;
      }
      function clearInput() {
        source.value = '';
      }
      async function handleFilePick(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          source.value = text;
          if (!sheetName.value || sheetName.value === 'Markdown') {
            sheetName.value = file.name.replace(/\.(md|markdown|txt)$/i, '') || 'Markdown';
          }
        } catch (err) {
          errorMsg.value = '读取文件失败: ' + err.message;
        } finally {
          e.target.value = '';
        }
      }

      /* 任务上下文 */
      let pendingTask = null;

      async function doConfirm() {
        if (busy.value) return;
        if (!parsed.value) return;
        if (!pendingTask) return;
        busy.value = true;
        try {
          const fullTable = parsed.value;
          const { start, end } = rangeBounds.value;
          const ex = excludedSet.value;
          // 按范围截取行(1-based),再过滤掉排除行
          const slicedRows = [];
          for (let i = start; i <= end; i++) {
            if (!ex.has(i)) slicedRows.push(fullTable.rows[i - 1]);
          }
          const table = {
            header: fullTable.header,
            rows: slicedRows,
            aligns: fullTable.aligns,
          };
          const targetWb = pendingTask.workbook || new ExcelJS.Workbook();
          const ws = writeTableToWorksheet(targetWb, table, sheetName.value || 'Markdown');
          if (!freezeHeader.value) {
            // writeTableToWorksheet 已经设了冻结;按用户选择覆盖
            ws.views = [];
          }
          if (!applyStyles.value) {
            // 清掉所有样式:重置 fill/font/border,只保留对齐
            for (let r = 1; r <= ws.rowCount; r++) {
              const row = ws.getRow(r);
              for (let c = 1; c <= table.header.length; c++) {
                const cell = row.getCell(c);
                const oldStyle = cell.style || {};
                cell.style = {
                  ...oldStyle,
                  fill: undefined,
                  font: {},
                  border: {},
                };
              }
              row.commit();
            }
          }
          visible.value = false;
          if (typeof pendingTask.onDone === 'function') {
            pendingTask.onDone({
              workbook: targetWb,
              worksheet: ws,
              table,
              importedRows: slicedRows.length,
              range: { start, end, total: fullTable.rows.length },
            });
          }
        } catch (err) {
          console.error('[md.js] import failed:', err);
          errorMsg.value = '导入失败: ' + (err && err.message || err);
          if (typeof pendingTask && pendingTask && typeof pendingTask.onError === 'function') {
            pendingTask.onError(err);
          }
        } finally {
          busy.value = false;
          pendingTask = null;
        }
      }

      function doCancel() {
        if (busy.value) return;
        visible.value = false;
        pendingTask = null;
      }

      // 全局 API
      window.ExcelMarkdownImport = {
        open(opts = {}) {
          pendingTask = {
            workbook: opts.workbook || null,
            onDone: opts.onDone || null,
            onError: opts.onError || null,
          };
          source.value = '';
          sheetName.value = opts.sheetName || 'Markdown';
          freezeHeader.value = true;
          applyStyles.value = true;
          errorMsg.value = '';
          startRow.value = null;
          endRow.value = null;
          excludeText.value = '';
          visible.value = true;
          // 第一次打开时给个示例,方便用户立刻看到效果
          if (!source.value) loadSample();
        },
        // 暴露给高级用户 / 测试用
        parseMarkdownTable,
        writeTableToWorksheet,
      };

      // ESC 关闭
      function onKey(e) {
        if (e.key === 'Escape' && visible.value) doCancel();
      }
      window.addEventListener('keydown', onKey);

      return {
        visible, source, sheetName, freezeHeader, applyStyles, busy,
        startRow, endRow, actualImportCount, endIsAll,
        excludeText, excludedSet, actualImportCountAfterExclude, excludeValid,
        parsed, previewHtml, errorMsg,
        loadSample, clearInput, handleFilePick,
        resetRange,
        doConfirm, doCancel,
      };
    },
  };

  /* ============================================================
   * 挂载
   * ============================================================ */
  function mount() {
    try {
      let host = document.getElementById('md-dialog');
      if (!host) {
        host = Object.assign(document.createElement('div'), { id: 'md-dialog' });
        document.body.appendChild(host);
      }
      if (!document.getElementById('md-dialog-style')) {
        document.head.appendChild(Object.assign(document.createElement('style'), {
          id: 'md-dialog-style',
          textContent: style,
        }));
      }
      createApp(MarkdownDialog).mount(host);
    } catch (err) {
      console.error('[md.js] 挂载失败:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();