/* PDF 工作台 · 任务式交互外壳 */
(function () {
  const { createApp, ref, computed, watch, onMounted, onUnmounted } = Vue;
  const C = window.PdfCore;
  const PDFLib = window.PDFLib;
  const degrees = PDFLib.degrees || (v => v);
  const uid = () => Math.random().toString(36).slice(2, 10);

  // 参数定义：每个工具对应一个设置面板
  // 参数定义：对齐 PaperKnife React 原版各工具的可调参数
  const PASSWORD = { key:'unlockPassword', label:'当前密码（若文件已加密）', type:'password', def:'', placeholder:'留空表示未加密' };
  const PARAMS = {
    merge: [],
    split: [ { key:'splitMode', label:'拆分模式', type:'select', def:'single', options:[{value:'single',label:'单个文档（所选页合并为一个 PDF）'},{value:'individual',label:'多个文件（每页单独 PDF，打包 ZIP）'}] },
             { key:'pages', label:'页码范围（例：1, 3-5, odd, even）', type:'text', def:'', placeholder:'1, 3-5, odd' }, PASSWORD ],
    'add-blank': [ { key:'position', label:'插入位置', type:'select', def:'end', options:[{value:'start',label:'文档开头'},{value:'end',label:'文档结尾'},{value:'after',label:'指定页之后'}] },
                   { key:'afterPage', label:'指定页（插入到该页之后）', type:'number', def:1, min:1, max:9999, showIf:{key:'position',value:'after'} },
                   { key:'count', label:'插入页数', type:'number', def:1, min:1, max:1000 },
                   { key:'sizeSource', label:'空白页尺寸', type:'select', def:'document', options:[{value:'document',label:'跟随文档首页'},{value:'a4',label:'A4'},{value:'letter',label:'Letter'}] }, PASSWORD ],
    'delete-pages': [ { key:'pages', label:'删除页码范围（例：2, 4-6, even）', type:'text', def:'', placeholder:'2, 4-6, even' }, PASSWORD ],
    compress: [ { key:'targetDpi', label:'目标清晰度（DPI）', type:'numberRange', def:130, min:50, max:300, step:10, unit:'DPI', hint:'按页面物理尺寸决定图片像素：A4 约 96 DPI 等于 WPS 100% 屏幕显示，200 DPI 约等于原始扫描。只缩小超过目标的图片，不放大。' },
                { key:'jpegQ', label:'JPEG 质量（%）', type:'range', def:80, min:1, max:100, unit:'%' },
                { key:'rasterizeAll', label:'强制栅格化所有页面', type:'check', def:false },
                { key:'jpegEncoder', label:'JPEG 编码器', type:'select', def:'jsquash', options:[{value:'auto',label:'自动'},{value:'canvas',label:'Canvas'},{value:'jsquash',label:'jSquash'}] },
                { key:'pngEncoder', label:'PNG 编码器', type:'select', def:'auto', options:[{value:'auto',label:'自动'},{value:'upng',label:'UPNG.js'}] },
                PASSWORD ],
    protect: [ { key:'password', label:'新密码', type:'password', def:'', placeholder:'••••••••' },
               { key:'confirmPassword', label:'确认新密码', type:'password', def:'', placeholder:'••••••••' },
               PASSWORD ],
    unlock: [ { key:'password', label:'当前密码', type:'password', def:'', placeholder:'••••••••' } ],
    rotate: [ { key:'angle', label:'顺时针旋转角度', type:'select', def:'90', options:[{value:'90',label:'90°'},{value:'180',label:'180°'},{value:'270',label:'270°'}] }, PASSWORD ],
    rearrange: [ { key:'order', label:'页面顺序（例：3,1,2 局部重排；留空按原序）', type:'text', def:'', placeholder:'3,1,2' }, PASSWORD ],
    'page-numbers': [ { key:'format', label:'页码格式（{n} 当前页，{total} 总页数）', type:'text', def:'Page {n} of {total}', placeholder:'Page {n} of {total}' },
                      { key:'position', label:'位置', type:'select', def:'bottom-center', options:[{value:'top-left',label:'左上'},{value:'top-center',label:'上中'},{value:'top-right',label:'右上'},{value:'bottom-left',label:'左下'},{value:'bottom-center',label:'下中'},{value:'bottom-right',label:'右下'}] },
                      PASSWORD ],
    watermark: [ { key:'text', label:'水印文字', type:'text', def:'水印文字', placeholder:'水印文字' },
                 { key:'color', label:'颜色', type:'color', def:'#808080' },
                 { key:'opacity', label:'不透明度', type:'numberRange', def:0.2, min:0.1, max:1, step:0.1, unit:'' },
                 { key:'fontSize', label:'字号', type:'numberRange', def:18, min:10, max:200, step:1, unit:'px' },
                 { key:'rotation', label:'旋转角度', type:'numberRange', def:-45, min:-180, max:180, step:5, unit:'°' },
                 { key:'repeat', label:'页面重复平铺', type:'check', def:true },
                 { key:'spacing', label:'重复间距（按字号倍数）', type:'numberRange', def:10, min:0.5, max:20, step:0.5, unit:'×' },
                 PASSWORD ],
    metadata: [ { key:'title', label:'标题', type:'text', def:'' }, { key:'author', label:'作者', type:'text', def:'' },
                { key:'subject', label:'主题', type:'text', def:'' }, { key:'keywords', label:'关键词', type:'text', def:'' },
                { key:'creator', label:'创建者', type:'text', def:'' }, { key:'producer', label:'生成者', type:'text', def:'' },
                PASSWORD ],
    signature: [ { key:'text', label:'签名文字（图片签名请在 React 原版绘制后导入）', type:'text', def:'已签名' }, PASSWORD ],
    grayscale: [ PASSWORD ],
    'pdf-to-image': [ { key:'dpi', label:'质量（DPI 50-500）', type:'select', def:'150', options:[{value:'72',label:'72 · 草稿'},{value:'150',label:'150 · 标准'},{value:'300',label:'300 · 打印'},{value:'custom',label:'自定义'}] },
                      { key:'dpiCustom', label:'自定义 DPI', type:'numberRange', def:150, min:50, max:500, step:1, unit:'DPI', showIf:{key:'dpi',value:'custom'} },
                      { key:'outputWidth', label:'固定输出宽度（像素，0=按 DPI 自动）', type:'number', def:0, min:0, max:10000, step:1, hint:'0 表示按 DPI 自动；填写数值则在该 DPI 渲染后等比例缩放到指定宽度，可能放大。' },
                      { key:'format', label:'图片格式', type:'select', def:'jpg', options:[{value:'jpg',label:'JPG'},{value:'png',label:'PNG'}] },
                      { key:'jpgQuality', label:'JPG 质量（%）', type:'range', def:80, min:1, max:100, unit:'%', showIf:{key:'format',value:'jpg'} },
                      { key:'useJsquash', label:'使用 jSquash 编码 JPG', type:'check', def:true, hint:'使用 jSquash 编码 JPG（体积更小）', showIf:{key:'format',value:'jpg'} },
                      { key:'useUpng', label:'UPNG.js 压缩（无损，体积更小）', type:'check', def:true, hint:'使用 UPNG.js 压缩（无损，体积更小）', showIf:{key:'format',value:'png'} },
                      { key:'outputMode', label:'输出方式', type:'select', def:'zip', options:[{value:'zip',label:'单个 ZIP'},{value:'separate',label:'多个文件'}] },
                      PASSWORD ],
    'image-to-pdf': [],
    'extract-images': [ { key:'format', label:'图片格式', type:'select', def:'png', options:[{value:'png',label:'PNG'},{value:'jpg',label:'JPG'}] },
                        { key:'jpgQuality', label:'JPG 质量（%）', type:'range', def:80, min:1, max:100, unit:'%', showIf:{key:'format',value:'jpg'} },
                        { key:'useJsquash', label:'使用 jSquash 编码 JPG', type:'check', def:true, hint:'使用 jSquash 编码 JPG（体积更小）', showIf:{key:'format',value:'jpg'} },
                        { key:'useUpng', label:'UPNG.js 压缩（无损，体积更小）', type:'check', def:true, hint:'使用 UPNG.js 压缩（无损，体积更小）', showIf:{key:'format',value:'png'} },
                        { key:'maxWidth', label:'最大宽度（像素，0 表示不限制）', type:'number', def:0, min:0, max:10000, step:1 },
                        { key:'outputMode', label:'输出方式', type:'select', def:'zip', options:[{value:'zip',label:'单个 ZIP'},{value:'separate',label:'多个文件'}] },
                        PASSWORD ],
    'pdf-to-text': [ { key:'extractionMode', label:'提取模式', type:'select', def:'text', options:[{value:'text',label:'文本提取'},{value:'ocr',label:'深度 OCR（占用较多 CPU）'}] }, PASSWORD ],
    repair: [ PASSWORD ],
  };
  // 工具支持的文件类型：pdf 工具需 PDF，图片工具需图片
  function accepts(t) {
    if (t.name === 'image-to-pdf') return ['PNG','JPG','JPEG','GIF','WEBP','BMP'];
    return ['PDF'];
  }

  const App = {
    setup() {
      const dark = ref(document.documentElement.classList.contains('dark'));
      const files = ref([]);
      const selected = ref(new Set());
      const keyword = ref(''); const category = ref('all'); const sortKey = ref('manual'); const dragOver = ref(false); const dragFileId = ref(''); const manualOrder = ref('');
      const tasks = ref([]);
      const dialog = ref({ show:false, type:'', title:'', params:[], form:{}, payload:{files:[]}, error:'', outputs:[], wide:false });
      const dialogStack = ref([]);
      const watermarkPreview = ref({ url:'', loading:false, error:'', seq:0, bytes:[] });
      const sorts = [ {key:'manual',label:'手动'}, {key:'name',label:'名称'}, {key:'size',label:'大小'}, {key:'time',label:'修改时间'} ];
      const fileInput = ref(null);

      const visibleFiles = computed(() => {
        let list = files.value.filter(f => (category.value==='all' || f.kind===category.value) && f.name.toLowerCase().includes(keyword.value.toLowerCase()));
        if (sortKey.value !== 'manual') {
          list = [...list].sort((a,b) => sortKey.value==='size' ? b.size-a.size : sortKey.value==='time' ? b.time-a.time : a.name.localeCompare(b.name));
        }
        return list;
      });
      const selectedFiles = computed(() => files.value.filter(f => selected.value.has(f.id)));
      const runnable = computed(() => tasks.value.filter(t => t.status==='queued' || t.status==='error'));
      const runningCount = computed(() => tasks.value.filter(t => t.status==='running').length);
      const statsText = computed(() => `${files.value.length} 文件 · ${tasks.value.length} 任务`);
      const badgeClass = computed(() => runningCount.value ? 'busy' : '');
      const toolOf = t => C.TOOLS.find(x => x.name === t.tool) || {icon:'⚙️',title:t.tool};
      function paramVisible(p) { return !p.showIf || dialog.value.form[p.showIf.key] === p.showIf.value; }
      function clampParam(p, value) {
        let n = Number(value);
        if (!Number.isFinite(n)) n = Number(p.def ?? p.min ?? 0);
        if (p.min !== undefined) n = Math.max(Number(p.min), n);
        if (p.max !== undefined) n = Math.min(Number(p.max), n);
        const step = Number(p.step || 1);
        if (Number.isFinite(step) && step > 0) {
          const base = Number(p.min ?? 0);
          n = base + Math.round((n - base) / step) * step;
          const decimals = (String(step).split('.')[1] || '').length;
          if (decimals) n = Number(n.toFixed(decimals));
        }
        return n;
      }
      function setParam(p, value) {
        const raw = String(value ?? '').trim();
        if (raw === '' || !Number.isFinite(Number(raw))) return;
        dialog.value.form[p.key] = Number(raw);
      }
      function commitParam(p, value, input) {
        const raw = String(value ?? '').trim();
        const next = clampParam(p, raw === '' || !Number.isFinite(Number(raw)) ? Number(p.def ?? p.min ?? 0) : Number(raw));
        dialog.value.form[p.key] = next;
        if (input && String(input.value) !== String(next)) input.value = next;
      }
      watch(() => dialog.value.form && dialog.value.form.format, () => {
        const upng = dialog.value.params.find(x => x.key === 'useUpng');
        if (upng && !paramVisible(upng)) dialog.value.form[upng.key] = upng.def;
        const jsquash = dialog.value.params.find(x => x.key === 'useJsquash');
        if (jsquash && !paramVisible(jsquash)) dialog.value.form[jsquash.key] = jsquash.def;
      });

      const WM_PREVIEW_KEYS = ['text','color','opacity','fontSize','rotation','repeat','spacing'];
      function watchWatermarkPreview() {
        watch(() => {
          const d = dialog.value;
          if (!d.show || d.type !== 'params' || d.payload.tool !== 'watermark') return null;
          return WM_PREVIEW_KEYS.map(k => d.form[k]).join('\u0001');
        }, () => refreshWatermarkPreview(), { immediate:true });
      }
      function hexRgb(c) {
        const m = /^#?([0-9a-f]{6})$/i.exec(c||'');
        if (!m) return [0,0,0];
        const n = parseInt(m[1],16);
        return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];
      }
      // pdf-lib text matrices are PDF-space (Y up). Canvas preview is Y down,
      // so the same page-space rotation must use the opposite sign there.
      function watermarkTextMatrix(font, text, size, rotation) {
        const rad = (-rotation * Math.PI) / 180;
        const cap = font.heightAtSize(size) * 0.35;
        const tw = font.widthOfTextAtSize(text, size);
        return {
          x: -(tw / 2) * Math.cos(rad) + cap * Math.sin(rad),
          y: -(tw / 2) * Math.sin(rad) - cap * Math.cos(rad),
          rotate: degrees(-rotation)
        };
      }
      function watermarkDrawList(p, width, height) {
        const size = Number(p.fontSize??18);
        const step = size * Number(p.spacing??10);
        const rows = p.repeat ? Math.max(1,Math.ceil(height/step)) : 1;
        const cols = p.repeat ? Math.max(1,Math.ceil(width/step)) : 1;
        const out = [];
        for (let row=0; row<rows; row++) for (let col=0; col<cols; col++) {
          out.push({ text:p.text||'水印文字', x:col*step, y:height-(row+1)*step, size,
                     rotate:Number(p.rotation??-45), opacity:Number(p.opacity??0.2), color:hexRgb(p.color) });
        }
        return out;
      }
      let watermarkCanvas = null;
      function getWatermarkCanvas() {
        if (watermarkCanvas) return watermarkCanvas;
        const c = document.createElement('canvas');
        const w = 595, h = 842;
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0,0,w,h);
        g.fillStyle = '#4b5563'; g.font = '14px "Noto Sans CJK SC","Microsoft YaHei",sans-serif';
        const text = '你好'.repeat(40);
        const maxWidth = w - 112;
        const lines = [];
        let current = '';
        for (const ch of text) {
          if (g.measureText(current + ch).width > maxWidth) { lines.push(current); current = ch; }
          else current += ch;
        }
        if (current) lines.push(current);
        let y = 80;
        for (let i = 0; i < 5; i++) {
          for (const l of lines) { g.fillText(l, 56, y); y += 28; }
          y += 44;
        }
        watermarkCanvas = c;
        return c;
      }
      function refreshWatermarkPreview() {
        const d = dialog.value;
        if (!d.show || d.type !== 'params' || d.payload.tool !== 'watermark') return;
        const seq = ++watermarkPreview.value.seq;
        watermarkPreview.value.error = '';
        try {
          const base = getWatermarkCanvas();
          const canvas = document.createElement('canvas');
          canvas.width = base.width; canvas.height = base.height;
          const g = canvas.getContext('2d');
          g.drawImage(base, 0, 0);
          for (const w of watermarkDrawList(d.form, canvas.width, canvas.height)) {
            const [r,gg,b] = w.color.map(v => Math.round(v*255));
            g.save();
            g.globalAlpha = w.opacity;
            g.fillStyle = `rgb(${r},${gg},${b})`;
            g.font = `${w.size}px "Noto Sans CJK SC","Microsoft YaHei",sans-serif`;
            g.textBaseline = 'alphabetic';
            g.translate(w.x, canvas.height - w.y);
            g.rotate(w.rotate * Math.PI / 180);
            g.fillText(w.text, 0, 0);
            g.restore();
          }
          canvas.toBlob(blob => {
            if (seq !== watermarkPreview.value.seq || dialog.value !== d) return;
            if (watermarkPreview.value.url) URL.revokeObjectURL(watermarkPreview.value.url);
            watermarkPreview.value.url = URL.createObjectURL(blob);
            watermarkPreview.value.loading = false;
          }, 'image/png');
          watermarkPreview.value.loading = true;
        } catch (e) {
          watermarkPreview.value.loading = false;
          watermarkPreview.value.error = '预览生成失败：' + C.errMsg(e);
        }
      }

      function fmtSize(n) { if (!n) return '0 B'; const u=['B','KB','MB','GB']; let i=0; while(n>=1024 && i<3){n/=1024;i++;} return n.toFixed(i?1:0)+' '+u[i]; }
      function fmtTime(ts) { try { return new Date(ts).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); } catch(e){ return ''; } }
      function extLabel(name) { const e=(name.split('.').pop()||'').toLowerCase(); return e.toUpperCase().slice(0,4)||'FILE'; }
      function extClass(name) { const e=extLabel(name); return e==='PDF'?'pdf':['PNG','JPG','JPEG','GIF','WEBP','BMP'].includes(e)?'img':'other'; }
      function kindOf(name) { const e=extLabel(name); return e==='PDF'?'pdf':['PNG','JPG','JPEG','GIF','WEBP','BMP'].includes(e)?'image':['TXT','MD','CSV','JSON'].includes(e)?'text':'other'; }
      function statusText(s) { return {queued:'待运行',running:'运行中',done:'完成',error:'失败'}[s]||s; }

      function kindOfFile(f) {
        if (!f) return 'other';
        const mime = String(f.type || '').toLowerCase();
        const ext = (String(f.name || '').split('.').pop() || '').toLowerCase();
        if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
        if (mime.startsWith('image/') || ['png','jpg','jpeg','gif','webp','bmp'].includes(ext)) return 'image';
        return 'other';
      }
      function addFiles(list) {
        let added = 0;
        let skipped = 0;
        for (const f of list) {
          const kind = kindOfFile(f);
          if (kind === 'other') { skipped++; continue; }
          if (files.value.some(x => x.name===f.name && x.size===f.size)) continue;
          const file = { id:uid(), name:f.name, size:f.size, time:f.lastModified||Date.now(), kind, bytes:null };
          files.value.push(file); added++;
          C.readFile(f)
            .then(async bytes => {
              file.bytes = Array.from(bytes);
              const pageCount = kind === 'pdf' ? await C.getPageCount(bytes) : null;
              if (pageCount) file.pages = pageCount;
            })
            .catch(() => { C.toast('读取失败：'+f.name); });
        }
        if (added) C.toast(`已添加 ${added} 个文件`);
        if (skipped) C.toast(`已跳过 ${skipped} 个不支持的文件，仅支持 PDF 和图片`);
      }
      function pickFiles() {
        const i = document.createElement('input');
        i.type='file'; i.multiple=true;
        i.accept='.pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,application/pdf,image/*';
        i.onchange=()=>i.files&&i.files.length&&addFiles(Array.from(i.files));
        i.click();
      }
      function openHttpLoad() {
        openOverlay({show:true,type:'http',title:'🌐 从 HTTP 加载 PDF（二进制）',params:[],form:{url:''},payload:{files:[]},error:'',outputs:[],wide:false});
      }
      async function loadHttpPdf() {
        const d=dialog.value; d.error='';
        try {
          const url=d.form.url||'';
          const bytes=await C.readHttpPdf(url);
          let name='remote.pdf';
          try { const u=new URL(url, location.href); name=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'remote.pdf'); } catch (e) {}
          if (!/\.pdf$/i.test(name)) name += '.pdf';
          if (files.value.some(x=>x.name===name && x.size===bytes.length)) { closeDialog(); C.toast('该文件已在列表中：'+name); return; }
          const file={id:uid(),name,size:bytes.length,time:Date.now(),kind:'pdf',bytes:Array.from(bytes)};
          files.value.push(file);
          const pages=await C.getPageCount(bytes); if (pages) file.pages=pages;
          closeDialog(); C.toast(`已加载 ${name} · ${pages||'?'} 页`);
        } catch(e) { d.error=C.errMsg(e); }
      }
      function onDrop(e) { dragOver.value=false; const fs = Array.from(e.dataTransfer.files||[]); if (fs.length) addFiles(fs); }
      function onPaste(e) { const fs = Array.from(e.clipboardData&&e.clipboardData.files||[]); if (fs.length) { e.preventDefault(); addFiles(fs); } }
      function removeFile(id) { files.value = files.value.filter(f=>f.id!==id); selected.value.delete(id); }
      function clearFiles() { files.value=[]; selected.value.clear(); C.toast('文件列表已清空'); }
      function toggleSelect(id) { const s=new Set(selected.value); s.has(id)?s.delete(id):s.add(id); selected.value=s; }
      function setFileOrder(orderedIds) {
        const rank = new Map(orderedIds.map((id, i) => [id, i]));
        files.value = [...files.value].sort((a,b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
      }
      let armedDrag = null;
      const ROW_DRAG_TYPE = 'application/x-pdf-tool-file-row';
      function clearDragHints() {
        document.querySelectorAll('.file-row.drag-target').forEach(el => el.classList.remove('drag-target'));
      }
      function isRowDrag(e) {
        const types = Array.from(e.dataTransfer && e.dataTransfer.types || []);
        return types.includes(ROW_DRAG_TYPE) || !!dragFileId.value;
      }
      function onFileDragArm(e, id) {
        if (e.button !== 0) return;
        armedDrag = { id, x: e.clientX, y: e.clientY };
      }
      function onFileDragStart(e, id) {
        const armed = armedDrag && armedDrag.id === id;
        armedDrag = null;
        if (!armed) { e.preventDefault(); return; }
        dragFileId.value = id;
        sortKey.value = 'manual';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(ROW_DRAG_TYPE, id);
      }
      function onFileDragOver(e) {
        if (!isRowDrag(e)) return;
        const target = e.currentTarget.closest('.file-row');
        if (!target || dragFileId.value === target.dataset.fileId) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        clearDragHints();
        target.classList.add('drag-target');
      }
      function onFileDragLeave(e) {
        const target = e.currentTarget.closest('.file-row');
        if (!target) return;
        const next = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.file-row') : null;
        if (next !== target) target.classList.remove('drag-target');
      }
      function onFileDrop(e, id) {
        if (!isRowDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        clearDragHints();
        const fromId = dragFileId.value || e.dataTransfer.getData(ROW_DRAG_TYPE);
        dragFileId.value = '';
        armedDrag = null;
        if (!fromId || fromId === id) return;
        const next = visibleFiles.value.map(f => f.id);
        const from = next.indexOf(fromId);
        if (from < 0 || !next.includes(id)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const insertAfter = e.clientY > rect.top + rect.height / 2;
        next.splice(from, 1);
        const targetIndex = next.indexOf(id);
        next.splice(targetIndex + (insertAfter ? 1 : 0), 0, fromId);
        setFileOrder(next);
      }
      function onFileDragEnd() {
        dragFileId.value = '';
        armedDrag = null;
        clearDragHints();
      }
      function moveFileByOrder() {
        const target = Number(manualOrder.value);
        if (!Number.isInteger(target) || target < 1 || target > visibleFiles.value.length) { C.toast(`请输入 1 到 ${visibleFiles.value.length} 之间的序号`); return; }
        if (!selected.value.size) { C.toast('请先选择要移动的文件'); return; }
        const next = visibleFiles.value.map(f => f.id);
        const moving = new Set(next.filter(id => selected.value.has(id)));
        if (!moving.size) { C.toast('选中的文件不在当前列表里'); return; }
        const rest = next.filter(id => !moving.has(id));
        const to = Math.min(target - 1, rest.length);
        rest.splice(to, 0, ...next.filter(id => moving.has(id)));
        setFileOrder(rest);
        manualOrder.value = '';
        C.toast(`已移动到第 ${to + 1} 位`);
      }
      function toggleSelectAll() { const ids=visibleFiles.value.map(f=>f.id); selected.value = selected.value.size===ids.length ? new Set() : new Set(ids); }
      function resetFilters() { keyword.value=''; category.value='all'; }

      function canUse(t) { if (!selectedFiles.value.length) return false; const allowed = accepts(t); return selectedFiles.value.some(f => allowed.includes(extLabel(f.name))); }
      function orderedFiles(fs) {
        const index = new Map(visibleFiles.value.map((f, i) => [f.id, i]));
        return [...fs].sort((a, b) => (index.get(a.id) ?? Infinity) - (index.get(b.id) ?? Infinity));
      }
      function openTool(t) {
        const fs = orderedFiles(selectedFiles.value.filter(f => accepts(t).includes(extLabel(f.name))));
        const defs = PARAMS[t.name] || [];
        const form = {}; defs.forEach(p => form[p.key]=p.def);
        openOverlay({ show:true, type:'params', title:t.icon+' '+t.title, params:defs, form, payload:{tool:t.name,files:fs}, error:'', outputs:[], wide:false, ...(t.name==='watermark'?{wide:true}:{}) });
        if (t.name==='watermark') refreshWatermarkPreview();
      }
      function editTask(task) {
        const t = toolOf(task); const defs = PARAMS[task.tool]||[];
        const form = {...task.params}; defs.forEach(p => { if (form[p.key]===undefined) form[p.key]=p.def; });
        fsForTask(task).then(fs => {
          const ordered = orderedFiles(fs);
          openOverlay({show:true,type:'params',title:'✎ 编辑任务 · '+t.title,params:defs,form,payload:{tool:task.tool,files:ordered,editId:task.id},error:'',outputs:[],wide:task.tool==='watermark'});
          if (task.tool==='watermark') refreshWatermarkPreview();
        });
      }
      async function fsForTask(task) {
        const out=[];
        for (const name of task.fileNames) { const f=files.value.find(x=>x.name===name); if (f) out.push(f); }
        return out;
      }
      function openOverlay(next) {
        if (dialog.value.show) dialogStack.value.push(dialog.value);
        dialog.value = next;
      }
      function closeDialog() {
        const previous = dialogStack.value.pop();
        if (previous) { dialog.value = previous; return; }
        dialog.value.show=false;
        watermarkPreview.value.seq++;
        if (watermarkPreview.value.url) { URL.revokeObjectURL(watermarkPreview.value.url); watermarkPreview.value.url=''; }
      }
      function confirmParams() {
        const d=dialog.value;
        if (!d.payload.files.length) { d.error='请先选择文件'; return; }
        if (d.payload.tool==='protect') {
          if (!d.form.password) { d.error='请输入新密码'; return; }
          if (d.form.password!==d.form.confirmPassword) { d.error='两次输入的密码不一致'; return; }
        }
        const task = { id: d.payload.editId||uid(), tool:d.payload.tool, params:{...d.form}, fileNames:d.payload.files.map(f=>f.name), status:'queued', progress:0, error:'', outputs:[], time:new Date().toLocaleString('zh-CN'), _files:d.payload.files.map(f=>({name:f.name,bytes:new Uint8Array(f.bytes)})) };
        if (d.payload.editId) { const i=tasks.value.findIndex(t=>t.id===d.payload.editId); if (i>=0) tasks.value.splice(i,1,task); }
        else tasks.value.push(task);
        closeDialog(); C.toast(d.payload.editId?'任务已更新':'任务已添加到右侧');
      }
      function removeTask(id) { tasks.value=tasks.value.filter(t=>t.id!==id); }
      function startTask(t) { if (t.status==='running') return; runTask(t, snapshotFiles(t)); }
      function startAll() { runnable.value.slice().forEach(t => runTask(t, snapshotFiles(t))); }
      function snapshotFiles(task) {
        const fs = task._files || []; task._files=null;
        return fs.length ? fs : task.fileNames.map(name => files.value.find(f=>f.name===name)).filter(Boolean).map(f=>f.bytes && f.bytes.length ? {name:f.name,bytes:new Uint8Array(f.bytes)} : null);
      }

      async function runTask(task, fsOverride) {
        task.status='running'; task.progress=5; task.error=''; task.outputs=[];
        try {
          const fs = fsOverride || await taskFiles(task);
          const results = [];
          const multi = fs.length>1 && task.tool!=='merge' && task.tool!=='image-to-pdf';
          const groups = multi ? fs.map(f=>({ files:[f], label:true })) : (fs.length ? [{files:fs,label:false}] : []);
          for (let g=0; g<groups.length; g++) {
            const group = groups[g];
            const base = g/groups.length, span = 1/groups.length;
            const res = await execute(task.tool, group.files, task.params, p => task.progress=Math.round(base*100 + p*span));
            // 多文件任务逐个处理时，用各自源文件名生成输出名，避免源文件名不同却共用第一个文件名
            res.forEach((o, oi) => results.push(group.label ? renamed(o, group.files[0], `-${oi+1}`, res.length) : o));
          }
          task.outputs = results; task.progress=100; task.status='done'; C.toast(`完成：${toolOf(task).title}`);
        } catch(e) { task.status='error'; task.error=C.errMsg(e); }
      }
      async function taskFiles(task) {
        const out=[];
        for (const name of task.fileNames) {
          let f=files.value.find(x=>x.name===name);
          if (!f) throw new Error('文件「'+name+'」已不在文件列表中，请重新添加');
          if (!f.bytes || !f.bytes.length) throw new Error('文件「'+name+'」数据已失效，请重新添加');
          out.push({name:f.name,bytes:new Uint8Array(f.bytes)});
        }
        return out;
      }
      async function execute(tool, fs, p, tick) {
        const bytes0=fs[0].bytes; const pwd=p.unlockPassword||undefined;
        const load = (bytes) => PDFLib.PDFDocument.load(bytes, pwd ? { password:pwd, ignoreEncryption:true } : { throwOnInvalidObject:false });
        const toolTitles = { merge:'合并', split:'拆分', rotate:'旋转', rearrange:'重排', 'add-blank':'插入空白页', 'delete-pages':'删除页面', protect:'加密', unlock:'解密', metadata:'元数据', 'page-numbers':'页码', watermark:'水印', signature:'签名', grayscale:'灰度', 'pdf-to-image':'转图片', 'image-to-pdf':'转PDF', 'extract-images':'提取图片', 'pdf-to-text':'转文字', compress:'压缩', repair:'修复' };
        const baseName = (f) => f.name.replace(/\.[^.]+$/, '') || f.name;
        const saveName = (ext, f=fs[0]) => tool==='merge' ? `合并.${ext}` : `${baseName(f)}_${toolTitles[tool]||tool}.${ext}`;
        const renamed = (o, f, suffix, total) => {
          if (!f) return o;
          const ext = o.name.split('.').pop();
          const base = saveName(ext, f).replace(new RegExp('\\.' + ext + '$'), '');
          const seq = (total > 1 && suffix) ? suffix : '';
          return { ...o, name: `${base}${seq}.${ext}` };
        };
        tick(20);
        if (tool==='merge') {
          if (fs.length<2) throw new Error('合并至少需要 2 个 PDF');
          const out=await PDFLib.PDFDocument.create();
          for (let i=0;i<fs.length;i++) { const doc=await load(fs[i].bytes); const pages=await out.copyPages(doc, doc.getPageIndices()); pages.forEach(pg=>out.addPage(pg)); tick(20+Math.round(70*(i+1)/fs.length)); }
          return [{name:saveName('pdf'),bytes:await out.save()}];
        }
        if (tool==='split') {
          const doc=await load(bytes0); const all=doc.getPageIndices();
          const idx = p.pages ? C.parseRange(p.pages, all.length).map(x=>x-1) : all;
          if (!idx.length) throw new Error('没有匹配的页码');
          if (p.splitMode==='individual') { const zip=new JSZip(); for (const i of idx) { const o=await PDFLib.PDFDocument.create(); o.addPage((await o.copyPages(doc,[i]))[0]); zip.file(`page-${i+1}.pdf`, await o.save()); tick(30+Math.round(60*(idx.indexOf(i)+1)/idx.length)); } return [{name:saveName('zip'),bytes:await zip.generateAsync({type:'uint8array'})}]; }
          const out=await PDFLib.PDFDocument.create(); (await out.copyPages(doc, idx)).forEach(pg=>out.addPage(pg)); tick(90); return [{name:saveName('pdf'),bytes:await out.save()}];
        }
        if (tool==='add-blank') {
          const doc=await load(bytes0); const n=doc.getPageCount(); let size;
          const sizeMap={ a4:[595.28,841.89], letter:[612,792] };
          if (p.sizeSource==='a4' || p.sizeSource==='letter') size=sizeMap[p.sizeSource];
          else { const first=doc.getPage(0); const s=first.getSize(); size=[s.width,s.height]; }
          const count=Math.max(1, Math.min(1000, Number(p.count)||1));
          let at=0;
          if (p.position==='end') at=n;
          else if (p.position==='after') { const target=Math.floor(Number(p.afterPage)||1); if (target<1 || target>n) throw new Error('指定页需在 1 到 '+n+' 之间'); at=target; }
          const final=await PDFLib.PDFDocument.create();
          const copied=await final.copyPages(doc, doc.getPageIndices());
          const addBlanks=()=>{ for (let i=0;i<count;i++) final.addPage(size); };
          for (let i=0;i<n;i++) {
            if (i===at) addBlanks();
            final.addPage(copied[i]);
          }
          if (at===n) addBlanks();
          tick(90); return [{name:saveName('pdf'),bytes:await final.save()}];
        }
        if (tool==='delete-pages') {
          const doc=await load(bytes0); const n=doc.getPageCount();
          if (!String(p.pages||'').trim()) throw new Error('请输入要删除的页码范围');
          const del=C.parseRange(p.pages, n);
          if (!del.length) throw new Error('没有匹配的页码');
          const keep=Array.from({length:n},(_,i)=>i).filter(i=>!del.includes(i+1));
          if (!keep.length) throw new Error('不能删除所有页面');
          const out=await PDFLib.PDFDocument.create(); (await out.copyPages(doc, keep)).forEach(pg=>out.addPage(pg));
          tick(90); return [{name:saveName('pdf'),bytes:await out.save()}];
        }
        if (tool==='rotate') {
          const doc=await load(bytes0); doc.getPages().forEach(pg=>pg.setRotation(PDFLib.degrees((pg.getRotation().angle + Number(p.angle||90))%360))); tick(70); return [{name:saveName('pdf'),bytes:await doc.save()}]
        }
        if (tool==='rearrange') {
          const doc=await load(bytes0); const n=doc.getPageCount();
          const order = p.order ? (C.parsePartialOrder(p.order, n) || C.parseOrder(p.order, n)) : doc.getPageIndices();
          const src=await load(bytes0); const out=await PDFLib.PDFDocument.create(); (await out.copyPages(src,order)).forEach(pg=>out.addPage(pg)); tick(80); return [{name:saveName('pdf'),bytes:await out.save()}];
        }
        if (tool==='protect') {
          if (!p.password) throw new Error('请输入新密码');
          if (p.password!==p.confirmPassword) throw new Error('两次输入的密码不一致');
          if (typeof window.PdfEncrypt?.encryptPDF !== 'function') throw new Error('加密组件未加载，请刷新页面重试');
          try { const bytes=await window.PdfEncrypt.encryptPDF(bytes0, p.password, p.password+'owner'); tick(80); return [{name:saveName('pdf'),bytes}]; }
          catch(e) { throw new Error('加密失败：'+C.errMsg(e)); }
        }
        if (tool==='unlock') {
          if (typeof window.PdfEncrypt?.decryptPDF !== 'function') throw new Error('解密组件未加载，请刷新页面重试');
          try { const bytes=await window.PdfEncrypt.decryptPDF(bytes0, p.password||''); tick(80); return [{name:saveName('pdf'),bytes}]; }
          catch(e) { throw new Error('无法解密：'+C.errMsg(e)); }
        }
        if (tool==='metadata') {
          const doc=await load(bytes0);
          ['title','author','subject','creator','producer'].forEach(k=>{ if(p[k]) doc['set'+k[0].toUpperCase()+k.slice(1)](String(p[k])); });
          if (p.keywords) doc.setKeywords(String(p.keywords).split(/[,，]/).map(x=>x.trim()).filter(Boolean));
          doc.setModificationDate(new Date()); tick(80); return [{name:saveName('pdf'),bytes:await doc.save()}];
        }
        if (tool==='grayscale') {
          const canvases = await C.renderPages(bytes0, 1.5, pwd);
          const out = await PDFLib.PDFDocument.create();
          for (let i=0;i<canvases.length;i++) {
            const canvas = canvases[i]; const ctx = canvas.getContext('2d');
            const imgData = ctx.getImageData(0,0,canvas.width,canvas.height); const data = imgData.data;
            for (let j=0;j<data.length;j+=4) { const v=data[j]*0.299+data[j+1]*0.587+data[j+2]*0.114; data[j]=data[j+1]=data[j+2]=v; }
            ctx.putImageData(imgData,0,0);
            const url = canvas.toDataURL('image/jpeg',0.75);
            const img = await out.embedJpg(url);
            const page = out.addPage([canvas.width,canvas.height]);
            page.drawImage(img,{x:0,y:0,width:canvas.width,height:canvas.height});
            tick(20+Math.round(70*(i+1)/canvases.length));
          }
          return [{name:saveName('pdf'),bytes:await out.save()}];
        }
        if (tool==='page-numbers' || tool==='watermark' || tool==='signature') {
          const doc=await load(bytes0);
          const pages=doc.getPages();
          const hex=(c)=>{ const m=/^#?([0-9a-f]{6})$/i.exec(c||''); if(!m) return [0,0,0]; const n=parseInt(m[1],16); return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255]; };
          const fmtNum=(n,total)=>String(p.format||'{n}').replace('{n}',n).replace('{total}',total);
          for (let i=0;i<pages.length;i++) {
            const pg=pages[i]; const {width,height}=pg.getSize();
            if (tool==='page-numbers') {
              const text=fmtNum(i+1,pages.length); const size=11; const margin=30;
              const font=await C.textFont(doc,text);
              const tw=font.widthOfTextAtSize(text,size); const th=font.heightAtSize(size,{descender:false});
              const xByPos={ 'top-left':margin, 'top-center':(width-tw)/2, 'top-right':width-tw-margin,
                             'bottom-left':margin, 'bottom-center':(width-tw)/2, 'bottom-right':width-tw-margin };
              const yByPos={ 'top-left':height-margin-th, 'top-center':height-margin-th, 'top-right':height-margin-th,
                             'bottom-left':margin, 'bottom-center':margin, 'bottom-right':margin };
              const key=p.position||'bottom-center';
              pg.drawText(text,{x:xByPos[key]??(width-tw)/2,y:yByPos[key]??margin,size,font,color:PDFLib.rgb(0.2,0.2,0.2)});
            }
            else if (tool==='watermark') { const [r,g,b]=hex(p.color); const text=p.text||'水印文字'; const font=await C.textFont(doc,text); const size=Number(p.fontSize??18); const gap=Math.max(size*0.5,size*Number(p.spacing??10)); const stepX=Math.max(size,font.widthOfTextAtSize(text,size)+gap); const stepY=Math.max(size,font.heightAtSize(size)+gap); const rows=p.repeat?Math.max(1,Math.ceil(height/stepY)):1; const cols=p.repeat?Math.max(1,Math.ceil(width/stepX)):1; const offsetX=p.repeat?(width-(cols-1)*stepX)/2:width/2; const offsetY=p.repeat?(height-(rows-1)*stepY)/2:height/2; const centers=p.repeat ? Array.from({length:rows*cols},(_,i)=>({x:offsetX+(i%cols)*stepX,y:offsetY+Math.floor(i/cols)*stepY})) : [{x:offsetX,y:offsetY}]; for(const c of centers){ const m=watermarkTextMatrix(font,text,size,Number(p.rotation??-45)); pg.drawText(text,{x:c.x+m.x,y:c.y+m.y,size,font,color:PDFLib.rgb(r,g,b),rotate:m.rotate,opacity:Number(p.opacity??0.2)}); } }
            else if (tool==='signature') { const font=await C.textFont(doc,p.text||'已签名'); pg.drawText(p.text||'已签名',{x:width-110,y:30,size:12,font,color:PDFLib.rgb(0,0,.6)}); }
            tick(20+Math.round(70*(i+1)/pages.length));
          }
          return [{name:saveName('pdf'),bytes:await doc.save({useObjectStreams:true})}];
        }
        if (tool==='pdf-to-text') {
          if (p.extractionMode==='ocr') C.toast('当前离线环境未内置 OCR 引擎，已使用文本提取');
          const text=await C.extractText(bytes0, pwd); tick(90); return [{name:saveName('txt'),bytes:new TextEncoder().encode(text)}];
        }
        if (tool==='compress') {
          const compressForWorkbench = window.CompressCompat.compressForWorkbench;
          const compressParams = {
            jpegQ:Number(p.jpegQ)||80,
            rasterizeAll:!!p.rasterizeAll, jpegEncoder:p.jpegEncoder||'jsquash', pngEncoder:p.pngEncoder||'auto',
            password:pwd
          };
          if (p.targetDpi !== undefined) compressParams.targetDpi = Number(p.targetDpi);
          else if (p.maxDim !== undefined) compressParams.maxDim = Number(p.maxDim);
          const res = await compressForWorkbench(bytes0, compressParams, v=>tick(10+Math.round(80*v)));
          return [{name:saveName('pdf'),bytes:res.bytes,compression:res.compression,stats:res.stats}];
        }
        if (tool==='repair') {
          const bytes = pwd ? await window.PdfEncrypt.decryptPDF(bytes0, pwd) : bytes0.slice();
          const doc=await PDFLib.PDFDocument.load(bytes,{throwOnInvalidObject:false}); tick(80); return [{name:saveName('pdf'),bytes:await doc.save({useObjectStreams:true})}];
        }
        if (tool==='pdf-to-image' || tool==='extract-images') {
          if (tool==='pdf-to-image') {
            const dpi=Math.max(50,Math.min(500,Number(p.dpi==='custom'?p.dpiCustom:p.dpi)||150));
            const fmt=p.format==='png'?'png':'jpg'; const ext=fmt==='png'?'png':'jpg';
            const quality=Math.max(1,Math.min(100,Number(p.jpgQuality)||80))/100;
            const useJsquash = fmt==='jpg' && !!p.useJsquash;
            const useUpng = fmt==='png' && !!p.useUpng;
            const outputWidth=Math.max(0,Math.floor(Number(p.outputWidth)||0));
            const parsedPages=p.pages?C.parseRange(p.pages,0):[];
            const canvases=await C.renderPages(bytes0,dpi/72,pwd,{ pages:parsedPages });
            const zip=new JSZip(); const out=[];
            for (let i=0;i<canvases.length;i++) {
              const target=outputWidth>0 ? C.resizeCanvasToWidth(canvases[i],outputWidth) : canvases[i];
              const bytes=useUpng
                ? await C.canvasToBytes(target,fmt,{upng:true})
                : await C.canvasToBytes(target,fmt,{quality,useJsquash});
              const pageNo=parsedPages[i]||i+1;
              const name=`${baseName(fs[0])}-${String(pageNo).padStart(2,'0')}.${ext}`;
              zip.file(name,bytes); out.push({name,bytes,width:target.width,height:target.height});
              if (target!==canvases[i]) { target.width=0; target.height=0; }
              tick(20+Math.round(70*(i+1)/canvases.length));
            }
            if (p.outputMode==='separate') return out;
            return [{name:saveName('zip'),bytes:await zip.generateAsync({type:'uint8array'})}];
          }
          const extractImagesForWorkbench = window.ImageExtract.extractImagesForWorkbench;
          const fmt=p.format==='jpg'?'jpg':'png'; const ext=fmt==='png'?'png':'jpg';
          const quality=Math.max(1,Math.min(100,Number(p.jpgQuality)||80))/100;
          const useJsquash=fmt==='jpg' && !!p.useJsquash;
          const useUpng=fmt==='png' && !!p.useUpng;
          const maxWidth=Math.max(0,Math.floor(Number(p.maxWidth)||0));
          const res=await extractImagesForWorkbench(bytes0, pwd, {
            format:fmt, quality, useJsquash, useUpng, maxWidth,
            tick:v=>tick(10+Math.round(80*v))
          });
          if (!res.length) throw new Error('未找到可提取的嵌入图片');
          const out=res.map((img,i)=>({name:`${baseName(fs[0])}_图片-${String(i+1).padStart(3,'0')}.${ext}`,bytes:img.bytes,width:img.width,height:img.height}));
          if (p.outputMode==='separate') return out;
          const zip=new JSZip(); out.forEach(o=>zip.file(o.name,o.bytes));
          tick(95); return [{name:saveName('zip'),bytes:await zip.generateAsync({type:'uint8array'})}];
        }
        if (tool==='image-to-pdf') {
          const doc=await PDFLib.PDFDocument.create();
          for (let i=0;i<fs.length;i++) { const f=fs[i]; const img = f.name.toLowerCase().endsWith('.png') ? await doc.embedPng(f.bytes) : await doc.embedJpg(f.bytes); const pg=doc.addPage([img.width,img.height]); pg.drawImage(img,0,0,img.width,img.height); tick(20+Math.round(70*(i+1)/fs.length)); }
          return [{name:saveName('pdf'),bytes:await doc.save()}];
        }
        throw new Error('暂不支持的工具：'+tool);
      }

      function compressionInfo(o) {
        const c = o && o.compression;
        if (!c || !c.originalBytes || !c.outputBytes) return null;
        const ratio = Number(c.ratio);
        if (!Number.isFinite(ratio)) return null;
        return { ratio: ratio, saved: Math.max(0, c.originalBytes - c.outputBytes), original: c.originalBytes, output: c.outputBytes };
      }
      function imageStats(o) {
        const s = o && o.stats;
        if (!s || (!s.totalImages && !s.compressedImages)) return null;
        return { total: Number(s.totalImages || s.photos || 0), compressed: Number(s.compressedImages || s.shrunk || 0) };
      }
      function imageDimension(o) {
        const w = Math.round(Number(o && o.width));
        const h = Math.round(Number(o && o.height));
        return o && isImageOut(o) && w > 0 && h > 0 ? { width: w, height: h } : null;
      }
      function ratioText(v) {
        const n = Number(v) || 0;
        return (n > 0 ? '↓' : n < 0 ? '↑' : '') + Math.abs(n).toFixed(1) + '%';
      }
      function outputMime(o) { const n=o.name.toLowerCase(); if(n.endsWith('.png'))return 'image/png'; if(n.endsWith('.jpg')||n.endsWith('.jpeg'))return 'image/jpeg'; if(n.endsWith('.gif'))return 'image/gif'; if(n.endsWith('.webp'))return 'image/webp'; if(n.endsWith('.bmp'))return 'image/bmp'; if(n.endsWith('.pdf'))return 'application/pdf'; if(n.endsWith('.txt')||n.endsWith('.md')||n.endsWith('.csv'))return 'text/plain;charset=utf-8'; if(n.endsWith('.zip'))return 'application/zip'; return 'application/octet-stream'; }
      function outputUrl(o) { if (!o.url) o.url=URL.createObjectURL(new Blob([o.bytes],{type:outputMime(o)})); return o.url; }
      function isImageOut(o) { return /\.(png|jpe?g|gif|webp|bmp)$/i.test(o.name); }
      function isZipOut(o) { return /\.zip$/i.test(o.name); }
      function isPdfOut(o) { return /\.pdf$/i.test(o.name); }
      function isTextOut(o) { return /\.(txt|md|csv|json)$/i.test(o.name); }
      function hasImageOutputs(outputs) { return outputs.some(isImageOut); }
      function openDetail(t) { openOverlay({show:true,type:'detail',title:'📄 任务详情 · '+toolOf(t).title,outputs:t.outputs,payload:{files:[]},wide:hasImageOutputs(t.outputs)}); }
      function downloadOut(o) { C.download(o.bytes,o.name); }
      async function previewOut(o) {
        if (isZipOut(o)) { C.toast('ZIP 暂不支持在线预览，请下载后查看'); return; }
        if (isImageOut(o)) { openOverlay({show:true,type:'preview',title:'👁 预览 · '+o.name,preview:{kind:'image',url:outputUrl(o)},wide:true}); return; }
        if (isTextOut(o)) { openOverlay({show:true,type:'preview',title:'👁 预览 · '+o.name,preview:{kind:'text',text:new TextDecoder().decode(o.bytes)},wide:true}); return; }
        if (isPdfOut(o)) {
          openOverlay({show:true,type:'preview',title:'👁 预览 · '+o.name,preview:{kind:'pdf',url:outputUrl(o)},wide:true});
          return;
        }
        C.toast('该格式暂不支持在线预览，请下载后查看');
      }
      function previewFile(f) {
        if (!f || !f.bytes) { C.toast('文件仍在读取中，请稍后再试'); return; }
        previewOut({ name:f.name, bytes:new Uint8Array(f.bytes) });
      }
      function outputToInput(o) {
        const bytes = Array.from(o.bytes);
        const file = { id:uid(), name:o.name, size:bytes.length, time:Date.now(), kind:kindOf(o.name), bytes };
        files.value.push(file);
        if (kindOf(o.name)==='pdf') C.getPageCount(o.bytes).then(n=>{ if(n) file.pages=n; });
        closeDialog();
        C.toast('已添加到输入列表：'+o.name);
      }

      function toggleTheme() { dark.value=!dark.value; document.documentElement.classList.toggle('dark',dark.value); C.store.set('theme',dark.value?'dark':'light'); }
      function onKey(e) {
        if (e.type==='paste') onPaste(e);
        if (e.key==='Escape' && dialog.value.show) closeDialog();
      }
      function hasFiles(e) { return Array.from(e.dataTransfer&&e.dataTransfer.types||[]).includes('Files'); }
      function onBodyDragOver(e) {
        if (inDialog(e)) return;
        if (!hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect='copy';
        dragOver.value=true;
        document.body.classList.add('body-drag-over');
      }
      function onBodyDragLeave(e) {
        if (inDialog(e)) return;
        if (e.relatedTarget) return;
        dragOver.value=false;
        document.body.classList.remove('body-drag-over');
      }
      function inDialog(e) {
        return !!(e.target && e.target.closest && e.target.closest('.modal-mask'));
      }
      function onBodyDrop(e) {
        if (inDialog(e)) { e.preventDefault(); return; }
        if (!hasFiles(e)) return;
        e.preventDefault();
        dragOver.value=false;
        document.body.classList.remove('body-drag-over');
        const fs=Array.from(e.dataTransfer.files||[]);
        if (fs.length) addFiles(fs);
      }
      watchWatermarkPreview();
      onMounted(()=>{ window.addEventListener('paste',onKey); window.addEventListener('keydown',onKey); window.addEventListener('dragover',onBodyDragOver); window.addEventListener('dragleave',onBodyDragLeave); window.addEventListener('drop',onBodyDrop); });
      onUnmounted(()=>{ window.removeEventListener('paste',onKey); window.removeEventListener('keydown',onKey); window.removeEventListener('dragover',onBodyDragOver); window.removeEventListener('dragleave',onBodyDragLeave); window.removeEventListener('drop',onBodyDrop); });

      return { dark, files, selected, keyword, category, sortKey, dragOver, tasks, dialog, sorts, tools:C.TOOLS, toolOf,
        visibleFiles, selectedFiles, orderedFiles, runnable, runningCount, statsText, badgeClass, fmtSize, fmtTime, extLabel, extClass, statusText,
        addFiles, pickFiles, openHttpLoad, loadHttpPdf, onDrop, onBodyDragOver, onBodyDragLeave, onBodyDrop, removeFile, clearFiles, toggleSelect, toggleSelectAll, resetFilters, dragFileId, manualOrder, onFileDragArm, onFileDragStart, onFileDragOver, onFileDragLeave, onFileDrop, onFileDragEnd, moveFileByOrder, canUse, openTool, editTask, closeDialog, confirmParams,
        removeTask, startTask, startAll, runTask, openDetail, setParam, commitParam, clampParam, watermarkTextMatrix, downloadOut, outputUrl, isZipOut, isPdfOut, isTextOut, previewOut, previewFile, outputToInput, isImageOut, hasImageOutputs, paramVisible, toggleTheme, compressionInfo, imageStats, imageDimension, ratioText, watermarkPreview, refreshWatermarkPreview };
    },
  };
  createApp(App).mount('#app');
})();
