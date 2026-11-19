# DFont Web（纯前端版）

`font-web` 是 DFont 的浏览器端字体转换与子集压缩版本。页面沿用原 `web/index.html` 的交互，字体处理逻辑改由 `font.js` 在本机完成，文件不会上传到服务端。

## 使用

直接用静态服务器打开即可，例如：

```bash
python3 -m http.server 8000 --directory font-web
```

然后访问 `http://localhost:8000/`。

也可以把 `font-web` 整个目录部署到任意静态站点。

## 依赖

字体 WASM 依赖优先加载仓库内本地文件；本地缺失时 `fontforge-core.wasm` 会回退到配置的 CDN 地址。其余依赖都使用本地文件：

- Vue 3
- localForage（历史记录本地存储）
- fonteditor-core（TTF/WOFF/EOT/SVG 读写、OTF 输入识别，以及子集处理）
- woff2-codec（Google WOFF2 + Brotli WASM，负责 WOFF2 编码与预览时的轻量解码）
- pako（WOFF 压缩）
- subset-font + harfbuzz-subset WASM（子集压缩，失败时回退到 fonteditor-core）

## 文件

- `index.html`：页面，交互与原 `web/index.html` 保持一致
- `font.js`：前端字体处理逻辑，对应原后端接口的转换/压缩/历史记录能力
- `data.js`：预设字符集合
- `index.css`：样式
- `*.bundle.js`、`*.wasm`：本地依赖，包含 WOFF2、快速 WOFF2 编码与 HarfBuzz 子集处理所需的 wasm

## TTF → TTF 修复

选择源格式和目标格式均为 TTF 时，不会做格式重写：

- 字体正常：直接输出原 TTF 字节。
- 转换页允许选择 TTF → TTF；其它源格式与目标格式相同时仍不可选。
- 字体存在已知的 `vhea.numOfLongVerMetrics` / `maxp.numGlyphs` 不一致：只修正该字段后输出。
- WOFF2 编码沿用同一份 SFNT 规范化逻辑，避免同一坏字体在不同路径表现不一致。

## WOFF2 编码选项

转换页或子集压缩页选择 WOFF2 时，会显示压缩质量滑块：

- 编码器固定为 `woff2-codec`，`quality` 默认 8。
- WOFF2 子集压缩优先用 HarfBuzz WASM；失败时回退为 fonteditor-core 生成 TTF 子集，再交给 `woff2-codec` 编码。
- 数值范围 0～11，数值越大通常体积更小但更慢；10～11 适合追求更小体积，0～4 更快但体积更大。
- 8MB 级别的大字体建议保持 8；如果你更在意体积、可以接受明显更慢的编码时间，再调到 10～11。

## 旧版 WOFF2 WASM（fonteditor-core + woff2.wasm）用法留档

当前代码已经删除旧的 `fonteditor-core` + `woff2.wasm` WOFF2 编码路径，只保留 `woff2-codec`。
下面记录旧方案的使用方式，方便需要时查阅或手工复原。

### 依赖来源

- npm 包：`fonteditor-core@2.6.3`
- wasm 文件：包内 `woff2/woff2.wasm`
- 浏览器中还需要加载 `fonteditor-core.bundle.js`，它会暴露 `FontEditorCoreModule` / `fonteditorCore` 等全局变量。

拿到 `woff2.wasm` 的常见方式：

```bash
# 直接用包管理器下载并解压查看
npm pack fonteditor-core@2.6.3
tar -xzf fonteditor-core-2.6.3.tgz
cp package/woff2/woff2.wasm ./woff2.wasm
```

也可以从 CDN 临时引用对应包内文件，但纯前端部署建议把 wasm 放到本地静态目录。

### 浏览器中初始化

```html
<script src="fonteditor-core.bundle.js"></script>
<script>
  async function initFontEditor() {
    const mod = window.FontEditorCoreModule || window.fonteditorCore;
    const fe = mod && mod.default ? mod.default : mod;
    if (!fe || !fe.createFont) throw new Error('fonteditor-core 加载失败');

    // init 接收 wasm 的 URL，也可以传 ArrayBuffer
    await fe.woff2.init('./woff2.wasm');
    return fe;
  }
</script>
```

注意：

- `woff2.wasm` 必须通过 HTTP(S) 提供，直接 `file://` 打开通常会遇到 fetch / CORS 限制。
- `init` 是全局一次性的，重复初始化前要自行处理状态。
- 旧 bundle 里部分工具函数对 undefined 的 name 直接调用 `indexOf`，遇到异常字形数据时需要先打补丁。

### TTF → WOFF2

```js
const fe = await initFontEditor();
const arrayBuffer = await fetch('./font.ttf').then(r => r.arrayBuffer());
const font = fe.createFont(arrayBuffer, {
  type: 'ttf',
  hinting: false,
  kerning: false,
  compound2simple: false
});
const woff2Bytes = font.write({ type: 'woff2', toBuffer: false });
```

这个路径就是被删除的“兼容/旧方式（慢）”。它不需要 `quality` 参数，但大字体编码明显慢于 `woff2-codec`。

### 读取 WOFF2

```js
const fe = await initFontEditor();
const arrayBuffer = await fetch('./font.woff2').then(r => r.arrayBuffer());
const font = fe.createFont(arrayBuffer, {
  type: 'woff2',
  hinting: false,
  kerning: false,
  compound2simple: false
});
```

### 为什么当前不再使用

- 旧的 `woff2.wasm` 编码路径兼容性没问题，但 8MB 字体实测编码约 23～26 秒。
- `woff2-codec` 同样输出标准 WOFF2，浏览器和字体工具链都可用，8MB 字体实测约 4 秒。
- 因此当前版本只保留 `woff2-codec`，旧 wasm 方案仅作文档归档。

## 粘贴字体文件

页面支持按 `Ctrl+V` / `Cmd+V` 从剪切板粘贴字体文件。若剪切板中包含文件，会直接读取；若系统剪贴板提供字体类型数据，也会尝试导入。



## OTF 输出（FontForge WASM）

当前使用 [fontforge-wasm](https://github.com/premex-ab/fontforge-wasm) 的 `0.3.0-alpha.1` 版本补齐 OTF 输出：

- `fontforge-core.mjs` / `fontforge-core.wasm`：FontForge 编译出的浏览器端转换引擎。
- `fontforge-bridge.mjs`：页面侧的薄封装，只在需要 OTF 输出时按需加载。
- `fontforge-core.wasm` 加载策略：先请求同目录本地文件；404、网络失败或返回 HTML 时回退到 `fontforge-bridge.mjs` 中的 `FONTFORGE_CDN_URL`。GitHub Release 下载不提供跨域响应头，浏览器直接 fetch 会被 CORS 拦截，所以不再用它当浏览器 CDN。本地部署时保留仓库内 wasm 即可完全离线。
- 适用路径：`TTF/OTF/WOFF/WOFF2/EOT/SVG → OTF`，以及 `OTF → TTF/WOFF/WOFF2/EOT/SVG`。
- 输入限制：字体解码后不超过 16MB；轮廓转换不是无损的，提示信息或自定义表可能变化。

许可证：FontForge WASM 为 `GPL-3.0-or-later`，详见 `FONTFORGE-WASM-LICENSE.txt`。

调研过的其它方案：

- Pyodide + fontTools：能力最全，但运行时体积大。
- harfbuzzjs / `subset-font`：轻量，但内部会先把输入转为 TTF，不能可靠输出 CFF/OTF。
- `otf2ttf` npm 包：依赖本地 FontForge 命令行，不能直接在浏览器运行。

## 格式支持边界

- OTF 输出由 FontForge WASM 完成，不再把 TTF 直接改名成 OTF。
- TTF 可转换为 TTF / WOFF / WOFF2 / EOT / SVG / OTF。
- OTF 输入可转换为 OTF / TTF / WOFF / WOFF2 / EOT / SVG。
- WOFF2 编码优先使用 `woff2-codec`，不再调用旧 `woff2.wasm` 的 `init()`。
- 6×6 浏览器矩阵测试覆盖 TTF / OTF / WOFF / WOFF2 / EOT / SVG 之间的互转，用例见 `tests/matrix.spec.mjs`。
- 子集压缩支持 TTF / OTF / WOFF / WOFF2 / EOT / SVG 全部格式：先统一解码为 TTF 子集，再编码为目标格式。
- 预览直接用浏览器 `FontFace` 加载 TTF / OTF / WOFF / WOFF2 原始字节；WOFF2 不再解码成 TTF，也不会加载 FontForge WASM。EOT 会先转成 TTF，SVG 直接以 SVG 图形显示。
