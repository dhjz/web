define("ace/theme/vscode-dark-css",["require","exports","module"],function(e,t,n){
  // 颜色常量定义
  const COLORS = {
    // 基础颜色
    BACKGROUND: '#1E1E1E',
    FOREGROUND: '#D4D4D4',
    CURSOR: '#FFFFFF',
    INVISIBLE: '#808080',
    
    // UI元素颜色
    GUTTER_BG: '#1E1E1E',
    GUTTER_FG: '#858585',
    PRINT_MARGIN: '#333333',
    ACTIVE_LINE_BG: '#2A2D2E',
    GUTTER_ACTIVE_LINE: '#2A2D2E',
    SELECTION_BG: '#264F78',
    SELECTED_WORD_BG: '#264F78',
    SELECTED_WORD_BORDER: '#264F78',
    BRACKET_BORDER: '#404040',
    FOLD_BG: '#569CD6',
    FOLD_BORDER: '#D4D4D4',
    
    // 语法高亮颜色
    KEYWORD: '#569CD6',
    STRING: '#CE9178',
    COMMENT: '#6A9955',
    VARIABLE: '#9CDCFE',
    FUNCTION: '#DCDCAA',
    NUMBER: '#B5CEA8',
    TYPE: '#9cdcfe',
    OPERATOR: '#D4D4D4',
    HEADING: '#569CD6',
    LIST: '#CE9178',
    XML_PE: '#569CD6', // '#CE9178',
    ATTRIBUTE_NAME: '#9CDCFE',
    
    // 特殊元素颜色
    INVALID_BG: '#722F37',
    INVALID_FG: '#F48771',
    STEP_BG: '#632626',
    STACK_BG: '#226633'
  };

  // 缩进线图片常量
  const INDENT_GUIDE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHB3d/8PAAOIAdULw8qMAAAAAElFTkSuQmCC";
  const INDENT_GUIDE_ACTIVE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHB3d/8PAAOIAdULw8qMAAAAAElFTkSuQmCC";
  const extClass = `\n\n.ace-vscode-dark .ace_identifier, .ace-vscode-dark .ace_operator  {\n  color: ${COLORS.ATTRIBUTE_NAME};\n}`

  n.exports='.ace-vscode-dark .ace_gutter {\n  background: '+COLORS.GUTTER_BG+';\n  color: '+COLORS.GUTTER_FG+';\n  overflow: hidden;\n}\n\n.ace-vscode-dark .ace_print-margin {\n  width: 1px;\n  background: '+COLORS.PRINT_MARGIN+';\n}\n\n.ace-vscode-dark {\n  background-color: '+COLORS.BACKGROUND+';\n  color: '+COLORS.FOREGROUND+';\n}\n\n.ace-vscode-dark .ace_cursor {\n  color: '+COLORS.CURSOR+';\n}' + extClass + '\n\n.ace-vscode-dark .ace_invisible {\n  color: '+COLORS.INVISIBLE+';\n}\n\n.ace-vscode-dark .ace_constant.ace_buildin {\n  color: '+COLORS.KEYWORD+';\n}\n\n.ace-vscode-dark .ace_constant.ace_language {\n  color: '+COLORS.KEYWORD+';\n}\n\n.ace-vscode-dark .ace_constant.ace_library {\n  color: '+COLORS.TYPE+';\n}\n\n.ace-vscode-dark .ace_invalid {\n  background-color: '+COLORS.INVALID_BG+';\n  color: '+COLORS.INVALID_FG+';\n}\n\n.ace-vscode-dark .ace_fold {\n  background-color: '+COLORS.FOLD_BG+';\n  border-color: '+COLORS.FOLD_BORDER+';\n}\n\n.ace-vscode-dark .ace_support.ace_function {\n  color: '+COLORS.FUNCTION+';\n}\n\n.ace-vscode-dark .ace_support.ace_constant {\n  color: '+COLORS.TYPE+';\n}\n\n.ace-vscode-dark .ace_support.ace_type,\n.ace-vscode-dark .ace_support.ace_class,\n.ace-vscode-dark .ace_support.ace_other {\n  color: '+COLORS.TYPE+';\n}\n\n.ace-vscode-dark .ace_variable.ace_parameter {\n  font-style: italic;\n  color: '+COLORS.VARIABLE+';\n}\n\n.ace-vscode-dark .ace_keyword.ace_operator {\n  color: '+COLORS.OPERATOR+';\n}\n\n.ace-vscode-dark .ace_comment {\n  color: '+COLORS.COMMENT+';\n}\n\n.ace-vscode-dark .ace_comment.ace_doc {\n  color: '+COLORS.COMMENT+';\n}\n\n.ace-vscode-dark .ace_comment.ace_doc.ace_tag {\n  color: '+COLORS.COMMENT+';\n}\n\n.ace-vscode-dark .ace_constant.ace_numeric {\n  color: '+COLORS.NUMBER+';\n}\n\n.ace-vscode-dark .ace_variable {\n  color: '+COLORS.VARIABLE+';\n}\n\n.ace-vscode-dark .ace_xml-pe {\n  color: '+COLORS.XML_PE+';\n}\n\n.ace-vscode-dark .ace_entity.ace_name.ace_function {\n  color: '+COLORS.FUNCTION+';\n}\n\n.ace-vscode-dark .ace_heading {\n  color: '+COLORS.HEADING+';\n}\n\n.ace-vscode-dark .ace_list {\n  color: '+COLORS.LIST+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_selection {\n  background: '+COLORS.SELECTION_BG+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_step {\n  background: '+COLORS.STEP_BG+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_stack {\n  background: '+COLORS.STACK_BG+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_bracket {\n  margin: -1px 0 0 -1px;\n  border: 1px solid '+COLORS.BRACKET_BORDER+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_active-line {\n  background: '+COLORS.ACTIVE_LINE_BG+';\n}\n\n.ace-vscode-dark .ace_gutter-active-line {\n  background-color: '+COLORS.GUTTER_ACTIVE_LINE+';\n}\n\n.ace-vscode-dark .ace_marker-layer .ace_selected-word {\n  background: '+COLORS.SELECTED_WORD_BG+';\n  border: 1px solid '+COLORS.SELECTED_WORD_BORDER+';\n}\n\n.ace-vscode-dark .ace_storage,\n.ace-vscode-dark .ace_keyword,\n.ace-vscode-dark .ace_meta.ace_tag {\n  color: '+COLORS.KEYWORD+';\n}\n\n.ace-vscode-dark .ace_string.ace_regex {\n  color: '+COLORS.STRING+';\n}\n\n.ace-vscode-dark .ace_string {\n  color: '+COLORS.STRING+';\n}\n\n.ace-vscode-dark .ace_entity.ace_other.ace_attribute-name {\n  color: '+COLORS.ATTRIBUTE_NAME+';\n}\n\n.ace-vscode-dark .ace_indent-guide {\n  background: url("'+INDENT_GUIDE+'") right repeat-y;\n}\n\n.ace-vscode-dark .ace_indent-guide-active {\n filter: brightness(2.5); background: url("'+INDENT_GUIDE_ACTIVE+'") right repeat-y;\n}\n';
}),
define("ace/theme/vscode-dark",["require","exports","module","ace/theme/vscode-dark-css","ace/lib/dom"],function(e,t,n){
  t.isDark=!0;
  t.cssClass="ace-vscode-dark";
  t.cssText=e("./vscode-dark-css");
  var r=e("../lib/dom");
  r.importCssString(t.cssText,t.cssClass,!1);
});

(function() {
  window.require(["ace/theme/vscode-dark"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
