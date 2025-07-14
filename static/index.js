const { createApp, ref, reactive } = Vue;

// 为了避免直接使用相对路径，我将url替换为实际的网址。
// 如果你确实需要使用相对路径，请确保你的服务器或开发环境配置正确。
// Vue 应用实例
const app = {
    // data 属性用于返回组件的初始数据
    data() {
        return {
            isDarkMode: localStorage.getItem('isDarkMode') == '1',
            searchQuery: '',
            selectedSearchEngine: localStorage.getItem('lastSearch') || config.searchs[0].url,
            config: config,
            searchItem: {},
        };
    },
    // methods 包含了组件的所有方法
    methods: {
        // 切换日间/夜间模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('isDarkMode', this.isDarkMode ? 1 : 0); // 保存到 localStorage
        },
        searchChange() {
            localStorage.setItem('lastSearch', this.selectedSearchEngine); // 保存到 localStorage
            this.searchItem = config.searchs.find(item => item.url === this.selectedSearchEngine);
        },
        // 执行搜索
        performSearch() {
            if (this.searchQuery.trim() === '') {
                alert('请输入搜索内容！');
                return;
            }
            // 注意：在 Options API 中，通过 this.selectedSearchEngine 和 this.searchQuery 访问数据
            const url = this.selectedSearchEngine.replace('%s', encodeURIComponent(this.searchQuery));
            window.open(url, '_blank');
        }
    },
    // watch 用于侦听数据的变化，这里不需要特别设置，因为 toggleDarkMode 和 performSearch 直接修改了数据
    watch: {
        // 如果需要根据 isDarkMode 的变化执行一些副作用，可以写在这里
        isDarkMode(newValue) {
            if (newValue) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    },
    mounted() {
        // 在 mounted 钩子中可以设置初始的深色模式类，如果默认就是深色的话
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        this.searchChange()
    }
};

// 将 app 配置对象挂载到 DOM
// Vue 3 的 createApp API 在 Options API 和 Composition API 中是相同的用法
createApp(app).mount('#app');
