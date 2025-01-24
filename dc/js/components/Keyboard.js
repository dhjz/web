window.KeyboardComp = {
  template: `
  <div class="keyboard-panel">
    <div class="f2">
      <i>ESC</i><i k="CTRL,A">全选</i><i k="CTRL,C">复制</i><i k="CTRL,V">粘贴</i><i k="CTRL,X">剪切</i><i k="CTRL,Z">撤销</i>
      <i k="CTRL,S">保存</i><i k="ALT,ENTER">全屏</i>
    </div>
    <div class="f2 hide-kb">
      <i k="CTRL,SHIFT">输入法</i><i k="ALT,F4">关闭</i><i k="WIN,D">桌面</i><i k="MEDIA_PREV_TRACK">上曲</i><i
        k="MEDIA_NEXT_TRACK">下曲</i>
      <i k="MEDIA_PLAY_PAUSE">播放</i><i k="VOLUME_DOWN">音量-</i><i k="VOLUME_UP">音量+</i><i k="VOLUME_MUTE">静音</i>
    </div>
    <div class="f1">
      <i>F1</i><i>F2</i><i>F3</i><i>F4</i><i>F5</i><i>F6</i><i>F7</i><i>F8</i><i>F9</i><i>F10</i><i>F11</i><i>F12</i>
    </div>
    <div>
      <i k="OEM_3">\`</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i><i>BACK</i>
    </div>
    <div>
      <i>TAB</i><i>Q</i><i>w</i><i>E</i><i>R</i><i>T</i><i>Y</i><i>U</i><i>I </i><i>O</i><i>P</i></div>
    <div>
      <i k="CAPITAL">Caps</i><i>A</i><i>S</i><i>D</i><i>F</i><i>G</i><i>H</i><i>J</i><i>K</i><i>L</i><i k="ENTER">回车</i>
    </div>
    <div>
      <i k="SHIFT">Shft</i><i>Z</i><i>X</i><i>C</i><i>V</i><i>B</i><i>N</i><i>M</i><i k="HOME">HM</i><i k="UP">↑</i><i k="END">ED</i>
      </div>
    <div>
      <i k="OEM_COMMA">,</i><i k="OEM_PERIOD">.</i><i k="OEM_2">/ </i><i k="OEM_4"> { </i><i k="OEM_6"> } </i><i k="SEMICOLON"> ; </i>
      <i k="OEM_7"> ' </i><i k="OEM_MINU"> - </i><i k="OEM_PLUS"> + </i><i k="LEFT">←</i><i k="DOWN">↓</i><i k="RIGHT">→</i>
    </div>
    <div><span class="hide-kb" onclick="toggle('#keyboard')">隐藏</span><i style="flex: 1; line-height: 46px; margin-left: 10px;">SPACE</i></div>
  </div>
  `,
  data() {
    return {
      
    }
  },
}