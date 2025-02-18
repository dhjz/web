
window.baseHostPort = getStorage('baseHostPort') || location.host
window.baseApi = `http://${window.baseHostPort}/control-api`;
function request(options, temp) {
  let opts = temp
  if (typeof options != 'string') {
    opts = options
  }
  let { url, method = 'GET', params = {}, data = null, headers, isFile } = opts || {};
  if (typeof options == 'string') url = options

  // 将查询参数转换为URL编码字符串
  const queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');

  // 构建完整的请求URL
  let finalUrl = url + (url.includes('?') ? '&' : '?') + queryString;
  finalUrl = finalUrl.includes('http') ? finalUrl : `${baseApi}${finalUrl}`

  // 设置请求头部
  if (!headers) {
    headers = {}
    if (data && !isFile) headers['Content-Type'] = 'application/json'
  }

  // 发起Fetch请求
  return new Promise((resolve, reject) => {
    fetch(finalUrl, { method, headers, body: isFile ? data : data ? JSON.stringify(data) : null }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return res.json();
    }).then(r => resolve(r)).catch(e => reject(e));
  });
}

function $q(val) {
  return document.querySelector(val)
}

function $qa(val) {
  return Array.from(document.querySelectorAll(val))
}

function logs(...val) {
  document.getElementById('logs').innerHTML = (val || []).join('  ')
}   

function getFileType(val) {
  if (/\.(jpg|jpeg|png|gif)$/i.test(val)) return 'img'
  if (/\.(mp4|avi|mov|wmv|flv)$/i.test(val)) return 'video'
  if (/\.(mp3|wav|wma|aac)$/i.test(val)) return 'music'
  if (/\.(doc|docx|odt)$/i.test(val)) return 'doc'
  if (/\.(xls|xlsx)$/i.test(val)) return 'xls'
  if (/\.(ppt|pptx)$/i.test(val)) return 'ppt'
  if (/\.(pdf)$/i.test(val)) return 'pdf'
  if (/\.(txt|ini|properties|yml|json|md)$/i.test(val)) return 'txt'
  if (/\.(java|html|htm|css|js|php|h|go|)$/i.test(val)) return 'code'
  if (/\.(zip|rar|7z|tar\.gz|tar\.bz2)$/i.test(val)) return 'zip'
  return 'other'
}

var timerId;
function throttle(func, delay) {
  if (timerId) return;

  timerId = setTimeout(function () {
    func();
    timerId = undefined;
  }, delay);
};

function loadScript(url, globalName) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(url)
    // 已经加载过改js
    if (globalName && window[globalName]) {
      console.log(globalName + ' 已经被加载过')
      return resolve(window[globalName])
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    script.onload = () => {
      resolve(globalName && window[globalName])
    }
    script.onerror = (e) => {
      console.log('script load err', url);
      resolve(null)
    }
    const head = document.getElementsByTagName('head')[0];
    (head || document.body).appendChild(script)
  })
}

// 长按指令
window.longtapDc = {
  mounted(el, binding, vnode) {
    let val = binding.value
    if (typeof val !== "function") return;
  
    let pressTimer = null
  
    let start = (e) => {
      if (e instanceof MouseEvent && e.type === "click" && e.button !== 0) return;
      if (pressTimer === null) pressTimer = setTimeout(() => val(e), 500);
    }
  
    let cancel = () => {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);
  
    el.addEventListener("click", cancel);
    el.addEventListener("mouseup", cancel);
    el.addEventListener("mouseout", cancel);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchcancel", cancel);
  }
}

// 注册组件
async function syncAllComponents(app) {
  app = app || window.appIns
  const components = window.SYNC_COMPONENTS || []

  await Promise.all(components.map(async (name) => {
    const winName = `${name}Comp`;
    await loadScript(`./js/components/${name}.js`, winName);
    console.log('syncAllComponents... ', winName);
    window[winName] && app.component(name, window[winName]);
  }));
}

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
      this.events[eventName].forEach((callback) => {
        callback(...args)
      })
    }
  }

  // 注销事件
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback)
    }
  }
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
function delStorage(key) {
  localStorage.removeItem(key)
}

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
    /*notEle.style = `min-width: 380px;box-sizing: border-box;border-radius: 4px;border: 1px solid rgb(235, 238, 245);position: fixed;left: 50%;top: 20px;transform: translateX(-50%);background-color: rgb(237, 242, 252);
overflow: hidden;padding: 12px 15px 12px 20px;display: flex;align-items: center;justify-content: center;color: rgb(103, 194, 58);font-size: 14px;line-height: 1;box-shadow: 3px 3px 9px #bbb;text-align: center;` */
    notEle.style = `display: flex; min-width: 330px;max-width: 40%; padding: 12px 16px 12px 16px; border-radius: 8px; box-sizing: border-box; border: 1px solid #ebeef5; position: fixed; background-color: #fff;top:16px;right:16px;z-index: 9999999;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);  transition: opacity .3s,transform .3s,left .3s,right .3s,top .4s,bottom .3s;  overflow: hidden;font-size: 14px;line-height: 1.4;text-align: center;justify-content: center;color:#333;`
    document.body.append(notEle)
  } 
  dnotifyTimer = setTimeout(function(){ document.getElementById('dnotify').style.display = 'none'; }, time ? time : 1500)
}  

function $copy(text) {
  let inputElement = document.createElement('input');
  inputElement.value = text;
  document.body.appendChild(inputElement)
  inputElement.select()
  document.execCommand('copy', true);
  inputElement.parentNode.removeChild(inputElement)
  return true
}
// window.addEventListener('keydown', (ev) => {
//     logs('Key code:', ev.keyCode, ev.key);
//     setTimeout(() => {
//         if (ev.keyCode === 33) { // Page Up
//         logs('Volume Up Key Detected');
//         } else if (ev.keyCode === 34) { // Page Down
//             logs('Volume Down Key Detected');
//         }
//     }, 1000)
// }); 

// function unGzip(blob) {
//     return new Promise(reso => {
//         const reader = new FileReader()
//         reader.onload = function(e) {
//             try {
//                 reso(pako.ungzip(new Uint8Array(e.target.result)))
//             } catch (e) {
//                 console.log('unGzip error', e);
//                 reso(null)
//             }
//         }
//         reader.onerror = () => reso(null)
//         reader.readAsArrayBuffer(blob)
//     })
// }
