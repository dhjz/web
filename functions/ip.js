export const onRequest = async (ctx) => {
  const { request, params } = ctx
  const result = request.headers.get('Client-Cp') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('X-Forwarded-For') || request.headers.get('CF-Connecting-IP')
  console.log(result, request.headers);
  return new Response(result || ('暂未到获取ip' + JSON.stringify(request)));
};