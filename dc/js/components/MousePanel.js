window.MousePanelComp = {
  template: `
  <div class="mouse-pannel">
    <div id="mousecontrol" class="btn-box">
      <i class="hide-km">鼠标速度: </i><input style="width: 50px;font-size: 18px;" type="number" v-model="mouseWeight">
      <button @click="changeDig(false)"> - </button><button @click="changeDig(true)"> + </button>
      <button onclick="toggle('#keyboard')" class="hide-km">键盘</button><button @click="sendkey('MBUTTON')">中键</button><button
        @click="sendkey('RBUTTON')">右键</button>
    </div>
    <div class="mouse-box" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" v-show="showMouse">
      单击左键，长按右键，双指滚动
    </div>
    <div v-show="$parent.ip" class="text-center" style="color: #999;">{{ $parent.ip }}</div>
  </div>
  `,
  props: {
    horizon: {
      type: Boolean,
      default: false // 横向
    }
  },
  data() {
    return {
      showMouse: false,
      mouseWeight: 2,
      pos: {
        doubleStartX: 0,
        doubleStartY: 0,
        startX: 0,
        startY: 0,
        startTime: 0,
        isTouchMove: false
      }
    }
  },
  mounted() {
    $eventBus.on('socketOpen', this.socketOpen)
    this.showMouse = window.isSocketOpen = true
  },
  methods: {
    socketOpen(val) {
      console.log('socketOpen', val);
      this.showMouse = !!val
      this.showMouse = true
    },
    touchstart(ev) {
      ev.preventDefault()
      if (ev.touches.length > 1) {
        this.pos.doubleStartY = ev.touches[0].clientY; // 获取第一个触点的起始位置
      } else {
        this.pos.startX = ev.changedTouches[0].pageX;
        this.pos.startY = ev.changedTouches[0].pageY;
      }
      this.pos.startTime = new Date().getTime();
      this.pos.isTouchMove = false;
    },
    touchmove(ev) {
      ev.preventDefault();
      if (ev.touches.length > 1) {
        const currY = ev.touches[0].clientY;
        const deltaY = currY - this.pos.doubleStartY;
        this.pos.doubleStartY = currY; // 更新起始位置
        const currX = ev.touches[0].clientX;
        const deltaX = currX - this.pos.doubleStartX;
        this.pos.doubleStartX = currX; // 更新起始位置
        // logs('this.pos.doubleStartY' + this.pos.doubleStartY)
        // 阈值，避免小的抖动
        !this.horizon && Math.abs(deltaY) > 10 && this.moveScroll(deltaY > 0)
        this.horizon && Math.abs(deltaX) > 10 && this.moveScroll(deltaX > 0)
      } else {
        const currX = ev.changedTouches[0].pageX;
        const currY = ev.changedTouches[0].pageY;
        this.pos.isTouchMove = Math.abs(currX - this.pos.startX) > 10 || Math.abs(currY - this.pos.startY) > 10
        this.pos.isTouchMove && this.move(currX, currY);
      }
    },
    touchend(ev) {
      // logs('touchend' + this.pos.doubleStartY);
      if (!this.pos.isTouchMove && this.pos.doubleStartY == 0) {
        console.log(this.pos.isTouchMove, '点击事件');
        if (new Date().getTime() - this.pos.startTime > 600) {
          return sendData('pos,longclick', true);
        };
        return sendData('pos,click', true);
      }
      sendData('pos,end', true);
      setTimeout(() => this.pos.doubleStartY = 0, 50) // 停止后再移动, 延迟设置, 不然好像会触发这个touchend两次
    },
    move(x = 0, y = 0) {
      let mouseWeight = parseFloat(this.mouseWeight || 2) / 1;
      console.log('mouseWeight', Number(mouseWeight));
      let _x = (mouseWeight * x).toFixed(0)
      let _y = (mouseWeight * y).toFixed(0)
      sendData(`pos,start,${this.horizon ? _y : _x},${this.horizon ? -_x : _y}`);
    },
    moveScroll(isDown) {
      let mouseWeight = parseFloat(this.mouseWeight || 2) / 1;
      sendData('pos,scroll,' + (isDown ? -1 : 1) + ',' + mouseWeight);
    },
    changeDig(isAdd) {
      this.mouseWeight = parseFloat(this.mouseWeight || 2) + (isAdd ? 1 : -1);
    },
  },
}