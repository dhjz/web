(function () {
  'use strict';
  const { createApp, ref, computed, onMounted, onBeforeUnmount } = Vue;

  createApp({
    setup() {
      const items = ref([]);
      const activeId = ref(null);
      const selectedIds = ref(new Set());
      const theme = ref('light');
      const tab = ref('preview');
      const previewHtml = ref(true);
      const exportImages = ref(true);
      const formatHint = ref('');
      const pdfEngine = ref('anydoc');
      const engineState = ref('loading');
      const engineError = ref('');
      const engineInfo = ref('加载中…');
      const engineProgress = ref({ stage: 'fetch', label: '准备加载引擎…', percent: 0, loaded: 0, total: 0 });
      const running = ref(false);
      const dragDepth = ref(0);
      const lightbox = ref(null);
      const copied = ref(false);
      const copiedHtml = ref(false);
      const resultBody = ref(null);
      const showBackToTop = ref(false);
      let copiedTimer = null;
      let copiedHtmlTimer = null;
      const formats = [
        { value: 'docx', label: 'DOCX (.docx)' },
        { value: 'doc', label: 'DOC (.doc)' },
        { value: 'odt', label: 'ODT (.odt)' },
        { value: 'rtf', label: 'RTF (.rtf)' },
        { value: 'epub', label: 'EPUB (.epub)' },
        { value: 'pdf', label: 'PDF (.pdf)' },
        { value: 'ppt', label: 'PPT (.ppt)' },
        { value: 'pptx', label: 'PPTX (.pptx)' },
        { value: 'xlsx', label: 'XLSX (.xlsx)' },
        { value: 'ods', label: 'ODS (.ods)' },
        { value: 'odp', label: 'ODP (.odp)' },
        { value: 'csv', label: 'CSV (.csv)' },
        { value: 'html', label: 'HTML (.html/.htm)' },
      ];

      let worker = null;
      let seq = 0;
      const pending = [];
      let nextId = 1;
      const queue = [];
      let currentJob = null;

      const enginePercent = computed(() => {
        const p = engineProgress.value;
        return p && Number.isFinite(p.percent) ? Math.max(0, Math.min(100, p.percent)) : null;
      });
      const engineProgressText = computed(() => {
        const p = engineProgress.value;
        if (!p) return '';
        const label = p.label || '加载引擎…';
        if (!Number.isFinite(p.percent)) return label;
        const loaded = formatSize(p.loaded);
        const total = formatSize(p.total);
        return total && total !== '—' ? `${label} ${p.percent}%  ${loaded} / ${total}` : `${label} ${p.percent}%`;
      });

      const activeItem = computed(() => items.value.find(i => i.id === activeId.value) || null);
      // Sanitized HTML is only produced by the HTML conversion pipeline.
      const cleanHtml = computed(() => activeItem.value?.result?.cleanHtml || '');
      const hasCleanHtml = computed(() => !!cleanHtml.value);
      const doneItems = computed(() => items.value.filter(i => i.status === 'done'));
      const canStart = computed(() => engineState.value === 'ready' && !running.value && items.value.some(i => i.status === 'pending' || i.status === 'error'));
      const hasPdfFiles = computed(() => items.value.some(i => isPdfItem(i)));
      const queuePosition = computed(() => queue.length + (currentJob ? 1 : 0));

      const previewUrls = new Map(); // blob URL cache, keyed by `media/...` path
      const pdftomdPreviewUrls = new Map(); // keyed by sourceResult object -> Map(path, blob URL)
      const pdfPreviewUrl = ref('');
      let pdfPreviewItemId = null;
      const previewHtmlContent = computed(() => {
        const item = activeItem.value;
        if (!item || !item.markdown) return '';
        if (!previewHtml.value) return `<pre class="plain">${escapeHtml(item.markdown)}</pre>`;
        try {
          let md = item.markdown;
          if (item.result?.renderMode === 'pdftomd') {
            const source = item.result.sourceResult;
            const images = source?.images || [];
            const manifest = source?.imageManifest || [];
            let urls = pdftomdPreviewUrls.get(source);
            if (!urls) { urls = new Map(); pdftomdPreviewUrls.set(source, urls); }
            manifest.forEach((m, i) => {
              const raw = images[i]?.bytes;
              if (!raw?.length || urls.has(m?.placeholder)) return;
              const blob = new Blob([raw], { type: m.contentType || images[i].contentType || 'image/png' });
              const url = URL.createObjectURL(blob);
              const ext = m.contentType === 'image/jpeg' ? 'jpg' : 'png';
              const aliases = [m.placeholder, m.fileName && `images/${m.fileName}`,
                `images/p${m.page || 1}-${i + 1}.${ext}`].filter(Boolean);
              for (const alias of aliases) urls.set(alias, url);
            });
            for (const [path, url] of urls) md = md.split(`(${path})`).join(`(${url})`);
          } else {
            for (const asset of item.result?.assets || []) {
              if (!asset.path || !asset.bytes || !asset.bytes.length) continue;
              let url = previewUrls.get(asset.path);
              if (!url) {
                url = URL.createObjectURL(new Blob([asset.bytes], { type: asset.mediaType || 'application/octet-stream' }));
                previewUrls.set(asset.path, url);
              }
              md = md.split(`(${asset.path})`).join(`(${url})`);
            }
          }
          const raw = marked.parse(md);
          // DOMPurify's default URI policy drops blob: URLs; without this the
          // local previews of extracted images silently disappear.
          return window.DOMPurify
            ? DOMPurify.sanitize(raw, { ADD_ATTR: ['target'], ADD_URI_SAFE_ATTR: ['src'] })
            : raw;
        } catch (e) {
          return `<pre class="plain">${escapeHtml(item.markdown)}</pre>`;
        }
      });

      // Mark broken images in the preview so CSS can render a visible placeholder.
      function markBrokenImages(root) {
        root.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src');
          if (!src) return;
          if (img.complete && !img.naturalWidth) {
            img.classList.add('broken-img');
            return;
          }
          img.addEventListener('error', () => img.classList.add('broken-img'), { once: true });
        });
      }

      function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      }
      function formatSize(n) {
        if (n == null) return '—';
        if (n < 1024) return n + ' B';
        const units = ['KB', 'MB', 'GB'];
        let v = n / 1024, i = 0;
        while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
        return v.toFixed(v >= 10 ? 0 : 1) + ' ' + units[i];
      }
      function formatDate(ts) {
        if (!ts) return '—';
        const d = new Date(ts);
        return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', { hour12: false });
      }
      function extOfName(name) {
        const m = /\.([^.]+)$/.exec(String(name || ''));
        return m ? m[1].toLowerCase() : '';
      }
      function isPdfItem(item) {
        if (!item) return false;
        const hint = String(formatHint.value || '').toLowerCase();
        if (hint === 'pdf') return true;
        if (hint && hint !== 'pdf') return false;
        const ext = extOfName(item.file?.name);
        if (ext === 'pdf' || /pdf/i.test(item.file?.type || '')) return true;
        const bytes = item._buffer ? new Uint8Array(item._buffer, 0, Math.min(8, item._buffer.byteLength)) : null;
        return !!bytes && String.fromCharCode(...bytes) === '%PDF-';
      }
      function formatLabel(item) {
        const ext = extOfName(item.file.name);
        return (ext || 'FILE').slice(0, 5).toUpperCase();
      }
      function extClass(file) {
        const map = { docx: 'e-blue', doc: 'e-blue', pdf: 'e-red', xlsx: 'e-green', xls: 'e-green', csv: 'e-green', pptx: 'e-orange', ppt: 'e-orange', epub: 'e-purple', odt: 'e-blue', rtf: 'e-gray', html: 'e-orange', htm: 'e-orange', txt: 'e-gray' };
        return map[extOfName(file.name)] || 'e-gray';
      }
      function typeLabel(file) {
        return file.type || (extOfName(file.name) ? '.' + extOfName(file.name) : '未知类型');
      }
      function statusText(item) {
        return { queued: '准备中', pending: '排队中', converting: '转换中', done: '完成', error: '失败' }[item.status] || item.status;
      }

      // Per-file controls: a file can be started/retried/reconverted on its own,
      // without having to run the whole queue.
      function canStartItem(item) {
        return !!item && engineState.value === 'ready' && item.status !== 'converting' && item.status !== 'queued';
      }
      function itemStartLabel(item) {
        if (!item) return '开始';
        if (item.status === 'error') return '重试';
        if (item.status === 'done') return '重转';
        return '开始';
      }
      function itemBusy(item) {
        return !!item && (item.status === 'queued' || item.status === 'converting');
      }

      const pdfReady = ref(false);
      const pdfInitError = ref('');
      const pdfEngineInfo = ref('');
      let pdfInitPromise = null;

      const fileInput = ref(null);
      function addInputFiles(fileList) {
        const arr = Array.from(fileList || []);
        if (!arr.length) return;
        const added = arr.map(file => ({
          id: nextId++, file, typeLabel: typeLabel(file),
          status: 'pending', errorMessage: '', markdown: '', result: null,
          _buffer: null,
        }));
        items.value.push(...added);
        selectedIds.value = new Set([...selectedIds.value, ...added.map(i => i.id)]);
        if (!activeId.value) activeId.value = added[0].id;
      }

      function onFileInput(e) { addInputFiles(e.target.files); e.target.value = ''; }
      function addFiles() {
        if (fileInput.value) fileInput.value.click();
      }

      function hasFiles(e) {
        const types = e.dataTransfer?.types;
        return !!types && Array.from(types).includes('Files');
      }
      function looksLikeHtmlText(text) {
        return /<html|<head|<body|<div|<table|<p[\s>]|<img|<ul|<ol|<li|<br\s*\/?>|<a[\s>]/i.test(String(text || '').slice(0, 4096));
      }
      function htmlFileFromClipboard(text, name) {
        // Clipboard text/html has no file; synthesize one so it flows through
        // the same queue, stats and export as dropped .html files.
        return new File([text], name || `pasted-${new Date().toISOString().replace(/[:.]/g, '-')}.html`, { type: 'text/html' });
      }
      function onDragEnter(e) {
        if (!hasFiles(e)) return;
        e.preventDefault();
        dragDepth.value = 1;
      }
      function onDragOver(e) {
        if (!hasFiles(e)) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (!dragDepth.value) dragDepth.value = 1;
      }
      function onDragLeave(e) {
        if (!hasFiles(e)) return;
        // Only clear when the pointer truly leaves the app, not when moving
        // between its children (dragleave fires for every child boundary).
        const app = document.getElementById('app');
        if (e.relatedTarget && app && e.relatedTarget !== document.body && app.contains(e.relatedTarget)) return;
        dragDepth.value = 0;
      }
      function onDrop(e) {
        e.preventDefault();
        dragDepth.value = 0;
        addInputFiles(e.dataTransfer && e.dataTransfer.files);
      }
      function onGlobalDrop(e) {
        e.preventDefault();
        dragDepth.value = 0;
      }
      function onPaste(e) {
        const cd = e.clipboardData;
        if (!cd) return;
        const files = [];
        for (const item of cd.items || []) {
          if (item.kind !== 'file') continue;
          const f = item.getAsFile();
          if (f) files.push(f);
        }
        // Clipboard may expose rich HTML (copy from browser/Office) as
        // text/html with no File item. Turn it into a .html file.
        const html = cd.getData('text/html');
        const plain = cd.getData('text/plain');
        const hasHtmlFile = files.some(f => /\.html?$/i.test(f.name || ''));
        if (html && looksLikeHtmlText(html)) {
          if (!hasHtmlFile) files.unshift(htmlFileFromClipboard(html));
        } else if (!hasHtmlFile && plain && looksLikeHtmlText(plain)) {
          files.unshift(htmlFileFromClipboard(plain, `pasted-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`));
        }
        if (files.length) { e.preventDefault(); addInputFiles(files); }
      }

      function selectItem(id) { activeId.value = id; tab.value = 'preview'; resetResultScroll(); }
      // The PDF tab shows the original file through <embed>, like the reference site.
      function ensurePdfPreviewUrl() {
        const item = activeItem.value;
        if (!item || !isPdfItem(item)) { clearPdfPreviewUrl(); return; }
        if (pdfPreviewItemId === item.id && pdfPreviewUrl.value) return;
        clearPdfPreviewUrl();
        const data = item.file?.type === 'application/pdf' || /\.pdf$/i.test(item.file?.name || '')
          ? item.file
          : new Blob([item._buffer || item.file], { type: 'application/pdf' });
        pdfPreviewUrl.value = URL.createObjectURL(data);
        pdfPreviewItemId = item.id;
      }
      function clearPdfPreviewUrl() {
        if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value);
        pdfPreviewUrl.value = '';
        pdfPreviewItemId = null;
      }
      function toggleSelected(id) {
        const s = new Set(selectedIds.value);
        s.has(id) ? s.delete(id) : s.add(id);
        selectedIds.value = s;
      }
      function selectAll() {
        selectedIds.value = selectedIds.value.size === items.value.length ? new Set() : new Set(items.value.map(i => i.id));
      }
      function removeSelected() {
        const ids = selectedIds.value;
        items.value = items.value.filter(i => !ids.has(i.id));
        if (ids.has(activeId.value)) clearPdfPreviewUrl();
        selectedIds.value = new Set();
        if (!items.value.some(i => i.id === activeId.value)) activeId.value = items.value[0]?.id || null;
      }
      function clearAll() {
        clearPdfPreviewUrl();
        items.value = [];
        selectedIds.value = new Set();
        activeId.value = null;
      }

      function callWorker(type, payload) {
        return new Promise((resolve, reject) => {
          const id = ++seq;
          pending.push({ id, resolve, reject });
          worker.postMessage({ id, type, payload });
        });
      }
      function pumpQueue() {
        if (running.value || !queue.length) return;
        running.value = true;
        currentJob = queue.shift();
        const item = currentJob.item;
        item.status = 'converting';
        const bytes = new Uint8Array(currentJob.arrayBuffer);
        const payload = { name: item.file.name, bytes, formatHint: formatHint.value || null };
        const usePdfToMd = pdfEngine.value === 'pdftomd' && isPdfItem(item) && !(window.any2mdConvertHtml && window.any2mdConvertHtml.isHtmlPayload(payload));
        if (usePdfToMd && pdfInitError.value) {
          item.status = 'error';
          item.errorMessage = `自有 PDF 引擎初始化失败: ${pdfInitError.value}`;
          currentJob = null;
          running.value = false;
          pumpQueue();
          return;
        }
        const convert = usePdfToMd
          ? window.any2mdPdfToMd.convertPdf(payload)
          : (window.any2mdConvertHtml && window.any2mdConvertHtml.isHtmlPayload(payload)
            ? Promise.resolve().then(() => window.any2mdConvertHtml.convertHtml(payload))
            : callWorker('convert', payload));
        convert
          .then(result => {
            item.status = 'done';
            item.result = result;
            item.markdown = result.markdown;
            item.usedEngine = usePdfToMd ? 'pdf-to-md' : 'anydoc';
            const stats = computeStats(result.markdown);
            item.stats = stats;
            activeId.value = item.id;
            tab.value = 'preview';
            resetResultScroll();
          })
          .catch(err => {
            item.status = 'error';
            item.errorMessage = `${err.code || 'error'}: ${err.message}` + (err.pages ? `（需 OCR 页：${err.pages.join(', ')}）` : '');
          })
          .finally(() => {
            currentJob = null;
            running.value = false;
            pumpQueue();
          });
      }
      async function startQueue() {
        if (engineState.value !== 'ready') return;
        if (pdfEngine.value === 'pdftomd') {
          const pdfItems = items.value.filter(i => i.status === 'pending' || i.status === 'error');
          if (pdfItems.some(isPdfItem)) {
            try { await ensurePdfEngine(); } catch (e) { return; }
          }
        }
        await prepareBuffers();
        for (const item of items.value) {
          if (item.status !== 'pending' && item.status !== 'error') continue;
          await enqueueItem(item);
        }
        pumpQueue();
      }
      function pauseQueue() {
        queue.length = 0;
        if (!currentJob) running.value = false;
      }

      // Push one file into the worker queue. Used by both the global start
      // button and each file's own start/retry button.
      function enqueueItem(item) {
        if (!item) return false;
        if (!item._buffer) {
          // ArrayBuffer() is async; mark queued so the UI shows busy until the
          // buffer is ready and the job is actually in the queue.
          item.status = 'queued';
          return item.file.arrayBuffer().then(buf => {
            item._buffer = buf;
            item.status = 'pending';
            queue.push({ id: item.id, item, arrayBuffer: buf });
            pumpQueue();
            return true;
          }).catch(err => {
            item.status = 'error';
            item.errorMessage = '读取文件失败: ' + (err?.message || String(err));
            return false;
          });
        }
        if (queue.some(q => q.id === item.id)) return false;
        queue.push({ id: item.id, item, arrayBuffer: item._buffer });
        pumpQueue();
        return true;
      }
      async function ensurePdfEngine() {
        if (pdfReady.value) return;
        if (pdfInitPromise) return pdfInitPromise;
        pdfInitPromise = window.any2mdPdfToMd.init().then(info => {
          pdfEngineInfo.value = `${info.name} v${info.version}`;
          pdfReady.value = true;
          pdfInitError.value = '';
        }).catch(err => {
          pdfInitError.value = err?.message || String(err);
          pdfInitPromise = null;
          throw err;
        });
        return pdfInitPromise;
      }
      async function startItem(item) {
        if (!canStartItem(item)) return;
        item.errorMessage = '';
        if (pdfEngine.value === 'pdftomd' && isPdfItem(item)) {
          try { await ensurePdfEngine(); } catch (e) { return; }
        }
        await enqueueItem(item);
      }

      function computeStats(md) {
        const chars = md.length;
        const nonWhitespace = Array.from(md).filter(c => !/\s/.test(c)).length;
        return {
          chars,
          nonWhitespace,
          mdBytes: new TextEncoder().encode(md).length,
          lines: md ? md.split(/\r\n|\r|\n/).length : 0,
        };
      }

      async function prepareBuffers() {
        for (const item of items.value) {
          if (!item._buffer && item.status === 'pending') {
            item._buffer = await item.file.arrayBuffer();
          }
        }
      }

      function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      function baseName(name) { return (String(name).replace(/\.[^.]+$/, '') || 'document').replace(/[\\/:*?"<>|]/g, '_'); }
      function downloadOne(item) {
        const blob = new Blob([item.markdown], { type: 'text/markdown;charset=utf-8' });
        triggerDownload(blob, baseName(item.file.name) + '.md');
      }
      function downloadHtml(item) {
        if (!item || !item.result?.cleanHtml) return;
        const blob = new Blob([item.result.cleanHtml], { type: 'text/html;charset=utf-8' });
        triggerDownload(blob, baseName(item.file.name) + '.html');
      }
      async function copyHtml() {
        const text = cleanHtml.value || '';
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        copiedHtml.value = true;
        clearTimeout(copiedHtmlTimer);
        copiedHtmlTimer = setTimeout(() => { copiedHtml.value = false; }, 1800);
      }
      async function copyMarkdown() {
        const text = activeItem.value?.markdown || '';
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        copied.value = true;
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => { copied.value = false; }, 1800);
      }
      function onPreviewClick(e) {
        const img = e.target.closest('img');
        if (!img) return;
        e.stopPropagation();
        e.preventDefault();
        const src = img.getAttribute('src');
        if (!src) return;
        // The lightbox shows the asset extracted from the document, i.e. the
        // same blob URL the preview uses for media/... images.
        lightbox.value = src;
      }
      function onKeydown(e) {
        if (e.key === 'Escape' && lightbox.value) lightbox.value = null;
      }

      // Right pane (preview / markdown) scroll handling.
      function onResultScroll(e) {
        showBackToTop.value = (e.target?.scrollTop || 0) > 200;
      }
      function scrollResultToTop() {
        const el = resultBody.value;
        if (!el) return;
        el.scrollTo({ top: 0, behavior: 'smooth' });
        showBackToTop.value = false;
      }
      function resetResultScroll() {
        const el = resultBody.value;
        if (el) el.scrollTop = 0;
        showBackToTop.value = false;
      }

      function addItemAssets(zip, item) {
        if (!exportImages.value) return 0;
        let count = 0;
        for (const asset of item.result?.assets || []) {
          if (!asset.path || !asset.bytesBase64) continue;
          const p = `media/${asset.path.replace(/^media\//, '')}`;
          if (zip.files[p]) continue;
          zip.file(p, asset.bytesBase64, { base64: true });
          count++;
        }
        return count;
      }
      function zipReadme(count, imageCount) {
        return [
          '# any2md export', '',
          `- Files: ${count}`,
          `- Images: ${exportImages.value ? 'included' : 'excluded'} (${imageCount})`,
          `- Engine: ${engineInfo.value}`,
          `- PDF Engine: ${pdfEngine.value === 'pdftomd' ? pdfEngineInfo.value : 'anydoc-wasm'}`,
          `- Exported: ${new Date().toLocaleString('zh-CN')}`, '',
          'Generated locally by any2md (offline).',
        ].join('\n');
      }
      function generateZipBlob(zip) {
        return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      }
      async function downloadOneZip(item) {
        if (!item || item.status !== 'done') return;
        if (item.result?.renderMode === 'pdftomd' && item.result.sourceResult && window.PdfToMd?.createMarkdownZip && exportImages.value) {
          const zipBytes = window.PdfToMd.createMarkdownZip(item.result.sourceResult, { fileName: item.file.name });
          triggerDownload(new Blob([zipBytes], { type: 'application/zip' }), baseName(item.file.name) + '.zip');
          return;
        }
        const zip = new JSZip();
        const mdName = baseName(item.file.name) + '.md';
        zip.file(mdName, item.markdown);
        const images = addItemAssets(zip, item);
        zip.file('README.txt', zipReadme(1, images));
        triggerDownload(await generateZipBlob(zip), baseName(item.file.name) + '.zip');
      }
      async function addPdftomdToZip(zip, item, folder) {
        const zipBytes = window.PdfToMd.createMarkdownZip(item.result.sourceResult, { fileName: item.file.name });
        const inner = await JSZip.loadAsync(zipBytes);
        await Promise.all(Object.values(inner.files).map(async f => {
          if (f.dir) return;
          const data = await f.async('uint8array');
          zip.file(`${folder}/${f.name}`, data);
        }));
        return (item.result.sourceResult?.images || []).length;
      }
      async function exportZip() {
        const done = doneItems.value;
        if (!done.length) return;
        const zip = new JSZip();
        const usedNames = new Set();
        let images = 0;
        for (const item of done) {
          const isPdftomd = item.result?.renderMode === 'pdftomd' && item.result.sourceResult && window.PdfToMd?.createMarkdownZip;
          let name = baseName(item.file.name);
          let n = 2;
          while (usedNames.has(name)) name = `${baseName(item.file.name)}-${n++}`;
          usedNames.add(name);
          if (isPdftomd && exportImages.value) {
            images += await addPdftomdToZip(zip, item, name);
          } else {
            zip.file(`${name}.md`, item.markdown);
            if (!isPdftomd) images += addItemAssets(zip, item);
          }
        }
        zip.file('README.txt', zipReadme(done.length, images));
        triggerDownload(await generateZipBlob(zip), `any2md-${new Date().toISOString().slice(0, 10)}.zip`);
      }

      function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme.value;
      }

      function setupWorker() {
        worker = new Worker(new URL('./convert.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
          const { id, type, payload } = e.data || {};
          if (type === 'engine-progress') {
            if (engineState.value === 'loading') engineProgress.value = payload;
            return;
          }
          if (type === 'ready') {
            engineState.value = 'ready';
            engineInfo.value = `${payload.name} v${payload.version}`;
          } else if (type === 'error') {
            // Reply to the pending promise; init errors have no pending job.
            const entry = pending.find(p => p.id === id);
            if (entry) {
              pending.splice(pending.indexOf(entry), 1);
              const err = new Error(payload.message);
              err.code = payload.code;
              err.pages = payload.pages;
              entry.reject(err);
            } else if (engineState.value === 'loading') {
              engineState.value = 'error';
              engineError.value = payload.message;
            }
          } else {
            const idx = pending.findIndex(p => p.id === id);
            if (idx >= 0) {
              const entry = pending.splice(idx, 1)[0];
              type === 'result' ? entry.resolve(payload) : entry.reject(new Error(payload.message));
            }
          }
        };
        worker.onerror = (e) => {
          if (engineState.value === 'loading') {
            engineState.value = 'error';
            engineError.value = e.message || 'worker failed to load';
          }
        };
        callWorker('init').catch(err => {
          engineState.value = 'error';
          engineError.value = err.message;
        });
      }

      onMounted(() => {
        document.addEventListener('paste', onPaste);
        // Global guards: prevent the browser from navigating away when a file
        // is dropped outside #app. The app element handles the actual drop.
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('drop', onGlobalDrop);
        document.addEventListener('keydown', onKeydown);
        const appEl = document.getElementById('app');
        appEl.addEventListener('dragenter', onDragEnter);
        appEl.addEventListener('dragleave', onDragLeave);
        appEl.addEventListener('drop', onDrop);
        const previewEl = document.querySelector('.preview');
        if (previewEl) {
          new MutationObserver(() => markBrokenImages(previewEl)).observe(previewEl, { childList: true });
        }
        setupWorker();
      });
      onBeforeUnmount(() => {
        document.removeEventListener('paste', onPaste);
        window.removeEventListener('dragover', onDragOver);
        window.removeEventListener('drop', onGlobalDrop);
        document.removeEventListener('keydown', onKeydown);
        const appEl = document.getElementById('app');
        appEl.removeEventListener('dragenter', onDragEnter);
        appEl.removeEventListener('dragleave', onDragLeave);
        appEl.removeEventListener('drop', onDrop);
        clearTimeout(copiedTimer);
        for (const url of previewUrls.values()) URL.revokeObjectURL(url);
        for (const urls of pdftomdPreviewUrls.values()) for (const url of urls.values()) URL.revokeObjectURL(url);
        clearPdfPreviewUrl();
        if (worker) worker.terminate();
      });

      return {
        items, activeId, activeItem, doneItems, selectedIds, theme, tab, previewHtml,
        exportImages, formatHint, pdfEngine, hasPdfFiles, pdfEngineInfo, formats, engineState, engineError, engineInfo, engineProgress, enginePercent, engineProgressText, fileInput,
        running, dragDepth, lightbox, copied, copiedHtml, resultBody, showBackToTop, canStart, queuePosition,
        previewHtmlContent, pdfPreviewUrl, isPdfItem, cleanHtml, hasCleanHtml,
        ensurePdfPreviewUrl, clearPdfPreviewUrl,
        addFiles, onFileInput, onPreviewClick, onResultScroll, scrollResultToTop,
        selectItem, toggleSelected, selectAll, removeSelected, clearAll, startQueue, pauseQueue,
        startItem, canStartItem, itemStartLabel, itemBusy,
        formatSize, formatDate, extClass, formatLabel, statusText, copyMarkdown, copyHtml, downloadOne,
        downloadHtml,
        downloadOneZip, exportZip, toggleTheme,
      };
    },
  }).mount('#app');
})();
