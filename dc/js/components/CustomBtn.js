window.CustomBtnComp = {
  template: `
  <div class="custom-btn" id="custom-btn" :class="{ hori: selectDirection == 'h' }">
    <div 
      class="btn-item" 
      :class="{ on: currItem && currItem.id == item.id }"
      v-for="item in btnList" 
      :key="item.id"
      @click="clickItem(item)"
      @mousedown="startHandler($event, item)"
      @touchstart="startHandler($event, item)"
      :data-key="item.key" 
      :style="{ left: item.left + '%', top: item.top + '%' }">
      {{ item.name }}
    </div>
    <div class="custom-top">
      <select v-model="selectDirection" @change="directionChange" :disabled="!isEdit" style="width: 45px;">
        <option v-for="item in directionList" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <select v-model="selectType" @change="typeChange">
        <option v-for="item in typeList" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
    </div>
    <div class="custom-action">
      <select v-show="isEdit && currItem" name="selectKey" id="selectKey" v-model="selectKey" @change="keyChange">
        <option v-for="item in keyList" :key="item.v" :value="item.v">{{ item.n || item.v }}</option>
      </select>
      <button @click="addItem" v-show="isEdit" success>添加</button>
      <button @click="delItem" v-show="isEdit && currItem" danger>删除</button>
      <button @click="save" v-show="isEdit" success>保存</button>
      <button @click="edit">{{ isEdit ? '编辑' : '编辑' }}</button>
      <button @click="exportList">导入</button>
    </div>
    <div class="dialog" v-show="exportShow">
      <div class="dialog-cont">
        <textarea v-model="exportText" style="width: 100%; height: 86%; margin-bottom: 14px;font-size: 12px;"></textarea>
        <div class="text-center">
          <button @click="importList">导入</button>
          <button @click="exportShow = false">取消</button>
        </div>
      </div>
      <i class="dialog-close" @click="exportShow = false" style="font-size: 30px; padding: 10px 16px; color: #fff;">&times;</i>
    </div>
  </div>
  `,
  data() {
    return {
      exportText: '',
      exportShow: false,
      keyList: keyList,
      btnList: [],
      isEdit: false,
      currItem: null,
      selectKey: '',
      isDragging: false,
      offsetX: 0,
      offsetY: 0,
      dragItemEl: null,
      dragBoxEl: null,
      allBtnList: [],
      selectDirection: 'v',
      selectType: 'a',
      directionList: [{  id: 'v', name: '竖' }, { id: 'h', name: '横' }],
      typeList: [
        { id: 'a', name: '布局1' }, { id: 'b', name: '布局2' }, { id: 'c', name: '布局3' }, 
        { id: 'd', name: '布局4' }, { id: 'e', name: '布局5' }, { id: 'f', name: '布局6' }
      ],
    }
  },
  mounted() {
    console.log('CustomBtn mounted....');
    let temp = getStorage('allBtnList')
    let btnListInd = parseInt(getStorage('btnListInd') || 0)
    if (temp && temp.length) {
      this.allBtnList = temp
    } else {
      // d: 方向 v: 垂直 h: 水平
      this.allBtnList = [{ id: 'a', d: 'v', list: [] }, { id: 'b', d: 'v', list: [] }, { id: 'c', d: 'v', list: [] }, 
      { id: 'd', d: 'v', list: [] }, { id: 'e', d: 'v', list: [] }, { id: 'f', d: 'v', list: [] }]
    }
    this.btnList = this.allBtnList[btnListInd].list
    this.selectDirection = this.allBtnList[btnListInd].d
    this.selectType = this.typeList[btnListInd].id
    this.dragBoxEl = document.getElementById('custom-btn');

    document.addEventListener('mousemove', this.moveHandler);
    document.addEventListener('mouseup', this.endHandler);
    document.addEventListener('touchmove', this.moveHandler);
    document.addEventListener('touchend', this.endHandler);
    document.addEventListener('touchcancel', this.endHandler);
  },
  unmounted() {
    console.log('CustomBtn unmounted....');
    document.removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('mouseup', this.endHandler);
    document.removeEventListener('touchmove', this.moveHandler);
    document.removeEventListener('touchcancel', this.endHandler);
  },
  methods: {
    exportList() {
      this.exportShow = true
      this.exportText = JSON.stringify(this.allBtnList)
    },
    importList() {
      try {
        let temp = JSON.parse(this.exportText)
        if (temp && Array.isArray(temp)) {
          this.allBtnList = temp
          this.save()
          alert('导入成功, 即将刷新页面')
          location.reload()
        } else {
          alert('导入失败, JSON格式错误!')
        }
      } catch (error) {
        alert('导入失败, JSON格式错误!')
      }
    },
    typeChange() {
      let btnListInd = this.allBtnList.findIndex(x => x.id === this.selectType)
      if (btnListInd > -1) {
        this.btnList = this.allBtnList[btnListInd].list
        this.selectDirection = this.allBtnList[btnListInd].d
      }
      setStorage('btnListInd', btnListInd)
    },
    directionChange(){
      let btnListInd = this.allBtnList.findIndex(x => x.id === this.selectType)
      if (btnListInd > -1) {
        this.allBtnList[btnListInd].d = this.selectDirection
      }
    },
    edit() {
      this.isEdit = !this.isEdit
      this.currItem = null
      this.selectKey = ''
    },
    clickItem(item) {
      if (!this.isEdit) return this.sendkey(item.key);
      this.currItem = item
      this.selectKey = item.key
    },
    delItem() {
      let ind = this.btnList.findIndex(i => i.id === this.currItem.id)
      this.btnList.splice(ind, 1)
    },
    addItem() {
      let item = {
        id: Math.random().toString(32).slice(-3),
        left: 50, top: 50, name: '回车', key: 'ENTER'
      }
      this.btnList.push(item)
      this.currItem = item
      this.selectKey = 'ENTER'
    },
    save() {
      setStorage('allBtnList', this.allBtnList)
      this.isEdit = false
      this.currItem = null
      this.selectKey = ''
    },
    keyChange() {
      this.currItem.key = this.selectKey
      let one = this.keyList.find(x => x.v === this.selectKey)
      if (one) this.currItem.name = one.n || one.v
    },
    startHandler(e, item) {
      if (!this.isEdit) return;
      this.currItem = item
      this.selectKey = item.key
      this.isDragging = true
      this.dragItemEl = e.target
      this.offsetX = (e.clientX || e.touches[0].clientX) - this.dragItemEl.getBoundingClientRect().left;
      this.offsetY = (e.clientY || e.touches[0].clientY) - this.dragItemEl.getBoundingClientRect().top;
      // console.log(this.dragItemEl, this.offsetX, this.offsetY);
      this.dragItemEl.style.transition = 'none'; // 禁用过渡动画
      e.preventDefault(); // 阻止默认行为以防止页面滚动
    },
    // 处理鼠标移动事件
    moveHandler(e) {
      if (!this.isDragging) return;
      let x, y;
      let temp = e.touches ? e.touches[0] : e
      x = temp.clientX - this.offsetX;
      y = temp.clientY - this.offsetY;
      const dragBoxRect = this.dragBoxEl.getBoundingClientRect();
      // 使用百分比来计算位置
      const relativeX = Math.min(Math.max(x, 0), dragBoxRect.width - this.dragItemEl.offsetWidth) / dragBoxRect.width * 100;
      const relativeY = Math.min(Math.max(y, 0), dragBoxRect.height - this.dragItemEl.offsetHeight) / dragBoxRect.height * 100;
      this.currItem.left = parseFloat(relativeX.toFixed(3));
      this.currItem.top = parseFloat(relativeY.toFixed(3));
      // this.dragItemEl.style.left = relativeX + '%';
      // this.dragItemEl.style.top = relativeY + '%';
    },
    endHandler() {
      if (!this.isDragging) return;
      this.isDragging = false;
      // this.dragItemEl.style.transition = 'all 0.3s ease'; // 恢复过渡动画

      // 保存相对于画布的百分比位置
      // const dragBoxRect = this.dragBoxEl.getBoundingClientRect();
      // const percentageX = (parseFloat(this.dragItemEl.style.left) / dragBoxRect.width) * 100;
      // const percentageY = (parseFloat(this.dragItemEl.style.top) / dragBoxRect.height) * 100;
      // console.log(`Item position: ${percentageX.toFixed(2)}% (X), ${percentageY.toFixed(2)}% (Y)`);
      // this.currItem.left = percentageX.toFixed(4);
      // this.currItem.top = percentageY.toFixed(4);
      this.dragItemEl = null;
    }
  },
}