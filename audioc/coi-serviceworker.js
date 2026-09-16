/**
 * coi-serviceworker.js — 让「纯静态托管」的页面也拥有跨域隔离。
 *
 * 为什么需要它？
 *   ffmpeg-core.wasm 是多线程（pthreads）构建，FFmpeg 6.1 的 CLI 每条输入流都要
 *   pthread_create 一个解码线程，而 Emscripten 的线程依赖 SharedArrayBuffer。
 *   浏览器只在「跨域隔离」的页面里暴露 SharedArrayBuffer，判据说白了就是响应头：
 *     Cross-Origin-Opener-Policy: same-origin
 *     Cross-Origin-Embedder-Policy: require-corp
 *   dufs / 静态 nginx 默认配置 / GitHub Pages 这类托管都不给你改响应头的机会，
 *   于是用 Service Worker 把这两个头「补」到自己的响应上。
 *
 * 它怎么工作？
 *   页面侧：发现没有隔离 → 注册 SW → 自动刷新一次；
 *   SW 侧：拦截同源的 fetch，重新包一层 Response 并附上 COOP/COEP。
 *   刷新后文档本身就由 SW 响应，于是 crossOriginIsolated === true（可实测
 *   window.crossOriginIsolated 与 typeof SharedArrayBuffer）。
 *
 * 前提（满足不了就只能改服务器/换地址）：
 *   1. 安全上下文：https:// 或 http://localhost、http://127.0.0.1。
 *      局域网 http://192.168.x.x 既没有 Service Worker 也没有 SharedArrayBuffer。
 *   2. 页面没有被嵌在未隔离的 iframe 里（顶层页面也要隔离）。
 *   3. 与页面同目录部署（SW 默认作用域就是脚本所在目录）。
 *
 * 如果服务器本来就能配这两个头（nginx / CDN / 反向代理），请直接配，
 * 本脚本检测到已隔离会立即返回，不做任何多余动作。
 */
(function () {
  'use strict';

  // ============================================================
  //  页面侧
  // ============================================================
  if (typeof window !== 'undefined') {
    var swUrl = (document.currentScript && document.currentScript.src) || 'coi-serviceworker.js';
    // flag 名带版本：改逻辑时一起改，免得旧会话里留下的 flag 把新的自动刷新挡掉
    var RELOAD_FLAG = 'coi-serviceworker-reloaded-v3';
    window.__coiStatus = 'pending';
    // 诊断用：这次文档是不是由 SW 提供的（未隔离时页面会把这两项显示出来）
    window.__coiHasController = !!(navigator.serviceWorker && navigator.serviceWorker.controller);

    if (window.crossOriginIsolated) {
      // 隔离成功 → 把「已刷新过」的标记清掉。**这一步以前漏了，是"首次加载不自动刷新、
      // 非得手动 F5"的根因**：标记是 sessionStorage（按标签页会话），一旦置上就再没人清，
      // 于是同一标签页里后续任何「未隔离的文档加载」——Ctrl+F5 硬刷新绕过 SW、浏览器回收后
      // 刚唤醒 SW、SW 更新期间、从历史/书签恢复 —— 都会直接判定"刷过了"而放弃自动刷新。
      // 清掉之后：只要出现未隔离的加载就还能自动刷一次；防死循环靠"刷过一次仍不行就停手"。
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch (e) { /* 隐私模式 */ }
      window.__coiStatus = 'already-isolated';
      return;
    }
    if (!('serviceWorker' in navigator)) {
      window.__coiStatus = 'no-service-worker';
      return;
    }

    window.__coiStatus = 'registering';
    var reloading = false;

    // 当前文档不隔离 → 刷新一次让文档走 SW（隔离头只对**重新加载的文档**生效）。
    // 注意 activate 里调了 clients.claim()，所以 controller 此刻可能已经非空 —— 那没用，
    // 这份文档的响应本来就发出去了、没带头。所以判据是「文档是否隔离」，不是 controller。
    function reloadOnce() {
      if (reloading) return;
      if (window.crossOriginIsolated) { window.__coiStatus = 'isolated-after-register'; return; }
      var done = false;
      try { done = sessionStorage.getItem(RELOAD_FLAG) === '1'; } catch (e) { /* 隐私模式 */ }
      if (done) { window.__coiStatus = 'still-not-isolated'; return; }   // 刷过一次还不行 → 页面提示手动刷新
      reloading = true;
      try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch (e) { /* 隐私模式 */ }
      window.__coiStatus = 'reloading';
      location.reload();
    }

    // 两条触发路径，谁先满足谁刷（只刷一次由 reloadOnce 保证，不会叠成死循环）：
    //   ready            —— SW 已 active，正常路径够用；
    //   controllerchange —— SW 真正接管本页的那一刻。有它兜底，才能覆盖「ready 已兑现、
    //                       但本次导航并没有被 SW 接管」这类竞态（硬刷新绕过 SW 之后尤其常见）。
    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);

    navigator.serviceWorker.register(swUrl, { scope: './' })
      .then(function () { return navigator.serviceWorker.ready; })
      .then(reloadOnce)
      .catch(function (e) {
        // 非安全上下文（http + 局域网 IP）会走到这里
        window.__coiStatus = 'register-failed: ' + (e && (e.message || e));
      });
    return;
  }

  // ============================================================
  //  Service Worker 侧
  // ============================================================
  self.addEventListener('install', function () { self.skipWaiting(); });
  self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

  self.addEventListener('fetch', function (event) {
    var request = event.request;
    // cache: 'only-if-cached' 配上非 same-origin 的 mode 会直接抛错，放过它
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

    event.respondWith(
      fetch(request).then(function (response) {
        // opaque 响应（status 0）改不了头，原样返回
        if (response.status === 0) return response;

        var headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        // 静态托管常按 Last-Modified 做“启发式缓存”，改动过的 worker / 核心脚本
        // 可能一直吃旧缓存，排查时极难看出问题。强制每次回源校验（代价只是 304）。
        // headers.set('Cache-Control', 'no-cache');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      })
    );
  });
})();
