const { createApp, ref, reactive } = Vue;

const app = {
    data() {
        return {
            isDarkMode: localStorage.getItem('isDarkMode') == '1',
            searchQuery: '',
            selectedSearchEngine: localStorage.getItem('lastSearch') || config.searchs[0].url,
            config: window.config || JSON.parse(localStorage.getItem('dweb-config') || '{}'),
            searchItem: {},
            linkList: JSON.parse(localStorage.getItem('linkList') || '[]') || [],
        };
    },
    watch: {
        isDarkMode(newValue) {
            if (newValue) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    },
    mounted() {
        if (this.isDarkMode) document.body.classList.add('dark-mode');
        this.searchChange()
        this.initDtab()
    },
    methods: {
        initDtab() {
            fetch('https://www.199311.xyz/dtab.json').then(res => res.json()).then(data => {
                this.linkList = data.linkList || [];
                localStorage.setItem('linkList', JSON.stringify(this.linkList))
                console.log(data.linkList);
            })
            if (this.config) {
                localStorage.setItem('dweb-config', JSON.stringify(this.config))
            }
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('isDarkMode', this.isDarkMode ? 1 : 0);
        },
        searchChange() {
            localStorage.setItem('lastSearch', this.selectedSearchEngine);
            this.searchItem = this.config.searchs.find(item => item.url === this.selectedSearchEngine);
        },
        performSearch() {
            if (!this.searchQuery.trim()) return alert('请输入搜索内容！');
            const url = this.selectedSearchEngine.replace('%s', encodeURIComponent(this.searchQuery));
            window.open(url, '_blank');
        },
        performSearch2() {
            window.open(`https://github.com/search?q=${encodeURIComponent(this.searchQuery)}`, '_blank');
        },
        performSearch3() {
            window.open(`https://cn.bing.com/search?q=${encodeURIComponent(this.searchQuery)}`, '_blank');
        }
    },
};

// 将 app 配置对象挂载到 DOM
// Vue 3 的 createApp API 在 Options API 和 Composition API 中是相同的用法
createApp(app).mount('#app');

function getDate() {
  const today = new Date();
  return `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
}


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(e => console.log('[SW-TV] Service Worker success:', e))
      .catch(e => console.log('[SW-TV] Service Worker failed:', e));
  });
}