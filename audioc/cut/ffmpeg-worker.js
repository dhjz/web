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
 *   { id, type:'run', args:[…], files:[…], outputs:[…], fixDuration:true }
 *     fixDuration = true 时，done 消息会多带一个 needFixDuration:[…] ——
 *     里面是「时长写在编码器元数据里、-c copy 改不动」的产物路径（目前只有 FLAC）。
 *     ⚠ 修正**不在这里做**：callMain 跑完 emscripten 已 exit()，二次调用会
 *       `memory access out of bounds`。主线程拿到列表后自己再起一个 worker 补跑。
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

// 「时长写在编码器元数据里、-c copy 改不动」的格式 → 修它要用什么参数。
// 目前只有 FLAC：它没有容器头，时长写在 STREAMINFO（编码器产物）里，
// copy 只照抄源文件的采样数 → 文件信息里"总时间"还是裁剪前的，播放器进度条不准。
// FLAC 是无损编码，重写一遍只是换个头、PCM 逐字节一致，所以代价可以忽略。
// 其它格式**绝不能**加进来（那要么有损、要么本来就正常）。
const LOSSLESS_DURATION_REWRITE = { flac: ['-c:a', 'flac'] };

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
    getCore().then(() => post({ id: msg.id, type: 'pong', sab: hasThreading(),
                                wasm: wasmInfo() }))
             .catch((e) => post({ id: msg.id, type: 'error', message: String(e) }));
    return;
  }
  // ⚡ preload：页面在「复用引擎」模式下先把源文件交进来。
  //   之后每条 keepAlive 命令都直接用 MEMFS 里这份字节，不再走
  //   「主线程读文件 → transfer → worker 写 MEMFS」这条每次都要重付的路。
  if (msg.type === 'preload') {
    try {
      const core = await getCore();
      mkdirp(core, '/input');
      mkdirp(core, '/output');
      cleanDir(core, '/input');
      cleanDir(core, '/output');
      (msg.files || []).forEach((fd, idx) => {
        if (!fd || !fd.data) return;
        core.FS.writeFile(idx === 0 ? '/input/input.bin' : '/input/f' + (idx + 1) + '.bin',
                          new Uint8Array(fd.data));
      });
      post({ id: msg.id, type: 'ready' });
    } catch (e) {
      post({ id: msg.id, type: 'error', message: 'preload 失败：' + ((e && (e.message || e)) || e) });
    }
    return;
  }

  if (msg.type !== 'run') return;

  const { id, args = [], input, files = [], joinInputs = false, outputs = [],
          outputsData = [], fixDuration = false, fixDurationOnly = false } = msg;
  currentSink = (t) => post({ id, type: 'log', text: t });

  if (!hasThreading()) {
    currentSink = null;
    post({ id, type: 'error', message: NO_SAB_HINT });
    return;
  }

  // ⚡ keepAlive：同一个 worker 里**连续跑多条命令**，不再每条命令起一个新 worker。
  //
  //  为什么值得做：`-i` 探测一次、剪裁一次、FLAC 修头一次，各起一个 worker 时，
  //  每个新 worker 都要重新 importScripts core、重新 instantiate wasm（冷启动开销），
  //  还要把整个源文件在主线程读一遍、结构化克隆一遍、再写进新 worker 的 MEMFS。
  //  100MB 的文件光这项「搬字节」就是明显的耗时。keepAlive 时源文件在 MEMFS 里
  //  原地不动，后续命令零拷贝。
  //
  //  ⚠ 但**只有安全类的命令**能用它。FFmpeg 是「跑一次就退出」的 CLI，内部有大量
  //  全局状态（av_log 回调、一次性的编解码器/滤镜注册、静态缓冲区）。同一个
  //  emscripten 实例连续 callMain 第二次会踩到野指针 —— 实测抛
  //  `memory access out of bounds`，而且**产物其实已经写出来了**，极易误判成命令写错。
  //  所以 keepAlive 只在明确安全时才走：纯探测（不给输出文件、只读 1 帧/null muxer）。
  //  真正会写产物的命令一律单跑，跑完即弃（见注释里的 getCore）。
  if (msg.keepAlive && !msg.fixDurationOnly) {
    try {
      const core = await getCore();
      mkdirp(core, '/input');
      mkdirp(core, '/output');
      cleanDir(core, '/input');
      cleanDir(core, '/output');
      const list = files.length ? files : (input && input.data ? [input] : []);
      list.forEach((fd, idx) => {
        if (!fd || !fd.data) return;
        core.FS.writeFile(idx === 0 ? '/input/input.bin' : '/input/f' + (idx + 1) + '.bin',
                          new Uint8Array(fd.data));
      });
      // 每次跑之前把「命令要用的输入」重新写回 MEMFS（上一条 keepAlive 命令可能清过目录）
      let exitCode = 0;
      try {
        exitCode = core.callMain(args) ?? 0;
      } catch (e) {
        if (e && typeof e.status === 'number') exitCode = e.status;
        else if (/memory access out of bounds|already exited|Aborted/.test(String((e && e.message) || e))) {
          // 命中已知的「同实例二次运行」问题 → 明确回报，让页面退回「一条命令一个 worker」。
          // 绝不静默：这条路径上产物可能已经建出来了，报「成功」会让用户拿到残废文件。
          post({ id, type: 'error', message: 'keepAlive 复用失败（' + ((e && e.message) || e) + '）', reuseFailed: true });
          return;
        } else throw e;
      }
      const results = [];
      for (const p of outputs) {
        try {
          const data = core.FS.readFile(p);
          results.push({ path: p, data: data.slice().buffer, size: data.length });
        } catch (e) { /* 未生成 */ }
      }
      post({ id, type: 'done', exitCode, outputs: results, needFixDuration: [] });
    } catch (err) {
      post({ id, type: 'error', message: String((err && (err.message || err)) || err), reuseFailed: true });
    } finally {
      currentSink = null;
    }
    return;
  }

  // ⚡ 专用通道：只做「时长字段重写」，跑完直接返回。
  // 单独走一条路（而不是在主流程里再调一次 callMain）有两个原因：
  //   ① 主流程那次 callMain 已经把 emscripten 跑到了 exit()，同一 worker 里再调会
  //      抛 `memory access out of bounds`（实测）；
  //   ② 这条路不需要页面把源文件再传一遍吗？—— 需要，所以参数里仍带 files。
  if (msg.fixDurationOnly) {
    const outList = outputs || [];
    try {
      const core = await getCore();
      mkdirp(core, '/input');
      mkdirp(core, '/output');
      cleanDir(core, '/input');
      cleanDir(core, '/output');
      const list = files || [];
      list.forEach((fd, idx) => {
        if (!fd || !fd.data) return;
        core.FS.writeFile(idx === 0 ? '/input/input.bin' : '/input/f' + (idx + 1) + '.bin',
                          new Uint8Array(fd.data));
      });
      // ⚠ 待修的产物**也是新 worker 里的输入**：这是全新 worker，MEMFS 是空的，
      //   不存在刚才那个 worker 建出来的 /output/out.flac。页面会把「上一次的产物字节」
      //   作为 files 的第 2 个起传进来，这里按传入顺序落回 /output/ 原路径。
      //   files[0] 是源文件（/input/input.bin），files[1..] 与 outList 一一对应。
      (msg.outputsData || []).forEach((fd, i) => {
        if (!fd || !fd.data || !outList[i]) return;
        const dest = outList[i];
        mkdirp(core, dest.replace(/\/[^/]*$/, '') || '/');
        core.FS.writeFile(dest, new Uint8Array(fd.data));
      });
      const results = [];
      for (const p of outList) {
        const ext = (p.split('.').pop() || '').toLowerCase();
        const enc = LOSSLESS_DURATION_REWRITE[ext];
        if (!enc) continue;
        if (!core.FS.analyzePath(p).exists) continue;
        const tmp = p.replace(/\.[^.]+$/, '') + '__fixed.' + ext;
        let rc = 0;
        try {
          rc = core.callMain(['-hide_banner', '-v', 'error', '-nostdin', '-y',
                              '-i', p].concat(enc, [tmp])) ?? 0;
        } catch (e) { if (!(e && typeof e.status === 'number')) rc = -1; }
        if (rc === 0 && core.FS.analyzePath(tmp).exists && core.FS.stat(tmp).size > 0) {
          const data = core.FS.readFile(tmp);
          results.push({ path: p, data: data.slice().buffer, size: data.length });
        }
      }
      post({ id, type: 'done', exitCode: 0, outputs: results });
    } catch (err) {
      post({ id, type: 'error', message: String((err && (err.message || err)) || err) });
    }
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

    // ⚠ 时长修正**不能在这里做**：上面 `core.callMain(args)` 结束时 emscripten 已经
    //   调过 `exit()`，运行时被标记为已退出 —— 二次 `callMain` 会直接抛
    //   `memory access out of bounds`（实测）。所以这里只把「需要修的产物路径」记下来，
    //   由**主线程**再起一个 worker 跑一次（见页面侧 ffmpeg-worker 的调用注释）。
    const needFixDuration = (msg.fixDuration ? outputs : []).filter((p) => {
      const ext = (p.split('.').pop() || '').toLowerCase();
      return LOSSLESS_DURATION_REWRITE[ext];
    });

    // 3) 收集产物
    const results = [];
    for (const p of outputs) {
      try {
        const data = core.FS.readFile(p);
        results.push({ path: p, data: data.slice().buffer, size: data.length });
      } catch (e) { /* 未生成该文件 */ }
    }

    post({ id, type: 'done', exitCode, outputs: results, needFixDuration });
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

// =====================================================================
//  wasm 的加载：优先下 ffmpeg-core.wasm.gz，浏览器里解压后自己 instantiate
//
//  为什么要这么做：ffmpeg-core.wasm 有 7.3MB（gzip 后 2.6MB，只剩 35%），
//  静态托管又没法保证服务器开了 gzip —— 于是「让浏览器自己解压」比「求服务器配
//  Content-Encoding」可靠得多（dufs / python -m http.server / 部分 CDN 都不压）。
//
//  用 Emscripten 官方给的钩子 `Module.instantiateWasm`（见 ffmpeg-core.js 里
//  "User shell pages can write their own Module.instantiateWasm"），
//  它拿到 (imports, successCallback) 后由我们负责把实例交回去。
//
//  几个必须踩对的点：
//   ① **不能**用 `WebAssembly.instantiateStreaming`：它要求响应
//      `Content-Type: application/wasm`，而 .gz 是 application/gzip，会直接抛
//      `Incorrect response MIME type`。
//   ② 解压要用 `DecompressionStream('gzip')`（Chrome 80+/Firefox 113+/Safari 16.4+）。
//      不支持就**自动退回**直接下载 ffmpeg-core.wasm —— 功能不能因此挂掉。
//   ③ 线程（pthread）子 worker 走的不是这条路（core 内部直接从父线程拿
//      WebAssembly.Module），所以这份逻辑只在容器 worker 里生效；
//      写了也不会伤害子 worker，因为那里根本没有 fetch 的 core。
//   ④ 解压出来的字节要直接喂给 WebAssembly.instantiate 的**编译**路径，
//      不要先转成 Blob URL —— 多一次拷贝、还多一次 MIME 判断。
// =====================================================================
const WASM_PLAIN = 'ffmpeg-core.wasm';
const WASM_GZ = 'ffmpeg-core.wasm.gz';
// 引擎体积的口径（页面「引擎：就绪」要显示）：
//   · plainBytes —— 实际送进 WebAssembly.instantiate 的解压后字节数（真·引擎大小）
//   · wireBytes  —— 浏览器真正下载的字节数（有 .gz 时是压缩包大小，否则等于 plainBytes）
//   · gz         —— 是否走的 gzip 传输
let wireBytes = 0, wireGz = false;
function wasmInfo() {
  return {
    plain: plainBytes || gzBytes || 0,
    wire: wireBytes || plainBytes || gzBytes || 0,
    gz: wireGz,
  };
}
// 只探一次：某台服务器上没有 .gz（或环境不支持 DecompressionStream）就不再试，
// 否则每次任务都要多一个 404，日志也会被刷。
let gzUsable = (typeof DecompressionStream === 'function') && !IS_PTHREAD_WORKER;
let gzBytes = 0, plainBytes = 0;

async function fetchWasmBytes() {
  if (gzUsable) {
    try {
      const t0 = Date.now();
      const r = await fetch(WASM_GZ, { cache: 'force-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      let stream = r.body;
      // 某些环境（企业代理等）会**自作主张**解压并去掉 Content-Encoding，
      // 但也可能已经解过了。用文件头 1f 8b 判断，别信响应头。
      const buf = await r.clone().arrayBuffer();
      const head = new Uint8Array(buf.slice(0, 2));
      const isGz = head[0] === 0x1f && head[1] === 0x8b;
      // 无论服务器有没有替我们解压，buf.byteLength 就是这段 .gz 的网络体积
      wireGz = true;
      wireBytes = buf.byteLength;
      if (isGz) {
        // 把压缩字节原样转移进流（不复制），7MB 级别下这一步的拷贝并不便宜
        stream = new Response(new Blob([buf]).stream())
          .body.pipeThrough(new DecompressionStream('gzip'));
      }
      const wasm = await new Response(stream).arrayBuffer();
      gzBytes = wasm.byteLength;
      plainBytes = wasm.byteLength;   // 解压后的字节 = 真正的引擎大小
      const secs = ((Date.now() - t0) / 1000).toFixed(2);
      beacon('wasm', `已下载并解压 ${WASM_GZ} → ${wasm.byteLength} B（${secs}s）`);
      return wasm;
    } catch (e) {
      gzUsable = false;
      beacon('wasm', 'gz 加载失败，退回 ' + WASM_PLAIN + '：' + ((e && (e.message || e)) || e));
    }
  }
  const r = await fetch(WASM_PLAIN, { cache: 'force-cache' });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' 拉取 ' + WASM_PLAIN);
  const wasm = await r.arrayBuffer();
  plainBytes = wasm.byteLength;
  wireGz = false;
  wireBytes = wasm.byteLength;
  return wasm;
}

// 让 createFFmpegCore 用我们拿到的字节实例化，而不是自己按 locateFile 去下载
function instantiateFromBytes(info, wasmBytes, successCallback) {
  WebAssembly.instantiate(wasmBytes, info).then((result) => {
    successCallback(result.instance, result.module);
  }, (err) => {
    beacon('wasm', '实例化失败：' + ((err && (err.message || err)) || err));
    throw err;
  });
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
  const opts = {
    // 产物重命名过（ffmpeg_g.wasm -> ffmpeg-core.wasm），这里做映射
    locateFile: (f) => (f.endsWith('.wasm') ? WASM_PLAIN : f),
    noInitialRun: true,
    // FFmpeg 的 stdout/stderr 都走这里
    print: (t) => (currentSink || emit)(t),
    printErr: (t) => (currentSink || emit)(t),
  };
  // 只要不是线程 worker，就走「自己下载 + 解压 + 实例化」这条快路。
  // 线程 worker 里 core 的 wasm 是父线程送过来的 WebAssembly.Module，用不到这里。
  if (!IS_PTHREAD_WORKER) {
    let bytesPromise = null;
    opts.instantiateWasm = (info, successCallback) => {
      if (!bytesPromise) bytesPromise = fetchWasmBytes();
      bytesPromise.then((bytes) => instantiateFromBytes(info, bytes, successCallback))
        .catch((e) => { beacon('wasm', '加载 wasm 失败：' + ((e && (e.message || e)) || e)); });
      return {};      // 返回空对象表示「实例化由我们异步完成」
    };
  }
  return createFFmpegCore(opts);
}
