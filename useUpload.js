;(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = factory() // CommonJS / Bundler
  else if (typeof define === 'function' && define.amd) define(factory) // AMD
  else root.useUpload = factory().useUpload // 传统 <script src> 挂载到 window
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict'

  function useUpload(options = {}, onFiles, onText) {
    if (typeof options === 'function') [onFiles, onText, options] = [options, onFiles, {}]

    const {
      accept = '*/*', limit = 20, multi = false,
      target = document, drag = true, paste = true
    } = options
		
    const el = typeof target === 'string' ? document.querySelector(target) : target
    // 文件过滤核心逻辑
    const processFiles = async (rawFiles) => {
      let list = Array.from(rawFiles || [])
      if (!list.length) return
      if (!multi) list = list.slice(0, 1)

      list = list.filter(f => {
        if (limit && f.size > limit * 1024 * 1024) {
          console.warn(`[useUpload] 文件 ${f.name} 超出限制 ${limit}MB`)
          return false
        }
        if (accept !== '*/*') {
          const rules = accept.split(',').map(s => s.trim().toLowerCase())
          return rules.some(r => r.startsWith('.') ? f.name.toLowerCase().endsWith(r) : new RegExp(r.replace('*', '.*')).test(f.type))
        }
        return true
      })

      if (!list.length) return
      onFiles?.(list)
      // 有回调2时读取文本内容
      if (onText) {
        const contents = await Promise.all(list.map(f => f.text()))
        onText(multi ? contents : contents[0], list)
      }
    }
    // 唤起选择框
    const open = () => {
      const input = Object.assign(document.createElement('input'), {
        type: 'file', accept, multiple: multi,
        onchange: () => { processFiles(input.files); input.remove() }
      })
      input.click()
    }
    // 事件监听
    const onDragOver = (e) => e.preventDefault()
    const onDrop = (e) => { e.preventDefault(); processFiles(e.dataTransfer?.files) }
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.items || []).map(i => i.getAsFile()).filter(Boolean)
      if (files.length) { e.preventDefault(); processFiles(files) }
    }
    if (el) {
      if (drag) { el.addEventListener('dragover', onDragOver); el.addEventListener('drop', onDrop) }
      if (paste) { el.addEventListener('paste', onPaste) }
    }
    // 注销销毁
    const close = () => {
      if (!el) return
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('drop', onDrop)
      el.removeEventListener('paste', onPaste)
    }

    return { open, close, processFiles }
  }

  // 导出单例与解构对象
  useUpload.useUpload = useUpload
  useUpload.default = useUpload
  return { useUpload, default: useUpload }
});