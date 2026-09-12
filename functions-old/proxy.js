export const onRequest = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  // OPTIONS请求直接返回
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  let { u, url, method = 'get', type = 'text/plain;charset=utf-8', host, referer, cookie, accept } = params
  let result = ''
  url = url || u;
  if (url) {
    try {
      const headers = {
        // 'Accept': 'text/plain; charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      }
      if (host) headers['Host'] = host
      if (referer) headers['Referer'] = referer
      if (cookie) headers['Cookie'] = cookie
      if (accept) headers['Accept'] = accept
      const res = await fetch(url, {
        method,
        headers: headers
      })
      result = await res.text()
    } catch(e) {
      result = '400 请求错误' + e
    }
    // type = res.headers['content-type']
  }

  const response = new Response(result || ('暂未获取参数或者请求结果, ' + request.url + ' ||| ' + JSON.stringify(params)));
  // const response = new Response(JSON.stringify(params) + url + (typeof axios));
  response.headers.set('Content-Type', type)
  return response;
};