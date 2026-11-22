# any2md

纯离线、纯前端的「任意文档 → Markdown」转换工具。基于 Firecrawl 的 `anydoc-wasm`，文件始终留在浏览器本地。

## 使用

**不要直接双击 `index.html`**（浏览器会拦截 `file://` 下的 ES module / Worker / wasm 加载）。用任意静态服务器打开：

```bash
cd any2md
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

也可以用 `dufs`、`npx serve`、nginx 等任意静态服务器。

## 功能

- 拖入文件到页面任意位置 / `Ctrl+V` 粘贴文件 / 点击「选择文件」，支持批量
- 支持粘贴富文本 HTML（从网页 / Office 复制），会自动构造 `.html` 文件进入同一队列；也支持拖入 `.html`/`.htm` 文件，以及内容含 HTML 标签的 `.txt` 文件
- 批量排队转换，可暂停；wasm 跑在独立 Worker 中，界面不卡顿
- 文件列表里每个文件都有独立的「开始」按钮：排队中可直接转、失败后可「重试」、完成后可「重转」，不用为了一个文件跑整个队列
- 左侧文件列表：类型、大小、修改时间、状态；右侧：预览 / Markdown 源码 / HTML 源码（净化后，仅 HTML 输入）
- 默认白天模式，右上角可切换暗色
- 统计：字符数、非空白字符数、MD 大小、行数、图片数、内嵌/外链数、图片总大小、图片文件数、转换耗时、识别格式、原文大小、渲染模式
- 导出 ZIP：可选择是否包含图片。含图片时附带 `media/` 目录，并把内嵌图片还原成 `![](media/xxx.png)`
- 单个文件复制 MD / 下载 MD / 下载单个 ZIP（按当前「导出图片」设置决定是否带 media/）；HTML 输入还可下载净化后的 `.html`（`下载 HTML`），HTML 源码页也支持一键复制
- Markdown 源码页、HTML 源码页各有一键复制按钮；预览中的图片可点击放大，Esc 或点击空白处关闭
- wasm 以 gzip 形式分发（约 2.8 MB，原始 6.4 MB），浏览器下载后用原生 DecompressionStream 即时解压并加载，大幅节省带宽，无需原始 `.wasm` 文件（需支持 DecompressionStream 的现代浏览器）
- 引擎加载全程有进度提示：连接 → 下载（真实百分比 + 已下载/总大小）→ 解压 → 初始化 → 就绪

> HTML → Markdown 时，大于等于 2 行且大于等于 2 列的表格会自动转成 GFM 表格语法（可在预览里正确渲染）；只有 1 行或 1 列的表格保留原 HTML，避免把布局用的小表格误转。

> anydoc 原生的 `toMarkdownBytes()` 对内嵌图片会直接丢弃（无 alt、无链接；字节仅保留在 `Document.assets`）。本工具在检测到内嵌图片时改为从文档模型渲染 Markdown，把每张图放到真实位置并输出 `![](media/xxx.png)`，因此「包含图片」导出是真正可用的。无图文档仍走原生转换。非图片资源（如 OLE 嵌入对象）会被跳过统计与打包。

## 目录结构

```
any2md/
├── index.html                  # 页面骨架
├── README.md
├── UPGRADE.md                  # anydoc 升级说明
└── static/
    ├── app.css
    ├── app.js                  # Vue3 应用逻辑、队列、导出、HTML 分流
    ├── html-convert.js         # HTML → Markdown（主线程，浏览器原生 DOM）
    ├── convert.worker.js       # anydoc wasm 转换 Worker + 图片渲染适配层
    ├── anydoc/                 # ← 可整体替换的 anydoc-wasm 引擎
    │   ├── anydoc_wasm.js
    │   ├── anydoc_wasm_bg.wasm.gz  # 实际加载：gzip 压缩后的 wasm（下载即解压）
    │   ├── anydoc_wasm_bg.zip      # 同内容的 zip 镜像（备用/对照，不参与加载）
    │   ├── anydoc_wasm.d.ts
    │   ├── LICENSE
    │   └── README.upstream.md
    └── vendor/                 # 本地化的第三方库（无 CDN 依赖）
        ├── vue.global.prod.js  # Vue 3.5.17
        ├── marked.min.js       # marked 15.0.12
        ├── jszip.min.js        # JSZip 3.10.1（ZIP 导出，含 media/）
        ├── purify.min.js       # DOMPurify 3.2.6（UMD，预览与 HTML 清洗共用一份）
        ├── turndown.min.js     # Turndown 7.2.1（UMD min，HTML → Markdown）
        └── turndown-plugin-gfm.min.js  # GFM 插件（UMD，表格 / 删除线 / 任务列表）
```

整个 `any2md/` 目录自包含，复制到U盘/内网机器即可离线使用，不请求任何外部资源。

## 支持的格式

docx / doc / odt / rtf / epub / pdf / ppt / pptx / xlsx / ods / odp / csv，以及 html / htm（含复制粘贴的 HTML）。
格式默认按文件内容签名自动识别；CSV 无签名，需要在工具栏手动选 `CSV`，或保证扩展名为 `.csv`（`formatFromPath` 兜底）。扫描版 PDF 会报 `needsOcr`（wasm 版不含 OCR 能力）。

## 升级 anydoc 引擎

见 [UPGRADE.md](./UPGRADE.md)。通常只需替换 `static/anydoc/` 里的 3 个文件。
