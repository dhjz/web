export const onRequest = async (ctx) => {
  const { request, params } = ctx
  const result = request.headers.get('client-ip') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')
  console.log(result, request.headers);
  return new Response(result || ('暂未到获取ip' + JSON.stringify(request.headers)));
};