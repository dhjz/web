/**
geo 属性（以官方中国大陆返回为例）:
{
  "asn": 4837,
  "countryName": "China",
  "countryCodeAlpha2": "CN",
  "countryCodeAlpha3": "CHN",
  "countryCodeNumeric": "156",
  "regionName": "Chongqing",
  "regionCode": "CN-CQ",
  "cityName": "Chongqing",
  "continent": "",
  "latitude": 29.565683364868164,
  "longitude": 106.55118560791016,
  "cisp": "中国联通"
}

结论：regionCode 为 ISO 3166-2 格式（CN-XX），regionName / cityName 为英文名。
 */

// 仅允许中国大陆以下省级行政区访问：重庆、四川、上海、北京
const ALLOWED_COUNTRY_CODE = 'CN';

// 未获取到 geo 信息时是否放行
// true  -> 放行（本地开发 / 边缘节点未返回 geo 时不至于全站被拦）
// false -> 拒绝（线上严格限制使用）
const ALLOW_ON_GEO_UNAVAILABLE = false;

// 调试端点：直接回显当前请求的 geo，方便排查地域判定问题，不受白名单限制
const DEBUG_GEO_PATH = '/getgeo';

/**
 * 归一化区域名：转小写、去除空白与分隔符、去掉 province/sheng/省/市 等后缀
 * 例：Chongqing -> chongqing，四川省 -> 四川
 */
function canonicalRegionName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\s\-_.·]/g, '')
    .replace(/(?:(?:province|municipality|autonomousregion|sheng|shi|city|zizhiqu|省|市|自治区))+$/, '');
}

/**
 * 归一化行政区划代码：去除空白并统一大写，例：cn-cq -> CN-CQ
 */
function canonicalRegionCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

// 行政区划代码白名单（ISO 3166-2），官方返回如 CN-CQ
// 两侧均经 canonicalRegionCode 归一化，因此大小写、首尾空格不敏感
const ALLOWED_REGION_CODES = new Set(
  ['CN-CQ', 'CN-SC', 'CN-SH', 'CN-BJ'].map(canonicalRegionCode) // 重庆 / 四川 / 上海 / 北京
);

// 区域名 / 城市名白名单（英文官方名 + 中文名）
// 两侧均经 canonicalRegionName 归一化，因此大小写、空格、连字符及省市后缀均不敏感
const ALLOWED_REGION_NAMES = new Set(
  [
    'Chongqing', '重庆',
    'Sichuan', '四川',
    'Shanghai', '上海',
    'Beijing', '北京',
  ].map(canonicalRegionName)
);

/**
 * 判断该请求的地理位置是否在允许范围内
 */
function isAllowedGeo(geo) {
  if (!geo) {
    return false;
  }

  // 1. 必须是中国大陆（同样不区分大小写）
  if (canonicalRegionCode(geo.countryCodeAlpha2) !== canonicalRegionCode(ALLOWED_COUNTRY_CODE)) {
    return false;
  }
  return true

//   // 2. 行政区划代码命中白名单（官方数据中最可靠的字段）
//   if (ALLOWED_REGION_CODES.has(canonicalRegionCode(geo.regionCode))) {
//     return true;
//   }

//   // 3. 区域名 / 城市名兜底（应对个别节点 regionName 为空的情况）
//   const regionNames = [geo.regionName, geo.cityName].map(canonicalRegionName);
//   return regionNames.some((name) => name && ALLOWED_REGION_NAMES.has(name));
}

/**
 * 构造拒绝访问的响应
 * 刻意不返回任何地域白名单、客户端定位或拦截原因，避免向非授权用户暴露访问策略
 */
function createDeniedResponse() {
  return new Response(null, {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export function middleware(context) {
  const { request, next, geo } = context;

  // 调试端点：不受地域白名单限制，直接回显 geo 原始信息
  // 注意必须 no-store，否则边缘缓存会把某个用户的 geo 返回给其他用户
  const { pathname } = new URL(request.url);
  if (pathname === DEBUG_GEO_PATH || pathname === `${DEBUG_GEO_PATH}/`) {
    return new Response(JSON.stringify(geo ?? null), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  // 预检请求直接放行，避免浏览器跨域请求被拦截
  if (request.method === 'OPTIONS') {
    return next();
  }

  const hasGeo = Boolean(
    geo && (geo.countryCodeAlpha2 || geo.regionName || geo.regionCode || geo.cityName)
  );

  if (!hasGeo) {
    return ALLOW_ON_GEO_UNAVAILABLE ? next() : createDeniedResponse();
  }

  if (isAllowedGeo(geo)) {
    return next();
  }

  return createDeniedResponse();
}
