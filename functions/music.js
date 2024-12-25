let yURL = 'https://y.qq.com';
let cURL = 'https://c.y.qq.com';
// let uURL = 'https:/u.y.qq.com/cgi-bin/musicu.fcg';

export const onRequest = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);

  let { type = 'qq',  method = 'search',  s = '', id = '' } = params
  let result = ''
  if (type == 'qq') {
    try {
      let url, query;
      if (method == 'search') {
        if (!s) return new Response('请传入关键字参数s')
        url = cURL + '/soso/fcgi-bin/client_search_cp?'
        query = {
          w: s, // 搜索关键字
          n: 10, // 每页歌曲数量
          p: 1, // 当前页
          catZhida: 0, // 0表示歌曲, 2表示歌手, 3表示专辑, 4, 5
          format: 'json',
          outCharset: 'utf-8',
          ct: 24,
          qqmusic_ver: 1298,
          // https://github.com/Rain120/qq-music-api/issues/68
          // new_json: 1,
          remoteplace: 'txt.yqq.song',
          // searchid: 58932895599763136,
          t: 0,
          aggr: 1,
          cr: 1,
          lossless: 0,
          flag_qc: 0,
          platform: 'yqq.json',
        }
      } else if (method == 'lyric') {
        if (!id) return new Response('请传入歌曲参数id')
        query = {
          songmid: id, // 搜索关键字
          format: 'json',
          outCharset: 'utf-8',
          pcachetime: Date.now(),
        }
        url = cURL + '/lyric/fcgi-bin/fcg_query_lyric_new.fcg?'
        // const lyric = res.data && res.data.lyric && new Buffer.from(res.data.lyric, 'base64').toString();
      }

      
      const res = await fetch(url + new URLSearchParams(query).toString(), {
        method: 'get',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          referer: 'https://c.y.qq.com/',
			    host: 'c.y.qq.com',
        }
      })
      result = await res.text()
    } catch(e) {
      result = '400 请求错误' + e
    }
  }

  const response = new Response(result || ('暂未获取参数或者请求结果, ' + request.url + ' ||| ' + JSON.stringify(params)));
  // const response = new Response(JSON.stringify(params) + url + (typeof axios));
  response.headers.set('Content-Type', res.headers['content-type'])
  return response;
};



function lyricParse(lyric) {
  let result = {
    lyric: lyric,
    tags: [],
    lines: []
  }

  const TAGREGMAP = { title: 'ti', artist: 'ar', album: 'al', offset: 'offset', by: 'by' };

  for (let tag in TAGREGMAP) {
    const matches = lyric.match(new RegExp(`\\[${TAGREGMAP[tag]}:([^\\]]*)]`, 'i'));
    result.tags[tag] = (matches && matches[1]) || '';
  }

  const lines = lyric.split('\n');
  const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let temp = timeExp.exec(line);
    if (temp) {
      const txt = line.replace(timeExp, '').trim();
      const time = temp[1] * 60 * 1000 + temp[2] * 1000 + (temp[3] || 0) * 10;
      txt && result.lines.push({ time, txt })
    }
  }

  result.lines.sort((a, b) => a.time - b.time);

	return result;
}