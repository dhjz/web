const { createApp } = Vue
const STORAGE_KEY = 'spider_store'
  
createApp({
  data() {
    return {
      form: {
        charset: 'UTF-8',
        // url: 'https://www.iplaysoft.com/category/system',
        // articlelSelector: '#postlist .entry-head .entry-title a',
        // titleSelector: '',
        // contSelector: '.entry-content',
        // pageUrl: 'https://www.iplaysoft.com/category/system/page/{ID}',
        // url: 'http://www.xnyy.cn/yydt/yyxw.htm',
        // articlelSelector: '.pic-list-ul li:not([style*="none"]) a',
        // contSelector: '.content-main',
        // titleSelector: '.content h2',
        // dateSelector: '.Author > span:nth-of-type(1)',
        // pageUrl: 'http://www.xnyy.cn/yydt/yyxw/{ID}.htm',
        url: 'https://www.qigushi.com/yuyangushi/',
        articlelSelector: '.lieb .post h2 a',
        contSelector: '.article_content',
        titleSelector: '.title h1',
        dateSelector: '.title > span:last-of-type',
        contDel: 'www.qigushi.com.*?故事',
        pageUrl: 'https://www.qigushi.com/yuyangushi/index_{ID}.html',
        fields: [{ key: 'type', val: '.title > span:first-of-type a' }],
        isPage: '1',
        isText: '1',
        tags: '',
        pageStart: '2',
        pageEnd: '3',
        type: '0',
        delay: 100,
        proxyUrl: 'https://web.dhjz.fun/.netlify/functions/proxy?url='
      },
      dataList: [],
      dialogTitle: '',
      dialogHtml: '',
      dialogShow: false,
      spideCurr: 0,
      spideTotal: 0,
      caches: []
    }
  },
  created() {
    this.getFields()
    // const url = 'https://pic.qigushi.com/uploads/image/20201121/202011212045448345289.jpg'
    // // const url = 'https://www.qigushi.com/e/qrcode/index.php?url=https://www.qigushi.com/yuyangushi/3296.html'
    // axios.get(url, { responseType: 'blob' }).then(res => {
    //   console.log(res, res.data.type);
    //   const name = `${new Date().getTime()}.${getFileExt(res.data.type)}`
    //   // saveAs(new Blob([res.data]), name)
    //   var zip = new JSZip();
    //   var imgFolder = zip.folder("img");
    //   imgFolder.file(name, res.data)
    //   zip.generateAsync({type: 'blob'}).then(blob => saveAs(blob, new Date().getTime() + '.zip'));
    // })
  },
  methods: {
    useCache(item) {
      this.form = { ...item }
    },
    delCache(item, ind) {
      this.caches.splice(ind, 1)
      setStorage(STORAGE_KEY, [...this.caches].reverse())
    },
    getCacheName(item) {
      return new URL(item.url).host.replaceAll('.', '_')
    },
    getFields() {
      if (!this.form.url) return
      let caches = getStorage(STORAGE_KEY)
      if (!caches || !caches.length) return
      this.form = { ...caches[caches.length - 1] }
      this.caches = caches.reverse()
    },
    saveFields() {
      if (!this.form.url) return
      let caches = getStorage(STORAGE_KEY)
      let temp = null
      if (!caches) {
        caches = []
      } else if (caches.length) {
        temp = caches[caches.length - 1]
      }
      if (temp && temp.url == this.form.url) {
        Object.assign(temp, this.form)
      } else {
        caches.push({ ...this.form })
      }
      setStorage(STORAGE_KEY, caches)
      this.caches = caches.reverse()
    },
    previewList() {
      this.dataList = []
      this.spideTotal = '计算中'
      getPageListData({ ...this.form }, this.updateProcess).then(data => {
        console.log(data);
        this.dataList = data.list || []
        this.spideCurr = 0
        this.spideTotal = 0
      })
      this.saveFields()
    },
    preview(item) {
      getContData({ ...this.form, href: item.href }).then(data => {
        console.log(data);
        this.dialogHtml = (data.cont || '').replaceAll('\n', '<br />')
        this.dialogTitle = data.title || ''
        this.dialogShow = true
      })
    },
    spideJson(isBeauty) {
      this.spideTotal = '计算中'
      getPageContData({ ...this.form }, this.updateProcess).then(data => {
        console.log(data)
        saveText(JSON.stringify(data, null, isBeauty ? 2 : 0), 'test.json')
        this.spideCurr = 0
        this.spideTotal = 0
      })
    },
    updateProcess(curr, total) {
      this.spideCurr = curr
      this.spideTotal = total
    },
    addField() {
      if (!this.form.fields) this.form.fields = []
      this.form.fields.push({ key: '', val: '' })
    },
    delField() {
      if (!this.form.fields || !this.form.fields.length) return
      this.form.fields.splice(this.form.fields.length - 1, 1)
    }
  },
}).mount('#app')

/************* utils  ****************/
function getListData(options) {
  const result = { total: 0, list: [] }
  return new Promise((reso) => {
    let url = options.proxyUrl ? (options.proxyUrl + options.url) : options.url
    axios.get(url, { responseType: 'document' }).then((res) => {
      if (res.status != 200 || !res.data) return reso(result)
      let articleList = Array.from(res.data.querySelectorAll(options.articlelSelector))

      articleList.forEach(async (el) => {
        const href = await el.getAttribute('href')
        result.list.push({
          href: /http[s]?:\/\//.test(href) ? href : new URL(href, options.url).toString(),
          title: el.title ? el.title.trim() : el.innerText.trim()
        })
      })
      result.total = articleList.length
      console.log('getListData total -> ' + result.total + ', url -> ' + options.url)
      setTimeout(() => reso(result), options.delay || 10)
    }).catch(() => reso(result))
  })
}

function getPageListData(options, callback) {
  return new Promise(async (reso) => {
    let result = { total: 0, list: [] }
    if (!options.pageUrl) return reso(result)
    if (options.list && options.list.length) return reso({ total: options.list.length, list: options.list })

    if (options.isPage != 1) {
      return reso(await getListData({ ...options }))
    }

    const pageStart = parseInt(options.pageStart)
    const pageEnd = parseInt(options.pageEnd)
    const start = Math.min(pageStart, pageEnd)
    const end = Math.max(pageStart, pageEnd)
    for (let i = start - 1; i <= end; i++) {
      if (i != start - 1) options.url = options.pageUrl.replace('{ID}', i)
      const data = await getListData({ ...options })
      result.total += data.total
      result.list = result.list.concat(data.list)
      callback && callback(i, end)
    }
    reso(result)
  })
}

function getContData(options) {
  return new Promise((reso) => {
    let url = options.proxyUrl ? (options.proxyUrl + options.href) : options.href
    axios.get(url, { responseType: 'document' }).then(async (res) => {
      if (res.status != 200 || !res.data) return reso({})
      let contEl = res.data.querySelector(options.contSelector)
      if (!contEl) return reso({})
      Array.from(contEl.querySelectorAll('*[href]')).forEach(async el => {
        const href = await el.getAttribute('href')
        el.href = /http[s]?:\/\//.test(href) ? href : new URL(href, options.url).toString()
      })
      Array.from(contEl.querySelectorAll('*[src]')).forEach(async el => {
        const src = await el.getAttribute('src')
        el.src = /http[s]?:\/\//.test(src) ? src : new URL(src, options.url).toString()
      })
      Array.from(contEl.querySelectorAll('script')).forEach(el => {
        el.parentNode.removeChild(el) // 删除所有script标签
      })
      // if (options.isText == '1') {
      //   Array.from(contEl.querySelectorAll('img')).forEach(el => {
      //     el.parentNode.removeChild(el) // 删除所有img标签
      //   })
      // }
      // const imgs = []
      // if (options.isText != '1' || (options.tags || '').includes('img')) {
      //   // 采集图片
      //   let imgEls = Array.from(contEl.querySelectorAll('img[src]'))
      //   for (let i = 0; i < imgEls.length; i++) {
      //     const imgRes = await axios.get(imgEls[i].src, { responseType: 'blob' })
      //     imgs.push({ name: `${new Date().getTime()}.${getFileExt(imgRes.data.type)}`, blob: imgRes.data })
      //   }
      // }
      setTimeout(() => {
        let cont = options.isText == '1' ? pureHtml(contEl.innerHTML)
          : pureHtml(contEl.innerHTML, options.tags ? options.tags.trim().replaceAll('，',',').split(',') : null)
        if (options.contDel) {
          options.contDel.split('|').forEach(item => cont = cont.replace(new RegExp(item, 'ig'), ''))
        }
        const title = options.titleSelector ? res.data.querySelector(options.titleSelector)?.innerText.replaceAll('\n', '').replaceAll('\r', '') : null
        const date = options.dateSelector ? res.data.querySelector(options.dateSelector)?.innerText : null
        const result = { title, cont, date }
        if (options.fields && options.fields.length) {
          options.fields.filter(x => x.key && x.val).forEach(x => {
            result[x.key] = res.data.querySelector(x.val)?.innerText.replaceAll('\n', '') || ''
          })
        }
        // result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 删除所有script标签
        reso(result)
      }, options.delay || 10)
    }).catch(() => reso(''))
  })
}

function getPageContData(options, callback) {
  return new Promise(reso => {
    getPageListData(options).then(async (data) => {
      let len = data.list.length
      const result = []
      for (let i = 0; i < len; i++) {
        const item = data.list[i];
        const contData = await getContData({ ...options, href: item.href })
        console.log('getContData title -> ' + contData.title + ', href -> ' + item.href)
        contData.title = contData.title || item.title
        contData.cont && result.push({ ...contData })
        callback && callback(i + 1, len)
      }
      reso(result)
    })
  })
}

function pureHtml(str, tags) {
  if (!str) return ''
	try {
    str = decodeURI(str)
	} catch (e) {
		// console.log(e)
	}
  if (tags && Array.isArray(tags)) tags = tags.map(t => t.trim()).filter(Boolean)
  if (!tags || !tags.includes('p')) str = str.replaceAll('</p>', '\n</p>')
  if (!tags || !tags.includes('div')) str = str.replaceAll('</div>', '\n</div>')
  if (tags && tags.length) {
    str = str.replace(new RegExp(`<(?!(${tags.map(t => t + '|\/' + t).join('|')})).*?>`, 'ig'), '')
  } else {
    str = str.replace(/<\/?[^>]*>/g, '') // 去除HTML tag
    str = str.replace(/&nbsp;/ig, '')// 去掉空白
  }
  str = str.replace(/[ | ]*\n/g, '\n') // 去除行尾空白
  str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
  str = str.replace(/<p>\s*<\/p>/g,''); //去除多余空行
  str = str.trim().replace(/\n\s+/g, '\n').replace(/\n+/g, '\n').replace(/\t+/g, '\t').replace(/(\n\t)+/g, '\n\t') 
  // str = str.replace(/ /ig, '')// 去掉空白
  return str
}

window.saveAs = function(blob, name) {
    let link = document.createElement('a')
    let href = window.URL.createObjectURL(blob)
    link.href = href
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(href)
}

window.saveText = function(text, name) {
  window.saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), name || (new Date().getTime() + '.txt'))
}

function formatDate(format, date) {
  date = date || new Date();
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'))
}

function getStorage(key) {
  let result = localStorage.getItem(key)
  try {
    return JSON.parse(result)
  } catch {
    return result 
  }
}
function setStorage(key, val) {
  if (val || val === 0) localStorage.setItem(key, JSON.stringify(val))
}

function getFileExt(type) {
  const extObj = {
    // 图片
    "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/bmp": "bmp", "image/webp": "webp",
    // 视频
    "video/mp4": "mp4", "video/quicktime": "mov", "video/mpeg": "mpeg", "video/webm": "webm", "video/x-msvideo": "avi",
    // 音频
    "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg", "audio/midi": "mid",
    // 文档
    "application/pdf": "pdf", "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls", "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/rtf": "rtf", "text/plain": "txt", "application/json": "json", "application/xml": "xml",
  };
  return extObj[type] || ''
}