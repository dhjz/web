/* 35 套公众号主题，迁移自 zhaotab.com/typeset 的样式数据（含装饰） */
(function () {
  const ue='-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',re='Georgia,"Songti SC","STSong","SimSun",serif',K='Menlo,Monaco,Consolas,"Courier New",monospace',H=(e,t)=>`<section style="margin:2em 0;text-align:center;color:${t};font-size:14px;letter-spacing:8px;line-height:1;">${e}</section>`,Ln=(e,t,n=28)=>{const i=`<span style="display:inline-block;width:${n}px;height:0;border-top:1px solid ${t};vertical-align:middle;"></span>`;return`${i}<span style="display:inline-block;margin:0 12px;vertical-align:middle;">${e}</span>${i}`},ge=e=>String(e).padStart(2,"0"),zn="壹贰叁肆伍陆柒捌玖拾",Je=e=>e<=10?zn[e-1]:String(e),Ne=(e,t=6)=>`<span style="display:inline-block;width:${t}px;height:${t}px;border-radius:50%;background:${e};vertical-align:middle;"></span>`,$e=(e,t,n="#fff")=>`<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${t};color:${n};font-size:11px;font-weight:bold;line-height:18px;text-align:center;letter-spacing:0;vertical-align:1px;">${e}</span>`,Be=(e,t="")=>`<span style="display:block;line-height:0;${t}"><span style="display:inline-block;${e}"></span></span>`;

  function et(e,t){const n=`<span style="display:inline-block;line-height:0;vertical-align:middle;${t==="left"?"text-align:right;":"text-align:left;"}"><span style="display:inline-block;width:36px;height:0;border-top:1px solid ${e};"></span><br><span style="display:inline-block;width:22px;height:0;margin-top:4px;border-top:1px solid ${e};"></span></span>`,i=`<span style="display:inline-block;width:9px;height:9px;margin:0 -1px;border:1px solid ${e};border-${t==="left"?"top":"bottom"}-color:transparent;border-radius:50%;vertical-align:middle;"></span>`;return t==="left"?n+i:i+n}

  $n={keyword:"color:#cf222e;",built_in:"color:#953800;",type:"color:#953800;",class:"color:#953800;",literal:"color:#0550ae;",number:"color:#0550ae;",string:"color:#0a3069;",regexp:"color:#0a3069;",comment:"color:#6e7781;font-style:italic;",quote:"color:#6e7781;font-style:italic;",doctag:"color:#cf222e;",title:"color:#8250df;",section:"color:#0550ae;font-weight:bold;",name:"color:#116329;",tag:"color:#116329;",attr:"color:#0550ae;",attribute:"color:#0a3069;",property:"color:#0550ae;",variable:"color:#953800;","template-variable":"color:#953800;",params:"color:#24292f;",meta:"color:#0550ae;",symbol:"color:#0550ae;",bullet:"color:#953800;",link:"color:#0a3069;text-decoration:underline;",subst:"color:#24292f;","selector-tag":"color:#116329;","selector-class":"color:#6639ba;","selector-id":"color:#0550ae;","selector-attr":"color:#0550ae;","selector-pseudo":"color:#0550ae;",addition:"color:#116329;background:#dafbe1;",deletion:"color:#82071e;background:#ffebe9;",emphasis:"font-style:italic;",strong:"font-weight:bold;"};
  Dn={keyword:"color:#c678dd;",built_in:"color:#e6c07b;",type:"color:#e6c07b;",class:"color:#e6c07b;",literal:"color:#56b6c2;",number:"color:#d19a66;",string:"color:#98c379;",regexp:"color:#98c379;",comment:"color:#7f848e;font-style:italic;",quote:"color:#7f848e;font-style:italic;",doctag:"color:#c678dd;",title:"color:#61afef;",section:"color:#e06c75;",name:"color:#e06c75;",tag:"color:#e06c75;",attr:"color:#d19a66;",attribute:"color:#98c379;",property:"color:#e06c75;",variable:"color:#e06c75;","template-variable":"color:#e06c75;",params:"color:#abb2bf;",meta:"color:#61afef;",symbol:"color:#61afef;",bullet:"color:#61afef;",link:"color:#61afef;text-decoration:underline;",subst:"color:#e06c75;","selector-tag":"color:#e06c75;","selector-class":"color:#d19a66;","selector-id":"color:#61afef;","selector-attr":"color:#d19a66;","selector-pseudo":"color:#d19a66;",addition:"color:#98c379;",deletion:"color:#e06c75;",emphasis:"font-style:italic;",strong:"font-weight:bold;"};

  const typesetThemes = [
{
      "id": "simple",
      "name": "简约",
      "accent": "#2b2b2b",
      "tags": ["news", "business", "tech"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;padding-bottom:8px;border-bottom:1px solid #e3e3e3;font-size:18px;font-weight:bold;line-height:1.5;color:#222;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#444;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#2b2b2b;",
        "strong": "font-weight:bold;color:#000;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#2b2b2b;text-decoration:none;border-bottom:1px solid #2b2b2b;",
        "blockquote": "margin:1.4em 0;padding:10px 16px;border-left:3px solid #d0d0d0;color:#777;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(43,43,43,0.08);color:#2b2b2b;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(43,43,43,0.2);background:rgba(43,43,43,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(43,43,43,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#2b2b2b;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(43,43,43,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {

      },
      "hljs": Dn
    },
{
      "id": "orange",
      "name": "橙心",
      "accent": "#ef7060",
      "tags": ["life", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:17px;font-weight:bold;line-height:1.5;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#ef7060;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#ef7060;",
        "strong": "font-weight:bold;color:#ef7060;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#ef7060;text-decoration:none;border-bottom:1px solid #ef7060;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-radius:10px;background:#fff4f1;color:#7a5a55;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(239,112,96,0.08);color:#ef7060;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(239,112,96,0.2);background:rgba(239,112,96,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(239,112,96,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#ef7060;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(239,112,96,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:5px 18px;border-radius:6px;background:#ef7060;color:#fff;box-shadow:3px 3px 0 #ffd2ca;">${e}</span>`,
        "h3": e=>`<span style="display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:#ef7060;vertical-align:middle;"></span>${e}`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#ef8171;font-size:14px;letter-spacing:8px;line-height:1;\">● ● ●</section>"
      },
      "hljs": Dn
    },
{
      "id": "mint",
      "name": "薄荷",
      "accent": "#12a182",
      "tags": ["tutorial", "tech"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;padding-bottom:8px;border-bottom:1px dashed rgba(18,161,130,0.4);font-size:18px;font-weight:bold;line-height:1.5;color:#0e7c64;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#0e7c64;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#12a182;",
        "strong": "font-weight:bold;color:#0e7c64;background:rgba(18,161,130,0.1);padding:0 2px;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#12a182;text-decoration:none;border-bottom:1px solid #12a182;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border:1px solid rgba(18,161,130,0.25);border-radius:10px;background:#f0faf7;color:#4d6b63;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(18,161,130,0.08);color:#12a182;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(18,161,130,0.2);background:rgba(18,161,130,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(18,161,130,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#12a182;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(18,161,130,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:inline-block;margin-right:10px;padding:1px 8px;border-radius:6px;background:#12a182;color:#fff;font-size:15px;vertical-align:middle;">${ge(t)}</span><span style="vertical-align:middle;">${e}</span>`,
        "h3": e=>`<span style="color:#12a182;">▸ </span>${e}`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#12a182;font-size:14px;letter-spacing:8px;line-height:1;\">· · ·</section>"
      },
      "hljs": Dn
    },
{
      "id": "green",
      "name": "墨绿",
      "accent": "#1f7a5c",
      "tags": ["business", "news"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;padding:2px 0 2px 12px;border-left:5px solid #1f7a5c;font-size:18px;font-weight:bold;line-height:1.5;color:#1f7a5c;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#2a2a2a;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#1f7a5c;",
        "strong": "font-weight:bold;color:#1f7a5c;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#1f7a5c;text-decoration:none;border-bottom:1px solid #1f7a5c;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border-left:4px solid #1f7a5c;border-radius:4px;background:rgba(31,122,92,0.06);color:#666;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(31,122,92,0.08);color:#1f7a5c;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(31,122,92,0.2);background:rgba(31,122,92,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(31,122,92,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#1f7a5c;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(31,122,92,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h3": e=>`<span style="padding-bottom:2px;border-bottom:2px solid rgba(31,122,92,0.35);">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#1f7a5c;font-size:14px;letter-spacing:8px;line-height:1;\">· · ·</section>"
      },
      "hljs": Dn
    },
{
      "id": "forest",
      "name": "森林",
      "accent": "#2f855a",
      "tags": ["emotion"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3d4a42;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;border-radius:12px;background:#f5faf6;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:18px;font-weight:bold;line-height:1.5;color:#2f855a;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#276749;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#2f855a;",
        "strong": "font-weight:bold;color:#2f855a;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#2f855a;text-decoration:none;border-bottom:1px solid #2f855a;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border:1px solid #c6e6d2;border-radius:10px;background:#fff;color:#4a5d52;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(47,133,90,0.08);color:#2f855a;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(47,133,90,0.2);background:rgba(47,133,90,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #c6e6d2;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#2f855a;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(47,133,90,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:0 4px 6px;border-bottom:2px solid #9ae6b4;">🌿 ${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#34b164;font-size:14px;letter-spacing:8px;line-height:1;\">~ 🌱 ~</section>"
      },
      "hljs": Dn
    },
{
      "id": "blue",
      "name": "科技蓝",
      "accent": "#2f6fde",
      "tags": ["tech", "tutorial"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#2f6fde;text-align:center;",
        "h2": "margin:2em 0 1.1em;border-bottom:2px solid #2f6fde;font-size:17px;font-weight:bold;line-height:1.5;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#2f6fde;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#2f6fde;",
        "strong": "font-weight:bold;color:#2f6fde;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#2f6fde;text-decoration:none;border-bottom:1px solid #2f6fde;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-radius:8px;background:#f0f5ff;color:#4a5b78;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(47,111,222,0.08);color:#2f6fde;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(47,111,222,0.2);background:rgba(47,111,222,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(47,111,222,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#2f6fde;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(47,111,222,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:5px 14px;border-radius:6px 6px 0 0;background:#2f6fde;color:#fff;">${e}</span>`,
        "h3": e=>`<span style="color:#2f6fde;">▍</span>${e}`
      },
      "hljs": Dn
    },
{
      "id": "ocean",
      "name": "海洋",
      "accent": "#0b6bcb",
      "tags": ["tech", "business"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:17px;font-weight:bold;line-height:1.5;",
        "h3": "margin:1.6em 0 0.8em;padding-left:10px;border-left:4px solid #38bdf8;font-size:16px;font-weight:bold;line-height:1.5;color:#0b6bcb;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#0b6bcb;",
        "strong": "font-weight:bold;color:#0b6bcb;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#0b6bcb;text-decoration:none;border-bottom:1px solid #0b6bcb;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-left:4px solid #38bdf8;border-radius:0 8px 8px 0;background:#eef7ff;color:#475f78;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(11,107,203,0.08);color:#0b6bcb;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #0b6bcb;background:#0b6bcb;color:#fff;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #cfe3f7;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#0b6bcb;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(11,107,203,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:block;padding:8px 16px;border-radius:8px;background:linear-gradient(135deg,#0b6bcb,#38bdf8);color:#fff;box-shadow:0 4px 12px rgba(11,107,203,0.25);">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#3ea8f0;font-size:14px;letter-spacing:8px;line-height:1;\">≈ ≈ ≈</section>"
      },
      "hljs": Dn
    },
{
      "id": "violet",
      "name": "紫罗兰",
      "accent": "#7c4dff",
      "tags": ["event", "emotion"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#5b2fd6;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:17px;font-weight:bold;line-height:1.5;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;padding-left:10px;border-left:4px solid #b388ff;font-size:16px;font-weight:bold;line-height:1.5;color:#5b2fd6;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#7c4dff;",
        "strong": "font-weight:bold;color:#7c4dff;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#7c4dff;text-decoration:none;border-bottom:1px solid #7c4dff;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-radius:10px;background:#f5f0ff;color:#5e5577;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(124,77,255,0.08);color:#7c4dff;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(124,77,255,0.2);background:rgba(124,77,255,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(124,77,255,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#7c4dff;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(124,77,255,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:6px 22px;border-radius:999px;background:linear-gradient(90deg,#7c4dff,#b388ff);color:#fff;box-shadow:0 4px 12px rgba(124,77,255,0.3);">${e}</span>`,
        "quoteMark": "<span style=\"display:block;height:22px;font-family:Georgia,serif;font-size:36px;line-height:1;color:#b388ff;\">“</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#b388ff;font-size:14px;letter-spacing:8px;line-height:1;\">✦ ✦ ✦</section>"
      },
      "hljs": Dn
    },
{
      "id": "rose",
      "name": "玫瑰",
      "accent": "#d9466f",
      "tags": ["emotion", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#d9466f;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:18px;font-weight:bold;line-height:1.5;color:#d9466f;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#333;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#d9466f;",
        "strong": "font-weight:bold;color:#d9466f;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#d9466f;text-decoration:none;border-bottom:1px solid #d9466f;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-radius:8px;background:rgba(217,70,111,0.06);color:#666;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(217,70,111,0.08);color:#d9466f;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(217,70,111,0.2);background:rgba(217,70,111,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(217,70,111,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#d9466f;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(217,70,111,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:0 6px 4px;border-bottom:2px solid #d9466f;">${e}</span>`,
        "h3": e=>`<span style="padding:0 4px;background:linear-gradient(transparent 60%,rgba(217,70,111,0.2) 60%);">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#eb8ba6;font-size:14px;letter-spacing:8px;line-height:1;\">❀ ❀ ❀</section>"
      },
      "hljs": Dn
    },
{
      "id": "sakura",
      "name": "樱花",
      "accent": "#e5739a",
      "tags": ["emotion", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#5a4a50;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;border-radius:12px;background:#fff5f8;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:17px;font-weight:bold;line-height:1.5;color:#e5739a;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#d45d87;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#e5739a;",
        "strong": "font-weight:bold;color:#e5739a;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#e5739a;text-decoration:none;border-bottom:1px solid #e5739a;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border:1px dashed #f0a6bf;border-radius:12px;background:#fff;color:#7a6168;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(229,115,154,0.08);color:#e5739a;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(229,115,154,0.2);background:rgba(229,115,154,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #f6c9d8;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#e5739a;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(229,115,154,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:6px 20px;border:1px solid #f5bccd;border-radius:20px;background:#fff;box-shadow:0 3px 0 #f5bccd;">${e}</span>`,
        "h3": e=>`<span style="color:#e8769c;">✿ </span>${e}`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#e8769c;font-size:14px;letter-spacing:8px;line-height:1;\">✿ ✿ ✿</section>"
      },
      "hljs": Dn
    },
{
      "id": "lemon",
      "name": "柠檬",
      "accent": "#d4a106",
      "tags": ["tutorial"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:18px;font-weight:bold;line-height:1.5;color:#222;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#333;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#d4a106;",
        "strong": "font-weight:bold;color:#222;background:linear-gradient(transparent 55%,#ffe066 55%);padding:0 2px;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#d4a106;text-decoration:none;border-bottom:1px solid #d4a106;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-left:4px solid #ffd43b;border-radius:0 8px 8px 0;background:#fffbea;color:#6b5d2e;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:#fff3bf;color:#8a6d00;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(212,161,6,0.2);background:rgba(212,161,6,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(212,161,6,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#d4a106;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(212,161,6,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="padding:0 4px;background:linear-gradient(transparent 55%,#ffe066 55%);">${e}</span>`,
        "h3": e=>`<span style="color:#ca9904;">▌</span>${e}`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#ca9904;font-size:14px;letter-spacing:8px;line-height:1;\">🍋</section>"
      },
      "hljs": Dn
    },
{
      "id": "notebook",
      "name": "手账",
      "accent": "#e8590c",
      "tags": ["tutorial", "life"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.85;color:#4a4036;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;border-radius:6px;background:#fffdf6;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;font-size:17px;font-weight:bold;line-height:1.5;color:#5c3d00;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#5c3d00;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#e8590c;",
        "strong": "font-weight:bold;color:#e8590c;border-bottom:2px dotted #e8590c;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#e8590c;text-decoration:none;border-bottom:1px solid #e8590c;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border:1.5px dashed #f2c94c;border-radius:12px;background:#fffbe6;color:#6b5a3a;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(232,89,12,0.08);color:#e8590c;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(232,89,12,0.2);background:rgba(232,89,12,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(232,89,12,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#e8590c;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(232,89,12,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:4px 16px;border-left:3px dotted #fff;border-right:3px dotted #fff;background:rgba(255,212,59,0.6);">${e}</span>`,
        "h3": e=>`<span style="padding-bottom:2px;border-bottom:2px dashed #f2c94c;">✎ ${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#be9a52;font-size:14px;letter-spacing:8px;line-height:1;\">✂ - - - - - - - -</section>"
      },
      "hljs": Dn
    },
{
      "id": "coffee",
      "name": "咖啡",
      "accent": "#6f4e37",
      "tags": ["life", "culture"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#4b3f36;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.1em;padding-bottom:8px;border-bottom:1px dashed #c9b29b;font-size:18px;font-weight:bold;line-height:1.5;color:#6f4e37;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#8b5e3c;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#6f4e37;",
        "strong": "font-weight:bold;color:#6f4e37;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#6f4e37;text-decoration:none;border-bottom:1px solid #6f4e37;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border-left:4px solid #a67c52;border-radius:0 6px 6px 0;background:#f7f1ea;color:#6b5848;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(111,78,55,0.08);color:#6f4e37;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(111,78,55,0.2);background:rgba(111,78,55,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(111,78,55,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#6f4e37;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(111,78,55,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:2px;background:#6f4e37;vertical-align:middle;"></span><span style="vertical-align:middle;">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#a67c52;font-size:14px;letter-spacing:8px;line-height:1;\">☕</section>"
      },
      "hljs": Dn
    },
{
      "id": "ink",
      "name": "书香",
      "accent": "#8b5a2b",
      "tags": ["culture", "emotion"],
      "styles": {
        "wrapper": "font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:16px;line-height:1.9;color:#3a3a3a;letter-spacing:1px;word-break:break-word;text-align:justify;padding:20px 16px;border-radius:6px;background:#fbf7ef;",
        "p": "margin:1em 0;text-indent:2em;",
        "h1": "margin:1.2em 0 1.2em;font-size:23px;font-weight:bold;line-height:1.5;color:#5a3a1c;text-align:center;letter-spacing:2px;",
        "h2": "margin:2em 0 1.2em;font-size:19px;font-weight:bold;line-height:1.5;color:#5a3a1c;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:17px;font-weight:bold;line-height:1.5;color:#5a3a1c;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#8b5a2b;",
        "strong": "font-weight:bold;color:#8b5a2b;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#8b5a2b;text-decoration:none;border-bottom:1px solid #8b5a2b;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border-left:3px solid #c9a27a;background:#f3ebdd;color:#6b5b4b;font-size:15px;",
        "blockquoteP": "margin:0.4em 0;text-indent:0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(139,90,43,0.08);color:#8b5a2b;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(139,90,43,0.2);background:rgba(139,90,43,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(139,90,43,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#8b5a2b;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(139,90,43,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:4px 18px;border-top:1px solid #8b5a2b;border-bottom:1px solid #8b5a2b;letter-spacing:2px;">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#b08a5f;font-size:14px;letter-spacing:8px;line-height:1;\">· ✦ ·</section>"
      },
      "hljs": Dn
    },
{
      "id": "gold",
      "name": "黑金",
      "accent": "#b8860b",
      "tags": ["business", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.85;color:#333;letter-spacing:0.8px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#111;text-align:center;letter-spacing:3px;",
        "h2": "margin:2em 0 1.1em;font-size:18px;font-weight:bold;line-height:1.5;color:#111;text-align:center;letter-spacing:2px;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#111;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#b8860b;",
        "strong": "font-weight:bold;color:#b8860b;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#b8860b;text-decoration:none;border-bottom:1px solid #b8860b;",
        "blockquote": "margin:1.4em 0;padding:14px 18px;border-left:2px solid #b8860b;background:#faf8f2;color:#5c5546;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(184,134,11,0.08);color:#b8860b;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #222;background:#222;color:#e8c46a;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #e5dcc3;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#b8860b;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(184,134,11,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>Ln(e,"#b8860b",32),
        "h3": e=>`<span style="color:#b8860b;">◆ </span>${e}`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#b8860b;font-size:14px;letter-spacing:8px;line-height:1;\">— ◆ —</section>"
      },
      "hljs": Dn
    },
{
      "id": "news",
      "name": "报纸",
      "accent": "#111111",
      "tags": ["news", "culture"],
      "styles": {
        "wrapper": "font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:16px;line-height:1.85;color:#222;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;padding:10px 0;border-top:3px double #111;border-bottom:3px double #111;font-size:24px;font-weight:bold;line-height:1.4;color:#111;text-align:center;",
        "h2": "margin:2em 0 1em;padding-bottom:4px;border-bottom:2px solid #111;font-size:19px;font-weight:bold;line-height:1.5;color:#111;",
        "h3": "margin:1.6em 0 0.8em;font-size:17px;font-weight:bold;font-style:italic;line-height:1.5;color:#111;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#111111;",
        "strong": "font-weight:bold;color:#000;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#111;text-decoration:underline;",
        "blockquote": "margin:1.6em 0;padding:12px 8px;border-top:1px solid #111;border-bottom:1px solid #111;color:#333;font-size:16px;font-style:italic;text-align:center;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(17,17,17,0.08);color:#111111;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:3px double #111;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border-bottom:2px solid #111;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border-bottom:1px solid #ccc;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#111111;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(17,17,17,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {

      },
      "hljs": Dn
    },
{
      "id": "grid",
      "name": "方格本",
      "accent": "#4a6fa5",
      "tags": ["tutorial", "life"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 16px;background-color:#fff;background-image:linear-gradient(rgba(74,111,165,0.09) 1px,transparent 1px),linear-gradient(90deg,rgba(74,111,165,0.09) 1px,transparent 1px);background-size:18px 18px;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.2em;font-size:17px;font-weight:bold;line-height:1.5;color:#2f4b75;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#2f4b75;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#4a6fa5;",
        "strong": "font-weight:bold;color:#2f4b75;background:rgba(74,111,165,0.12);padding:0 3px;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#4a6fa5;text-decoration:none;border-bottom:1px solid #4a6fa5;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border:1px solid rgba(74,111,165,0.35);border-radius:4px;background:#fff;box-shadow:3px 3px 0 rgba(74,111,165,0.15);color:#5a6a80;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(74,111,165,0.08);color:#4a6fa5;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(74,111,165,0.2);background:rgba(74,111,165,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(74,111,165,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#4a6fa5;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #8fa6c8;border-radius:4px;background:#fff;color:#8a97ab;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`${et("#4a6fa5","left")}<span style="display:inline-block;margin:0 10px;vertical-align:middle;">${e}</span>${et("#4a6fa5","right")}`,
        "h3": e=>`<span style="padding-bottom:2px;border-bottom:1px dashed #4a6fa5;">✎ ${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#8fa6c8;font-size:14px;letter-spacing:8px;line-height:1;\">· · ✎ · ·</section>"
      },
      "hljs": Dn
    },
{
      "id": "blush",
      "name": "粉笺",
      "accent": "#a33b32",
      "tags": ["emotion", "life"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:0.9em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1em;font-size:16px;font-weight:bold;line-height:1.5;color:#8b2f28;text-align:center;letter-spacing:2px;",
        "h3": "margin:1.4em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#8b2f28;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#a33b32;",
        "strong": "font-weight:bold;color:#222;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#a33b32;text-decoration:none;border-bottom:1px solid #a33b32;",
        "blockquote": "margin:1em 0;padding:12px 14px;border-radius:4px;background:#fff;color:#7a5a55;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(163,59,50,0.08);color:#a33b32;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(163,59,50,0.2);background:rgba(163,59,50,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(163,59,50,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#a33b32;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.2em 0;padding:22px 12px;border:1px dashed #e0a59d;border-radius:4px;background:#fff;color:#b08a85;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "card": {
          "style": "margin:0.6em 0 1.4em;padding:4px 16px;border-radius:4px;background:#fdf0ee;"
        },
        "h2": e=>`<span style="display:block;">${e}</span><span style="display:block;margin-top:2px;font-size:11px;line-height:1;color:#d98b80;letter-spacing:0;">❦<span style="display:inline-block;width:76px;height:0;margin:0 4px;border-top:1px solid #d98b80;vertical-align:middle;"></span>❦</span>`,
        "h3": e=>`<span style="color:#d98b80;">❀ </span>${e}`,
        "quoteMark": "<span style=\"display:block;height:20px;font-family:Georgia,serif;font-size:30px;line-height:1;color:#d78c82;\">“</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#d98b80;font-size:14px;letter-spacing:8px;line-height:1;\">❦</section>"
      },
      "hljs": Dn
    },
{
      "id": "festival",
      "name": "国潮",
      "accent": "#d9381e",
      "tags": ["event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;background:#fffaf1;color:#a8502a;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#c92a1a;text-align:center;letter-spacing:3px;",
        "h2": "margin:2.2em 0 1.2em;font-size:16px;font-weight:bold;line-height:1.5;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#c92a1a;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#d9381e;",
        "strong": "font-weight:bold;color:#d9381e;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#d9381e;text-decoration:none;border-bottom:1px solid #d9381e;",
        "blockquote": "margin:1.6em 0;padding:16px 18px;border:1px solid #e9b949;background:#fff3df;box-shadow:inset 0 0 0 3px #fff3df,inset 0 0 0 4px #f1cf85;color:#9a4a22;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(217,56,30,0.08);color:#d9381e;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #e9b949;background:#d9381e;color:#ffe9b3;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #f1cf85;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#d9381e;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #e9b949;background:#fff;color:#c08a5a;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:2px;border:1px solid #e9b949;"><span style="display:inline-block;padding:3px;background:#d9381e;"><span style="display:inline-block;padding:5px 18px;border:1px solid #f6d58e;color:#fff;letter-spacing:3px;"><span style="color:#f6d58e;font-size:10px;vertical-align:middle;">◆</span><span style="margin:0 12px;vertical-align:middle;">${e}</span><span style="color:#f6d58e;font-size:10px;vertical-align:middle;">◆</span></span></span></span>`,
        "h3": e=>`<span style="color:#c89318;">◈ </span>${e}`,
        "ulMark": "<span style=\"color:#d09121;\">❖</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#c89318;font-size:14px;letter-spacing:8px;line-height:1;\">〜 ❖ 〜</section>"
      },
      "hljs": Dn
    },
{
      "id": "terminal",
      "name": "终端",
      "accent": "#4ade80",
      "tags": ["tech"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 16px;border-radius:10px;background:#1e1f24;color:#d4d4d8;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:20px;font-weight:bold;line-height:1.5;color:#fafafa;text-align:left;letter-spacing:0;",
        "h2": "margin:2em 0 1em;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:16px;font-weight:bold;line-height:1.5;color:#4ade80;letter-spacing:0;",
        "h3": "margin:1.6em 0 0.8em;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:15px;font-weight:bold;line-height:1.5;color:#e4e4e7;letter-spacing:0;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#60a5fa;",
        "strong": "font-weight:bold;color:#facc15;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#71717a;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#60a5fa;text-decoration:none;border-bottom:1px solid #60a5fa;",
        "blockquote": "margin:1.4em 0;padding:10px 14px;border-left:2px solid #4ade80;background:#26272e;color:#a1a1aa;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:#2e3038;color:#f472b6;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border:1px solid #33353d;border-radius:8px;background:#15161a;overflow-x:auto;",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #3a3d46;background:#26272e;color:#e4e4e7;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #3a3d46;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#4ade80;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #4ade80;border-radius:6px;background:#26272e;color:#9ca3af;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="color:#60a5fa;">~</span><span style="color:#71717a;"> $ </span>${e}<span style="color:#4ade80;"> ▊</span>`,
        "h3": e=>`<span style="color:#71717a;">&gt; </span>${e}`,
        "quoteMark": "<span style=\"display:block;margin-bottom:2px;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:12px;color:#71717a;\">// note</span>",
        "ulMark": "<span style=\"color:#4ade80;\">❯</span>",
        "olMark": e=>`<span style="font-family:${K};font-size:13px;color:#4ade80;">[${e}]</span>`,
        "hr": "<section style=\"margin:2em 0;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:12px;line-height:1;color:#52525b;text-align:center;\">/* ─────── */</section>"
      },
      "hljs": Dn
    },
{
      "id": "docs",
      "name": "文档",
      "accent": "#0969da",
      "tags": ["tech", "tutorial"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;color:#1f2328;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1em;padding-bottom:8px;border-bottom:1px solid #d8dee4;font-size:22px;font-weight:bold;line-height:1.4;color:#1f2328;",
        "h2": "margin:1.8em 0 1em;padding-bottom:6px;border-bottom:1px solid #d8dee4;font-size:18px;font-weight:bold;line-height:1.5;color:#1f2328;",
        "h3": "margin:1.5em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#1f2328;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#0969da;",
        "strong": "font-weight:bold;color:#1f2328;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#0969da;text-decoration:none;border-bottom:1px solid #0969da;",
        "blockquote": "margin:1.4em 0;padding:4px 14px;border-left:4px solid #0969da;color:#57606a;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:5px;background:rgba(175,184,193,0.25);color:#1f2328;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:88%;",
        "pre": "margin:1.4em 0;border:1px solid #e5e7eb;border-radius:8px;background:#f6f8fa;overflow-x:auto;",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#24292f;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:3px solid #d8dee4;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #d0d7de;background:#f6f8fa;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #d0d7de;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#0969da;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(9,105,218,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="margin-right:8px;color:#0969da;font-family:${K};">#</span>${e}`,
        "h3": e=>`<span style="margin-right:6px;color:#8c959f;font-family:${K};">##</span>${e}`,
        "quoteMark": "<span style=\"display:block;margin:4px 0 2px;color:#0969da;font-size:13px;font-weight:bold;\">ⓘ Note</span>"
      },
      "hljs": $n
    },
{
      "id": "magazine",
      "name": "杂志",
      "accent": "#e63946",
      "tags": ["news", "business", "culture"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:24px;font-weight:bold;line-height:1.4;color:#1d3557;letter-spacing:1px;",
        "h2": "margin:2.2em 0 1em;font-size:20px;font-weight:bold;line-height:1.4;color:#1d3557;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#1d3557;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#e63946;",
        "strong": "font-weight:bold;color:#1d3557;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#e63946;text-decoration:none;border-bottom:1px solid #e63946;",
        "blockquote": "margin:1.8em 0;padding:4px 12px 8px;color:#1d3557;font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:17px;font-weight:bold;line-height:1.7;text-align:center;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(230,57,70,0.08);color:#e63946;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border-bottom:2px solid #1d3557;font-weight:bold;text-align:left;color:#1d3557;",
        "td": "padding:8px 10px;border-bottom:1px solid #e3e6ea;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#e63946;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(230,57,70,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:block;font-family:Georgia,serif;font-size:38px;font-weight:bold;font-style:italic;line-height:1;color:#e63946;letter-spacing:0;">${ge(t)}</span><span style="display:block;margin-top:8px;padding-left:2px;">${e}</span>${Be("width:28px;height:3px;background:#e63946;","margin:10px 0 0 2px;")}`,
        "h3": e=>`<span style="display:inline-block;width:8px;height:8px;margin-right:8px;background:#e63946;vertical-align:middle;"></span><span style="vertical-align:middle;">${e}</span>`,
        "quoteMark": "<span style=\"display:block;height:28px;font-family:Georgia,serif;font-size:48px;line-height:1;color:#e63946;\">“</span>",
        "hr": "<section style=\"margin:2.2em 0;line-height:0;text-align:center;\"><span style=\"display:inline-block;width:40px;height:3px;background:#1d3557;\"></span><span style=\"display:inline-block;width:12px;height:3px;margin-left:6px;background:#e63946;\"></span></section>"
      },
      "hljs": Dn
    },
{
      "id": "pop",
      "name": "波普",
      "accent": "#ff5a36",
      "tags": ["life", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;background:#fffbea;color:#222;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-size:23px;font-weight:900;line-height:1.4;color:#111;text-align:center;",
        "h2": "margin:2em 0 1.2em;font-size:17px;font-weight:900;line-height:1.5;color:#111;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#111;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#ff5a36;",
        "strong": "font-weight:bold;color:#111;background:#ffd23f;padding:0 3px;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#111;text-decoration:none;border-bottom:2px solid #ff5a36;",
        "blockquote": "margin:1.6em 0;padding:12px 16px;border:2px solid #111;background:#fff;box-shadow:4px 4px 0 #111;color:#333;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:1px 5px;border:1.5px solid #111;border-radius:4px;background:#ffe3ec;color:#111;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:88%;",
        "pre": "margin:1.6em 0;border:2px solid #111;border-radius:6px;background:#282c34;overflow-x:auto;box-shadow:4px 4px 0 #111;",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:2px solid #111;background:#111;color:#ffd23f;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:2px solid #111;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#ff5a36;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:2px dashed #111;background:#fff;color:#666;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:6px 16px;border:2px solid #111;background:#ffd23f;box-shadow:4px 4px 0 #111;">${e}</span>`,
        "h3": e=>`<span style="padding:0 6px;border:2px solid #111;background:#a8e6cf;">${e}</span>`,
        "ulMark": "<span style=\"display:inline-block;width:8px;height:8px;border:1.5px solid #111;background:#ff5a36;vertical-align:middle;\"></span>",
        "olMark": e=>$e(e,"#111","#ffd23f"),
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#111;font-size:14px;letter-spacing:8px;line-height:1;\">▲ ● ■</section>"
      },
      "hljs": Dn
    },
{
      "id": "timeline",
      "name": "时间轴",
      "accent": "#0891b2",
      "tags": ["tutorial", "news", "business"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:0.8em 0 0.8em;font-size:17px;font-weight:bold;line-height:1.5;color:#0e7490;",
        "h3": "margin:1.4em 0 0.6em;font-size:16px;font-weight:bold;line-height:1.5;color:#155e75;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#0891b2;",
        "strong": "font-weight:bold;color:#0891b2;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#0891b2;text-decoration:none;border-bottom:1px solid #0891b2;",
        "blockquote": "margin:1.2em 0;padding:12px 14px;border-radius:8px;background:#ecfeff;color:#4b6670;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(8,145,178,0.08);color:#0891b2;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(8,145,178,0.2);background:rgba(8,145,178,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(8,145,178,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#0891b2;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(8,145,178,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "card": {
          "style": "margin:0 0 0 12px;padding:6px 0 14px 24px;border-left:2px solid rgba(8,145,178,0.25);",
          "withHeading": true,
          "skipLead": true
        },
        "h2": (e,t)=>`<span style="display:inline-block;width:26px;height:26px;margin:0 10px 0 -38px;border-radius:50%;background:#0891b2;color:#fff;font-size:13px;line-height:26px;text-align:center;letter-spacing:0;vertical-align:middle;box-shadow:0 0 0 4px #fff;">${t}</span><span style="vertical-align:middle;">${e}</span>`,
        "h3": e=>`${Ne("#22d3ee",7)}<span style="margin-left:8px;vertical-align:middle;">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#33aec7;font-size:14px;letter-spacing:8px;line-height:1;\">◦ ◦ ◦</section>"
      },
      "hljs": Dn
    },
{
      "id": "seal",
      "name": "朱印",
      "accent": "#b91c1c",
      "tags": ["culture", "event"],
      "styles": {
        "wrapper": "font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:20px 16px;background:#faf6ee;color:#3d3528;letter-spacing:1px;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-size:23px;font-weight:bold;line-height:1.5;color:#2b2419;text-align:center;letter-spacing:4px;",
        "h2": "margin:2em 0 1em;font-size:18px;font-weight:bold;line-height:1.5;color:#2b2419;letter-spacing:2px;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#2b2419;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#b91c1c;",
        "strong": "font-weight:bold;color:#b91c1c;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#b91c1c;text-decoration:none;border-bottom:1px solid #b91c1c;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border-left:2px solid #b91c1c;background:#f3ecdd;color:#6b5b45;font-size:15px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(185,28,28,0.08);color:#b91c1c;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #d6c7a8;background:#efe6d3;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #d6c7a8;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#b91c1c;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(185,28,28,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h1": e=>`『${e}』`,
        "h2": (e,t)=>`<span style="display:inline-block;width:30px;height:30px;margin-right:12px;border-radius:4px;background:#b91c1c;color:#faf6ee;font-size:16px;line-height:30px;text-align:center;letter-spacing:0;vertical-align:middle;box-shadow:0 0 0 2px #faf6ee,0 0 0 3px #b91c1c;">${Je(t)}</span><span style="vertical-align:middle;">${e}</span>`,
        "h3": e=>`<span style="color:#b91c1c;">〔</span>${e}<span style="color:#b91c1c;">〕</span>`,
        "ulMark": "<span style=\"color:#b91c1c;\">◇</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#b7945c;font-size:14px;letter-spacing:8px;line-height:1;\">—— ◎ ——</section>"
      },
      "hljs": Dn
    },
{
      "id": "whisper",
      "name": "留白",
      "accent": "#8a8f98",
      "tags": ["emotion", "culture"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;line-height:2.1;color:#555;letter-spacing:1px;text-align:left;",
        "p": "margin:1.5em 0;",
        "h1": "margin:1.2em 0 1.6em;font-size:21px;font-weight:normal;line-height:1.6;color:#222;text-align:center;letter-spacing:4px;",
        "h2": "margin:2.6em 0 1.6em;font-size:16px;font-weight:normal;line-height:1.6;color:#222;text-align:center;letter-spacing:3px;",
        "h3": "margin:2em 0 1em;font-size:15px;font-weight:bold;line-height:1.6;color:#333;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#8a8f98;",
        "strong": "font-weight:bold;color:#222;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#8a8f98;text-decoration:none;border-bottom:1px solid #8a8f98;",
        "blockquote": "margin:2.2em 0;padding:0 1.2em;color:#999;font-size:14px;text-align:center;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:#f3f3f3;color:#666;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border-bottom:1px solid #ddd;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border-bottom:1px solid #eee;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#8a8f98;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:2em 0;padding:22px 12px;border:1px dashed #ccc;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:block;font-size:11px;line-height:1;color:#a0a0a0;letter-spacing:4px;">— ${ge(t)} —</span><span style="display:block;margin-top:10px;">${e}</span>`,
        "quoteMark": "<span style=\"display:block;margin-bottom:6px;font-size:12px;line-height:1;color:#a0a0a0;letter-spacing:6px;\">· · ·</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#a0a0a0;font-size:14px;letter-spacing:8px;line-height:1;\">·</section>"
      },
      "hljs": Dn
    },
{
      "id": "neon",
      "name": "霓虹",
      "accent": "#f472b6",
      "tags": ["tech", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 16px;border-radius:10px;background:#15112b;color:#d6d3f0;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#fff;text-align:center;text-shadow:0 0 8px #f472b6;",
        "h2": "margin:2.2em 0 1.2em;font-size:17px;font-weight:bold;line-height:1.5;color:#fff;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#67e8f9;text-shadow:0 0 6px rgba(34,211,238,0.6);",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#c4b5fd;",
        "strong": "font-weight:bold;color:#67e8f9;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#6b6890;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#67e8f9;text-decoration:none;border-bottom:1px solid #67e8f9;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border-left:3px solid #a78bfa;border-radius:0 8px 8px 0;background:rgba(167,139,250,0.1);color:#c4b5fd;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(244,114,182,0.14);color:#f9a8d4;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border:1px solid #3b2f6b;border-radius:8px;background:#0b0918;overflow-x:auto;box-shadow:0 0 12px rgba(167,139,250,0.25);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #3b2f6b;background:rgba(167,139,250,0.16);color:#e9d5ff;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #3b2f6b;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#f472b6;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #a78bfa;border-radius:6px;background:#1d1838;color:#a5a1c9;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:6px 22px;border:1.5px solid #f472b6;border-radius:6px;box-shadow:0 0 10px #f472b6,inset 0 0 8px rgba(244,114,182,0.45);text-shadow:0 0 6px #f472b6;">${e}</span>`,
        "ulMark": "<span style=\"display:inline-block;width:6px;height:6px;border-radius:50%;background:#67e8f9;vertical-align:middle;\"></span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#a78bfa;font-size:14px;letter-spacing:8px;line-height:1;\">✦ ━━ ✦ ━━ ✦</section>"
      },
      "hljs": Dn
    },
{
      "id": "kraft",
      "name": "牛皮纸",
      "accent": "#b5562f",
      "tags": ["life", "culture"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 16px;border-radius:6px;background:#f3e6cf;color:#4a3b2a;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2.2em 0 1.2em;font-size:16px;font-weight:bold;line-height:1.5;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:15px;font-weight:bold;line-height:1.5;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#b5562f;",
        "strong": "font-weight:bold;color:#8f3f1f;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#8a7a66;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#b5562f;text-decoration:none;border-bottom:1px solid #b5562f;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border:1px dashed #c9a77c;border-radius:4px;background:#fbf5ea;color:#6b5843;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:#ead8b8;color:#7a3a1a;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #d8bf98;background:#e8d5b2;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #d8bf98;background:#fbf5ea;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#b5562f;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #b5562f;border-radius:4px;background:#fbf5ea;color:#9b8466;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>{const t=n=>`<span style="display:inline-block;width:0;height:0;border-top:18px solid #8f3f1f;border-bottom:18px solid #8f3f1f;border-${n}:12px solid transparent;vertical-align:middle;"></span>`;return`${t("left")}<span style="display:inline-block;padding:5px 20px;border-top:1px dashed rgba(255,248,236,0.6);border-bottom:1px dashed rgba(255,248,236,0.6);background:#b5562f;color:#fff8ec;line-height:24px;letter-spacing:2px;vertical-align:middle;">${e}</span>${t("right")}`},
        "h3": e=>`<span style="display:inline-block;padding:1px 10px;border:1px dashed #b5562f;border-radius:3px;background:#fbf5ea;color:#8f3f1f;">${e}</span>`,
        "ulMark": "<span style=\"color:#b5562f;\">✻</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#b5562f;font-size:14px;letter-spacing:8px;line-height:1;\">· ✻ ·</section>"
      },
      "hljs": Dn
    },
{
      "id": "briefing",
      "name": "简报",
      "accent": "#1e3a8a",
      "tags": ["business", "news"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;color:#334155;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#1e3a8a;",
        "h2": "margin:2em 0 1em;font-size:16px;font-weight:bold;line-height:1.5;color:#fff;",
        "h3": "margin:1.6em 0 0.8em;padding-left:10px;border-left:4px solid #f59e0b;font-size:16px;font-weight:bold;line-height:1.4;color:#1e3a8a;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#1e3a8a;",
        "strong": "font-weight:bold;color:#1e3a8a;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#1e3a8a;text-decoration:none;border-bottom:1px solid #1e3a8a;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border-top:3px solid #1e3a8a;background:#eff3fb;color:#334155;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(30,58,138,0.08);color:#1e3a8a;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #cbd5e1;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #1e3a8a;background:#1e3a8a;color:#fff;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #cbd5e1;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#1e3a8a;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(30,58,138,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:block;padding-right:14px;background:#1e3a8a;line-height:38px;"><span style="display:inline-block;margin-right:12px;padding:0 12px;background:#f59e0b;color:#1e3a8a;letter-spacing:0;">${ge(t)}</span>${e}</span>`,
        "quoteMark": "<span style=\"display:block;margin-bottom:4px;font-size:12px;font-weight:bold;letter-spacing:2px;color:#1e3a8a;\">▍要点</span>",
        "ulMark": "<span style=\"display:inline-block;width:7px;height:7px;background:#f59e0b;vertical-align:middle;\"></span>",
        "olMark": e=>$e(e,"#1e3a8a")
      },
      "hljs": Dn
    },
{
      "id": "bubble",
      "name": "对话框",
      "accent": "#07c160",
      "tags": ["emotion", "life"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:18px 14px;border-radius:8px;background:#ededed;color:#222;",
        "p": "margin:1em 0;",
        "h1": "margin:0.6em 0 1.2em;font-size:20px;font-weight:bold;line-height:1.5;color:#111;text-align:center;",
        "h2": "margin:1.8em 0 1em;font-size:15px;font-weight:normal;line-height:1.6;color:#111;",
        "h3": "margin:1.6em 0 0.8em;font-size:12px;font-weight:normal;line-height:1.6;text-align:center;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#06ad56;",
        "strong": "font-weight:bold;color:#06ad56;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#8c8c8c;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#06ad56;text-decoration:none;border-bottom:1px solid #06ad56;",
        "blockquote": "margin:1.2em 0;padding:10px 14px;border-radius:6px;background:#fff;color:#333;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:#fff;color:#06ad56;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #d5d5d5;background:#f7f7f7;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #d5d5d5;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#07c160;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #b2b2b2;border-radius:6px;background:#fff;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;width:34px;height:34px;margin-right:8px;border-radius:6px;background:#fff;font-size:18px;line-height:34px;text-align:center;vertical-align:middle;">💬</span><span style="display:inline-block;width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-right:7px solid #95ec69;vertical-align:middle;"></span><span style="display:inline-block;max-width:75%;padding:8px 12px;border-radius:6px;background:#95ec69;font-weight:bold;text-align:left;vertical-align:middle;">${e}</span>`,
        "h3": e=>`<span style="display:inline-block;padding:2px 10px;border-radius:4px;background:#e0e0e0;color:#7a7a7a;">${e}</span>`,
        "hr": "<section style=\"margin:1.6em 0;font-size:12px;line-height:1;color:#939393;text-align:center;\">—— 以下是新消息 ——</section>"
      },
      "hljs": Dn
    },
{
      "id": "inkwash",
      "name": "水墨",
      "accent": "#2f3e46",
      "tags": ["culture", "emotion"],
      "styles": {
        "wrapper": "font-family:Georgia,\"Songti SC\",\"STSong\",\"SimSun\",serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 16px;background:#f8f8f5;color:#3a3f42;letter-spacing:1px;",
        "p": "margin:1em 0;",
        "h1": "margin:1em 0 1.4em;font-size:23px;font-weight:bold;line-height:1.5;color:#1f2a30;text-align:center;letter-spacing:6px;",
        "h2": "margin:2.4em 0 1.2em;font-size:19px;font-weight:bold;line-height:1.5;color:#1f2a30;text-align:center;letter-spacing:3px;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#1f2a30;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#2f3e46;",
        "strong": "font-weight:bold;color:#1f2a30;border-bottom:1px solid #8a9aa2;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#2f3e46;text-decoration:none;border-bottom:1px solid #2f3e46;",
        "blockquote": "margin:1.8em 0;padding:0 1em;color:#5f6b70;font-size:15px;text-align:center;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(47,62,70,0.08);color:#2f3e46;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border-bottom:1px solid #2f3e46;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border-bottom:1px solid #dde1e3;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#2f3e46;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(47,62,70,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:block;font-size:30px;font-weight:normal;line-height:1;color:#7d8a90;letter-spacing:0;">${Je(t)}</span><span style="display:block;margin-top:10px;">${e}</span>${Be("width:60px;height:3px;border-radius:50%;background:linear-gradient(90deg,rgba(47,62,70,0),#2f3e46,rgba(47,62,70,0));","margin-top:10px;")}`,
        "h3": e=>`<span style="color:#9a3b3b;">｜</span>${e}`,
        "quoteMark": "<span style=\"display:block;height:24px;font-size:30px;line-height:1;color:#8e9da4;\">〝</span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#909ca3;font-size:14px;letter-spacing:8px;line-height:1;\">～ ◦ ～</section>"
      },
      "hljs": Dn
    },
{
      "id": "nordic",
      "name": "北欧",
      "accent": "#7d9a83",
      "tags": ["life", "emotion"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:22px 18px;border-radius:16px;background:#f7f4ee;color:#4f4a43;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2.2em 0 1em;font-size:18px;font-weight:bold;line-height:1.5;color:#3f3a33;",
        "h3": "margin:1.6em 0 0.8em;font-size:15px;font-weight:bold;line-height:1.5;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#7d9a83;",
        "strong": "font-weight:bold;color:#4e6b55;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#7d9a83;text-decoration:none;border-bottom:1px solid #7d9a83;",
        "blockquote": "margin:1.4em 0;padding:14px 18px;border-radius:14px;background:#fff;color:#6b6459;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 6px;border-radius:6px;background:#e9eee6;color:#4e6b55;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border-bottom:1px solid #d9d2c5;background:#efe9df;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border-bottom:1px solid #e6e0d5;background:#fff;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#7d9a83;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed #b7c4b8;border-radius:14px;background:#fff;color:#9a9285;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:block;font-size:11px;font-weight:normal;line-height:1;color:#ad957a;letter-spacing:3px;">SECTION ${ge(t)}</span><span style="display:block;margin-top:6px;">${e}</span>${Be("width:24px;height:3px;border-radius:2px;background:#7d9a83;","margin-top:8px;")}`,
        "h3": e=>`<span style="display:inline-block;padding:1px 12px;border-radius:999px;background:#e3eae2;color:#4e6b55;">${e}</span>`,
        "ulMark": "<span style=\"display:inline-block;width:6px;height:6px;border-radius:50%;background:#7d9a83;vertical-align:middle;\"></span>",
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#aa9679;font-size:14px;letter-spacing:8px;line-height:1;\">○ ○ ○</section>"
      },
      "hljs": Dn
    },
{
      "id": "candy",
      "name": "糖果",
      "accent": "#ff5c9d",
      "tags": ["life", "event"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1.2em;font-size:16px;font-weight:bold;line-height:1.5;text-align:center;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#444;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#ff5c9d;",
        "strong": "font-weight:bold;color:#ff5c9d;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#ff5c9d;text-decoration:none;border-bottom:1px solid #ff5c9d;",
        "blockquote": "margin:1.4em 0;padding:14px 16px;border:2px dashed #9bd6f5;border-radius:16px;background:#f0f9ff;color:#4a6b80;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(255,92,157,0.08);color:#ff5c9d;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #ffd1e3;background:#fff0f6;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #ffe0ec;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#ff5c9d;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(255,92,157,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": e=>`<span style="display:inline-block;padding:3px;border-radius:999px;background:#ec4f8f;box-shadow:0 3px 0 #ffc2da;"><span style="display:inline-block;padding:4px 18px;border:2px dashed rgba(255,255,255,0.9);border-radius:999px;color:#fff;">★ ${e}</span></span>`,
        "h3": e=>`<span style="color:#ff6ea9;">●</span><span style="color:#d49400;">●</span><span style="color:#13aaef;">●</span> ${e}`,
        "ulMark": "<span style=\"display:inline-block;width:7px;height:7px;border-radius:50%;background:#ffd166;vertical-align:middle;\"></span>",
        "olMark": e=>$e(e,["#ec4f8f","#e8890c","#1fa3dc","#4caf50"][(e-1)%4]),
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#ff6ea7;font-size:14px;letter-spacing:8px;line-height:1;\">★ ☆ ★</section>"
      },
      "hljs": Dn
    },
{
      "id": "feed",
      "name": "卡片流",
      "accent": "#f97316",
      "tags": ["news", "tutorial"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;padding:12px 10px;border-radius:8px;background:#f2f3f5;",
        "p": "margin:1em 0;",
        "h1": "margin:0.6em 0 0.8em;padding:0 6px;font-size:21px;font-weight:bold;line-height:1.5;color:#222;",
        "h2": "margin:0.8em 0 0.6em;padding-bottom:10px;border-bottom:1px solid #f0f0f0;font-size:17px;font-weight:bold;line-height:1.5;color:#222;",
        "h3": "margin:1.4em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#333;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#f97316;",
        "strong": "font-weight:bold;color:#f97316;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#f97316;text-decoration:none;border-bottom:1px solid #f97316;",
        "blockquote": "margin:1.2em 0;padding:12px 14px;border-radius:8px;background:#f7f8fa;color:#666;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(249,115,22,0.08);color:#f97316;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:1.6em 0;height:0;border:0;border-top:1px dashed #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid rgba(249,115,22,0.2);background:rgba(249,115,22,0.08);font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid rgba(249,115,22,0.2);",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#f97316;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.2em 0;padding:22px 12px;border:1px dashed #fdba74;border-radius:8px;background:#f7f8fa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "card": {
          "style": "margin:0 0 12px;padding:4px 16px 10px;border-radius:12px;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,0.05);",
          "withHeading": true
        },
        "h2": e=>`<span style="display:inline-block;width:4px;height:16px;margin-right:8px;border-radius:2px;background:#f97316;vertical-align:-2px;"></span>${e}`,
        "h3": e=>`<span style="color:#f97316;"># </span>${e}`
      },
      "hljs": Dn
    },
{
      "id": "checklist",
      "name": "清单",
      "accent": "#16a34a",
      "tags": ["tutorial"],
      "styles": {
        "wrapper": "font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-size:15px;line-height:1.8;color:#3f3f3f;letter-spacing:0.5px;word-break:break-word;text-align:justify;",
        "p": "margin:1em 0;",
        "h1": "margin:1.2em 0 1.2em;font-size:22px;font-weight:bold;line-height:1.5;color:#222;text-align:center;",
        "h2": "margin:2em 0 1em;font-size:17px;font-weight:bold;line-height:1.5;color:#14532d;",
        "h3": "margin:1.6em 0 0.8em;font-size:16px;font-weight:bold;line-height:1.5;color:#166534;",
        "h4": "margin:1.2em 0 0.6em;font-size:15px;font-weight:bold;line-height:1.5;color:#16a34a;",
        "strong": "font-weight:bold;color:#15803d;",
        "em": "font-style:italic;",
        "del": "text-decoration:line-through;color:#999;",
        "sup": "font-size:75%;line-height:0;vertical-align:super;",
        "sub": "font-size:75%;line-height:0;vertical-align:sub;",
        "link": "color:#16a34a;text-decoration:none;border-bottom:1px solid #16a34a;",
        "blockquote": "margin:1.4em 0;padding:12px 16px;border:1px solid #bbf7d0;border-radius:10px;background:#f0fdf4;color:#3f6150;font-size:14px;",
        "blockquoteP": "margin:0.4em 0;",
        "ul": "margin:1em 0;padding-left:1.6em;list-style-type:disc;",
        "ol": "margin:1em 0;padding-left:1.6em;list-style-type:decimal;",
        "li": "margin:0.4em 0;",
        "code": "margin:0 2px;padding:2px 5px;border-radius:4px;background:rgba(22,163,74,0.08);color:#16a34a;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:90%;",
        "pre": "margin:1.4em 0;border-radius:8px;background:#282c34;overflow-x:auto;box-shadow:0 2px 10px rgba(0,0,0,0.12);",
        "preBar": "display:block;padding:10px 14px 0;line-height:1;",
        "preCode": "display:block;padding:10px 14px 14px;color:#abb2bf;font-family:Menlo,Monaco,Consolas,\"Courier New\",monospace;font-size:13px;line-height:1.6;letter-spacing:0;white-space:nowrap;background:none;",
        "hr": "margin:2em 0;height:0;border:0;border-top:1px solid #e5e5e5;",
        "tableWrap": "margin:1.4em 0;overflow-x:auto;",
        "table": "width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;",
        "th": "padding:8px 10px;border:1px solid #bbf7d0;background:#dcfce7;font-weight:bold;text-align:left;",
        "td": "padding:8px 10px;border:1px solid #d1fae5;",
        "fnRef": "margin:0 1px;font-size:75%;line-height:0;vertical-align:super;color:#16a34a;",
        "footnotes": "margin:2.4em 0 1em;padding-top:1em;border-top:1px solid #e5e5e5;font-size:13px;line-height:1.7;color:#888;",
        "fnTitle": "margin:0 0 0.6em;font-weight:bold;",
        "fnItem": "margin:0.3em 0;word-break:break-all;",
        "imgSlot": "margin:1.4em 0;padding:22px 12px;border:1px dashed rgba(22,163,74,0.6);border-radius:6px;background:#fafafa;color:#999;font-size:13px;line-height:1.6;text-align:center;"
      },
      "decor": {
        "h2": (e,t)=>`<span style="display:inline-block;margin-right:10px;padding:2px 8px;border-radius:4px;background:#16a34a;color:#fff;font-size:12px;letter-spacing:1px;vertical-align:middle;">STEP ${ge(t)}</span><span style="vertical-align:middle;">${e}</span>`,
        "h3": e=>`<span style="color:#16a34a;">✓ </span>${e}`,
        "quoteMark": "<span style=\"display:block;margin-bottom:4px;font-size:13px;font-weight:bold;color:#15803d;\">💡 小贴士</span>",
        "ulMark": "<span style=\"display:inline-block;width:13px;height:13px;border:1.5px solid #16a34a;border-radius:3px;color:#16a34a;font-size:11px;font-weight:bold;line-height:13px;text-align:center;letter-spacing:0;vertical-align:middle;\">✓</span>",
        "olMark": e=>`<span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:bold;line-height:18px;text-align:center;letter-spacing:0;vertical-align:1px;">${e}</span>`,
        "hr": "<section style=\"margin:2em 0;text-align:center;color:#18b752;font-size:14px;letter-spacing:8px;line-height:1;\">✓ ✓ ✓</section>"
      },
      "hljs": Dn
    }
  ];

  const styleSelectors = {
    wrapper: '.preview-content',
    p: '.preview-content p',
    h1: '.preview-content h1',
    h2: '.preview-content h2',
    h3: '.preview-content h3',
    h4: '.preview-content h4, .preview-content h5, .preview-content h6',
    strong: '.preview-content strong, .preview-content b',
    em: '.preview-content em, .preview-content i',
    del: '.preview-content del, .preview-content s',
    sup: '.preview-content sup',
    sub: '.preview-content sub',
    link: '.preview-content a',
    blockquote: '.preview-content blockquote',
    blockquoteP: '.preview-content blockquote p',
    ul: '.preview-content ul',
    ol: '.preview-content ol',
    li: '.preview-content li',
    code: '.preview-content :not(pre) > code',
    pre: '.preview-content pre',
    preCode: '.preview-content pre code',
    hr: '.preview-content hr',
    table: '.preview-content table',
    th: '.preview-content th',
    td: '.preview-content td'
  };

  const cleanPre = css => String(css || '').replace(/box-shadow:[^;]+;?/g, '');
  const cleanPreCode = css => cleanPre(css).replace(/white-space:[^;]+;?/g, '') + 'white-space:pre-wrap;word-break:break-word;';

  function generateTypesetThemeCSS(theme) {
    const rules = [];
    Object.entries(styleSelectors).forEach(([key, selector]) => {
      let css = theme.styles && theme.styles[key];
      if (key === 'pre') css = cleanPre(css);
      if (key === 'preCode') css = cleanPreCode(css);
      if (css) rules.push(selector + ' { ' + css + ' }');
    });
    const prismTokens = {
      keyword: '.token.keyword, .token.atrule, .token.important',
      built_in: '.token.builtin, .token.class-name, .token.function',
      type: '.token.class-name',
      literal: '.token.boolean, .token.constant',
      number: '.token.number',
      string: '.token.string, .token.attr-value, .token.char',
      regexp: '.token.regex',
      comment: '.token.comment, .token.prolog, .token.doctype, .token.cdata',
      quote: '.token.comment',
      title: '.token.selector, .token.title',
      section: '.token.selector',
      name: '.token.tag, .token.property',
      tag: '.token.tag',
      attr: '.token.attr-name',
      attribute: '.token.attr-value, .token.string',
      property: '.token.property',
      variable: '.token.variable',
      params: '.token.function',
      meta: '.token.meta',
      symbol: '.token.symbol'
    };
    Object.entries(theme.hljs || {}).forEach(([key, css]) => {
      const selector = prismTokens[key];
      if (selector && css) rules.push('.preview-content pre ' + selector + ' { ' + css + ' }');
    });
    return (typeof prismCss === 'string' ? prismCss + '\n' : '') + rules.join('\n');
  }

  function applyTypesetDecor(container, theme) {
    if (!container || !theme) return;
    if (container.dataset.typesetThemeApplied === theme.id) return;
    container.dataset.typesetThemeApplied = theme.id;
    const styles = theme.styles || {};
    const decor = theme.decor || {};
    const safeHtml = html => String(html).replace(/,"([^"]+)",/g, ",'$1',");

    if (styles.wrapper) container.setAttribute('style', styles.wrapper);

    const tagStyleMap = {
      p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h4', h6: 'h4',
      strong: 'strong', b: 'strong', em: 'em', i: 'em', del: 'del', s: 'del',
      sup: 'sup', sub: 'sub', a: 'link', blockquote: 'blockquote',
      ul: 'ul', ol: 'ol', li: 'li', pre: 'pre', hr: 'hr',
      table: 'table', th: 'th', td: 'td'
    };
    container.querySelectorAll('*').forEach(el => {
      const tag = el.tagName.toLowerCase();
      let key = tagStyleMap[tag];
      if (tag === 'code') key = el.parentElement && el.parentElement.tagName === 'PRE' ? 'preCode' : 'code';
      if (tag === 'p' && el.parentElement && el.parentElement.tagName === 'BLOCKQUOTE') key = 'blockquoteP';
      if (key && styles[key]) {
        let css = styles[key];
        if (key === 'pre') css = cleanPre(css);
        if (key === 'preCode') css = cleanPreCode(css);
        el.setAttribute('style', css + (el.getAttribute('style') || ''));
      }
    });

    const dots = ['#ff5f56', '#ffbd2e', '#27c93f'].map(c =>
      `<span style="display:inline-block;width:10px;height:10px;margin-right:6px;border-radius:50%;background:${c};"></span>`
    ).join('');
    container.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;
      const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(node => {
        const lines = node.data.replace(/\t/g, '    ').replace(/ /g, '\u00a0').split('\n');
        const frag = document.createDocumentFragment();
        lines.forEach((line, i) => {
          if (i > 0) frag.appendChild(document.createElement('br'));
          if (line) frag.appendChild(document.createTextNode(line));
        });
        node.replaceWith(frag);
      });
      if (!pre.querySelector('[data-bar]')) {
        const bar = document.createElement('span');
        bar.setAttribute('data-bar', '');
        if (styles.preBar) bar.style.cssText = styles.preBar;
        bar.innerHTML = dots;
        pre.insertBefore(bar, code);
      }
    });

    container.querySelectorAll('table').forEach(table => {
      if (table.parentElement && table.parentElement.hasAttribute('data-table-wrap')) return;
      const wrap = document.createElement('section');
      wrap.setAttribute('data-table-wrap', '');
      if (styles.tableWrap) wrap.style.cssText = styles.tableWrap;
      table.replaceWith(wrap);
      wrap.appendChild(table);
    });

    ['h1', 'h2', 'h3'].forEach(tag => {
      if (typeof decor[tag] !== 'function') return;
      container.querySelectorAll(tag).forEach((el, i) => {
        el.innerHTML = safeHtml(decor[tag](el.innerHTML, i + 1));
      });
    });

    if (decor.quoteMark) {
      container.querySelectorAll('blockquote').forEach(el => {
        el.insertAdjacentHTML('afterbegin', safeHtml(decor.quoteMark));
      });
    }

    if (decor.hr) {
      container.querySelectorAll('hr').forEach(el => {
        el.insertAdjacentHTML('beforebegin', safeHtml(decor.hr));
        el.remove();
      });
    }

    if (decor.ulMark || decor.olMark) {
      container.querySelectorAll('ul, ol').forEach(list => {
        const isOl = list.tagName === 'OL';
        const mark = isOl ? decor.olMark : decor.ulMark;
        if (!mark) return;
        const marker = typeof mark === 'function' ? mark : () => mark;
        let index = Number(list.getAttribute('start')) || 1;
        const box = document.createElement('section');
        box.style.cssText = (list.getAttribute('style') || '') + 'padding-left:0;list-style-type:none;';
        Array.from(list.children).forEach(li => {
          const row = document.createElement('section');
          row.style.cssText = (li.getAttribute('style') || '') + 'padding-left:1.6em;';
          const span = document.createElement('span');
          span.style.cssText = 'display:inline-block;width:1.6em;margin-left:-1.6em;';
          span.innerHTML = safeHtml(marker(index++));
          row.appendChild(span);
          while (li.firstChild) row.appendChild(li.firstChild);
          box.appendChild(row);
        });
        list.replaceWith(box);
      });
    }

    if (decor.card && decor.card.style) {
      let card = null;
      let started = false;
      Array.from(container.children).forEach(el => {
        if (el.tagName === 'H1') { card = null; return; }
        if (el.tagName === 'H2') { started = true; card = null; if (!decor.card.withHeading) return; }
        else if (!started && decor.card.skipLead) return;
        if (!card) {
          card = document.createElement('section');
          card.style.cssText = decor.card.style;
          el.before(card);
        }
        card.appendChild(el);
      });
    }
  }

  function themeToConfig(theme) {
    const styles = theme.styles || {};
    const pick = (css, prop, fallback) => {
      const m = css && css.match(new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)'));
      return m ? m[1].trim() : fallback;
    };
    const px = (v, fallback) => {
      const n = parseFloat(v);
      return isNaN(n) ? fallback : Math.round(n * 0.75);
    };
    return {
      colors: {
        title: pick(styles.h1, 'color', '#1a1a1a'),
        text: pick(styles.wrapper, 'color', '#333333'),
        link: pick(styles.link, 'color', theme.accent),
        codeBg: pick(styles.code, 'background', '#f5f5f5'),
        quoteColor: pick(styles.blockquote, 'color', '#666666'),
        quoteBorder: pick(styles.blockquote, 'border-left-color', theme.accent)
      },
      fonts: {
        title: pick(styles.h1, 'font-family', "'Microsoft YaHei', sans-serif"),
        text: pick(styles.wrapper, 'font-family', "'Microsoft YaHei', sans-serif"),
        code: pick(styles.code, 'font-family', "'Consolas', 'Monaco', monospace")
      },
      sizes: {
        h1: px(pick(styles.h1, 'font-size', '22px'), 22),
        h2: px(pick(styles.h2, 'font-size', '17px'), 16),
        h3: px(pick(styles.h3, 'font-size', '16px'), 14),
        text: px(pick(styles.wrapper, 'font-size', '15px'), 12)
      },
      spacing: {
        lineHeight: parseFloat(pick(styles.wrapper, 'line-height', '1.8')) || 1.8,
        paragraphMargin: parseFloat(pick(styles.p, 'margin', '1em')) * 16 || 16
      }
    };
  }

  window.typesetThemes = typesetThemes;
  window.generateTypesetThemeCSS = generateTypesetThemeCSS;
  window.applyTypesetDecor = applyTypesetDecor;
  window.themeToConfig = themeToConfig;
})();
