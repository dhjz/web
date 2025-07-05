class Notify {
  timer; box; conf;

  constructor(conf) {
    this.conf = Object.assign({ time: 3000, position: 'right', type: 'info', maxWidth: '50%' }, conf)
    this.init()
  }

  init(maxWidth) {
    this.box = document.createElement('div');
    this.box.className = 'notify-box'
    document.body.append(this.box)

    let customeTheme = this.conf.theme && this.conf.theme.css && this.conf.theme.name ?
      `.notify-box.n-${this.conf.theme.name} { ${this.conf.theme.css} }` : ''
    const styleEl = document.createElement('style')
    styleEl.innerHTML = /* css */`.notify-box {
        display: flex; min-width: 330px; max-width: ${this.conf.maxWidth}; padding: 10px 16px; color:#333; box-sizing: border-box; border: 1px solid #ebeef5; 
        position: fixed; background: #fff; top:16px;right:16px; box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); justify-content: center; z-index: 9999;
        font-size: 14px; line-height: 1.4; border-radius: 8px; transition: opacity .3s, visibility .3s; opacity: 0; visibility: hidden;
      }
      .notify-box.n-show { opacity: 1; visibility: visible;}
      .notify-box.n-top-center { right: 50%; transform: translateX(50%); }
      .notify-box.n-center { right: 50%; transform: translateX(50%) translateY(-50%); top: 50%; }
      .notify-box.n-bottom-right { top: auto; bottom: 16px; }
      .notify-box.n-success { background: #f0f9eb; color: #67C23A; }
      .notify-box.n-error { background: #fef0f0; color: #F56C6C; }
      .notify-box.n-warning { background: #fdf6ec; color: #E6A23C; }
      .notify-box.n-black { background:rgba(48, 49, 51, 0.7); color: #fff; }
      ${customeTheme}
    `
    document.head.append(styleEl)
  }
  
  show(text, conf) {
    conf = Object.assign({}, this.conf, conf)
    const time = conf.time || conf.time === 0 ? conf.time : 3000;
    const position = conf.position || 'right'
    const type = conf.type || 'info'

    clearTimeout(this.timer)
    this.box.innerHTML = text;
    let customeTheme = conf.theme && conf.theme.css && conf.theme.name ? `n-${conf.theme.name}` : 'n-xx'
    this.box.classList.remove('n-right', 'n-center', 'n-top-center', 'n-bottom-right', 'n-success', 'n-error', 'n-warning', 'n-black', customeTheme)
    this.box.classList.add('n-show', 'n-' + type, 'n-' + position)

    if (time === 0) return;
    this.timer = setTimeout(() => { this.box.classList.remove('n-show'); }, time)
  }

  hide() {
    clearTimeout(this.timer)
    this.box.classList.remove('n-show');
  }
}

// window.addEventListener('load', () => window.notify = new Notify());