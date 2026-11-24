# @dhjzz/pdf-to-md

一款纯文本 PDF → Markdown 的 JS 工具，按 Issue #1 中选定的基线方案实现：
**pdf.js 文本层 + 自研 Layout→Markdown 结构化层**。

- **大多数场景直接用浏览器 UMD 产物**：引入 `dist/pdftomd.umd.min.js` 即可在 browser 中本地转换，无需 Node 服务、不上传文件；详见下文「浏览器 UMD 产物」。
- 纯 JS / Node.js 18+，核心不依赖任何 OCR 服务，也不调用 Python。
- 图片以**原始二进制数据**输出（`Uint8Array`），不做识别、不写进 Markdown。
- 支持把 Markdown 与图片打包成 ZIP（`.md` 在根、`images/` 子目录按 Markdown 占位符路径存放），第三方解压后本地直接打开即可看图。
- 以 pdf.js 阅读顺序文本为骨架，保留字符流完整性；再叠加标题分级、目录列表化、
  标点规整，对标 MinerU 参考输出。
- 标题按编号深度分级：`一、`/`1` 为 `##`，`2.1` 为 `###`，`3.1.1` 为 `####`。
- `evaluation/` 里**人工视觉稿**用 `_llm` 结尾、`*_auto.*` 是程序自动跑出的真实产物，两类严格分开，见 [评测说明](./evaluation/README.md)。
  不用相似度脚本当质量判据。

## 浏览器 UMD 产物（推荐，大多数场景）

这是最常用的一条路径：**直接在 browser 里跑**，无需后端、无需 `npm install`（`dist/pdftomd.umd.min.js` 已入库），文件全程不离开浏览器。

| 文件 | 格式 | 用法 |
| --- | --- | --- |
| `dist/pdftomd.umd.min.js` | UMD/IIFE，暴露全局 `PdfToMd` | 浏览器 `<script src>` 直引；也可从 npm 包 `@dhjzz/pdf-to-md/umd` 取用 |
| `src/index.js` | ESM 源码 | Node 18+ / 打包器 `import` 使用（见下方 [API](#api)） |

> 只打包转换逻辑，pdf.js 不进包。**源码本身已同时兼容 Node 与 browser**：
> 没有静态 `node:fs` / `node:zlib` 导入，浏览器路径完全不触碰 Node 模块；PNG 压缩用内置纯 JS zlib；
> pdf.js 在 browser 从全局 `pdfjsLib` 读取，在 Node 按需动态 `import('pdfjs-dist/...')`。
> `PdfToMd.convert()` 接收 `Uint8Array` / `ArrayBuffer` / `Blob`，也可传 `{ pdfjsLib }` 覆盖。

用静态服务器打开页面（`file://` 下模块/worker 会被浏览器限制）：

```bash
npx serve .            # 默认 http://localhost:3000
# 或 python3 -m http.server 8000
```

最小可运行示例（与仓库 `index.html` 一致）：

```html
<!-- UMD 先加载：自动安装 Promise.withResolvers，并暴露 PdfToMd.shimWR -->
<script src="dist/pdftomd.umd.min.js"></script>
<script type="module">
  // pdf.js 4.x 主线程和 worker 都需要 Promise.withResolvers；主线程已由 UMD 补好。
  window.pdfjsReady = import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs')
    .then(async (pdfjs) => {
      window.pdfjsLib = pdfjs;
      const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
      const workerSource = '(' + globalThis.PdfToMd.shimWR.toString() + ')(globalThis); await import("' + workerUrl + '");';
      pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
        new Blob([workerSource], { type: 'text/javascript' })
      );
    });
</script>
<script>
async function convertPdf(file) {
  await window.pdfjsReady;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const converted = await PdfToMd.convert(bytes, { tables: true });
  console.log(converted.markdown, converted.images, converted.stats);
  return converted;
}

async function downloadZip(result, fileName) {
  const bytes = PdfToMd.createMarkdownZip(result, { fileName });
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace(/\.pdf$/i, '') + '.zip';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
```

UMD 是 IIFE，用 `<script src>` 经典脚本加载即可挂出全局 `PdfToMd`；不要再传 `pdftomdDeflateRaw`，源码里已内置纯 JS zlib。
`Promise.withResolvers` 也已内置：UMD 加载即补主线程，worker 用导出的 `PdfToMd.shimWR.toString()` 注入同一份实现。

浏览器里可直接拿到：`PdfToMd.version` / `PdfToMd.VERSION`、`PdfToMd.convert()`、`PdfToMd.createMarkdownZip()` / `PdfToMd.createZip()`、`PdfToMd.shimWR()`。
`images[].bytes` 是 `Uint8Array`，可 `URL.createObjectURL(new Blob([bytes], { type: img.contentType }))` 显示，或内联成 `data:` 写进 Markdown。

重新生成产物：

```bash
npm install
npm run build     # 生成 dist/pdftomd.umd.min.js（ESM 打包已注释）
```

Node / 打包器不需要 UMD，直接从源码入口 `import { convert } from '@dhjzz/pdf-to-md'`（见 [API](#api)）。

## 安装

```bash
npm install
```

## CLI

```bash
node cli.js input.pdf -o output.md --images ./images
node cli.js input.pdf --zip output.zip
```

| 参数 | 说明 |
| --- | --- |
| `-V, --version` | 输出版本号（当前 `1.1.11`） |
| `-o, --output <file>` | 写出 Markdown（默认 stdout） |
| `--json <file>` | 导出 JSON：markdown + 图片清单 + base64 二进制列表 + 页面块 |
| `--images <dir>` | 导出图片二进制到目录 |
| `--zip <file>` | 导出 Markdown + images/ 图片为可直接打开的 ZIP |
| `--no-tables` | 关闭自动表格重建（默认开启矢量边框表格与无线框数字行兜底） |
| `--strict` | 跨页表格仅在强证据下合并 |
| `--no-cross-page` | 关闭跨页表格续接 |

## API

```js
import { convert } from '@dhjzz/pdf-to-md';
// 或 const { convert } = require('@dhjzz/pdf-to-md');

// 浏览器 / Node 通用：传二进制。Node 可用 readFileSync('./test.pdf') 得到 Buffer。
const bytes = new Uint8Array(await (await fetch('./test.pdf')).arrayBuffer());
const { markdown, images, imageManifest, pages, stitchLog } = await convert(bytes, {
  strict: false,           // 跨页表格严格模式（默认 false）
  crossPageTables: true,   // 是否启用续表合并（默认 true）
  tables: true,            // 是否重建表格（不传默认 true）
  onStatus({ totalPages, currentPage, elapsedMs, stage }) {
    console.log(`${currentPage}/${totalPages} ${stage} ${elapsedMs}ms`);
  },
});

for (const img of images) {
  // img.bytes 是 Uint8Array，可直接写入文件或上传对象存储
  console.log(img.page, img.width, img.height, img.contentType, img.bytes.length);
}

// 把 Markdown + 原图打成 ZIP，第三方解压后本地直接打开
import { convert, createMarkdownZip } from '@dhjzz/pdf-to-md';
const result = await convert(new Uint8Array(await (await fetch('./report.pdf')).arrayBuffer()));
const zipBytes = createMarkdownZip(result, { fileName: 'report.pdf' }); // Uint8Array
// CLI: node cli.js report.pdf --zip report.zip
```

### 版本号

库从 `1.0.0` 起维护版本，运行时可读取，浏览器与 Node 通用：

```js
// ESM / Node
import { version, VERSION } from '@dhjzz/pdf-to-md';
console.log(version);   // '1.1.11'

// 浏览器 UMD：全局对象上直接读
console.log(PdfToMd.version);   // '1.1.11'  （VERSION 同值）
```

CLI 可用 `node cli.js --version`（或 `-V`）查看。`package.json` 的 `version`
与运行时版本由构建脚本校验，不会漂移。

`convert()` 接受 `ArrayBuffer`、TypedArray/`Buffer`、`Blob`，Node 下仍兼容文件路径（按需动态 `import('node:fs/promises')`，浏览器不触碰），返回：

- `markdown`: 转换后的 Markdown 字符串
- `images`: 图片数组，每项含 `bytes`（原始二进制）、`width/height`、`contentType`、`page`
- `imageManifest`: 图片清单（序号、页码、尺寸、字节数、占位符路径），不含二进制
- `pages`: 每页的结构化 block（`heading` / `paragraph` / `table` / `toc`）
- `stitchLog`: 跨页表格续接判定日志（当前渲染流保留接口）

`options.tables` 不传即为 `true`；传 `false` 会关闭全部表格重建（退回纯文本行）。
`options.onStatus` 在 PDF 加载后、每页开始/结束、整体完成时调用，参数为
`{ totalPages, currentPage, elapsedMs, stage }`，其中 `stage` 为
`loaded` / `page-start` / `page-done` / `done`；回调抛错不会中断转换。

`createZip(files)` / `createMarkdownZip(result, { fileName })` 同样从包里导出：
纯 JS 的 store 模式 ZIP 写入器，浏览器 UMD 用 `PdfToMd.createMarkdownZip(...)` 调用，
生成 `Blob`/下载即可，不需要任何后端或第三方库。

## 核心处理逻辑

整体是一条 **pdf.js 抽取 → 文本/矢量几何 → 单元格网格重建 + 语义渲染 → 输出** 的流水线。
设计目标是可读性：正文按阅读顺序重排成完整段落、表格按 PDF 的逐格矩形反推成"一格一句"的
逻辑表格、标题按编号分级，而不是把物理行原样吐出。

```
PDF 字节
  → pdf.js getDocument / getTextContent / getOperatorList
  → readingOrderLines            按 baseline(Y) 聚行，保留每个 item 的坐标
  → cellGridTables (src/cellgrid.js)   从 constructPath 矩形重建单元格网格，item 按坐标投格
  → render2        (src/render2.js)    标题分级 / 正文回流 / 表格序列化 / 跨页续行拼接
  → { markdown, images, imageManifest, pages, stitchLog }
```

### 1. 文本骨架：按坐标重组

- `readingOrderLines()`（`src/index.js`）：以 `transform[5]`（Y）聚类物理行（容差 2pt），
  行内按 `transform[4]`（X）排序，保留每个 item 的坐标供投格和断列用。
- `stripRunningFooters()`：跨页统计首/末行，≥80% 页出现的"第 N 页"页脚统一丢弃。
- `normalizePunctuation()`（`src/render2.js`）：全角 `：` `“”` `‘’` 归一到半角；
  压掉 CJK 之间被 PDF 编码成空格的字距（如 `产 品`→`产品`）。

### 2. 单元格网格重建：表格的核心

`src/cellgrid.js` 是这一版的重点。test.pdf 这类表格不是贯通长线，而是**每个单元格一个
矩形**（`constructPath` op 19）画的——旧版只认长线段，表格整片漏检。新方案：

- `cellGridTables()` 跟踪图形算子 CTM，把矩形投到文本坐标系；收集所有 `w>8,h>8` 的
  单元格矩形，按"共享 x/y 边且范围重叠"做连通分量聚类，一张表即一个连通块。
- 对每块：`cluster()` 出列边界 `colEdges`（矩形左右边）和行边界 `rowEdges`（上下边），
  得到 `rows × cols` 的逻辑网格。
- 每个文字 item 按中心 `(cx, cy)` 投进对应 cell，cell 内按 y 再 x 排序拼成一整句——
  于是职责表、功能清单、交付指标等输出成"一行一个逻辑单元格、一格一整句"的 GFM 表格，
  而不是旧版那种"一行一列、句子被拦腰切断"的碎表。
- `src/tables.js` 的长线检测保留为无线框/线段型表格的兜底：cellgrid 无结果时才用它，
  `isNumericLine()` 处理连续数字行。

### 3. 语义渲染：标题 / 正文 / 表格 / 跨页

`src/render2.js` 把每页内容建成带坐标的事件流（heading / text / table），按 y 交织输出：

- **标题**：`一、`→`##`，`2.1`/短冒号行/`（n）`→`###`，`3.1.1`→`####`；
  顿号列表（`1、联调与验收`）不当标题。表格内的行先被排除，编号不会冒成假章节。
- **正文**：把落在同一视觉行的折叠物理行拼回完整段落（遇到句末标点或超长才断开），
  不再出现"构建一套完\n善的 AI 服务能力"这种硬折行。
- **目录**：单页 ≥3 条点线即识别为目录，保留 PDF 里的长连续点线并按标签宽度对齐。
- **跨页续行**：页顶残句若是上一张"延伸到页底"的表格的折行（`bottom<150`），
  拼回该表最后一行末格（如 `手续费分别是多少钱，占盈亏的百分比是多少`）；
  页底呈多列分布的残行 carry 到下一页表格开头（如 8.4 故障响应时间表的表头 + P0 行），
  折行尾（`绕行）`）并回上一行。列表项和普通跨页段落不参与。
- **表格序列化**：同一网格 identity 的相邻表格块合并成一张表；去掉重复表头；
  所有表格行单换行连接（GFM 要求表头/分隔行/数据行连续），`marked.js` 能渲染成真 `<table>`。
- **独立行块（不回流）**：`src/blocks.js` 只靠版面几何识别"不能被拼成段落"的行，
  不使用任何业务词表。两类：① shell/JSON/图注等通用语法形态；② 紧贴一张无线表格上边界、
  同左边界、近等行距且字号明显偏小的短行（表格前的说明/元数据行）。矢量网格内的行一律排除，
  所以规则表格的等距行不会被误伤。这样换一份完全不同词汇的 PDF 也照样分行，无需改代码。

### 4. 图片：只提二进制，不做 OCR

`src/images.js`：从 `paintImageXObject` 等操作符取图片 XObject（pdf.js 异步解析带重试），
裸 RGB/RGBA 像素用 `deflateSync` 自封 PNG，JPEG/JPX 保留原字节；不识别内容。
API 返回 `images[].bytes` 与 `imageManifest`，CLI `--json` 导出 base64，
离线页面勾选"包含图片"时内联为 `data:image/...;base64,...`。

### 5. 输出

`convert()` 返回 markdown、图片清单/二进制、逐页 `pages[].blocks` 与 `stitchLog`。
`--no-tables` 关闭全部表格重建（退回纯文本）；`--json` 导出全部结构化数据。
`--zip out.zip` 导出便携包：根目录 `<name>.md`，`images/` 下的文件名与 Markdown 里
`![](images/pN-...png)` 占位符完全一致，解压即可本地无缝打开。

## 评测产物：`*_llm.md` 与 `*_auto.*` 严格分开

`evaluation/` 里有两类文件，命名已按用户要求区分，不能再混：

- **人工视觉稿（`*_llm.md`）**：人/大模型看着 `page-images/` 逐页手写，质量高，但**不是工具自动输出**。
  - `test_llm.md` / `output_llm.md`：test.pdf 的视觉稿（内容相同）
  - `test_reference.md`、`sample_reference.md`、`test3_reference.md`：MinerU 参考输出
  - `sample_output_llm.md` / `test3_output_llm.md`：sample / test3 的视觉稿
- **自动产物（`*_auto.md` / `*_auto.json`）**：`convert()` 真实跑 PDF 的结果，可重复生成。
  - `npm run gen:auto` 一次生成三份 PDF 的 md + json（json 含 markdown、图片清单、图片 base64、逐页 block、统计）
  - CLI/网页看到的转换结果就是这一类；别拿视觉稿冒充

`sample_images/`：sample.pdf 内嵌图片的 PNG 二进制与 base64 清单（自动提取结果）。
判断工具真实效果，基准必须是 `*_auto.*`。

## 结构化能力

| 能力 | 实现位置 | 说明 |
| --- | --- | --- |
| 文本行重组 | `src/index.js` / `src/text.js` | 阅读顺序保真行；`itemsToLines` 提供按 baseline 聚类的定位行 |
| 标题分级 | `src/index.js` | `一、`/`1` → `##`，`2.1`/短冒号行 → `###`，`3.1.1` → `####`；表格内数字行不再误判为标题 |
| 目录列表 | `src/index.js` / `src/doc-format.js` | 保留长连续点线并对齐标签 → `-` 列表 |
| 表格检测 | `src/tables.js` / `src/index.js` | 矢量边框按 CTM 投影到文本坐标 + 聚类列边界，GFM 连续行 + 非空表头 + 跨页去重；无线框连续数字行兜底（默认开启，`--no-tables` 关闭） |
| 跨页续表 | `src/table-continuation.js` | 移植 mineru_ext.py 的判定函数（`evaluateBoundaryRow` / `foldContinuationHeadRows`，含单元测试），可按需接入渲染流程 |
| 图片输出 | `src/images.js` | pdf.js XObject → 有效 PNG/JPEG 二进制（裸 RGB/RGBA 像素自动封装 PNG） |

## 跨页表格续接（来自 mineru_ext.py）

保留原 Python 扩展的核心判断：

1. **否决优先**：同列文本重复、同模板不同值、共享前缀、都过短、都是纯数字、上页末行次列均以标点收口、下页首行以独立行首短语开头 → 不合并。
2. **加分信号**：分隔符结尾 / 续接标点开头 / 拉丁词中截断（+2 强证据）、CJK 字符边界（最多 +2）、下页空列（+1~2）、无明显独立记录证据（+1）。
3. **阈值**：普通模式 ≥2，严格模式 ≥3 且必须有强证据。
4. **续表首行折行**：仅一列有内容且与上一页同列文本相接时，折叠回上一行。

```js
import { evaluateBoundaryRow, foldContinuationHeadRows } from '@dhjzz/pdf-to-md';
```

## 测试

```bash
npm test        # 14 个单元测试
node cli.js ../test.pdf -o /tmp/out.md
```

## 局限

- 不含 OCR：扫描件/图片内文字不会被转换。遇到整份 PDF 都识别为空时，转换结果会明确提示原因（纯图片页 / 矢量轮廓文字 / 文本层为空），CLI 始终在 stderr 输出汇总，加 `--debug` 可看逐页诊断；网页版控制台也会打印。此项目不内置 OCR，需先用 OCR 工具重建文字层。
- 矢量边框表格按列边界包装；无线框表格依赖连续数字行特征，纯文本无线框表可能退化为普通行。合并单元格不生成 HTML colspan/rowspan，只输出 GFM 行列结构。
- 目录点线按 PDF 原始长连续点线对齐输出，页码粘附在后；与 MinerU 混合短点线不逐字一致。
- 图片提取已通过 `sample.pdf` 的截图做端到端验证（PNG 封装 + base64 JSON 清单）；扫描件 / 图片内文字因不做 OCR 不会被转换。

Ref #1
