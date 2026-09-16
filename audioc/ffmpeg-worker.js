/**
 * ffmpeg-worker.js — 在 Web Worker 里跑 FFmpeg wasm，主线程不卡。
 *
 * 协议（主线程 → worker）：
 *   { id, type:'run', args:[...], files:[{name, data:ArrayBuffer}, …],
 *     outputs:['/out/out.mp3'] }
 *   注：files[i].name 仅作显示用；输入落盘规则见 handleMessage 里的说明
 *       （第 1 个 → /input/input.bin，第 2 个起 → /input/f2.bin、/input/f3.bin …）。
 *       旧的单输入写法 { input:{name,data} } 仍然兼容。
 *   { id, type:'run', args:[...], files:[…], joinInputs:true, outputs:[…] }
 *     joinInputs = true 时改成「把各输入字节按顺序拼成一个 /input/joined.bin」
 *     （页面用它做同格式秒合并：拼接 + -c:a copy 重封装，只对 mp3 这类纯帧流安全）。
 *   { id, type:'ping' }
 *   主线程 ← worker：
 *   { id, type:'log',   text }        实时日志
 *   { id, type:'done',  exitCode, outputs:[{path,data:ArrayBuffer,size}] }
 *   { id, type:'error', message }
 *
 * wasm 里没有真实磁盘，全靠 Emscripten 的 MEMFS：
 * 先把输入写进 FS，跑完再读出来，字节 transferable 回主线程。
 */

// =====================================================================
//  角色判定必须放在最前
//
//  本文件既是「容器 worker」的脚本，也是「pthread 子 worker」的脚本：
//  emscripten 起线程用的是 new Worker(_scriptName)，而 core 里
//  _scriptName = self.location.href ＝ 本文件（core 无法像老版本那样用
//  mainScriptUrlOrBlob 指定别的路径）。子 worker 加载本文件后，
//  importScripts 的 core 末尾会执行 `isPthread && createFFmpegCore()`，
//  把它引导成线程 worker，并注册好 emscripten 自己的 self.onmessage。
//  所以子 worker 里绝不能覆盖 self.onmessage，否则线程收不到 cmd 1/cmd 2，
//  表现为父 worker 卡在等第一帧：日志停住、不报错、一直转圈。
//
//  角色判据用两条：emscripten 传的 name 选项，以及容器在 URL 上加的 #em-pthread 标记。
//  两者都要有兜底 —— core 内部（`isPthread = globalThis.name == 'em-pthread'`）
//  只认 name，一旦环境把 name 丢了，整个线程引导都会失效，所以标记出现时把 name 补上。
// =====================================================================
const NATIVE_NAME = (typeof globalThis.name === 'string' && globalThis.name) || '(空)';
const LOCATION_HREF = (globalThis.location && globalThis.location.href) || '';
const MARKED_THREAD = (globalThis.location && globalThis.location.hash) === '#em-pthread';
if (MARKED_THREAD && NATIVE_NAME !== 'em-pthread') {
  try {
    Object.defineProperty(globalThis, 'name', { value: 'em-pthread', configurable: true });
  } catch (e) { try { globalThis.name = 'em-pthread'; } catch (e2) { /* 只读，交给诊断输出 */ } }
}
const WORKER_NAME = (typeof globalThis.name === 'string' && globalThis.name) || '(空)';
const IS_PTHREAD_WORKER = WORKER_NAME === 'em-pthread';

/**
 * 诊断日志（三条通道一起发，见 index.html 的同名 BroadcastChannel 监听）：
 *  1. console —— F12 直接可见；
 *  2. BroadcastChannel —— **关键通道**：容器在 callMain 期间 JS 事件循环停摆
 *     （同步跑 wasm，最后阻塞在 Atomics.wait 等帧），它收不到也处理不了子 worker 的
 *     postMessage；页面主线程此时是空闲的，所以子 worker 直连页面才看得到日志；
 *  3. core 的 cmd 9 通道 —— 容器空闲时走常规 printErr 路径。
 */
const beacon = (tag, text) => {
  const line = '[' + tag + '] ' + text;
  try { console.log(line); } catch (e) {}
  try { self.postMessage({ cmd: 9, handler: 'printErr', args: [line] }); } catch (e) {}
  try {
    const ch = new BroadcastChannel('ffmpeg-wasm-diag');
    ch.postMessage({ text: line });
    ch.close();
  } catch (e) { /* 个别环境没有 BroadcastChannel */ }
};

// 无条件上报（必须在任何 name 判断之前）：确认「本文件到底有没有被执行、name 是什么」。
// 若这行都没出现，说明线程 worker 的脚本压根没跑起来（URL/加载被拦）。
beacon(IS_PTHREAD_WORKER ? 'pthread' : 'worker',
  `脚本开始执行 name=${WORKER_NAME}（环境给的 name=${NATIVE_NAME}·标记=${MARKED_THREAD}）`
  + ` url=${LOCATION_HREF} SAB=${typeof SharedArrayBuffer} isolated=${globalThis.crossOriginIsolated}`);

if (IS_PTHREAD_WORKER) {
  self.addEventListener('error', (e) => beacon('pthread', 'error: ' + ((e && (e.message || e.error)) || e)));
  self.addEventListener('unhandledrejection', (e) =>
    beacon('pthread', 'rejection: ' + ((e && e.reason && (e.reason.stack || e.reason)) || e)));
}

try {
  importScripts('ffmpeg-core.js');
} catch (e) {
  if (!IS_PTHREAD_WORKER) throw e;   // 容器里失败就没法干活了
  beacon('pthread', 'core 加载/自举失败: ' + ((e && (e.stack || e.message)) || e));
}

if (IS_PTHREAD_WORKER) {
  // 旁听收到的每一条 core 协议消息（用 addEventListener，不干扰 core 自己的 onmessage）。
  // 这条最关键：能区分「core 没自举、收不到 cmd」和「收到了 cmd 但线程没跑起来」。
  self.addEventListener('message', (ev) => {
    const d = ev.data || {};
    beacon('pthread', '收到 cmd=' + d.cmd
      + (d.cmd === 1 ? ` handlers=${JSON.stringify(d.handlers || [])}`
          + ` wasmModule=${!!d.wasmModule} wasmMemory=${!!d.wasmMemory}` : '')
      + (d.cmd === 2 ? ' pthread_ptr=' + d.pthread_ptr : ''));
  });

  // core 自举成功的标志就是它自己装了 onmessage（cmd 1 之后会被它换成内部实现）
  beacon('pthread', 'core 已加载；emscripten 的 onmessage 已注册=' + (typeof self.onmessage === 'function'));

  // 线程在跑时子 worker 的 JS 事件循环被占住，心跳不会来；
  // 因此“有心跳”= 它空闲（没在干活），“没心跳”= 它在执行线程入口。
  setInterval(() => beacon('pthread', '心跳：子 worker 空闲中'), 5000);
}

const post = (msg) => self.postMessage(msg);

// 当前正在跑的 job 的日志回调（同一时刻只跑一个任务）
let currentSink = null;
const emit = (t) => post({ type: 'log', text: String(t) });

// 这份 core 是「多线程（pthreads）」构建：FFmpeg 6.1 的 CLI 每条输入流都会
// pthread_create 一个解码线程，而 Emscripten 的 pthread 依赖 SharedArrayBuffer，
// 后者只在跨域隔离（COOP/COEP 响应头）的页面里才有。拿不到就会直接失败，
// FFmpeg 报 “pthread_create() failed: Resource temporarily unavailable”。
const hasThreading = () => typeof SharedArrayBuffer !== 'undefined';

// =====================================================================
//  线程 worker 交给「页面」创建，容器只拿一个代理对象
//
//  实测：在 worker 里 new Worker(...)（嵌套 worker）在这个环境里起不来 ——
//  子 worker 对象能建出来，但它的脚本从不执行，也不报 error（父 worker 就永远卡在
//  等帧，日志停在 Press [q] to stop）。而页面自己建的 worker（就是本容器）一切正常。
//  所以改成：容器请求页面建线程 worker，消息双向经页面中转（见 index.html 的
//  handleThreadMsg）。对 emscripten 透明 —— 它只用到 postMessage / onmessage /
//  onerror / terminate / pthread_ptr，代理对象都实现了。
//  注意这些声明必须在模块作用域：handleMessage 也要用 THREAD_PROXIES。
// =====================================================================
const THREAD_PROXIES = new Map();
let threadSeq = 0;

function makeThreadProxy(url) {
  const tid = ++threadSeq;
  const proxy = {
    onmessage: null,
    onerror: null,
    pthread_ptr: 0,
    // 中转没有真正的 transfer 语义，可转移对象会被结构化克隆复制一份
    // （pthread 流程里 transferList 是空的，共享内存本来就是共享的）
    postMessage(msg) {
      try {
        self.postMessage({ __thread: 'to', tid: tid, msg: msg });
      } catch (e) {
        beacon('thread', '代理转发失败: ' + ((e && (e.message || e)) || e));
      }
    },
    terminate() {
      self.postMessage({ __thread: 'terminate', tid: tid });
    },
  };
  THREAD_PROXIES.set(tid, proxy);
  if (typeof url === 'string' && url.indexOf('#') < 0) url += '#em-pthread';
  self.postMessage({ __thread: 'new', tid: tid, url: url });
  beacon('thread', '线程由页面创建（tid=' + tid + '）→ ' + url);
  return proxy;
}

// =====================================================================
//  容器侧诊断：把所有“会被静默吞掉”的异常都翻译到页面日志
//
//  emscripten 起线程时会在内部 new Worker(...) + postMessage(共享内存/模块)，
//  这些代码跑在 async 函数里（PThread.loadWasmModuleToWorker），一旦抛错就只是
//  一个未处理的 Promise rejection —— 页面只看到「一直转圈」，日志里什么都没有。
//  这里把 unhandledrejection / error / postMessage 失败全部转发到日志，
//  方便对照子 worker 的 [pthread] 行判断卡在哪一步。
// =====================================================================
if (!IS_PTHREAD_WORKER) {
  const logLine = (s) => post({ type: 'log', text: s });
  self.addEventListener('unhandledrejection', (e) => {
    const r = e && e.reason;
    logLine('[rejection] ' + ((r && (r.stack || r.message)) || r));
  });
  self.addEventListener('error', (e) => {
    logLine('[error] ' + ((e && (e.message || e.error)) || e));
  });
  // 共享内存/模块往线程 worker 传的时候最容易在这里失败（DataCloneError 等）
  try {
    const proto = self.Worker.prototype;
    const nativePost = proto.postMessage;
    proto.postMessage = function (msg, transfer) {
      try {
        return nativePost.call(this, msg, transfer);
      } catch (err) {
        logLine('[postMessage] 向线程 worker 传参失败: ' + ((err && (err.message || err)) || err)
          + `（cmd=${msg && msg.cmd}）`);
        throw err;
      }
    };
  } catch (e) { /* 环境不支持就算了 */ }

  // emscripten 建线程 worker（带 name: 'em-pthread'）时换成交给页面创建的代理，
  // 其它 Worker 原样透传。代理实现见模块顶部的 makeThreadProxy。
  try {
    const NativeWorker = self.Worker;
    self.Worker = function (url, opts) {
      if (!(opts && opts.name === 'em-pthread')) return new NativeWorker(url, opts);
      return makeThreadProxy(url);
    };
  } catch (e) { logLine('[thread] 无法包装 Worker 构造器: ' + e); }
}

const NO_SAB_HINT =
  '当前页面没有 SharedArrayBuffer（未跨域隔离），wasm 的多线程不可用，FFmpeg 无法创建解码线程。' +
  '页面里的 coi-serviceworker.js 会用 Service Worker 补上 COOP/COEP（首次访问会自动刷新一次）；' +
  '若仍失败，请确认地址是 https:// 或 http://localhost（安全上下文），' +
  '且页面没有被嵌在未隔离的 iframe 里。';

async function handleMessage(ev) {
  const msg = ev.data || {};

  // 页面中转回来的线程 worker 消息（见上面 makeThreadProxy 的说明），
  // 按 emscripten 期望的事件形状回调 proxy.onmessage / proxy.onerror
  if (msg.__thread === 'from' || msg.__thread === 'error') {
    const proxy = THREAD_PROXIES.get(msg.tid);
    if (!proxy) return;
    if (msg.__thread === 'from') {
      const d = msg.msg || {};
      if (d.cmd) beacon('thread', '← cmd=' + d.cmd + (d.handler ? '(' + d.handler + ')' : ''));
      if (typeof proxy.onmessage === 'function') proxy.onmessage({ data: msg.msg });
    } else if (typeof proxy.onerror === 'function') {
      beacon('thread', '线程 worker 报错: ' + msg.message);
      proxy.onerror({ message: msg.message });
    }
    return;
  }

  if (msg.type === 'ping') {
    // 预热：真的把 wasm 编译一次，之后每次 run 就快了
    getCore().then(() => post({ id: msg.id, type: 'pong', sab: hasThreading() }))
             .catch((e) => post({ id: msg.id, type: 'error', message: String(e) }));
    return;
  }
  if (msg.type !== 'run') return;

  const { id, args = [], input, files = [], joinInputs = false, outputs = [] } = msg;
  currentSink = (t) => post({ id, type: 'log', text: t });

  if (!hasThreading()) {
    currentSink = null;
    post({ id, type: 'error', message: NO_SAB_HINT });
    return;
  }

  // 环境诊断：卡住时这几项能直接定位问题（也便于对照子 worker 的心跳）
  post({ id, type: 'log', text: `[env] worker=${self.location.href}`
    + ` · SAB=${hasThreading()} · crossOriginIsolated=${globalThis.crossOriginIsolated}`
    + ` · cores=${navigator.hardwareConcurrency}` });

  try {
    const core = await getCore();

    // 1) 准备 MEMFS 目录 + 写入输入
    //    每次跑先清掉上次残留，避免「读到的其实是上回的产物」
    mkdirp(core, '/input');
    mkdirp(core, '/output');
    cleanDir(core, '/input');
    cleanDir(core, '/output');
    // 输入落盘规则（页面上显示的「输入路径」与它一致，多文件时按这个写命令行）：
    //   第 1 个文件 → /input/input.bin（既有命令、内置示例、文档都按这个路径写，保持兼容）
    //   第 2 个起    → /input/f2.bin、/input/f3.bin …（序号＝页面列表里的序号）
    // 不额外复制一份：单文件时路径仍是 /input/input.bin，多文件时每个文件各占一份。
    const list = files.length ? files : (input && input.data ? [input] : []);
    if (joinInputs && list.length > 1) {
      // 同格式「秒合并」：把各输入的字节按顺序拼成一个文件，命令行用
      // -i /input/joined.bin + -c:a copy 重封装（省掉解码+编码）。
      // 只对 mp3 这类纯帧流安全 —— 页面侧按探测到的编码/采样率/声道限制，不满足不会走这里。
      const parts = list.map((fd) => new Uint8Array(fd.data));
      const total = parts.reduce((n, p) => n + p.length, 0);
      const joined = new Uint8Array(total);
      let off = 0;
      for (const p of parts) { joined.set(p, off); off += p.length; }
      core.FS.writeFile('/input/joined.bin', joined);
    } else {
      list.forEach((fd, idx) => {
        if (!fd || !fd.data) return;
        const p = idx === 0 ? '/input/input.bin' : '/input/f' + (idx + 1) + '.bin';
        core.FS.writeFile(p, new Uint8Array(fd.data));
      });
    }

    // 2) 执行
    let exitCode = 0;
    try {
      exitCode = core.callMain(args) ?? 0;
    } catch (e) {
      if (e && typeof e.status === 'number') exitCode = e.status;  // 正常退出
      else throw e;
    }

    // 3) 收集产物
    const results = [];
    for (const p of outputs) {
      try {
        const data = core.FS.readFile(p);
        results.push({ path: p, data: data.slice().buffer, size: data.length });
      } catch (e) { /* 未生成该文件 */ }
    }

    post({ id, type: 'done', exitCode, outputs: results });
  } catch (err) {
    post({ id, type: 'error', message: String((err && (err.message || err.stack)) || JSON.stringify(err)) });
  } finally {
    currentSink = null;
  }
}

if (!IS_PTHREAD_WORKER) {
  self.onmessage = handleMessage;
}

/** 清空目录内容（保留目录本身） */
function cleanDir(core, p) {
  try {
    for (const f of core.FS.readdir(p)) {
      if (f === '.' || f === '..') continue;
      const full = p + '/' + f;
      try { if (core.FS.isDir(core.FS.stat(full).mode)) core.FS.rmdir(full); }
      catch (e) { try { core.FS.unlink(full); } catch (_) {} }
    }
  } catch (e) { /* 目录还不存在 */ }
}

/** 递归建目录（MEMFS 不会自动建父目录） */
function mkdirp(core, p) {
  const parts = p.split('/').filter(Boolean);
  let cur = '';
  for (const seg of parts) {
    cur += '/' + seg;
    try { core.FS.mkdir(cur); } catch (e) { /* 已存在 */ }
  }
}

/**
 * 每次都建一个全新的 core 实例。
 *
 * 为什么不复用？FFmpeg 是「跑一次就退出」的 CLI，内部有大量全局状态
 * （av_log 回调、一次性的 filter/编解码器注册等）。同一个实例连续
 * callMain 第二次会踩到野指针（memory access out of bounds）。
 * 每次新建实例 + 用完丢弃，是 ffmpeg.wasm 生态里最稳的做法。
 * worker 线程本身可以复用，省掉重复起线程的开销。
 */
function getCore() {
  return createFFmpegCore({
    // 产物重命名过（ffmpeg_g.wasm -> ffmpeg-core.wasm），这里做映射
    locateFile: (f) => (f.endsWith('.wasm') ? 'ffmpeg-core.wasm' : f),
    noInitialRun: true,
    // FFmpeg 的 stdout/stderr 都走这里
    print: (t) => (currentSink || emit)(t),
    printErr: (t) => (currentSink || emit)(t),
  });
}
