## 前言
采集工具千千万，但大多数都会一定程度上依赖后端，为了简洁考虑，试着写了一个纯前端采集网站数据的工具。  

## 思路
- 采集列表页， 获取所有正文链接
- 根据所有正文链接采集需要的内容
- 将内容导出指定格式(本次是json)

## 巧点
采集网站可能会存在跨域的问题，下面是3种思路解决这个问题  
1. 使用代理，这个比较简单，稍微懂点后端，用nodejs，go，java就能快速实现一个代理请求并返回html代码
2. 使用谷歌浏览器跨域参数（本次采用这种方式），就完全不需要后端，纯前端跨域了
3. 使用免费云函数，web端直接代理了
```shell
# 打开谷歌跨域参数.bat
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=E:\AllCache\Chrome --allow-running-insecure-content %1
```
## 使用技术
- vue3
- axios

## 功能一览


## 实现步骤
### 设计参数
- 采集地址：采集url，通常为第一个列表页地址
- 文章a标签选择器：列表页中需要采集正文页地址的a标签
- 文章内正文选择器：正文页中需要采集的内容
- 文章内标题选择器：正文页中需要采集的标题
- 文章内日期选择器：正文页中需要采集的日期
- 文章内容删除, |隔开：正文中需要删除的内容，比如一般固定的广告词，支持正则匹配删除
- 保留标签：过滤采集的html各种标签，只保留指定的标签，比如p，img
- 分页参数：支持分页，同时采集几十页
- 采集延迟：每页的延迟，防止访问频率过高被封
- 自定义内容页参数：内容页其他内容也可以采集，比如作者，点击量等
### 采集列表页
#### 采集单列表页
- 根据指定的url和正文页a标签选择器，请求到地址的html内容后，筛选出所有正文标题和链接  
- 注意需要将正文地址换成绝对地址,使用URL功能
- 采集使用setTimeout延迟返回结果，可以自定义延迟
```javascript
function getListData(options) {
  const result = { total: 0, list: [] }
  return new Promise((reso) => {
    let url = options.proxyUrl ? (options.proxyUrl + options.url) : options.url
    axios.get(url, { responseType: 'document' }).then((res) => {
      if (res.status != 200 || !res.data) return reso(result)
      let articleList = Array.from(res.data.querySelectorAll(options.articlelSelector))

      articleList.forEach(async (el) => {
        const href = await el.getAttribute('href')
        result.list.push({
          href: /http[s]?:\/\//.test(href) ? href : new URL(href, options.url).toString(),
          title: el.title ? el.title.trim() : el.innerText.trim()
        })
      })
      result.total = articleList.length
      console.log('getListData total -> ' + result.total + ', url -> ' + options.url)
      setTimeout(() => reso(result), options.delay || 10)
    }).catch(() => reso(result))
  })
}
```
#### 采集分页列表页数据
- 使用for循环和await保证数据按照顺序采集
- 提供回调函数反馈采集进度供预览
```javascript
function getPageListData(options, callback) {
  return new Promise(async (reso) => {
    let result = { total: 0, list: [] }
    if (!options.pageUrl) return reso(result)
    if (options.list && options.list.length) return reso({ total: options.list.length, list: options.list })

    if (options.isPage != 1) {
      return reso(await getListData({ ...options }))
    }

    const pageStart = parseInt(options.pageStart)
    const pageEnd = parseInt(options.pageEnd)
    const start = Math.min(pageStart, pageEnd)
    const end = Math.max(pageStart, pageEnd)
    for (let i = start - 1; i <= end; i++) {
      if (i != start - 1) options.url = options.pageUrl.replace('{ID}', i)
      const data = await getListData({ ...options })
      result.total += data.total
      result.list = result.list.concat(data.list)
      callback && callback(i, end)
    }
    reso(result)
  })
}
```
### 采集正文页内容
- 将正文所有href、src的链接都替换为绝对路径
- 删除所有script标签，因为无用
- 根据提供的标题、日期、自定义字段参数将内容了取出返回
- 分页采集正文思路同`采集分页列表`
```javascript
function getContData(options) {
  return new Promise((reso) => {
    let url = options.proxyUrl ? (options.proxyUrl + options.href) : options.href
    axios.get(url, { responseType: 'document' }).then(async (res) => {
      if (res.status != 200 || !res.data) return reso({})
      let contEl = res.data.querySelector(options.contSelector)
      if (!contEl) return reso({})
      Array.from(contEl.querySelectorAll('*[href]')).forEach(async el => {
        const href = await el.getAttribute('href')
        el.href = /http[s]?:\/\//.test(href) ? href : new URL(href, options.url).toString()
      })
      Array.from(contEl.querySelectorAll('*[src]')).forEach(async el => {
        const src = await el.getAttribute('src')
        el.src = /http[s]?:\/\//.test(src) ? src : new URL(src, options.url).toString()
      })
      Array.from(contEl.querySelectorAll('script')).forEach(el => {
        el.parentNode.removeChild(el) // 删除所有script标签
      })
      setTimeout(() => {
        let cont = options.isText == '1' ? pureHtml(contEl.innerHTML)
          : pureHtml(contEl.innerHTML, options.tags ? options.tags.trim().replaceAll('，',',').split(',') : null)
        if (options.contDel) {
          options.contDel.split('|').forEach(item => cont = cont.replace(new RegExp(item, 'ig'), ''))
        }
        const title = options.titleSelector ? res.data.querySelector(options.titleSelector)?.innerText : null
        const date = options.dateSelector ? res.data.querySelector(options.dateSelector)?.innerText : null
        const result = { title, cont, date }
        if (options.fields && options.fields.length) {
          options.fields.filter(x => x.key && x.val).forEach(x => {
            result[x.key] = res.data.querySelector(x.val)?.innerText || ''
          })
        }
        reso(result)
      }, options.delay || 10)
    }).catch(() => reso(''))
  })
}
```
### 将数据保存到json文件
- CV了网上常见的文件保存代码
- 支持保存亚索版json和美化版json
```javascript
// 采集中的代码
getPageContData({ ...this.form }, this.updateProcess).then(data => {
  console.log(data)
  saveText(JSON.stringify(data, null, isBeauty ? 2 : 0), 'test.json')
})

// 工具函数
window.saveAs = function(blob, name) {
    let link = document.createElement('a')
    let href = window.URL.createObjectURL(blob)
    link.href = href
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(href)
}

window.saveText = function(text, name) {
  window.saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), name || (new Date().getTime() + '.txt'))
}
// 进化html标签工具函数....
```

## 后言
开发这个主要是怕一些网站随时关停了，数据就没了，好留个备份，仅供学习使用

## 在线体验地址
[https://dhjz.github.io/spider](https://dhjz.github.io/spider)  
- 源码详见[https://github.com/dhjz/spider](https://github.com/dhjz/spider)