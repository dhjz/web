/* ============================================================
 * theme.js  导出样式美化 Dialog
 * ------------------------------------------------------------
 *  - 24 种内置风格 + 自定义颜色
 *  - 左侧主题列表 / 右侧实时预览
 *  - 负责把选中的样式应用到传入的 workbook,并写 buffer / 触发下载
 *
 *  调用:
 *    window.ExcelThemeDialog.exportWorkbook({
 *      workbook,          // ExcelJS.Workbook 实例
 *      fileName,          // 原始文件名,用于拼导出文件名
 *      onDone,            // 可选:导出完成回调
 *      onError,           // 可选:导出失败回调
 *    })
 *
 *  对 index.html 的侵入:0(脚本已存在)。
 *  主题样式应用、buffer 生成、文件下载全部在本文件内完成。
 * ============================================================ */

(function () {
  if (!window.Vue) {
    console.error('[theme.js] Vue 未加载');
    return;
  }
  if (!window.ExcelJS) {
    console.error('[theme.js] ExcelJS 未加载');
    return;
  }

  const { createApp, ref, reactive, computed } = Vue;

  /* ---------------- 内置主题(24 种,只含配色) ---------------- */
  // 24 套配色;「奇偶行区分 / 深色 / 浅色 / 白色」是导出参数(全局,与主题无关)
  const themes = [
    { id: 'classic-blue',    name: '经典蓝',     icon: '🔵', header: '#2563EB', headerText: '#FFFFFF', band: '#EFF6FF', border: '#93C5FD', zebra: '#F8FAFC', font: 'Calibri',  size: 11 },
    { id: 'corporate-dark',  name: '商务深色',   icon: '🟦', header: '#0F172A', headerText: '#FFFFFF', band: '#F1F5F9', border: '#94A3B8', zebra: '#E2E8F0', font: 'Calibri',  size: 11 },
    { id: 'ocean',           name: '海洋蓝',     icon: '🌊', header: '#0369A1', headerText: '#FFFFFF', band: '#E0F2FE', border: '#7DD3FC', zebra: '#F0F9FF', font: 'Calibri',  size: 11 },
    { id: 'forest',          name: '森林绿',     icon: '🌲', header: '#15803D', headerText: '#FFFFFF', band: '#DCFCE7', border: '#86EFAC', zebra: '#F0FDF4', font: 'Calibri',  size: 11 },
    { id: 'fresh-mint',      name: '清新薄荷',   icon: '🍃', header: '#10B981', headerText: '#FFFFFF', band: '#D1FAE5', border: '#6EE7B7', zebra: '#ECFDF5', font: 'Calibri',  size: 11 },
    { id: 'sunset',          name: '日落橙',     icon: '🌇', header: '#EA580C', headerText: '#FFFFFF', band: '#FFEDD5', border: '#FDBA74', zebra: '#FFF7ED', font: 'Calibri',  size: 11 },
    { id: 'warm-amber',      name: '琥珀暖',     icon: '🍯', header: '#B45309', headerText: '#FFFFFF', band: '#FEF3C7', border: '#FCD34D', zebra: '#FFFBEB', font: 'Calibri',  size: 11 },
    { id: 'ruby',            name: '红宝石',     icon: '❤️', header: '#BE123C', headerText: '#FFFFFF', band: '#FFE4E6', border: '#FDA4AF', zebra: '#FFF1F2', font: 'Calibri',  size: 11 },
    { id: 'rose',            name: '玫瑰粉',     icon: '🌹', header: '#DB2777', headerText: '#FFFFFF', band: '#FCE7F3', border: '#F9A8D4', zebra: '#FDF2F8', font: 'Calibri',  size: 11 },
    { id: 'purple',          name: '紫罗兰',     icon: '💜', header: '#7C3AED', headerText: '#FFFFFF', band: '#EDE9FE', border: '#C4B5FD', zebra: '#F5F3FF', font: 'Calibri',  size: 11 },
    { id: 'indigo-night',    name: '靛蓝夜空',   icon: '🌌', header: '#4338CA', headerText: '#FFFFFF', band: '#E0E7FF', border: '#A5B4FC', zebra: '#EEF2FF', font: 'Calibri',  size: 11 },
    { id: 'slate',           name: '石板灰',     icon: '🪨', header: '#475569', headerText: '#FFFFFF', band: '#E2E8F0', border: '#CBD5E1', zebra: '#F8FAFC', font: 'Calibri',  size: 11 },
    { id: 'monochrome',      name: '极简黑白',   icon: '⬛', header: '#111827', headerText: '#FFFFFF', band: '#F3F4F6', border: '#D1D5DB', zebra: '#FAFAFA', font: 'Calibri',  size: 11 },
    { id: 'gold',            name: '典雅金',     icon: '✨', header: '#A16207', headerText: '#FFFFFF', band: '#FEF9C3', border: '#FDE047', zebra: '#FEFCE8', font: 'Cambria',  size: 11 },
    { id: 'teal',            name: '湖青',       icon: '🧊', header: '#0F766E', headerText: '#FFFFFF', band: '#CCFBF1', border: '#5EEAD4', zebra: '#F0FDFA', font: 'Calibri',  size: 11 },
    { id: 'cyan',            name: '青蓝',       icon: '🦋', header: '#0891B2', headerText: '#FFFFFF', band: '#CFFAFE', border: '#67E8F9', zebra: '#ECFEFF', font: 'Calibri',  size: 11 },
    { id: 'olive',           name: '橄榄绿',     icon: '🫒', header: '#65A30D', headerText: '#FFFFFF', band: '#ECFCCB', border: '#BEF264', zebra: '#F7FEE7', font: 'Calibri',  size: 11 },
    { id: 'coral',           name: '珊瑚色',     icon: '🪸', header: '#F43F5E', headerText: '#FFFFFF', band: '#FFE4E6', border: '#FB7185', zebra: '#FFF1F2', font: 'Calibri',  size: 11 },
    { id: 'lavender',        name: '薰衣草',     icon: '💐', header: '#8B5CF6', headerText: '#FFFFFF', band: '#F3E8FF', border: '#D8B4FE', zebra: '#FAF5FF', font: 'Calibri',  size: 11 },
    { id: 'graphite',        name: '石墨黑',     icon: '🖤', header: '#1F2937', headerText: '#FFFFFF', band: '#F9FAFB', border: '#9CA3AF', zebra: '#F3F4F6', font: 'Consolas', size: 11 },
    { id: 'sky-soft',        name: '柔和天空',   icon: '☁️', header: '#38BDF8', headerText: '#FFFFFF', band: '#E0F2FE', border: '#BAE6FD', zebra: '#F0F9FF', font: 'Calibri',  size: 11 },
    { id: 'mocha',           name: '摩卡',       icon: '☕', header: '#78350F', headerText: '#FFFFFF', band: '#FED7AA', border: '#FDBA74', zebra: '#FFFBEB', font: 'Cambria',  size: 11 },
    { id: 'berry',           name: '莓果紫',     icon: '🍇', header: '#6D28D9', headerText: '#FFFFFF', band: '#EDE9FE', border: '#A78BFA', zebra: '#F5F3FF', font: 'Calibri',  size: 11 },
    { id: 'spring',          name: '春日嫩芽',   icon: '🌱', header: '#84CC16', headerText: '#FFFFFF', band: '#ECFCCB', border: '#A3E635', zebra: '#F7FEE7', font: 'Calibri',  size: 11 },
  ];

  /* ---------------- 用户自定义主题存储 ---------------- */
  const CUSTOM_STORAGE_KEY = 'excelThemeCustomList';

  function loadCustomThemes() {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // 过滤掉非法记录
      return arr.filter(t =>
        t && t.id && t.name && t.header && t.headerText &&
        t.band && t.zebra && t.border
      );
    } catch (e) {
      console.warn('[theme.js] 读取自定义主题失败:', e);
      return [];
    }
  }

  function saveCustomThemes(list) {
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[theme.js] 保存自定义主题失败:', e);
    }
  }

  // 启动时把保存的主题合并进来。每条存储记录只代表 1 个变体(由 banded 字段决定),
  // 所以一条记录 = 列表中一项。用户主题排在最前面。
  function buildAllThemes(rowModeValue) {
       const customs = loadCustomThemes();
       // 给每条主题注入 rowMode(导出参数,不在主题里存储)
       const tag = (t) => ({ ...t, rowMode: rowModeValue });
       return customs.map(tag).concat(themes.map(tag));
     }
  
  let allThemesCache = null; // 初始化延后到 setup() 里

  /* ---------------- Excel 样式应用 ---------------- */
  function hexToArgb(hex) {
    if (!hex) return 'FF000000';
    hex = String(hex).replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return 'FF000000';
    return 'FF' + hex.toUpperCase();
  }

  // 计算一个 #rrggbb 的"亮度"(0~255,越大越浅)
  function hexLuminance(hex) {
    const h = String(hex || '').replace('#', '');
    if (h.length !== 6) return 128;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // 行模式:根据 theme.band / theme.zebra / mode 算出每行底色
  //   mode = 'zebra'   奇偶行区分:偶数行 zebra,奇数行 band
  //   mode = 'dark'    取 band/zebra 中更深(亮度更低)的那个作为统一底
  //   mode = 'light'   取 band/zebra 中更浅(亮度更高)的那个作为统一底
  //   mode = 'white'   纯白 #FFFFFF
  function resolveRowFill(theme, mode, rowIndex) {
    const bandL = hexLuminance(theme.band);
    const zebraL = hexLuminance(theme.zebra);
    if (mode === 'dark') {
      return bandL <= zebraL ? theme.band : theme.zebra;
    }
    if (mode === 'light') {
      return bandL >= zebraL ? theme.band : theme.zebra;
    }
    if (mode === 'white') {
      return '#FFFFFF';
    }
    // 默认 zebra
    return (rowIndex % 2 === 0) ? theme.zebra : theme.band;
  }

  function applyThemeToWorkbook(wb, theme) {
    console.log('[theme.js] applyThemeToWorkbook theme=', JSON.stringify({
      id: theme.id, band: theme.band, zebra: theme.zebra, rowMode: theme.rowMode,
    }));
    // 用 worksheets 数组直接遍历(等价 eachSheet,但更容易控制)
    wb.worksheets.forEach((ws) => {
      const rowCount = ws.rowCount;
      // columnCount 只反映设置了 width 的列;用 eachRow 计算实际列数
      let actualColCount = ws.columnCount;
      if (!actualColCount) {
        ws.eachRow((row) => {
          if (row.cellCount > actualColCount) actualColCount = row.cellCount;
        });
      }
      const colCount = actualColCount;
      console.log('[theme.js] sheet=', ws.name, 'rowCount=', rowCount, 'colCount=', colCount);
      if (!rowCount || !colCount) { console.warn('[theme.js] skip sheet (empty)'); return; }

      const borderArgb = hexToArgb(theme.border);
      const borderStyle = {
        top: { style: 'thin', color: { argb: borderArgb } },
        left: { style: 'thin', color: { argb: borderArgb } },
        bottom: { style: 'thin', color: { argb: borderArgb } },
        right: { style: 'thin', color: { argb: borderArgb } },
      };

      // 表头行
      const headerRow = ws.getRow(1);
      const headerFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: hexToArgb(theme.header) },
      };
      for (let c = 1; c <= colCount; c++) {
        const cell = headerRow.getCell(c);
        // 用 style 整体赋值:ExcelJS 内部会真正替换 fill/font/border,不受原 fill 影响。
        // 同时通过 spread 保留原 alignment / wrapText / numFmt。
        const oldStyle = cell.style || {};
        cell.style = {
          ...oldStyle,
          fill: headerFill,
          font: {
            name: theme.font,
            size: theme.size,
            bold: theme.boldHeader !== false,
            color: { argb: hexToArgb(theme.headerText) },
          },
          border: borderStyle,
        };
      }
      headerRow.commit();

      // 数据行
      const rowMode = theme.rowMode || 'zebra';
      let paintCount = 0;
      for (let r = 2; r <= rowCount; r++) {
        const row = ws.getRow(r);
        const rowColor = resolveRowFill(theme, rowMode, r);
        const rowColorArgb = hexToArgb(rowColor);
        let rowHasValue = false;
        for (let c = 1; c <= colCount; c++) {
          const cell = row.getCell(c);
          // 用 style 整体赋值:ExcelJS 内部会真正替换 fill/font/border,不受原 fill 影响。
          const oldStyle = cell.style || {};
          cell.style = {
            ...oldStyle,
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: rowColorArgb },
            },
            font: {
              name: theme.font,
              size: theme.size,
            },
            border: borderStyle,
          };
          if (cell.value !== null && cell.value !== undefined && cell.value !== '') rowHasValue = true;
        }
        if (rowHasValue) paintCount++;
        row.commit();
      }
      console.log('[theme.js]', ws.name, 'painted', paintCount, '/', rowCount - 1, 'rows with mode', rowMode);

      // 冻结表头:根据 freezeHeader 主动设置/重置(避免主 app 之前的冻结残留)
      if (theme.freezeHeader) {
        ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
      } else {
        // ExcelJS 中,清空 views 才能取消冻结
        ws.views = [];
      }

      // 列宽(粗略自适应,只在未设置时)
      for (let c = 1; c <= colCount; c++) {
        const col = ws.getColumn(c);
        if (!col.width) {
          let maxLen = 8;
          const sample = Math.min(rowCount, 200);
          for (let r = 1; r <= sample; r++) {
            const v = ws.getRow(r).getCell(c).value;
            const s = v === null || v === undefined ? '' :
              (typeof v === 'object' ? (v.text || (v.richText ? v.richText.map(x => x.text).join('') : '') || String(v.result || v.formula || '')) : String(v));
            if (s.length > maxLen) maxLen = s.length;
          }
          col.width = Math.min(Math.max(maxLen + 2, 10), 40);
        }
      }
    });
  }

  async function writeBufferAndDownload(wb, fileName, theme) {
    // 先把原 workbook 写 buffer 再读回来,得到一个完全独立的副本。
    // 这样 applyThemeToWorkbook 修改的是副本,原 wb 不受影响。
    const srcBuffer = await wb.xlsx.writeBuffer();
    const cloneWb = new ExcelJS.Workbook();
    await cloneWb.xlsx.load(srcBuffer);
    applyThemeToWorkbook(cloneWb, theme);
    const buffer = await cloneWb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const base = (fileName || '导出表格').replace(/\.(xlsx|xls)$/i, '') || '导出表格';
    a.href = url;
    // a.download = `${base}_${theme.id}_${ts}.xlsx`;
    a.download = `${base}_${ts}.xlsx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /* ---------------- 样式(全部 scoped 到 .td- 前缀) ---------------- */
  const style = /* css */ `
    .td-mask {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(15, 23, 42, .45);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      animation: tdFadeIn .18s ease-out;
    }
    @keyframes tdFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes tdScaleIn {
      from { opacity: 0; transform: scale(.95) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .td-dialog {
      width: 1000px; max-width: calc(100vw - 32px);
      height: calc(100vh - 64px);
      background: var(--bg-elev, #fff);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, .28);
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: tdScaleIn .22s cubic-bezier(.2,.9,.3,1.1);
    }
    .td-header {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 22px;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      flex-shrink: 0;
    }
    .td-header-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: white;
      box-shadow: 0 2px 6px rgba(37,99,235,.3);
    }
    .td-title { font-size: 15px; font-weight: 700; color: var(--text, #1a202c); letter-spacing: -.01em; }
    .td-subtitle { font-size: 12px; color: var(--text-faint, #718096); margin-top: 2px; }
    .td-close {
      margin-left: auto;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; border: none; background: transparent;
      color: var(--text-faint, #718096); cursor: pointer;
      font-size: 18px; line-height: 1; transition: all .15s;
    }
    .td-close:hover { background: var(--bg-elev-2, #f0f3f7); color: var(--text, #1a202c); }
    .td-body {
      display: grid;
      grid-template-columns: 360px 1fr;
      flex: 1; min-height: 0;
      overflow: hidden;
    }
    .td-left {
      display: flex; flex-direction: column;
      border-right: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev-2, #f8fafc);
      min-height: 0;
    }
    .td-left-head {
      padding: 12px 14px 8px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: var(--text-dim, #4a5568);
      display: flex; align-items: center; justify-content: space-between;
    }
    .td-search {
      margin: 0 12px 8px;
      padding: 7px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--bg-elev, #fff);
      font-size: 12px;
      outline: none;
      color: var(--text, #1a202c);
      font-family: inherit;
    }
    .td-search:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .td-filter-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px 8px;
    }
    .td-select {
      padding: 7px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--bg-elev, #fff);
      font-size: 12px;
      outline: none;
      color: var(--text, #1a202c);
      font-family: inherit;
      cursor: pointer;
      font-weight: 600;
    }
    .td-select:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .td-theme-list {
      flex: 1; min-height: 0; overflow-y: auto;
      padding: 4px 8px 12px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
      align-content: start;
    }
    .td-theme-card {
      position: relative;
      padding: 8px 8px 8px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-elev, #fff);
      cursor: pointer;
      transition: all .15s;
      display: flex; flex-direction: column; gap: 6px;
      user-select: none;
    }
    .td-theme-card:hover { border-color: var(--border-strong, #b8c0cc); transform: translateY(-1px); box-shadow: 0 2px 6px rgba(15,23,42,.06); }
    .td-theme-card.active {
      border-color: var(--accent, #2563eb);
      box-shadow: 0 0 0 3px rgba(37,99,235,.18);
      background: #fff;
    }
    .td-theme-card.active::after {
      content: '✓';
      position: absolute; top: 4px; right: 6px;
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--accent, #2563eb); color: #fff;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .td-theme-card.custom { border-style: dashed; }
    .td-theme-name {
      font-size: 12px; font-weight: 600; color: var(--text, #1a202c);
      display: flex; align-items: center; gap: 5px;
      line-height: 1.2;
    }
    .td-theme-name .ico { font-size: 13px; }
    .td-theme-strip {
      display: flex; gap: 0;
      height: 16px;
      border-radius: 4px; overflow: hidden;
      border: 1px solid rgba(0,0,0,.06);
    }
    .td-theme-strip > span { flex: 1; }
    .td-right {
      display: flex; flex-direction: column;
      min-width: 0; min-height: 0;
      background: var(--bg-elev, #fff);
    }
    .td-right-head {
      padding: 14px 20px 12px;
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    .td-right-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: var(--text-dim, #4a5568);
      display: flex; align-items: center; justify-content: space-between;
    }
    .td-tabs { display: flex; gap: 4px; }
    .td-tab {
      padding: 5px 12px; border-radius: 6px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      color: var(--text-dim, #4a5568);
      background: var(--bg-elev-2, #f0f3f7);
      border: 1px solid transparent;
      transition: all .12s;
      user-select: none;
    }
    .td-tab.active { background: var(--bg-elev, #fff); color: var(--accent, #2563eb); border-color: var(--accent, #2563eb); }
    .td-tab:hover:not(.active) { background: #fff; color: var(--text, #1a202c); }
    .td-right-body {
      flex: 1; min-height: 0; overflow-y: auto;
      padding: 18px 20px;
    }
    .td-preview-wrap {
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 8px, #f1f5f9 8px, #f1f5f9 16px);
      border-radius: 10px;
      border: 1px solid var(--border, #e2e8f0);
      min-height: 200px;
    }
    .td-preview-table {
      width: 100%;
      max-width: 520px;
      border-collapse: collapse;
      font-size: 13px;
      background: #fff;
      box-shadow: 0 4px 16px rgba(15,23,42,.1);
    }
    .td-preview-table th, .td-preview-table td {
      padding: 8px 12px;
      border: 1px solid var(--border, #e2e8f0);
      text-align: left;
      color: var(--text, #1a202c);
    }
    .td-preview-table thead th {
      font-weight: 700;
      letter-spacing: .02em;
    }
    .td-custom-panel {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px;
    }
    .td-field {
      display: flex; flex-direction: column; gap: 5px;
    }
    .td-field-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .06em; color: var(--text-dim, #4a5568);
      display: flex; align-items: center; justify-content: space-between;
    }
    .td-color-row {
      display: flex; align-items: center; gap: 8px;
    }
    .td-color-row input[type="color"] {
      width: 38px; height: 32px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: none;
      cursor: pointer;
      padding: 2px;
    }
    .td-color-row input[type="text"] {
      flex: 1;
      padding: 7px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      font-family: Consolas, monospace;
      font-size: 12px;
      color: var(--text, #1a202c);
      background: var(--bg-elev, #fff);
      outline: none;
    }
    .td-color-row input[type="text"]:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .td-font-row {
      display: flex; gap: 8px;
    }
    .td-font-row select, .td-font-row input {
      flex: 1;
      padding: 7px 10px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      font-family: inherit;
      font-size: 12px;
      color: var(--text, #1a202c);
      background: var(--bg-elev, #fff);
      outline: none;
    }
    .td-font-row select:focus, .td-font-row input:focus { border-color: var(--accent, #2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .td-toggle-row {
      grid-column: 1 / -1;
      display: flex; flex-wrap: wrap; gap: 14px;
      padding: 10px 12px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      background: var(--bg-elev-2, #f8fafc);
    }
    .td-toggle {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-dim, #4a5568);
      cursor: pointer; user-select: none;
    }
    .td-toggle input[type="checkbox"] { accent-color: var(--accent, #2563eb); cursor: pointer; width: 14px; height: 14px; }
    .td-export-options {
      display: flex; flex-direction: column; gap: 8px;
      margin-bottom: 14px;
      padding: 12px 14px;
      background: var(--bg-elev-2, #f8fafc);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
    }
    .td-export-row {
      display: flex; align-items: center; gap: 14px;
    }
    .td-saved-card:hover { background: var(--bg-elev-2, #f8fafc); border-color: var(--border-strong, #b8c0cc) !important; }
    .td-saved-card.active { background: rgba(37,99,235,.08) !important; border-color: var(--accent, #2563eb) !important; }
    .td-footer {
      padding: 14px 22px;
      border-top: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    .td-footer .td-hint {
      font-size: 12px; color: var(--text-faint, #718096);
    }
    .td-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg-elev, #fff);
      color: var(--text, #1a202c);
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all .12s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .td-btn:hover { background: var(--bg-elev-2, #f0f3f7); border-color: var(--border-strong, #b8c0cc); }
    .td-btn-primary {
      background: var(--accent, #2563eb); border-color: var(--accent, #2563eb);
      color: #fff;
    }
    .td-btn-primary:hover { background: var(--accent-hover, #1d4ed8); border-color: var(--accent-hover, #1d4ed8); }
    .td-btn:disabled { opacity: .5; cursor: not-allowed; }
    .td-btn-danger-text { color: var(--danger, #dc2626); border-color: transparent; background: transparent; }
    .td-btn-danger-text:hover { background: rgba(220,38,38,.08); }
    .td-mask ::-webkit-scrollbar { width: 8px; height: 8px; }
    .td-mask ::-webkit-scrollbar-track { background: transparent; }
    .td-mask ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .td-mask ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `;

  /* ---------------- 模板(用 Vue 的 :style 注入 css 字符串) ---------------- */
  const template = /* html */ `
    <div v-if="visible" class="td-mask" @click.self="doCancel">
      <div class="td-dialog" role="dialog" aria-modal="true">

        <div class="td-header">
          <div class="td-header-icon">🎨</div>
          <div>
            <div class="td-title">导出样式美化</div>
            <div class="td-subtitle">选择一个风格,导出后的 Excel 将自动应用对应的配色和字体</div>
          </div>
          <button class="td-close" @click="doCancel" title="关闭">×</button>
        </div>

        <div class="td-body">
          <!-- 左侧主题列表 -->
          <div class="td-left">
            <div class="td-left-head">
              <span>主题风格</span>
              <span style="color:var(--accent,#2563eb);">{{ filteredThemes.length }}</span>
            </div>
            <div class="td-filter-row">
              <select class="td-select" v-model="categoryFilter" style="flex: 0 0 110px;">
                <option value="all">全部</option>
                <option value="user">⭐ 我的主题</option>
                <option value="builtin">🎨 内置</option>
              </select>
              <input class="td-search" v-model="keyword" placeholder="搜索风格名称..." style="margin: 0; flex: 1;" />
            </div>
            <div class="td-theme-list">
              <div
                v-for="t in filteredThemes"
                :key="t.id"
                class="td-theme-card"
                :class="{ active: selectedId === t.id, custom: t.id === 'custom' }"
                @click="selectTheme(t)"
                :title="t.name"
              >
                <div class="td-theme-name">
                  <span class="ico">{{ t.icon }}</span>
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ t.name }}</span>
                </div>
                <div class="td-theme-strip">
                  <span :style="{ background: t.header }"></span>
                  <span :style="{ background: t.band }"></span>
                  <span :style="{ background: '#fff', borderLeft: '1px solid ' + t.border, borderRight: '1px solid ' + t.border }"></span>
                  <span :style="{ background: t.zebra }"></span>
                  <span :style="{ background: t.border }"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧预览 / 自定义 -->
          <div class="td-right">
            <div class="td-right-head">
              <div class="td-right-title">
                <span>预览</span>
                <div class="td-tabs">
                  <div class="td-tab" :class="{ active: tab === 'preview' }" @click="tab = 'preview'">实时预览</div>
                  <div class="td-tab" :class="{ active: tab === 'custom' }" @click="tab = 'custom'">自定义颜色</div>
                </div>
              </div>
            </div>

            <div class="td-right-body">
              <!-- 实时预览 -->
              <div v-show="tab === 'preview'">
                <!-- 导出参数(实时生效,影响预览 + 导出) -->
                <div class="td-export-options">
                  <div class="td-export-row">
                    <label class="td-toggle">
                      <input type="checkbox" v-model="boldHeader" />
                      <span>表头加粗</span>
                    </label>
                    <label class="td-toggle">
                      <input type="checkbox" v-model="freezeHeader" />
                      <span>冻结表头</span>
                    </label>
                    <select class="td-select" v-model="rowMode" style="flex:1;">
                      <option value="zebra">奇偶行区分</option>
                      <option value="dark">深色(取 band/zebra 中更深)</option>
                      <option value="light">浅色(取 band/zebra 中更浅)</option>
                      <option value="white">白色</option>
                    </select>
                  </div>
                </div>

                <div class="td-preview-wrap">
                  <table class="td-preview-table">
                    <thead>
                      <tr>
                        <th :style="previewHeaderStyle">序号</th>
                        <th :style="previewHeaderStyle">部门</th>
                        <th :style="previewHeaderStyle">姓名</th>
                        <th :style="previewHeaderStyle">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in previewRows" :key="i">
                        <td :style="{ ...previewCellStyle, ...previewZebra(i) }">{{ row[0] }}</td>
                        <td :style="{ ...previewCellStyle, ...previewZebra(i) }">{{ row[1] }}</td>
                        <td :style="{ ...previewCellStyle, ...previewZebra(i) }">{{ row[2] }}</td>
                        <td :style="{ ...previewCellStyle, ...previewZebra(i) }">{{ row[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style="margin-top:12px;font-size:12px;color:var(--text-faint,#718096);text-align:center;">
                  当前选择:<b :style="{ color: currentTheme.header }">{{ currentTheme.name }}</b>
                </div>
              </div>

              <!-- 自定义颜色 -->
              <div v-show="tab === 'custom'">
                <!-- 顶部:主题名 + 新增 / 删除按钮 -->
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:var(--bg-elev-2,#f8fafc);">
                  <span style="font-size:18px;">{{ custom.icon || '⭐' }}</span>
                  <input
                    type="text"
                    v-model="custom.name"
                    placeholder="主题名(改完自动保存)"
                    maxlength="20"
                    style="flex:1;padding:7px 10px;border:1px solid var(--border,#e2e8f0);border-radius:6px;font-family:inherit;font-size:13px;outline:none;background:var(--bg-elev,#fff);color:var(--text,#1a202c);font-weight:600;"
                  />
                  <button
                    class="td-btn td-btn-primary"
                    @click="manualSave"
                    :disabled="!editingId || !isDirty"
                    :title="isDirty ? '保存当前改动到本地' : '没有改动需要保存'"
                    :style="isDirty ? '' : 'opacity:.55;'"
                  >保存</button>
                  <button class="td-btn" @click="newCustom" title="新增一个自定义主题">新增自定义</button>
                  <button class="td-btn td-btn-danger-text" @click="deleteCurrentCustom" title="删除当前编辑的自定义主题">
                    {{ editingId ? '删除此自定义' : '清空草稿' }}
                  </button>
                </div>
                <div v-if="saveToast" style="margin-bottom:10px;font-size:12px;color:var(--success,#16a34a);font-weight:600;">{{ saveToast }}</div>

                <!-- 已保存主题快速加载(小卡片) -->
                <div v-if="savedList.length" style="margin-bottom:12px;">
                  <div
                    style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim,#4a5568);user-select:none;"
                    @click="showSavedList = !showSavedList"
                  >
                    <span>我的主题({{ savedList.length }})</span>
                    <span style="font-size:14px;">{{ showSavedList ? '▾' : '▸' }}</span>
                  </div>
                  <div v-show="showSavedList" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:160px;overflow-y:auto;border:1px solid var(--border,#e2e8f0);border-radius:6px;padding:6px;background:var(--bg-elev,#fff);">
                    <div
                      v-for="s in savedList"
                      :key="s.baseId"
                      @click="loadSavedToCustom(s.baseId)"
                      :class="['td-saved-card', editingId === s.baseId ? 'active' : '']"
                      style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:4px;font-size:11px;cursor:pointer;border:1px solid var(--border,#e2e8f0);"
                      :title="'点击编辑: ' + s.name"
                    >
                      <span :style="{ width: '12px', height: '12px', borderRadius: '2px', background: s.header, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }"></span>
                      <span style="flex:1;color:var(--text,#1a202c);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ s.name }}</span>
                      <span style="font-size:9px;color:var(--text-faint,#718096);">{{ s.banded ? '▥' : '▢' }}</span>
                    </div>
                  </div>
                </div>

                <div class="td-custom-panel">
                  <div class="td-field">
                    <div class="td-field-label">表头底色 <span style="font-weight:400;color:var(--text-faint,#718096);">Header</span></div>
                    <div class="td-color-row">
                      <input type="color" v-model="custom.header" />
                      <input type="text" v-model="custom.header" maxlength="7" />
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">表头文字 <span style="font-weight:400;color:var(--text-faint,#718096);">Header Text</span></div>
                    <div class="td-color-row">
                      <input type="color" v-model="custom.headerText" />
                      <input type="text" v-model="custom.headerText" maxlength="7" />
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">统一底色 <span style="font-weight:400;color:var(--text-faint,#718096);">Band</span></div>
                    <div class="td-color-row">
                      <input type="color" v-model="custom.band" />
                      <input type="text" v-model="custom.band" maxlength="7" />
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">偶数行底色 <span style="font-weight:400;color:var(--text-faint,#718096);">Zebra</span></div>
                    <div class="td-color-row">
                      <input type="color" v-model="custom.zebra" />
                      <input type="text" v-model="custom.zebra" maxlength="7" />
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">边框颜色 <span style="font-weight:400;color:var(--text-faint,#718096);">Border</span></div>
                    <div class="td-color-row">
                      <input type="color" v-model="custom.border" />
                      <input type="text" v-model="custom.border" maxlength="7" />
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">字体</div>
                    <div class="td-font-row">
                      <select v-model="custom.font">
                        <option v-for="f in fontList" :key="f" :value="f">{{ f }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="td-field">
                    <div class="td-field-label">正文字号 <span style="font-weight:400;color:var(--text-faint,#718096);">Size</span></div>
                    <div class="td-font-row">
                      <input type="number" v-model.number="custom.size" min="9" max="18" />
                    </div>
                  </div>
                </div>
                <div style="margin-top:14px;display:flex;justify-content:flex-end;align-items:center;gap:8px;font-size:11px;color:var(--text-faint,#718096);">
                  <span v-if="!editingId">📝 草稿状态,点「新增自定义」开始编辑</span>
                  <span v-else-if="isDirty">● 有未保存改动,记得点「保存」</span>
                  <span v-else>✓ 已保存到 localStorage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="td-footer">
          <span class="td-hint">💡 选择主题 → 调整右上导出选项 → 确定导出</span>
          <button class="td-btn" @click="doCancel" :disabled="busy">取消</button>
          <button class="td-btn td-btn-primary" @click="doConfirm" :disabled="busy">
            <span v-if="busy">导出中...</span>
            <span v-else>确定导出</span>
          </button>
        </div>

      </div>
    </div>
  `;

  /* ---------------- Vue 组件 ---------------- */
  const ThemeDialog = {
    template,
    setup() {
      const visible = ref(false);
      const tab = ref('preview');
      const keyword = ref('');
      const selectedId = ref('classic-blue');
      const customActive = ref(false);
      const busy = ref(false);
      const categoryFilter = ref('all'); // all | gradient | solid

      const fontList = [
        'Calibri', 'Arial', 'Cambria', 'Consolas', 'Georgia',
        'Microsoft YaHei', 'SimSun', 'SimHei', 'PingFang SC', 'Helvetica'
      ];

      // 正在编辑的自定义主题(只含配色)
      const custom = reactive({
        id: '',              // 用户主题 id(空表示草稿)
        name: '',
        icon: '⭐',
        header: '#2563EB',
        headerText: '#FFFFFF',
        band: '#EFF6FF',
        zebra: '#F8FAFC',
        border: '#93C5FD',
        font: 'Calibri',
        size: 11,
      });

      // ===== 导出参数(全局,与选中主题无关)=====
      const boldHeader = ref(true);
      const freezeHeader = ref(true);
      const rowMode = ref('zebra'); // 'zebra' | 'dark' | 'light' | 'white'

      // 初始化主题缓存(注入 rowMode)
      allThemesCache = buildAllThemes(rowMode.value);

      // rowMode 改变 → 重建主题对象(让 currentTheme.rowMode 同步)
      watch(rowMode, (v) => { allThemesCache = buildAllThemes(v); });

      const editingId = ref(null);     // 当前编辑的自定义主题 id,null = 草稿
      const showSavedList = ref(false); // 是否展开左侧"我的主题"列表
      const savedList = ref([]);        // localStorage 中的主题列表
      const saveToast = ref('');        // 操作提示
      const isDirty = ref(false);       // 是否有未保存的改动

      const previewRows = [
        ['001', '研发部', '张三', '¥ 12,800'],
        ['002', '研发部', '李四', '¥ 9,600'],
        ['003', '市场部', '王五', '¥ 15,400'],
        ['004', '市场部', '赵六', '¥ 8,200'],
        ['005', '人事部', '孙七', '¥ 7,500'],
      ];

      const customTheme = computed(() => ({
        id: custom.id || 'custom',
        name: custom.name || '自定义',
        icon: custom.icon || '⭐',
        category: 'user',
        rowMode: rowMode.value,
        header: custom.header,
        headerText: custom.headerText,
        band: custom.band,
        zebra: custom.zebra,
        border: custom.border,
        font: custom.font,
        size: custom.size,
      }));

      const allThemes = computed(() => {
        const list = allThemesCache.slice();
        if (customActive.value) list.unshift(customTheme.value);
        return list;
      });

      function reloadCustom() {
        allThemesCache = buildAllThemes(rowMode.value);
      }

      // currentTheme 依赖 rowMode:rowMode 变化时强制重新查找
      // (因为 buildAllThemes 重建了 allThemesCache,对象引用全换了,
      //  用 selectedId 找到的 currentTheme.rowMode 才会同步)
      const currentTheme = computed(() => {
        // 读 rowMode 建立依赖
        void rowMode.value;
        return allThemes.value.find(t => t.id === selectedId.value) || themes[0];
      });

      const filteredThemes = computed(() => {
        let list = allThemes.value;
        if (categoryFilter.value === 'user') {
          list = list.filter(t => t.category === 'user');
        } else if (categoryFilter.value === 'builtin') {
          list = list.filter(t => t.category !== 'user');
        }
        const k = keyword.value.trim().toLowerCase();
        if (!k) return list;
        return list.filter(t => t.name.toLowerCase().includes(k) || t.id.toLowerCase().includes(k));
      });

      const previewHeaderStyle = computed(() => {
        const t = currentTheme.value;
        return {
          background: t.header,
          color: t.headerText,
          border: '1px solid ' + t.border,
          fontFamily: t.font,
          fontWeight: boldHeader.value ? '700' : '500',
          fontSize: t.size + 'px',
        };
      });

      const previewCellStyle = computed(() => ({
        border: '1px solid ' + currentTheme.value.border,
        fontFamily: currentTheme.value.font,
        fontSize: currentTheme.value.size + 'px',
      }));

      function previewZebra(i) {
        // 复用 resolveRowFill 逻辑(直接把 rowMode.value 注入 t,确保最新值)
        const t = { ...currentTheme.value, rowMode: rowMode.value };
        const bandL = hexLuminance(t.band);
        const zebraL = hexLuminance(t.zebra);
        const mode = t.rowMode;
        let color;
        if (mode === 'dark')  color = bandL <= zebraL ? t.band : t.zebra;
        else if (mode === 'light') color = bandL >= zebraL ? t.band : t.zebra;
        else if (mode === 'white') color = '#FFFFFF';
        else color = (i % 2 === 0) ? t.zebra : t.band;
        return { background: color };
      }

      function selectTheme(t) {
        selectedId.value = t.id;
        tab.value = 'preview';
        // 选中内置主题时,不要自动重置 custom 编辑区(用户可能正在编辑)
      }

      function resetCustomValues() {
        // 把 custom 字段恢复成默认草稿
        custom.id = '';
        custom.name = '';
        custom.icon = '⭐';
        custom.header = '#2563EB';
        custom.headerText = '#FFFFFF';
        custom.band = '#EFF6FF';
        custom.zebra = '#F8FAFC';
        custom.border = '#93C5FD';
        custom.font = 'Calibri';
        custom.size = 11;
        editingId.value = null;
        isDirty.value = false;
      }

      // 把当前 custom 写入 localStorage(只由"新增自定义"和"保存"按钮触发)
      function writeCustomToStorage() {
        const name = (custom.name || '').trim();
        if (!name) return false;
        const arr = loadCustomThemes();
        const filtered = arr.filter((t) => t.id !== editingId.value);
        filtered.push({
          id: editingId.value,
          name,
          icon: '⭐',
          header: custom.header,
          headerText: custom.headerText,
          band: custom.band,
          zebra: custom.zebra,
          border: custom.border,
          font: custom.font,
          size: custom.size,
          category: 'user',
        });
        saveCustomThemes(filtered);
        reloadCustom();
        refreshSavedList();
        isDirty.value = false;
        return true;
      }

      // 手动"保存"按钮
      function manualSave() {
        if (!editingId.value) {
          saveToast.value = '请先点「新增自定义」开始保存';
          setTimeout(() => { saveToast.value = ''; }, 1800);
          return;
        }
        if (!(custom.name || '').trim()) {
          saveToast.value = '请先填写主题名';
          setTimeout(() => { saveToast.value = ''; }, 1800);
          return;
        }
        if (writeCustomToStorage()) {
          saveToast.value = '已保存';
          setTimeout(() => { saveToast.value = ''; }, 1500);
        }
      }

      // 监听 custom 任意字段:标记"有未保存改动"(不写 localStorage)
      watch(
        () => [
          custom.id, custom.name, custom.header, custom.headerText,
          custom.band, custom.zebra, custom.border, custom.font, custom.size,
        ],
        () => { isDirty.value = true; }
      );

      /* ---- 已保存主题管理 ---- */
      function refreshSavedList() {
        const arr = loadCustomThemes();
        savedList.value = arr.map((t) => ({
          baseId: t.id,
          name: t.name,
          header: t.header,
          banded: !!t.banded,
        }));
      }

      // "新增自定义":分配 id、设置默认名,但不写 localStorage(等用户点"保存")
      function newCustom() {
        if (editingId.value && isDirty.value && !confirm('当前有未保存的改动,继续会丢弃,确定吗?')) {
          return;
        }
        const ts = Date.now().toString(36);
        editingId.value = 'user-' + ts;
        custom.id = editingId.value;
        if (!custom.name.trim()) custom.name = '我的主题 ' + new Date().toLocaleString();
        isDirty.value = true;
        customActive.value = true;
        selectedId.value = 'custom';
        tab.value = 'custom';
        saveToast.value = '已分配主题名,点「保存」写入本地';
        setTimeout(() => { saveToast.value = ''; }, 2000);
      }

      // 从已保存列表里选中一个,载入到 custom 编辑区
      function loadSavedToCustom(baseId) {
        const arr = loadCustomThemes();
        const t = arr.find((x) => x.id === baseId);
        if (!t) return;
        custom.id = t.id;
        custom.name = t.name;
        custom.icon = t.icon || '⭐';
        custom.header = t.header;
        custom.headerText = t.headerText;
        custom.band = t.band;
        custom.zebra = t.zebra;
        custom.border = t.border;
        custom.font = t.font;
        custom.size = t.size;
        editingId.value = t.id;
        customActive.value = true;
        selectedId.value = 'custom';
        tab.value = 'custom';
        isDirty.value = false;
        saveToast.value = '已加载: ' + t.name;
        setTimeout(() => { saveToast.value = ''; }, 1500);
      }

      function deleteCurrentCustom() {
        if (!editingId.value) {
          // 草稿状态:仅清空表单
          resetCustomValues();
          saveToast.value = '已清空草稿';
          setTimeout(() => { saveToast.value = ''; }, 1500);
          return;
        }
        const arr = loadCustomThemes();
        const filtered = arr.filter((t) => t.id !== editingId.value);
        saveCustomThemes(filtered);
        reloadCustom();
        refreshSavedList();
        resetCustomValues();
        customActive.value = false;
        selectedId.value = 'classic-blue';
        tab.value = 'preview';
        saveToast.value = '已删除';
        setTimeout(() => { saveToast.value = ''; }, 1500);
      }

      refreshSavedList();

      /* 任务上下文(打开时设置,确定时使用) */
      let pendingTask = null; // { workbook, fileName, onDone, onError }

      async function doConfirm() {
        if (busy.value) return;
        if (!pendingTask || !pendingTask.workbook) {
          console.warn('[theme.js] 没有待导出任务');
          return;
        }
        busy.value = true;
        const base = currentTheme.value;
        const payload = {
          id: base.id,
          name: base.name,
          header: base.header,
          headerText: base.headerText,
          zebra: base.zebra,
          border: base.border,
          band: base.band,
          font: base.font,
          size: base.size,
          rowMode: rowMode.value,
          boldHeader: boldHeader.value,
          freezeHeader: freezeHeader.value,
        };
        console.log('[theme.js] doConfirm payload=', JSON.stringify(payload));
        try {
          await writeBufferAndDownload(pendingTask.workbook, pendingTask.fileName, payload);
          visible.value = false;
          if (typeof pendingTask.onDone === 'function') pendingTask.onDone(payload);
        } catch (err) {
          console.error(err);
          if (typeof pendingTask.onError === 'function') pendingTask.onError(err);
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

      /* ---------------- 暴露全局 API ---------------- */
      window.ExcelThemeDialog = {
        exportWorkbook(opts = {}) {
          if (!opts || !opts.workbook) {
            console.error('[theme.js] exportWorkbook: workbook 必填');
            return;
          }
          pendingTask = {
            workbook: opts.workbook,
            fileName: opts.fileName || 'workbook',
            onDone: opts.onDone || null,
            onError: opts.onError || null,
          };
          selectedId.value = opts.defaultTheme || 'classic-blue';
          keyword.value = '';
          tab.value = 'preview';
          customActive.value = false;
          categoryFilter.value = 'all';
          // 不要在这里 resetCustomValues:用户上次编辑的自定义主题应该保留,
          // 让他可以继续编辑;只有点了「清空草稿/删除」才清空。
          refreshSavedList();
          visible.value = true;
        },
        close() {
          if (busy.value) return;
          visible.value = false;
          pendingTask = null;
        },
      };

      // ESC 关闭
      function onKey(e) {
        if (e.key === 'Escape' && visible.value) doCancel();
      }
      window.addEventListener('keydown', onKey);

      return {
        visible, tab, keyword, selectedId, busy, categoryFilter,
        editingId, isDirty,
        boldHeader, freezeHeader, rowMode,
        fontList, custom, savedList, showSavedList, saveToast,
        previewRows, filteredThemes, currentTheme,
        previewHeaderStyle, previewCellStyle,
        previewZebra, selectTheme,
        newCustom, loadSavedToCustom, deleteCurrentCustom, manualSave,
        doConfirm, doCancel,
      };
    },
  };

  /* ---------------- 挂载 ---------------- */
  function mount() {
    try {
      let host = document.getElementById('theme-dialog');
      if (!host) {
        host = Object.assign(document.createElement('div'), { id: 'theme-dialog' });
        document.body.appendChild(host);
      }
      // 单独作用域 style 注入到 head,避免 template 里 <style> 被 Vue 处理
      if (!document.getElementById('theme-dialog-style')) {
        document.head.appendChild(Object.assign(document.createElement('style'), { 
          id: 'theme-dialog-style',
          textContent: style,
        }));
      }
      createApp(ThemeDialog).mount(host);
    } catch (err) {
      console.error('[theme.js] 挂载失败:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();