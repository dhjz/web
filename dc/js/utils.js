
function request(options, temp) {
  let baseApi = `http://${window.baseHostPort}/control-api`;
  let opts = temp
  if (typeof options != 'string') {
    opts = options
  }
  let { url, method = 'GET', params = {}, data = null } = opts || {};
  if (typeof options == 'string') url = options

  // 将查询参数转换为URL编码字符串
  const queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');

  // 构建完整的请求URL
  let finalUrl = url + (url.includes('?') ? '&' : '?') + queryString;
  finalUrl = finalUrl.includes('http') ? finalUrl : `${baseApi}${finalUrl}`

  // 设置请求头部
  const headers = {};
  if (data) headers['Content-Type'] = 'application/json'

  // 发起Fetch请求
  return new Promise((resolve, reject) => {
    fetch(finalUrl, { method, headers, body: data ? JSON.stringify(data) : null }).then(res => {
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
  for (let i = 0; i < components.length; i++) {
    const name = components[i];
    winName = `${name}Comp`
    await loadScript(`./js/components/${name}.js`, winName)
    console.log('syncAllComponents... ', winName);
    window[winName] && app.component(name, window[winName])
  }
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