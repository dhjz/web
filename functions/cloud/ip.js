export const onRequest = async (ctx) => {
  const { request, params } = ctx
  const result = request.headers.get('client-ip') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')
  const response = new Response(result);
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};