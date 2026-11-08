/* 光速跃迁 — GitHub 加速站 · 零依赖纯前端 */
(() => {
  'use strict';

  /* ---------- 1. 加速站配置：只需维护这一处 ---------- */
  // name: 卡片显示名；prefix: 拼在原始链接前的地址；local: 本机中转，单独探测服务是否在线。
  const GIT_PROXIES = [
    { name: "local", prefix: "http://127.0.0.1:6688/", local: true },
    { name: "gh-proxy", prefix: "https://gh-proxy.org/" },
    { name: "cdn.gh-proxy", prefix: "https://cdn.gh-proxy.org/" },
    { name: "x.199311.xyz", prefix: "https://x.199311.xyz/" },
    { name: "vvvv.ee", prefix: "https://proxy.vvvv.ee/" },
    { name: "hubproxy", prefix: "https://hubproxy.739999.xyz/" },
    { name: "gh.dpik.top", prefix: "https://gh.dpik.top/" },
    { name: "github.tbap.top", prefix: "https://github.tbap.top/" },
    { name: "ghfile.geekertao.top", prefix: "https://ghfile.geekertao.top/" },
    { name: "ghproxy.net", prefix: "https://ghproxy.net/" },
    { name: "gh-proxy.com", prefix: "https://gh-proxy.com/" },
    { name: "git.yylx.win", prefix: "https://git.yylx.win/" },
    { name: "ghm.078465.xyz", prefix: "https://ghm.078465.xyz/" },
    { name: "ghf.无名氏.top", prefix: "https://ghf.无名氏.top/" },
    { name: "cdn.akaere.online", prefix: "https://cdn.akaere.online/" },
    { name: "jiashu.1win.eu.org", prefix: "https://jiashu.1win.eu.org/" },
    { name: "tvv.tw", prefix: "https://tvv.tw/" },
    { name: "gh.inkchills.cn", prefix: "https://gh.inkchills.cn/" },
    { name: "down.mxw.xx.kg", prefix: "https://down.mxw.xx.kg/" },
    { name: "github.mxw.qzz.io", prefix: "https://github.mxw.qzz.io/" },
    { name: "gh.acmsz.top", prefix: "https://gh.acmsz.top/" },
    { name: "gh.jjj.gv.uy", prefix: "https://gh.jjj.gv.uy/" },
    { name: "gh.sixyin.com", prefix: "https://gh.sixyin.com/" },
    { name: "gh.monlor.com", prefix: "https://gh.monlor.com/" },
    { name: "ghpxy.hwinzniej.top", prefix: "https://ghpxy.hwinzniej.top/" },
    { name: "git.669966.xyz", prefix: "https://git.669966.xyz/" },
    { name: "ghfast.top", prefix: "https://ghfast.top/" },
    { name: "fastgit.cc", prefix: "https://fastgit.cc/" },
    { name: "github.ednovas.xyz", prefix: "https://github.ednovas.xyz/" },
    { name: "github.xxlab.tech", prefix: "https://github.xxlab.tech/" },
    { name: "gh.chjina.com", prefix: "https://gh.chjina.com/" },
    { name: "ghp.keleyaa.com", prefix: "https://ghp.keleyaa.com/" },
    { name: "proxy.yaoyaoling.net", prefix: "https://proxy.yaoyaoling.net/" },
    { name: "ghproxy.monkeyray.net", prefix: "https://ghproxy.monkeyray.net/" },
    { name: "g.blfrp.cn", prefix: "https://g.blfrp.cn/" },
    { name: "gh.meali.top", prefix: "https://gh.meali.top/" },
    { name: "gh.my-website.ccwu.cc", prefix: "https://gh.my-website.ccwu.cc/" },
    { name: "github.ikgy.top", prefix: "https://github.ikgy.top/" },
    { name: "gh.07150721.xyz", prefix: "https://gh.07150721.xyz/" },
    { name: "cfgh.ikgy.top", prefix: "https://cfgh.ikgy.top/" },
    { name: "xsadwsd.kdns.fr", prefix: "https://xsadwsd.kdns.fr/" },
    { name: "ghproxy.felicity.land", prefix: "https://ghproxy.felicity.land/" },
    { name: "gh.qfmc0721.cc.cd", prefix: "https://gh.qfmc0721.cc.cd/" },
    { name: "githubproxy.gohj99.site", prefix: "https://githubproxy.gohj99.site/" },
    { name: "ghproxy.icu", prefix: "https://ghproxy.icu/" }
  ];

  const CACHE_KEY = "neowarp-latency-v1";
  const SELECT_KEY = "neowarp-selected-node-v1";              // 用户手动选中的节点偏好
  const CACHE_TTL = 3 * 60 * 60 * 1000;                       // 测速结果缓存 3 小时
  const NODE_FINGERPRINT = GIT_PROXIES.map(p => p.name + p.prefix).join("|");

  function isGithubUrl(url) { return !!url; }

  function applyGitProxy(url, proxyName) {
    if (!url || !proxyName) return url;
    const proxy = GIT_PROXIES.find(p => p.name === proxyName);
    return proxy ? proxy.prefix + url : url;
  }

  const labelOf = name => name === "local" ? "本地中转" : name;

  /* ---------- 2. 延迟探测：no-cors 首字节计时，失败/超时返回 null ---------- */
  const PROBE_TARGET = "https://raw.githubusercontent.com/github/gitignore/main/LICENSE";
  const PROBE_TIMEOUT_MS = 5000;
  const LOCAL_TIMEOUT_MS = 2000;
  const CONCURRENCY = 12;

  async function probeProxyDelay(proxy, timeoutMs = proxy.local ? LOCAL_TIMEOUT_MS : PROBE_TIMEOUT_MS) {
    // 随机参数避免命中缓存；no-cors 下无法读状态码，测的是握手 + 首字节耗时。
    const bust = "?_warp=" + Date.now() + Math.random().toString(36).slice(2, 7);
    // 本地中转只探服务是否在线（根路径）；公网节点走 GitHub 小文件探整条链路。
    const url = proxy.local ? proxy.prefix + bust : proxy.prefix + PROBE_TARGET + bust;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const t0 = performance.now();
    try {
      await fetch(url, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        signal: ctrl.signal
      });
      return Math.max(1, Math.round(performance.now() - t0));
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
      try { ctrl.abort(); } catch {}   // 拿到首字节后中断，避免继续下载文件
    }
  }

  // 有限并发探测（含本地中转），每完成一个就回调一次，界面边扫边刷新。
  function probeAllProxyDelays(onResult, concurrency = CONCURRENCY) {
    const rows = [];
    let cursor = 0, done = 0;
    const total = GIT_PROXIES.length;
    const worker = async () => {
      while (cursor < total) {
        const p = GIT_PROXIES[cursor++];
        const delay = await probeProxyDelay(p);
        rows.push({ name: p.name, delay });
        done++;
        try { onResult?.(p.name, delay, done, total); } catch {}
      }
    };
    return Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker))
      .then(() => GIT_PROXIES.map(p => rows.find(r => r.name === p.name)));
  }

  /* ---------- 3. 状态与 DOM ---------- */
  const $ = id => document.getElementById(id);
  const dom = {
    nodes: $("nodes"), nodeMeta: $("nodeMeta"), fill: $("scanFill"),
    url: $("url"), chips: $("chips"), relay: $("relay"), out: $("out"),
    copy: $("copyBtn"), go: $("goBtn"), clear: $("clearBtn"), toast: $("toast"),
    rescan: $("rescanBtn"), theme: $("themeBtn"),
    online: $("statOnline"), best: $("statBest")
  };

  // 读取上次手动选中的节点；节点已从列表移除时忽略并清掉旧值。
  function readSelected() {
    try {
      const name = localStorage.getItem(SELECT_KEY);
      if (GIT_PROXIES.some(p => p.name === name)) return name;
      if (name) localStorage.removeItem(SELECT_KEY);
    } catch {}
    return null;
  }

  function writeSelected(name) {
    try { localStorage.setItem(SELECT_KEY, name); } catch {}
  }

  const savedNode = readSelected();
  const S = {
    selected: savedNode || (GIT_PROXIES.find(p => !p.local) || GIT_PROXIES[0]).name,
    auto: !savedNode,   // 有偏好时锁定该节点，自动优选不再覆盖
    scanning: false,
    link: "",
    results: new Map(),
    cards: new Map()
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 4. 测速缓存：3 小时内刷新直接读缓存，不再发请求 ---------- */
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (!c || typeof c.ts !== "number" || c.nodes !== NODE_FINGERPRINT || !c.data || typeof c.data !== "object") return null;
      const age = Date.now() - c.ts;
      if (age < 0 || age >= CACHE_TTL) return null;
      return { data: c.data, ts: c.ts, age };
    } catch { return null; }
  }

  function writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: Date.now(),
        nodes: NODE_FINGERPRINT,
        data: Object.fromEntries(S.results)
      }));
    } catch {}
  }

  /* ---------- 5. 节点矩阵 ---------- */
  function renderNodes() {
    S.cards.clear();
    dom.nodes.innerHTML = GIT_PROXIES.map(p => `
      <button type="button" class="node is-pending${S.selected === p.name ? " is-active" : ""}" data-name="${esc(p.name)}" style="order:${p.local ? 9999 : 0}" title="${esc(p.prefix)}">
        <div class="node-top"><i class="node-dot"></i><span class="node-name">${esc(labelOf(p.name))}</span><span class="node-ms">--</span><span class="node-unit">毫秒</span></div>
        <div class="node-bar"><div class="node-fill"></div></div>
      </button>`).join("");
    dom.nodes.querySelectorAll(".node").forEach(c => S.cards.set(c.dataset.name, c));
  }

  function updateNode(name, delay) {
    const card = S.cards.get(name);
    if (!card) return;
    const p = GIT_PROXIES.find(x => x.name === name);
    const ms = card.querySelector(".node-ms");
    const fill = card.querySelector(".node-fill");
    const dot = card.querySelector(".node-dot");
    card.classList.remove("is-pending", "is-slow", "is-dead");
    let tone = "is-bad";

    if (p.local) {
      if (delay == null) {
        ms.textContent = "--";
        card.classList.add("is-dead");
        fill.style.width = "3%";
        card.style.order = 9999;
      } else {
        // 本地中转能通 → 排第一位，并作为默认首选。
        ms.textContent = delay;
        tone = "is-ok";
        fill.style.width = "100%";
        card.style.order = -1;
      }
    } else if (delay == null) {
      ms.textContent = "--";
      card.classList.add("is-dead");
      fill.style.width = "3%";
      card.style.order = 9000;
    } else {
      ms.textContent = delay;
      fill.style.width = Math.max(8, Math.min(100, Math.round(100 - delay / 8))) + "%";
      card.style.order = delay;
      if (delay < 160) tone = "is-ok";
      else if (delay < 420) tone = "is-warn";
      else { tone = "is-warn"; card.classList.add("is-slow"); }
    }
    dot.className = "node-dot" + (tone ? " " + tone : "");
  }

  function markActive() {
    S.cards.forEach((card, name) => card.classList.toggle("is-active", name === S.selected));
  }

  // 本地中转能通时永远优先，否则取延迟最低的公网节点。
  function pickBest() {
    const localDelay = S.results.get("local");
    if (localDelay != null) return ["local", localDelay];
    return [...S.results.entries()].filter(([, d]) => d != null).sort((a, b) => a[1] - b[1])[0] || null;
  }

  function refreshStats(done, total) {
    const ok = [...S.results.values()].filter(d => d != null);
    dom.online.textContent = ok.length + " / " + total;
    dom.best.textContent = ok.length ? Math.min(...ok) + " 毫秒" : "--";
    dom.fill.style.width = Math.round(done / total * 100) + "%";
  }

  function onProbe(name, delay, done, total) {
    S.results.set(name, delay);
    updateNode(name, delay);
    refreshStats(done, total);
    dom.nodeMeta.textContent = `测速 ${done}/${total}`;
  }

  function applyResults(rows) {
    S.results.clear();
    renderNodes();
    for (const p of GIT_PROXIES) {
      const delay = rows[p.name] == null ? null : rows[p.name];
      S.results.set(p.name, delay);
      updateNode(p.name, delay);
    }
    refreshStats(GIT_PROXIES.length, GIT_PROXIES.length);
  }

  async function startScan(force = false) {
    if (S.scanning) return;

    // 非强制重测时，命中未过期缓存就直接渲染，一次网络请求都不发。
    if (!force) {
      const cached = readCache();
      if (cached) {
        applyResults(cached.data);
        const best = pickBest();
        if (S.auto && best) { S.selected = best[0]; markActive(); }
        const left = Math.max(0, CACHE_TTL - cached.age);
        const hh = Math.floor(left / 3600000);
        const mm = Math.floor(left % 3600000 / 60000);
        dom.nodeMeta.textContent = `缓存 · 剩 ${hh} 小时 ${mm} 分`;
        refreshOutput();
        toast(S.auto ? "已载入缓存 · 3 小时内不测速" : `已沿用 ${labelOf(S.selected)} · 缓存 3 小时`);
        return;
      }
    }

    S.scanning = true;
    S.results.clear();
    renderNodes();
    dom.rescan.disabled = true;
    dom.rescan.classList.add("is-spin");
    dom.online.textContent = "0 / " + GIT_PROXIES.length;
    dom.best.textContent = "--";
    dom.fill.style.width = "0%";
    dom.nodeMeta.textContent = `测速 0/${GIT_PROXIES.length}`;
    refreshOutput();
    await probeAllProxyDelays(onProbe);
    writeCache();

    const best = pickBest();
    if (S.auto && best) { S.selected = best[0]; markActive(); }
    dom.nodeMeta.textContent = best
      ? `已锁定 ${labelOf(S.selected)} · 缓存 3 小时`
      : "无可用节点 · 点 ↻ 重试";
    dom.rescan.disabled = false;
    dom.rescan.classList.remove("is-spin");
    S.scanning = false;
    refreshOutput();
    toast(best
      ? (S.auto ? "测速完成 · 已缓存 3 小时" : `已沿用 ${labelOf(S.selected)} · 已缓存 3 小时`)
      : "暂无可用节点");
  }

  /* ---------- 6. 链接生成与两个主操作 ---------- */
  function normalize(value) {
    let s = value.trim();
    if (!s) return "";
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
    return s;
  }

  function isValidUrl(value) {
    try {
      const u = new URL(value);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
    } catch { return false; }
  }

  function refreshOutput() {
    const raw = normalize(dom.url.value);
    const p = GIT_PROXIES.find(x => x.name === S.selected);
    dom.relay.textContent = p ? "加速链接 · " + labelOf(p.name) : "加速链接";
    let link = "", message = "等待输入链接…", error = false;
    if (raw && !isValidUrl(raw)) {
      message = "链接格式无效，请输入完整网址";
      error = true;
    } else if (raw && !p) {
      message = "请先选择一个加速站";
      error = true;
    } else if (raw) {
      link = applyGitProxy(raw, p.name);
      message = link;
    }
    S.link = link;
    dom.out.textContent = message;
    dom.out.classList.toggle("is-empty", !link && !error);
    dom.out.classList.toggle("is-error", error);
    dom.copy.disabled = !link;
    dom.go.disabled = !link;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch { return false; }
  }

  function openDownload() {
    if (!S.link) return;
    const win = window.open(S.link, "_blank");
    if (win) {
      try { win.opener = null; } catch {}
      toast("已在新窗口下载");
    } else {
      toast("弹窗被拦截，请复制链接");
    }
  }

  /* ---------- 7. 提示、主题 ---------- */
  let toastTimer;
  function toast(text) {
    dom.toast.textContent = text;
    dom.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 2400);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    dom.theme.textContent = theme === "dark" ? "☀️" : "🌙";
    dom.theme.title = theme === "dark" ? "切换到白天模式" : "切换到夜间模式";
    try { localStorage.setItem("neowarp-theme", theme); } catch {}
  }

  /* ---------- 8. 自写 Canvas 特效：粒子星座 + 鼠标引力场（无第三方库） ---------- */
  function initFX() {
    const canvas = $("fx");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, mx = -999, my = -999, dots = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.max(28, Math.round(w * h / 20000)));
      dots = Array.from({ length: count }, () => ({
        x: rand(0, w), y: rand(0, h),
        vx: rand(-.26, .26), vy: rand(-.26, .26), r: rand(.7, 1.9)
      }));
    }

    function frame() {
      const dark = document.documentElement.dataset.theme === "dark";
      const rgb = dark ? "120,190,255" : "20,90,200";
      const point = dark ? "rgba(150,220,255,.85)" : "rgba(20,90,200,.5)";
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -12) d.x = w + 12;
        if (d.x > w + 12) d.x = -12;
        if (d.y < -12) d.y = h + 12;
        if (d.y > h + 12) d.y = -12;
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y, dist2 = dx * dx + dy * dy;
          if (dist2 < 16900) {
            ctx.strokeStyle = `rgba(${rgb},${((1 - Math.sqrt(dist2) / 130) * .22).toFixed(3)})`;
            ctx.lineWidth = .6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        const dist = Math.hypot(d.x - mx, d.y - my);
        const near = dist < 150;
        ctx.fillStyle = near ? "rgba(0,191,168,.95)" : point;
        ctx.beginPath();
        ctx.arc(d.x, d.y, near ? d.r * 1.9 : d.r, 0, Math.PI * 2);
        ctx.fill();
        if (near) {
          ctx.strokeStyle = `rgba(${rgb},${((1 - dist / 150) * .38).toFixed(3)})`;
          ctx.lineWidth = .8;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener("pointerout", e => { if (!e.relatedTarget) { mx = -999; my = -999; } }, { passive: true });
    resize();
    requestAnimationFrame(frame);
  }

  /* ---------- 9. 事件绑定与启动 ---------- */
  function bind() {
    dom.nodes.addEventListener("click", e => {
      const card = e.target.closest(".node");
      if (!card) return;
      S.selected = card.dataset.name;
      S.auto = false;
      writeSelected(S.selected);
      markActive();
      refreshOutput();
      toast("已锁定 " + labelOf(S.selected));
    });

    dom.url.addEventListener("input", refreshOutput);
    dom.clear.addEventListener("click", () => {
      dom.url.value = "";
      refreshOutput();
      dom.url.focus();
    });
    dom.url.addEventListener("keydown", e => {
      if (e.key === "Enter" && S.link) openDownload();
    });

    dom.chips.addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      dom.url.value = chip.dataset.url;
      refreshOutput();
      dom.url.focus();
    });

    dom.copy.addEventListener("click", async () => {
      if (!S.link) return;
      const ok = await copyText(S.link);
      toast(ok ? "加速链接已复制" : "复制失败，请手动选择链接");
    });

    dom.go.addEventListener("click", openDownload);
    dom.rescan.addEventListener("click", () => startScan(true));   // 手动重测：忽略缓存
    dom.theme.addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem("neowarp-theme"); } catch {}
    setTheme(saved === "dark" ? "dark" : "light");   // 首次访问默认白天模式
    renderNodes();
    refreshOutput();
    bind();
    initFX();
    startScan();
  }

  init();
})();
