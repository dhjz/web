(function (global) {
  'use strict';

  var LIBRARIES = {
    fonteditor: 'fonteditor-core@2.6.3/lib/main.js',
    subsetFont: 'subset-font@2.9.0/index.js',
    harfbuzzWasm: 'harfbuzz-subset.wasm'
  };

  var state = {
    initPromise: null,
    fontEditor: null,
    pako: null,
    subsetFont: null,
    woff2Codec: null,
    fontforge: null
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('无法加载脚本: ' + src)); };
      document.head.appendChild(script);
    });
  }

  function normalizeModule(mod) {
    if (mod && mod.default && (mod.default.Font || mod.default.createFont)) return mod.default;
    if (mod && (mod.Font || mod.createFont)) return mod;
    if (mod && mod.FontEditorCoreModule && mod.FontEditorCoreModule.default) return mod.FontEditorCoreModule.default;
    return mod;
  }

  function getFontEditor() {
    var mod = global.FontEditorCoreModule || global.fonteditorCore || global.fontEditor || global.FontEditor;
    return normalizeModule(mod);
  }

  function harfbuzzUrl() {
    return LIBRARIES.harfbuzzWasm;
  }

  function ensureFontEditor() {
    if (state.fontEditor) return Promise.resolve(state.fontEditor);
    state.fontEditor = getFontEditor();
    if (!state.fontEditor || !state.fontEditor.createFont) return Promise.reject(new Error('字体处理库加载失败'));
    return Promise.resolve(state.fontEditor);
  }

  function ensurePako() {
    if (state.pako) return Promise.resolve(state.pako);
    if (!global.pako) return Promise.reject(new Error('pako 加载失败'));
    state.pako = global.pako;
    return Promise.resolve(state.pako);
  }

  function ensureSubsetFont() {
    if (state.subsetFont) return Promise.resolve(state.subsetFont);
    return loadScript('subset-font.bundle.js').then(function () {
      state.subsetFont = global.subsetFont;
      if (!state.subsetFont) throw new Error('subset-font 加载失败');
      return state.subsetFont;
    });
  }

  function ensureWoff2Codec() {
    if (state.woff2Codec) return Promise.resolve(state.woff2Codec);
    if (!global.Woff2Codec || !global.Woff2Codec.encode) return Promise.reject(new Error('woff2-codec 加载失败'));
    state.woff2Codec = global.Woff2Codec;
    return Promise.resolve(state.woff2Codec);
  }

  function ensureFontForge() {
    if (state.fontforge) return Promise.resolve(state.fontforge);
    state.fontforge = import('./fontforge-bridge.js').then(function (module) {
      if (!module || typeof module.convert !== 'function') throw new Error('FontForge WASM 加载失败');
      return module;
    }).catch(function (err) {
      state.fontforge = null;
      throw err;
    });
    return state.fontforge;
  }

  function encodeWoff2Fast(bytes, quality) {
    return ensureWoff2Codec().then(function (codec) {
      return codec.encode(toBytes(bytes), { quality: quality });
    });
  }

  function normalizeSfnt(bytes) {
    return ensureWoff2Codec().then(function (codec) {
      if (typeof codec.normalize !== 'function') return toBytes(bytes).slice();
      var result = codec.normalize(toBytes(bytes));
      return result && result.bytes ? toBytes(result.bytes) : toBytes(bytes).slice();
    });
  }

  function normalizeWoff2Quality(value) {
    var quality = Number(value);
    if (!Number.isInteger(quality) || quality < 0 || quality > 11) return 8;
    return quality;
  }

  function ensureAll() {
    if (state.initPromise) return state.initPromise;
    state.initPromise = Promise.all([
      ensureFontEditor(),
      ensurePako(),
      ensureWoff2Codec()
    ]).then(function () { return true; }).catch(function (err) {
      state.initPromise = null;
      throw err;
    });
    return state.initPromise;
  }

  function toArrayBuffer(input) {
    if (input instanceof ArrayBuffer) return input;
    if (input && input.buffer) return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
    throw new TypeError('需要 ArrayBuffer 或 TypedArray');
  }

  function toBytes(input) {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (input && input.buffer) return new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
    throw new TypeError('需要 ArrayBuffer 或 TypedArray');
  }

  function attrValue(attrs, name) {
    var match = attrs.match(new RegExp('\\b' + name + '\\s*=\\s*(["\'])([\\s\\S]*?)\\1', 'i'));
    return match ? match[2] : '';
  }

  function normalizeUnicode(value) {
    if (!value) return '';
    var text = value.trim();
    var hex = /^0x([0-9a-f]+)$/i.exec(text) || /^uni([0-9a-f]{4})$/i.exec(text) || /^u([0-9a-f]+)$/i.exec(text);
    var code = hex ? parseInt(hex[1], 16) : Array.from(text)[0] ? Array.from(text)[0].codePointAt(0) : NaN;
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function detectFormat(buffer, filename) {
    var bytes = toBytes(buffer);
    if (new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0) === 2001684018) return 'woff2';
    if (bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46 && bytes[3] === 0x46) return 'woff';
    if (bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f) return 'otf';
    var head = new TextDecoder('utf-8').decode(bytes.slice(0, 256)).trimStart().toLowerCase();
    if (head.indexOf('<svg') === 0) return 'svg';
    if (filename) {
      var ext = filename.split('.').pop().toLowerCase();
      if (ext === 'eot') return 'eot';
      if (ext === 'svg') return 'svg';
    }
    return 'ttf';
  }

  function makeResult(output, inputSize, sourceFormat, targetFormat, options) {
    options = options || {};
    var outputBytes = typeof output === 'string' ? new TextEncoder().encode(output) : toBytes(output);
    var baseName = (options.originalFilename || 'font').replace(/\.[^.]+$/, '');
    return {
      success: true,
      bytes: outputBytes,
      url: URL.createObjectURL(new Blob([outputBytes], { type: options.mimeType || 'application/octet-stream' })),
      output_filename: baseName + (options.suffix || '') + '.' + targetFormat,
      source_format: sourceFormat,
      target_format: targetFormat,
      input_size: inputSize,
      output_size: outputBytes.length,
      char_count: options.charCount,
      compression_ratio: options.compressionRatio,
      elapsed_time: options.elapsedTime
    };
  }

  function readFont(buffer, format) {
    var fe = state.fontEditor;
    var arrayBuffer = toArrayBuffer(buffer);
    var effectiveFormat = format === 'svg' ? 'svg' : (format === 'otf' ? 'otf' : 'ttf');
    var options = {
      type: effectiveFormat,
      hinting: false,
      kerning: false,
      compound2simple: false
    };
    if (effectiveFormat === 'woff') {
      options.inflate = function (input) { return state.pako.inflate(input instanceof Uint8Array ? input : new Uint8Array(input)); };
    }
    return fe.createFont(arrayBuffer, options);
  }

  function decodeWithFontForge(bytes, sourceFormat, targetFormat) {
    return ensureFontForge().then(function (fontforge) {
      if (sourceFormat === 'eot') {
        return fontforge.convert(bytes, 'ttf').catch(function (ttfError) {
          return Promise.resolve(readFont(bytes, 'ttf')).catch(function () { throw ttfError; });
        });
      }
      return fontforge.convert(bytes, 'ttf');
    }).then(function (ttfBytes) {
      if (targetFormat === 'otf') {
        return ensureFontForge().then(function (fontforge) { return fontforge.convert(ttfBytes, 'otf'); });
      }
      if (sourceFormat === 'woff' || sourceFormat === 'woff2' || sourceFormat === 'eot') {
        if (targetFormat === 'woff2') return encodeWoff2Fast(ttfBytes, 8);
        if (targetFormat === 'ttf') return ttfBytes;
      }
      return ensureFontEditor().then(function (fe) {
        var options = { type: targetFormat, toBuffer: false };
        if (targetFormat === 'woff') {
          options.deflate = function (input) { return state.pako.deflate(input instanceof Uint8Array ? input : new Uint8Array(input)); };
        }
        return fe.createFont(toArrayBuffer(ttfBytes), {
          type: 'ttf', hinting: false, kerning: false, compound2simple: false
        }).write(options);
      });
    });
  }

  function writeFont(font, targetFormat, sourceFormat, bytes, woff2Quality) {
    if (targetFormat === 'otf') {
      if (sourceFormat === 'otf') return toBytes(bytes).slice();
      throw new Error('暂不支持将 ' + sourceFormat.toUpperCase() + ' 转换为 OTF/CFF 轮廓，请改用 TTF/WOFF/WOFF2');
    }
    var options = { type: targetFormat, toBuffer: false };
    if (targetFormat === 'woff') {
      options.deflate = function (input) { return state.pako.deflate(input instanceof Uint8Array ? input : new Uint8Array(input)); };
    }
    if (targetFormat === 'woff2') return encodeWoff2Fast(bytes, woff2Quality);
    return font.write(options);
  }

  function subsetWithFontEditor(fontBuffer, sourceFormat, text, targetFormat, woff2Quality) {
    var input = toArrayBuffer(fontBuffer);
    var codePoints = [];
    var chars = Array.from(new Set(text));
    for (var i = 0; i < chars.length; i++) {
      var cp = chars[i].codePointAt(0);
      if (cp >= 32) codePoints.push(cp);
    }
    var readableFormat = sourceFormat === 'woff2' ? 'woff2' : (sourceFormat === 'otf' ? 'otf' : 'ttf');
    var readTask = readableFormat === 'woff2'
      ? ensureFontForge().then(function (fontforge) { return fontforge.convert(fontBuffer, 'ttf'); }).then(function (ttf) {
          return readFont(toArrayBuffer(ttf), 'ttf');
        })
      : Promise.resolve(readFont(input, readableFormat));
    return readTask.then(function (font) {
      var helper = font.getHelper();
      var keepIndices = new Set(helper.findGlyf({ unicode: codePoints }));
      keepIndices.add(0);
      var glyf = font.get().glyf || [];
      var remove = [];
      for (var j = 0; j < glyf.length; j++) if (!keepIndices.has(j)) remove.push(j);
      helper.removeGlyf(remove);
      font.set(helper.get());
      var writeFormat = targetFormat === 'woff2' || targetFormat === 'otf' ? 'ttf' : targetFormat;
      var writeOptions = { type: writeFormat, toBuffer: false };
      if (writeFormat === 'woff') {
        writeOptions.deflate = function (data) { return state.pako.deflate(new Uint8Array(data)); };
      }
      var written = font.write(writeOptions);
      return written instanceof Uint8Array ? written : toBytes(written);
    });
  }

  function subsetWithHarfbuzz(fontBuffer, text, targetFormat) {
    global.__harfbuzzWasmUrl = harfbuzzUrl();
    return ensureSubsetFont().then(function (subsetFont) {
      return subsetFont(toArrayBuffer(fontBuffer), text, { targetFormat: targetFormat });
    });
  }

  function normalizeFontForSubset(bytes, sourceFormat) {
    if (sourceFormat === 'ttf') return Promise.resolve(toBytes(bytes));
    return ensureFontForge().then(function (fontforge) {
      return fontforge.convert(bytes, 'ttf');
    });
  }

  function encodeSubsetOutput(ttfBytes, targetFormat, woff2Quality) {
    if (targetFormat === 'woff2') return encodeWoff2Fast(ttfBytes, normalizeWoff2Quality(woff2Quality));
    if (targetFormat === 'otf') {
      return ensureFontForge().then(function (fontforge) { return fontforge.convert(ttfBytes, 'otf'); });
    }
    if (targetFormat === 'ttf') return Promise.resolve(ttfBytes);
    return ensureFontEditor().then(function (fe) {
      var font = fe.createFont(toArrayBuffer(ttfBytes), {
        type: 'ttf', hinting: false, kerning: false, compound2simple: false
      });
      var options = { type: targetFormat === 'svg' ? 'ttf' : targetFormat, toBuffer: false };
      if (targetFormat === 'woff') {
        options.deflate = function (data) { return state.pako.deflate(new Uint8Array(data)); };
      }
      var written = font.write(options);
      if (targetFormat === 'svg') return ensureFontForge().then(function (fontforge) {
        return fontforge.convert(written instanceof ArrayBuffer ? new Uint8Array(written) : toBytes(written), 'svg');
      });
      return written instanceof ArrayBuffer ? new Uint8Array(written) : toBytes(written);
    });
  }

  function convert(file, targetFormat, options) {
    options = options || {};
    targetFormat = String(targetFormat || '').toLowerCase();
    return Promise.resolve(readFileBytes(file)).then(function (fileData) {
      return ensureAll().then(function () {
      var start = performance.now();
      var bytes = toArrayBuffer(fileData.buffer);
      var sourceFormat = detectFormat(bytes, fileData.name);
      var output;
      if (sourceFormat === 'ttf' && targetFormat === 'ttf') {
        output = normalizeSfnt(bytes);
      } else if (sourceFormat === 'woff' || sourceFormat === 'woff2' || sourceFormat === 'eot') {
        output = decodeWithFontForge(bytes, sourceFormat, targetFormat);
      } else if (targetFormat === 'otf' || sourceFormat === 'otf' || sourceFormat === 'svg') {
        output = ensureFontForge().then(function (fontforge) {
          return fontforge.convert(bytes, targetFormat);
        });
      } else if (targetFormat === 'woff2' && (sourceFormat === 'ttf' || sourceFormat === 'otf')) {
        output = encodeWoff2Fast(bytes, normalizeWoff2Quality(options.woff2Quality));
      } else {
        output = Promise.resolve(readFont(bytes, sourceFormat)).then(function (font) {
          return writeFont(font, targetFormat, sourceFormat, bytes, normalizeWoff2Quality(options.woff2Quality));
        });
      }
      return Promise.resolve(output).then(function (finalOutput) {
        return makeResult(finalOutput, bytes.byteLength, sourceFormat, targetFormat, {
          originalFilename: fileData.name,
          mimeType: mimeType(targetFormat),
          elapsedTime: Number(((performance.now() - start) / 1000).toFixed(3))
        });
      });
      });
    });
  }

  function compress(file, text, targetFormat, options) {
    options = options || {};
    targetFormat = String(targetFormat || '').toLowerCase();
    return Promise.resolve(readFileBytes(file)).then(function (fileData) {
      return ensureAll().then(function () {
      var start = performance.now();
      var bytes = toArrayBuffer(fileData.buffer);
      var sourceFormat = detectFormat(bytes, fileData.name);
      var uniqueChars = Array.from(new Set(text));
      var output;
      var promise;

      promise = normalizeFontForSubset(bytes, sourceFormat).then(function (ttfBytes) {
        return subsetWithFontEditor(ttfBytes, 'ttf', text, 'ttf', options.woff2Quality)
          .then(function (subsetTtf) { return encodeSubsetOutput(subsetTtf, targetFormat, options.woff2Quality); });
      });

      return promise.then(function (result) {
        output = result;
        var outputBytes = typeof output === 'string' ? new TextEncoder().encode(output) : toBytes(output);
        var ratio = bytes.byteLength ? ((1 - outputBytes.length / bytes.byteLength) * 100).toFixed(2) : '0';
        return makeResult(output, bytes.byteLength, sourceFormat, targetFormat, {
          originalFilename: fileData.name,
          suffix: '_subset',
          mimeType: mimeType(targetFormat),
          charCount: uniqueChars.length,
          compressionRatio: Number(ratio),
          elapsedTime: Number(((performance.now() - start) / 1000).toFixed(3))
        });
      });
      });
    });
  }

  function guessExt(type) {
    if (/woff2/i.test(type)) return '.woff2';
    if (/woff/i.test(type)) return '.woff';
    if (/otf/i.test(type)) return '.otf';
    if (/ttf|truetype/i.test(type)) return '.ttf';
    return '';
  }

  function readFileBytes(file) {
    if (file && file.blob && typeof file.blob.arrayBuffer === 'function') {
      return file.blob.arrayBuffer().then(function (buffer) {
        return { name: file.name || 'font', buffer: buffer };
      });
    }
    if (file && typeof file.arrayBuffer === 'function') {
      return file.arrayBuffer().then(function (buffer) {
        return { name: file.name || 'font', buffer: buffer };
      });
    }
    if (file instanceof ArrayBuffer) {
      return Promise.resolve({ name: 'font', buffer: file });
    }
    if (file && file.buffer) {
      return Promise.resolve({ name: file.name || 'font', buffer: toArrayBuffer(file) });
    }
    return Promise.reject(new TypeError('不支持的字体文件对象'));
  }

  function mimeType(format) {
    var types = {
      ttf: 'font/ttf',
      otf: 'font/otf',
      woff: 'font/woff',
      woff2: 'font/woff2',
      eot: 'application/vnd.ms-fontobject',
      svg: 'image/svg+xml'
    };
    return types[format] || 'application/octet-stream';
  }

  function formatSize(bytes) {
    if (!bytes) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  global.DFontFont = {
    fileFromClipboardItem: function (item) {
      if (!item || typeof item.getType !== 'function') return Promise.reject(new Error('不支持的剪贴板项目'));
      var name = 'pasted-font-' + Date.now();
      var types = Array.prototype.slice.call(item.types || []);
      var fontType = types.find(function (type) {
        return /font|ttf|otf|woff/i.test(type);
      });
      if (!fontType) return Promise.reject(new Error('剪贴板中没有字体文件'));
      return item.getType(fontType).then(function (blob) {
        return { name: name + guessExt(fontType), blob: blob };
      });
    },
    readClipboardFonts: function () {
      if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持读取剪切板，请使用 Chrome/Edge'));
      }
      return navigator.clipboard.read().then(function (items) {
        var tasks = [];
        for (var i = 0; i < items.length; i++) {
          var types = items[i].types || [];
          if (!Array.prototype.some.call(types, function (type) { return /font|ttf|otf|woff/i.test(type); })) continue;
          tasks.push(global.DFontFont.fileFromClipboardItem(items[i]));
        }
        if (!tasks.length) throw new Error('剪贴板中没有字体文件');
        return Promise.all(tasks);
      });
    },
    ensure: ensureAll,
    convert: convert,
    compress: compress,
    detectFormat: function (buffer, filename) { return detectFormat(buffer, filename); },
    svgTextPreview: function (buffer, text, options) {
      options = options || {};
      var svgText = new TextDecoder('utf-8').decode(toBytes(buffer));
      var glyphs = Object.create(null);
      var fontMatch = svgText.match(/<font\b[\s\S]*?<\/font>/i);
      var scope = fontMatch ? fontMatch[0] : svgText;
      var defaults = scope.match(/<font-face\b([^>]*)>/i);
      var unitsPerEm = Number(attrValue(defaults ? defaults[1] : '', 'units-per-em')) || 1000;
      var ascent = Number(attrValue(defaults ? defaults[1] : '', 'ascent')) || unitsPerEm * 0.8;
      var defaultAdvance = Number(attrValue(defaults ? defaults[1] : '', 'horiz-adv-x')) || Number((scope.match(/<font\b[^>]*horiz-adv-x=["'](\d+)/i) || [])[1]) || unitsPerEm * 0.6;
      var regex = /<glyph\b([\s\S]*?)(?:\/>|<\/glyph>)/gi;
      var match;
      while ((match = regex.exec(scope))) {
        var attrs = match[1];
        var codes = attrValue(attrs, 'unicode');
        if (!codes) continue;
        var glyph = {
          d: attrValue(attrs, 'd'),
          advance: Number(attrValue(attrs, 'horiz-adv-x')) || defaultAdvance
        };
        if (!glyph.d) continue;
        for (var i = 0; i < Array.from(codes).length; i++) {
          var code = normalizeUnicode(Array.from(codes)[i]);
          if (code) glyphs[code] = glyph;
        }
      }
      if (!Object.keys(glyphs).length) throw new Error('SVG 字体中没有可用的字形');

      var lines = [];
      var line = '';
      var lineWidth = 0;
      var lineHeight = unitsPerEm * 1.25;
      var maxWidth = options.width || Math.max(lineHeight * 8, unitsPerEm * 6);
      Array.from(text || '').forEach(function (char) {
        var glyph = glyphs[normalizeUnicode(char)];
        if (!glyph) return;
        if (lineWidth + glyph.advance > maxWidth && line) {
          lines.push(line);
          line = '';
          lineWidth = 0;
        }
        line += '<path transform="translate(' + lineWidth + ' 0) scale(1 -1)" d="' + escapeAttr(glyph.d) + '" fill="currentColor"/>';
        lineWidth += glyph.advance;
      });
      if (line) lines.push(line);
      if (!lines.length) throw new Error('预览文字在 SVG 字体中没有对应字形');
      var viewHeight = lines.length * lineHeight;
      return lines.map(function (content, index) {
        var y = ascent + index * lineHeight;
        return '<svg viewBox="0 0 ' + maxWidth + ' ' + viewHeight + '" width="100%" height="' + Math.round(lineHeight) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SVG 字体文字预览"><g transform="translate(0 ' + y + ')">' + content + '</g></svg>';
      }).join('');
    },
    formatSize: formatSize
  };
})(window);
