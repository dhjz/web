const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)

function fn() {
  if (navigator.userAgent === 'ReactSnap') return

  // setTimeout(() => {
  //   if (navigator.userAgent.indexOf('iPhone') === -1) return
  //   if (window.DEVELOPMENT || location.href.indexOf('dev=true') !== -1) {
  //     var script = document.createElement('script')
  //     script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js'
  //     script.onload = function () {
  //       var vConsole = new window.VConsole()
  //     }
  //     document.head.appendChild(script)
  //   }
  // }, 10)

  // {
  //   if (location.hostname.indexOf('photext') === -1) {
  //     // Baidu Analytics
  //     var _hmt = _hmt || [];
  //     (function () {
  //       var hm = document.createElement('script')
  //       hm.src = 'https://hm.baidu.com/hm.js?3fc53ef7c7e881dd4737470e096e0388'
  //       var s = document.getElementsByTagName('script')[0]
  //       s.parentNode.insertBefore(hm, s)
  //     })();
  //   }
  // }

  // Google Analytics
  // (function () {

  //   // 创建<script>元素
  //   var gtagScript = document.createElement('script');

  //   var G_ID = location.hostname.indexOf('photext') !== -1 ? 'G-DTZ7G8PT2P' : 'G-4LL7GCVGN2'
  //   // 设置属性
  //   gtagScript.async = true;

  //   gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + G_ID;

  //   // 把<script>元素插入到<head>中
  //   document.head.appendChild(gtagScript);

  //   // 当<script>加载完毕后，执行本地的gtag配置代码
  //   gtagScript.onload = function () {
  //     window.dataLayer = window.dataLayer || [];

  //     function gtag() {
  //       dataLayer.push(arguments);

  //     }
  //     window.gtag = gtag

  //     // 初始化gtag
  //     gtag('js', new Date());

  //     // 配置gtag
  //     gtag('config', G_ID);

  //   };

  // })();

  // 阿里arms
  // !(function (c, b, d, a) {
  //   c[a] || (c[a] = {});
  //   c[a].config = {
  //     appType: "web",
  //     imgUrl: "https://arms-retcode.aliyuncs.com/r.png?",
  //     sendResource: true,
  //     enableLinkTrace: true,
  //     // behavior: true,
  //     useFmp: true,
  //     uid: JSON.parse(localStorage.getItem('Parse/tugaigai/currentUser') || '{}').objectId,
  //     enableSPA: true,
  //     pid: "dufwqespa4@593ab5dec81cf45",
  //     imgUrl: "https://arms-retcode.aliyuncs.com/r.png?",
  //     behavior: false,
  //     disableHook: true,
  //   };

  //   with (b) with (body) with (insertBefore(createElement("script"), firstChild)) setAttribute("crossorigin", "", src = d)
  // })(window, document, "https://retcode.alicdn.com/retcode/bl.js", "__bl");
  // !(function (c, b, d, a) {
  //   c[a] || (c[a] = {})
  //   c[a].config = {
  //     pid: 'dufwqespa4@593ab5dec81cf45',
  //     appType: 'web',
  //     imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?',
  //     behavior: false,
  //     disableHook: true,
  //     enableSPA: true
  //   }
  //   with (b) with (body) with (insertBefore(createElement('script'), firstChild)) setAttribute('crossorigin', '', (src = d))
  // })(window, document, 'https://sdk.rum.aliyuncs.com/v1/bl.js', '__bl')

  // 微软clarity; 经调试发现性能占用较高，手机端使用编辑器页面经常崩溃
  // if (!isMobile)
  // {
  //   var CLARITY_ID = location.hostname.indexOf('photext') !== -1 ? 'oycxtvayxa' : 'mu6mj3vlhq'
  //   ;(function (c, l, a, r, i, t, y) {
  //     c[a] =
  //       c[a] ||
  //       function () {
  //         ;(c[a].q = c[a].q || []).push(arguments)
  //       }

  //     t = l.createElement(r)
  //     t.async = 1
  //     t.src = 'https://www.clarity.ms/tag/' + i

  //     y = l.getElementsByTagName(r)[0]
  //     y.parentNode.insertBefore(t, y)
  //   })(window, document, 'clarity', 'script', CLARITY_ID)
  // }

  // mixpanel
  // ;(function (f, b) {
  //   if (!b.__SV) {
  //     var e, g, i, h
  //     window.mixpanel = b
  //     b._i = []
  //     b.init = function (e, f, c) {
  //       function g(a, d) {
  //         var b = d.split('.')
  //         2 == b.length && ((a = a[b[0]]), (d = b[1]))
  //         a[d] = function () {
  //           a.push([d].concat(Array.prototype.slice.call(arguments, 0)))
  //         }
  //       }
  //       var a = b
  //       'undefined' !== typeof c ? (a = b[c] = []) : (c = 'mixpanel')
  //       a.people = a.people || []
  //       a.toString = function (a) {
  //         var d = 'mixpanel'
  //         'mixpanel' !== c && (d += '.' + c)
  //         a || (d += ' (stub)')
  //         return d
  //       }
  //       a.people.toString = function () {
  //         return a.toString(1) + '.people (stub)'
  //       }
  //       i =
  //         'disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove'.split(
  //           ' '
  //         )
  //       for (h = 0; h < i.length; h++) g(a, i[h])
  //       var j = 'set set_once union unset remove delete'.split(' ')
  //       a.get_group = function () {
  //         function b(c) {
  //           d[c] = function () {
  //             call2_args = arguments
  //             call2 = [c].concat(Array.prototype.slice.call(call2_args, 0))
  //             a.push([e, call2])
  //           }
  //         }
  //         for (var d = {}, e = ['get_group'].concat(Array.prototype.slice.call(arguments, 0)), c = 0; c < j.length; c++) b(j[c])
  //         return d
  //       }
  //       b._i.push([e, f, c])
  //     }
  //     b.__SV = 1.2
  //     e = f.createElement('script')
  //     e.type = 'text/javascript'
  //     e.async = !0
  //     e.src =
  //       'undefined' !== typeof MIXPANEL_CUSTOM_LIB_URL
  //         ? MIXPANEL_CUSTOM_LIB_URL
  //         : 'file:' === f.location.protocol && '/js/mixpanel-2-latest.min.js'.match(/^\/\//)
  //         ? '/js/mixpanel-2-latest.min.js'
  //         : '/js/mixpanel-2-latest.min.js'
  //     g = f.getElementsByTagName('script')[0]
  //     g.parentNode.insertBefore(e, g)

  //     window.mixpanel.init('f6e241cf415604a7d57f62193e294a09', { debug: true, track_pageview: true, persistence: 'localStorage' })
  //   }
  // })(document, window.mixpanel || [])

  // {
  //   if (location.hostname.indexOf('photext') !== -1) {
  //     const script = document.createElement('script')
  //     script.src =
  //       'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9619728677464331'
  //     script.async = true
  //     script.crossOrigin = 'anonymous'
  //     document.body.appendChild(script)
  //   }
  // }
}

fn()
