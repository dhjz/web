// Optional PDF engine: @dhjzz/pdf-to-md UMD build + pdf.js 4.10.38 from CDN.
// Same setup as the upstream demo; exposes window.any2mdPdfToMd with init()/convertPdf().
(function () {
  'use strict';

  const BASE = new URL('./vendor/', import.meta.url);
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38';
  const PDFJS_URL = `${PDFJS_CDN}/pdf.min.mjs`;
  const WORKER_URL = `${PDFJS_CDN}/pdf.worker.min.mjs`;
  const UMD_URL = new URL('pdf-to-md/pdftomd.umd.min.js', BASE).href;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error(`加载自有 PDF 引擎失败: ${src}`));
      document.head.appendChild(el);
    });
  }


  let readyPromise = null;
  function init() {
    if (!readyPromise) {
      readyPromise = (async () => {
        const pdfjs = await import(PDFJS_URL);
        const PdfToMd = window.PdfToMd || await loadScript(UMD_URL).then(() => window.PdfToMd);
        // pdf.js 4.x uses Promise.withResolvers inside its worker too; the UMD
        // build exports the same shim source for the worker wrapper.
        const shim = typeof PdfToMd.shimWR === 'function'
          ? '(' + PdfToMd.shimWR.toString() + ')(globalThis);'
          : '';
        const workerSource = `${shim}await import(${JSON.stringify(WORKER_URL)});`;
        pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
        // pdf-to-md resolves the module from globalThis.pdfjsLib in browser.
        window.pdfjsLib = pdfjs;
        const version = PdfToMd.version || PdfToMd.VERSION || '?';
        return { name: 'pdf-to-md（自有引擎）', version };
      })().catch(err => {
        readyPromise = null;
        throw err;
      });
    }
    return readyPromise;
  }

  async function convertPdf({ name, bytes, onStatus }) {
    const PdfToMd = window.PdfToMd;
    if (!PdfToMd) throw new Error('自有 PDF 引擎未就绪，请刷新页面重试');
    const started = performance.now();
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const inputBytes = new Uint8Array(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
    const converted = await PdfToMd.convert(inputBytes, {
      tables: true,
      pdfjsLib: window.pdfjsLib,
      onStatus: typeof onStatus === 'function' ? onStatus : undefined,
    });
    const ms = Math.round(Math.max(0.1, performance.now() - started) * 10) / 10;
    // Keep the engine's own markdown/image placeholders untouched. pdf-to-md
    // already pairs `![](images/...)` with images/ in its createMarkdownZip();
    // rewriting them into media/ here only breaks that built-in export.
    const markdown = String(converted.markdown || '');
    const imageStats = {
      images: converted.images?.length || 0, embedded: converted.images?.length || 0,
      external: 0, unavailable: 0,
      assetBytes: (converted.images || []).reduce((s, a) => s + (a.bytes?.length || 0), 0),
      assetCount: converted.images?.length || 0,
    };
    return {
      markdown, format: 'pdf', detectedFormat: 'pdf', extensionFormat: 'pdf',
      imageStats, assets: [], renderMode: 'pdftomd',
      sourceResult: converted, fileName: name, hasImages: (converted.images?.length || 0) > 0,
      timings: { ms }, sizes: { input: source.length, output: new TextEncoder().encode(markdown).length },
      pageCount: converted.stats?.pageCount || 0,
    };
  }

  window.any2mdPdfToMd = { init, convertPdf };
})();
