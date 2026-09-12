export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
export async function onRequest({ request, params, env }) {
  try {
    const { pathname: path, searchParams } = new URL(request.url)

    return new Response(request.eo?.clientIp || '', { headers: corsHeaders() });
  } catch (error) {
    return new Response(`Error handle functions: ${error.message}`, { status: 502, headers: corsHeaders() });
  }
}

function corsHeaders(headers) {
  if (headers && headers instanceof Headers) {
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
    headers.set('Access-Control-Allow-Headers', '*')
    return headers
  } else {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
      'Access-Control-Allow-Headers': '*',
      ...(headers || {}),
      // 'Access-Control-Max-Age': '86400',
    }
  }
}