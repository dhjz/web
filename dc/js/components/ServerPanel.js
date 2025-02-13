window.ServerPanelComp = {
  template: `
  <div class="server-panel dialog-cont">
    <div class="server-item" v-for="item in serverList" :key="item.id" :class="{ on: currHost == item.addr }">
      <div class="input line border">
        <input v-model="item.addr" placeholder="host:port, 不需要http">
        <i v-show="item.addr" @click="item.addr = ''">&times;</i>
      </div>
      <div>
        <input v-model="item.remark" placeholder="备注">
        <button @click="useServer(item)">使用</button>
        <button @click="delServer(item)" danger>删除</button>
      </div>
    </div>
    <div class="server-action">
      <button success @click="addServer">添加</button>
      <button @click="saveServer">保存</button>
    </div>
  </div>
  `,
  data() {
    return {
      serverList: [],
      currHost: getStorage('baseHostPort') || location.host
    }
  },
  created() {
    let temp = getStorage('serverList')
    if (temp && temp.length) {
      this.serverList = temp
    } else {
      this.serverList = [{ id: Math.random().toString(32).slice(-4), addr: location.host, remark: '' }]
    }
  },
  methods: {
    useServer(item) {
      setStorage('baseHostPort', item.addr)
      location.reload()
    },
    delServer(item) {
      let ind = this.serverList.findIndex(i => i.id === item.id)
      this.serverList.splice(ind, 1)
    },
    addServer() {
      this.serverList.push({
        id: Math.random().toString(32).slice(-4),
        addr: '192.168.1.xxx:666',
        remark: ''
      })
    },
    saveServer() {
      setStorage('serverList', this.serverList)
      if (this.serverList.length === 0) {
        delStorage('baseHostPort')
      }
    },
  },
}