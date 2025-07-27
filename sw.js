
// 请务必修改版本号（例如 'static-cache-v2'），这样 Service Worker 才会触发 activate 事件来清理旧缓存。
const CACHE_NAME = 'static-cache-v1';
// 在 Service Worker 安装时需要立即预缓存的资源 URL 列表。
// 通常是应用的核心外壳（App Shell），例如主页、核心 CSS 和 JS。
// 注意：这里的路径必须是精确的、相对于网站根目录的路径。
const URLS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/data.js',
  '/static/index.css',
  '/static/index.js',
  '/static/poem.js',
  '/static/vue.global.prod.js',
];

// 需要在运行时动态缓存的资源匹配规则。
// 当应用发出匹配这些规则的请求时，Service Worker 会拦截它们，
// 从网络获取响应并存入缓存，以便下次离线访问。
// 支持字符串和正则表达式。
const RUNTIME_CACHE_RULES = [
  '/utils/', // 字符串：匹配以 /api/ 开头的任何请求
  // /\.(?:png|jpg|jpeg|svg|gif)$/, // 正则表达式：匹配所有常见图片格式
  // /\.(?:js|css)$/ // 正则表达式：匹配所有 JS 和 CSS 文件（如果它们没有在预缓存列表中）
];


/**
 * 安装事件 (install)
 * 当 Service Worker 被注册后，会立即触发此事件。
 * 这是预缓存静态资源的最佳时机。
 */
self.addEventListener('install', event => {
  console.log(`[SW] Event: install (version: ${CACHE_NAME})`);

  // event.waitUntil 接受一个 Promise，它会延迟 install 事件，直到 Promise 完成。
  // 这确保了 Service Worker 在所有核心资源都缓存完毕之前不会被视为“已安装”。
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching app shell...');
        return cache.addAll(URLS_TO_PRECACHE);
      })
      .then(() => {
        console.log('[SW] All app shell files have been cached.');
        // self.skipWaiting() 会强制新的 Service Worker 立即激活，跳过等待阶段。
        // 这对于希望用户立即获得更新的场景很有用。
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

/**
 * 激活事件 (activate)
 * 当新的 Service Worker 安装成功并准备好接管控制权时，会触发此事件。
 * 这是清理旧版本缓存的最佳时机。
 */
self.addEventListener('activate', event => {
  console.log(`[SW] Event: activate (version: ${CACHE_NAME})`);

  // event.waitUntil 确保在旧缓存被清理完毕之前，不会处理其他事件（如 fetch）。
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 如果缓存的名称不是当前定义的 CACHE_NAME，就将其删除。
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[SW] Old caches have been cleaned up.');
        // self.clients.claim() 让新的 Service Worker 立即控制所有当前打开的页面，
        // 而不是等到下一次页面加载。
        return self.clients.claim();
    })
  );
});

/**
 * 拦截请求事件 (fetch)
 * 当应用（页面）发出任何网络请求（如加载图片、API调用、CSS文件等）时，都会触发此事件。
 */
self.addEventListener('fetch', event => {
  const { request } = event;

  // 我们只处理 GET 请求，因为其他请求（如 POST）是不可缓存的。
  if (request.method !== 'GET') {
    return;
  }

  // 缓存优先策略 (Cache First, falling back to Network)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // 1. 如果在缓存中找到了匹配的响应，直接返回它。
        if (cachedResponse) {
          console.log(`[SW] Serving from cache: ${request.url}`);
          return cachedResponse;
        }

        // 2. 如果缓存中没有，则从网络获取。
        // console.log(`[SW] Fetching from network: ${request.url}`);
        // return fetch(request);
        return fetch(request).then(networkResponse => {
          // 检查请求的 URL 是否符合运行时缓存的规则
          if (shouldCacheRequest(request)) {
            // 在将响应返回给页面的同时，我们将其克隆一份并存入缓存。
            // 一个响应只能被读取一次，所以需要克隆。
            console.log('[shouldCacheRequest]', request.url);
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              // console.log(`[SW] Caching new resource: ${request.url}`);
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(error => {
        // 当缓存和网络都失败时（例如，用户离线且资源未被缓存），
        // 可以在这里返回一个通用的离线页面。
        console.error(`[SW] Fetch failed for ${request.url}:`, error);
        // 可选：返回一个离线备用页面
        // return caches.match('/offline.html');
      })
  );
});

function shouldCacheRequest(request) {
  const url = new URL(request.url);
  // 避免缓存 Chrome 扩展程序的请求
  if (url.protocol.startsWith('chrome-extension')) {
    return false;
  }

  return RUNTIME_CACHE_RULES.some(rule => {
    if (typeof rule === 'string') {
      // console.log('[SW] url.pathname', url.pathname, url.pathname.startsWith(rule));
      return url.pathname.startsWith(rule);
    }
    if (rule instanceof RegExp) {
      return rule.test(url.href); // 使用 url.href 来匹配完整的 URL
    }
    return false;
  });
}