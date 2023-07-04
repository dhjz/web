

exports.handler = async function (event, context) {
  // console.log(event)
  const { httpMethod,  queryStringParameters, headers } = event
  console.log(queryStringParameters, httpMethod, headers)
  const result = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for']

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: result,
  };
};