/*
 * 四点裁剪 / 透视矫正（零依赖）
 * 浏览器：window.PerspectiveCrop；CommonJS：module.exports（便于离线验证数学部分）
 *
 * 两种矫正方式：
 *   perspective —— 单应逆映射把任意凸四边形拉正成矩形（默认，扫描场景）
 *   mask        —— 只保留四边形内像素，外接矩形其余区域补白
 * 两种方式都输出白底、比例可选的标准长方形画布。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PerspectiveCrop = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const ASPECTS = {
    auto: null,
    a4: 210 / 297,
    'a4-landscape': 297 / 210,
    letter: 8.5 / 11,
    'letter-landscape': 11 / 8.5,
    square: 1,
    '4:3': 4 / 3,
    '3:4': 3 / 4
  };

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const cloneQuad = q => q.map(p => ({ x: p.x, y: p.y }));

  function aspectRatio(aspect) {
    if (typeof aspect === 'number' && aspect > 0) return aspect;
    return ASPECTS[aspect] || null;
  }

  function defaultQuad(w, h) {
    const m = Math.min(w, h) * 0.06;
    return [
      { x: m, y: m }, { x: w - m, y: m },
      { x: w - m, y: h - m }, { x: m, y: h - m }
    ];
  }

  function normalizeQuad(q, w, h) {
    if (!Array.isArray(q) || q.length !== 4 ||
        q.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
      return defaultQuad(w, h);
    }
    return q.map(p => ({ x: clamp(p.x, 0, w), y: clamp(p.y, 0, h) }));
  }

  /* 凸性 + 三点共线防护：用相邻边夹角的 sin 值判定，避免退化成三角形 */
  function isConvex(q) {
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
      const ux = b.x - a.x, uy = b.y - a.y;
      const vx = c.x - b.x, vy = c.y - b.y;
      const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (lu < 1e-6 || lv < 1e-6) return false;
      const sin = (ux * vy - uy * vx) / (lu * lv);
      if (Math.abs(sin) < 0.02) return false;
      const s = sin > 0 ? 1 : -1;
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
    return true;
  }

  function minSide(q) {
    let m = Infinity;
    for (let i = 0; i < 4; i++) {
      const a = q[i], b = q[(i + 1) % 4];
      m = Math.min(m, Math.hypot(b.x - a.x, b.y - a.y));
    }
    return m;
  }

  /* 直角模式：把四点约束成轴对齐矩形，边只能沿自身法向拖动 */
  function rectFromQuad(q) {
    const xs = q.map(p => p.x), ys = q.map(p => p.y);
    return {
      x0: Math.min(...xs), y0: Math.min(...ys),
      x1: Math.max(...xs), y1: Math.max(...ys)
    };
  }

  function quadFromRect(r) {
    return [
      { x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 },
      { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }
    ];
  }

  function safeRect(r, sw, sh, m) {
    const x0 = clamp(r.x0, 0, sw - m);
    const y0 = clamp(r.y0, 0, sh - m);
    return {
      x0, y0,
      x1: clamp(r.x1, x0 + m, sw),
      y1: clamp(r.y1, y0 + m, sh)
    };
  }

  function rectValid(r, sw, sh, m) {
    return r.x0 >= 0 && r.y0 >= 0 && r.x1 <= sw && r.y1 <= sh &&
           r.x1 - r.x0 >= m && r.y1 - r.y0 >= m;
  }

  /* 边序号：0=上(竖向拖) 1=右(横向拖) 2=下(竖向拖) 3=左(横向拖) */
  function moveRectEdge(r, i, x, y, sw, sh, m) {
    const n = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
    if (i === 0) n.y0 = clamp(y, 0, n.y1 - m);
    else if (i === 2) n.y1 = clamp(y, n.y0 + m, sh);
    else if (i === 3) n.x0 = clamp(x, 0, n.x1 - m);
    else if (i === 1) n.x1 = clamp(x, n.x0 + m, sw);
    return n;
  }

  /* 直角模式下拖角：只改对应的两条边，矩形约束不变 */
  function moveRectCorner(r, i, x, y, sw, sh, m) {
    const n = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
    if (i === 0 || i === 3) n.x0 = clamp(x, 0, n.x1 - m);
    if (i === 1 || i === 2) n.x1 = clamp(x, n.x0 + m, sw);
    if (i === 0 || i === 1) n.y0 = clamp(y, 0, n.y1 - m);
    if (i === 2 || i === 3) n.y1 = clamp(y, n.y0 + m, sh);
    return n;
  }

  /* 四对点 -> 8x8 线性方程组 -> 高斯消元，解 src→dst 的单应系数（h33 = 1） */
  function solveHomography(src, dst) {
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
      b.push(u, v);
    }
    const n = 8;
    for (let col = 0; col < n; col++) {
      let pivot = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
      }
      if (Math.abs(A[pivot][col]) < 1e-12) return null;
      if (pivot !== col) {
        const t = A[pivot]; A[pivot] = A[col]; A[col] = t;
        const tb = b[pivot]; b[pivot] = b[col]; b[col] = tb;
      }
      for (let r = col + 1; r < n; r++) {
        const f = A[r][col] / A[col][col];
        if (f === 0) continue;
        for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
        b[r] -= f * b[col];
      }
    }
    const h = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i];
      for (let j = i + 1; j < n; j++) s -= A[i][j] * h[j];
      h[i] = s / A[i][i];
    }
    return h.every(Number.isFinite) ? h : null;
  }

  function outputSize(quad, opts) {
    const o = opts || {};
    const d = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
    let w, h;
    if (o.mode === 'mask') {
      const xs = quad.map(p => p.x), ys = quad.map(p => p.y);
      w = Math.max(...xs) - Math.min(...xs);
      h = Math.max(...ys) - Math.min(...ys);
    } else {
      w = Math.max(d(quad[0], quad[1]), d(quad[2], quad[3]));
      h = Math.max(d(quad[1], quad[2]), d(quad[3], quad[0]));
    }
    const r = aspectRatio(o.aspect);
    if (r) {
      const area = Math.max(1, w * h);
      w = Math.sqrt(area * r);
      h = Math.sqrt(area / r);
    }
    const cap = o.maxDim || 2500;
    const k = Math.min(1, cap / Math.max(w, h, 1));
    return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) };
  }

  function parseBackground(bg) {
    if (Array.isArray(bg) && bg.length >= 3) return [bg[0], bg[1], bg[2], 255];
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(bg || '#ffffff').trim());
    if (m) {
      let s = m[1];
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), 255];
    }
    return [255, 255, 255, 255];
  }

  function makeWarpContext(src, quad, opts) {
    const o = opts || {};
    if (!isConvex(quad)) throw new Error('四点必须是凸四边形且不能三点共线');
    const { width: W, height: H } = outputSize(quad, o);
    const sw = src.width, sh = src.height;
    const mask = o.mode === 'mask';
    // 直接解「输出矩形 -> 源四边形」的逆映射，省掉 3x3 求逆
    const h = mask ? null : solveHomography(
      [[0, 0], [W, 0], [W, H], [0, H]],
      quad.map(p => [p.x, p.y])
    );
    if (!mask && !h) throw new Error('四点退化，无法求解透视变换');

    let minX = 0, minY = 0, bboxW = sw, bboxH = sh, k = 1, offX = 0, offY = 0;
    if (mask) {
      const xs = quad.map(p => p.x), ys = quad.map(p => p.y);
      minX = Math.min(...xs); minY = Math.min(...ys);
      bboxW = Math.max(1, Math.max(...xs) - minX);
      bboxH = Math.max(1, Math.max(...ys) - minY);
      k = Math.min(W / bboxW, H / bboxH);
      offX = (W - bboxW * k) / 2;
      offY = (H - bboxH * k) / 2;
    }

    return {
      W, H, sw, sh, sdata: src.data, h, mask,
      bg: parseBackground(o.background),
      out: new Uint8ClampedArray(W * H * 4),
      eps: mask ? 0 : 1.5,
      edges: quad.map((a, i) => {
        const b = quad[(i + 1) % 4];
        return {
          ax: a.x, ay: a.y, ex: b.x - a.x, ey: b.y - a.y,
          len: Math.hypot(b.x - a.x, b.y - a.y) || 1
        };
      }),
      minX, minY, k, offX, offY
    };
  }

  function renderRows(ctx, from, to) {
    const { W, sw, sh, sdata, h, mask, bg, out, eps, edges, minX, minY, k, offX, offY } = ctx;
    for (let v = from; v < to; v++) {
      const vv = v + 0.5;
      for (let u = 0; u < W; u++) {
        const uu = u + 0.5;
        const di = (v * W + u) * 4;
        let sx, sy;
        if (mask) {
          sx = minX + (uu - offX) / k - 0.5;
          sy = minY + (vv - offY) / k - 0.5;
        } else {
          const den = h[6] * uu + h[7] * vv + 1;
          sx = (h[0] * uu + h[1] * vv + h[2]) / den - 0.5;
          sy = (h[3] * uu + h[4] * vv + h[5]) / den - 0.5;
        }

        let ok = Number.isFinite(sx) && Number.isFinite(sy) &&
                 sx > -1 && sy > -1 && sx < sw && sy < sh;
        if (ok) {
          let pos = false, neg = false;
          for (let e = 0; e < 4; e++) {
            const ed = edges[e];
            const cross = ed.ex * (sy - ed.ay) - ed.ey * (sx - ed.ax);
            if (cross > ed.len * eps) pos = true;
            else if (cross < -ed.len * eps) neg = true;
            if (pos && neg) { ok = false; break; }
          }
        }
        if (!ok) {
          out[di] = bg[0]; out[di + 1] = bg[1]; out[di + 2] = bg[2]; out[di + 3] = 255;
          continue;
        }

        const x0 = clamp(Math.floor(sx), 0, sw - 1);
        const y0 = clamp(Math.floor(sy), 0, sh - 1);
        const x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1);
        const fx = clamp(sx - x0, 0, 1), fy = clamp(sy - y0, 0, 1);
        const fx1 = 1 - fx, fy1 = 1 - fy;
        const i00 = (y0 * sw + x0) * 4, i10 = (y0 * sw + x1) * 4;
        const i01 = (y1 * sw + x0) * 4, i11 = (y1 * sw + x1) * 4;
        const w00 = fx1 * fy1, w10 = fx * fy1, w01 = fx1 * fy, w11 = fx * fy;
        for (let c = 0; c < 3; c++) {
          out[di + c] = sdata[i00 + c] * w00 + sdata[i10 + c] * w10 +
                        sdata[i01 + c] * w01 + sdata[i11 + c] * w11 + 0.5;
        }
        out[di + 3] = 255;
      }
    }
  }

  function warpImageData(src, quad, opts) {
    const ctx = makeWarpContext(src, quad, opts);
    renderRows(ctx, 0, ctx.H);
    return { width: ctx.W, height: ctx.H, data: ctx.out };
  }

  async function warpImageDataAsync(src, quad, opts) {
    const ctx = makeWarpContext(src, quad, opts);
    const chunk = 64;
    for (let y = 0; y < ctx.H; y += chunk) {
      renderRows(ctx, y, Math.min(ctx.H, y + chunk));
      if (y + chunk < ctx.H) await new Promise(resolve => setTimeout(resolve, 0));
    }
    return { width: ctx.W, height: ctx.H, data: ctx.out };
  }

  function toImageData(source) {
    if (source && source.data && typeof source.width === 'number') return source;
    if (typeof source.getContext === 'function') {
      return source.getContext('2d', { willReadFrequently: true })
        .getImageData(0, 0, source.width, source.height);
    }
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(source, 0, 0);
    return cx.getImageData(0, 0, w, h);
  }

  function toCanvas(res, opts) {
    const c = document.createElement('canvas');
    c.width = res.width; c.height = res.height;
    const cx = c.getContext('2d');
    cx.fillStyle = (opts && opts.background) || '#ffffff';
    cx.fillRect(0, 0, res.width, res.height);
    if (typeof ImageData === 'function') {
      cx.putImageData(new ImageData(res.data, res.width, res.height), 0, 0);
    } else {
      const im = cx.createImageData(res.width, res.height);
      im.data.set(res.data);
      cx.putImageData(im, 0, 0);
    }
    return c;
  }

  function warp(source, quad, opts) {
    return toCanvas(warpImageData(toImageData(source), quad, opts), opts);
  }

  async function warpAsync(source, quad, opts) {
    const res = await warpImageDataAsync(toImageData(source), quad, opts);
    return toCanvas(res, opts);
  }

  /* ================= 四点拖拽编辑器 ================= */

  const CSS = `
.pc-root{position:fixed;top:0;left:0;right:0;height:100vh;height:100dvh;z-index:100;display:flex;flex-direction:column;background:var(--panel,#fff);color:var(--text2,#334155);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:12px;user-select:none;-webkit-user-select:none}
.pc-root *{box-sizing:border-box}
.pc-hd{height:52px;flex:none;display:flex;align-items:center;gap:8px;padding:0 12px;border-bottom:1px solid var(--line,#e2e8f0);background:var(--hd-bg,#fff)}
.pc-hd .btn{flex:none}
.pc-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;text-align:center;line-height:1.3}
.pc-title b{color:var(--heading,#0f172a);font-size:13px}
.pc-title span{color:var(--muted,#64748b);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pc-main{flex:1;min-height:0;display:flex;flex-direction:row}
.pc-stage{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;background:var(--surface,#f1f5f9);touch-action:none}
.pc-canvas{position:absolute;inset:0;display:block}
.pc-handle{position:absolute;width:20px;height:20px;padding:0;margin:0;border:2px solid #fff;border-radius:50%;background:#2563eb;box-shadow:0 2px 8px rgba(0,0,0,.45);transform:translate(-50%,-50%);cursor:grab;touch-action:none;z-index:2}
.pc-handle::after{content:"";position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%);border-radius:50%}
.pc-handle.is-selected{box-shadow:0 0 0 4px rgba(37,99,235,.35),0 2px 8px rgba(0,0,0,.45)}
.pc-handle.is-active{cursor:grabbing;background:#e11d48;transform:translate(-50%,-50%) scale(1.25)}
.pc-edge{position:absolute;display:none;padding:0;margin:0;border:2px solid #fff;border-radius:6px;background:#2563eb;box-shadow:0 2px 8px rgba(0,0,0,.45);transform:translate(-50%,-50%);touch-action:none;z-index:2}
.pc-edge::after{content:"";position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%);border-radius:50%}
.pc-edge.h{width:30px;height:9px;cursor:ns-resize}
.pc-edge.v{width:9px;height:30px;cursor:ew-resize}
.pc-edge.show{display:block}
.pc-edge.is-active{background:#e11d48}
.pc-ft .btn.is-on{background:var(--accent-soft,rgba(37,99,235,.12));border-color:var(--accent-line2,rgba(37,99,235,.4));color:var(--accent4,#1d4ed8);font-weight:600}
.pc-mag{position:absolute;right:10px;top:10px;width:110px;height:110px;display:none;border:2px solid #fff;border-radius:50%;box-shadow:0 6px 20px rgba(0,0,0,.4);z-index:3;pointer-events:none;overflow:hidden}
.pc-mag canvas{width:110px;height:110px;display:block;border-radius:50%}
.pc-mag.show{display:block}
.pc-side{flex:none;width:480px;display:flex;flex-direction:column;border-left:1px solid var(--line,#e2e8f0);background:var(--panel,#fff)}
.pc-side-hd{height:32px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 10px;border-bottom:1px solid var(--line,#e2e8f0);color:var(--muted,#64748b);font-size:11px}
.pc-preview-box{position:relative;flex:1;min-height:0;overflow:hidden}
.pc-preview{position:absolute;inset:0;width:100%;height:100%;display:block}
.pc-ft{flex:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:4px 12px;padding-bottom:calc(8px + env(safe-area-inset-bottom, 0px));border-top:1px solid var(--line,#e2e8f0);background:var(--tabs-bg,#fff)}
.pc-ft label{display:flex;align-items:center;gap:4px;color:var(--muted,#64748b);font-size:11px}
.pc-ft select{padding:5px 4px;border:1px solid var(--line2,#cbd5e1);border-radius:8px;background:var(--surface,#f1f5f9);color:var(--text2,#334155);font-size:11px;outline:none}
.pc-ft .pc-grow{flex:1}
.pc-hint{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);padding:4px 10px;border:1px solid var(--float-line,#cbd5e1);border-radius:999px;background:var(--float-bg,#fff);color:var(--muted,#64748b);font-size:11px;white-space:nowrap;pointer-events:none}
@media(max-width:700px){.pc-main{flex-direction:column}.pc-side{width:auto;height:32%;min-height:140px;border-left:0;border-top:1px solid var(--line,#e2e8f0)}.pc-hd{height:48px}.pc-ft{gap:6px}}
@media print{.pc-root{display:none!important}}
`;

  let stylesInjected = false;
  function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    stylesInjected = true;
  }

  function edit(opts) {
    injectStyles();
    const o = opts || {};
    if (!o.source) return Promise.resolve(null);

    const sw = o.source.width || o.source.naturalWidth;
    const sh = o.source.height || o.source.naturalHeight;
    let sourceEl = o.source;
    if (o.source.data && typeof o.source.width === 'number') {
      const c = document.createElement('canvas');
      c.width = sw; c.height = sh;
      c.getContext('2d').putImageData(new ImageData(o.source.data, sw, sh), 0, 0);
      sourceEl = c;
    }
    const srcImage = toImageData(o.source);

    let quad = normalizeQuad(o.quad, sw, sh);
    if (!isConvex(quad) || minSide(quad) < Math.min(sw, sh) * 0.03) quad = defaultQuad(sw, sh);
    let mode = o.mode === 'mask' ? 'mask' : 'perspective';
    let aspect = (ASPECTS[o.aspect] !== undefined || typeof o.aspect === 'number') ? o.aspect : 'auto';
    let rectMode = !!o.rect;
    let magEnabled = !!o.mag;
    let active = -1, activeEdge = -1, selected = 0, settled = false, timer = null;
    const edgeGrab = { x: 0, y: 0 };
    const minSidePx = Math.min(sw, sh) * 0.03;

    return new Promise(resolve => {
      const root = document.createElement('div');
      root.className = 'pc-root';
      root.innerHTML = `
        <div class="pc-hd">
          <button class="btn btn-ghost pc-cancel">✖ 取消</button>
          <div class="pc-title"><b>四点裁剪</b><span>拖动四个圆点框住文档边缘，右侧实时预览矫正结果</span></div>
          <button class="btn btn-primary pc-apply">✓ 应用</button>
        </div>
        <div class="pc-main">
          <div class="pc-stage">
            <canvas class="pc-canvas"></canvas>
            <div class="pc-mag"><canvas width="110" height="110"></canvas></div>
          </div>
          <div class="pc-side">
            <div class="pc-side-hd"><span>矫正预览（白底 · 标准长方形）</span></div>
            <div class="pc-preview-box"><canvas class="pc-preview"></canvas></div>
          </div>
        </div>
        <div class="pc-ft">
          <label><select class="pc-mode">
            <option value="perspective">透视拉正</option>
            <option value="mask">仅裁剪补白</option>
          </select></label>
          <label><select class="pc-aspect">
            <option value="auto">自动比例</option>
            <option value="a4">A4 竖版</option>
            <option value="a4-landscape">A4 横版</option>
            <option value="letter">Letter 竖版</option>
            <option value="square">正方形</option>
            <option value="4:3">4:3</option>
            <option value="3:4">3:4</option>
          </select></label>
          <button class="btn btn-ghost pc-rect" title="直角模式：四点吸附为轴对齐矩形，四条边可沿法向拖动">▣ 直角</button>
          <button class="btn btn-ghost pc-mag-toggle" title="开启后，拖动角点时显示圆形放大详情">🔍 放大</button>
          <span class="pc-grow"></span>
          <button class="btn btn-ghost pc-reset">↺ 重置四角</button>
          <button class="btn btn-ghost pc-restore">撤销裁剪</button>
        </div>`;
      document.body.appendChild(root);

      const stage = root.querySelector('.pc-stage');
      const canvas = root.querySelector('.pc-canvas');
      const ctx = canvas.getContext('2d');
      const mag = root.querySelector('.pc-mag');
      const mctx = mag.querySelector('canvas').getContext('2d');
      const previewCanvas = root.querySelector('.pc-preview');
      const pctx = previewCanvas.getContext('2d');
      const tmp = document.createElement('canvas');
      const tctx = tmp.getContext('2d');
      const handles = [];
      const holder = document.createElement('div');
      stage.appendChild(holder);
      for (let i = 0; i < 4; i++) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'pc-handle' + (i === selected ? ' is-selected' : '');
        el.setAttribute('aria-label', ['左上角', '右上角', '右下角', '左下角'][i]);
        holder.appendChild(el);
        handles.push(el);
      }
      const edgeHandles = [];
      for (let i = 0; i < 4; i++) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'pc-edge ' + (i === 0 || i === 2 ? 'h' : 'v');
        el.setAttribute('aria-label', ['上边', '右边', '下边', '左边'][i]);
        holder.appendChild(el);
        edgeHandles.push(el);
      }

      let scale = 1, ox = 0, oy = 0, lastW = 0, lastH = 0;

      function draw() {
        const cw = stage.clientWidth, ch = stage.clientHeight;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(sourceEl, ox, oy, sw * scale, sh * scale);
        const pts = quad.map(p => ({ x: ox + p.x * scale, y: oy + p.y * scale }));

        ctx.save();
        ctx.fillStyle = 'rgba(15,23,42,.5)';
        ctx.beginPath();
        ctx.rect(0, 0, cw, ch);
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.fill('evenodd');
        ctx.restore();

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.stroke();

        handles.forEach((el, i) => {
          el.style.left = pts[i].x + 'px';
          el.style.top = pts[i].y + 'px';
        });
        edgeHandles.forEach((el, i) => {
          const a = pts[i], b = pts[(i + 1) % 4];
          el.style.left = (a.x + b.x) / 2 + 'px';
          el.style.top = (a.y + b.y) / 2 + 'px';
        });
      }

      function drawMag() {
        if (active < 0 || !magEnabled) { mag.classList.remove('show'); return; }
        const p = quad[active];
        const half = 110 / 6;
        mctx.fillStyle = '#ffffff';
        mctx.fillRect(0, 0, 110, 110);
        mctx.drawImage(sourceEl, p.x - half, p.y - half, half * 2, half * 2, 0, 0, 110, 110);
        mctx.strokeStyle = 'rgba(225,29,72,.9)';
        mctx.lineWidth = 1;
        mctx.beginPath();
        mctx.moveTo(55, 44); mctx.lineTo(55, 66);
        mctx.moveTo(44, 55); mctx.lineTo(66, 55);
        mctx.stroke();
        mag.classList.add('show');
      }

      function updatePreview() {
        let res;
        try {
          res = warpImageData(srcImage, quad, { mode, aspect, maxDim: 640, background: '#ffffff' });
        } catch (err) {
          return;
        }
        tmp.width = res.width; tmp.height = res.height;
        const im = tctx.createImageData(res.width, res.height);
        im.data.set(res.data);
        tctx.putImageData(im, 0, 0);
        const cw = Math.max(1, previewCanvas.clientWidth);
        const ch = Math.max(1, previewCanvas.clientHeight);
        const dpr = window.devicePixelRatio || 1;
        previewCanvas.width = Math.round(cw * dpr);
        previewCanvas.height = Math.round(ch * dpr);
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pctx.fillStyle = '#e2e8f0';
        pctx.fillRect(0, 0, cw, ch);
        const k = Math.min(cw / res.width, ch / res.height);
        const w = res.width * k, h = res.height * k;
        pctx.drawImage(tmp, (cw - w) / 2, (ch - h) / 2, w, h);
      }

      function schedulePreview(delay) {
        clearTimeout(timer);
        timer = setTimeout(updatePreview, delay === undefined ? 120 : delay);
      }

      function layout() {
        const cw = stage.clientWidth, ch = stage.clientHeight;
        if (cw === lastW && ch === lastH) return;
        lastW = cw; lastH = ch;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(cw * dpr));
        canvas.height = Math.max(1, Math.round(ch * dpr));
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min((cw - 16) / sw, (ch - 16) / sh);
        ox = (cw - sw * scale) / 2;
        oy = (ch - sh * scale) / 2;
        draw();
        updatePreview();
      }

      function moveCorner(i, x, y) {
        let test;
        if (rectMode) {
          const r = moveRectCorner(rectFromQuad(quad), i, x, y, sw, sh, minSidePx);
          if (!rectValid(r, sw, sh, minSidePx)) return false;
          test = quadFromRect(r);
        } else {
          test = cloneQuad(quad);
          test[i] = { x: clamp(x, 0, sw), y: clamp(y, 0, sh) };
        }
        if (!isConvex(test) || minSide(test) < minSidePx) return false;
        quad = test;
        return true;
      }

      function moveEdge(i, x, y) {
        const r = moveRectEdge(rectFromQuad(quad), i, x, y, sw, sh, minSidePx);
        if (!rectValid(r, sw, sh, minSidePx)) return false;
        const test = quadFromRect(r);
        if (!isConvex(test) || minSide(test) < minSidePx) return false;
        quad = test;
        return true;
      }

      function setRectMode(on) {
        rectMode = on;
        const btn = root.querySelector('.pc-rect');
        btn.classList.toggle('is-on', rectMode);
        btn.textContent = rectMode ? '▣ 直角 · 开' : '▣ 直角';
        edgeHandles.forEach(el => el.classList.toggle('show', rectMode));
        if (rectMode) quad = quadFromRect(safeRect(rectFromQuad(quad), sw, sh, minSidePx));
        // root.querySelector('.pc-hint-text').textContent = rectMode
        //   ? '拖上/下边竖向、左/右边横向 · 拖角自动保持直角'
        //   : '拖动四个圆点框住文档边缘 · 开启「直角」可拖边';
        // root.querySelector('.pc-title span').textContent = rectMode
        //   ? '直角模式：四点吸附为矩形，拖边即可微调裁剪范围'
        //   : '拖动四个圆点框住文档边缘，右侧实时预览矫正结果';
        draw();
        updatePreview();
      }

      function setMagEnabled(on) {
        magEnabled = on;
        const btn = root.querySelector('.pc-mag-toggle');
        btn.classList.toggle('is-on', magEnabled);
        btn.textContent = magEnabled ? '🔍 放大 · 开' : '🔍 放大';
        if (!magEnabled) mag.classList.remove('show');
        else if (active >= 0) drawMag();
      }

      function select(i) {
        selected = i;
        handles.forEach((el, n) => el.classList.toggle('is-selected', n === i));
      }

      handles.forEach((el, i) => {
        el.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          activeEdge = -1; active = i; select(i);
          try { el.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
          el.classList.add('is-active');
          drawMag();
        });
        el.addEventListener('pointermove', e => {
          if (active !== i) return;
          const r = canvas.getBoundingClientRect();
          if (moveCorner(i, (e.clientX - r.left - ox) / scale, (e.clientY - r.top - oy) / scale)) {
            draw(); drawMag(); schedulePreview();
          }
        });
        const release = e => {
          if (active !== i) return;
          try { el.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
          el.classList.remove('is-active');
          active = -1;
          mag.classList.remove('show');
          schedulePreview(0);
        };
        el.addEventListener('pointerup', release);
        el.addEventListener('pointercancel', release);
      });

      edgeHandles.forEach((el, i) => {
        el.addEventListener('pointerdown', e => {
          if (!rectMode) return;
          e.preventDefault(); e.stopPropagation();
          active = -1; activeEdge = i;
          mag.classList.remove('show');
          const r = canvas.getBoundingClientRect();
          const a = quad[i], b = quad[(i + 1) % 4];
          edgeGrab.x = (e.clientX - r.left - ox) / scale - (a.x + b.x) / 2;
          edgeGrab.y = (e.clientY - r.top - oy) / scale - (a.y + b.y) / 2;
          try { el.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
          el.classList.add('is-active');
        });
        el.addEventListener('pointermove', e => {
          if (activeEdge !== i) return;
          const r = canvas.getBoundingClientRect();
          const x = (e.clientX - r.left - ox) / scale - edgeGrab.x;
          const y = (e.clientY - r.top - oy) / scale - edgeGrab.y;
          if (moveEdge(i, x, y)) { draw(); schedulePreview(); }
        });
        const release = e => {
          if (activeEdge !== i) return;
          try { el.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
          el.classList.remove('is-active');
          activeEdge = -1;
          schedulePreview(0);
        };
        el.addEventListener('pointerup', release);
        el.addEventListener('pointercancel', release);
      });

      function nudge(dx, dy) {
        if (moveCorner(selected, quad[selected].x + dx, quad[selected].y + dy)) {
          draw(); schedulePreview(60);
        }
      }

      function result() {
        return { quad: cloneQuad(quad), mode, aspect, rect: rectMode, mag: magEnabled };
      }

      function finish(value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        document.removeEventListener('keydown', onKey);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', onResize);
        root.remove();
        resolve(value);
      }

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); finish(null); return; }
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        if (e.key === 'Enter') { e.preventDefault(); finish(result()); return; }
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -1;
        else if (e.key === 'ArrowRight') dx = 1;
        else if (e.key === 'ArrowUp') dy = -1;
        else if (e.key === 'ArrowDown') dy = 1;
        else return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        nudge(dx * step, dy * step);
      }

      root.querySelector('.pc-cancel').addEventListener('click', () => finish(null));
      root.querySelector('.pc-apply').addEventListener('click', () => finish(result()));
      root.querySelector('.pc-reset').addEventListener('click', () => {
        quad = defaultQuad(sw, sh);
        draw(); updatePreview();
      });
      root.querySelector('.pc-restore').addEventListener('click', () => finish({ restore: true }));
      root.querySelector('.pc-rect').addEventListener('click', () => setRectMode(!rectMode));
      root.querySelector('.pc-mag-toggle').addEventListener('click', () => setMagEnabled(!magEnabled));

      const modeSel = root.querySelector('.pc-mode');
      const aspectSel = root.querySelector('.pc-aspect');
      modeSel.value = mode;
      aspectSel.value = String(aspect);
      if (aspectSel.value !== String(aspect)) aspect = 'auto';
      modeSel.addEventListener('change', () => { mode = modeSel.value; updatePreview(); });
      aspectSel.addEventListener('change', () => {
        aspect = aspectSel.value;
        updatePreview();
      });

      document.addEventListener('keydown', onKey);
      const onResize = () => layout();
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
      if (ro) ro.observe(stage);
      else window.addEventListener('resize', onResize);
      layout();
      setRectMode(rectMode);
      setMagEnabled(magEnabled);
    });
  }

  return {
    ASPECTS, solveHomography, outputSize, defaultQuad, normalizeQuad,
    isConvex, minSide, rectFromQuad, quadFromRect, safeRect, rectValid,
    moveRectEdge, moveRectCorner,
    warpImageData, warpImageDataAsync, warp, warpAsync, edit
  };
});
