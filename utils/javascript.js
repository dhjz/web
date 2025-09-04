// # 文件-构建文件
function buildFile(text, type = 'text/plain') {
  const blob = new Blob([text], { type: type });
  const file = new File([blob], 'test.txt', { type: type });
}

// # 文件-下载Blob
// 文本也可 new Blob([text], { type: 'text/plain;charset=utf-8' })
function download(blob, name) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, name)
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => link.remove(), 200);
  }
}

function downloadText(text, name) {
  download(new Blob([text], { type: 'text/plain;charset=utf-8' }), name)
}

// # 文件-下载文本
function downloadText1(text, name) {
  const link = document.createElement('a');
  link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  link.download = name
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// # 文件-一键上传并获取文本内容
function uploadText() {
  return new Promise((res, rej) => {
    document.getElementById('importInput')?.remove()
    const inputEl = document.createElement('input')
    inputEl.type = 'file'
    inputEl.id = "importInput" 
    inputEl.style = "display: none;" 
    document.body.append(inputEl)
    inputEl.onchange = function () {
      const resultFile = inputEl.files[0]
      if (resultFile) {
        const reader = new FileReader()
        reader.readAsText(resultFile, 'UTF-8')
        reader.onload = () => {
            let obj = { name: resultFile.name, data: reader.result, size: resultFile.size, type: resultFile.type }
            document.body.removeChild(inputEl)
            try { obj.data = JSON.parse(obj.data) } catch(e) { }
            res(obj)
        }
      } else {
        document.body.removeChild(inputEl)
        res('')
      }
    }
    inputEl.click()
  })
}

// # 文件-一键上传并获取内容
function uploadCont(isBase46) {
  // 拼接base64  data:image/jpeg;base64,XXXXXXXXXXXX
  return new Promise((res, rej) => {
    document.getElementById('importInput')?.remove()
    const inputEl = document.createElement('input')
    inputEl.type = 'file'
    inputEl.id = "importInput" 
    inputEl.style = "display: none;" 
    document.body.append(inputEl)
    inputEl.onchange = function () {
      const resultFile = inputEl.files[0]
      if (resultFile) {
        const reader = new FileReader()
        if (isBase46) {
          reader.readAsArrayBuffer(resultFile)
          reader.onload = () => {
            const arrayBuffer = reader.result;
            document.body.removeChild(inputEl)
            res({ name: resultFile.name, data: bufferToBase64(arrayBuffer), size: resultFile.size, type: resultFile.type })
          }
        } else {
          reader.readAsText(resultFile, 'UTF-8')
          reader.onload = () => {
              let fileContent = reader.result
              document.body.removeChild(inputEl)
              let obj = { name: resultFile.name, data: fileContent, size: resultFile.size, type: resultFile.type }
              try {
                obj.data = JSON.parse(fileContent)
              } catch(e) { }
              res(obj)
          }
        }
      } else {
        document.body.removeChild(inputEl)
        res('')
      }
    }
    inputEl.click()
  })
}

function bufferToBase64(buffer) {
  const arr = new Uint8Array(buffer)
  const chunkSize = 10000
  const chunks = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  const strings = chunks.map(chunk => String.fromCharCode(...chunk))
  return btoa(strings.join(''));
}

function base64ToBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

// # 文本和Base64互转
function encode64(str) {
  return btoa(new TextEncoder().encode(str).reduce((r, byte) => r + String.fromCharCode(byte), ''))
}

function decode64(str) {
  return new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0)))
}

// # 文件-拖拽上传
function dragUpload() {
  document.addEventListener('dragover', (e) => e.preventDefault())
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || !files.length) return;
    let resultFile = files[0]
    if (resultFile) {
      const reader = new FileReader()
      reader.readAsText(resultFile, 'UTF-8')
      reader.onload = function (e) {
        let cont = reader.result
        logs(cont, 'dragUpload()')
      }
    }
  })
}

// # 文件-正则获取文件类型
function getType(val) {
  if (/\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)$/i.test(val)) return 'img'
  if (/\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv|m3u8)$/i.test(val)) return 'video'
  if (/\.(mp3|wav|wma|aac|flac|ape|ogg|aiff|m4a|caf)$/i.test(val)) return 'audio'
  if (/\.(doc|docx|odt)$/i.test(val)) return 'doc'
  if (/\.(xls|xlsx)$/i.test(val)) return 'xls'
  if (/\.(ppt|pptx)$/i.test(val)) return 'ppt'
  if (/\.(pdf)$/i.test(val)) return 'pdf'
  if (/\.(txt|ini|properties|yml|json|md)$/i.test(val)) return 'txt'
  if (/\.(java|html|htm|css|js|php|h|go|)$/i.test(val)) return 'code'
  if (/\.(zip|rar|7z|tar\.gz|tar\.bz2)$/i.test(val)) return 'zip'
  return 'other'
}

// # 文件-获取文件大小
function formatBytes(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  let exp = 0;
  while (size >= 1024) {
    size /= 1024;
    exp++;
  }
  return `${size.toFixed(1)}${units[exp]}`;
}

// # 浏览器-加载script脚本
function loadScript(url, globalName) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(url)
    // 已经加载过改js
    if (globalName && window[globalName]) {
      console.log(globalName + ' 已经被加载过')
      return resolve(window[globalName])
    }
    const scriptEl = document.createElement('script')
    scriptEl.type = 'text/javascript'
    scriptEl.src = url
    scriptEl.onload = () => resolve(globalName && window[globalName])
    scriptEl.onerror = (e) => {
      reject(e)
    };
    (document.getElementsByTagName('head')[0] || document.body).appendChild(scriptEl)
  })
}

// # 浏览器-JSONP
function getJSONP(url, options = {}) {
  return new Promise((reso, rej) => {
    const scriptEl = document.createElement('script')
    const callbackKey = options.callback || 'callback'
    const callbackName = '__callback' + Date.now() + Math.random().toString().slice(2)
    const timeout = options.timeout || 30000
    let timing = null
    function end () {
      clearTimeout(timing)
      delete window[callbackName]
      scriptEl.remove()
    }
    window[callbackName] = (res) => {
      console.log('jsonp res:', res)
      end()
      reso(res)
    }
    scriptEl.onerror = () => {
      end()
      rej()
    }
    timing = setTimeout(() => {
      end()
      rej()
    }, timeout)
    scriptEl.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + callbackKey + '=' + callbackName
    document.body.appendChild(scriptEl)
  })
}

// # 浏览器-复制文本
function copyText(text) {
  const inputEl = document.createElement('input');
  document.body.appendChild(inputEl);
  inputEl.value = text;
  inputEl.focus();
  inputEl.select();
  document.execCommand && document.execCommand('copy');
  inputEl.parentNode.removeChild(inputEl)
  return true
}

// # 浏览器-解析URL参数
function url2Obj(url) {
  url = url || window.location.href
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  search.replace(/([^?&=]+)=([^?&=]*)/g, (rs, $1, $2) => {
    obj[decodeURIComponent($1)] = String(decodeURIComponent($2))
    return rs
  })
  return obj
}

// # 浏览器-处理URL参数
function tansParams(params) {
  if (!params) return ''
  let result = '', encURI = encodeURIComponent;
  for (const key of Object.keys(params)) {
    const value = params[key]
    if (!value && value !== 0) continue;
    if (typeof value === 'object') {
      for (const subKey of Object.keys(value)) {
        const subValue = value[subKey];
        if (!subValue && subValue !== 0) continue;
        result += `${encURI(key + '[' + subKey + ']')}=${encURI(subValue)}&`
      }
    } else {
      result += `${encURI(key)}=${encURI(value)}&`
    }
  }
  return result.slice(0, -1)
}

// # 浏览器-全屏
function fullScreen(isFull, el) {
  el = el || (isFull ? document.documentElement : document)
  let rfs = el.requestFullScreen || el.webkitRequestFullScreen || 
    el.mozRequestFullScreen || el.msRequestFullScreen
  let cfs = el.cancelFullScreen || el.webkitCancelFullScreen ||
    el.mozCancelFullScreen || el.exitFullScreen
  console.log(rfs, cfs);
  if (isFull && rfs) return rfs.call(el)
  if (!isFull && cfs) return cfs.call(el)
  if (typeof window.ActiveXObject !== 'undefined') {
    var wscript = new ActiveXObject('WScript.Shell')
    wscript && wscript.SendKeys('{F11}')
  }
}

// # 浏览器-回到顶部或定位
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.getElementById('id').scrollIntoView({ behavior: 'smooth', block: 'start' }); // start center end
}

// # 浏览器-图片懒加载
function lazyImg() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.getAttribute('img-src')
        img.onload = () => { img.style.opacity = 1 }
        observer.unobserve(img)
      }
    })
  })
  Array.from(document.querySelectorAll('img[img-src]')).forEach((item) => observer.observe(item))
}

// # 浏览器-storage封装
function getStorage(key) {
  let result = localStorage.getItem(key)
  try {
    return JSON.parse(result)
  } catch {
    return result
  }
}
function setStorage(key, val) {
  if (!val && val !== 0) return localStorage.removeItem(key)
  localStorage.setItem(key, JSON.stringify(val))
}
function delStorage(key) {
  localStorage.removeItem(key)
}

// # 浏览器-移除HTML标签
function pureHtml(str) {
  if (!str) return ''
	try {
    str = decodeURI(str)
	} catch (e) {}
  str = str.replace(/<\/?[^>]*>/g, '') // 去除HTML tag
  str = str.replace(/[ | ]*\n/g, '\n') // 去除行尾空白
  // str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
  str = str.replace(/&nbsp;/ig, '') // 去掉空白
  str = str.replace(/ /ig, '') // 去掉空白
  return str
}

// # 浏览器-判断是否移动端
function isMobile() {
  const userAgent = navigator.userAgent.toLowerCase();
  // 判断是否包含移动设备的标志，包括鸿蒙系统和小米 HyperOS
  return /iphone|ipod|android|webos|blackberry|windows phone|ipad|mobile|phone|Kindle|opera mini|harmonyos|hyperos/i.test(userAgent);
}


// # 浏览器-解除复制限制
function canCopy() {
  function t(e) { e.stopPropagation(), e.stopImmediatePropagation && e.stopImmediatePropagation() }
  document.querySelectorAll("*").forEach(e => {
      "none" === window.getComputedStyle(e, null).getPropertyValue("user-select") && e.style.setProperty("user-select", "text", "important")
  }), ["copy", "cut", "contextmenu", "selectstart", "mousedown", "mouseup", "mousemove", "keydown", "keypress", "keyup"].forEach(function (e) {
      document.documentElement.addEventListener(e, t, {capture: !0})
  }), alert("解除限制成功啦！")
}

// # css-滚动条
// ::-webkit-scrollbar { width: 8px; height: 8px; }
// ::-webkit-scrollbar-thumb {	background-color: #ddd;	border-radius: 6px; }

// # 工具-防抖
// 一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
function debounce(fn, delay, isImmediate) { 
  let timer = null;
  return function() { 
    const context = this;
    let args = arguments;
    clearTimeout(timer);
    if(isImmediate && timer === null) {
      fn.apply(context, args);
      timer = 0;
      return;
    }
    timer = setTimeout(() => { 
      fn.apply(context, args);
      timer = null;
    }, delay);
  }
}

// # 工具-节流
// 在一定时间内，只能触发一次
function throttle(fn, delay) { 
  let lastTime = Date.now();
  return function() { 
    let args = arguments;
    const now = Date.now();
    if(now - lastTime >= delay){
      lastTime = now;
      fn.apply(this, args);
    }
  }
}

// # 工具-深度克隆
function deepClone(obj) {
	if ([null, undefined, NaN, false].includes(obj)) return obj
	if (typeof obj !== 'object' && typeof obj !== 'function') { // 原始类型直接返回
		return obj
	}
	const o = isArray(obj) ? [] : {}
	for (const i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
		}
	}
	return o
}

// # 工具-格式化日期
function timeFormat(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
  date = date || new Date()
	const timeSource = {
		'y': date.getFullYear().toString(), // 年
		'M': (date.getMonth() + 1).toString().padStart(2, '0'), // 月
		'd': date.getDate().toString().padStart(2, '0'), // 日
		'H': date.getHours().toString().padStart(2, '0'), // 时
		'h': date.getHours().toString().padStart(2, '0'), // 时
		'm': date.getMinutes().toString().padStart(2, '0'), // 分
		's': date.getSeconds().toString().padStart(2, '0') // 秒
	}
  for (const key in timeSource) {
    const [ret] = new RegExp(`${key}+`).exec(formatStr) || []
    if (ret) {
      // 年可能只需展示两位
      const beginIndex = key === 'y' && ret.length === 2 ? 2 : 0
      formatStr = formatStr.replace(ret, timeSource[key].slice(beginIndex))
    }
  }
  return formatStr
}

// # 工具-解析日期
function timeParse(str, formatStr) {
  if (formatStr) { // 必须包含年月日
    if (!/(?=.*yyyy)(?=.*MM)(?=.*dd).*/.test(formatStr)) return null;
    const regex = new RegExp(formatStr.replace(/yyyy/, '(\\d{4})').replace(/MM|dd/g, '(\\d{2})').replace(/HH|mm|ss/g, '(\\d{2})'));
    const matches = str.match(regex);
    if (!matches) return null;
    const year = matches[1], month = matches[2] - 1, day = matches[3];
    const hour = matches[4] || 0, minute = matches[5] || 0, second = matches[6] || 0;
    return new Date(year, month, day, hour, minute, second);
  }
  // 若未传入formatStr，则用new Date(str) 解析
  if (!str) return null
  // 若为unix秒时间戳，则转为毫秒时间戳
  if (/^\d{10}$/.test(str?.toString().trim())) 
    return new Date(str * 1000)
  // 若用户传入字符串格式时间戳，new Date无法解析，需做兼容
  if (typeof str === 'string' && /^\d+$/.test(str.trim())) 
    return new Date(Number(str))
	// 处理平台性差异，在Safari/Webkit中，new Date仅支持/作为分割符的字符串时间
	if (typeof str === 'string' && str.includes('-') && !str.includes('T'))
		return new Date(str.replace(/-/g, '/'))
	// 其他都认为符合 RFC 2822 规范
	return new Date(str)
}

// # 工具-Promise任意
function anyPromise(promises) {
  if (!promises.length) throw new Error("No Promise passed");

  return new Promise((resolve, reject) => {
    let errCount = 0, errs = [];
    promises.forEach((promise, index) => promise
      .then(data => resolve(data))
      .catch(err => {
        errs[index] = err;
        if (++errCount === promises.length) reject(new Error('No Promise resolved', errs))
      })
    )
  })
}

// # 工具-获取公网IP
function getPublicIp() {
  let proto = location.protocol === 'file:' ? 'http:' : location.protocol
  let urls = ['//ipv4.ipw.cn/api/ip/myip', '//4.ipw.cn', '//ifconfig.me/ip', '//myexternalip.com/raw'] //, 'http://ident.me', 'https://api.ipify.org'
  const fetchIp = (url) => new Promise((resolve) => {
    let startTime = Date.now()
    fetch(url).then(res => res.text()).then((data) => {
      if (data && data.length) {
        let arr = data.match(/([1-9][0-9]{0,2}\.){3}[1-9][0-9]{0,2}/ig)
        if (arr && arr.length) resolve({ip: arr[0], url: url, time: Date.now() - startTime})
      }
    }).catch(() => '')
  })

  return anyPromise(urls.map(url => fetchIp(`${proto}${url}`))).then(res => {
    console.log('******getPublicIp***', res);
    return res
  })
}

// # 工具-自定义转整数小数
function getValType(val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}
function parseFloatMy(val) {
  if (getValType(val) === 'undefined' || val === '' || isNaN(val)) return 0;
  return parseFloat(val);
}
function parseIntMy(val) {
  if (getValType(val) === 'undefined' || val === '' || isNaN(val)) return 0;
  return parseInt(val);
}

// # 工具-全局事件总线
class EventBus {
  constructor() {
    this.events = {}
  }
  // 注册事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }
  // 触发事件
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) =>  callback(...args))
    }
  }
  // 注销事件
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback)
    }
  }
}
window.$eventBus = new EventBus()


// # vue-全局注册
function vue3Global(app) {
  app.config.globalProperties.$goPage = goPage
  app.component('Test', Test)
  Vue.prototype.$goPage = goPage
  Vue.component('Test', Test)
}

// # uni-页面跳转
function goPage(url, type, timeout) {
  if (!url) return
  // uni.setStorageSync(url.split('?')[0].replaceAll('/', '_'), getUrlParamsByReg(url))
  if (timeout) {
    setTimeout(() => goPageDo(url, type), timeout)
  } else {
    goPageDo(url, type)
  }
}
function goPageDo(url, type) {
  if (!url) return
  const isTabBar = false
  if (!type) type = isTabBar ? 'switch' : 'navigate'
  type = (type + '').toLowerCase()
  console.log('$goPage', url, type);
  // 返回上n级, 负数自动转化为正
  if (Number.isInteger(url)) return uni.navigateBack({ delta: Math.abs(url) })
  // 跳转页面
  if (type === 'navigate' || type === 'navigateto') return uni.navigateTo({ url })
  // 重定向
  if (type === 'redirect' || type === 'redirectto') uni.redirectTo({ url })
  // 重新打开
  if (type === 'relaunch') uni.reLaunch({ url })
  // 重定向
  if (type === 'switch' || type === 'switchtab') uni.switchTab({ url })
}

// # uni-底部分页加载
function uniBottomPageLoad() {
  return {
    data: {
      dataStatus: 'loadmore', // loadmore: 加载更多, nomore: 没有更多 , loading: 正在加载
      dataList: [],
      params: { page: 1, limit: 10 }
    },
    onReachBottom() {
      this.getDataList()
    },
    methods: {
      getDataList() {
        if (this.dataStatus === 'loading' || this.dataStatus == 'nomore') return;
        this.dataStatus = 'loading'
        Api.getXXXList({ ...this.params }).then(res => {
          if (res.success) {
            this.dataList = this.dataList.concat((res.data || []).map(item => ({ ...item })))
            this.params.page++;
          }
          this.dataStatus = res.data && res.data.length ? 'loadmore' : 'nomore'
        }).catch(() => this.dataStatus = 'loadmore')
      },
    }
  }
}

// # uni-request
function uniRequest(getToken) {
  const timeout = 30000
  const baseUrl = config.baseUrl // import.meta.env.VITE_APP_BASE_API  process.env.VUE_APP_BASE_API

  const request = config => {
    config.header = config.header || {}
    if (getToken() && !config.noToken) {
      config.header['Authorization'] = 'Bearer ' + getToken()
    }
    if (config.params) {
      config.url = ((config.url.includes('?') ? '&' : '?') + tansParams(config.params))
    }
    return new Promise((resolve, reject) => {
      uni.request({
        method: config.method || 'GET',
        timeout: config.timeout ||  timeout,
        url: config.url.startsWith('http') ? config.url : (baseUrl + config.url),
        data: config.data,
        header: config.header,
        // dataType: 'json',
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data || {})
            // 其他项目级别返回code自行处理
          } else {
            uni.showToast({ title: '后端接口' + res.statusCode + '异常', icon: 'none' })
            reject('后端接口' + res.statusCode + '异常')
          }
        },
        fail(err) {
          console.log(err)
          uni.showToast({ title: '后端接口请求错误', icon: 'none' })
          reject(err)
        }
      })
    })
  }
  request.get = (url, config = {}) => request({ url, ...config })
  request.put = (url, data, config = {}) => request({ url, method: 'PUT', data,  ...config })
  request.post = (url, data, config = {}) => request({ url, method: 'POST', data,  ...config })

  // export default request
}

// # 正则-中文
function isChinese(val) {
  return (/^[\u4e00-\u9fa5]+$/gi).test(val)
}

// # 正则-字母数字
function isEnNum(val) {
  return (/^[0-9a-zA-Z]*$/g).test(val)
}

// # 正则-邮箱
function isEmail(val) {
  return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(val)
}


// # 校验-是否对象
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

// # 其他-自定义notify
window.dnotifyTimer = null
function dnotify(txt, time) {
  clearTimeout(dnotifyTimer)
  if (document.getElementById('dnotify')) {
    document.getElementById('dnotify').innerHTML = txt
    document.getElementById('dnotify').style.display = 'block';
  } else {
    var notEle = document.createElement('div');
    notEle.id = 'dnotify'
    notEle.innerHTML = txt;
    notEle.style = `display: flex; min-width: 330px;max-width: 40%; padding: 12px 16px 12px 16px; color:#333; box-sizing: border-box; border: 1px solid #ebeef5; 
    position: fixed; background-color: #fff; top:16px;right:16px;z-index: 9999999; box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); text-align: center;justify-content: center;
    transition: opacity .3s,transform .3s,left .3s,right .3s,top .4s,bottom .3s;  overflow: hidden;font-size: 14px;line-height: 1.4; border-radius: 8px; `
    document.body.append(notEle)
  } 
  dnotifyTimer = setTimeout(function(){ document.getElementById('dnotify').style.display = 'none'; }, time ? time : 3000)
}

function logs(val, title) {
  title && console.log("%c --- " + title + ' start log ---', 'background: #409EFF;color:#fff;padding:2px 4px;font-size:14px;')
  console.log(val);
  title && console.log("%c --- " + title + ' end log ---', 'background: #409EFF;color:#fff;padding:2px 4px;font-size:14px;')
}