class InputTip {
  box; input; conf; options;

  constructor(el, options, conf) {
    this.input = typeof el === 'string' ? document.querySelector(el) : el
    if (!this.input) return console.error('找不到元素')
    this.conf = Array.isArray(options) ? conf || {} : options
    let opt = Array.isArray(options) ? options : this.conf.options || []
    this.init(opt)
  }

  init(opt) {
    this.options = opt
    this.box = document.createElement('div')
    this.box.className = 'input-tip-box'
    // let parent = this.input.parentNode
    // getComputedStyle(parent).position === 'static' && (parent.style.position = 'relative')
    document.body.appendChild(this.box)

    this.input.addEventListener('focus', this.render.bind(this))
    this.input.addEventListener('input', this.render.bind(this))
    this.input.addEventListener('blur', () => setTimeout(() => !this.box.contains(document.activeElement) && this.toggle(), 50))
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.conf.onConfirm && this.conf.onConfirm(this.input.value)
      } else if (e.key === 'Escape') {
        this.toggle()
      }
    })

    this.box.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.target.classList.contains('tip-item')) {
        setTimeout(() => this.conf.onInput && this.conf.onInput(this.input.value), 20)
        if (e.target.classList.contains('clr')) return (this.input.value = '')

        this.input.value = e.target.title || e.target.textContent
        this.toggle()
      }
    })

    this.render(this.options)
    this.toggle()
    this.calcPos()

    const styleEl = document.createElement('style')
    styleEl.innerHTML = `.input-tip-box { position: absolute; background-color: white; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); z-index: 1000; border-radius: 4px; margin-top: 5px; max-width: 400px; display: none; font-size: 14px;}
      .input-tip-box >div{ max-height: ${this.conf.maxHeight || 200}px; overflow-y: auto;}
      .input-tip-box > div::-webkit-scrollbar { width: 8px;  height: 8px; }
      .input-tip-box > div::-webkit-scrollbar-thumb {  background-color: #ddd; border-radius: 6px; }
      .tip-item{ padding: 6px 8px; cursor: pointer; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      .tip-item:last-of-type{ border-bottom: none;}
      .tip-item:hover{ background-color: #f0f0f0;}
      .tip-item.clr{ text-align: center; font-size: 0.8em; color: #E6A23C;}`
    document.head.appendChild(styleEl)
  }

  toggle(flag) {
    this.box.style.display = flag ? 'block' : 'none'
  }

  render(opts) {
    const val = this.input.value.toLowerCase().trim()
    opts = Array.isArray(opts) ? opts : this.options.filter((x) => (x.value || x).toLowerCase().includes(val))
    this.box.innerHTML = '<div>' + opts.map((x, i) => `<div class="tip-item" title="${x.value || x}">${x.label || x}</div>`).join('') +
      '</div>' + (this.input.value && `<div class="tip-item clr">清空输入</div>`)
    this.toggle(true)
    this.calcPos()
  }

  calcPos() {
    const maxHeight = this.conf.maxHeight || 200
    const inputRect = this.input.getBoundingClientRect()
    const isUp = (window.innerHeight || document.documentElement.clientHeight) - inputRect.bottom < maxHeight + 40
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    this.box.style.top = `${inputRect.top + scrollTop + (isUp ? -10 : inputRect.height)}px`
    this.box.style.left = `${inputRect.left}px`
    this.box.style.minWidth = `${inputRect.width}px`
    this.box.style.transform = `translateY(${isUp ? '-100%' : '0'})`

    // 插入父元素
    // const maxHeight = this.conf.maxHeight || 200
    // const inputRect = this.input.getBoundingClientRect()
    // const parentRect = this.input.parentNode.getBoundingClientRect()
    // const isUp = (window.innerHeight || document.documentElement.clientHeight) - inputRect.bottom < maxHeight + 40

    // this.box.style.top = `${inputRect.top - parentRect.top + (isUp ? -10 : inputRect.height)}px`
    // this.box.style.left = `${inputRect.left - parentRect.left}px`
    // this.box.style.minWidth = `${inputRect.width}px`
    // this.box.style.transform = `translateY(${isUp ? '-100%' : '0'})`
  }
}
