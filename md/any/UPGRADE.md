# 升级 anydoc-wasm 引擎

本工具把 anydoc 当作一个可替换的引擎放在 `static/anydoc/`。升级一般不需要改页面代码。

## 步骤

1. 从 npm 下载目标版本（例如 `0.2.5`）：

   ```bash
   npm pack @firecrawl/anydoc-wasm@0.2.5
   tar -xzf firecrawl-anydoc-wasm-0.2.5.tgz
   ```

2. 用 package 目录里的 `anydoc_wasm.js` 和 `anydoc_wasm.d.ts` 覆盖 `any2md/static/anydoc/` 下同名文件。

3. 压缩新的 wasm（本工具只加载 `.wasm.gz`，不再需要原始 `.wasm` 文件；zip 仅作镜像备用）：

   ```bash
   gzip -9 -c package/anydoc_wasm_bg.wasm > any2md/static/anydoc/anydoc_wasm_bg.wasm.gz
   # 如需同步 zip 镜像（内含原始 wasm 条目）：
   python3 -c "import zipfile; zipfile.ZipFile('any2md/static/anydoc/anydoc_wasm_bg.zip','w',zipfile.ZIP_DEFLATED).write('package/anydoc_wasm_bg.wasm','anydoc_wasm_bg.wasm')"
   ```

   zip 镜像里应直接放 `anydoc_wasm_bg.wasm` 条目（内容即原始 wasm），可用任意 zip 工具生成；它不参与前端加载，仅用于离线分发/对照。

4. 修改 `any2md/static/convert.worker.js` 顶部的 `ENGINE_VERSION`，让它显示正确版本号：

   ```js
   const ENGINE_VERSION = '0.2.5';
   ```

5. 刷新浏览器（建议强制刷新清掉 wasm.gz 缓存）即可。

## 兼容性说明

适配层只依赖 anydoc 的这几个稳定 API：

- `initSync({ module })` / `default init()`（本工具用 gzip 解压后的字节调 `initSync`）
- `formatFromBytes(bytes)`
- `formatFromPath(name)`
- `toMarkdownBytes(bytes, format)`
- `toDocument(bytes, format)` — 返回 `{ blocks, notes, assets }`

只要新版保持这些 API，替换文件即可；若 upstream 改动了导出名或 `Document` 结构，才需要调整 `convert.worker.js` 中的适配层。

如需回滚，把旧版 `anydoc_wasm.js` / `.d.ts` 与压缩后的 `.wasm.gz` 放回去，并还原 `ENGINE_VERSION` 即可。
