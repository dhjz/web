let yURL = 'https://y.qq.com';
let cURL = 'https://c.y.qq.com';
let URL163 = 'http://music.163.com'
// let uURL = 'https:/u.y.qq.com/cgi-bin/musicu.fcg';

export const onRequest = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);

  let { type = 'qq',  method = 'search',  s = '', id = '', page = 1, limit = 10 } = params
  let result = ''
  let contentType = 'text/plain;charset=utf-8'
  if (type == 'qq') {
    try {
      let url, query;
      if (method == 'search') {
        if (!s) return new Response('请传入关键字参数s')
        url = cURL + '/soso/fcgi-bin/client_search_cp?'
        query = {
          w: s, // 搜索关键字
          n: limit, // 每页歌曲数量
          p: page, // 当前页
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
      } else if (method == 'pic') {
        if (!id) return new Response('请传入歌曲参数id')
        // &lv=-1, 返回lyrics   &rv=-1，返回romantic罗马音  &tv=-1，返回translated翻译内容（日语歌对应中文）  &yv=-1，返回按字的时间歌词
        query = {
          albummid: id,
          format: 'json',
		      outCharset: 'utf-8',
        }
        url = cURL + '/v8/fcg-bin/fcg_v8_album_info_cp.fcg?'
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
      if (res.headers['content-type']) contentType = res.headers['content-type']
    } catch(e) {
      result = '400 请求错误' + e
    }
  } else if (type == '163') {
    try {
      let url, query;
      if (method == 'search') {
        if (!s) return new Response('请传入关键字参数s')
        url = URL163 + '/api/cloudsearch/pc?s=曹操&type=1&limit=8&offset=0&total=true'
        query = {
          s,
          limit: limit,
          offset: (page - 1) * limit,
          type: 1, //1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
          total: true,
        }
      } else if (method == 'lyric') {
        if (!id) return new Response('请传入歌曲参数id')
        // &lv=-1, 返回lyrics   &rv=-1，返回romantic罗马音  &tv=-1，返回translated翻译内容（日语歌对应中文）  &yv=-1，返回按字的时间歌词
        query = {
          id,
          os: 'pc',
          lv: -1,
        }
        url = URL163 + '/api/song/lyric?'
        // const lyric = res.data && res.data.lyric && new Buffer.from(res.data.lyric, 'base64').toString();
      } else if (method == 'pic') {
        if (!id) return new Response('请传入歌曲参数id')
        // &lv=-1, 返回lyrics   &rv=-1，返回romantic罗马音  &tv=-1，返回translated翻译内容（日语歌对应中文）  &yv=-1，返回按字的时间歌词
        query = {}
        url = URL163 + '/api/album/' + id
        // const lyric = res.data && res.data.lyric && new Buffer.from(res.data.lyric, 'base64').toString();
      }     
      const res = await fetch(url + new URLSearchParams(query).toString(), {
        method: 'get',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          referer: 'http://music.163.com',
			    host: 'music.163.com',
        }
      })
      result = await res.text()
      if (res.headers['content-type']) contentType = res.headers['content-type']
    } catch(e) {
      result = '400 请求错误' + e
    }
  }

  const response = new Response(result || ('暂未获取参数或者请求结果, ' + request.url + ' ||| ' + JSON.stringify(params)));
  // const response = new Response(JSON.stringify(params) + url + (typeof axios));
  response.headers.set('Content-Type', contentType)
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