(function (global) {
  'use strict';

  var runtimePromise = null;
  var MAX_INPUT_BYTES = 536870912;

  function invalid(message) {
    var err = new Error(message);
    err.code = 'INVALID_INPUT';
    return err;
  }

  function createRuntime(bytes) {
    return WebAssembly.compile(bytes).then(function (module) {
      return WebAssembly.instantiate(module, {
        wasi_snapshot_preview1: {
          proc_exit: function (code) { throw new Error('WASM exited (' + code + ')'); },
          fd_write: function () { return 0; },
          fd_close: function () { return 0; },
          fd_seek: function () { return 0; },
          environ_sizes_get: function () { return 0; },
          environ_get: function () { return 0; }
        },
        env: { emscripten_notify_memory_growth: function () {} }
      });
    }).then(function (instance) {
      var native = instance.exports;
      native._initialize();
      return native;
    });
  }

  function getRuntime() {
    if (runtimePromise) return runtimePromise;
    runtimePromise = fetch('woff2-codec.wasm').then(function (res) {
      if (!res.ok) throw new Error('Failed to load woff2-codec.wasm: HTTP ' + res.status);
      return res.arrayBuffer();
    }).then(createRuntime).catch(function (err) {
      runtimePromise = null;
      throw err;
    });
    return runtimePromise;
  }

  function readUint16(bytes, offset) {
    return (bytes[offset] << 8) | bytes[offset + 1];
  }

  function normalizeSfntTables(input) {
    if (input.length < 12) throw invalid('Truncated SFNT header');
    var view = new DataView(input.buffer, input.byteOffset, input.byteLength);
    var magic = view.getUint32(0);
    if (magic !== 0x00010000 && magic !== 0x4f54544f && magic !== 0x74727565) {
      throw invalid('woff2-codec expects an uncompressed TTF/OTF font');
    }
    var numTables = view.getUint16(4);
    var directoryEnd = 12 + numTables * 16;
    if (!numTables || directoryEnd > input.length) throw invalid('Invalid SFNT table directory');

    var maxpIndex = -1;
    var vheaIndex = -1;
    var tags = [];
    for (var i = 0; i < numTables; i++) {
      var pos = 12 + i * 16;
      var tag = view.getUint32(pos);
      if (tag <= (i ? tags[i - 1] : -1)) throw invalid('SFNT table directory must be sorted with unique tags');
      tags.push(tag);
      if (tag === 0x6d617870) maxpIndex = i;
      if (tag === 0x76686561) vheaIndex = i;
    }
    if (maxpIndex < 0 || vheaIndex < 0) return input;
    var maxpOffset = view.getUint32(12 + maxpIndex * 16 + 8);
    if (maxpOffset + 8 > input.length) throw invalid('Invalid maxp table');
    var numGlyphs = view.getUint16(maxpOffset + 4);
    var vheaOffset = view.getUint32(12 + vheaIndex * 16 + 8);
    if (vheaOffset + 36 > input.length || readUint16(input, vheaOffset + 34) === numGlyphs) return input;

    var fixed = input.slice();
    fixed[vheaOffset + 34] = numGlyphs >> 8;
    fixed[vheaOffset + 35] = numGlyphs & 255;
    return fixed;
  }

  function repairSfntTables(input) {
    var normalized = normalizeSfntTables(input);
    return { bytes: normalized, repaired: normalized !== input };
  }

  function encode(input, options) {
    options = options || {};
    if (!(input instanceof Uint8Array)) {
      if (input instanceof ArrayBuffer) input = new Uint8Array(input);
      else throw invalid('Expected Uint8Array font bytes');
    }
    if (input.byteLength > MAX_INPUT_BYTES) {
      var limit = new Error('Input exceeds ' + MAX_INPUT_BYTES + ' bytes');
      limit.code = 'LIMIT_EXCEEDED';
      throw limit;
    }
    input = normalizeSfntTables(input);
    var quality = options.quality == null ? 11 : Number(options.quality);
    if (!Number.isInteger(quality) || quality < 0 || quality > 11) {
      var optErr = new Error('quality must be an integer from 0 to 11');
      optErr.code = 'INVALID_OPTION';
      throw optErr;
    }
    var allowTransforms = options.allowTransforms !== false ? 1 : 0;
    return getRuntime().then(function (native) {
      var inputPtr = native.malloc(input.length + 4);
      if (!inputPtr) throw new Error('WASM memory allocation failed');
      var heap = new Uint8Array(native.memory.buffer);
      heap.set(input, inputPtr);
      heap.fill(0, inputPtr + input.length, inputPtr + input.length + 4);
      var ptr = native.codec_run(inputPtr, input.length, 1, MAX_INPUT_BYTES, quality, allowTransforms, 0, 0, 0, 0, 0, 15);
      var status = native.codec_status();
      var length = native.codec_size();
      native.free(inputPtr);
      if (status & 255) throw new Error('Native WOFF2 codec rejected input (status ' + (status & 255) + ')');
      return new Uint8Array(native.memory.buffer, ptr, length).slice();
    });
  }

  global.Woff2Codec = { encode: encode, normalize: repairSfntTables };
})(window);
