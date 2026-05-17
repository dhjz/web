var prismCss = `code[class*=language-],pre[class*=language-]{color:#000;background:0 0;text-shadow:0 1px #fff;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{text-shadow:none;background:#b3d4fc}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#f5f2f0}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#708090}.token.punctuation{color:#999}.token.namespace{opacity:.7}.token.boolean,.token.constant,.token.deleted,.token.number,.token.property,.token.symbol,.token.tag{color:#905}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#690}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url{color:#9a6e3a;background:hsla(0,0%,100%,.5)}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.class-name,.token.function{color:#dd4a68}.token.important,.token.regex,.token.variable{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}`;

function readTxt(f) {
  return new Promise((r) => {
    Object.assign(new FileReader(), { onload: ({ target: { result } }) => r(result) }).readAsText(f)
  })
}

function uploadText() {
  return new Promise((r) => {
    document.getElementById('impinput')?.remove()
    const inputEl = Object.assign(document.createElement('input'), { type: 'file', id: 'impinput', style: 'display: none;' })
    document.body.append(inputEl)
    inputEl.onchange = function () {
      const file = inputEl.files[0]
      if (!file) return r(null)
      Object.assign(new FileReader(), { onload: ({ target: { result } }) => r(result) }).readAsText(file)
    }
    inputEl.click()
  })
}


function highlightCode(html) {
  if (typeof Prism === 'undefined') return html;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const codeBlocks = tempDiv.querySelectorAll('pre code');
  codeBlocks.forEach(codeEl => {
    const langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : 'markup';
    const text = codeEl.textContent;
    try {
      if (Prism.languages[lang]) {
        codeEl.innerHTML = Prism.highlight(text, Prism.languages[lang], lang);
      } else {
        codeEl.innerHTML = Prism.highlight(text, Prism.languages.markup, 'markup');
      }
    } catch (e) {
      console.warn('Prism highlight error:', e);
    }
  });
  return tempDiv.innerHTML;
}

function highlightCodeForExport(html, config) {
  if (typeof Prism === 'undefined') return html;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const codeBlocks = tempDiv.querySelectorAll('pre code');
  codeBlocks.forEach(codeEl => {
    const langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : 'markup';
    const text = codeEl.textContent;
    try {
      let highlighted;
      if (Prism.languages[lang]) {
        highlighted = Prism.highlight(text, Prism.languages[lang], lang);
      } else {
        highlighted = Prism.highlight(text, Prism.languages.markup, 'markup');
      }
      const lines = highlighted.split('\n');
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      const container = document.createElement('div');
      container.style.cssText = `background:${config.colors.codeBg};padding:12px;border-radius:4px;font-family:Consolas,monospace;font-size:10pt;line-height:1.6;`;
      lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.innerHTML = line || '&nbsp;';
        container.appendChild(lineDiv);
      });
      codeEl.parentNode.replaceChild(container, codeEl);
    } catch (e) {
      console.warn('Prism highlight error:', e);
    }
  });
  tempDiv.querySelectorAll('pre').forEach(pre => {
    if (!pre.querySelector('div')) {
      const text = pre.textContent;
      const lines = text.split('\n');
      while (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      const container = document.createElement('div');
      container.style.cssText = `background:${config.colors.codeBg};padding:12px;border-radius:4px;font-family:Consolas,monospace;font-size:10pt;line-height:1.6;`;
      lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = line || ' ';
        container.appendChild(lineDiv);
      });
      pre.parentNode.replaceChild(container, pre);
    }
  });
  return tempDiv.innerHTML;
}

function handleMathML(el) {
  el.querySelectorAll('.katex-mathml').forEach(ele => ele.style.position = 'relative');
  el.querySelectorAll('.katex-html').forEach(ele => ele.remove());
}

function renderMath(html) {
  if (typeof katex === 'undefined') return html;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, tex) => {
    try {
      const rendered = katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      return `<div class="math-block" data-latex="${encodeURIComponent(tex.trim())}">${rendered}</div>`;
    } catch (e) {
      return match;
    }
  });
  html = html.replace(/\$([^\$\n]+?)\$/g, (match, tex) => {
    try {
      const rendered = katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      return `<span class="math-inline" data-latex="${encodeURIComponent(tex.trim())}">${rendered}</span>`;
    } catch (e) {
      return match;
    }
  });
  return html;
}

function preprocessHTMLForDocx(html, config) {
  const { colors } = config;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const processList = (listEl, isOrdered) => {
    const items = listEl.querySelectorAll(':scope > li');
    let counter = 1;
    items.forEach(li => {
      const prefix = isOrdered ? `${counter}. ` : '• ';
      const p = document.createElement('p');
      p.innerHTML = prefix + li.innerHTML;
      listEl.parentNode.insertBefore(p, listEl);
      counter++;
    });
    listEl.parentNode.removeChild(listEl);
  };
  
  tempDiv.querySelectorAll('ul').forEach(ul => {
    const items = ul.querySelectorAll(':scope > li');
    const paragraphs = [];
    items.forEach(li => {
      const p = document.createElement('p');
      p.innerHTML = '• ' + li.innerHTML;
      paragraphs.push(p);
    });
    paragraphs.forEach(p => ul.parentNode.insertBefore(p, ul));
    ul.parentNode.removeChild(ul);
  });
  
  tempDiv.querySelectorAll('ol').forEach(ol => {
    const items = ol.querySelectorAll(':scope > li');
    let counter = 1;
    const paragraphs = [];
    items.forEach(li => {
      const p = document.createElement('p');
      p.innerHTML = counter + '. ' + li.innerHTML;
      paragraphs.push(p);
      counter++;
    });
    paragraphs.forEach(p => ol.parentNode.insertBefore(p, ol));
    ol.parentNode.removeChild(ol);
  });
  
  tempDiv.querySelectorAll('hr').forEach(hr => {
    const div = document.createElement('div');
    div.style = `width:100%; height:0.01cm; background:${colors.quoteBorder}; font-size:0.01cm; line-height:0.01cm; overflow:hidden;`;
    div.innerHTML = '&nbsp;';
    hr.parentNode.insertBefore(div, hr);
    hr.parentNode.removeChild(hr);
  });
  
  tempDiv.querySelectorAll('pre').forEach(pre => {
    const codeEl = pre.querySelector('code');
    const textContent = codeEl ? codeEl.textContent : pre.textContent;
    let lines = textContent.split('\n');
    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    const table = document.createElement('table');
    table.style.cssText = `border-collapse:collapse; margin:0 0 12px 0; background:${colors.codeBg};`;
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.style.cssText = 'padding:8px 12px;';
    lines.forEach((line, index) => {
      const lineDiv = document.createElement('div');
      lineDiv.style.cssText = 'font-family:Consolas,monospace; font-size:10pt; line-height:1.6;';
      const processedLine = line.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      lineDiv.innerHTML = processedLine || '&nbsp;';
      td.appendChild(lineDiv);
    });
    tr.appendChild(td);
    table.appendChild(tr);
    pre.parentNode.replaceChild(table, pre);
  });
  
  tempDiv.querySelectorAll('blockquote').forEach(blockquote => {
    const table = document.createElement('table');
    table.style.cssText = `border-collapse:collapse; margin:0 0 12px 0; background:${colors.codeBg};`;
    const tr = document.createElement('tr');
    const borderTd = document.createElement('td');
    borderTd.style.cssText = `width:4px; background:${colors.quoteBorder}; padding:0;`;
    borderTd.innerHTML = '&nbsp;';
    const contentTd = document.createElement('td');
    contentTd.style.cssText = 'padding:8px 12px; vertical-align:top;';
    const paragraphs = blockquote.querySelectorAll('p');
    if (paragraphs.length > 0) {
      paragraphs.forEach((p, idx) => {
        const newP = document.createElement('p');
        newP.style.cssText = `margin:0; color:${colors.quoteColor};`;
        newP.innerHTML = p.innerHTML;
        contentTd.appendChild(newP);
      });
    } else {
      const p = document.createElement('p');
      p.style.cssText = `margin:0; color:${colors.quoteColor};`;
      p.innerHTML = blockquote.innerHTML;
      contentTd.appendChild(p);
    }
    tr.appendChild(borderTd);
    tr.appendChild(contentTd);
    table.appendChild(tr);
    blockquote.parentNode.replaceChild(table, blockquote);
  });
  
  return tempDiv.innerHTML;
}

function convertMathToText(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const mathBlocks = tempDiv.querySelectorAll('.math-block');
  const mathInlines = tempDiv.querySelectorAll('.math-inline');
  
  mathBlocks.forEach(el => {
    const latex = decodeURIComponent(el.getAttribute('data-latex') || '');
    if (latex) {
      const p = document.createElement('p');
      p.style.textAlign = 'center';
      p.textContent = latex;
      el.parentNode.replaceChild(p, el);
    }
  });
  
  mathInlines.forEach(el => {
    const latex = decodeURIComponent(el.getAttribute('data-latex') || '');
    if (latex) {
      const textNode = document.createTextNode(latex);
      el.parentNode.replaceChild(textNode, el);
    }
  });
  
  return tempDiv.innerHTML;
}

async function convertMathToImages(html) {
  if (typeof html2canvas === 'undefined') {
    console.warn('html2canvas not available, using text fallback');
    return convertMathToText(html);
  }
  
  return new Promise((resolve) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.background = 'white';
    document.body.appendChild(tempDiv);
    
    const mathBlocks = tempDiv.querySelectorAll('.math-block');
    const mathInlines = tempDiv.querySelectorAll('.math-inline');
    console.log(mathInlines);
    mathInlines.forEach(el => {
      el.querySelector('.katex-mathml')?.remove();
    });
    const mathElements = [...mathBlocks]; // , ...mathInlines
    
    if (mathElements.length === 0) {
      document.body.removeChild(tempDiv);
      resolve(html);
      return;
    }
    
    let completed = 0;
    const total = mathElements.length;
    let scale = 3;
    mathElements.forEach((el, index) => {
      setTimeout(() => {
        html2canvas(el, {
          backgroundColor: '#ffffff',
          scale: scale,
          logging: false
        }).then(canvas => {
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const bounds = getContentBounds(imageData);
          
          if (bounds) {
            const croppedCanvas = document.createElement('canvas');
            const padding = 8;
            croppedCanvas.width = bounds.width + padding * 2;
            croppedCanvas.height = bounds.height + padding * 2;
            const croppedCtx = croppedCanvas.getContext('2d');
            croppedCtx.fillStyle = '#ffffff';
            croppedCtx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);
            croppedCtx.drawImage(
              canvas,
              bounds.left, bounds.top, bounds.width, bounds.height,
              padding, padding, bounds.width, bounds.height
            );
            
            const imgSrc = croppedCanvas.toDataURL('image/png', 1.0);
            const img = document.createElement('img');
            img.src = imgSrc;
            img.width = Math.round(croppedCanvas.width / scale);
            img.height = Math.round(croppedCanvas.height / scale);
            img.style.verticalAlign = 'middle';
            if (el.classList.contains('math-block')) {
              img.style.display = 'block';
              img.style.margin = '8px auto';
            }
            el.parentNode.replaceChild(img, el);
          } else {
            el.parentNode.removeChild(el);
          }
          completed++;
          if (completed === total) {
            const result = tempDiv.innerHTML;
            document.body.removeChild(tempDiv);
            resolve(result);
          }
        }).catch(e => {
          console.error('Math image error', e);
          const latex = decodeURIComponent(el.getAttribute('data-latex') || '');
          const span = document.createElement('span');
          span.textContent = latex;
          el.parentNode.replaceChild(span, el);
          completed++;
          if (completed === total) {
            const result = tempDiv.innerHTML;
            document.body.removeChild(tempDiv);
            resolve(result);
          }
        });
      }, index * 100);
    });
  });
}

function getContentBounds(imageData) {
  const { width, height, data } = imageData;
  let left = width, right = 0, top = height, bottom = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r < 250 || g < 250 || b < 250) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  
  if (left > right || top > bottom) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function generateTemplateCSS(config) {
  const { colors, fonts, sizes, spacing } = config;
  return `
    ${prismCss}
    .preview-content h1 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h1}pt; margin: 24px 0 16px 0; font-weight: 600; }
    .preview-content h2 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h2}pt; margin: 20px 0 12px 0; font-weight: 600; }
    .preview-content h3 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h3}pt; margin: 16px 0 10px 0; font-weight: 600; }
    .preview-content h4, .preview-content h5, .preview-content h6 { color: ${colors.title}; font-family: ${fonts.title}; margin: 12px 0 8px 0; font-weight: 600; }
    .preview-content p { color: ${colors.text}; font-family: ${fonts.text}; font-size: ${sizes.text}pt; line-height: ${spacing.lineHeight}; margin: 0 0 ${spacing.paragraphMargin}px 0; }
    .preview-content a { color: ${colors.link}; text-decoration: none; }
    .preview-content a:hover { text-decoration: underline; }
    .preview-content code { font-family: ${fonts.code}; background: ${colors.codeBg}; padding: 2px 6px; border-radius: 4px; font-size: ${sizes.text - 1}pt; white-space: pre-wrap; }
    .preview-content pre { background: ${colors.codeBg}; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 0 0 ${spacing.paragraphMargin}px 0; }
    .preview-content pre code { background: transparent; padding: 0; white-space: pre-wrap; }
    .preview-content blockquote { border-left: 4px solid ${colors.quoteBorder}; padding: 12px 16px; margin: 0 0 ${spacing.paragraphMargin}px 0; background: ${colors.codeBg}; border-radius: 0 8px 8px 0; }
    .preview-content blockquote p { color: ${colors.quoteColor}; margin: 0; }
    .preview-content ul, .preview-content ol { color: ${colors.text}; font-family: ${fonts.text}; font-size: ${sizes.text}pt; line-height: ${spacing.lineHeight}; margin: 0 0 ${spacing.paragraphMargin}px 0; padding-left: 24px; }
    .preview-content li { margin: 4px 0; }
    .preview-content hr { border: none; border-top: 1px solid ${colors.quoteBorder}; margin: 24px 0; }
    .preview-content table { border-collapse: collapse; width: 100%; margin: 0 0 ${spacing.paragraphMargin}px 0; font-size: ${sizes.text}pt; }
    .preview-content th, .preview-content td { border: 1px solid ${colors.quoteBorder}; padding: 8px 12px; text-align: left; }
    .preview-content th { background: ${colors.codeBg}; font-weight: 600; }
    .preview-content img { max-width: 100%; height: auto; border-radius: 4px; }
    .preview-content strong { font-weight: 600; }
    .preview-content em { font-style: italic; }
    .preview-content .math-block { text-align: center; margin: 16px 0; overflow-x: auto; }
    .preview-content .math-inline { }
    .preview-content .katex { font-size: 1.1em; }
    .preview-content .math-block .katex { font-size: 1.2em; }
  `;
}

function generateDocxCSS(config) {
  const { colors, fonts, sizes, spacing } = config;
  return `
    h1 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h1}pt; margin: 24px 0 16px 0; font-weight: bold; }
    h2 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h2}pt; margin: 20px 0 12px 0; font-weight: bold; }
    h3 { color: ${colors.title}; font-family: ${fonts.title}; font-size: ${sizes.h3}pt; margin: 16px 0 10px 0; font-weight: bold; }
    h4, h5, h6 { color: ${colors.title}; font-family: ${fonts.title}; margin: 12px 0 8px 0; font-weight: bold; }
    p { color: ${colors.text}; font-family: ${fonts.text}; font-size: ${sizes.text}pt; line-height: ${spacing.lineHeight}; margin: 0 0 ${spacing.paragraphMargin}px 0; }
    a { color: ${colors.link}; text-decoration: underline; }
    code { font-family: ${fonts.code}; background: ${colors.codeBg}; padding: 2px 6px; font-size: ${sizes.text - 1}pt; }
    pre { background: ${colors.codeBg}; padding: 16px; margin: 0 0 ${spacing.paragraphMargin}px 0; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; }
    pre code { background: transparent; padding: 0; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block; }
    blockquote { border-left: 4px solid ${colors.quoteBorder}; padding: 12px 16px; margin: 0 0 ${spacing.paragraphMargin}px 0; background: ${colors.codeBg}; }
    blockquote p { color: ${colors.quoteColor}; margin: 0; }
    table { border-collapse: collapse; width: 100%; margin: 0 0 ${spacing.paragraphMargin}px 0; font-size: ${sizes.text}pt; }
    th, td { border: 1px solid ${colors.quoteBorder}; padding: 8px 12px; text-align: left; }
    th { background: ${colors.codeBg}; font-weight: bold; }
    img { max-width: 100%; height: auto; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
  `;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAsHTML(htmlContent, cssContent, filename) {
  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown 文档</title>
  <style>
    body { font-family: 'Microsoft YaHei', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    ${cssContent}
  </style>
</head>
<body>
  <div class="preview-content">
    ${htmlContent}
  </div>
</body>
</html>`;
  downloadFile(fullHTML, filename || 'markdown-document.html', 'text/html;charset=utf-8');
}

async function exportAsPDF(element, filename) {
  const avoidBreakSelectors = 'p, h1, h2, h3, h4, h5, h6, table, pre, blockquote, ul, ol, img, .math-block';
  const elements = element.querySelectorAll(avoidBreakSelectors);
  const originalStyles = [];
  
  elements.forEach(el => {
    originalStyles.push({
      el: el,
      breakInside: el.style.breakInside,
      pageBreakInside: el.style.pageBreakInside
    });
    el.style.breakInside = 'avoid';
    el.style.pageBreakInside = 'avoid';
  });
  
  const liElements = element.querySelectorAll('li');
  liElements.forEach(el => {
    originalStyles.push({
      el: el,
      breakInside: el.style.breakInside,
      pageBreakInside: el.style.pageBreakInside
    });
    el.style.breakInside = 'avoid';
    el.style.pageBreakInside = 'avoid';
  });
  
  const trElements = element.querySelectorAll('tr');
  trElements.forEach(el => {
    originalStyles.push({
      el: el,
      breakInside: el.style.breakInside,
      pageBreakInside: el.style.pageBreakInside
    });
    el.style.breakInside = 'avoid';
    el.style.pageBreakInside = 'avoid';
  });
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      avoid: avoidBreakSelectors
    }
  };
  
  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    originalStyles.forEach(item => {
      item.el.style.breakInside = item.breakInside;
      item.el.style.pageBreakInside = item.pageBreakInside;
    });
  }
}

async function exportAsDocx(htmlContent, config, filename) {
  const docxCSS = generateDocxCSS(config);
  
  let processedHTML = htmlContent;
  
  if (processedHTML.includes('math-block') || processedHTML.includes('math-inline')) {
    processedHTML = await convertMathToImages(processedHTML);
  }
  
  // if (typeof highlightCodeForExport !== 'undefined') {
  //   processedHTML = highlightCodeForExport(processedHTML, config);
  // } else {
  // }
  processedHTML = preprocessHTMLForDocx(processedHTML, config);
  
  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Markdown 文档</title>
  <style>
    body { font-family: 'Microsoft YaHei', sans-serif; }
    ${docxCSS}
  </style>
</head>
<body>
  ${processedHTML}
</body>
</html>`;
console.log('fullHTML', fullHTML);
  const converted = htmlDocx.asBlob(fullHTML, {
    orientation: 'portrait',
    margins: {
      top: 1440,
      right: 1440,
      bottom: 1440,
      left: 1440
    }
  });

  const url = URL.createObjectURL(converted);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'markdown-document.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printPreviewContent(templateCSS) {
  const previewEl = document.querySelector('.preview-content');
  if (!previewEl) return;
  
  let printIframe = document.getElementById('print-iframe');
  if (printIframe) {
    document.body.removeChild(printIframe);
  }
  
  printIframe = document.createElement('iframe');
  printIframe.id = 'print-iframe';
  printIframe.style.cssText = 'position: absolute; width: 0; height: 0; border: none; left: -9999px;';
  document.body.appendChild(printIframe);
  
  const iframeDoc = printIframe.contentWindow.document;
  
  const allStyles = [];
  document.querySelectorAll('style').forEach(style => {
    allStyles.push(style.textContent);
  });
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    allStyles.push(`@import url("${link.href}");`);
  });
  
  const printStyles = `
    @page {
      size: A4;
      margin: 10mm 10mm;
    }
    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
    }
    body {
      font-family: 'Microsoft YaHei', sans-serif;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .preview-content {
      padding: 0 10px;
      line-height: 1.8;
    }
    ${templateCSS}
    ${allStyles.join('\n')}
  `;
  
  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>打印</title>
  <style>${printStyles}</style>
</head>
<body><div class="preview-content">${previewEl.innerHTML}</div></body>
</html>`);
  
  handleMathML(iframeDoc.body);
   
  iframeDoc.close();
  
  ElementPlus.ElMessage({
    message: '请在打印设置中：关闭"页眉页脚"，开启"背景图形"',
    type: 'warning',
    duration: 5000
  });
  
  setTimeout(() => {
    printIframe.contentWindow.focus();
    printIframe.contentWindow.print();
    setTimeout(() => {
      if (printIframe && printIframe.parentNode) {
        document.body.removeChild(printIframe);
      }
    }, 1000);
  }, 500);
}

async function copyRichText(element) {
  try {
    const html = element.innerHTML;
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([element.innerText], { type: 'text/plain' })
      })
    ]);
    return true;
  } catch (err) {
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      return true;
    } catch (e) {
      return false;
    }
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
