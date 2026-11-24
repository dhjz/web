var templates = [
  {
    id: 1,
    name: '默认模板',
    category: '极简',
    preview: '# 标题\n正文内容',
    config: {
      colors: { title: '#1a1a1a', text: '#333333', link: '#0066cc', codeBg: '#f5f5f5', quoteColor: '#666666', quoteBorder: '#dddddd' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 2,
    name: '商务蓝',
    category: '商务',
    preview: '# 商务报告\n专业文档',
    config: {
      colors: { title: '#1e3a5f', text: '#2c3e50', link: '#2980b9', codeBg: '#ecf0f1', quoteColor: '#7f8c8d', quoteBorder: '#3498db' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 15, h3: 14, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 3,
    name: '学术风格',
    category: '学术',
    preview: '# 学术论文\n严谨规范',
    config: {
      colors: { title: '#000000', text: '#1a1a1a', link: '#0055aa', codeBg: '#f8f8f8', quoteColor: '#555555', quoteBorder: '#aaaaaa' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Courier New', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.6, paragraphMargin: 12 }
    }
  },
  {
    id: 4,
    name: '清新绿',
    category: '极简',
    preview: '# 自然清新\n简洁优雅',
    config: {
      colors: { title: '#2d5a27', text: '#3d3d3d', link: '#27ae60', codeBg: '#e8f5e9', quoteColor: '#5d8a57', quoteBorder: '#4caf50' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 5,
    name: '科技灰',
    category: '商务',
    preview: '# 技术文档\n现代科技',
    config: {
      colors: { title: '#212121', text: '#424242', link: '#2196f3', codeBg: '#263238', quoteColor: '#757575', quoteBorder: '#607d8b' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 24, h2: 18, h3: 15, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 6,
    name: '温暖橙',
    category: '商务',
    preview: '# 温暖活力\n积极向上',
    config: {
      colors: { title: '#e65100', text: '#424242', link: '#ff5722', codeBg: '#fff3e0', quoteColor: '#795548', quoteBorder: '#ff9800' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 7,
    name: '优雅紫',
    category: '学术',
    preview: '# 优雅高贵\n精致细腻',
    config: {
      colors: { title: '#4a148c', text: '#333333', link: '#7b1fa2', codeBg: '#f3e5f5', quoteColor: '#616161', quoteBorder: '#9c27b0' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 8,
    name: '简约黑白',
    category: '极简',
    preview: '# 极简主义\n黑白分明',
    config: {
      colors: { title: '#000000', text: '#1a1a1a', link: '#000000', codeBg: '#f0f0f0', quoteColor: '#666666', quoteBorder: '#cccccc' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 26, h2: 18, h3: 15, text: 12 },
      spacing: { lineHeight: 1.6, paragraphMargin: 12 }
    }
  },
  {
    id: 9,
    name: '深蓝海洋',
    category: '商务',
    preview: '# 深邃海洋\n沉稳大气',
    config: {
      colors: { title: '#0d47a1', text: '#37474f', link: '#1976d2', codeBg: '#e3f2fd', quoteColor: '#546e7a', quoteBorder: '#42a5f5' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 10,
    name: '复古棕',
    category: '学术',
    preview: '# 复古韵味\n经典传承',
    config: {
      colors: { title: '#5d4037', text: '#3e2723', link: '#795548', codeBg: '#efebe9', quoteColor: '#6d4c41', quoteBorder: '#8d6e63' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Courier New', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 11,
    name: '活力红',
    category: '商务',
    preview: '# 热情奔放\n充满活力',
    config: {
      colors: { title: '#c62828', text: '#424242', link: '#d32f2f', codeBg: '#ffebee', quoteColor: '#757575', quoteBorder: '#ef5350' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 12,
    name: '青色清新',
    category: '极简',
    preview: '# 清爽青色\n简洁明快',
    config: {
      colors: { title: '#00695c', text: '#37474f', link: '#00897b', codeBg: '#e0f2f1', quoteColor: '#546e7a', quoteBorder: '#26a69a' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 13,
    name: '粉红浪漫',
    category: '极简',
    preview: '# 浪漫粉色\n温馨甜美',
    config: {
      colors: { title: '#ad1457', text: '#424242', link: '#c2185b', codeBg: '#fce4ec', quoteColor: '#757575', quoteBorder: '#e91e63' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 14,
    name: '靛蓝深邃',
    category: '学术',
    preview: '# 深邃靛蓝\n智慧沉稳',
    config: {
      colors: { title: '#283593', text: '#37474f', link: '#303f9f', codeBg: '#e8eaf6', quoteColor: '#546e7a', quoteBorder: '#3f51b5' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Courier New', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 15,
    name: '灰蓝低调',
    category: '极简',
    preview: '# 低调灰蓝\n内敛稳重',
    config: {
      colors: { title: '#455a64', text: '#37474f', link: '#546e7a', codeBg: '#eceff1', quoteColor: '#607d8b', quoteBorder: '#78909c' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.6, paragraphMargin: 12 }
    }
  },
  {
    id: 16,
    name: '金色辉煌',
    category: '商务',
    preview: '# 金色辉煌\n尊贵典雅',
    config: {
      colors: { title: '#f57f17', text: '#424242', link: '#ff8f00', codeBg: '#fff8e1', quoteColor: '#795548', quoteBorder: '#ffc107' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 24, h2: 17, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 17,
    name: '石灰工业',
    category: '商务',
    preview: '# 工业风格\n硬朗坚毅',
    config: {
      colors: { title: '#424242', text: '#616161', link: '#757575', codeBg: '#e0e0e0', quoteColor: '#9e9e9e', quoteBorder: '#bdbdbd' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 24, h2: 18, h3: 15, text: 12 },
      spacing: { lineHeight: 1.6, paragraphMargin: 12 }
    }
  },
  {
    id: 18,
    name: '蓝绿渐变',
    category: '极简',
    preview: '# 蓝绿交融\n和谐自然',
    config: {
      colors: { title: '#00695c', text: '#37474f', link: '#009688', codeBg: '#e0f2f1', quoteColor: '#546e7a', quoteBorder: '#4db6ac' },
      fonts: { title: "'Microsoft YaHei', sans-serif", text: "'Microsoft YaHei', sans-serif", code: "'Consolas', 'Monaco', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.7, paragraphMargin: 14 }
    }
  },
  {
    id: 19,
    name: '深紫神秘',
    category: '学术',
    preview: '# 神秘深紫\n独特魅力',
    config: {
      colors: { title: '#4a148c', text: '#424242', link: '#6a1b9a', codeBg: '#f3e5f5', quoteColor: '#757575', quoteBorder: '#8e24aa' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Courier New', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  },
  {
    id: 20,
    name: '经典宋体',
    category: '学术',
    preview: '# 传统韵味\n经典宋体',
    config: {
      colors: { title: '#1a1a1a', text: '#333333', link: '#0000cc', codeBg: '#f5f5f5', quoteColor: '#666666', quoteBorder: '#999999' },
      fonts: { title: "'SimSun', serif", text: "'SimSun', serif", code: "'Courier New', monospace" },
      sizes: { h1: 22, h2: 16, h3: 14, text: 12 },
      spacing: { lineHeight: 1.8, paragraphMargin: 16 }
    }
  }
];

var templateCategories = ['全部', '商务', '极简', '学术'];

if (window.typesetThemes && window.typesetThemes.length) {
  templates = templates.concat(window.typesetThemes.map(function (theme, i) {
    return {
      id: 100 + i,
      name: theme.name,
      category: '公众号',
      accent: theme.accent,
      theme: theme,
      preview: theme.name + '\n' + theme.tags.join(' · '),
      config: window.themeToConfig(theme)
    };
  }));
  templateCategories.push('公众号');
}

var exampleMarkdown = `# Markdown 转换器使用指南

## 功能介绍

这是一个功能强大的 **Markdown 转换器**，支持 *实时预览*、~~手动刷新~~ 和多种格式导出。使用 \`marked.js\` 解析，语法详情见 [Markdown 指南](https://marked.js.org/)。

### 主要功能

1. **实时预览** — 左侧输入，右侧即时显示渲染效果
2. **模板切换** — 内置 20 套通用模板 + 35 套公众号主题
3. **自定义样式** — 颜色、字体、字号、间距自由配置
4. **多格式导出** — 支持 HTML、PDF、Word，也能直接复制富文本

### 代码示例

\`\`\`javascript
function hello(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}
\`\`\`

### 表格

| 功能 | 状态 | 说明 |
| :--- | :---: | ---: |
| 实时预览 | ✅ | 输入即时渲染 |
| 代码高亮 | ✅ | 支持多语言 |
| 导出 Word | ⏳ | 实验功能 |
| 导出 PDF | ✅ | 基于 html2pdf |

### 引用块

> 好的工具应该让你专注内容本身，而不是被排版分散注意力。
>
> —— 支持多级引用、**加粗** 与 [链接](https://example.com)

### 列表与任务

- 无序列表项一
- 无序列表项二
  - 嵌套列表项
- [x] 已完成：切换主题
- [ ] 待完成：导出并分享

### 图片

![示例图片](https://picsum.photos/seed/markdown/600/180)

### 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

感谢使用本工具！点击「填入示例」可随时恢复这段内容。`;
