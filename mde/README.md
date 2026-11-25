# Markdown 转换器（mde）

纯前端 Markdown 转换工具，支持模板、历史记录、Word / PDF / HTML 导出、打印以及富文本复制。

## 矢量 PDF（dompdf.js）

“矢量 PDF”按钮使用 [dompdf.js](https://github.com/lmn1919/dompdf.js)，输出可选中、可搜索的矢量 PDF：

```html
<script src="https://cdn.jsdelivr.net/npm/dompdf.js@latest/dist/dompdf.min.js"></script>
```

```js
const blob = await window.dompdf(element, {
  format: 'a4',
  pagination: true,
  marginPt: [36, 36, 36, 36],
  backgroundColor: '#ffffff',
  fontConfig: []
});
```

返回 `Promise<Blob>`，自己用 `URL.createObjectURL` + `<a download>` 下载，延时再 `revokeObjectURL`。

## dompdf.js 采坑记录

### 1. 浏览器字体不会自动嵌入

dompdf.js 不是截图，它按 DOM 的文本和样式重新绘制 PDF。浏览器里装了某字体、或页面用 CDN 加载了字体，都不等于 PDF 里有这个字体。

- 必须自己 `fetch` TTF，转成 `Uint8Array` 传给 `fontConfig[].fontBytes`。
- `fontUrl` 字段虽然在类型里存在，但 collector 不会自动抓取，不要依赖它。
- WOFF / WOFF2 不能直接当 `fontBytes` 用，需要 TTF 字节。
- `fontConfig` 可以是数组，同一份 `fontBytes` 可复用给多个 family / weight / style。

```js
const bytes = new Uint8Array(
  await fetch('static/fonts/AlibabaPuHuiTi.ttf?v=20261125k').then(r => r.arrayBuffer())
);
const fontConfig = [{
  fontFamily: 'Microsoft YaHei',
  fontStyle: 'normal',
  fontWeight: 400,
  fontBytes: bytes
}];
```

### 2. `fontFamily` 必须匹配元素的 computed `font-family`

注册名写错，dompdf 就会用默认字体，中文变问号。本项目从导出元素的 `getComputedStyle(el).fontFamily` 里解析出实际 family，去重后注册：

- 只注册具体字体名，跳过 `sans-serif` / `monospace` 等通用名。
- 跳过 `KaTeX*` / `iconfont` / `element-icons`，避免覆盖公式和图标字形。
- 按 `family|fontStyle|fontWeight|kind` 去重，防止 `fontConfig` 爆炸。
- 只有常规 TTF 时，700 粗体是用同一份字形近似，不是真正的 Bold 设计。

### 3. 代码块错位：浏览器排版与 PDF 字形字宽不一致

现象：`function hello` 挤成 `functionhello`，`console.log` 的点被压住。

原因：dompdf 读取浏览器算好的文本位置，但用另一套 TTF 的字形绘制。原代码块用 Menlo / Consolas，PDF 里换成 DejaVu Sans Mono，两者 advance width 不同就会重叠。

解决：导出期间临时把代码块字体切成和 `fontConfig` 完全相同的字体，等浏览器重排后再交给 dompdf：

```css
@font-face {
  font-family: 'DejaVuSansMono';
  src: url('static/fonts/DejaVuSansMono.ttf?v=20261125k') format('truetype');
}
.exporting-vector-pdf .preview-content pre,
.exporting-vector-pdf .preview-content pre code {
  font-family: 'DejaVuSansMono', monospace !important;
}
```

```js
document.body.classList.add('exporting-vector-pdf');
await document.fonts.load('13px DejaVuSansMono');
await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const blob = await window.dompdf(element, options);
document.body.classList.remove('exporting-vector-pdf');
```

注意 `document.fonts.ready` 只等待**已经触发加载**的字体；需要显式 `document.fonts.load('13px XXX')` 才会去加载并测量。

### 3.1 行内 `code`：导出时换成带样式的 `span`

现象：预览里正常的高亮短代码（如 `marked.js`），矢量 PDF 里会整体上移、贴底，甚至下半截被切掉。去掉背景、只留纯文本都解决不了。

原因：主题会给行内 `code` 写内联 `style`（`font-family: Menlo...`、`font-size:90%`、`background: rgba(...)`）。dompdf 对 `<code>` 的内联样式/基线处理与浏览器不一致；CSS 的 `inherit` 在 dompdf 里也不可靠。

最终做法（`exportAsVectorPDF()`）：

1. 导出前把非 `pre` 内的 `code` 换成 `<span>`；
2. `span` 的 `font-family` / `font-size` / `font-style` / `font-weight` / `line-height` 用 `getComputedStyle(parent)` 写成**明确的值**，不依赖 `inherit`；
3. 保留主题的 `color` 和背景色，但用 `toPdfColor()` 把 `rgba()` 合成成实心 `rgb()`，再设 `padding:1px 3px`、`border-radius:3px`、`vertical-align:baseline`；
4. 导出结束后把 `span` 换回原来的 `code`，页面预览不受影响。

也就是说：**行内代码的高亮保留，字体度量跟正文一致**，避免 dompdf 自己处理 `<code>` 时画歪或裁字。`fontConfig` 里只有 `pre` 内的元素注册等宽字体，行内 `code` 走正文的中文字体。

### 4. 字体文件体积：做子集，不要整包放进仓库

完整 DejaVu Sans Mono 是 333K，子集后 47K：

```bash
uv tool run --from fonttools fonttools subset DejaVuSansMono.ttf \
  --unicodes=U+0020-007E,U+00A0-00FF,U+2000-206F,U+2190-21FF,U+25A0-25FF \
  --output-file=DejaVuSansMono.subset.ttf
```

务必覆盖 ASCII 全部可打印字符（`.`、`(`、`)`、`{`、`}`、`;` 等）和 `&nbsp;`（`U+00A0`），否则代码块标点会缺字。可以用 fontTools 查 cmap 验证：

```bash
uv run --with fonttools python -c "from fontTools.ttLib import TTFont; print(ord('.') in TTFont('DejaVuSansMono.ttf').getBestCmap())"
```

字体 URL 和脚本 URL 都带 `?v=YYYYMMDDx` 破缓存，否则浏览器会继续用旧的整包字体或旧 JS。

### 5. 代码块里的中文

等宽子集没有中文字形，代码块中的中文注释可能缺字。可选方案：

- 扩大子集，把常用中文也加进去（体积变大）；
- 用 `langFontConfig` 按 Unicode 范围给 CJK 字符配置回退字体。

### 6. 其它

- 输出是 Blob，不是 ArrayBuffer；需要 `arrayBuffer()` 时自己转。
- 分页用 `pagination: true`，`marginPt` 单位是 pt（36pt ≈ 0.5 英寸）。
- `backgroundColor` 必须是合法 CSS 颜色，模板背景是渐变时要单独处理。
- 导出前 `await document.fonts.ready`，避免首屏字体还没加载就开始绘制。
