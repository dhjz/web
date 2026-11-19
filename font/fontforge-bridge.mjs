// SPDX-License-Identifier: GPL-3.0-or-later
// Thin browser bridge around the FontForge WebAssembly conversion engine.
import createModule from './fontforge-core.mjs';

let modulePromise;
const INPUT_EXTENSIONS = new Set([
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'svg', 'pfa', 'pfb', 'ps', 'pt3', 'cff', 't42',
  'otb', 'palm', 'bin', 'dfont', 'suit', 'ttc', 'ufo'
]);
const OUTPUT_FORMATS = new Set([
  'ttf', 'otf', 'woff', 'woff2', 'eot', 'svg',
  'pfa', 'ps', 'pt3', 'cff', 't42', 't11',
  'ufo', 'fon', 'sfd', 'bdf', 'fnt', 'afm', 'pfm', 'tfm'
]);

const FONTFORGE_VERSION = '0.3.0-alpha.1';
const FONTFORGE_CDN_URL = 'https://cdn.jsdelivr.net/gh/premex-ab/fontforge-wasm@v' + FONTFORGE_VERSION + '/dist/fontforge-core.wasm';

async function fetchBinary(url) {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || /text\/html/i.test(contentType)) {
    throw new Error('Failed to load ' + url + ': HTTP ' + response.status);
  }
  return response.arrayBuffer();
}

function loadWasmBinary() {
  const localUrl = new URL('./fontforge-core.wasm', import.meta.url).href;
  return fetchBinary(localUrl).catch(function (localError) {
    const cdnUrl = FONTFORGE_CDN_URL;
    return fetchBinary(cdnUrl).catch(function () {
      throw new Error('本地 FontForge WASM 加载失败，CDN 回退也失败：' + localError.message);
    });
  });
}

function bootstrap() {
  if (!modulePromise) {
    modulePromise = loadWasmBinary().then(function (wasmBinary) {
      return createModule({
        wasmBinary: wasmBinary,
        locateFile: function (name) { return name; },
        print: function () {},
        printErr: function () {}
      });
    }).catch(function (err) {
      modulePromise = undefined;
      throw err;
    });
  }
  return modulePromise;
}

function detectInput(bytes) {
  if (bytes.length < 4) throw new Error('字体文件太小');
  const magic = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  if (magic === 2001684018) return 'woff2';
  const signature = Array.from(bytes.slice(0, 4)).map(function (byte) {
    return String.fromCharCode(byte);
  }).join('');
  if (signature === 'wOFF') return 'woff';
  if (signature === 'OTTO') return 'otf';
  if (signature === 'true' || signature === 'ttcf' || (bytes[0] === 0 && bytes[1] === 1)) return 'ttf';
  if (signature === '%!PS' || signature === 'PFB1') return 'ps';
  const text = new TextDecoder('utf-8').decode(bytes.slice(0, 256)).trimStart().toLowerCase();
  if (text.startsWith('<?xml') || text.startsWith('<svg')) return 'svg';
  return 'ttf';
}

function readFile(module, path) {
  const bytes = module.FS.readFile(path, { encoding: 'binary' });
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function inflateEotWithFontForge(module, bytes) {
  const inputPath = '/input.eot';
  module.FS.writeFile(inputPath, bytes, { encoding: 'binary' });
  if (module.ccall('ff_inflate_raw', 'number', ['string', 'string'], [inputPath, '/decoded.sfnt']) !== 0) {
    throw new Error('无法解码 EOT 字体');
  }
  return readFile(module, '/decoded.sfnt');
}

export async function convert(input, targetFormat) {
  const format = String(targetFormat || '').toLowerCase();
  if (!OUTPUT_FORMATS.has(format)) throw new Error('FontForge 不支持输出 ' + targetFormat);
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (!bytes.length) throw new Error('字体文件为空');
  if (bytes.length > 16 * 1024 * 1024) throw new Error('FontForge 仅支持 16MB 以内的字体文件');

  const module = await bootstrap();
  let sourceFormat = detectInput(bytes);
  let fontBytes = bytes;
  let decodedPath = null;
  if (sourceFormat === 'eot') {
    fontBytes = inflateEotWithFontForge(module, bytes);
  }
  if (!INPUT_EXTENSIONS.has(sourceFormat)) throw new Error('FontForge 不支持输入 ' + sourceFormat);

  const inputPath = '/input.' + (sourceFormat === 'eot' ? 'ttf' : sourceFormat);
  module.FS.writeFile(inputPath, fontBytes, { encoding: 'binary' });
  if (sourceFormat === 'woff' || sourceFormat === 'woff2') {
    if (module.ccall('ff_decode_webfont', 'number', ['string', 'string'], [inputPath, '/decoded.sfnt']) !== 0) {
      throw new Error('无法解码 ' + sourceFormat.toUpperCase() + ' 字体');
    }
    const decoded = readFile(module, '/decoded.sfnt');
    sourceFormat = detectInput(decoded);
    decodedPath = '/decoded.' + sourceFormat;
    module.FS.writeFile(decodedPath, decoded, { encoding: 'binary' });
    module.FS.unlink(inputPath);
  }

  const nativeExtension = format === 'ttc' ? 'ttf' : format;
  const outputPath = '/output.' + nativeExtension;
  const nativeFormats = {
    ttf: 1, otf: 2, woff: 3, woff2: 4, eot: 1, svg: 5,
    pfa: 6, pfb: 7, cff: 8, t42: 9, ps: 10, pt3: 11,
    dfont: 12, suit: 13, bin: 14, ufo: 15, afm: 16, pfm: 17,
    tfm: 18, fon: 19, t11: 20, sfd: 21, bdf: 22, fnt: 23,
    otb: 24, pdb: 25, ttc: 1
  };
  const status = module.ccall('ff_convert', 'number', ['string', 'string', 'number'], [
    decodedPath || inputPath,
    outputPath,
    nativeFormats[format]
  ]);
  if (status !== 0) throw new Error('FontForge 转换失败（状态码 ' + status + '）');
  return readFile(module, outputPath);
}
