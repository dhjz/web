window.FileListComp = {
  template: `
  <div class="file-list">
    <input type="file" id="file" class="hide" name="file" @input="fileInput" />
    <div>
      <button onclick="document.getElementById('file').click()" success>上传文件</button>
      <button onclick="location.reload()" class="ftr" normal>刷新</button>
      <select v-model="sortBy" @change="typeChange" class="ftr" style="width: 94px;">
        <option v-for="(item, ind) in sortList" :key="ind" :value="ind">{{ item }}</option>
      </select>
      <!-- <div class="ftr ipt" >共{{ fileList.length }}个</div> -->
      <input type="text" v-model="keyword" class="ftr" style="width: 94px; margin-right: 8px;" placeholder="关键字搜索">
    </div>
    <div class="files">
      <li class="file-item" :class="[item.ftype]" v-for="(item, ind) in sortFileList" :key="ind">
        <h1 >{{ item.name }} <h2>{{ item.time }} <i v-show="item.ftype == 'img'" @click="preview(item)">预览</i></h2></h1>
        <span class="size">{{ item.sizes }}</span>
        <button @click="downloadFile(item)" normal mini>下载</button>
        <button @click="delFile(item)" danger mini>删除</button>
      </li>
    </div>
    <div class="dialog" v-show="showImg" @click.self="showImg = false">
      <img :src="imgSrc" alt="暂无图片" class="file-img">
      <i class="dialog-close" @click="showImg = false">&times;</i>
    </div>
  </div>
  `,
  data() {
    return {
      showImg: false,
      sortList: ['时间降', '时间升', '文件名降', '文件名升', '大小降', '大小升'],
      imgSrc: '',
      sortBy: 0,
      keyword: '',
      fileList: []
    }
  },
  computed: {
    sortFileList() {
      return (this.fileList || []).sort((a, b) => {
        return this.sortBy == 0 ? (b.timestamp - a.timestamp) : 
          this.sortBy == 1 ? (a.timestamp - b.timestamp) : 
          this.sortBy == 2 ? ((b.name > a.name) ? 1 : -1) : 
          this.sortBy == 3 ? ((b.name > a.name) ? -1 : 1) : 
          this.sortBy == 4 ? (b.size - a.size) : 
          this.sortBy == 5 ? (a.size - b.size) : 0
      }).filter(x => !this.keyword.trim() || x.name.includes(this.keyword.trim()))
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      request('/file/list').then(res => {
        this.fileList = (res.data || []).map(item => ({
          ...item,
          ftype: getFileType(item.name)
        }))
      })
    },
    fileInput(e) {
      const file = e.target.files[0]
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        request('/file/upload', { method: 'POST', data: formData, isFile: true })
          .then(res => {
            dnotify(res.msg)
            this.initData()
          })
      }
      document.getElementById('file').value = ''
    },
    downloadFile(item) {
      let url = window.baseApi + '/file/download?name=' + encodeURIComponent(item.name)
      $copy(url)
      dnotify('复制链接成功, 可在浏览器下载')
      window.open(url)
    },
    delFile(item) {
      if (confirm('是否确定删除文件: ' + item.name + '?')) {
        request('/file/del?name=' + encodeURIComponent(item.name)).then(res => {
          dnotify(res.msg)
          this.initData()
        })
      }
    },
    preview(item) {
      this.imgSrc = window.baseApi + '/file/download?name=' + encodeURIComponent(item.name)
      this.showImg = true
    },
  },
}