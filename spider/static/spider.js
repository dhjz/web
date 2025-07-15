// axios.get('https://www.runoob.com/?s=bootstrap', { responseType: 'document' }).then(res => {
//     const $ = res.data
//     let list = []
//     Array.from($.querySelectorAll('.archive-list-item')).forEach(item => {
//         let a = item.querySelector('h2 a')
//         if (a) {
//             axios.get(a.href.replace('http://', 'https://'), { responseType: 'document' }).then(res => {
//                 list.push({title: a.innerText.trim(), content: res.data.querySelector('#content').innerText.trim().replace(/\n+/g, '\n')})
//             })
//         }
//     })
//     setTimeout(() => {
//       console.log(list)
//       saveText(JSON.stringify(list), 'test.json')
//     }, 10000)
// })

// const options = {
//   url: 'https://www.iplaysoft.com/category/system',
//   // listSelector: '#postlist',
//   articlelSelector: '.entry-head .entry-title a',
//   contSelector: '.entry-content',
//   titleSelector: '',
//   isPage: '1',
//   isText: '1',
//   pageStart: '2',
//   pageEnd: '3',
//   delay: 300,
//   pageUrl: 'https://www.iplaysoft.com/category/system/page/{ID}',
//   proxyUrl: 'https://web.dhjz.fun/.netlify/functions/proxy?url='
// }