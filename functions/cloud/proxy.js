import axios from 'axios';

export const onRequest = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);

  let { url, type = 'text/plain;charset=utf-8' } = params
  let result = ''
  if (url) {
    const res = await axios({
      method: 'get',
      url: url,
      responseType: 'text',
      timeout: 30000,
    })
    result = res.data
    // type = res.headers['content-type']
  }

  console.log(result.substring(0, 50), type);

  const response = new Response(result || ('暂未获取参数, ' + request.url + ' ||| ' + JSON.stringify(params)));
  // const response = new Response(JSON.stringify(params) + url + (typeof axios));
  response.headers.set('Content-Type', type)
  return response;
};