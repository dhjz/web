const HISTORY_STORAGE_KEY = 'md-converter-history';
const TEMPLATE_CONFIG_STORAGE_KEY = 'md-converter-template-config';
const LAST_TEMPLATE_ID_STORAGE_KEY = 'md-converter-last-template-id';
const MAX_HISTORY_DEFAULT = 15;

function loadHistoryFromStorage() {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveHistoryToStorage(list, maxCount) {
  try {
    const trimmed = list.slice(0, maxCount);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('保存历史记录失败', e);
  }
}

function extractTitleAndPreview(markdown) {
  const lines = markdown.split('\n').filter(l => l.trim());
  let title = '';
  let preview = '';
  for (const line of lines) {
    if (!title && line.startsWith('#')) {
      title = line.replace(/^#+\s*/, '').trim();
    } else if (!line.startsWith('#') && line.trim()) {
      preview = line.trim();
      break;
    }
  }
  if (!title) title = lines[0] ? lines[0].trim().slice(0, 50) : '无标题';
  if (!preview) preview = lines[1] ? lines[1].trim().slice(0, 100) : '';
  return { title: title.slice(0, 50), preview: preview.slice(0, 100) };
}

function extractFilename(markdown) {
  const lines = markdown.split('\n').filter(l => l.trim());
  if (lines.length === 0) return '未命名';
  let firstLine = lines[0].trim();
  if (firstLine.startsWith('#')) {
    firstLine = firstLine.replace(/^#+\s*/, '').trim();
  }
  firstLine = firstLine.replace(/[\\/:*?"<>|]/g, '');
  if (firstLine.length > 20) {
    firstLine = firstLine.slice(0, 20);
  }
  return firstLine || '未命名';
}

let dynamicStyleEl = null;

function updateDynamicStyle(css) {
  if (!dynamicStyleEl) {
    dynamicStyleEl = document.createElement('style');
    dynamicStyleEl.id = 'dynamic-template-style';
    document.head.appendChild(dynamicStyleEl);
  }
  dynamicStyleEl.textContent = css;
}

const app = Vue.createApp({
  data() {
    return {
      markdownText: '',
      renderedHTML: '',
      currentTemplate: null,
      templateCSS: '',
      selectDialogVisible: false,
      editDialogVisible: false,
      historyDialogVisible: false,
      currentCategory: '全部',
      activeCollapse: ['colors', 'fonts', 'sizes', 'spacing'],
      historyList: [],
      maxHistoryCount: MAX_HISTORY_DEFAULT,
      editConfig: {
        colors: {
          title: '#1a1a1a',
          text: '#333333',
          link: '#0066cc',
          codeBg: '#f5f5f5',
          quoteColor: '#666666',
          quoteBorder: '#dddddd'
        },
        fonts: {
          title: "'Microsoft YaHei', sans-serif",
          text: "'Microsoft YaHei', sans-serif",
          code: "'Consolas', 'Monaco', monospace"
        },
        sizes: {
          h1: 22,
          h2: 16,
          h3: 14,
          text: 12
        },
        spacing: {
          lineHeight: 1.8,
          paragraphMargin: 16
        }
      },
      fontOptions: [
        { value: "'Microsoft YaHei', sans-serif", label: '微软雅黑' },
        { value: "'SimSun', serif", label: '宋体' },
        { value: "'SimHei', sans-serif", label: '黑体' },
        { value: "'KaiTi', serif", label: '楷体' },
        { value: "'Times New Roman', serif", label: 'Times New Roman' },
        { value: "'Georgia', serif", label: 'Georgia' },
        { value: "'Helvetica Neue', sans-serif", label: 'Helvetica' },
        { value: "'Arial', sans-serif", label: 'Arial' }
      ],
      codeFontOptions: [
        { value: "'Consolas', 'Monaco', monospace", label: 'Consolas' },
        { value: "'Courier New', monospace", label: 'Courier New' },
        { value: "'Fira Code', 'Consolas', monospace", label: 'Fira Code' },
        { value: "'Monaco', monospace", label: 'Monaco' },
        { value: "'Menlo', 'Consolas', monospace", label: 'Menlo' }
      ],
      leftWidth: parseFloat(localStorage.getItem('panel-width')) || 50
    };
  },
  computed: {
    filteredTemplates() {
      if (this.currentCategory === '全部') {
        return templates;
      }
      return templates.filter(t => t.category === this.currentCategory);
    },
    currentConfig() {
      if (this.currentTemplate) {
        return this.currentTemplate.config;
      }
      return this.editConfig;
    }
  },
  watch: {
    markdownText: {
      handler() {
        this.renderMarkdown();
      },
      immediate: true
    },
    templateCSS: {
      handler(css) {
        updateDynamicStyle(css);
      },
      immediate: true
    }
  },
  methods: {
    startResize(e) {
      const container = this.$refs.mainContainer;
      const onMove = (ev) => {
        const rect = container.getBoundingClientRect();
        this.leftWidth = Math.min(80, Math.max(20, ((ev.clientX - rect.left) / rect.width) * 100));
        localStorage.setItem('panel-width', this.leftWidth);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    onDrag(e) {
      e.preventDefault();
    },
    onDrop(e) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      file && this.readFile(file);
    },
    async readFile(file) {
      const txt = await readTxt(file);
      this.markdownText = txt;
    },
    async handleUpload() {
      const txt = await uploadText();
      if (txt) {
        this.markdownText = txt;
      }
    },
    renderMarkdown() {
      if (typeof marked !== 'undefined') {
        let html = marked.parse(this.markdownText);
        if (typeof renderMath !== 'undefined') {
          html = renderMath(html);
        }
        if (typeof highlightCode !== 'undefined') {
          html = highlightCode(html);
        }
        html = this.addTargetBlankToLinks(html);
        this.renderedHTML = html;
      } else {
        this.renderedHTML = this.markdownText;
      }
    },
    addTargetBlankToLinks(html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      return tempDiv.innerHTML;
    },
    clearContent() {
      this.markdownText = '';
    },
    fillExample() {
      this.markdownText = exampleMarkdown;
    },
    openSelectDialog() {
      this.selectDialogVisible = true;
    },
    openEditDialog() {
      if (this.currentTemplate) {
        const savedConfig = this.getTemplateConfigFromStorage(this.currentTemplate.id);
        if (savedConfig) {
          this.editConfig = deepClone(savedConfig);
        } else {
          const originalTemplate = templates.find(t => t.id === this.currentTemplate.id);
          this.editConfig = deepClone(originalTemplate ? originalTemplate.config : this.currentTemplate.config);
        }
      } else {
        this.editConfig = deepClone(templates[0].config);
      }
      this.editDialogVisible = true;
    },
    selectTemplate(template) {
      this.currentTemplate = template;
      localStorage.setItem(LAST_TEMPLATE_ID_STORAGE_KEY, template.id);
      const savedConfig = this.getTemplateConfigFromStorage(template.id);
      if (savedConfig) {
        this.editConfig = deepClone(savedConfig);
        this.templateCSS = generateTemplateCSS(savedConfig);
      } else {
        this.editConfig = deepClone(template.config);
        this.templateCSS = generateTemplateCSS(template.config);
      }
      this.selectDialogVisible = false;
      ElementPlus.ElMessage.success(`已应用模板：${template.name}`);
    },
    getTemplateConfigFromStorage(templateId) {
      try {
        const data = localStorage.getItem(TEMPLATE_CONFIG_STORAGE_KEY);
        if (data) {
          const configMap = JSON.parse(data);
          return configMap[templateId] || null;
        }
      } catch (e) {
        console.error('读取模版配置失败', e);
      }
      return null;
    },
    applyEditConfig() {
      this.templateCSS = generateTemplateCSS(this.editConfig);
      this.saveTemplateConfigToStorage();
      if (this.currentTemplate) {
        this.currentTemplate.config = deepClone(this.editConfig);
      }
      this.editDialogVisible = false;
      ElementPlus.ElMessage.success('样式已应用');
    },
    saveTemplateConfigToStorage() {
      if (!this.currentTemplate) return;
      const originalTemplate = templates.find(t => t.id === this.currentTemplate.id);
      if (!originalTemplate) return;
      const originalConfigStr = JSON.stringify(originalTemplate.config);
      const currentConfigStr = JSON.stringify(this.editConfig);
      try {
        const data = localStorage.getItem(TEMPLATE_CONFIG_STORAGE_KEY);
        let configMap = data ? JSON.parse(data) : {};
        if (originalConfigStr !== currentConfigStr) {
          configMap[this.currentTemplate.id] = this.editConfig;
        } else {
          delete configMap[this.currentTemplate.id];
        }
        if (Object.keys(configMap).length > 0) {
          localStorage.setItem(TEMPLATE_CONFIG_STORAGE_KEY, JSON.stringify(configMap));
        } else {
          localStorage.removeItem(TEMPLATE_CONFIG_STORAGE_KEY);
        }
      } catch (e) {
        console.error('保存模版配置失败', e);
      }
    },
    loadTemplateConfigFromStorage() {
      try {
        const data = localStorage.getItem(TEMPLATE_CONFIG_STORAGE_KEY);
        if (data) {
          const configMap = JSON.parse(data);
          for (const template of templates) {
            const savedConfig = configMap[template.id];
            if (savedConfig) {
              this.currentTemplate = template;
              this.editConfig = deepClone(savedConfig);
              this.templateCSS = generateTemplateCSS(savedConfig);
              return true;
            }
          }
        }
      } catch (e) {
        console.error('加载模版配置失败', e);
      }
      return false;
    },
    resetTemplateConfig() {
      if (!this.currentTemplate) return;
      const originalTemplate = templates.find(t => t.id === this.currentTemplate.id);
      if (!originalTemplate) return;
      this.editConfig = deepClone(originalTemplate.config);
      this.currentTemplate.config = deepClone(originalTemplate.config);
      this.templateCSS = generateTemplateCSS(originalTemplate.config);
      try {
        const data = localStorage.getItem(TEMPLATE_CONFIG_STORAGE_KEY);
        if (data) {
          const configMap = JSON.parse(data);
          delete configMap[this.currentTemplate.id];
          if (Object.keys(configMap).length > 0) {
            localStorage.setItem(TEMPLATE_CONFIG_STORAGE_KEY, JSON.stringify(configMap));
          } else {
            localStorage.removeItem(TEMPLATE_CONFIG_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('重置模版配置失败', e);
      }
      this.editDialogVisible = false;
      ElementPlus.ElMessage.success('已重置为默认配置');
    },
    async handleCopyRichText() {
      this.saveToHistory();
      const previewEl = document.querySelector('.preview-content');
      if (previewEl) {
        const success = await copyRichText(previewEl);
        if (success) {
          ElementPlus.ElMessage.success('富文本已复制到剪贴板');
        } else {
          ElementPlus.ElMessage.error('复制失败，请手动选择复制');
        }
      }
    },
    handleExportHTML() {
      const previewEl = document.querySelector('.preview-content');
      if (previewEl) {
        const filename = extractFilename(this.markdownText) + '.html';
        exportAsHTML(this.renderedHTML, this.templateCSS, filename);
        this.saveToHistory();
        ElementPlus.ElMessage.success('HTML 文件已下载');
      }
    },
    async handleExportPDF() {
      const previewEl = document.querySelector('.preview-content');
      if (previewEl) {
        ElementPlus.ElMessage.info('正在生成 PDF...');
        const filename = extractFilename(this.markdownText) + '.pdf';
        await exportAsPDF(previewEl, filename);
        this.saveToHistory();
        ElementPlus.ElMessage.success('PDF 文件已下载');
      }
    },
    handlePrintPDF() {
      this.saveToHistory();
      printPreviewContent(this.templateCSS);
    },
    async handleExportWord() {
      ElementPlus.ElMessage.info('正在生成 Word 文档...');
      try {
        const config = this.currentTemplate ? this.currentTemplate.config : this.editConfig;
        const filename = extractFilename(this.markdownText) + '.docx';
        await exportAsDocx(this.renderedHTML, config, filename);
        this.saveToHistory();
        ElementPlus.ElMessage.success('Word 文件已下载');
      } catch (e) {
        console.error(e);
        ElementPlus.ElMessage.error('导出失败，请重试');
      }
    },
    openHistoryDialog() {
      this.historyList = loadHistoryFromStorage();
      this.historyDialogVisible = true;
    },
    formatTime(timestamp) {
      const d = new Date(timestamp);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    },
    loadHistory(item) {
      this.markdownText = item.content;
      this.historyDialogVisible = false;
      ElementPlus.ElMessage.success('已加载历史记录');
    },
    deleteHistory(index) {
      this.historyList.splice(index, 1);
      saveHistoryToStorage(this.historyList, this.maxHistoryCount);
      ElementPlus.ElMessage.success('已删除');
    },
    saveToHistory() {
      if (!this.markdownText.trim()) return;
      let list = loadHistoryFromStorage();
      const isDuplicate = list.some(item => item.content === this.markdownText);
      if (isDuplicate) return;
      const { title, preview } = extractTitleAndPreview(this.markdownText);
      const newItem = {
        id: Date.now(),
        title,
        preview,
        content: this.markdownText,
        timestamp: Date.now()
      };
      list.unshift(newItem);
      list = list.slice(0, this.maxHistoryCount);
      saveHistoryToStorage(list, this.maxHistoryCount);
    }
  },
  mounted() {
    if (templates && templates.length > 0) {
      const lastTemplateId = localStorage.getItem(LAST_TEMPLATE_ID_STORAGE_KEY);
      let initialTemplate = null;
      if (lastTemplateId) {
        initialTemplate = templates.find(t => t.id === parseInt(lastTemplateId));
      }
      if (!initialTemplate) {
        const loaded = this.loadTemplateConfigFromStorage();
        if (!loaded) {
          initialTemplate = templates[0];
        }
      }
      if (initialTemplate) {
        this.currentTemplate = initialTemplate;
        const savedConfig = this.getTemplateConfigFromStorage(initialTemplate.id);
        if (savedConfig) {
          this.editConfig = deepClone(savedConfig);
          this.templateCSS = generateTemplateCSS(savedConfig);
        } else {
          this.editConfig = deepClone(initialTemplate.config);
          this.templateCSS = generateTemplateCSS(initialTemplate.config);
        }
      }
    }
    let list = loadHistoryFromStorage();
    this.markdownText = list[0]?.content || '';
    document.body.addEventListener('dragover', this.onDrag);
    document.body.addEventListener('drop', this.onDrop);
  },
  beforeUnmount() {
    document.body.removeEventListener('dragover', this.onDrag);
    document.body.removeEventListener('drop', this.onDrop);
  }
});

app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
var vueApp = app.mount('#app');
