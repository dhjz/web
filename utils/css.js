window.cssJs = /* css */`
/*** 通用reset样式极简 */
input, select { background-color: #fff; border-radius: 4px; border: 1px solid #dcdfe6;  color: #333; line-height: 32px; padding: 0 10px; outline: none; margin-right: 20px; }
button{ background: #409eff; border: none; color: #fff; line-height: 32px; padding: 0px 10px; border-radius: 4px; cursor: pointer; }

/*** css超出省略号 */
.line-1 { text-overflow: ellipsis; overflow: hidden; white-space: nowrap; word-break: break-all; }
.line-2 { overflow: hidden; word-break: break-all; text-overflow: ellipsis; -webkit-box-orient: vertical;  -webkit-line-clamp: 2; line-clamp: 2; display: -webkit-box; }

/*** css滚动条 */
::-webkit-scrollbar {	width: 8px; height: 8px; }
::-webkit-scrollbar-thumb {	background-color: #ddd; border-radius: 6px; }

/*** ElementUI 颜色 */
:root {
  --c-primary: #409EFF;
  --c-success: #67C23A;
  --c-warning: #E6A23C;
  --c-danger: #F56C6C;
  --c-info: #909399;
}

/*** 通用reset样式 */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-size: 14px; padding: 10px; --input-height: 32px; --input-radius: 4px}
a {text-decoration: none;} li, ol { list-style: none; }
i { font-style: normal; }
.hide,.hidden{display: none;}
.ftl{float: left;}
.ftr{float: right;}
.clearfix:after{content:"";display:block;clear:both;}
.clearfix{zoom:1;}
.text-center { text-align: center; }
.text-right { text-align: right; }
.line-1 { text-overflow: ellipsis; overflow: hidden; white-space: nowrap; word-break: break-all; }
.line-2 { overflow: hidden; word-break: break-all; text-overflow: ellipsis; -webkit-box-orient: vertical;  -webkit-line-clamp: 2; line-clamp: 2; display: -webkit-box; }
button, input, select, textarea { outline: none; font-size: inherit; transition: border-color .2s cubic-bezier(.645,.045,.355,1); }
input:focus, select:focus, textarea:focus { outline: none; border-color: #409eff; }
input:not([type="radio"]), select { -webkit-appearance: none; background-color: #fff; border-radius: var(--input-radius); border: 1px solid #dcdfe6;  color: #333;  display: inline-block; 
  height: var(--input-height); line-height: var(--input-height); padding: 0 10px;  width: 100%; position: relative; }
textarea { display: block; resize: vertical; padding: 4px 10px; line-height: 1.5; color: #333; border: 1px solid #dcdfe6; border-radius: var(--input-radius); width: 100%;}
input[type="file"]::file-selector-button{  background-color: #409eff; color: #FFFFFF; border-radius: var(--input-radius); border: 0px; height: 24px; padding: 0 10px; }
input[type="radio"] { margin-right: 4px; }
input[type="radio"]+input[type="radio"] { margin-left: 8px; }
select, input[type="file"] { cursor: pointer; }
select{ background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAH1JREFUOE9jZCATMJKpj2Goapw5c+aqf//+XcvMzGxA9vvMmTPTGBgYXNLT08Ng4hh+nDlz5sZ///6dh2mePn16AxMTk2F6ero/smFYA2fmzJkX/v37twGkkImJKSA9Pd0APfRxhuqsWbPegxSnpaUJYouyoRodpCQ/sv0IAIhkJA+qwThhAAAAAElFTkSuQmCC) no-repeat; 
  background-position: calc(100% - 3px) center; background-size: 15px 15px;}
button, .btn { display: inline-block; white-space: nowrap;  cursor: pointer;  background: #fff;  border: 1px solid #dcdfe6;  color: #333;  -webkit-appearance: none;
  text-align: center;  user-select: none; height: var(--input-height); line-height: var(--input-height); padding: 0px 10px; border-radius: var(--input-radius); }
button[primary], .btn[primary] { background: #409eff; color: #fff; border-color: #409eff; }
button[danger], button[error], .btn[danger], .btn[error] { background: #f56c6c; color: #fff; border-color: #f56c6c; }
button[success], .btn[success] { background: #67c23a; color: #fff; border-color: #67c23a; }
button[warning], .btn[warning] { background: #e6a23c; color: #fff; border-color: #e6a23c; }
button.disabled, .btn.disabled, button[disabled], .btn[disabled] { background: #c8c9cc; border-color: #c8c9cc; color: #fff; cursor: not-allowed; }
button[primary].disabled, .btn[primary].disabled, button[primary][disabled], .btn[primary][disabled] { background-color: #a0cfff;  border-color: #a0cfff; }
button:hover, .btn:hover { opacity: .9; }
button+button, .btn+.btn, .btn+button, button+.btn, input+button, select+button,select+select, .input-line+button { margin-left: 10px; }
.primary { color: #409eff; }
.danger, .error { color: #f56c6c; }
.warning { color: #e6a23c; }
.success { color: #67c23a; }
.dialog { position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; z-index: 9999; background: rgba(0, 0, 0, 0.5); text-align: center; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.dialog-cont { width: 90%; height: 84vh; overflow: auto;  background: #fff; border-radius: 12px; padding: 10px; }
.dialog-close { position: absolute;  top: 0; right: 0; font-size: 24px; color: #eee; padding: 6px 8px; line-height: 1; cursor: pointer; }
.dialog-close:after { content: '\\00D7'; }
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-1 { flex: 1; width: 0; }
.flex-col { display: flex;flex-direction: column; }
.ai-c { align-items: center; }
.jc-sb{ justify-content: space-between; }
.jc-c { justify-content: center; }
.jc-sa { justify-content: space-around; }
.wh-full { width: 100%; height: 100%; }
.w-full { width: 100%; }
.h-full { height: 100%; }
table { border-collapse: collapse; width: 100%; }
table tr th { background: #f5f7fa; color: #909399; font-weight: bold; border: 1px solid #ebeef5; padding: 8px 4px; }
table tr td { border: 1px solid #ebeef5; padding: 8px 4px; text-align: center; }
table tr:hover { background-color: #f5f7fa; }
.p10{padding:10px;}.p15{padding:15px;}.p20{padding:20px;}
.m10{margin:10px;}.m15{margin:15px;}.m20{margin:20px;}
.mb10{margin-bottom:10px;}.mb15{margin-bottom:15px;}.mb20{margin-bottom:20px;}
.mr10{margin-right:10px;}.mr15{margin-right:15px;}.mr20{margin-right:20px;}
.mx10{margin:0 10px;}.mx15{margin:0 15px;}.mx20{margin:0 20px;}
.my10{margin:10px 0;}.my15{margin:15px 0;}.my20{margin:20px 0;}
@media screen and (min-width: 1200px) {
  ::-webkit-scrollbar {	width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb {	background-color: #ddd; border-radius: 6px; }
}
`


