window.config = {
  searchs: [
    { name: '百度', url: 'https://www.baidu.com/s?ie=utf8&oe=utf8&wd=%s', color: '#3377FF' },
    { name: '必应', url: 'https://cn.bing.com/search?q=%s', color: '#00838F' },
    { name: '谷歌', url: 'https://www.google.com.hk/search?hl=zh-CN&q=%s', color: '#4285F4' },
    { name: 'GitHub', url: 'https://github.com/search?q=%s', color: '#24292E' },
    { name: '搜狗', url: 'https://www.sogou.com/tx?ie=utf-8&query=%s', color: '#FF8A00' },
    { name: 'Yandex', url: 'https://yandex.com/search/?text=%s', color: '#FF0000' },
  ],
  sites: [
    {
      name: '开发工具',
      list: [
        { name: '工具函数', short: '函数', url: './utils/index.html', color: '#6A5ACD' },
        { name: '在线调色板', short: '调色', url: './color/index.html', color: '#F08080' },
        { name: '渐变色', short: '渐变色', url: './grad/index.html', color: '#1a7690' },
        { name: 'CSS三角', short: '三角', url: './border/index.html', color: '#20B2AA' },
        { name: 'JS混淆加密', short: 'JS混淆', url: './jsmix/index.html', color: '#089d56' },
        { name: '代码美化', short: '代码', url: './code/index.html', color: '#8A2BE2' },
        { name: '文本处理', short: '文本', url: './tool.html', color: '#5F9EA0' },
        { name: 'UEditor', short: 'UEditor', url: './ueditor/index.html', color: '#FF6347' },
        { name: '爬虫采集', short: '采集', url: './spider/index.html', color: '#65cd32' },
        { name: 'Ace', short: 'Ace', url: './ace/index.html', color: '#4682B4' },
        { name: 'Emoji', short: 'Emoji', url: './emoji/index.html', color: '#32CD32' },
        { name: '符号大全', short: '符号', url: './icon.html', color: '#FFD700' },
        { name: 'Base64转换', short: 'Base64', url: './base64.html', color: '#6a6443' },
        { name: '字符压缩', short: '压缩', url: './pako/index.html', color: '#861683' },
        { name: '工具类', short: '工具类', url: './utils/lib.html', color: '#8B4513' },
        { name: 'JS库CDN', short: 'CDN', url: 'https://cdn.199311.xyz/', color: '#138b43' },
      ]
    },
    {
      name: '媒体工具',
      list: [
        { name: '在线PS', short: 'PS', url: './ps/index.html', color: '#6495ED' },
        { name: '在线录音', short: '录音', url: './record/index.html', color: '#E50113' },
        { name: '音频编辑', short: '音频', url: './audio/index.html', color: '#82142a' },
        { name: '音频转换', short: '音频转', url: './audioc/index.html', color: '#DC143C' },
        { name: 'ICON转换', short: 'ICO', url: './ico/index.html', color: '#9370DB' },
        { name: '图片压缩', short: '压缩', url: 'https://tiny.199311.xyz/', color: '#ff3385' },
        { name: 'SVG编辑', short: 'SVG', url: 'https://svg.199311.xyz/', color: '#D4237A' },
      ]
    },
    {
      name: '硬件工具',
      list: [
        { name: '键盘测试', short: '键盘', url: './key/index.html', color: '#DAA520' },
        { name: '屏幕测试', short: '屏幕', url: './screen/index.html', color: '#00CED1' },
        { name: '局域网控制', short: '控制', url: './dc/index.html', color: '#FF4500' },
        { name: '网速测试', short: '网速', url: 'https://net.199311.xyz/', color: '#5062f2' },
        { name: '系统监控', short: '监控', url: 'http://home.199311.xyz:40888/', color: '#409EFF' },
        { name: '老工具', short: '老工具', url: './old.html', color: '#bbb' },
      ]
    },
    {
      name: '个人工具',
      list: [
        { name: '临时文件', short: '临时', url: 'https://t.199311.xyz', color: '#DAA520' },
        { name: 'HTML测试', short: 'HTML', url: 'https://t.199311.xyz/html/', color: '#a15f2f' },
        { name: '图片站', short: '图片', url: 'https://img.199311.xyz/', color: '#34a196' },
        { name: 'Test文件', short: 'Test', url: 'https://file.199311.xyz/test.json', color: '#5f5f5f' },
        { name: '古诗学习', short: '古诗', url: 'https://study.199311.xyz/poem/', color: '#66bb6a' },
        { name: '影音娱乐', short: '影音', url: 'https://tv.199311.xyz/', color: '#42DC85' },
        { name: 'GD云音乐', short: '云音乐', url: 'https://tv.199311.xyz/music', color: '#cc280b' },
        { name: 'AI对话', short: 'Chat', url: 'https://chat.199311.xyz/', color: '#409eff' },
        { name: '局域网传输', short: '传输', url: 'http://home.199311.xyz:40080/', color: '#4285f4' },
        { name: '家文件服务', short: 'Chfs', url: 'http://home.199311.xyz:9000/', color: '#419641 ' },
        { name: 'PostMin', short: 'Post', url: 'https://home.199311.xyz:40003/', color: '#67C23A ' },
        { name: 'D-API', short: 'Post', url: './api/index.html', color: '#67C23A ' },
        { name: '海纳思', short: 'Nas', url: 'http://home.199311.xyz:20080/', color: '#320EEA' },
        { name: 'AList', short: 'AList', url: 'http://home.199311.xyz:25244/', color: '#238FE7' },
        { name: '音乐之家', short: '音乐', url: 'https://music.199311.xyz/', color: '#49ABFC' },
      ]
    },
  ],
  footer: footers[Math.floor(Math.random() * footers.length)]
}
