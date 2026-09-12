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

export async function onRequest({ request, params, env }) {
  try {
    const { pathname: path, searchParams } = new URL(request.url)
    const rpath = params.path

    if (request.method == 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders({ 'Access-Control-Max-Age': '86400' }) });
    }
    
    const targetUrl = searchParams.get('url') || searchParams.get('u') || searchParams.get('targetUrl')
    const debug = searchParams.get('debug')
    
    if (targetUrl) { // 代理地址
      return handleProxy(request, targetUrl, searchParams, request.method);
    } else { // 默认首页
      return Response.redirect('/index.html', 301);
    }
  } catch (error) {
    return new Response(`Error handle functions: ${error.message}`, { status: 502, headers: corsHeaders() });
  }
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