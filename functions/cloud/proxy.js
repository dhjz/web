import axios from 'axios';

export const onRequest = async ({ request }) => {
  const { searchParams: params } = new URL(request.url);

  let { url, type = 'text/plain' } = params
  let result = ''
  if (url) {
    const res = await axios({
      method: 'get',
      url: url,
      responseType: 'text',
      timeout: 30000,
    })
    result = res.data
    type = res.headers['content-type']
  }

  console.log(result.substring(0, 50), type);

  const response = new Response(result || ('暂未获取参数' + JSON.stringify(params)));
  // const response = new Response(JSON.stringify(params) + url + (typeof axios));
  response.headers.set('Content-Type', type)
  return response;
};