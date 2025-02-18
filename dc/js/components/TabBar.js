window.TabBarComp = {
  template: `
  <div class="tab-bar">
    <div class="tab-item" v-for="(item, ind) in tabList" :key="ind" :class="{ on: currInd == ind }" @click="tabClick(ind, item)">{{ item }}</div>
  </div>
  `,
  data() {
    return {
      tabList: ['主控', '抖音', '键鼠', '鼠标', '文件', '自定义'],
      currInd: 0,
    }
  },
  mounted() {
    this.currInd = getStorage('currTab') || 0
    this.$emit('change', this.currInd, this.tabList[this.currInd])
  },
  methods: {
    tabClick(ind, item) {
      setStorage('currTab', ind)
      this.currInd = ind
      this.$emit('change', ind, item)
    }
  },
}