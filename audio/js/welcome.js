(function(w, d, PKAE) {
    'use strict';

    setTimeout(function() {

        PKAudioEditor._deps.Wlc = function() {
            var body_str = '';
            var body_str2 = '如果在使用中遇到了任何问题，或者有功能上的意见或建议，均可在 <a href="https://jxxxkjhzyxgs.qiyukf.com/client?k=da145c49c514d71e9f8b7230cd95cf52&wp=1&robotShuntSwitch=1&robotId=3437939" target="_blank">这里</a> 进行反馈<br/><br/>';

            if (PKAE.isMobile) {
                change -= 15;
                body_str = '请注意:<br/>部分手机浏览器（如 UC、夸克）因为内核限制，无法导出编辑后的音频！建议在使用前先测试能否正常导出或在电脑上使用本工具！<br/><br/>';
            } else {
                body_str = '小贴士:<br/>本工具大部分快捷键使用 <strong>Shift</strong> 进行组合。(例如：Shift+Z 撤销, Shift+C 复制, Shift+X 剪切...)<br/><br/>';
            }

            // Welcome to AudioMass,
            var md = new PKSimpleModal({
                title: '<font style="font-size:15px">欢迎使用在线音频编辑器 - 江下科技</font>',
                ondestroy: function(q) {
                    PKAE.ui.InteractionHandler.on = false;
                    PKAE.ui.KeyHandler.removeCallback('modalTemp');
                },
                body: '<div style="overflow:auto;-webkit-overflow-scrolling:touch;max-width:580px;width:calc(100vw - 40px);max-height:calc(100vh - 340px);min-height:110px;font-size:13px; color:#95c6c6;padding-top:7px;">' +
                    '这是一款免费且功能强大的在线音频/波形编辑器，直接在浏览器里打开即可使用，无需下载软件，无需安装插件！' +
                    '<br/><br/><br/>' +
                    body_str +
                    '您可以打开并编辑浏览器支持的任何类型的音频文件，并进行淡入、剪切、修剪、改变音量等常用操作，' +
                    '还有大量的音频效果可供调节！<br/><br/>' +
                    body_str2 +
                    '</div>',
                setup: function(q) {
                    PKAE.ui.InteractionHandler.checkAndSet('modal');
                    PKAE.ui.KeyHandler.addCallback('modalTemp', function(e) {
                        q.Destroy();
                    }, [27]);

                    // ------
                    var scroll = q.el_body.getElementsByTagName('div')[0];
                    scroll.addEventListener('touchstart', function(e) {
                        e.stopPropagation();
                    }, false);
                    scroll.addEventListener('touchmove', function(e) {
                        e.stopPropagation();
                    }, false);

                    // ------
                }
            });
            md.Show();
            document.getElementsByClassName('pk_modal_cancel')[0].innerHTML = '&nbsp; &nbsp; &nbsp; 我知道了 &nbsp; &nbsp; &nbsp;';
        };

        var change = 96;
        var exists = w.localStorage && w.localStorage.getItem('k');

        if (!exists) {
            change = 0;
            w.localStorage && w.localStorage.setItem('k', 1);
        }

        if (((Math.random() * 100) >> 0) < change) return;
        PKAudioEditor._deps.Wlc();

    }, 320);

})(window, document, PKAudioEditor);