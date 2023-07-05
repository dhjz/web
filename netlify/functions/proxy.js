const axios = require('axios');


exports.handler = async function (event, context) {
  // console.log(JSON.stringify(event))
  const { httpMethod,  queryStringParameters } = event
  console.log(queryStringParameters, httpMethod)
  let { url, type = 'text/plain' } = queryStringParameters
  let result = ''
  if (url) {
    const res = await axios({
      method: 'get',
      url: url,
      responseType: 'text',
      timeout: 30000,
    })
    // console.log(res);
    result = res.data
    type = res.headers['content-type']
  }

  console.log(result.substring(0, 50), type);


  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", 'content-type':  type},
    body: result,
  };
};