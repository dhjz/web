

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// 处理所有请求, 代理url, 比如请求的是   https://a.com/p/https://b.com, 代理https://b.com
export async function onRequest({ request, params, env }) {
    
    try {
        const url = new URL(request.url);
        const { pathname: path, searchParams } = new URL(request.url)

        // 解析代理目标地址，支持 /p/https://b.com 与 ?url=/?u=/?targetUrl= 两种方式
        const targetUrl = resolveTargetUrl(path, searchParams, params);

        if (targetUrl) { // 代理地址
            return handleProxy(request, targetUrl, searchParams, request.method);
        } else { // 默认首页
            return Response.redirect('/index.html', 301);
        }
    } catch (error) {
        return new Response(`Error handle functions: ${error.message}`, { status: 502, headers: corsHeaders() });
    }
}


// 解析代理的目标地址
// 1. 优先取 [[default]] 捕获的路径部分（例如 /p/https://b.com/xxx -> https://b.com/xxx）
// 2. 其次兼容 ?url= / ?u= / ?targetUrl= 传参
// 3. 缺少协议时自动补全 https://，并把非保留的 query 透传给目标地址
function resolveTargetUrl(path, searchParams, params) {
    const RESERVED = ['url', 'u', 'targetUrl', 'host', 'referer'];

    let target = params?.default || params?.['*'] || path.replace(/^\/p\/?/, '');

    try {
        target = decodeURIComponent(target);
    } catch (_) {
        // 已是明文，解码失败则忽略
    }

    if (!target) {
        return searchParams.get('url') || searchParams.get('u') || searchParams.get('targetUrl') || '';
    }

    // 把除保留参数外的 query 原样透传给目标地址
    const extra = new URLSearchParams();
    for (const [key, value] of searchParams) {
        if (!RESERVED.includes(key)) extra.append(key, value);
    }
    const qs = extra.toString();
    if (qs) target += (target.includes('?') ? '&' : '?') + qs;

    // 补全缺失的协议，如 /p/b.com -> https://b.com
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) {
        target = 'https://' + target.replace(/^\/+/, '');
    }

    return target;
}

async function handleProxy(request, targetUrl, searchParams, method) {
    const host = searchParams.get('host')
    const referer = searchParams.get('referer')
    const body = (method == 'GET' || method == 'HEAD') ? null : request.body; // GET 或 HEAD 请求，body 必须为 null
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('Accept-Encoding');
    host && headers.set('Host', host.trim());
    referer && headers.set('Referer', referer.trim());

    try {
      const res = await fetch(targetUrl, { method, headers, body}); // redirect: 'follow', // 自动处理重定向

      if (res.body instanceof ReadableStream) {
        const resHeaders = new Headers(res.headers)
        resHeaders.set('Cache-Control', 'no-store')
        return new Response(res.body, { status: res.status, headers: corsHeaders(resHeaders)});
      } else {
        corsHeaders(res.headers)
        return res;
      }
    } catch (e) {
      return new Response(`Error Proxy: ${e.message}`, { status: 502, headers: corsHeaders() });
    }
}

function corsHeaders(headers) {
  if (headers && headers instanceof Headers) {
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
    headers.set('Access-Control-Allow-Headers', '*')
    return headers
  } else {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
      'Access-Control-Allow-Headers': '*',
      ...(headers || {}),
      // 'Access-Control-Max-Age': '86400',
    }
  }
}