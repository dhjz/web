/* 打印助手 Service Worker
 * 所有运行依赖（Vue、透视裁剪、图标）均已本地化，可整体离线缓存。
 * 版本升级：修改 CACHE_NAME 即会触发新 SW 安装，页面顶部出现「更新」按钮。
 */
const CACHE_NAME = 'print-helper-v12';
const CORE_ASSETS = [
  './',
  './index.html',
  './pt.html',
  './manifest.webmanifest',
  './vue.global.prod.js',
  './perspective-crop.js',
  './image-utils.js',
  './print-utils.js',
  './fabric.min.js',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith('print-helper-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

/* 不自动跳过等待：避免在用户处理图片时强制刷新；由页面「更新」按钮触发 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (e) {
    const fallback = (await cache.match(request))
      || (await cache.match('./index.html'))
      || (await cache.match('./'));
    if (fallback) return fallback;
    return new Response(
      '<!doctype html><meta charset="utf-8"><p>当前离线且尚无缓存，请联网打开一次本页后再试。</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
