let host = location.protocol + '//' + location.hostname
window.config = {
  sites: [
    { name: '调色板', short: '调色', url: 'https://c.runoob.com/front-end/6210/', color: '#ff7800' },
    { name: '输入建议框', short: '输入', url: './inputTip/index.html', color: '#15a615' },
    { name: '提示框', short: '提示', url: './notify/index.html', color: '#409eff' },
    // { name: '数据库管理', short: '数据库', url: host + ':40002', color: '#afaaad' },
    // { name: '服务器监控', short: '监控', url: host + ':40001', color: '#e6bc00' },
  ],
  footer: '人生得意须尽欢，莫使金樽空对月。'
}