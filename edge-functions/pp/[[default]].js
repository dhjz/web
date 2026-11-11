

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
// 说明：运行时的 params 通配段可能是字符串也可能是数组，这里把所有可能来源都作为候选，
// 逐个归一化并用 URL 校验，取第一个合法的；绝不把非法地址交给 fetch
//（否则只会得到 "Failed to construct 'URL': invalid URL"）
function resolveTargetUrl(path, searchParams, params) {
    const RESERVED = ['url', 'u', 'targetUrl', 'host', 'referer'];

    // 把除保留参数外的 query 原样透传给目标地址
    // 注意：部分边缘运行时未实现 URLSearchParams 的迭代器（Symbol.iterator），
    // 用 for...of 会抛 "is not iterable"，因此这里用 forEach + 字符串兜底
    const extra = new URLSearchParams();
    const appendExtra = (key, value) => {
        if (!RESERVED.includes(key)) extra.append(key, value);
    };
    if (typeof searchParams.forEach === 'function') {
        searchParams.forEach((value, key) => appendExtra(key, value));
    } else {
        String(searchParams).replace(/^\?/, '').split('&').forEach((pair) => {
            if (!pair) return;
            const idx = pair.indexOf('=');
            const rawKey = idx === -1 ? pair : pair.slice(0, idx);
            const rawValue = idx === -1 ? '' : pair.slice(idx + 1);
            const decode = (v) => {
                try {
                    return decodeURIComponent(v.replace(/\+/g, ' '));
                } catch (_) {
                    return v;
                }
            };
            appendExtra(decode(rawKey), decode(rawValue));
        });
    }
    const qs = extra.toString();

    const candidates = [];
    const pushCandidate = (value) => {
        if (value == null || value === '') return;
        // 通配段可能是数组（/https://a.com -> ['https:', '', 'a.com']），join 后还原完整路径
        let str = Array.isArray(value) ? value.join('/') : String(value);
        try {
            str = decodeURIComponent(str);
        } catch (_) {
            // 已是明文，解码失败则忽略
        }
        candidates.push(str);
    };
    pushCandidate(params?.default);
    pushCandidate(params?.['*']);
    pushCandidate(params?.path);
    pushCandidate(path.replace(/^\/?/, ''));
    pushCandidate(searchParams.get('url') || searchParams.get('u') || searchParams.get('targetUrl'));

    for (let i = 0; i < candidates.length; i++) {
        // 去掉代理路径自带的前导斜杠，如 /https://a.com -> https://a.com
        let target = candidates[i].replace(/^\/+/, '');

        // 形如 p/https://a.com/xxx 时，截取内嵌的完整 URL
        const embedded = target.match(/https?:\/\/\S+/);
        if (embedded) target = embedded[0];

        // https:/a.com 这类多/少斜杠的写法先归一化
        target = target.replace(/^(https?:)\/+/i, '$1//');

        // 补全缺失的协议，如 b.com -> https://b.com
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) {
            target = 'https://' + target.replace(/^\/+/, '');
        }

        if (qs) target += (target.includes('?') ? '&' : '?') + qs;

        if (isHttpUrl(target)) return target;
    }

    return '';
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