// 图片编码 Worker：MozJPEG / UPNG 都是同步 CPU/wasm 编码，放在主线程会长时间独占
// 渲染进程。这里在 Worker 内完成编码，主线程只负责取像素和接收结果。
let jpegEncoderPromise = null;
let pngCodecsPromise = null;

function getJpegEncoder() {
  if (!jpegEncoderPromise) {
    jpegEncoderPromise = import('./jsquash/jpeg-encode.js')
      .then((mod) => mod.default)
      .catch((e) => { jpegEncoderPromise = null; throw e; });
  }
  return jpegEncoderPromise;
}

function getPngCodecs() {
  if (!pngCodecsPromise) {
    pngCodecsPromise = Promise.all([
      import('./pako.min.js'),
      import('./upng.min.js')
    ]).then(() => ({ UPNG: self.UPNG, pako: self.pako }))
      .catch((e) => { pngCodecsPromise = null; throw e; });
  }
  return pngCodecsPromise;
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  const { id, type, width, height, buffer, options } = msg;
  try {
    let encoded;
    if (type === 'jpeg') {
      const encode = await getJpegEncoder();
      const image = { data: new Uint8ClampedArray(buffer), width, height };
      encoded = await encode(image, options);
    } else if (type === 'png') {
      const { UPNG, pako } = await getPngCodecs();
      if (!UPNG || !UPNG.encode || !pako || !pako.deflate) throw new Error('UPNG / pako 加载失败');
      const copy = new Uint8Array(buffer);
      encoded = new Uint8Array(UPNG.encode([copy.buffer], width, height, 0));
    } else {
      throw new Error('未知编码类型：' + type);
    }
    const bytes = encoded instanceof Uint8Array ? encoded : new Uint8Array(encoded);
    self.postMessage({ id, ok: true, buffer: bytes.buffer }, [bytes.buffer]);
  } catch (e) {
    self.postMessage({ id, ok: false, error: (e && e.message) || String(e) });
  }
};
