export const onRequest = async (ctx) => {
  const { request, params } = ctx
  const result = request.headers.get('client-ip') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')
  return new Response(result);
};