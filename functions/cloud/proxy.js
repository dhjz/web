const axios = require('axios');

export const onRequest = async (ctx) => {
  const { request, params } = ctx

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

  const response = new Response(result);
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Content-Type', type)
  return response;
};