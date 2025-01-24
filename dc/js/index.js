const { createApp } = Vue;
  
setTimeout(async () => {
  window.appIns = createApp({
    data() {
      return {
        ip: '',
        keystr: '',
        screenStr: '',
        appList: [],
        showQr: false,
        showPs: false,
        showServer: false,
        inputShow: false,
        showDY: false,
        screenTimer: null,
        tabIndex: 0,
      }
    },
    mounted() {
      console.log('appIns mounted...');
      this.initData()
    },
    methods: {
      initData() {
        request('/monitor/getApps').then(res => (this.appList = res.data || []))
        request('/monitor/getIp').then(res => {
          if (!res.data) return;
          this.ip = res.data ? location.href.replace(location.hostname, res.data) : ''
          document.title = new URL(this.ip).host.replace(':', '_').replaceAll('.', '_')
          QrCreator.render({
            text: this.ip,
            radius: 0, // 0.0 to 0.5
            ecLevel: 'Q', // L, M, Q, H
            fill: '#000',
            background: null, // color or null for transparent
            size: 320
          }, document.querySelector('#qrcode-img'));
        })
      },
      screenInput(e) {
        if (e.key.toLowerCase() == 'enter') {
          this.sendtext(this.screenStr)
          this.screenStr = ''
        }
        if (e.key.toLowerCase() == 'backspace' && !this.screenStr) {
          this.sendkey('BACK')
        }
      },
      showScreen() {
        this.showPs = true
        setTimeout(() => {
          window.screenCanvas = document.getElementById('screen-box');
          window.screenCtx = screenCanvas.getContext('2d');
          console.log('screenCtx backingStorePixelRatio ', screenCtx.backingStorePixelRatio);
        }, 60)
        clearInterval(this.screenTimer)
        // 发送接收屏幕数据, 质量80 (0 - 100)
        this.screenTimer = setInterval(() => window.sendData('screen,80', true), 500)
      },
      hideScreen() {
        clearInterval(this.screenTimer)
        this.screenTimer = null
        this.showPs = false
      },
      screenClick(e) { // 点击远程控制屏幕
        console.log(e);
        const canvas = document.getElementById('screen-box');
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.style.width.replace('px', '') / window.deskWidth
        const x = (event.clientX - rect.left) / scale;
        const y = (event.clientY - rect.top) / scale;
        console.log(x, y, event.clientY, rect.top);
        request(`/monitor/sendclick?val=${x.toFixed(0)},${y.toFixed(0)}`);
      },
      handleLongTap(e) {
        console.log('handleLongTap...');
        this.sendkey('RBUTTON')
      },
    },
  })

  appIns.config.globalProperties.sendkey = (val) => request(`/monitor/sendkey?key=${val.trim()}`);  // 模拟按键
  appIns.config.globalProperties.sendtext = (val) => request(`/monitor/sendtext?val=${val.trim()}`);  // 模拟输入文字
  appIns.config.globalProperties.open = (val) => request(`/monitor/open?cmd1=${val.trim()}`);  // 模拟输入文字

  appIns.directive('longtap', longtapDc)
  
  await syncAllComponents() // 注册所有组件, 需等注册完再mount挂载, 不然有问题

  appIns.mount('#app')

  // setTimeout(() => $eventBus.emit('socketOpen', true), 1000) // 测试连接成功

}, 0)