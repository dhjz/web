export const onRequest = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);

  let { url, type = 'text/plain;charset=utf-8' } = params
  let result = ''
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'get',
        headers: {
          'Accept': 'text/plain; charset=utf-8'
        }
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