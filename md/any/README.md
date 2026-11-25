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
- 左侧文件列表：类型、大小、修改时间、状态；右侧：预览 / Markdown 源码 / PDF 预览（PDF 文件，用浏览器原生 `<embed>` 展示原文件）/ HTML 源码（净化后，仅 HTML 输入）
- 默认白天模式，右上角可切换暗色
- 统计：字符数、非空白字符数、MD 大小、行数、图片数、内嵌/外链数、图片总大小、图片文件数、转换耗时、识别格式、原文大小、渲染模式
- 导出 ZIP：非 PDF 引擎转换的文件可选择是否包含图片，含图片时附带 `media/` 目录并把内嵌图片还原成 `![](media/xxx.png)`；自有 PDF 引擎转换的文件含图片时直接用 pdf-to-md 自带的 `createMarkdownZip()` 打包（保留 `images/` 占位符，正文里的字面量图片路径不会被误打包），不含图片时只导出 `.md`
- 单个文件复制 MD / 下载 MD / 下载单个 ZIP（非 PDF 引擎按「导出图片」设置决定是否带 media/；自有 PDF 引擎选「包含图片」时用引擎自带方式打包，选「不包含图片」时只导出 `.md`）；HTML 输入还可下载净化后的 `.html`（`下载 HTML`），HTML 源码页也支持一键复制
- Markdown 源码页、HTML 源码页各有一键复制按钮；预览中的图片可点击放大，Esc 或点击空白处关闭
- wasm 以 gzip 形式分发（约 2.8 MB，原始 6.4 MB），浏览器下载后用原生 DecompressionStream 即时解压并加载，大幅节省带宽，无需原始 `.wasm` 文件（需支持 DecompressionStream 的现代浏览器）
- 引擎加载全程有进度提示：连接 → 下载（真实百分比 + 已下载/总大小）→ 解压 → 初始化 → 就绪
- **表格平铺视图**：`.xlsx/.xlsm` / `.xls` / `.csv` 在主「预览 / Markdown 源码」之外，额外提供「平铺预览」「平铺MD源码」两个 tab；主流程都走 anydoc，平铺视图用本地库异步生成不阻塞主预览

## 表格平铺视图

`.xlsx/.xlsm` / `.xls` / `.csv` 主流程都走 anydoc wasm，「预览 / Markdown 源码」保持 anydoc 输出；平铺视图独立生成：

- `.xlsx/.xlsm`：`static/xlsx-to-md.js` 使用开源库 `read-excel-file`（MIT，本地 `static/vendor/read-excel-file.js`，bundle ~47 KB，gzip ~14 KB），支持日期/数字/布尔、共享字符串与内联字符串
- `.xls`（BIFF8 / Excel 97-2003）：anydoc 的 `Format` 枚举把 `.xls` 映射到 `xlsx` 解析器，同样能输出表格；平铺视图由 `static/xls-to-md.js` 按需加载本地 `static/vendor/xls-reader.js`（MIT，零运行时依赖，约 24 KB），复用同一套 Markdown 格式化逻辑
- `.csv`：`static/csv-to-md.js` 纯前端解析（引号 / 逗号 / 换行转义、UTF-8 BOM），零依赖，复用同一套 Markdown 格式化逻辑
- 首个非空行自动识别为表头（全为数字或单列时退化为平铺行输出）
- 多 sheet 独立输出，每个 sheet 以 `## sheet名` 开头，每条记录用 `---` 分隔
- 表头式输出为 `年龄: 18` / `姓名: 张三` 这种逐行平铺格式
- 转换结果除常规「预览 / Markdown 源码」外，另有「平铺预览」「平铺MD源码」两个 tab

### 平铺视图依赖库

两个库都已本地化到 `static/vendor/`，页面运行时不请求外部网络；下面给出官方源码仓库与下载地址，便于核对版本和自行升级。

| 用途 | 库 / 版本 | 官方仓库 | 下载地址 | 本地文件 |
|---|---|---|---|---|
| `.xlsx/.xlsm` 平铺解析 | [read-excel-file](https://gitlab.com/catamphetamine/read-excel-file) 9.3.20（MIT） | https://gitlab.com/catamphetamine/read-excel-file （官方托管在 GitLab，没有 GitHub 仓库） | npm https://www.npmjs.com/package/read-excel-file ；tarball https://registry.npmjs.org/read-excel-file/-/read-excel-file-9.3.20.tgz | `static/vendor/read-excel-file.js`、`read-excel-file.LICENSE` |
| `.xls` 平铺解析 | [xls-reader](https://github.com/zanlucathiago/xls-reader) 0.7.0（MIT） | https://github.com/zanlucathiago/xls-reader | npm https://www.npmjs.com/package/xls-reader ；tarball https://registry.npmjs.org/xls-reader/-/xls-reader-0.7.0.tgz | `static/vendor/xls-reader.js`、`xls-reader.LICENSE` |

## PDF 引擎

PDF 文件可选用两种引擎，在工具栏「PDF 引擎」切换（仅在加入 PDF 文件后显示）：

- **anydoc-wasm（默认）**：原来的离线引擎，随页面自动加载。
- **自有引擎 pdf-to-md**：来自 [dhjzz/pdf-to-md](https://cnb.cool/dhjzz/pdf-to-md/)，首次选中并转换时按需加载本地 UMD，并按参考站从 cdnjs 加载 pdf.js 4.10.38（main + worker）。PDF 文件本身不上传，但首次使用需要能访问 cdnjs；自带表格/标题结构重建与图片提取，Markdown 保留原始 `images/` 占位符，预览内联展示图片，下载 ZIP 直接调用引擎自带 `createMarkdownZip()` 打包，不再适配到 `media/`。扫描版 PDF 仍需要 OCR，本引擎不做 OCR。

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
    ├── pdf-to-md-adapter.js    # 可选 PDF 自有引擎适配层（按需加载）
    ├── convert.worker.js       # anydoc wasm 转换 Worker + 图片渲染适配层
    ├── xlsx-to-md.js           # XLSX 平铺 Markdown 视图（用 read-excel-file）
    ├── xls-to-md.js            # XLS 平铺 Markdown 视图（用 xls-reader）
    ├── csv-to-md.js            # CSV 平铺 Markdown 视图（零依赖）
    ├── anydoc/                 # ← 可整体替换的 anydoc-wasm 引擎
    │   ├── anydoc_wasm.js
    │   ├── anydoc_wasm_bg.wasm.gz  # 实际加载：gzip 压缩后的 wasm（下载即解压）
    │   ├── anydoc_wasm_bg.zip      # 同内容的 zip 镜像（备用/对照，不参与加载）
    │   ├── anydoc_wasm.d.ts
    │   ├── LICENSE
    │   └── README.upstream.md
    ├── vendor/                 # 本地化的第三方库（无 CDN 依赖）
        ├── pdf-to-md/          # 自有引擎 UMD 产物（来自 dhjzz/pdf-to-md）
        ├── vue.global.prod.js  # Vue 3.5.17
        ├── marked.min.js       # marked 15.0.12
        ├── jszip.min.js        # JSZip 3.10.1（ZIP 导出，含 media/）
        ├── purify.min.js       # DOMPurify 3.2.6（UMD，预览与 HTML 清洗共用一份）
        ├── turndown.min.js     # Turndown 7.2.1（UMD min，HTML → Markdown）
        ├── turndown-plugin-gfm.min.js  # GFM 插件（UMD，表格 / 删除线 / 任务列表）
        ├── read-excel-file.js  # read-excel-file 9.3.20（UMD min，XLSX 平铺视图）
        └── xls-reader.js       # xls-reader 0.7.0（ESM，XLS 平铺视图）
```

整个 `any2md/` 目录自包含，复制到U盘/内网机器即可离线使用，不请求任何外部资源。

## 支持的格式

docx / doc / odt / rtf / epub / pdf / ppt / pptx / xlsx（含 .xls / .xlsm / .xlsb）/ ods / odp / csv，以及 html / htm（含复制粘贴的 HTML）。
格式默认按文件内容签名自动识别；CSV 无签名，需要在工具栏手动选 `CSV`，或保证扩展名为 `.csv`（`formatFromPath` 兜底）。扫描版 PDF 会报 `needsOcr`（默认 anydoc-wasm 版不含 OCR 能力；自有引擎会给出无文字层提示）。

## 升级 anydoc 引擎

见 [UPGRADE.md](./UPGRADE.md)。通常只需替换 `static/anydoc/` 里的 3 个文件。
