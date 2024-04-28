// Set CORS to all /api responses
export const onRequest = async (context) => {
  const response = await context.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};