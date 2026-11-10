/*
 * 图片像素处理（零依赖）
 * 浏览器：window.ImageUtils；CommonJS：module.exports（便于离线验证）
 *
 * 与 index.html 的扫描增强管线同源：O(N) 可分离盒式滤波估计背景光场，
 * 支持彩色 / 灰度 / 固定阈值黑白 / 局部自适应黑白，以及亮度、对比度。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ImageUtils = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;

  /* 可分离一维盒式滤波，复杂度 O(W*H)，与半径无关 */
  function fastBoxBlur(src, w, h, r) {
    const total = w * h;
    const target = new Uint8Array(total);
    const temp = new Float32Array(total);

    for (let y = 0; y < h; y++) {
      const offset = y * w;
      let sum = 0;
      let count = 0;
      for (let x = 0; x <= r && x < w; x++) { sum += src[offset + x]; count++; }
      for (let x = 0; x < w; x++) {
        const right = x + r;
        if (right < w && x > 0) { sum += src[offset + right]; count++; }
        const left = x - r - 1;
        if (left >= 0) { sum -= src[offset + left]; count--; }
        temp[offset + x] = sum / count;
      }
    }

    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let y = 0; y <= r && y < h; y++) { sum += temp[y * w + x]; count++; }
      for (let y = 0; y < h; y++) {
        const bottom = y + r;
        if (bottom < h && y > 0) { sum += temp[bottom * w + x]; count++; }
        const top = y - r - 1;
        if (top >= 0) { sum -= temp[top * w + x]; count--; }
        target[y * w + x] = Math.round(sum / count);
      }
    }
    return target;
  }

  /**
   * 按参数生成新的像素画布；不做任何处理时直接返回源画布（共享内存）。
   * opts: { mode, brightness, contrast, threshold, radius }
   *   mode: color | gray | bw | adaptive
   *   brightness: -100 ~ 100，contrast: 0.5 ~ 2，threshold: 0 ~ 255
   */
  function applyTone(source, opts) {
    const o = opts || {};
    const mode = o.mode || 'color';
    const brightness = o.brightness || 0;
    const contrast = typeof o.contrast === 'number' ? o.contrast : 1;
    const threshold = typeof o.threshold === 'number' ? o.threshold : 140;
    const radius = o.radius || 30;
    const w = source.width;
    const h = source.height;
    if (!w || !h) return source;
    if (mode === 'color' && brightness === 0 && contrast === 1) return source;

    const sctx = source.getContext('2d', { willReadFrequently: true });
    const src = sctx.getImageData(0, 0, w, h).data;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');
    const imageData = octx.createImageData(w, h);
    const dst = imageData.data;
    const total = w * h;

    const gray = new Uint8Array(total);
    for (let i = 0, p = 0; p < total; i += 4, p++) {
      gray[p] = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114 + 500) / 1000;
    }

    const bg = mode === 'adaptive'
      ? fastBoxBlur(gray, w, h, Math.max(4, Math.min(90, radius)))
      : null;
    const adaptiveOffset = (255 - threshold) * 0.12;

    for (let p = 0; p < total; p++) {
      const i = p * 4;
      let r, g, b;
      if (mode === 'bw' || mode === 'adaptive') {
        const t = mode === 'bw'
          ? threshold - brightness
          : Math.max(bg[p], 1) - adaptiveOffset;
        const v = gray[p] > t ? 255 : 0;
        r = g = b = v;
      } else if (mode === 'gray') {
        r = g = b = gray[p];
      } else {
        r = src[i];
        g = src[i + 1];
        b = src[i + 2];
      }

      if (mode !== 'bw' && mode !== 'adaptive') {
        if (contrast !== 1) {
          r = (r - 128) * contrast + 128;
          g = (g - 128) * contrast + 128;
          b = (b - 128) * contrast + 128;
        }
        if (brightness) { r += brightness; g += brightness; b += brightness; }
      }

      dst[i] = clamp255(r);
      dst[i + 1] = clamp255(g);
      dst[i + 2] = clamp255(b);
      dst[i + 3] = src[i + 3];
    }

    octx.putImageData(imageData, 0, 0);
    return out;
  }

  /* 把任意图片源按 maxDim 限幅绘制到离屏画布，避免移动端 Canvas 内存崩溃 */
  function drawCapped(img, maxDim) {
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    const cap = maxDim || 2500;
    if (w > cap || h > cap) {
      const r = Math.min(cap / w, cap / h);
      w = Math.round(w * r);
      h = Math.round(h * r);
    }
    const c = document.createElement('canvas');
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function fromUrl(url, maxDim) {
    return new Promise((resolve, reject) => {
      if (!url) { reject(new Error('empty url')); return; }
      const img = new Image();
      img.onload = () => { try { resolve(drawCapped(img, maxDim)); } catch (e) { reject(e); } };
      img.onerror = () => reject(new Error('decode failed'));
      img.src = url;
    });
  }

  function fromFile(file, maxDim) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type || '')) { reject(new Error('not image')); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = e => fromUrl(e.target.result, maxDim).then(resolve, reject);
      reader.readAsDataURL(file);
    });
  }

  return { fastBoxBlur, applyTone, drawCapped, fromUrl, fromFile };
});
