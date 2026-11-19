"use strict";
var FontEditorCoreModule = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/fonteditor-core/lib/nodejs/buffer.js
  var require_buffer = __commonJS({
    "node_modules/fonteditor-core/lib/nodejs/buffer.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        /**
         * Buffer转换成ArrayBuffer
         *
         * @param {Buffer} buffer 缓冲数组
         * @return {ArrayBuffer}
         */
        toArrayBuffer: function toArrayBuffer(buffer) {
          var length = buffer.length;
          var view = new DataView(new ArrayBuffer(length), 0, length);
          for (var i = 0, l = length; i < l; i++) {
            view.setUint8(i, buffer[i], false);
          }
          return view.buffer;
        },
        /**
         * ArrayBuffer转换成Buffer
         *
         * @param {ArrayBuffer} arrayBuffer 缓冲数组
         * @return {Buffer}
         */
        toBuffer: function toBuffer(arrayBuffer) {
          if (Array.isArray(arrayBuffer)) {
            return Buffer.from(arrayBuffer);
          }
          var length = arrayBuffer.byteLength;
          var view = new DataView(arrayBuffer, 0, length);
          var buffer = Buffer.alloc(length);
          for (var i = 0, l = length; i < l; i++) {
            buffer[i] = view.getUint8(i, false);
          }
          return buffer;
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/common/lang.js
  var require_lang = __commonJS({
    "node_modules/fonteditor-core/lib/common/lang.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.clone = clone;
      exports.curry = curry;
      exports.debounce = debounce;
      exports.equals = equals;
      exports.generic = generic;
      exports.isArray = isArray;
      exports.isDate = isDate;
      exports.isEmptyObject = isEmptyObject;
      exports.isFunction = isFunction;
      exports.isObject = isObject;
      exports.isString = isString;
      exports.overwrite = overwrite;
      exports.throttle = throttle;
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function isArray(obj) {
        return obj != null && toString.call(obj).slice(8, -1) === "Array";
      }
      function isObject(obj) {
        return obj != null && toString.call(obj).slice(8, -1) === "Object";
      }
      function isString(obj) {
        return obj != null && toString.call(obj).slice(8, -1) === "String";
      }
      function isFunction(obj) {
        return obj != null && toString.call(obj).slice(8, -1) === "Function";
      }
      function isDate(obj) {
        return obj != null && toString.call(obj).slice(8, -1) === "Date";
      }
      function isEmptyObject(object) {
        for (var name2 in object) {
          if (object.hasOwnProperty(name2)) {
            return false;
          }
        }
        return true;
      }
      function curry(fn) {
        for (var _len = arguments.length, cargs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          cargs[_key - 1] = arguments[_key];
        }
        return function() {
          for (var _len2 = arguments.length, rargs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            rargs[_key2] = arguments[_key2];
          }
          var args = cargs.concat(rargs);
          return fn.apply(this, args);
        };
      }
      function generic(method) {
        return function() {
          for (var _len3 = arguments.length, fargs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            fargs[_key3] = arguments[_key3];
          }
          return Function.call.apply(method, fargs);
        };
      }
      function overwrite(thisObj, thatObj, fields) {
        if (!thatObj) {
          return thisObj;
        }
        fields = fields || Object.keys(thatObj);
        fields.forEach(function(field) {
          if (thisObj[field] && _typeof(thisObj[field]) === "object" && thatObj[field] && _typeof(thatObj[field]) === "object") {
            overwrite(thisObj[field], thatObj[field]);
          } else {
            thisObj[field] = thatObj[field];
          }
        });
        return thisObj;
      }
      function clone(source) {
        if (!source || _typeof(source) !== "object") {
          return source;
        }
        var cloned = source;
        if (isArray(source)) {
          cloned = source.slice().map(clone);
        } else if (isObject(source) && "isPrototypeOf" in source) {
          cloned = {};
          for (var _i = 0, _Object$keys = Object.keys(source); _i < _Object$keys.length; _i++) {
            var key = _Object$keys[_i];
            cloned[key] = clone(source[key]);
          }
        }
        return cloned;
      }
      function throttle(func, wait) {
        var context;
        var args;
        var timeout;
        var result;
        var previous = 0;
        var later = function later2() {
          previous = /* @__PURE__ */ new Date();
          timeout = null;
          result = func.apply(context, args);
        };
        return function() {
          var now = /* @__PURE__ */ new Date();
          var remaining = wait - (now - previous);
          context = this;
          if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            for (var _len4 = arguments.length, args2 = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args2[_key4] = arguments[_key4];
            }
            result = func.apply(context, args2);
          } else if (!timeout) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
      }
      function debounce(func, wait, immediate) {
        var timeout;
        var result;
        return function() {
          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }
          var context = this;
          var later = function later2() {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        };
      }
      function equals(thisObj, thatObj, fields) {
        if (thisObj === thatObj) {
          return true;
        }
        if (thisObj == null && thatObj == null) {
          return true;
        }
        if (thisObj == null && thatObj != null || thisObj != null && thatObj == null) {
          return false;
        }
        fields = fields || (_typeof(thisObj) === "object" ? Object.keys(thisObj) : []);
        if (!fields.length) {
          return thisObj === thatObj;
        }
        var equal = true;
        for (var i = 0, l = fields.length, field; equal && i < l; i++) {
          field = fields[i];
          if (thisObj[field] && _typeof(thisObj[field]) === "object" && thatObj[field] && _typeof(thatObj[field]) === "object") {
            equal = equal && equals(thisObj[field], thatObj[field]);
          } else {
            equal = equal && thisObj[field] === thatObj[field];
          }
        }
        return equal;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/data/empty.js
  var require_empty = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/data/empty.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        "version": 1,
        "numTables": 10,
        "searchRange": 128,
        "entrySelector": 3,
        "rangeShift": 64,
        "head": {
          "version": 1,
          "fontRevision": 1,
          "checkSumAdjustment": 0,
          "magickNumber": 1594834165,
          "flags": 11,
          "unitsPerEm": 1024,
          "created": 14289408e5,
          "modified": 14289408e5,
          "xMin": 34,
          "yMin": 0,
          "xMax": 306,
          "yMax": 682,
          "macStyle": 0,
          "lowestRecPPEM": 8,
          "fontDirectionHint": 2,
          "indexToLocFormat": 0,
          "glyphDataFormat": 0
        },
        "glyf": [{
          "contours": [[{
            "x": 34,
            "y": 0,
            "onCurve": true
          }, {
            "x": 34,
            "y": 682,
            "onCurve": true
          }, {
            "x": 306,
            "y": 682,
            "onCurve": true
          }, {
            "x": 306,
            "y": 0,
            "onCurve": true
          }], [{
            "x": 68,
            "y": 34,
            "onCurve": true
          }, {
            "x": 272,
            "y": 34,
            "onCurve": true
          }, {
            "x": 272,
            "y": 648,
            "onCurve": true
          }, {
            "x": 68,
            "y": 648,
            "onCurve": true
          }]],
          "xMin": 34,
          "yMin": 0,
          "xMax": 306,
          "yMax": 682,
          "advanceWidth": 374,
          "leftSideBearing": 34,
          "name": ".notdef"
        }],
        "cmap": {},
        "name": {
          "fontFamily": "fonteditor",
          "fontSubFamily": "Medium",
          "uniqueSubFamily": "FontEditor 1.0 : fonteditor",
          "version": "Version 1.0 ; FontEditor (v0.0.1)",
          "postScriptName": "fonteditor",
          "fullName": "fonteditor"
        },
        "hhea": {
          "version": 1,
          "ascent": 812,
          "descent": -212,
          "lineGap": 92,
          "advanceWidthMax": 374,
          "minLeftSideBearing": 34,
          "minRightSideBearing": 68,
          "xMaxExtent": 306,
          "caretSlopeRise": 1,
          "caretSlopeRun": 0,
          "caretOffset": 0,
          "reserved0": 0,
          "reserved1": 0,
          "reserved2": 0,
          "reserved3": 0,
          "metricDataFormat": 0,
          "numOfLongHorMetrics": 1
        },
        "post": {
          "italicAngle": 0,
          "postoints": 65411,
          "underlinePosition": 50,
          "underlineThickness": 0,
          "isFixedPitch": 0,
          "minMemType42": 0,
          "maxMemType42": 0,
          "minMemType1": 0,
          "maxMemType1": 1,
          "format": 2
        },
        "maxp": {
          "version": 1,
          "numGlyphs": 0,
          "maxPoints": 0,
          "maxContours": 0,
          "maxCompositePoints": 0,
          "maxCompositeContours": 0,
          "maxZones": 0,
          "maxTwilightPoints": 0,
          "maxStorage": 0,
          "maxFunctionDefs": 0,
          "maxStackElements": 0,
          "maxSizeOfInstructions": 0,
          "maxComponentElements": 0,
          "maxComponentDepth": 0
        },
        "OS/2": {
          "version": 4,
          "xAvgCharWidth": 1031,
          "usWeightClass": 400,
          "usWidthClass": 5,
          "fsType": 0,
          "ySubscriptXSize": 665,
          "ySubscriptYSize": 716,
          "ySubscriptXOffset": 0,
          "ySubscriptYOffset": 143,
          "ySuperscriptXSize": 665,
          "ySuperscriptYSize": 716,
          "ySuperscriptXOffset": 0,
          "ySuperscriptYOffset": 491,
          "yStrikeoutSize": 51,
          "yStrikeoutPosition": 265,
          "sFamilyClass": 0,
          "bFamilyType": 2,
          "bSerifStyle": 0,
          "bWeight": 6,
          "bProportion": 3,
          "bContrast": 0,
          "bStrokeVariation": 0,
          "bArmStyle": 0,
          "bLetterform": 0,
          "bMidline": 0,
          "bXHeight": 0,
          "ulUnicodeRange1": 1,
          "ulUnicodeRange2": 268435456,
          "ulUnicodeRange3": 0,
          "ulUnicodeRange4": 0,
          "achVendID": "PfEd",
          "fsSelection": 192,
          "usFirstCharIndex": 65535,
          "usLastCharIndex": -1,
          "sTypoAscender": 812,
          "sTypoDescender": -212,
          "sTypoLineGap": 92,
          "usWinAscent": 812,
          "usWinDescent": 212,
          "ulCodePageRange1": 1,
          "ulCodePageRange2": 0,
          "sxHeight": 792,
          "sCapHeight": 0,
          "usDefaultChar": 0,
          "usBreakChar": 32,
          "usMaxContext": 1
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/data/default.js
  var require_default = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/data/default.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        // 默认的字体编码
        fontId: "fonteditor",
        // 默认的名字集合
        name: {
          // 默认的字体家族
          fontFamily: "fonteditor",
          fontSubFamily: "Medium",
          uniqueSubFamily: "FontEditor 1.0 : fonteditor",
          version: "Version 1.0; FontEditor (v1.0)",
          postScriptName: "fonteditor"
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/getEmptyttfObject.js
  var require_getEmptyttfObject = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/getEmptyttfObject.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = getEmpty;
      var _lang = require_lang();
      var _empty = _interopRequireDefault(require_empty());
      var _default = _interopRequireDefault(require_default());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function getEmpty() {
        var ttf = (0, _lang.clone)(_empty.default);
        Object.assign(ttf.name, _default.default.name);
        ttf.head.created = ttf.head.modified = Date.now();
        return ttf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/unicodeName.js
  var require_unicodeName = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/unicodeName.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        0: 1,
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 2,
        10: 1,
        11: 1,
        12: 1,
        13: 2,
        14: 1,
        15: 1,
        16: 1,
        17: 1,
        18: 1,
        19: 1,
        20: 1,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        27: 1,
        28: 1,
        29: 1,
        30: 1,
        31: 1,
        32: 3,
        33: 4,
        34: 5,
        35: 6,
        36: 7,
        37: 8,
        38: 9,
        39: 10,
        40: 11,
        41: 12,
        42: 13,
        43: 14,
        44: 15,
        45: 16,
        46: 17,
        47: 18,
        48: 19,
        49: 20,
        50: 21,
        51: 22,
        52: 23,
        53: 24,
        54: 25,
        55: 26,
        56: 27,
        57: 28,
        58: 29,
        59: 30,
        60: 31,
        61: 32,
        62: 33,
        63: 34,
        64: 35,
        65: 36,
        66: 37,
        67: 38,
        68: 39,
        69: 40,
        70: 41,
        71: 42,
        72: 43,
        73: 44,
        74: 45,
        75: 46,
        76: 47,
        77: 48,
        78: 49,
        79: 50,
        80: 51,
        81: 52,
        82: 53,
        83: 54,
        84: 55,
        85: 56,
        86: 57,
        87: 58,
        88: 59,
        89: 60,
        90: 61,
        91: 62,
        92: 63,
        93: 64,
        94: 65,
        95: 66,
        96: 67,
        97: 68,
        98: 69,
        99: 70,
        100: 71,
        101: 72,
        102: 73,
        103: 74,
        104: 75,
        105: 76,
        106: 77,
        107: 78,
        108: 79,
        109: 80,
        110: 81,
        111: 82,
        112: 83,
        113: 84,
        114: 85,
        115: 86,
        116: 87,
        117: 88,
        118: 89,
        119: 90,
        120: 91,
        121: 92,
        122: 93,
        123: 94,
        124: 95,
        125: 96,
        126: 97,
        160: 172,
        161: 163,
        162: 132,
        163: 133,
        164: 189,
        165: 150,
        166: 232,
        167: 134,
        168: 142,
        169: 139,
        170: 157,
        171: 169,
        172: 164,
        174: 138,
        175: 218,
        176: 131,
        177: 147,
        178: 242,
        179: 243,
        180: 141,
        181: 151,
        182: 136,
        184: 222,
        185: 241,
        186: 158,
        187: 170,
        188: 245,
        189: 244,
        190: 246,
        191: 162,
        192: 173,
        193: 201,
        194: 199,
        195: 174,
        196: 98,
        197: 99,
        198: 144,
        199: 100,
        200: 203,
        201: 101,
        202: 200,
        203: 202,
        204: 207,
        205: 204,
        206: 205,
        207: 206,
        208: 233,
        209: 102,
        210: 211,
        211: 208,
        212: 209,
        213: 175,
        214: 103,
        215: 240,
        216: 145,
        217: 214,
        218: 212,
        219: 213,
        220: 104,
        221: 235,
        222: 237,
        223: 137,
        224: 106,
        225: 105,
        226: 107,
        227: 109,
        228: 108,
        229: 110,
        230: 160,
        231: 111,
        232: 113,
        233: 112,
        234: 114,
        235: 115,
        236: 117,
        237: 116,
        238: 118,
        239: 119,
        240: 234,
        241: 120,
        242: 122,
        243: 121,
        244: 123,
        245: 125,
        246: 124,
        247: 184,
        248: 161,
        249: 127,
        250: 126,
        251: 128,
        252: 129,
        253: 236,
        254: 238,
        255: 186,
        262: 253,
        263: 254,
        268: 255,
        269: 256,
        273: 257,
        286: 248,
        287: 249,
        304: 250,
        305: 215,
        321: 226,
        322: 227,
        338: 176,
        339: 177,
        350: 251,
        351: 252,
        352: 228,
        353: 229,
        376: 187,
        381: 230,
        382: 231,
        402: 166,
        710: 216,
        711: 225,
        728: 219,
        729: 220,
        730: 221,
        731: 224,
        733: 223,
        960: 155,
        8211: 178,
        8212: 179,
        8216: 182,
        8217: 183,
        8218: 196,
        8220: 180,
        8221: 181,
        8222: 197,
        8224: 130,
        8225: 194,
        8226: 135,
        8230: 171,
        8240: 198,
        8249: 190,
        8250: 191,
        8355: 247,
        8482: 140,
        8486: 159,
        8706: 152,
        8710: 168,
        8719: 154,
        8721: 153,
        8722: 239,
        8725: 188,
        8729: 195,
        8730: 165,
        8734: 146,
        8747: 156,
        8776: 167,
        8800: 143,
        8804: 148,
        8805: 149,
        9674: 185,
        61441: 192,
        61442: 193,
        64257: 192,
        64258: 193,
        65535: 0
        // 0xFFFF指向.notdef
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/postName.js
  var require_postName = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/postName.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        0: ".notdef",
        1: ".null",
        2: "nonmarkingreturn",
        3: "space",
        4: "exclam",
        5: "quotedbl",
        6: "numbersign",
        7: "dollar",
        8: "percent",
        9: "ampersand",
        10: "quotesingle",
        11: "parenleft",
        12: "parenright",
        13: "asterisk",
        14: "plus",
        15: "comma",
        16: "hyphen",
        17: "period",
        18: "slash",
        19: "zero",
        20: "one",
        21: "two",
        22: "three",
        23: "four",
        24: "five",
        25: "six",
        26: "seven",
        27: "eight",
        28: "nine",
        29: "colon",
        30: "semicolon",
        31: "less",
        32: "equal",
        33: "greater",
        34: "question",
        35: "at",
        36: "A",
        37: "B",
        38: "C",
        39: "D",
        40: "E",
        41: "F",
        42: "G",
        43: "H",
        44: "I",
        45: "J",
        46: "K",
        47: "L",
        48: "M",
        49: "N",
        50: "O",
        51: "P",
        52: "Q",
        53: "R",
        54: "S",
        55: "T",
        56: "U",
        57: "V",
        58: "W",
        59: "X",
        60: "Y",
        61: "Z",
        62: "bracketleft",
        63: "backslash",
        64: "bracketright",
        65: "asciicircum",
        66: "underscore",
        67: "grave",
        68: "a",
        69: "b",
        70: "c",
        71: "d",
        72: "e",
        73: "f",
        74: "g",
        75: "h",
        76: "i",
        77: "j",
        78: "k",
        79: "l",
        80: "m",
        81: "n",
        82: "o",
        83: "p",
        84: "q",
        85: "r",
        86: "s",
        87: "t",
        88: "u",
        89: "v",
        90: "w",
        91: "x",
        92: "y",
        93: "z",
        94: "braceleft",
        95: "bar",
        96: "braceright",
        97: "asciitilde",
        98: "Adieresis",
        99: "Aring",
        100: "Ccedilla",
        101: "Eacute",
        102: "Ntilde",
        103: "Odieresis",
        104: "Udieresis",
        105: "aacute",
        106: "agrave",
        107: "acircumflex",
        108: "adieresis",
        109: "atilde",
        110: "aring",
        111: "ccedilla",
        112: "eacute",
        113: "egrave",
        114: "ecircumflex",
        115: "edieresis",
        116: "iacute",
        117: "igrave",
        118: "icircumflex",
        119: "idieresis",
        120: "ntilde",
        121: "oacute",
        122: "ograve",
        123: "ocircumflex",
        124: "odieresis",
        125: "otilde",
        126: "uacute",
        127: "ugrave",
        128: "ucircumflex",
        129: "udieresis",
        130: "dagger",
        131: "degree",
        132: "cent",
        133: "sterling",
        134: "section",
        135: "bullet",
        136: "paragraph",
        137: "germandbls",
        138: "registered",
        139: "copyright",
        140: "trademark",
        141: "acute",
        142: "dieresis",
        143: "notequal",
        144: "AE",
        145: "Oslash",
        146: "infinity",
        147: "plusminus",
        148: "lessequal",
        149: "greaterequal",
        150: "yen",
        151: "mu",
        152: "partialdiff",
        153: "summation",
        154: "product",
        155: "pi",
        156: "integral",
        157: "ordfeminine",
        158: "ordmasculine",
        159: "Omega",
        160: "ae",
        161: "oslash",
        162: "questiondown",
        163: "exclamdown",
        164: "logicalnot",
        165: "radical",
        166: "florin",
        167: "approxequal",
        168: "Delta",
        169: "guillemotleft",
        170: "guillemotright",
        171: "ellipsis",
        172: "nonbreakingspace",
        173: "Agrave",
        174: "Atilde",
        175: "Otilde",
        176: "OE",
        177: "oe",
        178: "endash",
        179: "emdash",
        180: "quotedblleft",
        181: "quotedblright",
        182: "quoteleft",
        183: "quoteright",
        184: "divide",
        185: "lozenge",
        186: "ydieresis",
        187: "Ydieresis",
        188: "fraction",
        189: "currency",
        190: "guilsinglleft",
        191: "guilsinglright",
        192: "fi",
        193: "fl",
        194: "daggerdbl",
        195: "periodcentered",
        196: "quotesinglbase",
        197: "quotedblbase",
        198: "perthousand",
        199: "Acircumflex",
        200: "Ecircumflex",
        201: "Aacute",
        202: "Edieresis",
        203: "Egrave",
        204: "Iacute",
        205: "Icircumflex",
        206: "Idieresis",
        207: "Igrave",
        208: "Oacute",
        209: "Ocircumflex",
        210: "apple",
        211: "Ograve",
        212: "Uacute",
        213: "Ucircumflex",
        214: "Ugrave",
        215: "dotlessi",
        216: "circumflex",
        217: "tilde",
        218: "macron",
        219: "breve",
        220: "dotaccent",
        221: "ring",
        222: "cedilla",
        223: "hungarumlaut",
        224: "ogonek",
        225: "caron",
        226: "Lslash",
        227: "lslash",
        228: "Scaron",
        229: "scaron",
        230: "Zcaron",
        231: "zcaron",
        232: "brokenbar",
        233: "Eth",
        234: "eth",
        235: "Yacute",
        236: "yacute",
        237: "Thorn",
        238: "thorn",
        239: "minus",
        240: "multiply",
        241: "onesuperior",
        242: "twosuperior",
        243: "threesuperior",
        244: "onehalf",
        245: "onequarter",
        246: "threequarters",
        247: "franc",
        248: "Gbreve",
        249: "gbreve",
        250: "Idotaccent",
        251: "Scedilla",
        252: "scedilla",
        253: "Cacute",
        254: "cacute",
        255: "Ccaron",
        256: "ccaron",
        257: "dcroat"
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/string.js
  var require_string = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/string.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _unicodeName = _interopRequireDefault(require_unicodeName());
      var _postName = _interopRequireDefault(require_postName());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function stringify(str) {
        if (!str) {
          return str;
        }
        var newStr = "";
        for (var i = 0, l = str.length, ch; i < l; i++) {
          ch = str.charCodeAt(i);
          if (ch === 0) {
            continue;
          }
          newStr += String.fromCharCode(ch);
        }
        return newStr;
      }
      var _default = exports.default = {
        stringify,
        /**
         * 将双字节编码字符转换成`\uxxxx`形式
         *
         * @param {string} str str字符串
         * @return {string} 转换后字符串
         */
        escape: function(_escape) {
          function escape2(_x) {
            return _escape.apply(this, arguments);
          }
          escape2.toString = function() {
            return _escape.toString();
          };
          return escape2;
        }(function(str) {
          if (!str) {
            return str;
          }
          return String(str).replace(/[\uff-\uffff]/g, function(c) {
            return escape(c).replace("%", "\\");
          });
        }),
        /**
         * bytes to string
         *
         * @param  {Array} bytes 字节数组
         * @return {string}       string
         */
        getString: function getString(bytes) {
          var s = "";
          for (var i = 0, l = bytes.length; i < l; i++) {
            s += String.fromCharCode(bytes[i]);
          }
          return s;
        },
        /**
         * 获取unicode的名字值
         *
         * @param {number} unicode unicode
         * @return {string} 名字
         */
        getUnicodeName: function getUnicodeName(unicode) {
          var unicodeNameIndex = _unicodeName.default[unicode];
          if (void 0 !== unicodeNameIndex) {
            return _postName.default[unicodeNameIndex];
          }
          return "uni" + unicode.toString(16).toUpperCase();
        },
        /**
         * 转换成utf8的字节数组
         *
         * @param {string} str 字符串
         * @return {Array.<byte>} 字节数组
         */
        toUTF8Bytes: function toUTF8Bytes(str) {
          str = stringify(str);
          var byteArray = [];
          for (var i = 0, l = str.length; i < l; i++) {
            if (str.charCodeAt(i) <= 127) {
              byteArray.push(str.charCodeAt(i));
            } else {
              var codePoint = str.codePointAt(i);
              if (codePoint > 65535) {
                i++;
              }
              var h = encodeURIComponent(String.fromCodePoint(codePoint)).slice(1).split("%");
              for (var j = 0; j < h.length; j++) {
                byteArray.push(parseInt(h[j], 16));
              }
            }
          }
          return byteArray;
        },
        /**
         * 转换成usc2的字节数组
         *
         * @param {string} str 字符串
         * @return {Array.<byte>} 字节数组
         */
        toUCS2Bytes: function toUCS2Bytes(str) {
          str = stringify(str);
          var byteArray = [];
          for (var i = 0, l = str.length, ch; i < l; i++) {
            ch = str.charCodeAt(i);
            byteArray.push(ch >> 8);
            byteArray.push(ch & 255);
          }
          return byteArray;
        },
        /**
         * 获取pascal string 字节数组
         *
         * @param {string} str 字符串
         * @return {Array.<byte>} byteArray byte数组
         */
        toPascalStringBytes: function toPascalStringBytes(str) {
          var bytes = [];
          var length = str ? str.length < 256 ? str.length : 255 : 0;
          bytes.push(length);
          for (var i = 0, l = str.length; i < l; i++) {
            var c = str.charCodeAt(i);
            bytes.push(c < 128 ? c : 42);
          }
          return bytes;
        },
        /**
         * utf8字节转字符串
         *
         * @param {Array} bytes 字节
         * @return {string} 字符串
         */
        getUTF8String: function getUTF8String(bytes) {
          var str = "";
          for (var i = 0, l = bytes.length; i < l; i++) {
            if (bytes[i] < 127) {
              str += String.fromCharCode(bytes[i]);
            } else {
              str += "%" + (256 + bytes[i]).toString(16).slice(1);
            }
          }
          return unescape(str);
        },
        /**
         * ucs2字节转字符串
         *
         * @param {Array} bytes 字节
         * @return {string} 字符串
         */
        getUCS2String: function getUCS2String(bytes) {
          var str = "";
          for (var i = 0, l = bytes.length; i < l; i += 2) {
            str += String.fromCharCode((bytes[i] << 8) + bytes[i + 1]);
          }
          return str;
        },
        /**
         * 读取 pascal string
         *
         * @param {Array.<byte>} byteArray byte数组
         * @return {Array.<string>} 读取后的字符串数组
         */
        getPascalString: function getPascalString(byteArray) {
          var strArray = [];
          var i = 0;
          var l = byteArray.length;
          while (i < l) {
            var strLength = byteArray[i++];
            var str = "";
            while (strLength-- > 0 && i < l) {
              str += String.fromCharCode(byteArray[i++]);
            }
            str = stringify(str);
            strArray.push(str);
          }
          return strArray;
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathAdjust.js
  var require_pathAdjust = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathAdjust.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = pathAdjust;
      function pathAdjust(contour, scaleX, scaleY, offsetX, offsetY) {
        scaleX = scaleX === void 0 ? 1 : scaleX;
        scaleY = scaleY === void 0 ? 1 : scaleY;
        var x = offsetX || 0;
        var y = offsetY || 0;
        var p;
        for (var i = 0, l = contour.length; i < l; i++) {
          p = contour[i];
          p.x = scaleX * (p.x + x);
          p.y = scaleY * (p.y + y);
        }
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathCeil.js
  var require_pathCeil = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathCeil.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = pathCeil;
      function pathCeil(contour, point) {
        var p;
        for (var i = 0, l = contour.length; i < l; i++) {
          p = contour[i];
          if (!point) {
            p.x = Math.round(p.x);
            p.y = Math.round(p.y);
          } else {
            p.x = Number(p.x.toFixed(point));
            p.y = Number(p.y.toFixed(point));
          }
        }
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathIterator.js
  var require_pathIterator = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathIterator.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = pathIterator;
      function pathIterator(contour, callBack) {
        var curPoint;
        var prevPoint;
        var nextPoint;
        var cursorPoint;
        for (var i = 0, l = contour.length; i < l; i++) {
          curPoint = contour[i];
          prevPoint = i === 0 ? contour[l - 1] : contour[i - 1];
          nextPoint = i === l - 1 ? contour[0] : contour[i + 1];
          if (i === 0) {
            if (curPoint.onCurve) {
              cursorPoint = curPoint;
            } else if (prevPoint.onCurve) {
              cursorPoint = prevPoint;
            } else {
              cursorPoint = {
                x: (prevPoint.x + curPoint.x) / 2,
                y: (prevPoint.y + curPoint.y) / 2
              };
            }
          }
          if (curPoint.onCurve && nextPoint.onCurve) {
            if (false === callBack("L", curPoint, nextPoint, 0, i)) {
              break;
            }
            cursorPoint = nextPoint;
          } else if (!curPoint.onCurve) {
            if (nextPoint.onCurve) {
              if (false === callBack("Q", cursorPoint, curPoint, nextPoint, i)) {
                break;
              }
              cursorPoint = nextPoint;
            } else {
              var last = {
                x: (curPoint.x + nextPoint.x) / 2,
                y: (curPoint.y + nextPoint.y) / 2
              };
              if (false === callBack("Q", cursorPoint, curPoint, last, i)) {
                break;
              }
              cursorPoint = last;
            }
          }
        }
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/computeBoundingBox.js
  var require_computeBoundingBox = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/computeBoundingBox.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.computePath = exports.computeBounding = void 0;
      exports.computePathBox = computePathBox;
      exports.quadraticBezier = void 0;
      var _pathIterator = _interopRequireDefault(require_pathIterator());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function computeBoundingBox(points) {
        if (points.length === 0) {
          return false;
        }
        var left = points[0].x;
        var right = points[0].x;
        var top = points[0].y;
        var bottom = points[0].y;
        for (var i = 1; i < points.length; i++) {
          var p = points[i];
          if (p.x < left) {
            left = p.x;
          }
          if (p.x > right) {
            right = p.x;
          }
          if (p.y < top) {
            top = p.y;
          }
          if (p.y > bottom) {
            bottom = p.y;
          }
        }
        return {
          x: left,
          y: top,
          width: right - left,
          height: bottom - top
        };
      }
      function computeQuadraticBezierBoundingBox(p0, p1, p2) {
        var tmp = p0.x + p2.x - 2 * p1.x;
        var t1;
        if (tmp === 0) {
          t1 = 0.5;
        } else {
          t1 = (p0.x - p1.x) / tmp;
        }
        tmp = p0.y + p2.y - 2 * p1.y;
        var t2;
        if (tmp === 0) {
          t2 = 0.5;
        } else {
          t2 = (p0.y - p1.y) / tmp;
        }
        t1 = Math.max(Math.min(t1, 1), 0);
        t2 = Math.max(Math.min(t2, 1), 0);
        var ct1 = 1 - t1;
        var ct2 = 1 - t2;
        var x1 = ct1 * ct1 * p0.x + 2 * ct1 * t1 * p1.x + t1 * t1 * p2.x;
        var y1 = ct1 * ct1 * p0.y + 2 * ct1 * t1 * p1.y + t1 * t1 * p2.y;
        var x2 = ct2 * ct2 * p0.x + 2 * ct2 * t2 * p1.x + t2 * t2 * p2.x;
        var y2 = ct2 * ct2 * p0.y + 2 * ct2 * t2 * p1.y + t2 * t2 * p2.y;
        return computeBoundingBox([p0, p2, {
          x: x1,
          y: y1
        }, {
          x: x2,
          y: y2
        }]);
      }
      function computePathBoundingBox() {
        var points = [];
        var iterator = function iterator2(c, p0, p1, p2) {
          if (c === "L") {
            points.push(p0);
            points.push(p1);
          } else if (c === "Q") {
            var bound = computeQuadraticBezierBoundingBox(p0, p1, p2);
            points.push(bound);
            points.push({
              x: bound.x + bound.width,
              y: bound.y + bound.height
            });
          }
        };
        if (arguments.length === 1) {
          (0, _pathIterator.default)(arguments.length <= 0 ? void 0 : arguments[0], function(c, p0, p1, p2) {
            if (c === "L") {
              points.push(p0);
              points.push(p1);
            } else if (c === "Q") {
              var bound = computeQuadraticBezierBoundingBox(p0, p1, p2);
              points.push(bound);
              points.push({
                x: bound.x + bound.width,
                y: bound.y + bound.height
              });
            }
          });
        } else {
          for (var i = 0, l = arguments.length; i < l; i++) {
            (0, _pathIterator.default)(i < 0 || arguments.length <= i ? void 0 : arguments[i], iterator);
          }
        }
        return computeBoundingBox(points);
      }
      function computePathBox() {
        var points = [];
        if (arguments.length === 1) {
          points = arguments.length <= 0 ? void 0 : arguments[0];
        } else {
          for (var i = 0, l = arguments.length; i < l; i++) {
            Array.prototype.splice.apply(points, [points.length, 0].concat(i < 0 || arguments.length <= i ? void 0 : arguments[i]));
          }
        }
        return computeBoundingBox(points);
      }
      var computeBounding = exports.computeBounding = computeBoundingBox;
      var quadraticBezier = exports.quadraticBezier = computeQuadraticBezierBoundingBox;
      var computePath = exports.computePath = computePathBoundingBox;
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathTransform.js
  var require_pathTransform = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathTransform.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = transform;
      function transform(contour, a, b, c, d, e, f) {
        var x;
        var y;
        var p;
        for (var i = 0, l = contour.length; i < l; i++) {
          p = contour[i];
          x = p.x;
          y = p.y;
          p.x = x * a + y * c + e;
          p.y = x * b + y * d + f;
        }
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/transformGlyfContours.js
  var require_transformGlyfContours = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/transformGlyfContours.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = transformGlyfContours;
      var _pathCeil = _interopRequireDefault(require_pathCeil());
      var _pathTransform = _interopRequireDefault(require_pathTransform());
      var _lang = require_lang();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function transformGlyfContours(glyf, ttf) {
        var contoursList = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var glyfIndex = arguments.length > 3 ? arguments[3] : void 0;
        if (!glyf.glyfs) {
          return glyf;
        }
        var compoundContours = [];
        glyf.glyfs.forEach(function(g) {
          var glyph = ttf.glyf[g.glyphIndex];
          if (!glyph || glyph === glyf) {
            return;
          }
          if (glyph.compound && !contoursList[g.glyphIndex]) {
            transformGlyfContours(glyph, ttf, contoursList, g.glyphIndex);
          }
          var contours = (0, _lang.clone)(glyph.compound ? contoursList[g.glyphIndex] || [] : glyph.contours);
          var transform = g.transform;
          for (var i = 0, l = contours.length; i < l; i++) {
            (0, _pathTransform.default)(contours[i], transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
            compoundContours.push((0, _pathCeil.default)(contours[i]));
          }
        });
        if (null != glyfIndex) {
          contoursList[glyfIndex] = compoundContours;
        }
        return compoundContours;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/compound2simple.js
  var require_compound2simple = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/compound2simple.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = compound2simple;
      function compound2simple(glyf, contours) {
        glyf.contours = contours;
        delete glyf.compound;
        delete glyf.glyfs;
        delete glyf.instructions;
        return glyf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/compound2simpleglyf.js
  var require_compound2simpleglyf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/compound2simpleglyf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = compound2simpleglyf;
      var _transformGlyfContours = _interopRequireDefault(require_transformGlyfContours());
      var _compound2simple = _interopRequireDefault(require_compound2simple());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function compound2simpleglyf(glyf, ttf, recrusive) {
        var glyfIndex;
        if (typeof glyf === "number") {
          glyfIndex = glyf;
          glyf = ttf.glyf[glyfIndex];
        } else {
          glyfIndex = ttf.glyf.indexOf(glyf);
          if (-1 === glyfIndex) {
            return glyf;
          }
        }
        if (!glyf.compound || !glyf.glyfs) {
          return glyf;
        }
        var contoursList = {};
        (0, _transformGlyfContours.default)(glyf, ttf, contoursList, glyfIndex);
        if (recrusive) {
          Object.keys(contoursList).forEach(function(index) {
            (0, _compound2simple.default)(ttf.glyf[index], contoursList[index]);
          });
        } else {
          (0, _compound2simple.default)(glyf, contoursList[glyfIndex]);
        }
        return glyf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/glyfAdjust.js
  var require_glyfAdjust = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/glyfAdjust.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = glyfAdjust;
      var _pathAdjust = _interopRequireDefault(require_pathAdjust());
      var _pathCeil = _interopRequireDefault(require_pathCeil());
      var _computeBoundingBox = require_computeBoundingBox();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function glyfAdjust(g) {
        var scaleX = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        var scaleY = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        var offsetX = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
        var offsetY = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
        var useCeil = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : true;
        if (g.contours && g.contours.length) {
          if (scaleX !== 1 || scaleY !== 1) {
            g.contours.forEach(function(contour) {
              (0, _pathAdjust.default)(contour, scaleX, scaleY);
            });
          }
          if (offsetX !== 0 || offsetY !== 0) {
            g.contours.forEach(function(contour) {
              (0, _pathAdjust.default)(contour, 1, 1, offsetX, offsetY);
            });
          }
          if (false !== useCeil) {
            g.contours.forEach(function(contour) {
              (0, _pathCeil.default)(contour);
            });
          }
        }
        var advanceWidth = g.advanceWidth;
        if (void 0 === g.xMin || void 0 === g.yMax || void 0 === g.leftSideBearing || void 0 === g.advanceWidth) {
          var bound;
          if (g.contours && g.contours.length) {
            bound = _computeBoundingBox.computePathBox.apply(this, g.contours);
          } else {
            bound = {
              x: 0,
              y: 0,
              width: 0,
              height: 0
            };
          }
          g.xMin = bound.x;
          g.xMax = bound.x + bound.width;
          g.yMin = bound.y;
          g.yMax = bound.y + bound.height;
          g.leftSideBearing = g.xMin;
          if (void 0 !== advanceWidth) {
            g.advanceWidth = Math.round(advanceWidth * scaleX + offsetX);
          } else {
            g.advanceWidth = g.xMax + Math.abs(g.xMin);
          }
        } else {
          g.xMin = Math.round(g.xMin * scaleX + offsetX);
          g.xMax = Math.round(g.xMax * scaleX + offsetX);
          g.yMin = Math.round(g.yMin * scaleY + offsetY);
          g.yMax = Math.round(g.yMax * scaleY + offsetY);
          g.leftSideBearing = Math.round(g.leftSideBearing * scaleX + offsetX);
          g.advanceWidth = Math.round(advanceWidth * scaleX + offsetX);
        }
        return g;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/reducePath.js
  var require_reducePath = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/reducePath.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = reducePath;
      function redundant(prev, p, next) {
        if ((p.onCurve && next.onCurve || !p.onCurve && !next.onCurve) && Math.pow(p.x - next.x, 2) + Math.pow(p.y - next.y, 2) <= 1) {
          return true;
        }
        if (p.onCurve && prev.onCurve && next.onCurve && Math.abs((next.y - p.y) * (prev.x - p.x) - (prev.y - p.y) * (next.x - p.x)) <= 1e-3) {
          return true;
        }
        if (!p.onCurve && prev.onCurve && next.onCurve && Math.abs((next.y - p.y) * (prev.x - p.x) - (prev.y - p.y) * (next.x - p.x)) <= 1e-3) {
          return true;
        }
        return false;
      }
      function reducePath(contour) {
        if (!contour.length) {
          return contour;
        }
        var prev;
        var next;
        var p;
        for (var i = contour.length - 1, last = i; i >= 0; i--) {
          p = contour[i];
          next = i === last ? contour[0] : contour[i + 1];
          prev = i === 0 ? contour[last] : contour[i - 1];
          if (redundant(prev, p, next)) {
            contour.splice(i, 1);
            last--;
            continue;
          }
        }
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/reduceGlyf.js
  var require_reduceGlyf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/reduceGlyf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = reduceGlyf;
      var _reducePath = _interopRequireDefault(require_reducePath());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function reduceGlyf(glyf) {
        var contours = glyf.contours;
        var contour;
        for (var j = contours.length - 1; j >= 0; j--) {
          contour = (0, _reducePath.default)(contours[j]);
          if (contour.length <= 2) {
            contours.splice(j, 1);
            continue;
          }
        }
        if (0 === glyf.contours.length) {
          delete glyf.contours;
        }
        return glyf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/optimizettf.js
  var require_optimizettf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/optimizettf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = optimizettf;
      var _reduceGlyf = _interopRequireDefault(require_reduceGlyf());
      var _pathCeil = _interopRequireDefault(require_pathCeil());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function optimizettf(ttf) {
        var checkUnicodeRepeat = {};
        var repeatList = [];
        ttf.glyf.forEach(function(glyf, index) {
          if (glyf.unicode) {
            glyf.unicode = glyf.unicode.sort();
            glyf.unicode.sort(function(a, b) {
              return a - b;
            }).forEach(function(u) {
              if (checkUnicodeRepeat[u]) {
                repeatList.push(index);
              } else {
                checkUnicodeRepeat[u] = true;
              }
            });
          }
          if (!glyf.compound && glyf.contours) {
            glyf.contours.forEach(function(contour) {
              (0, _pathCeil.default)(contour);
            });
            (0, _reduceGlyf.default)(glyf);
          }
          glyf.xMin = Math.round(glyf.xMin || 0);
          glyf.xMax = Math.round(glyf.xMax || 0);
          glyf.yMin = Math.round(glyf.yMin || 0);
          glyf.yMax = Math.round(glyf.yMax || 0);
          glyf.leftSideBearing = Math.round(glyf.leftSideBearing || 0);
          glyf.advanceWidth = Math.round(glyf.advanceWidth || 0);
        });
        if (!ttf.glyf.some(function(a) {
          return a.compound;
        })) {
          ttf.glyf = ttf.glyf.filter(function(glyf, index) {
            return index === 0 || glyf.contours && glyf.contours.length;
          });
        }
        if (!repeatList.length) {
          return true;
        }
        return {
          repeat: repeatList
        };
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf.js
  var require_ttf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf.js"(exports) {
      "use strict";
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _lang = require_lang();
      var _string = _interopRequireDefault(require_string());
      var _pathAdjust = _interopRequireDefault(require_pathAdjust());
      var _pathCeil = _interopRequireDefault(require_pathCeil());
      var _computeBoundingBox = require_computeBoundingBox();
      var _compound2simpleglyf = _interopRequireDefault(require_compound2simpleglyf());
      var _glyfAdjust = _interopRequireDefault(require_glyfAdjust());
      var _optimizettf = _interopRequireDefault(require_optimizettf());
      var _default = _interopRequireDefault(require_default());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function adjustToEmBox(glyfList, ascent, descent, adjustToEmPadding) {
        glyfList.forEach(function(g) {
          if (g.contours && g.contours.length) {
            var rightSideBearing = g.advanceWidth - g.xMax;
            var bound = _computeBoundingBox.computePath.apply(void 0, _toConsumableArray(g.contours));
            var scale = (ascent - descent - adjustToEmPadding) / bound.height;
            var center = (ascent + descent) / 2;
            var yOffset = center - (bound.y + bound.height / 2) * scale;
            g.contours.forEach(function(contour) {
              if (scale !== 1) {
                (0, _pathAdjust.default)(contour, scale, scale);
              }
              (0, _pathAdjust.default)(contour, 1, 1, 0, yOffset);
              (0, _pathCeil.default)(contour);
            });
            var box = _computeBoundingBox.computePathBox.apply(void 0, _toConsumableArray(g.contours));
            g.xMin = box.x;
            g.xMax = box.x + box.width;
            g.yMin = box.y;
            g.yMax = box.y + box.height;
            g.leftSideBearing = g.xMin;
            g.advanceWidth = g.xMax + rightSideBearing;
          }
        });
        return glyfList;
      }
      function adjustPos(glyfList, leftSideBearing, rightSideBearing, verticalAlign) {
        var changed = false;
        if (null != leftSideBearing) {
          changed = true;
          glyfList.forEach(function(g) {
            if (g.leftSideBearing !== leftSideBearing) {
              (0, _glyfAdjust.default)(g, 1, 1, leftSideBearing - g.leftSideBearing);
            }
          });
        }
        if (null != rightSideBearing) {
          changed = true;
          glyfList.forEach(function(g) {
            g.advanceWidth = g.xMax + rightSideBearing;
          });
        }
        if (null != verticalAlign) {
          changed = true;
          glyfList.forEach(function(g) {
            if (g.contours && g.contours.length) {
              var bound = _computeBoundingBox.computePath.apply(void 0, _toConsumableArray(g.contours));
              var offset = verticalAlign - bound.y;
              (0, _glyfAdjust.default)(g, 1, 1, 0, offset);
            }
          });
        }
        return changed ? glyfList : [];
      }
      function merge(ttf, imported) {
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
          scale: true
        };
        var list = imported.glyf.filter(function(g) {
          return (
            // 简单轮廓
            g.contours && g.contours.length && g.name !== ".notdef" && g.name !== ".null" && g.name !== "nonmarkingreturn"
          );
        });
        if (options.adjustGlyf) {
          var ascent = ttf.hhea.ascent;
          var descent = ttf.hhea.descent;
          var adjustToEmPadding = 16;
          adjustPos(list, 16, 16);
          adjustToEmBox(list, ascent, descent, adjustToEmPadding);
          list.forEach(function(g) {
            ttf.glyf.push(g);
          });
        } else if (options.scale) {
          var scale = 1;
          if (imported.head.unitsPerEm && imported.head.unitsPerEm !== ttf.head.unitsPerEm) {
            scale = ttf.head.unitsPerEm / imported.head.unitsPerEm;
          }
          list.forEach(function(g) {
            (0, _glyfAdjust.default)(g, scale, scale);
            ttf.glyf.push(g);
          });
        }
        return list;
      }
      var TTF = exports.default = /* @__PURE__ */ function() {
        function TTF2(ttf) {
          _classCallCheck(this, TTF2);
          this.ttf = ttf;
        }
        return _createClass(TTF2, [{
          key: "codes",
          value: function codes() {
            return Object.keys(this.ttf.cmap);
          }
          /**
           * 根据编码获取字形索引
           *
           * @param {string} c 字符或者字符编码
           *
           * @return {?number} 返回glyf索引号
           */
        }, {
          key: "getGlyfIndexByCode",
          value: function getGlyfIndexByCode(c) {
            var charCode = typeof c === "number" ? c : c.codePointAt(0);
            var glyfIndex = this.ttf.cmap[charCode] || -1;
            return glyfIndex;
          }
          /**
           * 根据索引获取字形
           *
           * @param {number} glyfIndex glyf的索引
           *
           * @return {?Object} 返回glyf对象
           */
        }, {
          key: "getGlyfByIndex",
          value: function getGlyfByIndex(glyfIndex) {
            var glyfList = this.ttf.glyf;
            var glyf = glyfList[glyfIndex];
            return glyf;
          }
          /**
           * 根据编码获取字形
           *
           * @param {string} c 字符或者字符编码
           *
           * @return {?Object} 返回glyf对象
           */
        }, {
          key: "getGlyfByCode",
          value: function getGlyfByCode(c) {
            var glyfIndex = this.getGlyfIndexByCode(c);
            return this.getGlyfByIndex(glyfIndex);
          }
          /**
           * 设置ttf对象
           *
           * @param {Object} ttf ttf对象
           * @return {this}
           */
        }, {
          key: "set",
          value: function set(ttf) {
            this.ttf = ttf;
            return this;
          }
          /**
           * 获取ttf对象
           *
           * @return {ttfObject} ttf ttf对象
           */
        }, {
          key: "get",
          value: function get() {
            return this.ttf;
          }
          /**
           * 添加glyf
           *
           * @param {Object} glyf glyf对象
           *
           * @return {number} 添加的glyf
           */
        }, {
          key: "addGlyf",
          value: function addGlyf(glyf) {
            return this.insertGlyf(glyf);
          }
          /**
           * 插入glyf
           *
           * @param {Object} glyf glyf对象
           * @param {Object} insertIndex 插入的索引
           * @return {number} 添加的glyf
           */
        }, {
          key: "insertGlyf",
          value: function insertGlyf(glyf, insertIndex) {
            if (insertIndex >= 0 && insertIndex < this.ttf.glyf.length) {
              this.ttf.glyf.splice(insertIndex, 0, glyf);
            } else {
              this.ttf.glyf.push(glyf);
            }
            return [glyf];
          }
          /**
           * 合并两个ttfObject，此处仅合并简单字形
           *
           * @param {Object} imported ttfObject
           * @param {Object} options 参数选项
           * @param {boolean} options.scale 是否自动缩放
           * @param {boolean} options.adjustGlyf 是否调整字形以适应边界
           *                                     (和 options.scale 参数互斥)
           *
           * @return {Array} 添加的glyf
           */
        }, {
          key: "mergeGlyf",
          value: function mergeGlyf(imported, options) {
            var list = merge(this.ttf, imported, options);
            return list;
          }
          /**
           * 删除指定字形
           *
           * @param {Array} indexList 索引列表
           * @return {Array} 删除的glyf
           */
        }, {
          key: "removeGlyf",
          value: function removeGlyf(indexList) {
            var glyf = this.ttf.glyf;
            var removed = [];
            for (var i = glyf.length - 1; i >= 0; i--) {
              if (indexList.indexOf(i) >= 0) {
                removed.push(glyf[i]);
                glyf.splice(i, 1);
              }
            }
            return removed;
          }
          /**
           * 设置unicode代码
           *
           * @param {string} unicode unicode代码 $E021, $22
           * @param {Array=} indexList 索引列表
           * @param {boolean} isGenerateName 是否生成name
           * @return {Array} 改变的glyf
           */
        }, {
          key: "setUnicode",
          value: function setUnicode(unicode, indexList, isGenerateName) {
            var glyf = this.ttf.glyf;
            var list = [];
            if (indexList && indexList.length) {
              var first = indexList.indexOf(0);
              if (first >= 0) {
                indexList.splice(first, 1);
              }
              list = indexList.map(function(item) {
                return glyf[item];
              });
            } else {
              list = glyf.slice(1);
            }
            if (list.length > 1) {
              var less32 = function less322(u) {
                return u < 33;
              };
              list = list.filter(function(g) {
                return !g.unicode || !g.unicode.some(less32);
              });
            }
            if (list.length) {
              unicode = Number("0x" + unicode.slice(1));
              list.forEach(function(g) {
                if (unicode === 160 || unicode === 12288) {
                  unicode++;
                }
                g.unicode = [unicode];
                if (isGenerateName) {
                  g.name = _string.default.getUnicodeName(unicode);
                }
                unicode++;
              });
            }
            return list;
          }
          /**
           * 生成字形名称
           *
           * @param {Array=} indexList 索引列表
           * @return {Array} 改变的glyf
           */
        }, {
          key: "genGlyfName",
          value: function genGlyfName(indexList) {
            var glyf = this.ttf.glyf;
            var list = [];
            if (indexList && indexList.length) {
              list = indexList.map(function(item) {
                return glyf[item];
              });
            } else {
              list = glyf;
            }
            if (list.length) {
              var first = this.ttf.glyf[0];
              list.forEach(function(g) {
                if (g === first) {
                  g.name = ".notdef";
                } else if (g.unicode && g.unicode.length) {
                  g.name = _string.default.getUnicodeName(g.unicode[0]);
                } else {
                  g.name = ".notdef";
                }
              });
            }
            return list;
          }
          /**
           * 清除字形名称
           *
           * @param {Array=} indexList 索引列表
           * @return {Array} 改变的glyf
           */
        }, {
          key: "clearGlyfName",
          value: function clearGlyfName(indexList) {
            var glyf = this.ttf.glyf;
            var list = [];
            if (indexList && indexList.length) {
              list = indexList.map(function(item) {
                return glyf[item];
              });
            } else {
              list = glyf;
            }
            if (list.length) {
              list.forEach(function(g) {
                delete g.name;
              });
            }
            return list;
          }
          /**
           * 添加并体替换指定的glyf
           *
           * @param {Array} glyfList 添加的列表
           * @param {Array=} indexList 需要替换的索引列表
           * @return {Array} 改变的glyf
           */
        }, {
          key: "appendGlyf",
          value: function appendGlyf(glyfList, indexList) {
            var glyf = this.ttf.glyf;
            var result = glyfList.slice(0);
            if (indexList && indexList.length) {
              var l = Math.min(glyfList.length, indexList.length);
              for (var i = 0; i < l; i++) {
                glyf[indexList[i]] = glyfList[i];
              }
              glyfList = glyfList.slice(l);
            }
            if (glyfList.length) {
              Array.prototype.splice.apply(glyf, [glyf.length, 0].concat(_toConsumableArray(glyfList)));
            }
            return result;
          }
          /**
           * 调整glyf位置
           *
           * @param {Array=} indexList 索引列表
           * @param {Object} setting 选项
           * @param {number=} setting.leftSideBearing 左边距
           * @param {number=} setting.rightSideBearing 右边距
           * @param {number=} setting.verticalAlign 垂直对齐
           * @return {Array} 改变的glyf
           */
        }, {
          key: "adjustGlyfPos",
          value: function adjustGlyfPos(indexList, setting) {
            var glyfList = this.getGlyf(indexList);
            return adjustPos(glyfList, setting.leftSideBearing, setting.rightSideBearing, setting.verticalAlign);
          }
          /**
           * 调整glyf
           *
           * @param {Array=} indexList 索引列表
           * @param {Object} setting 选项
           * @param {boolean=} setting.reverse 字形反转操作
           * @param {boolean=} setting.mirror 字形镜像操作
           * @param {number=} setting.scale 字形缩放
           * @param {boolean=} setting.adjustToEmBox  是否调整字形到 em 框
           * @param {number=} setting.adjustToEmPadding 调整到 em 框的留白
           * @return {boolean}
           */
        }, {
          key: "adjustGlyf",
          value: function adjustGlyf(indexList, setting) {
            var glyfList = this.getGlyf(indexList);
            var changed = false;
            setting.adjustToEmBox = setting.ajdustToEmBox || setting.adjustToEmBox;
            setting.adjustToEmPadding = setting.ajdustToEmPadding || setting.adjustToEmPadding;
            if (setting.reverse || setting.mirror) {
              changed = true;
              glyfList.forEach(function(g) {
                if (g.contours && g.contours.length) {
                  var offsetX = g.xMax + g.xMin;
                  var offsetY = g.yMax + g.yMin;
                  g.contours.forEach(function(contour) {
                    (0, _pathAdjust.default)(contour, setting.mirror ? -1 : 1, setting.reverse ? -1 : 1);
                    (0, _pathAdjust.default)(contour, 1, 1, setting.mirror ? offsetX : 0, setting.reverse ? offsetY : 0);
                  });
                }
              });
            }
            if (setting.scale && setting.scale !== 1) {
              changed = true;
              var scale = setting.scale;
              glyfList.forEach(function(g) {
                if (g.contours && g.contours.length) {
                  (0, _glyfAdjust.default)(g, scale, scale);
                }
              });
            } else if (setting.adjustToEmBox) {
              changed = true;
              var ascent = this.ttf.hhea.ascent;
              var descent = this.ttf.hhea.descent;
              var adjustToEmPadding = 2 * (setting.adjustToEmPadding || 0);
              adjustToEmBox(glyfList, ascent, descent, adjustToEmPadding);
            }
            return changed ? glyfList : [];
          }
          /**
           * 获取glyf列表
           *
           * @param {Array=} indexList 索引列表
           * @return {Array} glyflist
           */
        }, {
          key: "getGlyf",
          value: function getGlyf(indexList) {
            var glyf = this.ttf.glyf;
            if (indexList && indexList.length) {
              return indexList.map(function(item) {
                return glyf[item];
              });
            }
            return glyf;
          }
          /**
           * 查找相关字形
           *
           * @param  {Object} condition 查询条件
           * @param  {Array|number} condition.unicode unicode编码列表或者单个unicode编码
           * @param  {string} condition.name glyf名字，例如`uniE001`, `uniE`
           * @param  {Function} condition.filter 自定义过滤器
           * @example
           *     condition.filter = function (glyf) {
           *         return glyf.name === 'logo';
           *     }
           * @return {Array}  glyf字形索引列表
           */
        }, {
          key: "findGlyf",
          value: function findGlyf(condition) {
            if (!condition) {
              return [];
            }
            var filters = [];
            if (condition.unicode) {
              var unicodeList = Array.isArray(condition.unicode) ? condition.unicode : [condition.unicode];
              var unicodeHash = {};
              unicodeList.forEach(function(unicode) {
                if (typeof unicode === "string") {
                  unicode = Number("0x" + unicode.slice(1));
                }
                unicodeHash[unicode] = true;
              });
              filters.push(function(glyf) {
                if (!glyf.unicode || !glyf.unicode.length) {
                  return false;
                }
                for (var i = 0, l = glyf.unicode.length; i < l; i++) {
                  if (unicodeHash[glyf.unicode[i]]) {
                    return true;
                  }
                }
              });
            }
            if (typeof condition.name === "string" && condition.name) {
              var name2 = condition.name;
              filters.push(function(glyf) {
                return typeof glyf.name === "string" && glyf.name.indexOf(name2) === 0;
              });
            }
            if (typeof condition.filter === "function") {
              filters.push(condition.filter);
            }
            var indexList = [];
            this.ttf.glyf.forEach(function(glyf, index) {
              for (var filterIndex = 0, filter; filter = filters[filterIndex++]; ) {
                if (true === filter(glyf)) {
                  indexList.push(index);
                  break;
                }
              }
            });
            return indexList;
          }
          /**
           * 更新指定的glyf
           *
           * @param {Object} glyf glyfobject
           * @param {string} index 需要替换的索引列表
           * @return {Array} 改变的glyf
           */
        }, {
          key: "replaceGlyf",
          value: function replaceGlyf(glyf, index) {
            if (index >= 0 && index < this.ttf.glyf.length) {
              this.ttf.glyf[index] = glyf;
              return [glyf];
            }
            return [];
          }
          /**
           * 设置glyf
           *
           * @param {Array} glyfList glyf列表
           * @return {Array} 设置的glyf列表
           */
        }, {
          key: "setGlyf",
          value: function setGlyf(glyfList) {
            delete this.glyf;
            this.ttf.glyf = glyfList || [];
            return this.ttf.glyf;
          }
          /**
           * 对字形按照unicode编码排序，此处不对复合字形进行排序，如果存在复合字形, 不进行排序
           *
           * @param {Array} glyfList glyf列表
           * @return {Array} 设置的glyf列表
           */
        }, {
          key: "sortGlyf",
          value: function sortGlyf() {
            var glyf = this.ttf.glyf;
            if (glyf.length > 1) {
              if (glyf.some(function(a) {
                return a.compound;
              })) {
                return -2;
              }
              var notdef = glyf.shift();
              glyf.sort(function(a, b) {
                if ((!a.unicode || !a.unicode.length) && (!b.unicode || !b.unicode.length)) {
                  return 0;
                } else if ((!a.unicode || !a.unicode.length) && b.unicode) {
                  return 1;
                } else if (a.unicode && (!b.unicode || !b.unicode.length)) {
                  return -1;
                }
                return Math.min.apply(null, a.unicode) - Math.min.apply(null, b.unicode);
              });
              glyf.unshift(notdef);
              return glyf;
            }
            return -1;
          }
          /**
           * 设置名字
           *
           * @param {string} name 名字字段
           * @return {Object} 名字对象
           */
        }, {
          key: "setName",
          value: function setName(name2) {
            if (name2) {
              this.ttf.name.fontFamily = this.ttf.name.fullName = name2.fontFamily || _default.default.name.fontFamily;
              this.ttf.name.fontSubFamily = name2.fontSubFamily || _default.default.name.fontSubFamily;
              this.ttf.name.uniqueSubFamily = name2.uniqueSubFamily || "";
              this.ttf.name.postScriptName = name2.postScriptName || "";
            }
            return this.ttf.name;
          }
          /**
           * 设置head信息
           *
           * @param {Object} head 头部信息
           * @return {Object} 头对象
           */
        }, {
          key: "setHead",
          value: function setHead(head) {
            if (head) {
              if (head.unitsPerEm && head.unitsPerEm >= 64 && head.unitsPerEm <= 16384) {
                this.ttf.head.unitsPerEm = head.unitsPerEm;
              }
              if (head.lowestRecPPEM && head.lowestRecPPEM >= 8 && head.lowestRecPPEM <= 16384) {
                this.ttf.head.lowestRecPPEM = head.lowestRecPPEM;
              }
              if (head.created) {
                this.ttf.head.created = head.created;
              }
              if (head.modified) {
                this.ttf.head.modified = head.modified;
              }
            }
            return this.ttf.head;
          }
          /**
           * 设置hhea信息
           *
           * @param {Object} fields 字段值
           * @return {Object} 头对象
           */
        }, {
          key: "setHhea",
          value: function setHhea(fields) {
            (0, _lang.overwrite)(this.ttf.hhea, fields, ["ascent", "descent", "lineGap"]);
            return this.ttf.hhea;
          }
          /**
           * 设置OS2信息
           *
           * @param {Object} fields 字段值
           * @return {Object} 头对象
           */
        }, {
          key: "setOS2",
          value: function setOS2(fields) {
            (0, _lang.overwrite)(this.ttf["OS/2"], fields, [
              "usWinAscent",
              "usWinDescent",
              "sTypoAscender",
              "sTypoDescender",
              "sTypoLineGap",
              "sxHeight",
              "bXHeight",
              "usWeightClass",
              "usWidthClass",
              "yStrikeoutPosition",
              "yStrikeoutSize",
              "achVendID",
              // panose
              "bFamilyType",
              "bSerifStyle",
              "bWeight",
              "bProportion",
              "bContrast",
              "bStrokeVariation",
              "bArmStyle",
              "bLetterform",
              "bMidline",
              "bXHeight"
            ]);
            return this.ttf["OS/2"];
          }
          /**
           * 设置post信息
           *
           * @param {Object} fields 字段值
           * @return {Object} 头对象
           */
        }, {
          key: "setPost",
          value: function setPost(fields) {
            (0, _lang.overwrite)(this.ttf.post, fields, ["underlinePosition", "underlineThickness"]);
            return this.ttf.post;
          }
          /**
           * 计算度量信息
           *
           * @return {Object} 度量信息
           */
        }, {
          key: "calcMetrics",
          value: function calcMetrics() {
            var ascent = -16384;
            var descent = 16384;
            var uX = 120;
            var uH = 72;
            var sxHeight;
            var sCapHeight;
            this.ttf.glyf.forEach(function(g) {
              if (g.yMax > ascent) {
                ascent = g.yMax;
              }
              if (g.yMin < descent) {
                descent = g.yMin;
              }
              if (g.unicode) {
                if (g.unicode.indexOf(uX) >= 0) {
                  sxHeight = g.yMax;
                }
                if (g.unicode.indexOf(uH) >= 0) {
                  sCapHeight = g.yMax;
                }
              }
            });
            ascent = Math.round(ascent);
            descent = Math.round(descent);
            return {
              // 此处非必须自动设置
              ascent,
              descent,
              sTypoAscender: ascent,
              sTypoDescender: descent,
              // 自动设置项目
              usWinAscent: ascent,
              usWinDescent: -descent,
              sxHeight: sxHeight || 0,
              sCapHeight: sCapHeight || 0
            };
          }
          /**
           * 优化ttf字形信息
           *
           * @return {Array} 改变的glyf
           */
        }, {
          key: "optimize",
          value: function optimize() {
            return (0, _optimizettf.default)(this.ttf);
          }
          /**
           * 复合字形转简单字形
           *
           * @param {Array=} indexList 索引列表
           * @return {Array} 改变的glyf
           */
        }, {
          key: "compound2simple",
          value: function compound2simple(indexList) {
            var ttf = this.ttf;
            if (ttf.maxp && !ttf.maxp.maxComponentElements) {
              return [];
            }
            var i;
            var l;
            if (!indexList || !indexList.length) {
              indexList = [];
              for (i = 0, l = ttf.glyf.length; i < l; ++i) {
                if (ttf.glyf[i].compound) {
                  indexList.push(i);
                }
              }
            }
            var list = [];
            for (i = 0, l = indexList.length; i < l; ++i) {
              var glyfIndex = indexList[i];
              if (ttf.glyf[glyfIndex] && ttf.glyf[glyfIndex].compound) {
                (0, _compound2simpleglyf.default)(glyfIndex, ttf, true);
                list.push(ttf.glyf[glyfIndex]);
              }
            }
            return list;
          }
        }]);
      }();
    }
  });

  // node_modules/fonteditor-core/lib/common/string.js
  var require_string2 = __commonJS({
    "node_modules/fonteditor-core/lib/common/string.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        /**
         * HTML解码字符串
         *
         * @param {string} source 源字符串
         * @return {string}
         */
        decodeHTML: function decodeHTML(source) {
          var str = String(source).replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
          return str.replace(/&#([\d]+);/g, function($0, $1) {
            return String.fromCodePoint(parseInt($1, 10));
          });
        },
        /**
         * HTML编码字符串
         *
         * @param {string} source 源字符串
         * @return {string}
         */
        encodeHTML: function encodeHTML(source) {
          return String(source).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        },
        /**
         * 获取string字节长度
         *
         * @param {string} source 源字符串
         * @return {number} 长度
         */
        getLength: function getLength(source) {
          return String(source).replace(/[^\x00-\xff]/g, "11").length;
        },
        /**
         * 字符串格式化，支持如 ${xxx.xxx} 的语法
         *
         * @param {string} source 模板字符串
         * @param {Object} data 数据
         * @return {string} 格式化后字符串
         */
        format: function format(source, data) {
          return source.replace(/\$\{([\w.]+)\}/g, function($0, $1) {
            var ref = $1.split(".");
            var refObject = data;
            var level;
            while (refObject != null && (level = ref.shift())) {
              refObject = refObject[level];
            }
            return refObject != null ? refObject : "";
          });
        },
        /**
         * 使用指定字符填充字符串,默认`0`
         *
         * @param {string} str 字符串
         * @param {number} size 填充到的大小
         * @param {string=} ch 填充字符
         * @return {string} 字符串
         */
        pad: function pad(str, size, ch) {
          str = String(str);
          if (str.length > size) {
            return str.slice(str.length - size);
          }
          return new Array(size - str.length + 1).join(ch || "0") + str;
        },
        /**
         * 获取字符串哈希编码
         *
         * @param {string} str 字符串
         * @return {number} 哈希值
         */
        hashcode: function hashcode(str) {
          if (!str) {
            return 0;
          }
          var hash = 0;
          for (var i = 0, l = str.length; i < l; i++) {
            hash = 34359738367 & hash * 31 + str.charCodeAt(i);
          }
          return hash;
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/common/I18n.js
  var require_I18n = __commonJS({
    "node_modules/fonteditor-core/lib/common/I18n.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      function appendLanguage(store, languageList) {
        languageList.forEach(function(item) {
          var language = item[0];
          store[language] = Object.assign(store[language] || {}, item[1]);
        });
        return store;
      }
      var I18n = exports.default = /* @__PURE__ */ function() {
        function I18n2(languageList, defaultLanguage) {
          _classCallCheck(this, I18n2);
          this.store = appendLanguage({}, languageList);
          this.setLanguage(defaultLanguage || typeof navigator !== "undefined" && navigator.language && navigator.language.toLowerCase() || "en-us");
        }
        return _createClass(I18n2, [{
          key: "setLanguage",
          value: function setLanguage(language) {
            if (!this.store[language]) {
              language = "en-us";
            }
            this.lang = this.store[this.language = language];
            return this;
          }
          /**
           * 添加一个语言字符串
           *
           * @param {string} language 语言
           * @param {Object} langObject 语言对象
           * @return {this}
           */
        }, {
          key: "addLanguage",
          value: function addLanguage(language, langObject) {
            appendLanguage(this.store, [[language, langObject]]);
            return this;
          }
          /**
           * 获取当前语言字符串
           *
           * @param  {string} path 语言路径
           * @return {string}      语言字符串
           */
        }, {
          key: "get",
          value: function get(path) {
            var ref = path.split(".");
            var refObject = this.lang;
            var level;
            while (refObject != null && (level = ref.shift())) {
              refObject = refObject[level];
            }
            return refObject != null ? refObject : "";
          }
        }]);
      }();
    }
  });

  // node_modules/fonteditor-core/lib/ttf/i18n.js
  var require_i18n = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/i18n.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _I18n = _interopRequireDefault(require_I18n());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var zh = {
        // error define
        10001: "\u8D85\u51FA\u8BFB\u53D6\u8303\u56F4\uFF1A${0}, ${1}",
        10002: "\u8D85\u51FA\u5199\u5165\u8303\u56F4\uFF1A${0}, ${1}",
        10003: "\u672A\u77E5\u6570\u636E\u7C7B\u578B\uFF1A${0}, ${1}",
        10004: "\u4E0D\u652F\u6301svg\u89E3\u6790",
        10101: "\u9519\u8BEF\u7684ttf\u6587\u4EF6",
        10102: "\u9519\u8BEF\u7684woff\u6587\u4EF6",
        10103: "\u9519\u8BEF\u7684svg\u6587\u4EF6",
        10104: "\u8BFB\u53D6ttf\u6587\u4EF6\u9519\u8BEF",
        10105: "\u8BFB\u53D6woff\u6587\u4EF6\u9519\u8BEF",
        10106: "\u8BFB\u53D6svg\u6587\u4EF6\u9519\u8BEF",
        10107: "\u5199\u5165ttf\u6587\u4EF6\u9519\u8BEF",
        10108: "\u5199\u5165woff\u6587\u4EF6\u9519\u8BEF",
        10109: "\u5199\u5165svg\u6587\u4EF6\u9519\u8BEF",
        10112: "\u5199\u5165svg symbol \u9519\u8BEF",
        10110: "\u8BFB\u53D6eot\u6587\u4EF6\u9519\u8BEF",
        10111: "\u8BFB\u53D6eot\u5B57\u4F53\u9519\u8BEF",
        10200: "\u91CD\u590D\u7684unicode\u4EE3\u7801\u70B9\uFF0C\u5B57\u5F62\u5E8F\u53F7\uFF1A${0}",
        10201: "ttf\u5B57\u5F62\u8F6E\u5ED3\u6570\u636E\u4E3A\u7A7A",
        10202: "\u4E0D\u652F\u6301\u6807\u5FD7\u4F4D\uFF1AARGS_ARE_XY_VALUES",
        10203: "\u672A\u627E\u5230\u8868\uFF1A${0}",
        10204: "\u8BFB\u53D6ttf\u8868\u9519\u8BEF",
        10205: "\u672A\u627E\u5230\u89E3\u538B\u51FD\u6570",
        10301: "\u9519\u8BEF\u7684otf\u6587\u4EF6",
        10302: "\u8BFB\u53D6otf\u8868\u9519\u8BEF",
        10303: "otf\u5B57\u5F62\u8F6E\u5ED3\u6570\u636E\u4E3A\u7A7A"
      };
      var en = {
        // error define
        10001: "Reading index out of range: ${0}, ${1}",
        10002: "Writing index out of range: ${0}, ${1}",
        10003: "Unknown datatype: ${0}, ${1}",
        10004: "No svg parser",
        10101: "ttf file damaged",
        10102: "woff file damaged",
        10103: "svg file damaged",
        10104: "Read ttf error",
        10105: "Read woff error",
        10106: "Read svg error",
        10107: "Write ttf error",
        10108: "Write woff error",
        10109: "Write svg error",
        10112: "Write svg symbol error",
        10110: "Read eot error",
        10111: "Write eot error",
        10200: "Repeat unicode, glyph index: ${0}",
        10201: "ttf `glyph` data is empty",
        10202: "Not support compound glyph flag: ARGS_ARE_XY_VALUES",
        10203: "No ttf table: ${0}",
        10204: "Read ttf table data error",
        10205: "No zip deflate function",
        10301: "otf file damaged",
        10302: "Read otf table error",
        10303: "otf `glyph` data is empty"
      };
      var _default = exports.default = new _I18n.default([["zh-cn", zh], ["en-us", en]], typeof window !== "undefined" ? window.language : "en-us");
    }
  });

  // node_modules/fonteditor-core/lib/ttf/error.js
  var require_error = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/error.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _string = _interopRequireDefault(require_string2());
      var _i18n = _interopRequireDefault(require_i18n());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      var _default = exports.default = {
        /**
         * 抛出一个异常
         *
         * @param  {Object} e 异常号或者异常对象
         * @param  {...Array} fargs args 参数
         *
         * 例如：
         * e = 1001
         * e = {
         *     number: 1001,
         *     data: 错误数据
         * }
         */
        raise: function raise(e) {
          var number;
          var data;
          if (_typeof(e) === "object") {
            number = e.number || 0;
            data = e.data;
          } else {
            number = e;
          }
          var message = _i18n.default.lang[number];
          for (var _len = arguments.length, fargs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            fargs[_key - 1] = arguments[_key];
          }
          if (fargs.length > 0) {
            var args = _typeof(fargs[0]) === "object" ? fargs[0] : fargs;
            message = _string.default.format(message, args);
          }
          var event = new Error(message);
          event.number = number;
          if (data) {
            event.data = data;
          }
          throw event;
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/reader.js
  var require_reader = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/reader.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _lang = require_lang();
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
      }
      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function _iterableToArrayLimit(r, l) {
        var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (null != t) {
          var e, n, i, u, a = [], f = true, o = false;
          try {
            if (i = (t = t.call(r)).next, 0 === l) {
              if (Object(t) !== t) return;
              f = false;
            } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
          } catch (r2) {
            o = true, n = r2;
          } finally {
            try {
              if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
            } finally {
              if (o) throw n;
            }
          }
          return a;
        }
      }
      function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      if (typeof ArrayBuffer === "undefined" || typeof DataView === "undefined") {
        throw new Error("not support ArrayBuffer and DataView");
      }
      var dataType = {
        Int8: 1,
        Int16: 2,
        Int32: 4,
        Uint8: 1,
        Uint16: 2,
        Uint32: 4,
        Float32: 4,
        Float64: 8
      };
      var Reader = exports.default = /* @__PURE__ */ function() {
        function Reader2(buffer, offset, length, littleEndian) {
          _classCallCheck(this, Reader2);
          var bufferLength = buffer.byteLength || buffer.length;
          this.offset = offset || 0;
          this.length = length || bufferLength - this.offset;
          this.littleEndian = littleEndian || false;
          this.view = new DataView(buffer, this.offset, this.length);
        }
        return _createClass(Reader2, [{
          key: "read",
          value: function read2(type, offset, littleEndian) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            if (void 0 === littleEndian) {
              littleEndian = this.littleEndian;
            }
            if (void 0 === dataType[type]) {
              return this["read" + type](offset, littleEndian);
            }
            var size = dataType[type];
            this.offset = offset + size;
            return this.view["get" + type](offset, littleEndian);
          }
          /**
           * 获取指定的字节数组
           *
           * @param {number} offset 偏移
           * @param {number} length 字节长度
           * @return {Array} 字节数组
           */
        }, {
          key: "readBytes",
          value: function readBytes(offset) {
            var length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
            if (length == null) {
              length = offset;
              offset = this.offset;
            }
            if (length < 0 || offset + length > this.length) {
              _error.default.raise(10001, this.length, offset + length);
            }
            var buffer = [];
            for (var i = 0; i < length; ++i) {
              buffer.push(this.view.getUint8(offset + i));
            }
            this.offset = offset + length;
            return buffer;
          }
          /**
           * 读取一个string
           *
           * @param {number} offset 偏移
           * @param {number} length 长度
           * @return {string} 字符串
           */
        }, {
          key: "readString",
          value: function readString(offset) {
            var length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
            if (length == null) {
              length = offset;
              offset = this.offset;
            }
            if (length < 0 || offset + length > this.length) {
              _error.default.raise(10001, this.length, offset + length);
            }
            var value = "";
            for (var i = 0; i < length; ++i) {
              var c = this.readUint8(offset + i);
              value += String.fromCharCode(c);
            }
            this.offset = offset + length;
            return value;
          }
          /**
           * 读取一个字符
           *
           * @param {number} offset 偏移
           * @return {string} 字符串
           */
        }, {
          key: "readChar",
          value: function readChar(offset) {
            return this.readString(offset, 1);
          }
          /**
           * 读取一个uint24整形
           *
           * @param {number} offset 偏移
           * @return {number}
           */
        }, {
          key: "readUint24",
          value: function readUint24(offset) {
            var _this$readBytes = this.readBytes(offset || this.offset, 3), _this$readBytes2 = _slicedToArray(_this$readBytes, 3), i = _this$readBytes2[0], j = _this$readBytes2[1], k = _this$readBytes2[2];
            return (i << 16) + (j << 8) + k;
          }
          /**
           * 读取fixed类型
           *
           * @param {number} offset 偏移
           * @return {number} float
           */
        }, {
          key: "readFixed",
          value: function readFixed(offset) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            var val = this.readInt32(offset, false) / 65536;
            return Math.ceil(val * 1e5) / 1e5;
          }
          /**
           * 读取长日期
           *
           * @param {number} offset 偏移
           * @return {Date} Date对象
           */
        }, {
          key: "readLongDateTime",
          value: function readLongDateTime(offset) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            var delta = -20775456e5;
            var time = this.readUint32(offset + 4, false);
            var date = /* @__PURE__ */ new Date();
            date.setTime(time * 1e3 + delta);
            return date;
          }
          /**
           * 跳转到指定偏移
           *
           * @param {number} offset 偏移
           * @return {Object} this
           */
        }, {
          key: "seek",
          value: function seek(offset) {
            if (void 0 === offset) {
              this.offset = 0;
            }
            if (offset < 0 || offset > this.length) {
              _error.default.raise(10001, this.length, offset);
            }
            this.offset = offset;
            return this;
          }
          /**
           * 注销
           */
        }, {
          key: "dispose",
          value: function dispose() {
            delete this.view;
          }
        }]);
      }();
      Object.keys(dataType).forEach(function(type) {
        Reader.prototype["read" + type] = (0, _lang.curry)(Reader.prototype.read, type);
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/writer.js
  var require_writer = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/writer.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _lang = require_lang();
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      if (typeof ArrayBuffer === "undefined" || typeof DataView === "undefined") {
        throw new Error("not support ArrayBuffer and DataView");
      }
      var dataType = {
        Int8: 1,
        Int16: 2,
        Int32: 4,
        Uint8: 1,
        Uint16: 2,
        Uint32: 4,
        Float32: 4,
        Float64: 8
      };
      var Writer = /* @__PURE__ */ function() {
        function Writer2(buffer, offset, length, littleEndian) {
          _classCallCheck(this, Writer2);
          var bufferLength = buffer.byteLength || buffer.length;
          this.offset = offset || 0;
          this.length = length || bufferLength - this.offset;
          this.littleEndian = littleEndian || false;
          this.view = new DataView(buffer, this.offset, this.length);
        }
        return _createClass(Writer2, [{
          key: "write",
          value: function write(type, value, offset, littleEndian) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            if (void 0 === littleEndian) {
              littleEndian = this.littleEndian;
            }
            if (void 0 === dataType[type]) {
              return this["write" + type](value, offset, littleEndian);
            }
            var size = dataType[type];
            this.offset = offset + size;
            this.view["set" + type](offset, value, littleEndian);
            return this;
          }
          /**
           * 写入指定的字节数组
           *
           * @param {ArrayBuffer} value 写入值
           * @param {number=} length 数组长度
           * @param {number=} offset 起始偏移
           * @return {this}
           */
        }, {
          key: "writeBytes",
          value: function writeBytes(value, length, offset) {
            length = length || value.byteLength || value.length;
            var i;
            if (!length) {
              return this;
            }
            if (void 0 === offset) {
              offset = this.offset;
            }
            if (length < 0 || offset + length > this.length) {
              _error.default.raise(10002, this.length, offset + length);
            }
            var littleEndian = this.littleEndian;
            if (value instanceof ArrayBuffer) {
              var view = new DataView(value, 0, length);
              for (i = 0; i < length; ++i) {
                this.view.setUint8(offset + i, view.getUint8(i, littleEndian), littleEndian);
              }
            } else {
              for (i = 0; i < length; ++i) {
                this.view.setUint8(offset + i, value[i], littleEndian);
              }
            }
            this.offset = offset + length;
            return this;
          }
          /**
           * 写空数据
           *
           * @param {number} length 长度
           * @param {number=} offset 起始偏移
           * @return {this}
           */
        }, {
          key: "writeEmpty",
          value: function writeEmpty(length, offset) {
            if (length < 0) {
              _error.default.raise(10002, this.length, length);
            }
            if (void 0 === offset) {
              offset = this.offset;
            }
            var littleEndian = this.littleEndian;
            for (var i = 0; i < length; ++i) {
              this.view.setUint8(offset + i, 0, littleEndian);
            }
            this.offset = offset + length;
            return this;
          }
          /**
           * 写入一个string
           *
           * @param {string} str 字符串
           * @param {number=} length 长度
           * @param {number=} offset 偏移
           *
           * @return {this}
           */
        }, {
          key: "writeString",
          value: function writeString() {
            var str = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
            var length = arguments.length > 1 ? arguments[1] : void 0;
            var offset = arguments.length > 2 ? arguments[2] : void 0;
            if (void 0 === offset) {
              offset = this.offset;
            }
            length = length || str.replace(/[^\x00-\xff]/g, "11").length;
            if (length < 0 || offset + length > this.length) {
              _error.default.raise(10002, this.length, offset + length);
            }
            this.seek(offset);
            for (var i = 0, l = str.length, charCode; i < l; ++i) {
              charCode = str.charCodeAt(i) || 0;
              if (charCode > 127) {
                this.writeUint16(charCode);
              } else {
                this.writeUint8(charCode);
              }
            }
            this.offset = offset + length;
            return this;
          }
          /**
           * 写入一个字符
           *
           * @param {string} value 字符
           * @param {number=} offset 偏移
           * @return {this}
           */
        }, {
          key: "writeChar",
          value: function writeChar(value, offset) {
            return this.writeString(value, offset);
          }
          /**
           * 写入fixed类型
           *
           * @param {number} value 写入值
           * @param {number=} offset 偏移
           * @return {number} float
           */
        }, {
          key: "writeFixed",
          value: function writeFixed(value, offset) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            this.writeInt32(Math.round(value * 65536), offset);
            return this;
          }
          /**
           * 写入长日期
           *
           * @param {Date} value 日期对象
           * @param {number=} offset 偏移
           *
           * @return {Date} Date对象
           */
        }, {
          key: "writeLongDateTime",
          value: function writeLongDateTime(value, offset) {
            if (void 0 === offset) {
              offset = this.offset;
            }
            var delta = -20775456e5;
            if (typeof value === "undefined") {
              value = delta;
            } else if (typeof value.getTime === "function") {
              value = value.getTime();
            } else if (/^\d+$/.test(value)) {
              value = +value;
            } else {
              value = Date.parse(value);
            }
            var time = Math.round((value - delta) / 1e3);
            this.writeUint32(0, offset);
            this.writeUint32(time, offset + 4);
            return this;
          }
          /**
           * 跳转到指定偏移
           *
           * @param {number=} offset 偏移
           * @return {this}
           */
        }, {
          key: "seek",
          value: function seek(offset) {
            if (void 0 === offset) {
              this.offset = 0;
            }
            if (offset < 0 || offset > this.length) {
              _error.default.raise(10002, this.length, offset);
            }
            this._offset = this.offset;
            this.offset = offset;
            return this;
          }
          /**
           * 跳转到写入头部位置
           *
           * @return {this}
           */
        }, {
          key: "head",
          value: function head() {
            this.offset = this._offset || 0;
            return this;
          }
          /**
           * 获取缓存的byte数组
           *
           * @return {ArrayBuffer}
           */
        }, {
          key: "getBuffer",
          value: function getBuffer() {
            return this.view.buffer;
          }
          /**
           * 注销
           */
        }, {
          key: "dispose",
          value: function dispose() {
            delete this.view;
          }
        }]);
      }();
      Object.keys(dataType).forEach(function(type) {
        Writer.prototype["write" + type] = (0, _lang.curry)(Writer.prototype.write, type);
      });
      var _default = exports.default = Writer;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/woff2ttf.js
  var require_woff2ttf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/woff2ttf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = woff2ttf;
      var _reader = _interopRequireDefault(require_reader());
      var _writer = _interopRequireDefault(require_writer());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function woff2ttf(woffBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var reader = new _reader.default(woffBuffer);
        var signature = reader.readUint32(0);
        var flavor = reader.readUint32(4);
        if (signature !== 2001684038 || flavor !== 65536 && flavor !== 1330926671) {
          reader.dispose();
          _error.default.raise(10102);
        }
        var numTables = reader.readUint16(12);
        var ttfSize = reader.readUint32(16);
        var tableEntries = [];
        var tableEntry;
        var i;
        var l;
        for (i = 0; i < numTables; ++i) {
          reader.seek(44 + i * 20);
          tableEntry = {
            tag: reader.readString(reader.offset, 4),
            offset: reader.readUint32(),
            compLength: reader.readUint32(),
            length: reader.readUint32(),
            checkSum: reader.readUint32()
          };
          var deflateData = reader.readBytes(tableEntry.offset, tableEntry.compLength);
          if (deflateData.length < tableEntry.length) {
            if (!options.inflate) {
              reader.dispose();
              _error.default.raise(10105);
            }
            tableEntry.data = options.inflate(deflateData);
          } else {
            tableEntry.data = deflateData;
          }
          tableEntry.length = tableEntry.data.length;
          tableEntries.push(tableEntry);
        }
        var writer = new _writer.default(new ArrayBuffer(ttfSize));
        var entrySelector = Math.floor(Math.log(numTables) / Math.LN2);
        var searchRange = Math.pow(2, entrySelector) * 16;
        var rangeShift = numTables * 16 - searchRange;
        writer.writeUint32(flavor);
        writer.writeUint16(numTables);
        writer.writeUint16(searchRange);
        writer.writeUint16(entrySelector);
        writer.writeUint16(rangeShift);
        var tblOffset = 12 + 16 * tableEntries.length;
        for (i = 0, l = tableEntries.length; i < l; ++i) {
          tableEntry = tableEntries[i];
          writer.writeString(tableEntry.tag);
          writer.writeUint32(tableEntry.checkSum);
          writer.writeUint32(tblOffset);
          writer.writeUint32(tableEntry.length);
          tblOffset += tableEntry.length + (tableEntry.length % 4 ? 4 - tableEntry.length % 4 : 0);
        }
        for (i = 0, l = tableEntries.length; i < l; ++i) {
          tableEntry = tableEntries[i];
          writer.writeBytes(tableEntry.data);
          if (tableEntry.length % 4) {
            writer.writeEmpty(4 - tableEntry.length % 4);
          }
        }
        return writer.getBuffer();
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/struct.js
  var require_struct = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/struct.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var struct = {
        Int8: 1,
        Uint8: 2,
        Int16: 3,
        Uint16: 4,
        Int32: 5,
        Uint32: 6,
        Fixed: 7,
        // 32-bit signed fixed-point number (16.16)
        FUnit: 8,
        // Smallest measurable distance in the em space
        // 16-bit signed fixed number with the low 14 bits of fraction
        F2Dot14: 11,
        // The long internal format of a date in seconds since 12:00 midnight,
        // January 1, 1904. It is represented as a signed 64-bit integer.
        LongDateTime: 12,
        // extend data type
        Char: 13,
        String: 14,
        Bytes: 15,
        Uint24: 20
      };
      var names = {};
      Object.keys(struct).forEach(function(key) {
        names[struct[key]] = key;
      });
      struct.names = names;
      var _default = exports.default = struct;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/table.js
  var require_table = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/table.js"(exports) {
      "use strict";
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _struct = _interopRequireDefault(require_struct());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function read2(reader) {
        var offset = this.offset;
        if (void 0 !== offset) {
          reader.seek(offset);
        }
        var me = this;
        this.struct.forEach(function(item) {
          var name2 = item[0];
          var type = item[1];
          var typeName = null;
          switch (type) {
            case _struct.default.Int8:
            case _struct.default.Uint8:
            case _struct.default.Int16:
            case _struct.default.Uint16:
            case _struct.default.Int32:
            case _struct.default.Uint32:
              typeName = _struct.default.names[type];
              me[name2] = reader.read(typeName);
              break;
            case _struct.default.Fixed:
              me[name2] = reader.readFixed();
              break;
            case _struct.default.LongDateTime:
              me[name2] = reader.readLongDateTime();
              break;
            case _struct.default.Bytes:
              me[name2] = reader.readBytes(reader.offset, item[2] || 0);
              break;
            case _struct.default.Char:
              me[name2] = reader.readChar();
              break;
            case _struct.default.String:
              me[name2] = reader.readString(reader.offset, item[2] || 0);
              break;
            default:
              _error.default.raise(10003, name2, type);
          }
        });
        return this.valueOf();
      }
      function write(writer, ttf) {
        var table = ttf[this.name];
        if (!table) {
          _error.default.raise(10203, this.name);
        }
        this.struct.forEach(function(item) {
          var name2 = item[0];
          var type = item[1];
          var typeName = null;
          switch (type) {
            case _struct.default.Int8:
            case _struct.default.Uint8:
            case _struct.default.Int16:
            case _struct.default.Uint16:
            case _struct.default.Int32:
            case _struct.default.Uint32:
              typeName = _struct.default.names[type];
              writer.write(typeName, table[name2]);
              break;
            case _struct.default.Fixed:
              writer.writeFixed(table[name2]);
              break;
            case _struct.default.LongDateTime:
              writer.writeLongDateTime(table[name2]);
              break;
            case _struct.default.Bytes:
              writer.writeBytes(table[name2], item[2] || 0);
              break;
            case _struct.default.Char:
              writer.writeChar(table[name2]);
              break;
            case _struct.default.String:
              writer.writeString(table[name2], item[2] || 0);
              break;
            default:
              _error.default.raise(10003, name2, type);
          }
        });
        return writer;
      }
      function size() {
        var sz = 0;
        this.struct.forEach(function(item) {
          var type = item[1];
          switch (type) {
            case _struct.default.Int8:
            case _struct.default.Uint8:
              sz += 1;
              break;
            case _struct.default.Int16:
            case _struct.default.Uint16:
              sz += 2;
              break;
            case _struct.default.Int32:
            case _struct.default.Uint32:
            case _struct.default.Fixed:
              sz += 4;
              break;
            case _struct.default.LongDateTime:
              sz += 8;
              break;
            case _struct.default.Bytes:
              sz += item[2] || 0;
              break;
            case _struct.default.Char:
              sz += 1;
              break;
            case _struct.default.String:
              sz += item[2] || 0;
              break;
            default:
              _error.default.raise(10003, name, type);
          }
        });
        return sz;
      }
      function valueOf() {
        var val = {};
        var me = this;
        this.struct.forEach(function(item) {
          val[item[0]] = me[item[0]];
        });
        return val;
      }
      var _default = exports.default = {
        read: read2,
        write,
        size,
        valueOf,
        /**
         * 创建一个表结构
         *
         * @param {string} name 表名
         * @param {Array<[string, number]>} struct 表结构
         * @param {Object} proto 原型
         * @return {Function} 表构造函数
         */
        create: function create(name2, struct, proto) {
          var Table = /* @__PURE__ */ _createClass(function Table2(offset) {
            _classCallCheck(this, Table2);
            this.name = name2;
            this.struct = struct;
            this.offset = offset;
          });
          Table.prototype.read = read2;
          Table.prototype.write = write;
          Table.prototype.size = size;
          Table.prototype.valueOf = valueOf;
          Object.assign(Table.prototype, proto);
          return Table;
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/directory.js
  var require_directory = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/directory.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("directory", [], {
        read: function read2(reader, ttf) {
          var tables = {};
          var numTables = ttf.numTables;
          var offset = this.offset;
          for (var i = offset, l = numTables * 16; i < l; i += 16) {
            var name2 = reader.readString(i, 4).trim();
            tables[name2] = {
              name: name2,
              checkSum: reader.readUint32(i + 4),
              offset: reader.readUint32(i + 8),
              length: reader.readUint32(i + 12)
            };
          }
          return tables;
        },
        write: function write(writer, ttf) {
          var tables = ttf.support.tables;
          for (var i = 0, l = tables.length; i < l; i++) {
            writer.writeString((tables[i].name + "    ").slice(0, 4));
            writer.writeUint32(tables[i].checkSum);
            writer.writeUint32(tables[i].offset);
            writer.writeUint32(tables[i].length);
          }
          return writer;
        },
        size: function size(ttf) {
          return ttf.numTables * 16;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/head.js
  var require_head = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/head.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("head", [["version", _struct.default.Fixed], ["fontRevision", _struct.default.Fixed], ["checkSumAdjustment", _struct.default.Uint32], ["magickNumber", _struct.default.Uint32], ["flags", _struct.default.Uint16], ["unitsPerEm", _struct.default.Uint16], ["created", _struct.default.LongDateTime], ["modified", _struct.default.LongDateTime], ["xMin", _struct.default.Int16], ["yMin", _struct.default.Int16], ["xMax", _struct.default.Int16], ["yMax", _struct.default.Int16], ["macStyle", _struct.default.Uint16], ["lowestRecPPEM", _struct.default.Uint16], ["fontDirectionHint", _struct.default.Int16], ["indexToLocFormat", _struct.default.Int16], ["glyphDataFormat", _struct.default.Int16]]);
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/maxp.js
  var require_maxp = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/maxp.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("maxp", [["version", _struct.default.Fixed], ["numGlyphs", _struct.default.Uint16], ["maxPoints", _struct.default.Uint16], ["maxContours", _struct.default.Uint16], ["maxCompositePoints", _struct.default.Uint16], ["maxCompositeContours", _struct.default.Uint16], ["maxZones", _struct.default.Uint16], ["maxTwilightPoints", _struct.default.Uint16], ["maxStorage", _struct.default.Uint16], ["maxFunctionDefs", _struct.default.Uint16], ["maxInstructionDefs", _struct.default.Uint16], ["maxStackElements", _struct.default.Uint16], ["maxSizeOfInstructions", _struct.default.Uint16], ["maxComponentElements", _struct.default.Uint16], ["maxComponentDepth", _struct.default.Int16]], {
        write: function write(writer, ttf) {
          _table.default.write.call(this, writer, ttf.support);
          return writer;
        },
        size: function size() {
          return 32;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/readWindowsAllCodes.js
  var require_readWindowsAllCodes = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/readWindowsAllCodes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = readWindowsAllCodes;
      function readWindowsAllCodes(tables, ttf) {
        var codes = {};
        var format0 = tables.find(function(item) {
          return item.format === 0;
        });
        var format12 = tables.find(function(item) {
          return item.platformID === 3 && item.encodingID === 10 && item.format === 12;
        });
        var format4 = tables.find(function(item) {
          return item.platformID === 3 && item.encodingID === 1 && item.format === 4;
        });
        var format2 = tables.find(function(item) {
          return item.platformID === 3 && item.encodingID === 3 && item.format === 2;
        });
        var format14 = tables.find(function(item) {
          return item.platformID === 0 && item.encodingID === 5 && item.format === 14;
        });
        if (format0) {
          for (var i = 0, l = format0.glyphIdArray.length; i < l; i++) {
            if (format0.glyphIdArray[i]) {
              codes[i] = format0.glyphIdArray[i];
            }
          }
        }
        if (format14) {
          for (var _i = 0, _l = format14.groups.length; _i < _l; _i++) {
            var _format14$groups$_i = format14.groups[_i], unicode = _format14$groups$_i.unicode, glyphId = _format14$groups$_i.glyphId;
            if (unicode) {
              codes[unicode] = glyphId;
            }
          }
        }
        if (format12) {
          for (var _i2 = 0, _l2 = format12.nGroups; _i2 < _l2; _i2++) {
            var group = format12.groups[_i2];
            var startId = group.startId;
            var start = group.start;
            var end = group.end;
            for (; start <= end; ) {
              codes[start++] = startId++;
            }
          }
        } else if (format4) {
          var segCount = format4.segCountX2 / 2;
          var graphIdArrayIndexOffset = (format4.glyphIdArrayOffset - format4.idRangeOffsetOffset) / 2;
          for (var _i3 = 0; _i3 < segCount; ++_i3) {
            for (var _start = format4.startCode[_i3], _end = format4.endCode[_i3]; _start <= _end; ++_start) {
              if (format4.idRangeOffset[_i3] === 0) {
                codes[_start] = (_start + format4.idDelta[_i3]) % 65536;
              } else {
                var index = _i3 + format4.idRangeOffset[_i3] / 2 + (_start - format4.startCode[_i3]) - graphIdArrayIndexOffset;
                var graphId = format4.glyphIdArray[index];
                if (graphId !== 0) {
                  codes[_start] = (graphId + format4.idDelta[_i3]) % 65536;
                } else {
                  codes[_start] = 0;
                }
              }
            }
          }
          delete codes[65535];
        } else if (format2) {
          var subHeadKeys = format2.subHeadKeys;
          var subHeads = format2.subHeads;
          var glyphs = format2.glyphs;
          var numGlyphs = ttf.maxp.numGlyphs;
          var _index = 0;
          for (var _i4 = 0; _i4 < 256; _i4++) {
            if (subHeadKeys[_i4] === 0) {
              if (_i4 >= format2.maxPos) {
                _index = 0;
              } else if (_i4 < subHeads[0].firstCode || _i4 >= subHeads[0].firstCode + subHeads[0].entryCount || subHeads[0].idRangeOffset + (_i4 - subHeads[0].firstCode) >= glyphs.length) {
                _index = 0;
              } else if ((_index = glyphs[subHeads[0].idRangeOffset + (_i4 - subHeads[0].firstCode)]) !== 0) {
                _index = _index + subHeads[0].idDelta;
              }
              if (_index !== 0 && _index < numGlyphs) {
                codes[_i4] = _index;
              }
            } else {
              var k = subHeadKeys[_i4];
              for (var j = 0, entryCount = subHeads[k].entryCount; j < entryCount; j++) {
                if (subHeads[k].idRangeOffset + j >= glyphs.length) {
                  _index = 0;
                } else if ((_index = glyphs[subHeads[k].idRangeOffset + j]) !== 0) {
                  _index = _index + subHeads[k].idDelta;
                }
                if (_index !== 0 && _index < numGlyphs) {
                  var _unicode = (_i4 << 8 | j + subHeads[k].firstCode) % 65535;
                  codes[_unicode] = _index;
                }
              }
            }
          }
        }
        return codes;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cmap/parse.js
  var require_parse = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cmap/parse.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parse;
      var _readWindowsAllCodes = _interopRequireDefault(require_readWindowsAllCodes());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function readSubTable(reader, ttf, subTable, cmapOffset) {
        var i;
        var l;
        var glyphIdArray;
        var startOffset = cmapOffset + subTable.offset;
        var glyphCount;
        subTable.format = reader.readUint16(startOffset);
        if (subTable.format === 0) {
          var format0 = subTable;
          format0.length = reader.readUint16();
          format0.language = reader.readUint16();
          glyphIdArray = [];
          for (i = 0, l = format0.length - 6; i < l; i++) {
            glyphIdArray.push(reader.readUint8());
          }
          format0.glyphIdArray = glyphIdArray;
        } else if (subTable.format === 2) {
          var format2 = subTable;
          format2.length = reader.readUint16();
          format2.language = reader.readUint16();
          var subHeadKeys = [];
          var maxSubHeadKey = 0;
          var maxPos = -1;
          for (var _i = 0, _l = 256; _i < _l; _i++) {
            subHeadKeys[_i] = reader.readUint16() / 8;
            if (subHeadKeys[_i] > maxSubHeadKey) {
              maxSubHeadKey = subHeadKeys[_i];
              maxPos = _i;
            }
          }
          var subHeads = [];
          for (i = 0; i <= maxSubHeadKey; i++) {
            subHeads[i] = {
              firstCode: reader.readUint16(),
              entryCount: reader.readUint16(),
              idDelta: reader.readUint16(),
              idRangeOffset: (reader.readUint16() - (maxSubHeadKey - i) * 8 - 2) / 2
            };
          }
          glyphCount = (startOffset + format2.length - reader.offset) / 2;
          var glyphs = [];
          for (i = 0; i < glyphCount; i++) {
            glyphs[i] = reader.readUint16();
          }
          format2.subHeadKeys = subHeadKeys;
          format2.maxPos = maxPos;
          format2.subHeads = subHeads;
          format2.glyphs = glyphs;
        } else if (subTable.format === 4) {
          var format4 = subTable;
          format4.length = reader.readUint16();
          format4.language = reader.readUint16();
          format4.segCountX2 = reader.readUint16();
          format4.searchRange = reader.readUint16();
          format4.entrySelector = reader.readUint16();
          format4.rangeShift = reader.readUint16();
          var segCount = format4.segCountX2 / 2;
          var endCode = [];
          for (i = 0; i < segCount; ++i) {
            endCode.push(reader.readUint16());
          }
          format4.endCode = endCode;
          format4.reservedPad = reader.readUint16();
          var startCode = [];
          for (i = 0; i < segCount; ++i) {
            startCode.push(reader.readUint16());
          }
          format4.startCode = startCode;
          var idDelta = [];
          for (i = 0; i < segCount; ++i) {
            idDelta.push(reader.readUint16());
          }
          format4.idDelta = idDelta;
          format4.idRangeOffsetOffset = reader.offset;
          var idRangeOffset = [];
          for (i = 0; i < segCount; ++i) {
            idRangeOffset.push(reader.readUint16());
          }
          format4.idRangeOffset = idRangeOffset;
          glyphCount = (format4.length - (reader.offset - startOffset)) / 2;
          format4.glyphIdArrayOffset = reader.offset;
          glyphIdArray = [];
          for (i = 0; i < glyphCount; ++i) {
            glyphIdArray.push(reader.readUint16());
          }
          format4.glyphIdArray = glyphIdArray;
        } else if (subTable.format === 6) {
          var format6 = subTable;
          format6.length = reader.readUint16();
          format6.language = reader.readUint16();
          format6.firstCode = reader.readUint16();
          format6.entryCount = reader.readUint16();
          format6.glyphIdArrayOffset = reader.offset;
          var glyphIndexArray = [];
          var entryCount = format6.entryCount;
          for (i = 0; i < entryCount; ++i) {
            glyphIndexArray.push(reader.readUint16());
          }
          format6.glyphIdArray = glyphIndexArray;
        } else if (subTable.format === 12) {
          var format12 = subTable;
          format12.reserved = reader.readUint16();
          format12.length = reader.readUint32();
          format12.language = reader.readUint32();
          format12.nGroups = reader.readUint32();
          var groups = [];
          var nGroups = format12.nGroups;
          for (i = 0; i < nGroups; ++i) {
            var group = {};
            group.start = reader.readUint32();
            group.end = reader.readUint32();
            group.startId = reader.readUint32();
            groups.push(group);
          }
          format12.groups = groups;
        } else if (subTable.format === 14) {
          var format14 = subTable;
          format14.length = reader.readUint32();
          var numVarSelectorRecords = reader.readUint32();
          var _groups = [];
          var offset = reader.offset;
          for (var _i2 = 0; _i2 < numVarSelectorRecords; _i2++) {
            var varSelector = reader.readUint24(offset);
            var defaultUVSOffset = reader.readUint32(offset + 3);
            var nonDefaultUVSOffset = reader.readUint32(offset + 7);
            offset += 11;
            if (defaultUVSOffset) {
              var numUnicodeValueRanges = reader.readUint32(startOffset + defaultUVSOffset);
              for (var j = 0; j < numUnicodeValueRanges; j++) {
                var startUnicode = reader.readUint24();
                var additionalCount = reader.readUint8();
                _groups.push({
                  start: startUnicode,
                  end: startUnicode + additionalCount,
                  varSelector
                });
              }
            }
            if (nonDefaultUVSOffset) {
              var numUVSMappings = reader.readUint32(startOffset + nonDefaultUVSOffset);
              for (var _j = 0; _j < numUVSMappings; _j++) {
                var unicode = reader.readUint24();
                var glyphId = reader.readUint16();
                _groups.push({
                  unicode,
                  glyphId,
                  varSelector
                });
              }
            }
          }
          format14.groups = _groups;
        } else {
          console.warn("not support cmap format:" + subTable.format);
        }
      }
      function parse(reader, ttf) {
        var tcmap = {};
        var cmapOffset = this.offset;
        reader.seek(cmapOffset);
        tcmap.version = reader.readUint16();
        var numberSubtables = tcmap.numberSubtables = reader.readUint16();
        var subTables = tcmap.tables = [];
        var offset = reader.offset;
        for (var i = 0, l = numberSubtables; i < l; i++) {
          var subTable = {};
          subTable.platformID = reader.readUint16(offset);
          subTable.encodingID = reader.readUint16(offset + 2);
          subTable.offset = reader.readUint32(offset + 4);
          readSubTable(reader, ttf, subTable, cmapOffset);
          subTables.push(subTable);
          offset += 8;
        }
        var cmap = (0, _readWindowsAllCodes.default)(subTables, ttf);
        return cmap;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cmap/write.js
  var require_write = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cmap/write.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = write;
      function writeSubTable0(writer, unicodes) {
        writer.writeUint16(0);
        writer.writeUint16(262);
        writer.writeUint16(0);
        var i = -1;
        var unicode;
        while (unicode = unicodes.shift()) {
          while (++i < unicode[0]) {
            writer.writeUint8(0);
          }
          writer.writeUint8(unicode[1]);
          i = unicode[0];
        }
        while (++i < 256) {
          writer.writeUint8(0);
        }
        return writer;
      }
      function writeSubTable4(writer, segments) {
        writer.writeUint16(4);
        writer.writeUint16(24 + segments.length * 8);
        writer.writeUint16(0);
        var segCount = segments.length + 1;
        var maxExponent = Math.floor(Math.log(segCount) / Math.LN2);
        var searchRange = 2 * Math.pow(2, maxExponent);
        writer.writeUint16(segCount * 2);
        writer.writeUint16(searchRange);
        writer.writeUint16(maxExponent);
        writer.writeUint16(2 * segCount - searchRange);
        segments.forEach(function(segment) {
          writer.writeUint16(segment.end);
        });
        writer.writeUint16(65535);
        writer.writeUint16(0);
        segments.forEach(function(segment) {
          writer.writeUint16(segment.start);
        });
        writer.writeUint16(65535);
        segments.forEach(function(segment) {
          writer.writeUint16(segment.delta);
        });
        writer.writeUint16(1);
        for (var i = 0, l = segments.length; i < l; i++) {
          writer.writeUint16(0);
        }
        writer.writeUint16(0);
        return writer;
      }
      function writeSubTable12(writer, segments) {
        writer.writeUint16(12);
        writer.writeUint16(0);
        writer.writeUint32(16 + segments.length * 12);
        writer.writeUint32(0);
        writer.writeUint32(segments.length);
        segments.forEach(function(segment) {
          writer.writeUint32(segment.start);
          writer.writeUint32(segment.end);
          writer.writeUint32(segment.startId);
        });
        return writer;
      }
      function writeSubTableHeader(writer, platform, encoding, offset) {
        writer.writeUint16(platform);
        writer.writeUint16(encoding);
        writer.writeUint32(offset);
        return writer;
      }
      function write(writer, ttf) {
        var hasGLyphsOver2Bytes = ttf.support.cmap.hasGLyphsOver2Bytes;
        writer.writeUint16(0);
        writer.writeUint16(hasGLyphsOver2Bytes ? 4 : 3);
        var subTableOffset = 4 + (hasGLyphsOver2Bytes ? 32 : 24);
        var format4Size = ttf.support.cmap.format4Size;
        var format0Size = ttf.support.cmap.format0Size;
        writeSubTableHeader(writer, 0, 3, subTableOffset);
        writeSubTableHeader(writer, 1, 0, subTableOffset + format4Size);
        writeSubTableHeader(writer, 3, 1, subTableOffset);
        if (hasGLyphsOver2Bytes) {
          writeSubTableHeader(writer, 3, 10, subTableOffset + format4Size + format0Size);
        }
        writeSubTable4(writer, ttf.support.cmap.format4Segments);
        writeSubTable0(writer, ttf.support.cmap.format0Segments);
        if (hasGLyphsOver2Bytes) {
          writeSubTable12(writer, ttf.support.cmap.format12Segments);
        }
        return writer;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cmap/sizeof.js
  var require_sizeof = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cmap/sizeof.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = sizeof;
      function encodeDelta(delta) {
        return delta > 32767 ? delta - 65536 : delta < -32767 ? delta + 65536 : delta;
      }
      function getSegments(glyfUnicodes, bound) {
        var prevGlyph = null;
        var result = [];
        var segment = {};
        glyfUnicodes.forEach(function(glyph) {
          if (bound === void 0 || glyph.unicode <= bound) {
            if (prevGlyph === null || glyph.unicode !== prevGlyph.unicode + 1 || glyph.id !== prevGlyph.id + 1) {
              if (prevGlyph !== null) {
                segment.end = prevGlyph.unicode;
                result.push(segment);
                segment = {
                  start: glyph.unicode,
                  startId: glyph.id,
                  delta: encodeDelta(glyph.id - glyph.unicode)
                };
              } else {
                segment.start = glyph.unicode;
                segment.startId = glyph.id;
                segment.delta = encodeDelta(glyph.id - glyph.unicode);
              }
            }
            prevGlyph = glyph;
          }
        });
        if (prevGlyph !== null) {
          segment.end = prevGlyph.unicode;
          result.push(segment);
        }
        return result;
      }
      function getFormat0Segment(glyfUnicodes) {
        var unicodes = [];
        glyfUnicodes.forEach(function(u) {
          if (u.unicode !== void 0 && u.unicode < 256) {
            unicodes.push([u.unicode, u.id]);
          }
        });
        unicodes.sort(function(a, b) {
          return a[0] - b[0];
        });
        return unicodes;
      }
      function sizeof(ttf) {
        ttf.support.cmap = {};
        var glyfUnicodes = [];
        ttf.glyf.forEach(function(glyph, index) {
          var unicodes = glyph.unicode;
          if (typeof glyph.unicode === "number") {
            unicodes = [glyph.unicode];
          }
          if (unicodes && unicodes.length) {
            unicodes.forEach(function(unicode) {
              glyfUnicodes.push({
                unicode,
                id: unicode !== 65535 ? index : 0
              });
            });
          }
        });
        glyfUnicodes = glyfUnicodes.sort(function(a, b) {
          return a.unicode - b.unicode;
        });
        ttf.support.cmap.unicodes = glyfUnicodes;
        var unicodes2Bytes = glyfUnicodes;
        ttf.support.cmap.format4Segments = getSegments(unicodes2Bytes, 65535);
        ttf.support.cmap.format4Size = 24 + ttf.support.cmap.format4Segments.length * 8;
        ttf.support.cmap.format0Segments = getFormat0Segment(glyfUnicodes);
        ttf.support.cmap.format0Size = 262;
        var hasGLyphsOver2Bytes = unicodes2Bytes.some(function(glyph) {
          return glyph.unicode > 65535;
        });
        if (hasGLyphsOver2Bytes) {
          ttf.support.cmap.hasGLyphsOver2Bytes = hasGLyphsOver2Bytes;
          var unicodes4Bytes = glyfUnicodes;
          ttf.support.cmap.format12Segments = getSegments(unicodes4Bytes);
          ttf.support.cmap.format12Size = 16 + ttf.support.cmap.format12Segments.length * 12;
        }
        var size = 4 + (hasGLyphsOver2Bytes ? 32 : 24) + ttf.support.cmap.format0Size + ttf.support.cmap.format4Size + (hasGLyphsOver2Bytes ? ttf.support.cmap.format12Size : 0);
        return size;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cmap.js
  var require_cmap = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cmap.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _parse = _interopRequireDefault(require_parse());
      var _write = _interopRequireDefault(require_write());
      var _sizeof = _interopRequireDefault(require_sizeof());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("cmap", [], {
        write: _write.default,
        read: _parse.default,
        size: _sizeof.default
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/nameId.js
  var require_nameId = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/nameId.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var nameId = {
        0: "copyright",
        1: "fontFamily",
        2: "fontSubFamily",
        3: "uniqueSubFamily",
        4: "fullName",
        5: "version",
        6: "postScriptName",
        7: "tradeMark",
        8: "manufacturer",
        9: "designer",
        10: "description",
        11: "urlOfFontVendor",
        12: "urlOfFontDesigner",
        13: "licence",
        14: "urlOfLicence",
        16: "preferredFamily",
        17: "preferredSubFamily",
        18: "compatibleFull",
        19: "sampleText"
      };
      var nameIdHash = {};
      Object.keys(nameId).forEach(function(id) {
        nameIdHash[nameId[id]] = +id;
      });
      nameId.names = nameIdHash;
      var _default = exports.default = nameId;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/platform.js
  var require_platform = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/platform.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        Unicode: 0,
        Macintosh: 1,
        // mac
        reserved: 2,
        Microsoft: 3
        // win
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/encoding.js
  var require_encoding = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/encoding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.win = exports.mac = void 0;
      var mac = exports.mac = {
        "Default": 0,
        // default use
        "Version1.1": 1,
        "ISO10646": 2,
        "UnicodeBMP": 3,
        "UnicodenonBMP": 4,
        "UnicodeVariationSequences": 5,
        "FullUnicodecoverage": 6
      };
      var win = exports.win = {
        Symbol: 0,
        UCS2: 1,
        // default use
        ShiftJIS: 2,
        PRC: 3,
        BigFive: 4,
        Johab: 5,
        UCS4: 6
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/name.js
  var require_name = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/name.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _nameId = _interopRequireDefault(require_nameId());
      var _string = _interopRequireDefault(require_string());
      var _platform = _interopRequireDefault(require_platform());
      var _encoding = require_encoding();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("name", [], {
        read: function read2(reader) {
          var offset = this.offset;
          reader.seek(offset);
          var nameTbl = {};
          nameTbl.format = reader.readUint16();
          nameTbl.count = reader.readUint16();
          nameTbl.stringOffset = reader.readUint16();
          var nameRecordTbl = [];
          var count = nameTbl.count;
          var i;
          var nameRecord;
          for (i = 0; i < count; ++i) {
            nameRecord = {};
            nameRecord.platform = reader.readUint16();
            nameRecord.encoding = reader.readUint16();
            nameRecord.language = reader.readUint16();
            nameRecord.nameId = reader.readUint16();
            nameRecord.length = reader.readUint16();
            nameRecord.offset = reader.readUint16();
            nameRecordTbl.push(nameRecord);
          }
          offset += nameTbl.stringOffset;
          for (i = 0; i < count; ++i) {
            nameRecord = nameRecordTbl[i];
            nameRecord.name = reader.readBytes(offset + nameRecord.offset, nameRecord.length);
          }
          var names = {};
          var platform = _platform.default.Macintosh;
          var encoding = _encoding.mac.Default;
          var language = 0;
          if (nameRecordTbl.some(function(record) {
            return record.platform === _platform.default.Microsoft && record.encoding === _encoding.win.UCS2 && record.language === 1033;
          })) {
            platform = _platform.default.Microsoft;
            encoding = _encoding.win.UCS2;
            language = 1033;
          }
          for (i = 0; i < count; ++i) {
            nameRecord = nameRecordTbl[i];
            if (nameRecord.platform === platform && nameRecord.encoding === encoding && nameRecord.language === language && _nameId.default[nameRecord.nameId]) {
              names[_nameId.default[nameRecord.nameId]] = language === 0 ? _string.default.getUTF8String(nameRecord.name) : _string.default.getUCS2String(nameRecord.name);
            }
          }
          return names;
        },
        write: function write(writer, ttf) {
          var nameRecordTbl = ttf.support.name;
          writer.writeUint16(0);
          writer.writeUint16(nameRecordTbl.length);
          writer.writeUint16(6 + nameRecordTbl.length * 12);
          var offset = 0;
          nameRecordTbl.forEach(function(nameRecord) {
            writer.writeUint16(nameRecord.platform);
            writer.writeUint16(nameRecord.encoding);
            writer.writeUint16(nameRecord.language);
            writer.writeUint16(nameRecord.nameId);
            writer.writeUint16(nameRecord.name.length);
            writer.writeUint16(offset);
            offset += nameRecord.name.length;
          });
          nameRecordTbl.forEach(function(nameRecord) {
            writer.writeBytes(nameRecord.name);
          });
          return writer;
        },
        size: function size(ttf) {
          var names = ttf.name;
          var nameRecordTbl = [];
          var size2 = 6;
          Object.keys(names).forEach(function(name2) {
            var id = _nameId.default.names[name2];
            var utf8Bytes = _string.default.toUTF8Bytes(names[name2]);
            var usc2Bytes = _string.default.toUCS2Bytes(names[name2]);
            if (void 0 !== id) {
              nameRecordTbl.push({
                nameId: id,
                platform: 1,
                encoding: 0,
                language: 0,
                name: utf8Bytes
              });
              nameRecordTbl.push({
                nameId: id,
                platform: 3,
                encoding: 1,
                language: 1033,
                name: usc2Bytes
              });
              size2 += 12 * 2 + utf8Bytes.length + usc2Bytes.length;
            }
          });
          var namingOrder = ["platform", "encoding", "language", "nameId"];
          nameRecordTbl = nameRecordTbl.sort(function(a, b) {
            var l = 0;
            namingOrder.some(function(name2) {
              var o = a[name2] - b[name2];
              if (o) {
                l = o;
                return true;
              }
              return false;
            });
            return l;
          });
          ttf.support.name = nameRecordTbl;
          return size2;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/hhea.js
  var require_hhea = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/hhea.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("hhea", [["version", _struct.default.Fixed], ["ascent", _struct.default.Int16], ["descent", _struct.default.Int16], ["lineGap", _struct.default.Int16], ["advanceWidthMax", _struct.default.Uint16], ["minLeftSideBearing", _struct.default.Int16], ["minRightSideBearing", _struct.default.Int16], ["xMaxExtent", _struct.default.Int16], ["caretSlopeRise", _struct.default.Int16], ["caretSlopeRun", _struct.default.Int16], ["caretOffset", _struct.default.Int16], ["reserved0", _struct.default.Int16], ["reserved1", _struct.default.Int16], ["reserved2", _struct.default.Int16], ["reserved3", _struct.default.Int16], ["metricDataFormat", _struct.default.Int16], ["numOfLongHorMetrics", _struct.default.Uint16]]);
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/hmtx.js
  var require_hmtx = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/hmtx.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("hmtx", [], {
        read: function read2(reader, ttf) {
          var offset = this.offset;
          reader.seek(offset);
          var numOfLongHorMetrics = ttf.hhea.numOfLongHorMetrics;
          var hMetrics = [];
          var i;
          var hMetric;
          for (i = 0; i < numOfLongHorMetrics; ++i) {
            hMetric = {};
            hMetric.advanceWidth = reader.readUint16();
            hMetric.leftSideBearing = reader.readInt16();
            hMetrics.push(hMetric);
          }
          var advanceWidth = hMetrics[numOfLongHorMetrics - 1].advanceWidth;
          var numOfLast = ttf.maxp.numGlyphs - numOfLongHorMetrics;
          for (i = 0; i < numOfLast; ++i) {
            hMetric = {};
            hMetric.advanceWidth = advanceWidth;
            hMetric.leftSideBearing = reader.readInt16();
            hMetrics.push(hMetric);
          }
          return hMetrics;
        },
        write: function write(writer, ttf) {
          var i;
          var numOfLongHorMetrics = ttf.hhea.numOfLongHorMetrics;
          for (i = 0; i < numOfLongHorMetrics; ++i) {
            writer.writeUint16(ttf.glyf[i].advanceWidth);
            writer.writeInt16(ttf.glyf[i].leftSideBearing);
          }
          var numOfLast = ttf.glyf.length - numOfLongHorMetrics;
          for (i = 0; i < numOfLast; ++i) {
            writer.writeInt16(ttf.glyf[numOfLongHorMetrics + i].leftSideBearing);
          }
          return writer;
        },
        size: function size(ttf) {
          var numOfLast = 0;
          var advanceWidth = ttf.glyf[ttf.glyf.length - 1].advanceWidth;
          for (var i = ttf.glyf.length - 2; i >= 0; i--) {
            if (advanceWidth === ttf.glyf[i].advanceWidth) {
              numOfLast++;
            } else {
              break;
            }
          }
          ttf.hhea.numOfLongHorMetrics = ttf.glyf.length - numOfLast;
          return 4 * ttf.hhea.numOfLongHorMetrics + 2 * numOfLast;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/post.js
  var require_post = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/post.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      var _string = _interopRequireDefault(require_string());
      var _unicodeName = _interopRequireDefault(require_unicodeName());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var Posthead = _table.default.create("posthead", [["format", _struct.default.Fixed], ["italicAngle", _struct.default.Fixed], ["underlinePosition", _struct.default.Int16], ["underlineThickness", _struct.default.Int16], ["isFixedPitch", _struct.default.Uint32], ["minMemType42", _struct.default.Uint32], ["maxMemType42", _struct.default.Uint32], ["minMemType1", _struct.default.Uint32], ["maxMemType1", _struct.default.Uint32]]);
      var _default = exports.default = _table.default.create("post", [], {
        read: function read2(reader, ttf) {
          var format = reader.readFixed(this.offset);
          var tbl = new Posthead(this.offset).read(reader, ttf);
          if (format === 2) {
            var numberOfGlyphs = reader.readUint16();
            var glyphNameIndex = [];
            for (var i = 0; i < numberOfGlyphs; ++i) {
              glyphNameIndex.push(reader.readUint16());
            }
            var pascalStringOffset = reader.offset;
            var pascalStringLength = ttf.tables.post.length - (pascalStringOffset - this.offset);
            var pascalStringBytes = reader.readBytes(reader.offset, pascalStringLength);
            tbl.nameIndex = glyphNameIndex;
            tbl.names = _string.default.getPascalString(pascalStringBytes);
          } else if (format === 2.5) {
            tbl.format = 3;
          }
          return tbl;
        },
        write: function write(writer, ttf) {
          var post = ttf.post || {
            format: 3
          };
          writer.writeFixed(post.format);
          writer.writeFixed(post.italicAngle || 0);
          writer.writeInt16(post.underlinePosition || 0);
          writer.writeInt16(post.underlineThickness || 0);
          writer.writeUint32(post.isFixedPitch || 0);
          writer.writeUint32(post.minMemType42 || 0);
          writer.writeUint32(post.maxMemType42 || 0);
          writer.writeUint32(post.minMemType1 || 0);
          writer.writeUint32(post.maxMemType1 || 0);
          if (post.format === 2) {
            var numberOfGlyphs = ttf.glyf.length;
            writer.writeUint16(numberOfGlyphs);
            var nameIndex = ttf.support.post.nameIndex;
            for (var i = 0, l = nameIndex.length; i < l; i++) {
              writer.writeUint16(nameIndex[i]);
            }
            ttf.support.post.names.forEach(function(name2) {
              writer.writeBytes(name2);
            });
          }
        },
        size: function size(ttf) {
          var numberOfGlyphs = ttf.glyf.length;
          ttf.post = ttf.post || {};
          ttf.post.format = ttf.post.format || 3;
          ttf.post.maxMemType1 = numberOfGlyphs;
          if (ttf.post.format === 3 || ttf.post.format === 1) {
            return 32;
          }
          var size2 = 34 + numberOfGlyphs * 2;
          var glyphNames = [];
          var nameIndexArr = [];
          var nameIndex = 0;
          for (var i = 0; i < numberOfGlyphs; i++) {
            if (i === 0) {
              nameIndexArr.push(0);
            } else {
              var glyf = ttf.glyf[i];
              var unicode = glyf.unicode ? glyf.unicode[0] : 0;
              var unicodeNameIndex = _unicodeName.default[unicode];
              if (void 0 !== unicodeNameIndex) {
                nameIndexArr.push(unicodeNameIndex);
              } else {
                var name2 = glyf.name;
                if (!name2 || name2.charCodeAt(0) < 32) {
                  nameIndexArr.push(258 + nameIndex++);
                  glyphNames.push([0]);
                  size2++;
                } else {
                  nameIndexArr.push(258 + nameIndex++);
                  var bytes = _string.default.toPascalStringBytes(name2);
                  glyphNames.push(bytes);
                  size2 += bytes.length;
                }
              }
            }
          }
          ttf.support.post = {
            nameIndex: nameIndexArr,
            names: glyphNames
          };
          return size2;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/OS2.js
  var require_OS2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/OS2.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("OS/2", [
        ["version", _struct.default.Uint16],
        ["xAvgCharWidth", _struct.default.Int16],
        ["usWeightClass", _struct.default.Uint16],
        ["usWidthClass", _struct.default.Uint16],
        ["fsType", _struct.default.Uint16],
        ["ySubscriptXSize", _struct.default.Uint16],
        ["ySubscriptYSize", _struct.default.Uint16],
        ["ySubscriptXOffset", _struct.default.Uint16],
        ["ySubscriptYOffset", _struct.default.Uint16],
        ["ySuperscriptXSize", _struct.default.Uint16],
        ["ySuperscriptYSize", _struct.default.Uint16],
        ["ySuperscriptXOffset", _struct.default.Uint16],
        ["ySuperscriptYOffset", _struct.default.Uint16],
        ["yStrikeoutSize", _struct.default.Uint16],
        ["yStrikeoutPosition", _struct.default.Uint16],
        ["sFamilyClass", _struct.default.Uint16],
        // Panose
        ["bFamilyType", _struct.default.Uint8],
        ["bSerifStyle", _struct.default.Uint8],
        ["bWeight", _struct.default.Uint8],
        ["bProportion", _struct.default.Uint8],
        ["bContrast", _struct.default.Uint8],
        ["bStrokeVariation", _struct.default.Uint8],
        ["bArmStyle", _struct.default.Uint8],
        ["bLetterform", _struct.default.Uint8],
        ["bMidline", _struct.default.Uint8],
        ["bXHeight", _struct.default.Uint8],
        // unicode range
        ["ulUnicodeRange1", _struct.default.Uint32],
        ["ulUnicodeRange2", _struct.default.Uint32],
        ["ulUnicodeRange3", _struct.default.Uint32],
        ["ulUnicodeRange4", _struct.default.Uint32],
        // char 4
        ["achVendID", _struct.default.String, 4],
        ["fsSelection", _struct.default.Uint16],
        ["usFirstCharIndex", _struct.default.Uint16],
        ["usLastCharIndex", _struct.default.Uint16],
        ["sTypoAscender", _struct.default.Int16],
        ["sTypoDescender", _struct.default.Int16],
        ["sTypoLineGap", _struct.default.Int16],
        ["usWinAscent", _struct.default.Uint16],
        ["usWinDescent", _struct.default.Uint16],
        // version 0 above 39
        ["ulCodePageRange1", _struct.default.Uint32],
        ["ulCodePageRange2", _struct.default.Uint32],
        // version 1 above 41
        ["sxHeight", _struct.default.Int16],
        ["sCapHeight", _struct.default.Int16],
        ["usDefaultChar", _struct.default.Uint16],
        ["usBreakChar", _struct.default.Uint16],
        ["usMaxContext", _struct.default.Uint16]
        // version 2,3,4 above 46
      ], {
        read: function read2(reader, ttf) {
          var format = reader.readUint16(this.offset);
          var struct = this.struct;
          if (format === 0) {
            struct = struct.slice(0, 39);
          } else if (format === 1) {
            struct = struct.slice(0, 41);
          }
          var OS2Head = _table.default.create("os2head", struct);
          var tbl = new OS2Head(this.offset).read(reader, ttf);
          var os2Fields = {
            ulCodePageRange1: 1,
            ulCodePageRange2: 0,
            sxHeight: 0,
            sCapHeight: 0,
            usDefaultChar: 0,
            usBreakChar: 32,
            usMaxContext: 0
          };
          return Object.assign(os2Fields, tbl);
        },
        size: function size(ttf) {
          var xMin = 16384;
          var yMin = 16384;
          var xMax = -16384;
          var yMax = -16384;
          var advanceWidthMax = -1;
          var minLeftSideBearing = 16384;
          var minRightSideBearing = 16384;
          var xMaxExtent = -16384;
          var xAvgCharWidth = 0;
          var usFirstCharIndex = 1114111;
          var usLastCharIndex = -1;
          var maxPoints = 0;
          var maxContours = 0;
          var maxCompositePoints = 0;
          var maxCompositeContours = 0;
          var maxSizeOfInstructions = 0;
          var maxComponentElements = 0;
          var glyfNotEmpty = 0;
          var hinting = ttf.writeOptions ? ttf.writeOptions.hinting : false;
          if (hinting) {
            if (ttf.cvt) {
              maxSizeOfInstructions = Math.max(maxSizeOfInstructions, ttf.cvt.length);
            }
            if (ttf.prep) {
              maxSizeOfInstructions = Math.max(maxSizeOfInstructions, ttf.prep.length);
            }
            if (ttf.fpgm) {
              maxSizeOfInstructions = Math.max(maxSizeOfInstructions, ttf.fpgm.length);
            }
          }
          ttf.glyf.forEach(function(glyf) {
            if (glyf.compound) {
              var compositeContours = 0;
              var compositePoints = 0;
              glyf.glyfs.forEach(function(g) {
                var cglyf = ttf.glyf[g.glyphIndex];
                if (!cglyf) {
                  return;
                }
                compositeContours += cglyf.contours ? cglyf.contours.length : 0;
                if (cglyf.contours && cglyf.contours.length) {
                  cglyf.contours.forEach(function(contour) {
                    compositePoints += contour.length;
                  });
                }
              });
              maxComponentElements = Math.max(maxComponentElements, glyf.glyfs.length);
              maxCompositePoints = Math.max(maxCompositePoints, compositePoints);
              maxCompositeContours = Math.max(maxCompositeContours, compositeContours);
            } else if (glyf.contours && glyf.contours.length) {
              maxContours = Math.max(maxContours, glyf.contours.length);
              var points = 0;
              glyf.contours.forEach(function(contour) {
                points += contour.length;
              });
              maxPoints = Math.max(maxPoints, points);
            }
            if (hinting && glyf.instructions) {
              maxSizeOfInstructions = Math.max(maxSizeOfInstructions, glyf.instructions.length);
            }
            if (null != glyf.xMin && glyf.xMin < xMin) {
              xMin = glyf.xMin;
            }
            if (null != glyf.yMin && glyf.yMin < yMin) {
              yMin = glyf.yMin;
            }
            if (null != glyf.xMax && glyf.xMax > xMax) {
              xMax = glyf.xMax;
            }
            if (null != glyf.yMax && glyf.yMax > yMax) {
              yMax = glyf.yMax;
            }
            advanceWidthMax = Math.max(advanceWidthMax, glyf.advanceWidth);
            minLeftSideBearing = Math.min(minLeftSideBearing, glyf.leftSideBearing);
            if (null != glyf.xMax) {
              minRightSideBearing = Math.min(minRightSideBearing, glyf.advanceWidth - glyf.xMax);
              xMaxExtent = Math.max(xMaxExtent, glyf.xMax);
            }
            if (null != glyf.advanceWidth) {
              xAvgCharWidth += glyf.advanceWidth;
              glyfNotEmpty++;
            }
            var unicodes = glyf.unicode;
            if (typeof glyf.unicode === "number") {
              unicodes = [glyf.unicode];
            }
            if (Array.isArray(unicodes)) {
              unicodes.forEach(function(unicode) {
                if (unicode !== 65535) {
                  usFirstCharIndex = Math.min(usFirstCharIndex, unicode);
                  usLastCharIndex = Math.max(usLastCharIndex, unicode);
                }
              });
            }
          });
          ttf["OS/2"].version = 4;
          ttf["OS/2"].achVendID = (ttf["OS/2"].achVendID + "    ").slice(0, 4);
          ttf["OS/2"].xAvgCharWidth = xAvgCharWidth / (glyfNotEmpty || 1);
          ttf["OS/2"].ulUnicodeRange2 = 268435456;
          ttf["OS/2"].usFirstCharIndex = usFirstCharIndex;
          ttf["OS/2"].usLastCharIndex = usLastCharIndex;
          ttf.hhea.version = ttf.hhea.version || 1;
          ttf.hhea.advanceWidthMax = advanceWidthMax;
          ttf.hhea.minLeftSideBearing = minLeftSideBearing;
          ttf.hhea.minRightSideBearing = minRightSideBearing;
          ttf.hhea.xMaxExtent = xMaxExtent;
          ttf.head.version = ttf.head.version || 1;
          ttf.head.lowestRecPPEM = ttf.head.lowestRecPPEM || 8;
          ttf.head.xMin = xMin;
          ttf.head.yMin = yMin;
          ttf.head.xMax = xMax;
          ttf.head.yMax = yMax;
          if (ttf.support.head) {
            var _ttf$support$head = ttf.support.head, _xMin = _ttf$support$head.xMin, _yMin = _ttf$support$head.yMin, _xMax = _ttf$support$head.xMax, _yMax = _ttf$support$head.yMax;
            if (_xMin != null) {
              ttf.head.xMin = _xMin;
            }
            if (_yMin != null) {
              ttf.head.yMin = _yMin;
            }
            if (_xMax != null) {
              ttf.head.xMax = _xMax;
            }
            if (_yMax != null) {
              ttf.head.yMax = _yMax;
            }
          }
          if (ttf.support.hhea) {
            var _ttf$support$hhea = ttf.support.hhea, _advanceWidthMax = _ttf$support$hhea.advanceWidthMax, _xMaxExtent = _ttf$support$hhea.xMaxExtent, _minLeftSideBearing = _ttf$support$hhea.minLeftSideBearing, _minRightSideBearing = _ttf$support$hhea.minRightSideBearing;
            if (_advanceWidthMax != null) {
              ttf.hhea.advanceWidthMax = _advanceWidthMax;
            }
            if (_xMaxExtent != null) {
              ttf.hhea.xMaxExtent = _xMaxExtent;
            }
            if (_minLeftSideBearing != null) {
              ttf.hhea.minLeftSideBearing = _minLeftSideBearing;
            }
            if (_minRightSideBearing != null) {
              ttf.hhea.minRightSideBearing = _minRightSideBearing;
            }
          }
          ttf.maxp = ttf.maxp || {};
          ttf.support.maxp = {
            version: 1,
            numGlyphs: ttf.glyf.length,
            maxPoints,
            maxContours,
            maxCompositePoints,
            maxCompositeContours,
            maxZones: ttf.maxp.maxZones || 0,
            maxTwilightPoints: ttf.maxp.maxTwilightPoints || 0,
            maxStorage: ttf.maxp.maxStorage || 0,
            maxFunctionDefs: ttf.maxp.maxFunctionDefs || 0,
            maxStackElements: ttf.maxp.maxStackElements || 0,
            maxSizeOfInstructions,
            maxComponentElements,
            maxComponentDepth: maxComponentElements ? 1 : 0
          };
          return _table.default.size.call(this, ttf);
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/encoding.js
  var require_encoding2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/encoding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var cffStandardEncoding = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quoteright", "parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater", "question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore", "quoteleft", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "exclamdown", "cent", "sterling", "fraction", "yen", "florin", "section", "currency", "quotesingle", "quotedblleft", "guillemotleft", "guilsinglleft", "guilsinglright", "fi", "fl", "", "endash", "dagger", "daggerdbl", "periodcentered", "", "paragraph", "bullet", "quotesinglbase", "quotedblbase", "quotedblright", "guillemotright", "ellipsis", "perthousand", "", "questiondown", "", "grave", "acute", "circumflex", "tilde", "macron", "breve", "dotaccent", "dieresis", "", "ring", "cedilla", "", "hungarumlaut", "ogonek", "caron", "emdash", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "AE", "", "ordfeminine", "", "", "", "", "Lslash", "Oslash", "OE", "ordmasculine", "", "", "", "", "", "ae", "", "", "", "dotlessi", "", "", "lslash", "oslash", "oe", "germandbls"];
      var cffExpertEncoding = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "space", "exclamsmall", "Hungarumlautsmall", "", "dollaroldstyle", "dollarsuperior", "ampersandsmall", "Acutesmall", "parenleftsuperior", "parenrightsuperior", "twodotenleader", "onedotenleader", "comma", "hyphen", "period", "fraction", "zerooldstyle", "oneoldstyle", "twooldstyle", "threeoldstyle", "fouroldstyle", "fiveoldstyle", "sixoldstyle", "sevenoldstyle", "eightoldstyle", "nineoldstyle", "colon", "semicolon", "commasuperior", "threequartersemdash", "periodsuperior", "questionsmall", "", "asuperior", "bsuperior", "centsuperior", "dsuperior", "esuperior", "", "", "isuperior", "", "", "lsuperior", "msuperior", "nsuperior", "osuperior", "", "", "rsuperior", "ssuperior", "tsuperior", "", "ff", "fi", "fl", "ffi", "ffl", "parenleftinferior", "", "parenrightinferior", "Circumflexsmall", "hyphensuperior", "Gravesmall", "Asmall", "Bsmall", "Csmall", "Dsmall", "Esmall", "Fsmall", "Gsmall", "Hsmall", "Ismall", "Jsmall", "Ksmall", "Lsmall", "Msmall", "Nsmall", "Osmall", "Psmall", "Qsmall", "Rsmall", "Ssmall", "Tsmall", "Usmall", "Vsmall", "Wsmall", "Xsmall", "Ysmall", "Zsmall", "colonmonetary", "onefitted", "rupiah", "Tildesmall", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "exclamdownsmall", "centoldstyle", "Lslashsmall", "", "", "Scaronsmall", "Zcaronsmall", "Dieresissmall", "Brevesmall", "Caronsmall", "", "Dotaccentsmall", "", "", "Macronsmall", "", "", "figuredash", "hypheninferior", "", "", "Ogoneksmall", "Ringsmall", "Cedillasmall", "", "", "", "onequarter", "onehalf", "threequarters", "questiondownsmall", "oneeighth", "threeeighths", "fiveeighths", "seveneighths", "onethird", "twothirds", "", "", "zerosuperior", "onesuperior", "twosuperior", "threesuperior", "foursuperior", "fivesuperior", "sixsuperior", "sevensuperior", "eightsuperior", "ninesuperior", "zeroinferior", "oneinferior", "twoinferior", "threeinferior", "fourinferior", "fiveinferior", "sixinferior", "seveninferior", "eightinferior", "nineinferior", "centinferior", "dollarinferior", "periodinferior", "commainferior", "Agravesmall", "Aacutesmall", "Acircumflexsmall", "Atildesmall", "Adieresissmall", "Aringsmall", "AEsmall", "Ccedillasmall", "Egravesmall", "Eacutesmall", "Ecircumflexsmall", "Edieresissmall", "Igravesmall", "Iacutesmall", "Icircumflexsmall", "Idieresissmall", "Ethsmall", "Ntildesmall", "Ogravesmall", "Oacutesmall", "Ocircumflexsmall", "Otildesmall", "Odieresissmall", "OEsmall", "Oslashsmall", "Ugravesmall", "Uacutesmall", "Ucircumflexsmall", "Udieresissmall", "Yacutesmall", "Thornsmall", "Ydieresissmall"];
      var _default = exports.default = {
        standardEncoding: cffStandardEncoding,
        expertEncoding: cffExpertEncoding
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/cffStandardStrings.js
  var require_cffStandardStrings = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/cffStandardStrings.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var cffStandardStrings = [".notdef", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quoteright", "parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater", "question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore", "quoteleft", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "exclamdown", "cent", "sterling", "fraction", "yen", "florin", "section", "currency", "quotesingle", "quotedblleft", "guillemotleft", "guilsinglleft", "guilsinglright", "fi", "fl", "endash", "dagger", "daggerdbl", "periodcentered", "paragraph", "bullet", "quotesinglbase", "quotedblbase", "quotedblright", "guillemotright", "ellipsis", "perthousand", "questiondown", "grave", "acute", "circumflex", "tilde", "macron", "breve", "dotaccent", "dieresis", "ring", "cedilla", "hungarumlaut", "ogonek", "caron", "emdash", "AE", "ordfeminine", "Lslash", "Oslash", "OE", "ordmasculine", "ae", "dotlessi", "lslash", "oslash", "oe", "germandbls", "onesuperior", "logicalnot", "mu", "trademark", "Eth", "onehalf", "plusminus", "Thorn", "onequarter", "divide", "brokenbar", "degree", "thorn", "threequarters", "twosuperior", "registered", "minus", "eth", "multiply", "threesuperior", "copyright", "Aacute", "Acircumflex", "Adieresis", "Agrave", "Aring", "Atilde", "Ccedilla", "Eacute", "Ecircumflex", "Edieresis", "Egrave", "Iacute", "Icircumflex", "Idieresis", "Igrave", "Ntilde", "Oacute", "Ocircumflex", "Odieresis", "Ograve", "Otilde", "Scaron", "Uacute", "Ucircumflex", "Udieresis", "Ugrave", "Yacute", "Ydieresis", "Zcaron", "aacute", "acircumflex", "adieresis", "agrave", "aring", "atilde", "ccedilla", "eacute", "ecircumflex", "edieresis", "egrave", "iacute", "icircumflex", "idieresis", "igrave", "ntilde", "oacute", "ocircumflex", "odieresis", "ograve", "otilde", "scaron", "uacute", "ucircumflex", "udieresis", "ugrave", "yacute", "ydieresis", "zcaron", "exclamsmall", "Hungarumlautsmall", "dollaroldstyle", "dollarsuperior", "ampersandsmall", "Acutesmall", "parenleftsuperior", "parenrightsuperior", "266 ff", "onedotenleader", "zerooldstyle", "oneoldstyle", "twooldstyle", "threeoldstyle", "fouroldstyle", "fiveoldstyle", "sixoldstyle", "sevenoldstyle", "eightoldstyle", "nineoldstyle", "commasuperior", "threequartersemdash", "periodsuperior", "questionsmall", "asuperior", "bsuperior", "centsuperior", "dsuperior", "esuperior", "isuperior", "lsuperior", "msuperior", "nsuperior", "osuperior", "rsuperior", "ssuperior", "tsuperior", "ff", "ffi", "ffl", "parenleftinferior", "parenrightinferior", "Circumflexsmall", "hyphensuperior", "Gravesmall", "Asmall", "Bsmall", "Csmall", "Dsmall", "Esmall", "Fsmall", "Gsmall", "Hsmall", "Ismall", "Jsmall", "Ksmall", "Lsmall", "Msmall", "Nsmall", "Osmall", "Psmall", "Qsmall", "Rsmall", "Ssmall", "Tsmall", "Usmall", "Vsmall", "Wsmall", "Xsmall", "Ysmall", "Zsmall", "colonmonetary", "onefitted", "rupiah", "Tildesmall", "exclamdownsmall", "centoldstyle", "Lslashsmall", "Scaronsmall", "Zcaronsmall", "Dieresissmall", "Brevesmall", "Caronsmall", "Dotaccentsmall", "Macronsmall", "figuredash", "hypheninferior", "Ogoneksmall", "Ringsmall", "Cedillasmall", "questiondownsmall", "oneeighth", "threeeighths", "fiveeighths", "seveneighths", "onethird", "twothirds", "zerosuperior", "foursuperior", "fivesuperior", "sixsuperior", "sevensuperior", "eightsuperior", "ninesuperior", "zeroinferior", "oneinferior", "twoinferior", "threeinferior", "fourinferior", "fiveinferior", "sixinferior", "seveninferior", "eightinferior", "nineinferior", "centinferior", "dollarinferior", "periodinferior", "commainferior", "Agravesmall", "Aacutesmall", "Acircumflexsmall", "Atildesmall", "Adieresissmall", "Aringsmall", "AEsmall", "Ccedillasmall", "Egravesmall", "Eacutesmall", "Ecircumflexsmall", "Edieresissmall", "Igravesmall", "Iacutesmall", "Icircumflexsmall", "Idieresissmall", "Ethsmall", "Ntildesmall", "Ogravesmall", "Oacutesmall", "Ocircumflexsmall", "Otildesmall", "Odieresissmall", "OEsmall", "Oslashsmall", "Ugravesmall", "Uacutesmall", "Ucircumflexsmall", "Udieresissmall", "Yacutesmall", "Thornsmall", "Ydieresissmall", "001.000", "001.001", "001.002", "001.003", "Black", "Bold", "Book", "Light", "Medium", "Regular", "Roman", "Semibold"];
      var _default = exports.default = cffStandardStrings;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/getCFFString.js
  var require_getCFFString = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/getCFFString.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = getCFFString;
      var _cffStandardStrings = _interopRequireDefault(require_cffStandardStrings());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function getCFFString(strings, index) {
        if (index <= 390) {
          index = _cffStandardStrings.default[index];
        } else {
          index = strings[index - 391];
        }
        return index;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFDict.js
  var require_parseCFFDict = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFDict.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _getCFFString = _interopRequireDefault(require_getCFFString());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TOP_DICT_META = [{
        name: "version",
        op: 0,
        type: "SID"
      }, {
        name: "notice",
        op: 1,
        type: "SID"
      }, {
        name: "copyright",
        op: 1200,
        type: "SID"
      }, {
        name: "fullName",
        op: 2,
        type: "SID"
      }, {
        name: "familyName",
        op: 3,
        type: "SID"
      }, {
        name: "weight",
        op: 4,
        type: "SID"
      }, {
        name: "isFixedPitch",
        op: 1201,
        type: "number",
        value: 0
      }, {
        name: "italicAngle",
        op: 1202,
        type: "number",
        value: 0
      }, {
        name: "underlinePosition",
        op: 1203,
        type: "number",
        value: -100
      }, {
        name: "underlineThickness",
        op: 1204,
        type: "number",
        value: 50
      }, {
        name: "paintType",
        op: 1205,
        type: "number",
        value: 0
      }, {
        name: "charstringType",
        op: 1206,
        type: "number",
        value: 2
      }, {
        name: "fontMatrix",
        op: 1207,
        type: ["real", "real", "real", "real", "real", "real"],
        value: [1e-3, 0, 0, 1e-3, 0, 0]
      }, {
        name: "uniqueId",
        op: 13,
        type: "number"
      }, {
        name: "fontBBox",
        op: 5,
        type: ["number", "number", "number", "number"],
        value: [0, 0, 0, 0]
      }, {
        name: "strokeWidth",
        op: 1208,
        type: "number",
        value: 0
      }, {
        name: "xuid",
        op: 14,
        type: [],
        value: null
      }, {
        name: "charset",
        op: 15,
        type: "offset",
        value: 0
      }, {
        name: "encoding",
        op: 16,
        type: "offset",
        value: 0
      }, {
        name: "charStrings",
        op: 17,
        type: "offset",
        value: 0
      }, {
        name: "private",
        op: 18,
        type: ["number", "offset"],
        value: [0, 0]
      }];
      var PRIVATE_DICT_META = [{
        name: "subrs",
        op: 19,
        type: "offset",
        value: 0
      }, {
        name: "defaultWidthX",
        op: 20,
        type: "number",
        value: 0
      }, {
        name: "nominalWidthX",
        op: 21,
        type: "number",
        value: 0
      }];
      function entriesToObject(entries) {
        var hash = {};
        for (var i = 0, l = entries.length; i < l; i++) {
          var key = entries[i][0];
          if (void 0 !== hash[key]) {
            console.warn("dict already has key:" + key);
            continue;
          }
          var values = entries[i][1];
          hash[key] = values.length === 1 ? values[0] : values;
        }
        return hash;
      }
      function parseFloatOperand(reader) {
        var s = "";
        var eof = 15;
        var lookup = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E", "E-", null, "-"];
        while (true) {
          var b = reader.readUint8();
          var n1 = b >> 4;
          var n2 = b & 15;
          if (n1 === eof) {
            break;
          }
          s += lookup[n1];
          if (n2 === eof) {
            break;
          }
          s += lookup[n2];
        }
        return parseFloat(s);
      }
      function parseOperand(reader, b0) {
        var b1;
        var b2;
        var b3;
        var b4;
        if (b0 === 28) {
          b1 = reader.readUint8();
          b2 = reader.readUint8();
          return b1 << 8 | b2;
        }
        if (b0 === 29) {
          b1 = reader.readUint8();
          b2 = reader.readUint8();
          b3 = reader.readUint8();
          b4 = reader.readUint8();
          return b1 << 24 | b2 << 16 | b3 << 8 | b4;
        }
        if (b0 === 30) {
          return parseFloatOperand(reader);
        }
        if (b0 >= 32 && b0 <= 246) {
          return b0 - 139;
        }
        if (b0 >= 247 && b0 <= 250) {
          b1 = reader.readUint8();
          return (b0 - 247) * 256 + b1 + 108;
        }
        if (b0 >= 251 && b0 <= 254) {
          b1 = reader.readUint8();
          return -(b0 - 251) * 256 - b1 - 108;
        }
        throw new Error("invalid b0 " + b0 + ",at:" + reader.offset);
      }
      function interpretDict(dict, meta, strings) {
        var newDict = {};
        for (var i = 0, l = meta.length; i < l; i++) {
          var m = meta[i];
          var value = dict[m.op];
          if (value === void 0) {
            value = m.value !== void 0 ? m.value : null;
          }
          if (m.type === "SID") {
            value = (0, _getCFFString.default)(strings, value);
          }
          newDict[m.name] = value;
        }
        return newDict;
      }
      function parseCFFDict(reader, offset, length) {
        if (null != offset) {
          reader.seek(offset);
        }
        var entries = [];
        var operands = [];
        var lastOffset = reader.offset + (null != length ? length : reader.length);
        while (reader.offset < lastOffset) {
          var op = reader.readUint8();
          if (op <= 21) {
            if (op === 12) {
              op = 1200 + reader.readUint8();
            }
            entries.push([op, operands]);
            operands = [];
          } else {
            operands.push(parseOperand(reader, op));
          }
        }
        return entriesToObject(entries);
      }
      function parseTopDict(reader, start, length, strings) {
        var dict = parseCFFDict(reader, start || 0, length || reader.length);
        return interpretDict(dict, TOP_DICT_META, strings);
      }
      function parsePrivateDict(reader, start, length, strings) {
        var dict = parseCFFDict(reader, start || 0, length || reader.length);
        return interpretDict(dict, PRIVATE_DICT_META, strings);
      }
      var _default = exports.default = {
        parseTopDict,
        parsePrivateDict
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFGlyph.js
  var require_parseCFFGlyph = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFGlyph.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parseCFFCharstring;
      function parseCFFCharstring(code, font, index) {
        var c1x;
        var c1y;
        var c2x;
        var c2y;
        var contours = [];
        var contour = [];
        var stack = [];
        var glyfs = [];
        var nStems = 0;
        var haveWidth = false;
        var width = font.defaultWidthX;
        var open = false;
        var x = 0;
        var y = 0;
        function lineTo(x2, y2) {
          contour.push({
            onCurve: true,
            x: x2,
            y: y2
          });
        }
        function curveTo(c1x2, c1y2, c2x2, c2y2, x2, y2) {
          contour.push({
            x: c1x2,
            y: c1y2
          });
          contour.push({
            x: c2x2,
            y: c2y2
          });
          contour.push({
            onCurve: true,
            x: x2,
            y: y2
          });
        }
        function newContour(x2, y2) {
          if (open) {
            contours.push(contour);
          }
          contour = [];
          lineTo(x2, y2);
          open = true;
        }
        function parseStems() {
          var hasWidthArg = stack.length % 2 !== 0;
          if (hasWidthArg && !haveWidth) {
            width = stack.shift() + font.nominalWidthX;
          }
          nStems += stack.length >> 1;
          stack.length = 0;
          haveWidth = true;
        }
        function parse(code2) {
          var b1;
          var b2;
          var b3;
          var b4;
          var codeIndex;
          var subrCode;
          var jpx;
          var jpy;
          var c3x;
          var c3y;
          var c4x;
          var c4y;
          var i = 0;
          while (i < code2.length) {
            var v = code2[i];
            i += 1;
            switch (v) {
              case 1:
                parseStems();
                break;
              case 3:
                parseStems();
                break;
              case 4:
                if (stack.length > 1 && !haveWidth) {
                  width = stack.shift() + font.nominalWidthX;
                  haveWidth = true;
                }
                y += stack.pop();
                newContour(x, y);
                break;
              case 5:
                while (stack.length > 0) {
                  x += stack.shift();
                  y += stack.shift();
                  lineTo(x, y);
                }
                break;
              case 6:
                while (stack.length > 0) {
                  x += stack.shift();
                  lineTo(x, y);
                  if (stack.length === 0) {
                    break;
                  }
                  y += stack.shift();
                  lineTo(x, y);
                }
                break;
              case 7:
                while (stack.length > 0) {
                  y += stack.shift();
                  lineTo(x, y);
                  if (stack.length === 0) {
                    break;
                  }
                  x += stack.shift();
                  lineTo(x, y);
                }
                break;
              case 8:
                while (stack.length > 0) {
                  c1x = x + stack.shift();
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x + stack.shift();
                  y = c2y + stack.shift();
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
              case 10:
                codeIndex = stack.pop() + font.subrsBias;
                subrCode = font.subrs[codeIndex];
                if (subrCode) {
                  parse(subrCode);
                }
                break;
              case 11:
                return;
              case 12:
                v = code2[i];
                i += 1;
                switch (v) {
                  case 35:
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y + stack.shift();
                    c3x = jpx + stack.shift();
                    c3y = jpy + stack.shift();
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    x = c4x + stack.shift();
                    y = c4y + stack.shift();
                    stack.shift();
                    curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    curveTo(c3x, c3y, c4x, c4y, x, y);
                    break;
                  case 34:
                    c1x = x + stack.shift();
                    c1y = y;
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y;
                    c3x = jpx + stack.shift();
                    c3y = c2y;
                    c4x = c3x + stack.shift();
                    c4y = y;
                    x = c4x + stack.shift();
                    curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    curveTo(c3x, c3y, c4x, c4y, x, y);
                    break;
                  case 36:
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y;
                    c3x = jpx + stack.shift();
                    c3y = c2y;
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    x = c4x + stack.shift();
                    curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    curveTo(c3x, c3y, c4x, c4y, x, y);
                    break;
                  case 37:
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    jpx = c2x + stack.shift();
                    jpy = c2y + stack.shift();
                    c3x = jpx + stack.shift();
                    c3y = jpy + stack.shift();
                    c4x = c3x + stack.shift();
                    c4y = c3y + stack.shift();
                    if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
                      x = c4x + stack.shift();
                    } else {
                      y = c4y + stack.shift();
                    }
                    curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                    curveTo(c3x, c3y, c4x, c4y, x, y);
                    break;
                  default:
                    console.warn("Glyph " + index + ": unknown operator " + (1200 + v));
                    stack.length = 0;
                }
                break;
              case 14:
                if (stack.length === 1 && !haveWidth) {
                  width = stack.shift() + font.nominalWidthX;
                  haveWidth = true;
                } else if (stack.length === 4) {
                  glyfs[1] = {
                    glyphIndex: font.charset.indexOf(font.encoding[stack.pop()]),
                    transform: {
                      a: 1,
                      b: 0,
                      c: 0,
                      d: 1,
                      e: 0,
                      f: 0
                    }
                  };
                  glyfs[0] = {
                    glyphIndex: font.charset.indexOf(font.encoding[stack.pop()]),
                    transform: {
                      a: 1,
                      b: 0,
                      c: 0,
                      d: 1,
                      e: 0,
                      f: 0
                    }
                  };
                  glyfs[1].transform.f = stack.pop();
                  glyfs[1].transform.e = stack.pop();
                } else if (stack.length === 5) {
                  if (!haveWidth) {
                    width = stack.shift() + font.nominalWidthX;
                  }
                  haveWidth = true;
                  glyfs[1] = {
                    glyphIndex: font.charset.indexOf(font.encoding[stack.pop()]),
                    transform: {
                      a: 1,
                      b: 0,
                      c: 0,
                      d: 1,
                      e: 0,
                      f: 0
                    }
                  };
                  glyfs[0] = {
                    glyphIndex: font.charset.indexOf(font.encoding[stack.pop()]),
                    transform: {
                      a: 1,
                      b: 0,
                      c: 0,
                      d: 1,
                      e: 0,
                      f: 0
                    }
                  };
                  glyfs[1].transform.f = stack.pop();
                  glyfs[1].transform.e = stack.pop();
                }
                if (open) {
                  contours.push(contour);
                  open = false;
                }
                break;
              case 18:
                parseStems();
                break;
              case 19:
              // hintmask
              case 20:
                parseStems();
                i += nStems + 7 >> 3;
                break;
              case 21:
                if (stack.length > 2 && !haveWidth) {
                  width = stack.shift() + font.nominalWidthX;
                  haveWidth = true;
                }
                y += stack.pop();
                x += stack.pop();
                newContour(x, y);
                break;
              case 22:
                if (stack.length > 1 && !haveWidth) {
                  width = stack.shift() + font.nominalWidthX;
                  haveWidth = true;
                }
                x += stack.pop();
                newContour(x, y);
                break;
              case 23:
                parseStems();
                break;
              case 24:
                while (stack.length > 2) {
                  c1x = x + stack.shift();
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x + stack.shift();
                  y = c2y + stack.shift();
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                x += stack.shift();
                y += stack.shift();
                lineTo(x, y);
                break;
              case 25:
                while (stack.length > 6) {
                  x += stack.shift();
                  y += stack.shift();
                  lineTo(x, y);
                }
                c1x = x + stack.shift();
                c1y = y + stack.shift();
                c2x = c1x + stack.shift();
                c2y = c1y + stack.shift();
                x = c2x + stack.shift();
                y = c2y + stack.shift();
                curveTo(c1x, c1y, c2x, c2y, x, y);
                break;
              case 26:
                if (stack.length % 2) {
                  x += stack.shift();
                }
                while (stack.length > 0) {
                  c1x = x;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x;
                  y = c2y + stack.shift();
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
              case 27:
                if (stack.length % 2) {
                  y += stack.shift();
                }
                while (stack.length > 0) {
                  c1x = x + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x + stack.shift();
                  y = c2y;
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
              case 28:
                b1 = code2[i];
                b2 = code2[i + 1];
                stack.push((b1 << 24 | b2 << 16) >> 16);
                i += 2;
                break;
              case 29:
                codeIndex = stack.pop() + font.gsubrsBias;
                subrCode = font.gsubrs[codeIndex];
                if (subrCode) {
                  parse(subrCode);
                }
                break;
              case 30:
                while (stack.length > 0) {
                  c1x = x;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x + stack.shift();
                  y = c2y + (stack.length === 1 ? stack.shift() : 0);
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                  if (stack.length === 0) {
                    break;
                  }
                  c1x = x + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  y = c2y + stack.shift();
                  x = c2x + (stack.length === 1 ? stack.shift() : 0);
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
              case 31:
                while (stack.length > 0) {
                  c1x = x + stack.shift();
                  c1y = y;
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  y = c2y + stack.shift();
                  x = c2x + (stack.length === 1 ? stack.shift() : 0);
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                  if (stack.length === 0) {
                    break;
                  }
                  c1x = x;
                  c1y = y + stack.shift();
                  c2x = c1x + stack.shift();
                  c2y = c1y + stack.shift();
                  x = c2x + stack.shift();
                  y = c2y + (stack.length === 1 ? stack.shift() : 0);
                  curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
              default:
                if (v < 32) {
                  console.warn("Glyph " + index + ": unknown operator " + v);
                } else if (v < 247) {
                  stack.push(v - 139);
                } else if (v < 251) {
                  b1 = code2[i];
                  i += 1;
                  stack.push((v - 247) * 256 + b1 + 108);
                } else if (v < 255) {
                  b1 = code2[i];
                  i += 1;
                  stack.push(-(v - 251) * 256 - b1 - 108);
                } else {
                  b1 = code2[i];
                  b2 = code2[i + 1];
                  b3 = code2[i + 2];
                  b4 = code2[i + 3];
                  i += 4;
                  stack.push((b1 << 24 | b2 << 16 | b3 << 8 | b4) / 65536);
                }
            }
          }
        }
        parse(code);
        var glyf = {
          // 移除重复的起点和终点
          contours: contours.map(function(contour2) {
            var last = contour2.length - 1;
            if (contour2[0].x === contour2[last].x && contour2[0].y === contour2[last].y) {
              contour2.splice(last, 1);
            }
            return contour2;
          }),
          advanceWidth: width
        };
        if (glyfs.length) {
          glyf.compound = true;
          glyf.glyfs = glyfs;
        }
        return glyf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFCharset.js
  var require_parseCFFCharset = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFCharset.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parseCFFCharset;
      var _getCFFString = _interopRequireDefault(require_getCFFString());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function parseCFFCharset(reader, start, nGlyphs, strings) {
        if (start) {
          reader.seek(start);
        }
        var i;
        var sid;
        var count;
        nGlyphs -= 1;
        var charset = [".notdef"];
        var format = reader.readUint8();
        if (format === 0) {
          for (i = 0; i < nGlyphs; i += 1) {
            sid = reader.readUint16();
            charset.push((0, _getCFFString.default)(strings, sid));
          }
        } else if (format === 1) {
          while (charset.length <= nGlyphs) {
            sid = reader.readUint16();
            count = reader.readUint8();
            for (i = 0; i <= count; i += 1) {
              charset.push((0, _getCFFString.default)(strings, sid));
              sid += 1;
            }
          }
        } else if (format === 2) {
          while (charset.length <= nGlyphs) {
            sid = reader.readUint16();
            count = reader.readUint16();
            for (i = 0; i <= count; i += 1) {
              charset.push((0, _getCFFString.default)(strings, sid));
              sid += 1;
            }
          }
        } else {
          throw new Error("Unknown charset format " + format);
        }
        return charset;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFEncoding.js
  var require_parseCFFEncoding = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cff/parseCFFEncoding.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parseCFFEncoding;
      function parseCFFEncoding(reader, start) {
        if (null != start) {
          reader.seek(start);
        }
        var i;
        var code;
        var encoding = {};
        var format = reader.readUint8();
        if (format === 0) {
          var nCodes = reader.readUint8();
          for (i = 0; i < nCodes; i += 1) {
            code = reader.readUint8();
            encoding[code] = i;
          }
        } else if (format === 1) {
          var nRanges = reader.readUint8();
          code = 1;
          for (i = 0; i < nRanges; i += 1) {
            var first = reader.readUint8();
            var nLeft = reader.readUint8();
            for (var j = first; j <= first + nLeft; j += 1) {
              encoding[j] = code;
              code += 1;
            }
          }
        } else {
          console.warn("unknown encoding format:" + format);
        }
        return encoding;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/CFF.js
  var require_CFF = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/CFF.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _string = _interopRequireDefault(require_string());
      var _encoding = _interopRequireDefault(require_encoding2());
      var _cffStandardStrings = _interopRequireDefault(require_cffStandardStrings());
      var _parseCFFDict = _interopRequireDefault(require_parseCFFDict());
      var _parseCFFGlyph = _interopRequireDefault(require_parseCFFGlyph());
      var _parseCFFCharset = _interopRequireDefault(require_parseCFFCharset());
      var _parseCFFEncoding = _interopRequireDefault(require_parseCFFEncoding());
      var _reader = _interopRequireDefault(require_reader());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function getOffset(reader, offSize) {
        var v = 0;
        for (var i = 0; i < offSize; i++) {
          v <<= 8;
          v += reader.readUint8();
        }
        return v;
      }
      function parseCFFHead(reader) {
        var head = {};
        head.startOffset = reader.offset;
        head.endOffset = head.startOffset + 4;
        head.formatMajor = reader.readUint8();
        head.formatMinor = reader.readUint8();
        head.size = reader.readUint8();
        head.offsetSize = reader.readUint8();
        return head;
      }
      function parseCFFIndex(reader, offset, conversionFn) {
        if (offset) {
          reader.seek(offset);
        }
        var start = reader.offset;
        var offsets = [];
        var objects = [];
        var count = reader.readUint16();
        var i;
        var l;
        if (count !== 0) {
          var offsetSize = reader.readUint8();
          for (i = 0, l = count + 1; i < l; i++) {
            offsets.push(getOffset(reader, offsetSize));
          }
          for (i = 0, l = count; i < l; i++) {
            var value = reader.readBytes(offsets[i + 1] - offsets[i]);
            if (conversionFn) {
              value = conversionFn(value);
            }
            objects.push(value);
          }
        }
        return {
          objects,
          startOffset: start,
          endOffset: reader.offset
        };
      }
      function calcCFFSubroutineBias(subrs) {
        var bias;
        if (subrs.length < 1240) {
          bias = 107;
        } else if (subrs.length < 33900) {
          bias = 1131;
        } else {
          bias = 32768;
        }
        return bias;
      }
      var _default = exports.default = _table.default.create("cff", [], {
        read: function read2(reader, font) {
          var offset = this.offset;
          reader.seek(offset);
          var head = parseCFFHead(reader);
          var nameIndex = parseCFFIndex(reader, head.endOffset, _string.default.getString);
          var topDictIndex = parseCFFIndex(reader, nameIndex.endOffset);
          var stringIndex = parseCFFIndex(reader, topDictIndex.endOffset, _string.default.getString);
          var globalSubrIndex = parseCFFIndex(reader, stringIndex.endOffset);
          var cff = {
            head
          };
          cff.gsubrs = globalSubrIndex.objects;
          cff.gsubrsBias = calcCFFSubroutineBias(globalSubrIndex.objects);
          var dictReader = new _reader.default(new Uint8Array(topDictIndex.objects[0]).buffer);
          var topDict = _parseCFFDict.default.parseTopDict(dictReader, 0, dictReader.length, stringIndex.objects);
          cff.topDict = topDict;
          var privateDictLength = topDict.private[0];
          var privateDict = {};
          var privateDictOffset;
          if (privateDictLength) {
            privateDictOffset = offset + topDict.private[1];
            privateDict = _parseCFFDict.default.parsePrivateDict(reader, privateDictOffset, privateDictLength, stringIndex.objects);
            cff.defaultWidthX = privateDict.defaultWidthX;
            cff.nominalWidthX = privateDict.nominalWidthX;
          } else {
            cff.defaultWidthX = 0;
            cff.nominalWidthX = 0;
          }
          if (privateDict.subrs) {
            var subrOffset = privateDictOffset + privateDict.subrs;
            var subrIndex = parseCFFIndex(reader, subrOffset);
            cff.subrs = subrIndex.objects;
            cff.subrsBias = calcCFFSubroutineBias(cff.subrs);
          } else {
            cff.subrs = [];
            cff.subrsBias = 0;
          }
          cff.privateDict = privateDict;
          var charStringsIndex = parseCFFIndex(reader, offset + topDict.charStrings);
          var nGlyphs = charStringsIndex.objects.length;
          if (topDict.charset < 3) {
            cff.charset = _cffStandardStrings.default;
          } else {
            cff.charset = (0, _parseCFFCharset.default)(reader, offset + topDict.charset, nGlyphs, stringIndex.objects);
          }
          if (topDict.encoding === 0) {
            cff.encoding = _encoding.default.standardEncoding;
          } else if (topDict.encoding === 1) {
            cff.encoding = _encoding.default.expertEncoding;
          } else {
            cff.encoding = (0, _parseCFFEncoding.default)(reader, offset + topDict.encoding);
          }
          cff.glyf = [];
          var subset = font.readOptions.subset;
          if (subset && subset.length > 0) {
            var subsetMap = {
              0: true
              // 设置.notdef
            };
            var codes = font.cmap;
            Object.keys(codes).forEach(function(c) {
              if (subset.indexOf(+c) > -1) {
                var i2 = codes[c];
                subsetMap[i2] = true;
              }
            });
            font.subsetMap = subsetMap;
            Object.keys(subsetMap).forEach(function(i2) {
              i2 = +i2;
              var glyf2 = (0, _parseCFFGlyph.default)(charStringsIndex.objects[i2], cff, i2);
              glyf2.name = cff.charset[i2];
              cff.glyf[i2] = glyf2;
            });
          } else {
            for (var i = 0, l = nGlyphs; i < l; i++) {
              var glyf = (0, _parseCFFGlyph.default)(charStringsIndex.objects[i], cff, i);
              glyf.name = cff.charset[i];
              cff.glyf.push(glyf);
            }
          }
          return cff;
        },
        // eslint-disable-next-line no-unused-vars
        write: function write(writer, font) {
          throw new Error("not support write cff table");
        },
        // eslint-disable-next-line no-unused-vars
        size: function size(font) {
          throw new Error("not support get cff table size");
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/GPOS.js
  var require_GPOS = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/GPOS.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("GPOS", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.GPOS.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.GPOS) {
            writer.writeBytes(ttf.GPOS, ttf.GPOS.length);
          }
        },
        size: function size(ttf) {
          return ttf.GPOS ? ttf.GPOS.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/kern.js
  var require_kern = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/kern.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("kern", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.kern.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.kern) {
            writer.writeBytes(ttf.kern, ttf.kern.length);
          }
        },
        size: function size(ttf) {
          return ttf.kern ? ttf.kern.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/support-otf.js
  var require_support_otf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/support-otf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _head = _interopRequireDefault(require_head());
      var _maxp = _interopRequireDefault(require_maxp());
      var _cmap = _interopRequireDefault(require_cmap());
      var _name = _interopRequireDefault(require_name());
      var _hhea = _interopRequireDefault(require_hhea());
      var _hmtx = _interopRequireDefault(require_hmtx());
      var _post = _interopRequireDefault(require_post());
      var _OS = _interopRequireDefault(require_OS2());
      var _CFF = _interopRequireDefault(require_CFF());
      var _GPOS = _interopRequireDefault(require_GPOS());
      var _kern = _interopRequireDefault(require_kern());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = {
        head: _head.default,
        maxp: _maxp.default,
        cmap: _cmap.default,
        name: _name.default,
        hhea: _hhea.default,
        hmtx: _hmtx.default,
        post: _post.default,
        "OS/2": _OS.default,
        CFF: _CFF.default,
        GPOS: _GPOS.default,
        kern: _kern.default
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/otfreader.js
  var require_otfreader = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/otfreader.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _directory = _interopRequireDefault(require_directory());
      var _supportOtf = _interopRequireDefault(require_support_otf());
      var _reader = _interopRequireDefault(require_reader());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      var OTFReader = exports.default = /* @__PURE__ */ function() {
        function OTFReader2() {
          var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _classCallCheck(this, OTFReader2);
          options.subset = options.subset || [];
          this.options = options;
        }
        return _createClass(OTFReader2, [{
          key: "readBuffer",
          value: function readBuffer(buffer) {
            var reader = new _reader.default(buffer, 0, buffer.byteLength, false);
            var font = {};
            font.version = reader.readString(0, 4);
            if (font.version !== "OTTO") {
              _error.default.raise(10301);
            }
            font.numTables = reader.readUint16();
            if (font.numTables <= 0 || font.numTables > 100) {
              _error.default.raise(10302);
            }
            font.searchRange = reader.readUint16();
            font.entrySelector = reader.readUint16();
            font.rangeShift = reader.readUint16();
            font.tables = new _directory.default(reader.offset).read(reader, font);
            if (!font.tables.head || !font.tables.cmap || !font.tables.CFF) {
              _error.default.raise(10302);
            }
            font.readOptions = this.options;
            Object.keys(_supportOtf.default).forEach(function(tableName) {
              if (font.tables[tableName]) {
                var offset = font.tables[tableName].offset;
                font[tableName] = new _supportOtf.default[tableName](offset).read(reader, font);
              }
            });
            if (!font.CFF.glyf) {
              _error.default.raise(10303);
            }
            reader.dispose();
            return font;
          }
          /**
           * 关联glyf相关的信息
           *
           * @param {Object} font font对象
           */
        }, {
          key: "resolveGlyf",
          value: function resolveGlyf(font) {
            var codes = font.cmap;
            var glyf = font.CFF.glyf;
            var subsetMap = font.readOptions.subset ? font.subsetMap : null;
            Object.keys(codes).forEach(function(c) {
              var i = codes[c];
              if (subsetMap && !subsetMap[i]) {
                return;
              }
              if (!glyf[i].unicode) {
                glyf[i].unicode = [];
              }
              glyf[i].unicode.push(+c);
            });
            font.hmtx.forEach(function(item, i) {
              if (subsetMap && !subsetMap[i]) {
                return;
              }
              glyf[i].advanceWidth = glyf[i].advanceWidth || item.advanceWidth || 0;
              glyf[i].leftSideBearing = item.leftSideBearing;
            });
            if (subsetMap) {
              var subGlyf = [];
              Object.keys(subsetMap).forEach(function(i) {
                subGlyf.push(glyf[+i]);
              });
              glyf = subGlyf;
            }
            font.glyf = glyf;
          }
          /**
           * 清除非必须的表
           *
           * @param {Object} font font对象
           */
        }, {
          key: "cleanTables",
          value: function cleanTables(font) {
            delete font.readOptions;
            delete font.tables;
            delete font.hmtx;
            delete font.post.glyphNameIndex;
            delete font.post.names;
            delete font.subsetMap;
            var cff = font.CFF;
            delete cff.glyf;
            delete cff.charset;
            delete cff.encoding;
            delete cff.gsubrs;
            delete cff.gsubrsBias;
            delete cff.subrs;
            delete cff.subrsBias;
          }
          /**
           * 获取解析后的ttf文档
           *
           * @param {ArrayBuffer} buffer buffer对象
           *
           * @return {Object} ttf文档
           */
        }, {
          key: "read",
          value: function read2(buffer) {
            this.font = this.readBuffer(buffer);
            this.resolveGlyf(this.font);
            this.cleanTables(this.font);
            return this.font;
          }
          /**
           * 注销
           */
        }, {
          key: "dispose",
          value: function dispose() {
            delete this.font;
            delete this.options;
          }
        }]);
      }();
    }
  });

  // node_modules/fonteditor-core/lib/math/bezierCubic2Q2.js
  var require_bezierCubic2Q2 = __commonJS({
    "node_modules/fonteditor-core/lib/math/bezierCubic2Q2.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = bezierCubic2Q2;
      function toQuad(p1, c1, c2, p2) {
        var x = (3 * c2.x - p2.x + 3 * c1.x - p1.x) / 4;
        var y = (3 * c2.y - p2.y + 3 * c1.y - p1.y) / 4;
        return [p1, {
          x,
          y
        }, p2];
      }
      function bezierCubic2Q2(p1, c1, c2, p2) {
        if (p1.x === c1.x && p1.y === c1.y && c2.x === p2.x && c2.y === p2.y) {
          return [[p1, {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
          }, p2]];
        }
        var mx = p2.x - 3 * c2.x + 3 * c1.x - p1.x;
        var my = p2.y - 3 * c2.y + 3 * c1.y - p1.y;
        if (mx * mx + my * my <= 4) {
          return [toQuad(p1, c1, c2, p2)];
        }
        var mp = {
          x: (p2.x + 3 * c2.x + 3 * c1.x + p1.x) / 8,
          y: (p2.y + 3 * c2.y + 3 * c1.y + p1.y) / 8
        };
        return [toQuad(p1, {
          x: (p1.x + c1.x) / 2,
          y: (p1.y + c1.y) / 2
        }, {
          x: (p1.x + 2 * c1.x + c2.x) / 4,
          y: (p1.y + 2 * c1.y + c2.y) / 4
        }, mp), toQuad(mp, {
          x: (p2.x + c1.x + 2 * c2.x) / 4,
          y: (p2.y + c1.y + 2 * c2.y) / 4
        }, {
          x: (p2.x + c2.x) / 2,
          y: (p2.y + c2.y) / 2
        }, p2)];
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/otfContours2ttfContours.js
  var require_otfContours2ttfContours = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/otfContours2ttfContours.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = otfContours2ttfContours;
      var _bezierCubic2Q = _interopRequireDefault(require_bezierCubic2Q2());
      var _pathCeil = _interopRequireDefault(require_pathCeil());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function transformContour(otfContour) {
        var contour = [];
        var prevPoint;
        var curPoint;
        var nextPoint;
        var nextNextPoint;
        contour.push(prevPoint = otfContour[0]);
        for (var i = 1, l = otfContour.length; i < l; i++) {
          curPoint = otfContour[i];
          if (curPoint.onCurve) {
            contour.push(curPoint);
            prevPoint = curPoint;
          } else {
            nextPoint = otfContour[i + 1];
            nextNextPoint = i === l - 2 ? otfContour[0] : otfContour[i + 2];
            var bezierArray = (0, _bezierCubic2Q.default)(prevPoint, curPoint, nextPoint, nextNextPoint);
            bezierArray[0][2].onCurve = true;
            contour.push(bezierArray[0][1]);
            contour.push(bezierArray[0][2]);
            if (bezierArray[1]) {
              bezierArray[1][2].onCurve = true;
              contour.push(bezierArray[1][1]);
              contour.push(bezierArray[1][2]);
            }
            prevPoint = nextNextPoint;
            i += 2;
          }
        }
        return (0, _pathCeil.default)(contour);
      }
      function otfContours2ttfContours(otfContours) {
        if (!otfContours || !otfContours.length) {
          return otfContours;
        }
        var contours = [];
        for (var i = 0, l = otfContours.length; i < l; i++) {
          if (otfContours[i][0]) {
            contours.push(transformContour(otfContours[i]));
          }
        }
        return contours;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/otf2ttfobject.js
  var require_otf2ttfobject = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/otf2ttfobject.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = otf2ttfobject;
      var _error = _interopRequireDefault(require_error());
      var _otfreader = _interopRequireDefault(require_otfreader());
      var _otfContours2ttfContours = _interopRequireDefault(require_otfContours2ttfContours());
      var _computeBoundingBox = require_computeBoundingBox();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function otf2ttfobject(otfBuffer, options) {
        var otfObject;
        if (otfBuffer instanceof ArrayBuffer) {
          var otfReader = new _otfreader.default(options);
          otfObject = otfReader.read(otfBuffer);
          otfReader.dispose();
        } else if (otfBuffer.head && otfBuffer.glyf && otfBuffer.cmap) {
          otfObject = otfBuffer;
        } else {
          _error.default.raise(10111);
        }
        otfObject.glyf.forEach(function(g) {
          g.contours = (0, _otfContours2ttfContours.default)(g.contours);
          var box = _computeBoundingBox.computePathBox.apply(void 0, _toConsumableArray(g.contours));
          if (box) {
            g.xMin = box.x;
            g.xMax = box.x + box.width;
            g.yMin = box.y;
            g.yMax = box.y + box.height;
            g.leftSideBearing = g.xMin;
          } else {
            g.xMin = 0;
            g.xMax = 0;
            g.yMin = 0;
            g.yMax = 0;
            g.leftSideBearing = 0;
          }
        });
        otfObject.version = 1;
        otfObject.maxp.version = 1;
        otfObject.maxp.maxZones = otfObject.maxp.maxTwilightPoints ? 2 : 1;
        delete otfObject.CFF;
        delete otfObject.VORG;
        return otfObject;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/eot2ttf.js
  var require_eot2ttf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/eot2ttf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = eot2ttf;
      var _reader = _interopRequireDefault(require_reader());
      var _writer = _interopRequireDefault(require_writer());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function eot2ttf(eotBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var eotReader = new _reader.default(eotBuffer, 0, eotBuffer.byteLength, true);
        var magicNumber = eotReader.readUint16(34);
        if (magicNumber !== 20556) {
          _error.default.raise(10110);
        }
        var version = eotReader.readUint32(8);
        if (version !== 131073 && version !== 65536 && version !== 131074) {
          _error.default.raise(10110);
        }
        var eotSize = eotBuffer.byteLength || eotBuffer.length;
        var fontSize = eotReader.readUint32(4);
        var fontOffset = 82;
        var familyNameSize = eotReader.readUint16(fontOffset);
        fontOffset += 4 + familyNameSize;
        var styleNameSize = eotReader.readUint16(fontOffset);
        fontOffset += 4 + styleNameSize;
        var versionNameSize = eotReader.readUint16(fontOffset);
        fontOffset += 4 + versionNameSize;
        var fullNameSize = eotReader.readUint16(fontOffset);
        fontOffset += 2 + fullNameSize;
        if (version === 131073 || version === 131074) {
          var rootStringSize = eotReader.readUint16(fontOffset + 2);
          fontOffset += 4 + rootStringSize;
        }
        if (version === 131074) {
          fontOffset += 10;
          var signatureSize = eotReader.readUint16(fontOffset);
          fontOffset += 2 + signatureSize;
          fontOffset += 4;
          var eudcFontSize = eotReader.readUint32(fontOffset);
          fontOffset += 4 + eudcFontSize;
        }
        if (fontOffset + fontSize > eotSize) {
          _error.default.raise(10001);
        }
        if (eotBuffer.slice) {
          return eotBuffer.slice(fontOffset, fontOffset + fontSize);
        }
        var bytes = eotReader.readBytes(fontOffset, fontSize);
        return new _writer.default(new ArrayBuffer(fontSize)).writeBytes(bytes).getBuffer();
      }
    }
  });

  // node_modules/@xmldom/xmldom/lib/conventions.js
  var require_conventions = __commonJS({
    "node_modules/@xmldom/xmldom/lib/conventions.js"(exports) {
      "use strict";
      function find(list, predicate, ac) {
        if (ac === void 0) {
          ac = Array.prototype;
        }
        if (list && typeof ac.find === "function") {
          return ac.find.call(list, predicate);
        }
        for (var i = 0; i < list.length; i++) {
          if (Object.prototype.hasOwnProperty.call(list, i)) {
            var item = list[i];
            if (predicate.call(void 0, item, i, list)) {
              return item;
            }
          }
        }
      }
      function freeze(object, oc) {
        if (oc === void 0) {
          oc = Object;
        }
        return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
      }
      function assign(target, source) {
        if (target === null || typeof target !== "object") {
          throw new TypeError("target is not an object");
        }
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
        return target;
      }
      var MIME_TYPE = freeze({
        /**
         * `text/html`, the only mime type that triggers treating an XML document as HTML.
         *
         * @see DOMParser.SupportedType.isHTML
         * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/HTML Wikipedia
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
         * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
         */
        HTML: "text/html",
        /**
         * Helper method to check a mime type if it indicates an HTML document
         *
         * @param {string} [value]
         * @returns {boolean}
         *
         * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/HTML Wikipedia
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
         * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
        isHTML: function(value) {
          return value === MIME_TYPE.HTML;
        },
        /**
         * `application/xml`, the standard mime type for XML documents.
         *
         * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
         * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_APPLICATION: "application/xml",
        /**
         * `text/html`, an alias for `application/xml`.
         *
         * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
         * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_TEXT: "text/xml",
        /**
         * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
         * but is parsed as an XML document.
         *
         * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
         * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
         */
        XML_XHTML_APPLICATION: "application/xhtml+xml",
        /**
         * `image/svg+xml`,
         *
         * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
         * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
         * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
         */
        XML_SVG_IMAGE: "image/svg+xml"
      });
      var NAMESPACE = freeze({
        /**
         * The XHTML namespace.
         *
         * @see http://www.w3.org/1999/xhtml
         */
        HTML: "http://www.w3.org/1999/xhtml",
        /**
         * Checks if `uri` equals `NAMESPACE.HTML`.
         *
         * @param {string} [uri]
         *
         * @see NAMESPACE.HTML
         */
        isHTML: function(uri) {
          return uri === NAMESPACE.HTML;
        },
        /**
         * The SVG namespace.
         *
         * @see http://www.w3.org/2000/svg
         */
        SVG: "http://www.w3.org/2000/svg",
        /**
         * The `xml:` namespace.
         *
         * @see http://www.w3.org/XML/1998/namespace
         */
        XML: "http://www.w3.org/XML/1998/namespace",
        /**
         * The `xmlns:` namespace
         *
         * @see https://www.w3.org/2000/xmlns/
         */
        XMLNS: "http://www.w3.org/2000/xmlns/"
      });
      var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
      var tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$");
      exports.assign = assign;
      exports.find = find;
      exports.freeze = freeze;
      exports.MIME_TYPE = MIME_TYPE;
      exports.NAMESPACE = NAMESPACE;
      exports.nameStartChar = nameStartChar;
      exports.nameChar = nameChar;
      exports.tagNamePattern = tagNamePattern;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom.js
  var require_dom = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom.js"(exports) {
      var conventions = require_conventions();
      var find = conventions.find;
      var NAMESPACE = conventions.NAMESPACE;
      var tagNamePattern = conventions.tagNamePattern;
      function notEmptyString(input) {
        return input !== "";
      }
      function splitOnASCIIWhitespace(input) {
        return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
      }
      function orderedSetReducer(current, element) {
        if (!current.hasOwnProperty(element)) {
          current[element] = true;
        }
        return current;
      }
      function toOrderedSet(input) {
        if (!input) return [];
        var list = splitOnASCIIWhitespace(input);
        return Object.keys(list.reduce(orderedSetReducer, {}));
      }
      function arrayIncludes(list) {
        return function(element) {
          return list && list.indexOf(element) !== -1;
        };
      }
      function copy(src, dest) {
        for (var p in src) {
          if (Object.prototype.hasOwnProperty.call(src, p)) {
            dest[p] = src[p];
          }
        }
      }
      function _extends(Class, Super) {
        var pt = Class.prototype;
        if (!(pt instanceof Super)) {
          let t2 = function() {
          };
          var t = t2;
          ;
          t2.prototype = Super.prototype;
          t2 = new t2();
          copy(pt, t2);
          Class.prototype = pt = t2;
        }
        if (pt.constructor != Class) {
          if (typeof Class != "function") {
            console.error("unknown Class:" + Class);
          }
          pt.constructor = Class;
        }
      }
      var NodeType = {};
      var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
      var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
      var TEXT_NODE = NodeType.TEXT_NODE = 3;
      var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
      var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
      var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
      var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
      var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
      var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
      var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
      var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
      var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
      var ExceptionCode = {};
      var ExceptionMessage = {};
      var INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1);
      var DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2);
      var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3);
      var WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4);
      var INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5);
      var NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6);
      var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7);
      var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8);
      var NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
      var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10);
      var INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11);
      var SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12);
      var INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13);
      var NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14);
      var INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
      function DOMException(code, message) {
        if (message instanceof Error) {
          var error = message;
        } else {
          error = this;
          Error.call(this, ExceptionMessage[code]);
          this.message = ExceptionMessage[code];
          if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
        }
        error.code = code;
        if (message) this.message = this.message + ": " + message;
        return error;
      }
      DOMException.prototype = Error.prototype;
      copy(ExceptionCode, DOMException);
      function NodeList() {
      }
      NodeList.prototype = {
        /**
         * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
         * @standard level1
         */
        length: 0,
        /**
         * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
         * @standard level1
         * @param index  unsigned long
         *   Index into the collection.
         * @return Node
         * 	The node at the indexth position in the NodeList, or null if that is not a valid index.
         */
        item: function(index) {
          return index >= 0 && index < this.length ? this[index] : null;
        },
        toString: function(isHTML, nodeFilter, options) {
          var requireWellFormed = !!options && !!options.requireWellFormed;
          for (var buf = [], i = 0; i < this.length; i++) {
            serializeToString(this[i], buf, isHTML, nodeFilter, null, requireWellFormed);
          }
          return buf.join("");
        },
        /**
         * @private
         * @param {function (Node):boolean} predicate
         * @returns {Node[]}
         */
        filter: function(predicate) {
          return Array.prototype.filter.call(this, predicate);
        },
        /**
         * @private
         * @param {Node} item
         * @returns {number}
         */
        indexOf: function(item) {
          return Array.prototype.indexOf.call(this, item);
        }
      };
      function LiveNodeList(node, refresh) {
        this._node = node;
        this._refresh = refresh;
        _updateLiveList(this);
      }
      function _updateLiveList(list) {
        var inc = list._node._inc || list._node.ownerDocument._inc;
        if (list._inc !== inc) {
          var ls = list._refresh(list._node);
          __set__(list, "length", ls.length);
          if (!list.$$length || ls.length < list.$$length) {
            for (var i = ls.length; i in list; i++) {
              if (Object.prototype.hasOwnProperty.call(list, i)) {
                delete list[i];
              }
            }
          }
          copy(ls, list);
          list._inc = inc;
        }
      }
      LiveNodeList.prototype.item = function(i) {
        _updateLiveList(this);
        return this[i] || null;
      };
      _extends(LiveNodeList, NodeList);
      function NamedNodeMap() {
        this._nameIndex = /* @__PURE__ */ Object.create(null);
      }
      function _findNodeIndex(list, node) {
        var i = list.length;
        while (i--) {
          if (list[i] === node) {
            return i;
          }
        }
      }
      function _nnmIndexAdd(list, attr) {
        list._nameIndex[attr.nodeName] = attr;
      }
      function _nnmIndexRemove(list, attr) {
        if (list._nameIndex[attr.nodeName] === attr) {
          delete list._nameIndex[attr.nodeName];
        }
      }
      function _addNamedNode(el, list, newAttr, oldAttr) {
        if (oldAttr) {
          list[_findNodeIndex(list, oldAttr)] = newAttr;
          _nnmIndexRemove(list, oldAttr);
        } else {
          list[list.length++] = newAttr;
        }
        _nnmIndexAdd(list, newAttr);
        if (el) {
          newAttr.ownerElement = el;
          var doc = el.ownerDocument;
          if (doc) {
            oldAttr && _onRemoveAttribute(doc, el, oldAttr);
            _onAddAttribute(doc, el, newAttr);
          }
        }
      }
      function _removeNamedNode(el, list, attr) {
        var i = _findNodeIndex(list, attr);
        if (i >= 0) {
          var lastIndex = list.length - 1;
          while (i < lastIndex) {
            list[i] = list[++i];
          }
          list.length = lastIndex;
          _nnmIndexRemove(list, attr);
          if (el) {
            var doc = el.ownerDocument;
            if (doc) {
              _onRemoveAttribute(doc, el, attr);
              attr.ownerElement = null;
            }
          }
        } else {
          throw new DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
        }
      }
      NamedNodeMap.prototype = {
        length: 0,
        item: NodeList.prototype.item,
        getNamedItem: function(key) {
          var i = this.length;
          while (i--) {
            var attr = this[i];
            if (attr.nodeName == key) {
              return attr;
            }
          }
        },
        setNamedItem: function(attr) {
          var el = attr.ownerElement;
          if (el && el != this._ownerElement) {
            throw new DOMException(INUSE_ATTRIBUTE_ERR);
          }
          var oldAttr = this._nameIndex[attr.nodeName];
          _addNamedNode(this._ownerElement, this, attr, oldAttr);
          return oldAttr;
        },
        /* returns Node */
        setNamedItemNS: function(attr) {
          var el = attr.ownerElement, oldAttr;
          if (el && el != this._ownerElement) {
            throw new DOMException(INUSE_ATTRIBUTE_ERR);
          }
          oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
          _addNamedNode(this._ownerElement, this, attr, oldAttr);
          return oldAttr;
        },
        /* returns Node */
        removeNamedItem: function(key) {
          var attr = this.getNamedItem(key);
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
        //for level2
        removeNamedItemNS: function(namespaceURI, localName) {
          var attr = this.getNamedItemNS(namespaceURI, localName);
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        getNamedItemNS: function(namespaceURI, localName) {
          var i = this.length;
          while (i--) {
            var node = this[i];
            if (node.localName == localName && node.namespaceURI == namespaceURI) {
              return node;
            }
          }
          return null;
        }
      };
      function DOMImplementation() {
      }
      DOMImplementation.prototype = {
        /**
         * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
         * The different implementations fairly diverged in what kind of features were reported.
         * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
         *
         * @deprecated It is deprecated and modern browsers return true in all cases.
         *
         * @param {string} feature
         * @param {string} [version]
         * @returns {boolean} always true
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
         * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
         */
        hasFeature: function(feature, version) {
          return true;
        },
        /**
         * Creates an XML Document object of the specified type with its document element.
         *
         * __It behaves slightly different from the description in the living standard__:
         * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
         * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         * - this implementation is not validating names or qualified names
         *   (when parsing XML strings, the SAX parser takes care of that)
         *
         * @param {string|null} namespaceURI
         * @param {string} qualifiedName
         * @param {DocumentType=null} doctype
         * @returns {Document}
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
         *
         * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
         * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
         * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
         */
        createDocument: function(namespaceURI, qualifiedName, doctype) {
          var doc = new Document();
          doc.implementation = this;
          doc.childNodes = new NodeList();
          doc.doctype = doctype || null;
          if (doctype) {
            doc.appendChild(doctype);
          }
          if (qualifiedName) {
            var root = doc.createElementNS(namespaceURI, qualifiedName);
            doc.appendChild(root);
          }
          return doc;
        },
        /**
         * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
         *
         * __This implementation differs from the specification:__
         * - this implementation is not validating names or qualified names
         *   (when parsing XML strings, the SAX parser takes care of that)
         *
         * Note: `internalSubset` can only be introduced via a direct property write to `node.internalSubset` after creation.
         * Creation-time validation of `publicId`, `systemId` is not enforced.
         * The serializer-level check covers all mutation vectors, including direct property writes.
         * `internalSubset` is only serialized as `[ ... ]` when both `publicId` and `systemId` are
         * absent (empty or `'.'`) — if either external identifier is present, `internalSubset` is
         * silently omitted from the serialized output.
         *
         * @param {string} qualifiedName
         * @param {string} [publicId]
         * The external subset public identifier. Stored verbatim including surrounding quotes.
         * When serialized with `requireWellFormed: true` (via the 4th-parameter options object),
         * throws `DOMException` with code `INVALID_STATE_ERR` if the value is non-empty and does
         * not match the XML `PubidLiteral` production (W3C DOM Parsing §3.2.1.3; XML 1.0 [12]).
         * @param {string} [systemId]
         * The external subset system identifier. Stored verbatim including surrounding quotes.
         * When serialized with `requireWellFormed: true`, throws `DOMException` with code
         * `INVALID_STATE_ERR` if the value is non-empty and does not match the XML `SystemLiteral`
         * production (W3C DOM Parsing §3.2.1.3; XML 1.0 [11]).
         * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
         * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
         *
         * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
         * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
         * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
         */
        createDocumentType: function(qualifiedName, publicId, systemId) {
          var node = new DocumentType();
          node.name = qualifiedName;
          node.nodeName = qualifiedName;
          node.publicId = publicId || "";
          node.systemId = systemId || "";
          return node;
        }
      };
      function Node() {
      }
      Node.prototype = {
        firstChild: null,
        lastChild: null,
        previousSibling: null,
        nextSibling: null,
        attributes: null,
        parentNode: null,
        childNodes: null,
        ownerDocument: null,
        nodeValue: null,
        namespaceURI: null,
        prefix: null,
        localName: null,
        // Modified in DOM Level 2:
        insertBefore: function(newChild, refChild) {
          return _insertBefore(this, newChild, refChild);
        },
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          if (oldChild) {
            this.removeChild(oldChild);
          }
        },
        removeChild: function(oldChild) {
          return _removeChild(this, oldChild);
        },
        appendChild: function(newChild) {
          return this.insertBefore(newChild, null);
        },
        hasChildNodes: function() {
          return this.firstChild != null;
        },
        cloneNode: function(deep) {
          return cloneNode(this.ownerDocument || this, this, deep);
        },
        // Modified in DOM Level 2:
        /**
         * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
         * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
         *
         * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
         * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
         * nodes.
         *
         * This method iteratively traverses all child nodes to normalize all descendant nodes within
         * the subtree.
         *
         * @throws {DOMException}
         * May throw a DOMException if operations within removeChild or appendData (which are
         * potentially invoked in this method) do not meet their specific constraints.
         * @see {@link Node.removeChild}
         * @see {@link CharacterData.appendData}
         * @see ../docs/walk-dom.md.
         */
        normalize: function() {
          walkDOM(this, null, {
            enter: function(node) {
              var child = node.firstChild;
              while (child) {
                var next = child.nextSibling;
                if (next !== null && next.nodeType === TEXT_NODE && child.nodeType === TEXT_NODE) {
                  var tail = [];
                  var sibling = next;
                  while (sibling !== null && sibling.nodeType === TEXT_NODE) {
                    tail.push(sibling.data);
                    sibling = sibling.nextSibling;
                  }
                  var removed = child.nextSibling;
                  while (removed !== sibling) {
                    var following = removed.nextSibling;
                    removed.parentNode = null;
                    removed.previousSibling = null;
                    removed.nextSibling = null;
                    removed = following;
                  }
                  child.nextSibling = sibling;
                  if (sibling !== null) {
                    sibling.previousSibling = child;
                  } else {
                    node.lastChild = child;
                  }
                  child.appendData(tail.join(""));
                  _onUpdateChild(node.ownerDocument, node);
                  child = sibling;
                } else {
                  child = next;
                }
              }
              return true;
            }
          });
        },
        // Introduced in DOM Level 2:
        isSupported: function(feature, version) {
          return this.ownerDocument.implementation.hasFeature(feature, version);
        },
        // Introduced in DOM Level 2:
        hasAttributes: function() {
          return this.attributes.length > 0;
        },
        /**
         * Look up the prefix associated to the given namespace URI, starting from this node.
         * **The default namespace declarations are ignored by this method.**
         * See Namespace Prefix Lookup for details on the algorithm used by this method.
         *
         * _Note: The implementation seems to be incomplete when compared to the algorithm described in the specs._
         *
         * @param {string | null} namespaceURI
         * @returns {string | null}
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
         * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
         * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
         * @see https://github.com/xmldom/xmldom/issues/322
         */
        lookupPrefix: function(namespaceURI) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              for (var n in map) {
                if (Object.prototype.hasOwnProperty.call(map, n) && map[n] === namespaceURI) {
                  return n;
                }
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        // Introduced in DOM Level 3:
        lookupNamespaceURI: function(prefix) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              if (Object.prototype.hasOwnProperty.call(map, prefix)) {
                return map[prefix];
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        // Introduced in DOM Level 3:
        isDefaultNamespace: function(namespaceURI) {
          var prefix = this.lookupPrefix(namespaceURI);
          return prefix == null;
        }
      };
      function _xmlEncoder(c) {
        return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
      }
      copy(NodeType, Node);
      copy(NodeType, Node.prototype);
      function _visitNode(node, callback) {
        return walkDOM(node, null, { enter: function(n) {
          return callback(n) ? walkDOM.STOP : true;
        } }) === walkDOM.STOP;
      }
      function walkDOM(node, context, callbacks) {
        var stack = [{ node, context, phase: walkDOM.ENTER }];
        while (stack.length > 0) {
          var frame = stack.pop();
          if (frame.phase === walkDOM.ENTER) {
            var childContext = callbacks.enter(frame.node, frame.context);
            if (childContext === walkDOM.STOP) {
              return walkDOM.STOP;
            }
            stack.push({ node: frame.node, context: childContext, phase: walkDOM.EXIT });
            if (childContext === null || childContext === void 0) {
              continue;
            }
            var child = frame.node.lastChild;
            while (child) {
              stack.push({ node: child, context: childContext, phase: walkDOM.ENTER });
              child = child.previousSibling;
            }
          } else {
            if (callbacks.exit) {
              callbacks.exit(frame.node, frame.context);
            }
          }
        }
      }
      walkDOM.STOP = Symbol("walkDOM.STOP");
      walkDOM.ENTER = 0;
      walkDOM.EXIT = 1;
      function Document() {
        this.ownerDocument = this;
      }
      function _onAddAttribute(doc, el, newAttr) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
        }
      }
      function _onRemoveAttribute(doc, el, newAttr, remove) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
        }
      }
      function _onUpdateChild(doc, el, newChild) {
        if (doc && doc._inc) {
          doc._inc++;
          var cs = el.childNodes;
          if (newChild) {
            cs[cs.length++] = newChild;
          } else {
            var child = el.firstChild;
            var i = 0;
            while (child) {
              cs[i++] = child;
              child = child.nextSibling;
            }
            cs.length = i;
            delete cs[cs.length];
          }
        }
      }
      function _removeChild(parentNode, child) {
        var previous = child.previousSibling;
        var next = child.nextSibling;
        if (previous) {
          previous.nextSibling = next;
        } else {
          parentNode.firstChild = next;
        }
        if (next) {
          next.previousSibling = previous;
        } else {
          parentNode.lastChild = previous;
        }
        child.parentNode = null;
        child.previousSibling = null;
        child.nextSibling = null;
        _onUpdateChild(parentNode.ownerDocument, parentNode);
        return child;
      }
      function hasValidParentNodeType(node) {
        return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
      }
      function hasInsertableNodeType(node) {
        return node && (isElementNode(node) || isTextNode(node) || isDocTypeNode(node) || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE);
      }
      function isDocTypeNode(node) {
        return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
      }
      function isElementNode(node) {
        return node && node.nodeType === Node.ELEMENT_NODE;
      }
      function isTextNode(node) {
        return node && node.nodeType === Node.TEXT_NODE;
      }
      function isElementInsertionPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function isElementReplacementPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        function hasElementChildThatIsNotChild(node) {
          return isElementNode(node) && node !== child;
        }
        if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function assertPreInsertionValidity1to5(parent, node, child) {
        if (!hasValidParentNodeType(parent)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
        }
        if (child && child.parentNode !== parent) {
          throw new DOMException(NOT_FOUND_ERR, "child not in parent");
        }
        if (
          // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
          !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
          // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
          // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
          // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
          isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
        ) {
          throw new DOMException(
            HIERARCHY_REQUEST_ERR,
            "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
          );
        }
      }
      function assertPreInsertionValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementInsertionPossible(parent, child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          if (find(parentChildNodes, isDocTypeNode)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
          if (!child && parentElementChild) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
          }
        }
      }
      function assertPreReplacementValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementReplacementPossible(parent, child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          let hasDoctypeChildThatIsNotChild2 = function(node2) {
            return isDocTypeNode(node2) && node2 !== child;
          };
          var hasDoctypeChildThatIsNotChild = hasDoctypeChildThatIsNotChild2;
          if (find(parentChildNodes, hasDoctypeChildThatIsNotChild2)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
        }
      }
      function _insertBefore(parent, node, child, _inDocumentAssertion) {
        assertPreInsertionValidity1to5(parent, node, child);
        if (parent.nodeType === Node.DOCUMENT_NODE) {
          (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
        }
        var cp = node.parentNode;
        if (cp) {
          cp.removeChild(node);
        }
        if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var newFirst = node.firstChild;
          if (newFirst == null) {
            return node;
          }
          var newLast = node.lastChild;
        } else {
          newFirst = newLast = node;
        }
        var pre = child ? child.previousSibling : parent.lastChild;
        newFirst.previousSibling = pre;
        newLast.nextSibling = child;
        if (pre) {
          pre.nextSibling = newFirst;
        } else {
          parent.firstChild = newFirst;
        }
        if (child == null) {
          parent.lastChild = newLast;
        } else {
          child.previousSibling = newLast;
        }
        do {
          newFirst.parentNode = parent;
          var targetDoc = parent.ownerDocument || parent;
          _updateOwnerDocument(newFirst, targetDoc);
        } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
        _onUpdateChild(parent.ownerDocument || parent, parent);
        if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
          node.firstChild = node.lastChild = null;
        }
        return node;
      }
      function _updateOwnerDocument(node, newOwnerDocument) {
        if (node.ownerDocument === newOwnerDocument) {
          return;
        }
        node.ownerDocument = newOwnerDocument;
        if (node.nodeType === ELEMENT_NODE && node.attributes) {
          for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes.item(i);
            if (attr) {
              attr.ownerDocument = newOwnerDocument;
            }
          }
        }
        var child = node.firstChild;
        while (child) {
          _updateOwnerDocument(child, newOwnerDocument);
          child = child.nextSibling;
        }
      }
      function _appendSingleChild(parentNode, newChild) {
        if (newChild.parentNode) {
          newChild.parentNode.removeChild(newChild);
        }
        newChild.parentNode = parentNode;
        newChild.previousSibling = parentNode.lastChild;
        newChild.nextSibling = null;
        if (newChild.previousSibling) {
          newChild.previousSibling.nextSibling = newChild;
        } else {
          parentNode.firstChild = newChild;
        }
        parentNode.lastChild = newChild;
        _onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
        var targetDoc = parentNode.ownerDocument || parentNode;
        _updateOwnerDocument(newChild, targetDoc);
        return newChild;
      }
      Document.prototype = {
        //implementation : null,
        nodeName: "#document",
        nodeType: DOCUMENT_NODE,
        /**
         * The DocumentType node of the document.
         *
         * @readonly
         * @type DocumentType
         */
        doctype: null,
        documentElement: null,
        _inc: 1,
        insertBefore: function(newChild, refChild) {
          if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
            var child = newChild.firstChild;
            while (child) {
              var next = child.nextSibling;
              this.insertBefore(child, refChild);
              child = next;
            }
            return newChild;
          }
          _insertBefore(this, newChild, refChild);
          _updateOwnerDocument(newChild, this);
          if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
            this.documentElement = newChild;
          }
          return newChild;
        },
        removeChild: function(oldChild) {
          if (this.documentElement == oldChild) {
            this.documentElement = null;
          }
          return _removeChild(this, oldChild);
        },
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          _updateOwnerDocument(newChild, this);
          if (oldChild) {
            this.removeChild(oldChild);
          }
          if (isElementNode(newChild)) {
            this.documentElement = newChild;
          }
        },
        // Introduced in DOM Level 2:
        importNode: function(importedNode, deep) {
          return importNode(this, importedNode, deep);
        },
        // Introduced in DOM Level 2:
        getElementById: function(id) {
          var rtv = null;
          _visitNode(this.documentElement, function(node) {
            if (node.nodeType == ELEMENT_NODE) {
              if (node.getAttribute("id") == id) {
                rtv = node;
                return true;
              }
            }
          });
          return rtv;
        },
        /**
         * The `getElementsByClassName` method of `Document` interface returns an array-like object
         * of all child elements which have **all** of the given class name(s).
         *
         * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
         *
         *
         * Warning: This is a live LiveNodeList.
         * Changes in the DOM will reflect in the array as the changes occur.
         * If an element selected by this array no longer qualifies for the selector,
         * it will automatically be removed. Be aware of this for iteration purposes.
         *
         * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
         * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
         */
        getElementsByClassName: function(classNames) {
          var classNamesSet = toOrderedSet(classNames);
          return new LiveNodeList(this, function(base) {
            var ls = [];
            if (classNamesSet.length > 0) {
              _visitNode(base.documentElement, function(node) {
                if (node !== base && node.nodeType === ELEMENT_NODE) {
                  var nodeClassNames = node.getAttribute("class");
                  if (nodeClassNames) {
                    var matches = classNames === nodeClassNames;
                    if (!matches) {
                      var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                      matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                    }
                    if (matches) {
                      ls.push(node);
                    }
                  }
                }
              });
            }
            return ls;
          });
        },
        //document factory method:
        createElement: function(tagName) {
          var node = new Element();
          node.ownerDocument = this;
          node.nodeName = tagName;
          node.tagName = tagName;
          node.localName = tagName;
          node.childNodes = new NodeList();
          var attrs = node.attributes = new NamedNodeMap();
          attrs._ownerElement = node;
          return node;
        },
        createDocumentFragment: function() {
          var node = new DocumentFragment();
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          return node;
        },
        createTextNode: function(data) {
          var node = new Text();
          node.ownerDocument = this;
          node.appendData(data);
          return node;
        },
        createComment: function(data) {
          var node = new Comment();
          node.ownerDocument = this;
          node.appendData(data);
          return node;
        },
        /**
         * Returns a new CDATASection node whose data is `data`.
         *
         * __This implementation differs from the specification:__
         * - calling this method on an HTML document does not throw `NotSupportedError`.
         *
         * @param {string} data
         * @returns {CDATASection}
         * @throws DOMException with code `INVALID_CHARACTER_ERR` if `data` contains `"]]>"`.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createCDATASection
         * @see https://dom.spec.whatwg.org/#dom-document-createcdatasection
         */
        createCDATASection: function(data) {
          if (data.indexOf("]]>") !== -1) {
            throw new DOMException(INVALID_CHARACTER_ERR, 'data contains "]]>"');
          }
          var node = new CDATASection();
          node.ownerDocument = this;
          node.appendData(data);
          return node;
        },
        /**
         * Returns a ProcessingInstruction node whose target is target and data is data.
         *
         * __This implementation differs from the specification:__
         * - it does not do any input validation on the arguments and doesn't throw "InvalidCharacterError".
         *
         * Note: When the resulting document is serialized with `requireWellFormed: true`, the
         * serializer throws with code `INVALID_STATE_ERR` if `.target` is not a valid XML `NCName`
         * (a `Name` with no colon) or is an ASCII case-insensitive match for `"xml"`, or if `.data`
         * contains `?>` (W3C DOM Parsing §3.2.1.7). Without that option the target and data are
         * emitted verbatim.
         *
         * @param {string} target
         * @param {string} data
         * @returns {ProcessingInstruction}
         * @see https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction
         * @see https://dom.spec.whatwg.org/#dom-document-createprocessinginstruction
         * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.7
         */
        createProcessingInstruction: function(target, data) {
          var node = new ProcessingInstruction();
          node.ownerDocument = this;
          node.tagName = node.nodeName = node.target = target;
          node.nodeValue = node.data = data;
          return node;
        },
        createAttribute: function(name2) {
          var node = new Attr();
          node.ownerDocument = this;
          node.name = name2;
          node.nodeName = name2;
          node.localName = name2;
          node.specified = true;
          return node;
        },
        /**
         * Creates an EntityReference object, serialized as `&name;`.
         *
         * The `name` is validated against the XML `Name` production at creation time; an invalid name
         * throws a `DOMException` with code `INVALID_CHARACTER_ERR`. When the resulting node is
         * serialized with `requireWellFormed: true`, the serializer re-validates `nodeName` and throws
         * a `DOMException` with code `INVALID_STATE_ERR` if a later `nodeName` mutation made it invalid;
         * without that option the name is emitted verbatim.
         *
         * Note: xmldom does not expand entities — the parser resolves entity references inline and never
         * constructs `EntityReference` nodes, so this method is the only producer.
         *
         * @param {string} name The name of the entity to reference.
         * @returns {EntityReference}
         * @throws {DOMException} With code `INVALID_CHARACTER_ERR` when `name` is not a valid XML `Name`.
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
         */
        createEntityReference: function(name2) {
          if (!tagNamePattern.test(name2)) {
            throw new DOMException(INVALID_CHARACTER_ERR, 'not a valid xml name "' + name2 + '"');
          }
          var node = new EntityReference();
          node.ownerDocument = this;
          node.nodeName = name2;
          return node;
        },
        // Introduced in DOM Level 2:
        createElementNS: function(namespaceURI, qualifiedName) {
          var node = new Element();
          var pl = qualifiedName.split(":");
          var attrs = node.attributes = new NamedNodeMap();
          node.childNodes = new NodeList();
          node.ownerDocument = this;
          node.nodeName = qualifiedName;
          node.tagName = qualifiedName;
          node.namespaceURI = namespaceURI;
          if (pl.length == 2) {
            node.prefix = pl[0];
            node.localName = pl[1];
          } else {
            node.localName = qualifiedName;
          }
          attrs._ownerElement = node;
          return node;
        },
        // Introduced in DOM Level 2:
        createAttributeNS: function(namespaceURI, qualifiedName) {
          var node = new Attr();
          var pl = qualifiedName.split(":");
          node.ownerDocument = this;
          node.nodeName = qualifiedName;
          node.name = qualifiedName;
          node.namespaceURI = namespaceURI;
          node.specified = true;
          if (pl.length == 2) {
            node.prefix = pl[0];
            node.localName = pl[1];
          } else {
            node.localName = qualifiedName;
          }
          return node;
        }
      };
      _extends(Document, Node);
      function Element() {
        this._nsMap = {};
      }
      Element.prototype = {
        nodeType: ELEMENT_NODE,
        hasAttribute: function(name2) {
          return this.getAttributeNode(name2) != null;
        },
        getAttribute: function(name2) {
          var attr = this.getAttributeNode(name2);
          return attr && attr.value || "";
        },
        getAttributeNode: function(name2) {
          return this.attributes.getNamedItem(name2);
        },
        setAttribute: function(name2, value) {
          var attr = this.ownerDocument.createAttribute(name2);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        },
        removeAttribute: function(name2) {
          var attr = this.getAttributeNode(name2);
          attr && this.removeAttributeNode(attr);
        },
        //four real opeartion method
        appendChild: function(newChild) {
          if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
            return this.insertBefore(newChild, null);
          } else {
            return _appendSingleChild(this, newChild);
          }
        },
        setAttributeNode: function(newAttr) {
          return this.attributes.setNamedItem(newAttr);
        },
        setAttributeNodeNS: function(newAttr) {
          return this.attributes.setNamedItemNS(newAttr);
        },
        removeAttributeNode: function(oldAttr) {
          return this.attributes.removeNamedItem(oldAttr.nodeName);
        },
        //get real attribute name,and remove it by removeAttributeNode
        removeAttributeNS: function(namespaceURI, localName) {
          var old = this.getAttributeNodeNS(namespaceURI, localName);
          old && this.removeAttributeNode(old);
        },
        hasAttributeNS: function(namespaceURI, localName) {
          return this.getAttributeNodeNS(namespaceURI, localName) != null;
        },
        getAttributeNS: function(namespaceURI, localName) {
          var attr = this.getAttributeNodeNS(namespaceURI, localName);
          return attr && attr.value || "";
        },
        setAttributeNS: function(namespaceURI, qualifiedName, value) {
          var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        },
        getAttributeNodeNS: function(namespaceURI, localName) {
          return this.attributes.getNamedItemNS(namespaceURI, localName);
        },
        getElementsByTagName: function(tagName) {
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType == ELEMENT_NODE && (tagName === "*" || node.tagName == tagName)) {
                ls.push(node);
              }
            });
            return ls;
          });
        },
        getElementsByTagNameNS: function(namespaceURI, localName) {
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
                ls.push(node);
              }
            });
            return ls;
          });
        }
      };
      Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
      Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
      _extends(Element, Node);
      function Attr() {
      }
      Attr.prototype.nodeType = ATTRIBUTE_NODE;
      _extends(Attr, Node);
      function CharacterData() {
      }
      CharacterData.prototype = {
        data: "",
        substringData: function(offset, count) {
          return this.data.substring(offset, offset + count);
        },
        appendData: function(text) {
          text = this.data + text;
          this.nodeValue = this.data = text;
          this.length = text.length;
        },
        insertData: function(offset, text) {
          this.replaceData(offset, 0, text);
        },
        appendChild: function(newChild) {
          throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
        },
        deleteData: function(offset, count) {
          this.replaceData(offset, count, "");
        },
        replaceData: function(offset, count, text) {
          var start = this.data.substring(0, offset);
          var end = this.data.substring(offset + count);
          text = start + text + end;
          this.nodeValue = this.data = text;
          this.length = text.length;
        }
      };
      _extends(CharacterData, Node);
      function Text() {
      }
      Text.prototype = {
        nodeName: "#text",
        nodeType: TEXT_NODE,
        splitText: function(offset) {
          var text = this.data;
          var newText = text.substring(offset);
          text = text.substring(0, offset);
          this.data = this.nodeValue = text;
          this.length = text.length;
          var newNode = this.ownerDocument.createTextNode(newText);
          if (this.parentNode) {
            this.parentNode.insertBefore(newNode, this.nextSibling);
          }
          return newNode;
        }
      };
      _extends(Text, CharacterData);
      function Comment() {
      }
      Comment.prototype = {
        nodeName: "#comment",
        nodeType: COMMENT_NODE
      };
      _extends(Comment, CharacterData);
      function CDATASection() {
      }
      CDATASection.prototype = {
        nodeName: "#cdata-section",
        nodeType: CDATA_SECTION_NODE
      };
      _extends(CDATASection, CharacterData);
      function DocumentType() {
      }
      DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
      _extends(DocumentType, Node);
      function Notation() {
      }
      Notation.prototype.nodeType = NOTATION_NODE;
      _extends(Notation, Node);
      function Entity() {
      }
      Entity.prototype.nodeType = ENTITY_NODE;
      _extends(Entity, Node);
      function EntityReference() {
      }
      EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
      _extends(EntityReference, Node);
      function DocumentFragment() {
      }
      DocumentFragment.prototype.nodeName = "#document-fragment";
      DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
      _extends(DocumentFragment, Node);
      function ProcessingInstruction() {
      }
      ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
      _extends(ProcessingInstruction, Node);
      function XMLSerializer() {
      }
      XMLSerializer.prototype.serializeToString = function(node, isHtml, nodeFilter, options) {
        return nodeSerializeToString.call(node, isHtml, nodeFilter, options);
      };
      Node.prototype.toString = nodeSerializeToString;
      function nodeSerializeToString(isHtml, nodeFilter, options) {
        var requireWellFormed = !!options && !!options.requireWellFormed;
        var buf = [];
        var refNode = this.nodeType == 9 && this.documentElement || this;
        var prefix = refNode.prefix;
        var uri = refNode.namespaceURI;
        if (uri && prefix == null) {
          var prefix = refNode.lookupPrefix(uri);
          if (prefix == null) {
            var visibleNamespaces = [
              { namespace: uri, prefix: null }
              //{namespace:uri,prefix:''}
            ];
          }
        }
        serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces, requireWellFormed);
        return buf.join("");
      }
      function needNamespaceDefine(node, isHTML, visibleNamespaces) {
        var prefix = node.prefix || "";
        var uri = node.namespaceURI;
        if (!uri) {
          return false;
        }
        if (prefix === "xml" && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) {
          return false;
        }
        var i = visibleNamespaces.length;
        while (i--) {
          var ns = visibleNamespaces[i];
          if (ns.prefix === prefix) {
            return ns.namespace !== uri;
          }
        }
        return true;
      }
      function addSerializedAttribute(buf, qualifiedName, value, requireWellFormed) {
        if (requireWellFormed && !tagNamePattern.test(qualifiedName)) {
          throw new DOMException(INVALID_STATE_ERR, 'The attribute name "' + qualifiedName + '" is not a valid XML QName');
        }
        buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
      }
      function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces, requireWellFormed) {
        if (!visibleNamespaces) {
          visibleNamespaces = [];
        }
        walkDOM(node, { ns: visibleNamespaces, isHTML }, {
          enter: function(n, ctx) {
            var ns = ctx.ns;
            var html = ctx.isHTML;
            if (nodeFilter) {
              n = nodeFilter(n);
              if (n) {
                if (typeof n == "string") {
                  buf.push(n);
                  return null;
                }
              } else {
                return null;
              }
            }
            switch (n.nodeType) {
              case ELEMENT_NODE:
                var attrs = n.attributes;
                var len = attrs.length;
                var nodeName = n.tagName;
                html = NAMESPACE.isHTML(n.namespaceURI) || html;
                var prefixedNodeName = nodeName;
                if (!html && !n.prefix && n.namespaceURI) {
                  var defaultNS;
                  for (var ai = 0; ai < attrs.length; ai++) {
                    if (attrs.item(ai).name === "xmlns") {
                      defaultNS = attrs.item(ai).value;
                      break;
                    }
                  }
                  if (!defaultNS) {
                    for (var nsi = ns.length - 1; nsi >= 0; nsi--) {
                      var nsEntry = ns[nsi];
                      if (nsEntry.prefix === "" && nsEntry.namespace === n.namespaceURI) {
                        defaultNS = nsEntry.namespace;
                        break;
                      }
                    }
                  }
                  if (defaultNS !== n.namespaceURI) {
                    for (var nsi = ns.length - 1; nsi >= 0; nsi--) {
                      var nsEntry = ns[nsi];
                      if (nsEntry.namespace === n.namespaceURI) {
                        if (nsEntry.prefix) {
                          prefixedNodeName = nsEntry.prefix + ":" + nodeName;
                        }
                        break;
                      }
                    }
                  }
                }
                if (requireWellFormed && !tagNamePattern.test(prefixedNodeName)) {
                  throw new DOMException(INVALID_STATE_ERR, 'The element name "' + prefixedNodeName + '" is not a valid XML QName');
                }
                buf.push("<", prefixedNodeName);
                var childNs = ns.slice();
                for (var i = 0; i < len; i++) {
                  var attr = attrs.item(i);
                  if (attr.prefix == "xmlns") {
                    childNs.push({ prefix: attr.localName, namespace: attr.value });
                  } else if (attr.nodeName == "xmlns") {
                    childNs.push({ prefix: "", namespace: attr.value });
                  }
                }
                for (var i = 0; i < len; i++) {
                  var attr = attrs.item(i);
                  if (needNamespaceDefine(attr, html, childNs)) {
                    var attrPrefix = attr.prefix || "";
                    var uri = attr.namespaceURI;
                    addSerializedAttribute(buf, attrPrefix ? "xmlns:" + attrPrefix : "xmlns", uri, requireWellFormed);
                    childNs.push({ prefix: attrPrefix, namespace: uri });
                  }
                  var filteredAttr = nodeFilter ? nodeFilter(attr) : attr;
                  if (filteredAttr) {
                    if (typeof filteredAttr === "string") {
                      buf.push(filteredAttr);
                    } else {
                      addSerializedAttribute(buf, filteredAttr.name, filteredAttr.value, requireWellFormed);
                    }
                  }
                }
                if (nodeName === prefixedNodeName && needNamespaceDefine(n, html, childNs)) {
                  var nodePrefix = n.prefix || "";
                  var uri = n.namespaceURI;
                  addSerializedAttribute(buf, nodePrefix ? "xmlns:" + nodePrefix : "xmlns", uri, requireWellFormed);
                  childNs.push({ prefix: nodePrefix, namespace: uri });
                }
                var child = n.firstChild;
                if (child || html && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
                  buf.push(">");
                  if (html && /^script$/i.test(nodeName)) {
                    while (child) {
                      if (child.data) {
                        buf.push(child.data);
                      } else {
                        serializeToString(child, buf, html, nodeFilter, childNs.slice(), requireWellFormed);
                      }
                      child = child.nextSibling;
                    }
                    buf.push("</", nodeName, ">");
                    return null;
                  }
                  return { ns: childNs, isHTML: html, tag: prefixedNodeName };
                } else {
                  buf.push("/>");
                  return null;
                }
              case DOCUMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                return { ns: ns.slice(), isHTML: html, tag: null };
              case ATTRIBUTE_NODE:
                addSerializedAttribute(buf, n.name, n.value, requireWellFormed);
                return null;
              case TEXT_NODE:
                buf.push(n.data.replace(/[<&>]/g, _xmlEncoder));
                return null;
              case CDATA_SECTION_NODE:
                if (requireWellFormed && n.data.indexOf("]]>") !== -1) {
                  throw new DOMException(INVALID_STATE_ERR, 'The CDATASection data contains "]]>"');
                }
                buf.push("<![CDATA[", n.data.replace(/]]>/g, "]]]]><![CDATA[>"), "]]>");
                return null;
              case COMMENT_NODE:
                if (requireWellFormed && n.data.indexOf("-->") !== -1) {
                  throw new DOMException(INVALID_STATE_ERR, 'The comment node data contains "-->"');
                }
                buf.push("<!--", n.data, "-->");
                return null;
              case DOCUMENT_TYPE_NODE:
                if (requireWellFormed) {
                  if (!tagNamePattern.test(n.name)) {
                    throw new DOMException(INVALID_STATE_ERR, 'The doctype name "' + n.name + '" is not a valid XML Name');
                  }
                  if (n.publicId && !/^("[\x20\r\na-zA-Z0-9\-()+,.\/:=?;!*#@$_%']*"|'[\x20\r\na-zA-Z0-9\-()+,.\/:=?;!*#@$_%'"]*')$/.test(n.publicId)) {
                    throw new DOMException(INVALID_STATE_ERR, "DocumentType publicId is not a valid PubidLiteral");
                  }
                  if (n.systemId && !/^("[^"]*"|'[^']*')$/.test(n.systemId)) {
                    throw new DOMException(INVALID_STATE_ERR, "DocumentType systemId is not a valid SystemLiteral");
                  }
                  if (n.internalSubset && n.internalSubset.indexOf("]>") !== -1) {
                    throw new DOMException(INVALID_STATE_ERR, 'DocumentType internalSubset contains "]>"');
                  }
                }
                var pubid = n.publicId;
                var sysid = n.systemId;
                buf.push("<!DOCTYPE ", n.name);
                if (pubid) {
                  buf.push(" PUBLIC ", pubid);
                  if (sysid && sysid != ".") {
                    buf.push(" ", sysid);
                  }
                  buf.push(">");
                } else if (sysid && sysid != ".") {
                  buf.push(" SYSTEM ", sysid, ">");
                } else {
                  var sub = n.internalSubset;
                  if (sub) {
                    buf.push(" [", sub, "]");
                  }
                  buf.push(">");
                }
                return null;
              case PROCESSING_INSTRUCTION_NODE:
                if (requireWellFormed) {
                  if (!tagNamePattern.test(n.target) || n.target.indexOf(":") !== -1 || n.target.toLowerCase() === "xml") {
                    throw new DOMException(
                      INVALID_STATE_ERR,
                      'The processing instruction target "' + n.target + '" is not a valid XML NCName or is reserved'
                    );
                  }
                  if (n.data.indexOf("?>") !== -1) {
                    throw new DOMException(INVALID_STATE_ERR, 'The ProcessingInstruction data contains "?>"');
                  }
                }
                buf.push("<?", n.target, " ", n.data, "?>");
                return null;
              case ENTITY_REFERENCE_NODE:
                if (requireWellFormed && !tagNamePattern.test(n.nodeName)) {
                  throw new DOMException(
                    INVALID_STATE_ERR,
                    'The entity reference name "' + n.nodeName + '" is not a valid XML Name'
                  );
                }
                buf.push("&", n.nodeName, ";");
                return null;
              //case ENTITY_NODE:
              //case NOTATION_NODE:
              default:
                buf.push("??", n.nodeName);
                return null;
            }
          },
          exit: function(n, childCtx) {
            if (childCtx && childCtx.tag) {
              buf.push("</", childCtx.tag, ">");
            }
          }
        });
      }
      function importNode(doc, node, deep) {
        var destRoot;
        walkDOM(node, null, {
          enter: function(srcNode, destParent) {
            var destNode = srcNode.cloneNode(false);
            destNode.ownerDocument = doc;
            destNode.parentNode = null;
            if (destParent === null) {
              destRoot = destNode;
            } else {
              destParent.appendChild(destNode);
            }
            var shouldDeep = srcNode.nodeType === ATTRIBUTE_NODE || deep;
            return shouldDeep ? destNode : null;
          }
        });
        return destRoot;
      }
      function cloneNode(doc, node, deep) {
        var destRoot;
        walkDOM(node, null, {
          enter: function(srcNode, destParent) {
            var destNode = new srcNode.constructor();
            for (var n in srcNode) {
              if (Object.prototype.hasOwnProperty.call(srcNode, n)) {
                var v = srcNode[n];
                if (typeof v != "object") {
                  if (v != destNode[n]) {
                    destNode[n] = v;
                  }
                }
              }
            }
            if (srcNode.childNodes) {
              destNode.childNodes = new NodeList();
            }
            destNode.ownerDocument = doc;
            var shouldDeep = deep;
            switch (destNode.nodeType) {
              case ELEMENT_NODE:
                var attrs = srcNode.attributes;
                var attrs2 = destNode.attributes = new NamedNodeMap();
                var len = attrs.length;
                attrs2._ownerElement = destNode;
                for (var i = 0; i < len; i++) {
                  destNode.setAttributeNode(cloneNode(doc, attrs.item(i), true));
                }
                break;
              case ATTRIBUTE_NODE:
                shouldDeep = true;
            }
            if (destParent !== null) {
              destParent.appendChild(destNode);
            } else {
              destRoot = destNode;
            }
            return shouldDeep ? destNode : null;
          }
        });
        return destRoot;
      }
      function __set__(object, key, value) {
        object[key] = value;
      }
      try {
        if (Object.defineProperty) {
          Object.defineProperty(LiveNodeList.prototype, "length", {
            get: function() {
              _updateLiveList(this);
              return this.$$length;
            }
          });
          Object.defineProperty(Node.prototype, "textContent", {
            get: function() {
              if (this.nodeType === ELEMENT_NODE || this.nodeType === DOCUMENT_FRAGMENT_NODE) {
                var buf = [];
                walkDOM(this, null, {
                  enter: function(n) {
                    if (n.nodeType === ELEMENT_NODE || n.nodeType === DOCUMENT_FRAGMENT_NODE) {
                      return true;
                    }
                    if (n.nodeType === PROCESSING_INSTRUCTION_NODE || n.nodeType === COMMENT_NODE) {
                      return null;
                    }
                    buf.push(n.nodeValue);
                  }
                });
                return buf.join("");
              }
              return this.nodeValue;
            },
            set: function(data) {
              switch (this.nodeType) {
                case ELEMENT_NODE:
                case DOCUMENT_FRAGMENT_NODE:
                  while (this.firstChild) {
                    this.removeChild(this.firstChild);
                  }
                  if (data || String(data)) {
                    this.appendChild(this.ownerDocument.createTextNode(data));
                  }
                  break;
                default:
                  this.data = data;
                  this.value = data;
                  this.nodeValue = data;
              }
            }
          });
          __set__ = function(object, key, value) {
            object["$$" + key] = value;
          };
        }
      } catch (e) {
      }
      exports.DocumentType = DocumentType;
      exports.DOMException = DOMException;
      exports.DOMImplementation = DOMImplementation;
      exports.Element = Element;
      exports.Node = Node;
      exports.NodeList = NodeList;
      exports.walkDOM = walkDOM;
      exports.XMLSerializer = XMLSerializer;
    }
  });

  // node_modules/@xmldom/xmldom/lib/entities.js
  var require_entities = __commonJS({
    "node_modules/@xmldom/xmldom/lib/entities.js"(exports) {
      "use strict";
      var freeze = require_conventions().freeze;
      exports.XML_ENTITIES = freeze({
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        quot: '"'
      });
      exports.HTML_ENTITIES = freeze({
        Aacute: "\xC1",
        aacute: "\xE1",
        Abreve: "\u0102",
        abreve: "\u0103",
        ac: "\u223E",
        acd: "\u223F",
        acE: "\u223E\u0333",
        Acirc: "\xC2",
        acirc: "\xE2",
        acute: "\xB4",
        Acy: "\u0410",
        acy: "\u0430",
        AElig: "\xC6",
        aelig: "\xE6",
        af: "\u2061",
        Afr: "\u{1D504}",
        afr: "\u{1D51E}",
        Agrave: "\xC0",
        agrave: "\xE0",
        alefsym: "\u2135",
        aleph: "\u2135",
        Alpha: "\u0391",
        alpha: "\u03B1",
        Amacr: "\u0100",
        amacr: "\u0101",
        amalg: "\u2A3F",
        AMP: "&",
        amp: "&",
        And: "\u2A53",
        and: "\u2227",
        andand: "\u2A55",
        andd: "\u2A5C",
        andslope: "\u2A58",
        andv: "\u2A5A",
        ang: "\u2220",
        ange: "\u29A4",
        angle: "\u2220",
        angmsd: "\u2221",
        angmsdaa: "\u29A8",
        angmsdab: "\u29A9",
        angmsdac: "\u29AA",
        angmsdad: "\u29AB",
        angmsdae: "\u29AC",
        angmsdaf: "\u29AD",
        angmsdag: "\u29AE",
        angmsdah: "\u29AF",
        angrt: "\u221F",
        angrtvb: "\u22BE",
        angrtvbd: "\u299D",
        angsph: "\u2222",
        angst: "\xC5",
        angzarr: "\u237C",
        Aogon: "\u0104",
        aogon: "\u0105",
        Aopf: "\u{1D538}",
        aopf: "\u{1D552}",
        ap: "\u2248",
        apacir: "\u2A6F",
        apE: "\u2A70",
        ape: "\u224A",
        apid: "\u224B",
        apos: "'",
        ApplyFunction: "\u2061",
        approx: "\u2248",
        approxeq: "\u224A",
        Aring: "\xC5",
        aring: "\xE5",
        Ascr: "\u{1D49C}",
        ascr: "\u{1D4B6}",
        Assign: "\u2254",
        ast: "*",
        asymp: "\u2248",
        asympeq: "\u224D",
        Atilde: "\xC3",
        atilde: "\xE3",
        Auml: "\xC4",
        auml: "\xE4",
        awconint: "\u2233",
        awint: "\u2A11",
        backcong: "\u224C",
        backepsilon: "\u03F6",
        backprime: "\u2035",
        backsim: "\u223D",
        backsimeq: "\u22CD",
        Backslash: "\u2216",
        Barv: "\u2AE7",
        barvee: "\u22BD",
        Barwed: "\u2306",
        barwed: "\u2305",
        barwedge: "\u2305",
        bbrk: "\u23B5",
        bbrktbrk: "\u23B6",
        bcong: "\u224C",
        Bcy: "\u0411",
        bcy: "\u0431",
        bdquo: "\u201E",
        becaus: "\u2235",
        Because: "\u2235",
        because: "\u2235",
        bemptyv: "\u29B0",
        bepsi: "\u03F6",
        bernou: "\u212C",
        Bernoullis: "\u212C",
        Beta: "\u0392",
        beta: "\u03B2",
        beth: "\u2136",
        between: "\u226C",
        Bfr: "\u{1D505}",
        bfr: "\u{1D51F}",
        bigcap: "\u22C2",
        bigcirc: "\u25EF",
        bigcup: "\u22C3",
        bigodot: "\u2A00",
        bigoplus: "\u2A01",
        bigotimes: "\u2A02",
        bigsqcup: "\u2A06",
        bigstar: "\u2605",
        bigtriangledown: "\u25BD",
        bigtriangleup: "\u25B3",
        biguplus: "\u2A04",
        bigvee: "\u22C1",
        bigwedge: "\u22C0",
        bkarow: "\u290D",
        blacklozenge: "\u29EB",
        blacksquare: "\u25AA",
        blacktriangle: "\u25B4",
        blacktriangledown: "\u25BE",
        blacktriangleleft: "\u25C2",
        blacktriangleright: "\u25B8",
        blank: "\u2423",
        blk12: "\u2592",
        blk14: "\u2591",
        blk34: "\u2593",
        block: "\u2588",
        bne: "=\u20E5",
        bnequiv: "\u2261\u20E5",
        bNot: "\u2AED",
        bnot: "\u2310",
        Bopf: "\u{1D539}",
        bopf: "\u{1D553}",
        bot: "\u22A5",
        bottom: "\u22A5",
        bowtie: "\u22C8",
        boxbox: "\u29C9",
        boxDL: "\u2557",
        boxDl: "\u2556",
        boxdL: "\u2555",
        boxdl: "\u2510",
        boxDR: "\u2554",
        boxDr: "\u2553",
        boxdR: "\u2552",
        boxdr: "\u250C",
        boxH: "\u2550",
        boxh: "\u2500",
        boxHD: "\u2566",
        boxHd: "\u2564",
        boxhD: "\u2565",
        boxhd: "\u252C",
        boxHU: "\u2569",
        boxHu: "\u2567",
        boxhU: "\u2568",
        boxhu: "\u2534",
        boxminus: "\u229F",
        boxplus: "\u229E",
        boxtimes: "\u22A0",
        boxUL: "\u255D",
        boxUl: "\u255C",
        boxuL: "\u255B",
        boxul: "\u2518",
        boxUR: "\u255A",
        boxUr: "\u2559",
        boxuR: "\u2558",
        boxur: "\u2514",
        boxV: "\u2551",
        boxv: "\u2502",
        boxVH: "\u256C",
        boxVh: "\u256B",
        boxvH: "\u256A",
        boxvh: "\u253C",
        boxVL: "\u2563",
        boxVl: "\u2562",
        boxvL: "\u2561",
        boxvl: "\u2524",
        boxVR: "\u2560",
        boxVr: "\u255F",
        boxvR: "\u255E",
        boxvr: "\u251C",
        bprime: "\u2035",
        Breve: "\u02D8",
        breve: "\u02D8",
        brvbar: "\xA6",
        Bscr: "\u212C",
        bscr: "\u{1D4B7}",
        bsemi: "\u204F",
        bsim: "\u223D",
        bsime: "\u22CD",
        bsol: "\\",
        bsolb: "\u29C5",
        bsolhsub: "\u27C8",
        bull: "\u2022",
        bullet: "\u2022",
        bump: "\u224E",
        bumpE: "\u2AAE",
        bumpe: "\u224F",
        Bumpeq: "\u224E",
        bumpeq: "\u224F",
        Cacute: "\u0106",
        cacute: "\u0107",
        Cap: "\u22D2",
        cap: "\u2229",
        capand: "\u2A44",
        capbrcup: "\u2A49",
        capcap: "\u2A4B",
        capcup: "\u2A47",
        capdot: "\u2A40",
        CapitalDifferentialD: "\u2145",
        caps: "\u2229\uFE00",
        caret: "\u2041",
        caron: "\u02C7",
        Cayleys: "\u212D",
        ccaps: "\u2A4D",
        Ccaron: "\u010C",
        ccaron: "\u010D",
        Ccedil: "\xC7",
        ccedil: "\xE7",
        Ccirc: "\u0108",
        ccirc: "\u0109",
        Cconint: "\u2230",
        ccups: "\u2A4C",
        ccupssm: "\u2A50",
        Cdot: "\u010A",
        cdot: "\u010B",
        cedil: "\xB8",
        Cedilla: "\xB8",
        cemptyv: "\u29B2",
        cent: "\xA2",
        CenterDot: "\xB7",
        centerdot: "\xB7",
        Cfr: "\u212D",
        cfr: "\u{1D520}",
        CHcy: "\u0427",
        chcy: "\u0447",
        check: "\u2713",
        checkmark: "\u2713",
        Chi: "\u03A7",
        chi: "\u03C7",
        cir: "\u25CB",
        circ: "\u02C6",
        circeq: "\u2257",
        circlearrowleft: "\u21BA",
        circlearrowright: "\u21BB",
        circledast: "\u229B",
        circledcirc: "\u229A",
        circleddash: "\u229D",
        CircleDot: "\u2299",
        circledR: "\xAE",
        circledS: "\u24C8",
        CircleMinus: "\u2296",
        CirclePlus: "\u2295",
        CircleTimes: "\u2297",
        cirE: "\u29C3",
        cire: "\u2257",
        cirfnint: "\u2A10",
        cirmid: "\u2AEF",
        cirscir: "\u29C2",
        ClockwiseContourIntegral: "\u2232",
        CloseCurlyDoubleQuote: "\u201D",
        CloseCurlyQuote: "\u2019",
        clubs: "\u2663",
        clubsuit: "\u2663",
        Colon: "\u2237",
        colon: ":",
        Colone: "\u2A74",
        colone: "\u2254",
        coloneq: "\u2254",
        comma: ",",
        commat: "@",
        comp: "\u2201",
        compfn: "\u2218",
        complement: "\u2201",
        complexes: "\u2102",
        cong: "\u2245",
        congdot: "\u2A6D",
        Congruent: "\u2261",
        Conint: "\u222F",
        conint: "\u222E",
        ContourIntegral: "\u222E",
        Copf: "\u2102",
        copf: "\u{1D554}",
        coprod: "\u2210",
        Coproduct: "\u2210",
        COPY: "\xA9",
        copy: "\xA9",
        copysr: "\u2117",
        CounterClockwiseContourIntegral: "\u2233",
        crarr: "\u21B5",
        Cross: "\u2A2F",
        cross: "\u2717",
        Cscr: "\u{1D49E}",
        cscr: "\u{1D4B8}",
        csub: "\u2ACF",
        csube: "\u2AD1",
        csup: "\u2AD0",
        csupe: "\u2AD2",
        ctdot: "\u22EF",
        cudarrl: "\u2938",
        cudarrr: "\u2935",
        cuepr: "\u22DE",
        cuesc: "\u22DF",
        cularr: "\u21B6",
        cularrp: "\u293D",
        Cup: "\u22D3",
        cup: "\u222A",
        cupbrcap: "\u2A48",
        CupCap: "\u224D",
        cupcap: "\u2A46",
        cupcup: "\u2A4A",
        cupdot: "\u228D",
        cupor: "\u2A45",
        cups: "\u222A\uFE00",
        curarr: "\u21B7",
        curarrm: "\u293C",
        curlyeqprec: "\u22DE",
        curlyeqsucc: "\u22DF",
        curlyvee: "\u22CE",
        curlywedge: "\u22CF",
        curren: "\xA4",
        curvearrowleft: "\u21B6",
        curvearrowright: "\u21B7",
        cuvee: "\u22CE",
        cuwed: "\u22CF",
        cwconint: "\u2232",
        cwint: "\u2231",
        cylcty: "\u232D",
        Dagger: "\u2021",
        dagger: "\u2020",
        daleth: "\u2138",
        Darr: "\u21A1",
        dArr: "\u21D3",
        darr: "\u2193",
        dash: "\u2010",
        Dashv: "\u2AE4",
        dashv: "\u22A3",
        dbkarow: "\u290F",
        dblac: "\u02DD",
        Dcaron: "\u010E",
        dcaron: "\u010F",
        Dcy: "\u0414",
        dcy: "\u0434",
        DD: "\u2145",
        dd: "\u2146",
        ddagger: "\u2021",
        ddarr: "\u21CA",
        DDotrahd: "\u2911",
        ddotseq: "\u2A77",
        deg: "\xB0",
        Del: "\u2207",
        Delta: "\u0394",
        delta: "\u03B4",
        demptyv: "\u29B1",
        dfisht: "\u297F",
        Dfr: "\u{1D507}",
        dfr: "\u{1D521}",
        dHar: "\u2965",
        dharl: "\u21C3",
        dharr: "\u21C2",
        DiacriticalAcute: "\xB4",
        DiacriticalDot: "\u02D9",
        DiacriticalDoubleAcute: "\u02DD",
        DiacriticalGrave: "`",
        DiacriticalTilde: "\u02DC",
        diam: "\u22C4",
        Diamond: "\u22C4",
        diamond: "\u22C4",
        diamondsuit: "\u2666",
        diams: "\u2666",
        die: "\xA8",
        DifferentialD: "\u2146",
        digamma: "\u03DD",
        disin: "\u22F2",
        div: "\xF7",
        divide: "\xF7",
        divideontimes: "\u22C7",
        divonx: "\u22C7",
        DJcy: "\u0402",
        djcy: "\u0452",
        dlcorn: "\u231E",
        dlcrop: "\u230D",
        dollar: "$",
        Dopf: "\u{1D53B}",
        dopf: "\u{1D555}",
        Dot: "\xA8",
        dot: "\u02D9",
        DotDot: "\u20DC",
        doteq: "\u2250",
        doteqdot: "\u2251",
        DotEqual: "\u2250",
        dotminus: "\u2238",
        dotplus: "\u2214",
        dotsquare: "\u22A1",
        doublebarwedge: "\u2306",
        DoubleContourIntegral: "\u222F",
        DoubleDot: "\xA8",
        DoubleDownArrow: "\u21D3",
        DoubleLeftArrow: "\u21D0",
        DoubleLeftRightArrow: "\u21D4",
        DoubleLeftTee: "\u2AE4",
        DoubleLongLeftArrow: "\u27F8",
        DoubleLongLeftRightArrow: "\u27FA",
        DoubleLongRightArrow: "\u27F9",
        DoubleRightArrow: "\u21D2",
        DoubleRightTee: "\u22A8",
        DoubleUpArrow: "\u21D1",
        DoubleUpDownArrow: "\u21D5",
        DoubleVerticalBar: "\u2225",
        DownArrow: "\u2193",
        Downarrow: "\u21D3",
        downarrow: "\u2193",
        DownArrowBar: "\u2913",
        DownArrowUpArrow: "\u21F5",
        DownBreve: "\u0311",
        downdownarrows: "\u21CA",
        downharpoonleft: "\u21C3",
        downharpoonright: "\u21C2",
        DownLeftRightVector: "\u2950",
        DownLeftTeeVector: "\u295E",
        DownLeftVector: "\u21BD",
        DownLeftVectorBar: "\u2956",
        DownRightTeeVector: "\u295F",
        DownRightVector: "\u21C1",
        DownRightVectorBar: "\u2957",
        DownTee: "\u22A4",
        DownTeeArrow: "\u21A7",
        drbkarow: "\u2910",
        drcorn: "\u231F",
        drcrop: "\u230C",
        Dscr: "\u{1D49F}",
        dscr: "\u{1D4B9}",
        DScy: "\u0405",
        dscy: "\u0455",
        dsol: "\u29F6",
        Dstrok: "\u0110",
        dstrok: "\u0111",
        dtdot: "\u22F1",
        dtri: "\u25BF",
        dtrif: "\u25BE",
        duarr: "\u21F5",
        duhar: "\u296F",
        dwangle: "\u29A6",
        DZcy: "\u040F",
        dzcy: "\u045F",
        dzigrarr: "\u27FF",
        Eacute: "\xC9",
        eacute: "\xE9",
        easter: "\u2A6E",
        Ecaron: "\u011A",
        ecaron: "\u011B",
        ecir: "\u2256",
        Ecirc: "\xCA",
        ecirc: "\xEA",
        ecolon: "\u2255",
        Ecy: "\u042D",
        ecy: "\u044D",
        eDDot: "\u2A77",
        Edot: "\u0116",
        eDot: "\u2251",
        edot: "\u0117",
        ee: "\u2147",
        efDot: "\u2252",
        Efr: "\u{1D508}",
        efr: "\u{1D522}",
        eg: "\u2A9A",
        Egrave: "\xC8",
        egrave: "\xE8",
        egs: "\u2A96",
        egsdot: "\u2A98",
        el: "\u2A99",
        Element: "\u2208",
        elinters: "\u23E7",
        ell: "\u2113",
        els: "\u2A95",
        elsdot: "\u2A97",
        Emacr: "\u0112",
        emacr: "\u0113",
        empty: "\u2205",
        emptyset: "\u2205",
        EmptySmallSquare: "\u25FB",
        emptyv: "\u2205",
        EmptyVerySmallSquare: "\u25AB",
        emsp: "\u2003",
        emsp13: "\u2004",
        emsp14: "\u2005",
        ENG: "\u014A",
        eng: "\u014B",
        ensp: "\u2002",
        Eogon: "\u0118",
        eogon: "\u0119",
        Eopf: "\u{1D53C}",
        eopf: "\u{1D556}",
        epar: "\u22D5",
        eparsl: "\u29E3",
        eplus: "\u2A71",
        epsi: "\u03B5",
        Epsilon: "\u0395",
        epsilon: "\u03B5",
        epsiv: "\u03F5",
        eqcirc: "\u2256",
        eqcolon: "\u2255",
        eqsim: "\u2242",
        eqslantgtr: "\u2A96",
        eqslantless: "\u2A95",
        Equal: "\u2A75",
        equals: "=",
        EqualTilde: "\u2242",
        equest: "\u225F",
        Equilibrium: "\u21CC",
        equiv: "\u2261",
        equivDD: "\u2A78",
        eqvparsl: "\u29E5",
        erarr: "\u2971",
        erDot: "\u2253",
        Escr: "\u2130",
        escr: "\u212F",
        esdot: "\u2250",
        Esim: "\u2A73",
        esim: "\u2242",
        Eta: "\u0397",
        eta: "\u03B7",
        ETH: "\xD0",
        eth: "\xF0",
        Euml: "\xCB",
        euml: "\xEB",
        euro: "\u20AC",
        excl: "!",
        exist: "\u2203",
        Exists: "\u2203",
        expectation: "\u2130",
        ExponentialE: "\u2147",
        exponentiale: "\u2147",
        fallingdotseq: "\u2252",
        Fcy: "\u0424",
        fcy: "\u0444",
        female: "\u2640",
        ffilig: "\uFB03",
        fflig: "\uFB00",
        ffllig: "\uFB04",
        Ffr: "\u{1D509}",
        ffr: "\u{1D523}",
        filig: "\uFB01",
        FilledSmallSquare: "\u25FC",
        FilledVerySmallSquare: "\u25AA",
        fjlig: "fj",
        flat: "\u266D",
        fllig: "\uFB02",
        fltns: "\u25B1",
        fnof: "\u0192",
        Fopf: "\u{1D53D}",
        fopf: "\u{1D557}",
        ForAll: "\u2200",
        forall: "\u2200",
        fork: "\u22D4",
        forkv: "\u2AD9",
        Fouriertrf: "\u2131",
        fpartint: "\u2A0D",
        frac12: "\xBD",
        frac13: "\u2153",
        frac14: "\xBC",
        frac15: "\u2155",
        frac16: "\u2159",
        frac18: "\u215B",
        frac23: "\u2154",
        frac25: "\u2156",
        frac34: "\xBE",
        frac35: "\u2157",
        frac38: "\u215C",
        frac45: "\u2158",
        frac56: "\u215A",
        frac58: "\u215D",
        frac78: "\u215E",
        frasl: "\u2044",
        frown: "\u2322",
        Fscr: "\u2131",
        fscr: "\u{1D4BB}",
        gacute: "\u01F5",
        Gamma: "\u0393",
        gamma: "\u03B3",
        Gammad: "\u03DC",
        gammad: "\u03DD",
        gap: "\u2A86",
        Gbreve: "\u011E",
        gbreve: "\u011F",
        Gcedil: "\u0122",
        Gcirc: "\u011C",
        gcirc: "\u011D",
        Gcy: "\u0413",
        gcy: "\u0433",
        Gdot: "\u0120",
        gdot: "\u0121",
        gE: "\u2267",
        ge: "\u2265",
        gEl: "\u2A8C",
        gel: "\u22DB",
        geq: "\u2265",
        geqq: "\u2267",
        geqslant: "\u2A7E",
        ges: "\u2A7E",
        gescc: "\u2AA9",
        gesdot: "\u2A80",
        gesdoto: "\u2A82",
        gesdotol: "\u2A84",
        gesl: "\u22DB\uFE00",
        gesles: "\u2A94",
        Gfr: "\u{1D50A}",
        gfr: "\u{1D524}",
        Gg: "\u22D9",
        gg: "\u226B",
        ggg: "\u22D9",
        gimel: "\u2137",
        GJcy: "\u0403",
        gjcy: "\u0453",
        gl: "\u2277",
        gla: "\u2AA5",
        glE: "\u2A92",
        glj: "\u2AA4",
        gnap: "\u2A8A",
        gnapprox: "\u2A8A",
        gnE: "\u2269",
        gne: "\u2A88",
        gneq: "\u2A88",
        gneqq: "\u2269",
        gnsim: "\u22E7",
        Gopf: "\u{1D53E}",
        gopf: "\u{1D558}",
        grave: "`",
        GreaterEqual: "\u2265",
        GreaterEqualLess: "\u22DB",
        GreaterFullEqual: "\u2267",
        GreaterGreater: "\u2AA2",
        GreaterLess: "\u2277",
        GreaterSlantEqual: "\u2A7E",
        GreaterTilde: "\u2273",
        Gscr: "\u{1D4A2}",
        gscr: "\u210A",
        gsim: "\u2273",
        gsime: "\u2A8E",
        gsiml: "\u2A90",
        Gt: "\u226B",
        GT: ">",
        gt: ">",
        gtcc: "\u2AA7",
        gtcir: "\u2A7A",
        gtdot: "\u22D7",
        gtlPar: "\u2995",
        gtquest: "\u2A7C",
        gtrapprox: "\u2A86",
        gtrarr: "\u2978",
        gtrdot: "\u22D7",
        gtreqless: "\u22DB",
        gtreqqless: "\u2A8C",
        gtrless: "\u2277",
        gtrsim: "\u2273",
        gvertneqq: "\u2269\uFE00",
        gvnE: "\u2269\uFE00",
        Hacek: "\u02C7",
        hairsp: "\u200A",
        half: "\xBD",
        hamilt: "\u210B",
        HARDcy: "\u042A",
        hardcy: "\u044A",
        hArr: "\u21D4",
        harr: "\u2194",
        harrcir: "\u2948",
        harrw: "\u21AD",
        Hat: "^",
        hbar: "\u210F",
        Hcirc: "\u0124",
        hcirc: "\u0125",
        hearts: "\u2665",
        heartsuit: "\u2665",
        hellip: "\u2026",
        hercon: "\u22B9",
        Hfr: "\u210C",
        hfr: "\u{1D525}",
        HilbertSpace: "\u210B",
        hksearow: "\u2925",
        hkswarow: "\u2926",
        hoarr: "\u21FF",
        homtht: "\u223B",
        hookleftarrow: "\u21A9",
        hookrightarrow: "\u21AA",
        Hopf: "\u210D",
        hopf: "\u{1D559}",
        horbar: "\u2015",
        HorizontalLine: "\u2500",
        Hscr: "\u210B",
        hscr: "\u{1D4BD}",
        hslash: "\u210F",
        Hstrok: "\u0126",
        hstrok: "\u0127",
        HumpDownHump: "\u224E",
        HumpEqual: "\u224F",
        hybull: "\u2043",
        hyphen: "\u2010",
        Iacute: "\xCD",
        iacute: "\xED",
        ic: "\u2063",
        Icirc: "\xCE",
        icirc: "\xEE",
        Icy: "\u0418",
        icy: "\u0438",
        Idot: "\u0130",
        IEcy: "\u0415",
        iecy: "\u0435",
        iexcl: "\xA1",
        iff: "\u21D4",
        Ifr: "\u2111",
        ifr: "\u{1D526}",
        Igrave: "\xCC",
        igrave: "\xEC",
        ii: "\u2148",
        iiiint: "\u2A0C",
        iiint: "\u222D",
        iinfin: "\u29DC",
        iiota: "\u2129",
        IJlig: "\u0132",
        ijlig: "\u0133",
        Im: "\u2111",
        Imacr: "\u012A",
        imacr: "\u012B",
        image: "\u2111",
        ImaginaryI: "\u2148",
        imagline: "\u2110",
        imagpart: "\u2111",
        imath: "\u0131",
        imof: "\u22B7",
        imped: "\u01B5",
        Implies: "\u21D2",
        in: "\u2208",
        incare: "\u2105",
        infin: "\u221E",
        infintie: "\u29DD",
        inodot: "\u0131",
        Int: "\u222C",
        int: "\u222B",
        intcal: "\u22BA",
        integers: "\u2124",
        Integral: "\u222B",
        intercal: "\u22BA",
        Intersection: "\u22C2",
        intlarhk: "\u2A17",
        intprod: "\u2A3C",
        InvisibleComma: "\u2063",
        InvisibleTimes: "\u2062",
        IOcy: "\u0401",
        iocy: "\u0451",
        Iogon: "\u012E",
        iogon: "\u012F",
        Iopf: "\u{1D540}",
        iopf: "\u{1D55A}",
        Iota: "\u0399",
        iota: "\u03B9",
        iprod: "\u2A3C",
        iquest: "\xBF",
        Iscr: "\u2110",
        iscr: "\u{1D4BE}",
        isin: "\u2208",
        isindot: "\u22F5",
        isinE: "\u22F9",
        isins: "\u22F4",
        isinsv: "\u22F3",
        isinv: "\u2208",
        it: "\u2062",
        Itilde: "\u0128",
        itilde: "\u0129",
        Iukcy: "\u0406",
        iukcy: "\u0456",
        Iuml: "\xCF",
        iuml: "\xEF",
        Jcirc: "\u0134",
        jcirc: "\u0135",
        Jcy: "\u0419",
        jcy: "\u0439",
        Jfr: "\u{1D50D}",
        jfr: "\u{1D527}",
        jmath: "\u0237",
        Jopf: "\u{1D541}",
        jopf: "\u{1D55B}",
        Jscr: "\u{1D4A5}",
        jscr: "\u{1D4BF}",
        Jsercy: "\u0408",
        jsercy: "\u0458",
        Jukcy: "\u0404",
        jukcy: "\u0454",
        Kappa: "\u039A",
        kappa: "\u03BA",
        kappav: "\u03F0",
        Kcedil: "\u0136",
        kcedil: "\u0137",
        Kcy: "\u041A",
        kcy: "\u043A",
        Kfr: "\u{1D50E}",
        kfr: "\u{1D528}",
        kgreen: "\u0138",
        KHcy: "\u0425",
        khcy: "\u0445",
        KJcy: "\u040C",
        kjcy: "\u045C",
        Kopf: "\u{1D542}",
        kopf: "\u{1D55C}",
        Kscr: "\u{1D4A6}",
        kscr: "\u{1D4C0}",
        lAarr: "\u21DA",
        Lacute: "\u0139",
        lacute: "\u013A",
        laemptyv: "\u29B4",
        lagran: "\u2112",
        Lambda: "\u039B",
        lambda: "\u03BB",
        Lang: "\u27EA",
        lang: "\u27E8",
        langd: "\u2991",
        langle: "\u27E8",
        lap: "\u2A85",
        Laplacetrf: "\u2112",
        laquo: "\xAB",
        Larr: "\u219E",
        lArr: "\u21D0",
        larr: "\u2190",
        larrb: "\u21E4",
        larrbfs: "\u291F",
        larrfs: "\u291D",
        larrhk: "\u21A9",
        larrlp: "\u21AB",
        larrpl: "\u2939",
        larrsim: "\u2973",
        larrtl: "\u21A2",
        lat: "\u2AAB",
        lAtail: "\u291B",
        latail: "\u2919",
        late: "\u2AAD",
        lates: "\u2AAD\uFE00",
        lBarr: "\u290E",
        lbarr: "\u290C",
        lbbrk: "\u2772",
        lbrace: "{",
        lbrack: "[",
        lbrke: "\u298B",
        lbrksld: "\u298F",
        lbrkslu: "\u298D",
        Lcaron: "\u013D",
        lcaron: "\u013E",
        Lcedil: "\u013B",
        lcedil: "\u013C",
        lceil: "\u2308",
        lcub: "{",
        Lcy: "\u041B",
        lcy: "\u043B",
        ldca: "\u2936",
        ldquo: "\u201C",
        ldquor: "\u201E",
        ldrdhar: "\u2967",
        ldrushar: "\u294B",
        ldsh: "\u21B2",
        lE: "\u2266",
        le: "\u2264",
        LeftAngleBracket: "\u27E8",
        LeftArrow: "\u2190",
        Leftarrow: "\u21D0",
        leftarrow: "\u2190",
        LeftArrowBar: "\u21E4",
        LeftArrowRightArrow: "\u21C6",
        leftarrowtail: "\u21A2",
        LeftCeiling: "\u2308",
        LeftDoubleBracket: "\u27E6",
        LeftDownTeeVector: "\u2961",
        LeftDownVector: "\u21C3",
        LeftDownVectorBar: "\u2959",
        LeftFloor: "\u230A",
        leftharpoondown: "\u21BD",
        leftharpoonup: "\u21BC",
        leftleftarrows: "\u21C7",
        LeftRightArrow: "\u2194",
        Leftrightarrow: "\u21D4",
        leftrightarrow: "\u2194",
        leftrightarrows: "\u21C6",
        leftrightharpoons: "\u21CB",
        leftrightsquigarrow: "\u21AD",
        LeftRightVector: "\u294E",
        LeftTee: "\u22A3",
        LeftTeeArrow: "\u21A4",
        LeftTeeVector: "\u295A",
        leftthreetimes: "\u22CB",
        LeftTriangle: "\u22B2",
        LeftTriangleBar: "\u29CF",
        LeftTriangleEqual: "\u22B4",
        LeftUpDownVector: "\u2951",
        LeftUpTeeVector: "\u2960",
        LeftUpVector: "\u21BF",
        LeftUpVectorBar: "\u2958",
        LeftVector: "\u21BC",
        LeftVectorBar: "\u2952",
        lEg: "\u2A8B",
        leg: "\u22DA",
        leq: "\u2264",
        leqq: "\u2266",
        leqslant: "\u2A7D",
        les: "\u2A7D",
        lescc: "\u2AA8",
        lesdot: "\u2A7F",
        lesdoto: "\u2A81",
        lesdotor: "\u2A83",
        lesg: "\u22DA\uFE00",
        lesges: "\u2A93",
        lessapprox: "\u2A85",
        lessdot: "\u22D6",
        lesseqgtr: "\u22DA",
        lesseqqgtr: "\u2A8B",
        LessEqualGreater: "\u22DA",
        LessFullEqual: "\u2266",
        LessGreater: "\u2276",
        lessgtr: "\u2276",
        LessLess: "\u2AA1",
        lesssim: "\u2272",
        LessSlantEqual: "\u2A7D",
        LessTilde: "\u2272",
        lfisht: "\u297C",
        lfloor: "\u230A",
        Lfr: "\u{1D50F}",
        lfr: "\u{1D529}",
        lg: "\u2276",
        lgE: "\u2A91",
        lHar: "\u2962",
        lhard: "\u21BD",
        lharu: "\u21BC",
        lharul: "\u296A",
        lhblk: "\u2584",
        LJcy: "\u0409",
        ljcy: "\u0459",
        Ll: "\u22D8",
        ll: "\u226A",
        llarr: "\u21C7",
        llcorner: "\u231E",
        Lleftarrow: "\u21DA",
        llhard: "\u296B",
        lltri: "\u25FA",
        Lmidot: "\u013F",
        lmidot: "\u0140",
        lmoust: "\u23B0",
        lmoustache: "\u23B0",
        lnap: "\u2A89",
        lnapprox: "\u2A89",
        lnE: "\u2268",
        lne: "\u2A87",
        lneq: "\u2A87",
        lneqq: "\u2268",
        lnsim: "\u22E6",
        loang: "\u27EC",
        loarr: "\u21FD",
        lobrk: "\u27E6",
        LongLeftArrow: "\u27F5",
        Longleftarrow: "\u27F8",
        longleftarrow: "\u27F5",
        LongLeftRightArrow: "\u27F7",
        Longleftrightarrow: "\u27FA",
        longleftrightarrow: "\u27F7",
        longmapsto: "\u27FC",
        LongRightArrow: "\u27F6",
        Longrightarrow: "\u27F9",
        longrightarrow: "\u27F6",
        looparrowleft: "\u21AB",
        looparrowright: "\u21AC",
        lopar: "\u2985",
        Lopf: "\u{1D543}",
        lopf: "\u{1D55D}",
        loplus: "\u2A2D",
        lotimes: "\u2A34",
        lowast: "\u2217",
        lowbar: "_",
        LowerLeftArrow: "\u2199",
        LowerRightArrow: "\u2198",
        loz: "\u25CA",
        lozenge: "\u25CA",
        lozf: "\u29EB",
        lpar: "(",
        lparlt: "\u2993",
        lrarr: "\u21C6",
        lrcorner: "\u231F",
        lrhar: "\u21CB",
        lrhard: "\u296D",
        lrm: "\u200E",
        lrtri: "\u22BF",
        lsaquo: "\u2039",
        Lscr: "\u2112",
        lscr: "\u{1D4C1}",
        Lsh: "\u21B0",
        lsh: "\u21B0",
        lsim: "\u2272",
        lsime: "\u2A8D",
        lsimg: "\u2A8F",
        lsqb: "[",
        lsquo: "\u2018",
        lsquor: "\u201A",
        Lstrok: "\u0141",
        lstrok: "\u0142",
        Lt: "\u226A",
        LT: "<",
        lt: "<",
        ltcc: "\u2AA6",
        ltcir: "\u2A79",
        ltdot: "\u22D6",
        lthree: "\u22CB",
        ltimes: "\u22C9",
        ltlarr: "\u2976",
        ltquest: "\u2A7B",
        ltri: "\u25C3",
        ltrie: "\u22B4",
        ltrif: "\u25C2",
        ltrPar: "\u2996",
        lurdshar: "\u294A",
        luruhar: "\u2966",
        lvertneqq: "\u2268\uFE00",
        lvnE: "\u2268\uFE00",
        macr: "\xAF",
        male: "\u2642",
        malt: "\u2720",
        maltese: "\u2720",
        Map: "\u2905",
        map: "\u21A6",
        mapsto: "\u21A6",
        mapstodown: "\u21A7",
        mapstoleft: "\u21A4",
        mapstoup: "\u21A5",
        marker: "\u25AE",
        mcomma: "\u2A29",
        Mcy: "\u041C",
        mcy: "\u043C",
        mdash: "\u2014",
        mDDot: "\u223A",
        measuredangle: "\u2221",
        MediumSpace: "\u205F",
        Mellintrf: "\u2133",
        Mfr: "\u{1D510}",
        mfr: "\u{1D52A}",
        mho: "\u2127",
        micro: "\xB5",
        mid: "\u2223",
        midast: "*",
        midcir: "\u2AF0",
        middot: "\xB7",
        minus: "\u2212",
        minusb: "\u229F",
        minusd: "\u2238",
        minusdu: "\u2A2A",
        MinusPlus: "\u2213",
        mlcp: "\u2ADB",
        mldr: "\u2026",
        mnplus: "\u2213",
        models: "\u22A7",
        Mopf: "\u{1D544}",
        mopf: "\u{1D55E}",
        mp: "\u2213",
        Mscr: "\u2133",
        mscr: "\u{1D4C2}",
        mstpos: "\u223E",
        Mu: "\u039C",
        mu: "\u03BC",
        multimap: "\u22B8",
        mumap: "\u22B8",
        nabla: "\u2207",
        Nacute: "\u0143",
        nacute: "\u0144",
        nang: "\u2220\u20D2",
        nap: "\u2249",
        napE: "\u2A70\u0338",
        napid: "\u224B\u0338",
        napos: "\u0149",
        napprox: "\u2249",
        natur: "\u266E",
        natural: "\u266E",
        naturals: "\u2115",
        nbsp: "\xA0",
        nbump: "\u224E\u0338",
        nbumpe: "\u224F\u0338",
        ncap: "\u2A43",
        Ncaron: "\u0147",
        ncaron: "\u0148",
        Ncedil: "\u0145",
        ncedil: "\u0146",
        ncong: "\u2247",
        ncongdot: "\u2A6D\u0338",
        ncup: "\u2A42",
        Ncy: "\u041D",
        ncy: "\u043D",
        ndash: "\u2013",
        ne: "\u2260",
        nearhk: "\u2924",
        neArr: "\u21D7",
        nearr: "\u2197",
        nearrow: "\u2197",
        nedot: "\u2250\u0338",
        NegativeMediumSpace: "\u200B",
        NegativeThickSpace: "\u200B",
        NegativeThinSpace: "\u200B",
        NegativeVeryThinSpace: "\u200B",
        nequiv: "\u2262",
        nesear: "\u2928",
        nesim: "\u2242\u0338",
        NestedGreaterGreater: "\u226B",
        NestedLessLess: "\u226A",
        NewLine: "\n",
        nexist: "\u2204",
        nexists: "\u2204",
        Nfr: "\u{1D511}",
        nfr: "\u{1D52B}",
        ngE: "\u2267\u0338",
        nge: "\u2271",
        ngeq: "\u2271",
        ngeqq: "\u2267\u0338",
        ngeqslant: "\u2A7E\u0338",
        nges: "\u2A7E\u0338",
        nGg: "\u22D9\u0338",
        ngsim: "\u2275",
        nGt: "\u226B\u20D2",
        ngt: "\u226F",
        ngtr: "\u226F",
        nGtv: "\u226B\u0338",
        nhArr: "\u21CE",
        nharr: "\u21AE",
        nhpar: "\u2AF2",
        ni: "\u220B",
        nis: "\u22FC",
        nisd: "\u22FA",
        niv: "\u220B",
        NJcy: "\u040A",
        njcy: "\u045A",
        nlArr: "\u21CD",
        nlarr: "\u219A",
        nldr: "\u2025",
        nlE: "\u2266\u0338",
        nle: "\u2270",
        nLeftarrow: "\u21CD",
        nleftarrow: "\u219A",
        nLeftrightarrow: "\u21CE",
        nleftrightarrow: "\u21AE",
        nleq: "\u2270",
        nleqq: "\u2266\u0338",
        nleqslant: "\u2A7D\u0338",
        nles: "\u2A7D\u0338",
        nless: "\u226E",
        nLl: "\u22D8\u0338",
        nlsim: "\u2274",
        nLt: "\u226A\u20D2",
        nlt: "\u226E",
        nltri: "\u22EA",
        nltrie: "\u22EC",
        nLtv: "\u226A\u0338",
        nmid: "\u2224",
        NoBreak: "\u2060",
        NonBreakingSpace: "\xA0",
        Nopf: "\u2115",
        nopf: "\u{1D55F}",
        Not: "\u2AEC",
        not: "\xAC",
        NotCongruent: "\u2262",
        NotCupCap: "\u226D",
        NotDoubleVerticalBar: "\u2226",
        NotElement: "\u2209",
        NotEqual: "\u2260",
        NotEqualTilde: "\u2242\u0338",
        NotExists: "\u2204",
        NotGreater: "\u226F",
        NotGreaterEqual: "\u2271",
        NotGreaterFullEqual: "\u2267\u0338",
        NotGreaterGreater: "\u226B\u0338",
        NotGreaterLess: "\u2279",
        NotGreaterSlantEqual: "\u2A7E\u0338",
        NotGreaterTilde: "\u2275",
        NotHumpDownHump: "\u224E\u0338",
        NotHumpEqual: "\u224F\u0338",
        notin: "\u2209",
        notindot: "\u22F5\u0338",
        notinE: "\u22F9\u0338",
        notinva: "\u2209",
        notinvb: "\u22F7",
        notinvc: "\u22F6",
        NotLeftTriangle: "\u22EA",
        NotLeftTriangleBar: "\u29CF\u0338",
        NotLeftTriangleEqual: "\u22EC",
        NotLess: "\u226E",
        NotLessEqual: "\u2270",
        NotLessGreater: "\u2278",
        NotLessLess: "\u226A\u0338",
        NotLessSlantEqual: "\u2A7D\u0338",
        NotLessTilde: "\u2274",
        NotNestedGreaterGreater: "\u2AA2\u0338",
        NotNestedLessLess: "\u2AA1\u0338",
        notni: "\u220C",
        notniva: "\u220C",
        notnivb: "\u22FE",
        notnivc: "\u22FD",
        NotPrecedes: "\u2280",
        NotPrecedesEqual: "\u2AAF\u0338",
        NotPrecedesSlantEqual: "\u22E0",
        NotReverseElement: "\u220C",
        NotRightTriangle: "\u22EB",
        NotRightTriangleBar: "\u29D0\u0338",
        NotRightTriangleEqual: "\u22ED",
        NotSquareSubset: "\u228F\u0338",
        NotSquareSubsetEqual: "\u22E2",
        NotSquareSuperset: "\u2290\u0338",
        NotSquareSupersetEqual: "\u22E3",
        NotSubset: "\u2282\u20D2",
        NotSubsetEqual: "\u2288",
        NotSucceeds: "\u2281",
        NotSucceedsEqual: "\u2AB0\u0338",
        NotSucceedsSlantEqual: "\u22E1",
        NotSucceedsTilde: "\u227F\u0338",
        NotSuperset: "\u2283\u20D2",
        NotSupersetEqual: "\u2289",
        NotTilde: "\u2241",
        NotTildeEqual: "\u2244",
        NotTildeFullEqual: "\u2247",
        NotTildeTilde: "\u2249",
        NotVerticalBar: "\u2224",
        npar: "\u2226",
        nparallel: "\u2226",
        nparsl: "\u2AFD\u20E5",
        npart: "\u2202\u0338",
        npolint: "\u2A14",
        npr: "\u2280",
        nprcue: "\u22E0",
        npre: "\u2AAF\u0338",
        nprec: "\u2280",
        npreceq: "\u2AAF\u0338",
        nrArr: "\u21CF",
        nrarr: "\u219B",
        nrarrc: "\u2933\u0338",
        nrarrw: "\u219D\u0338",
        nRightarrow: "\u21CF",
        nrightarrow: "\u219B",
        nrtri: "\u22EB",
        nrtrie: "\u22ED",
        nsc: "\u2281",
        nsccue: "\u22E1",
        nsce: "\u2AB0\u0338",
        Nscr: "\u{1D4A9}",
        nscr: "\u{1D4C3}",
        nshortmid: "\u2224",
        nshortparallel: "\u2226",
        nsim: "\u2241",
        nsime: "\u2244",
        nsimeq: "\u2244",
        nsmid: "\u2224",
        nspar: "\u2226",
        nsqsube: "\u22E2",
        nsqsupe: "\u22E3",
        nsub: "\u2284",
        nsubE: "\u2AC5\u0338",
        nsube: "\u2288",
        nsubset: "\u2282\u20D2",
        nsubseteq: "\u2288",
        nsubseteqq: "\u2AC5\u0338",
        nsucc: "\u2281",
        nsucceq: "\u2AB0\u0338",
        nsup: "\u2285",
        nsupE: "\u2AC6\u0338",
        nsupe: "\u2289",
        nsupset: "\u2283\u20D2",
        nsupseteq: "\u2289",
        nsupseteqq: "\u2AC6\u0338",
        ntgl: "\u2279",
        Ntilde: "\xD1",
        ntilde: "\xF1",
        ntlg: "\u2278",
        ntriangleleft: "\u22EA",
        ntrianglelefteq: "\u22EC",
        ntriangleright: "\u22EB",
        ntrianglerighteq: "\u22ED",
        Nu: "\u039D",
        nu: "\u03BD",
        num: "#",
        numero: "\u2116",
        numsp: "\u2007",
        nvap: "\u224D\u20D2",
        nVDash: "\u22AF",
        nVdash: "\u22AE",
        nvDash: "\u22AD",
        nvdash: "\u22AC",
        nvge: "\u2265\u20D2",
        nvgt: ">\u20D2",
        nvHarr: "\u2904",
        nvinfin: "\u29DE",
        nvlArr: "\u2902",
        nvle: "\u2264\u20D2",
        nvlt: "<\u20D2",
        nvltrie: "\u22B4\u20D2",
        nvrArr: "\u2903",
        nvrtrie: "\u22B5\u20D2",
        nvsim: "\u223C\u20D2",
        nwarhk: "\u2923",
        nwArr: "\u21D6",
        nwarr: "\u2196",
        nwarrow: "\u2196",
        nwnear: "\u2927",
        Oacute: "\xD3",
        oacute: "\xF3",
        oast: "\u229B",
        ocir: "\u229A",
        Ocirc: "\xD4",
        ocirc: "\xF4",
        Ocy: "\u041E",
        ocy: "\u043E",
        odash: "\u229D",
        Odblac: "\u0150",
        odblac: "\u0151",
        odiv: "\u2A38",
        odot: "\u2299",
        odsold: "\u29BC",
        OElig: "\u0152",
        oelig: "\u0153",
        ofcir: "\u29BF",
        Ofr: "\u{1D512}",
        ofr: "\u{1D52C}",
        ogon: "\u02DB",
        Ograve: "\xD2",
        ograve: "\xF2",
        ogt: "\u29C1",
        ohbar: "\u29B5",
        ohm: "\u03A9",
        oint: "\u222E",
        olarr: "\u21BA",
        olcir: "\u29BE",
        olcross: "\u29BB",
        oline: "\u203E",
        olt: "\u29C0",
        Omacr: "\u014C",
        omacr: "\u014D",
        Omega: "\u03A9",
        omega: "\u03C9",
        Omicron: "\u039F",
        omicron: "\u03BF",
        omid: "\u29B6",
        ominus: "\u2296",
        Oopf: "\u{1D546}",
        oopf: "\u{1D560}",
        opar: "\u29B7",
        OpenCurlyDoubleQuote: "\u201C",
        OpenCurlyQuote: "\u2018",
        operp: "\u29B9",
        oplus: "\u2295",
        Or: "\u2A54",
        or: "\u2228",
        orarr: "\u21BB",
        ord: "\u2A5D",
        order: "\u2134",
        orderof: "\u2134",
        ordf: "\xAA",
        ordm: "\xBA",
        origof: "\u22B6",
        oror: "\u2A56",
        orslope: "\u2A57",
        orv: "\u2A5B",
        oS: "\u24C8",
        Oscr: "\u{1D4AA}",
        oscr: "\u2134",
        Oslash: "\xD8",
        oslash: "\xF8",
        osol: "\u2298",
        Otilde: "\xD5",
        otilde: "\xF5",
        Otimes: "\u2A37",
        otimes: "\u2297",
        otimesas: "\u2A36",
        Ouml: "\xD6",
        ouml: "\xF6",
        ovbar: "\u233D",
        OverBar: "\u203E",
        OverBrace: "\u23DE",
        OverBracket: "\u23B4",
        OverParenthesis: "\u23DC",
        par: "\u2225",
        para: "\xB6",
        parallel: "\u2225",
        parsim: "\u2AF3",
        parsl: "\u2AFD",
        part: "\u2202",
        PartialD: "\u2202",
        Pcy: "\u041F",
        pcy: "\u043F",
        percnt: "%",
        period: ".",
        permil: "\u2030",
        perp: "\u22A5",
        pertenk: "\u2031",
        Pfr: "\u{1D513}",
        pfr: "\u{1D52D}",
        Phi: "\u03A6",
        phi: "\u03C6",
        phiv: "\u03D5",
        phmmat: "\u2133",
        phone: "\u260E",
        Pi: "\u03A0",
        pi: "\u03C0",
        pitchfork: "\u22D4",
        piv: "\u03D6",
        planck: "\u210F",
        planckh: "\u210E",
        plankv: "\u210F",
        plus: "+",
        plusacir: "\u2A23",
        plusb: "\u229E",
        pluscir: "\u2A22",
        plusdo: "\u2214",
        plusdu: "\u2A25",
        pluse: "\u2A72",
        PlusMinus: "\xB1",
        plusmn: "\xB1",
        plussim: "\u2A26",
        plustwo: "\u2A27",
        pm: "\xB1",
        Poincareplane: "\u210C",
        pointint: "\u2A15",
        Popf: "\u2119",
        popf: "\u{1D561}",
        pound: "\xA3",
        Pr: "\u2ABB",
        pr: "\u227A",
        prap: "\u2AB7",
        prcue: "\u227C",
        prE: "\u2AB3",
        pre: "\u2AAF",
        prec: "\u227A",
        precapprox: "\u2AB7",
        preccurlyeq: "\u227C",
        Precedes: "\u227A",
        PrecedesEqual: "\u2AAF",
        PrecedesSlantEqual: "\u227C",
        PrecedesTilde: "\u227E",
        preceq: "\u2AAF",
        precnapprox: "\u2AB9",
        precneqq: "\u2AB5",
        precnsim: "\u22E8",
        precsim: "\u227E",
        Prime: "\u2033",
        prime: "\u2032",
        primes: "\u2119",
        prnap: "\u2AB9",
        prnE: "\u2AB5",
        prnsim: "\u22E8",
        prod: "\u220F",
        Product: "\u220F",
        profalar: "\u232E",
        profline: "\u2312",
        profsurf: "\u2313",
        prop: "\u221D",
        Proportion: "\u2237",
        Proportional: "\u221D",
        propto: "\u221D",
        prsim: "\u227E",
        prurel: "\u22B0",
        Pscr: "\u{1D4AB}",
        pscr: "\u{1D4C5}",
        Psi: "\u03A8",
        psi: "\u03C8",
        puncsp: "\u2008",
        Qfr: "\u{1D514}",
        qfr: "\u{1D52E}",
        qint: "\u2A0C",
        Qopf: "\u211A",
        qopf: "\u{1D562}",
        qprime: "\u2057",
        Qscr: "\u{1D4AC}",
        qscr: "\u{1D4C6}",
        quaternions: "\u210D",
        quatint: "\u2A16",
        quest: "?",
        questeq: "\u225F",
        QUOT: '"',
        quot: '"',
        rAarr: "\u21DB",
        race: "\u223D\u0331",
        Racute: "\u0154",
        racute: "\u0155",
        radic: "\u221A",
        raemptyv: "\u29B3",
        Rang: "\u27EB",
        rang: "\u27E9",
        rangd: "\u2992",
        range: "\u29A5",
        rangle: "\u27E9",
        raquo: "\xBB",
        Rarr: "\u21A0",
        rArr: "\u21D2",
        rarr: "\u2192",
        rarrap: "\u2975",
        rarrb: "\u21E5",
        rarrbfs: "\u2920",
        rarrc: "\u2933",
        rarrfs: "\u291E",
        rarrhk: "\u21AA",
        rarrlp: "\u21AC",
        rarrpl: "\u2945",
        rarrsim: "\u2974",
        Rarrtl: "\u2916",
        rarrtl: "\u21A3",
        rarrw: "\u219D",
        rAtail: "\u291C",
        ratail: "\u291A",
        ratio: "\u2236",
        rationals: "\u211A",
        RBarr: "\u2910",
        rBarr: "\u290F",
        rbarr: "\u290D",
        rbbrk: "\u2773",
        rbrace: "}",
        rbrack: "]",
        rbrke: "\u298C",
        rbrksld: "\u298E",
        rbrkslu: "\u2990",
        Rcaron: "\u0158",
        rcaron: "\u0159",
        Rcedil: "\u0156",
        rcedil: "\u0157",
        rceil: "\u2309",
        rcub: "}",
        Rcy: "\u0420",
        rcy: "\u0440",
        rdca: "\u2937",
        rdldhar: "\u2969",
        rdquo: "\u201D",
        rdquor: "\u201D",
        rdsh: "\u21B3",
        Re: "\u211C",
        real: "\u211C",
        realine: "\u211B",
        realpart: "\u211C",
        reals: "\u211D",
        rect: "\u25AD",
        REG: "\xAE",
        reg: "\xAE",
        ReverseElement: "\u220B",
        ReverseEquilibrium: "\u21CB",
        ReverseUpEquilibrium: "\u296F",
        rfisht: "\u297D",
        rfloor: "\u230B",
        Rfr: "\u211C",
        rfr: "\u{1D52F}",
        rHar: "\u2964",
        rhard: "\u21C1",
        rharu: "\u21C0",
        rharul: "\u296C",
        Rho: "\u03A1",
        rho: "\u03C1",
        rhov: "\u03F1",
        RightAngleBracket: "\u27E9",
        RightArrow: "\u2192",
        Rightarrow: "\u21D2",
        rightarrow: "\u2192",
        RightArrowBar: "\u21E5",
        RightArrowLeftArrow: "\u21C4",
        rightarrowtail: "\u21A3",
        RightCeiling: "\u2309",
        RightDoubleBracket: "\u27E7",
        RightDownTeeVector: "\u295D",
        RightDownVector: "\u21C2",
        RightDownVectorBar: "\u2955",
        RightFloor: "\u230B",
        rightharpoondown: "\u21C1",
        rightharpoonup: "\u21C0",
        rightleftarrows: "\u21C4",
        rightleftharpoons: "\u21CC",
        rightrightarrows: "\u21C9",
        rightsquigarrow: "\u219D",
        RightTee: "\u22A2",
        RightTeeArrow: "\u21A6",
        RightTeeVector: "\u295B",
        rightthreetimes: "\u22CC",
        RightTriangle: "\u22B3",
        RightTriangleBar: "\u29D0",
        RightTriangleEqual: "\u22B5",
        RightUpDownVector: "\u294F",
        RightUpTeeVector: "\u295C",
        RightUpVector: "\u21BE",
        RightUpVectorBar: "\u2954",
        RightVector: "\u21C0",
        RightVectorBar: "\u2953",
        ring: "\u02DA",
        risingdotseq: "\u2253",
        rlarr: "\u21C4",
        rlhar: "\u21CC",
        rlm: "\u200F",
        rmoust: "\u23B1",
        rmoustache: "\u23B1",
        rnmid: "\u2AEE",
        roang: "\u27ED",
        roarr: "\u21FE",
        robrk: "\u27E7",
        ropar: "\u2986",
        Ropf: "\u211D",
        ropf: "\u{1D563}",
        roplus: "\u2A2E",
        rotimes: "\u2A35",
        RoundImplies: "\u2970",
        rpar: ")",
        rpargt: "\u2994",
        rppolint: "\u2A12",
        rrarr: "\u21C9",
        Rrightarrow: "\u21DB",
        rsaquo: "\u203A",
        Rscr: "\u211B",
        rscr: "\u{1D4C7}",
        Rsh: "\u21B1",
        rsh: "\u21B1",
        rsqb: "]",
        rsquo: "\u2019",
        rsquor: "\u2019",
        rthree: "\u22CC",
        rtimes: "\u22CA",
        rtri: "\u25B9",
        rtrie: "\u22B5",
        rtrif: "\u25B8",
        rtriltri: "\u29CE",
        RuleDelayed: "\u29F4",
        ruluhar: "\u2968",
        rx: "\u211E",
        Sacute: "\u015A",
        sacute: "\u015B",
        sbquo: "\u201A",
        Sc: "\u2ABC",
        sc: "\u227B",
        scap: "\u2AB8",
        Scaron: "\u0160",
        scaron: "\u0161",
        sccue: "\u227D",
        scE: "\u2AB4",
        sce: "\u2AB0",
        Scedil: "\u015E",
        scedil: "\u015F",
        Scirc: "\u015C",
        scirc: "\u015D",
        scnap: "\u2ABA",
        scnE: "\u2AB6",
        scnsim: "\u22E9",
        scpolint: "\u2A13",
        scsim: "\u227F",
        Scy: "\u0421",
        scy: "\u0441",
        sdot: "\u22C5",
        sdotb: "\u22A1",
        sdote: "\u2A66",
        searhk: "\u2925",
        seArr: "\u21D8",
        searr: "\u2198",
        searrow: "\u2198",
        sect: "\xA7",
        semi: ";",
        seswar: "\u2929",
        setminus: "\u2216",
        setmn: "\u2216",
        sext: "\u2736",
        Sfr: "\u{1D516}",
        sfr: "\u{1D530}",
        sfrown: "\u2322",
        sharp: "\u266F",
        SHCHcy: "\u0429",
        shchcy: "\u0449",
        SHcy: "\u0428",
        shcy: "\u0448",
        ShortDownArrow: "\u2193",
        ShortLeftArrow: "\u2190",
        shortmid: "\u2223",
        shortparallel: "\u2225",
        ShortRightArrow: "\u2192",
        ShortUpArrow: "\u2191",
        shy: "\xAD",
        Sigma: "\u03A3",
        sigma: "\u03C3",
        sigmaf: "\u03C2",
        sigmav: "\u03C2",
        sim: "\u223C",
        simdot: "\u2A6A",
        sime: "\u2243",
        simeq: "\u2243",
        simg: "\u2A9E",
        simgE: "\u2AA0",
        siml: "\u2A9D",
        simlE: "\u2A9F",
        simne: "\u2246",
        simplus: "\u2A24",
        simrarr: "\u2972",
        slarr: "\u2190",
        SmallCircle: "\u2218",
        smallsetminus: "\u2216",
        smashp: "\u2A33",
        smeparsl: "\u29E4",
        smid: "\u2223",
        smile: "\u2323",
        smt: "\u2AAA",
        smte: "\u2AAC",
        smtes: "\u2AAC\uFE00",
        SOFTcy: "\u042C",
        softcy: "\u044C",
        sol: "/",
        solb: "\u29C4",
        solbar: "\u233F",
        Sopf: "\u{1D54A}",
        sopf: "\u{1D564}",
        spades: "\u2660",
        spadesuit: "\u2660",
        spar: "\u2225",
        sqcap: "\u2293",
        sqcaps: "\u2293\uFE00",
        sqcup: "\u2294",
        sqcups: "\u2294\uFE00",
        Sqrt: "\u221A",
        sqsub: "\u228F",
        sqsube: "\u2291",
        sqsubset: "\u228F",
        sqsubseteq: "\u2291",
        sqsup: "\u2290",
        sqsupe: "\u2292",
        sqsupset: "\u2290",
        sqsupseteq: "\u2292",
        squ: "\u25A1",
        Square: "\u25A1",
        square: "\u25A1",
        SquareIntersection: "\u2293",
        SquareSubset: "\u228F",
        SquareSubsetEqual: "\u2291",
        SquareSuperset: "\u2290",
        SquareSupersetEqual: "\u2292",
        SquareUnion: "\u2294",
        squarf: "\u25AA",
        squf: "\u25AA",
        srarr: "\u2192",
        Sscr: "\u{1D4AE}",
        sscr: "\u{1D4C8}",
        ssetmn: "\u2216",
        ssmile: "\u2323",
        sstarf: "\u22C6",
        Star: "\u22C6",
        star: "\u2606",
        starf: "\u2605",
        straightepsilon: "\u03F5",
        straightphi: "\u03D5",
        strns: "\xAF",
        Sub: "\u22D0",
        sub: "\u2282",
        subdot: "\u2ABD",
        subE: "\u2AC5",
        sube: "\u2286",
        subedot: "\u2AC3",
        submult: "\u2AC1",
        subnE: "\u2ACB",
        subne: "\u228A",
        subplus: "\u2ABF",
        subrarr: "\u2979",
        Subset: "\u22D0",
        subset: "\u2282",
        subseteq: "\u2286",
        subseteqq: "\u2AC5",
        SubsetEqual: "\u2286",
        subsetneq: "\u228A",
        subsetneqq: "\u2ACB",
        subsim: "\u2AC7",
        subsub: "\u2AD5",
        subsup: "\u2AD3",
        succ: "\u227B",
        succapprox: "\u2AB8",
        succcurlyeq: "\u227D",
        Succeeds: "\u227B",
        SucceedsEqual: "\u2AB0",
        SucceedsSlantEqual: "\u227D",
        SucceedsTilde: "\u227F",
        succeq: "\u2AB0",
        succnapprox: "\u2ABA",
        succneqq: "\u2AB6",
        succnsim: "\u22E9",
        succsim: "\u227F",
        SuchThat: "\u220B",
        Sum: "\u2211",
        sum: "\u2211",
        sung: "\u266A",
        Sup: "\u22D1",
        sup: "\u2283",
        sup1: "\xB9",
        sup2: "\xB2",
        sup3: "\xB3",
        supdot: "\u2ABE",
        supdsub: "\u2AD8",
        supE: "\u2AC6",
        supe: "\u2287",
        supedot: "\u2AC4",
        Superset: "\u2283",
        SupersetEqual: "\u2287",
        suphsol: "\u27C9",
        suphsub: "\u2AD7",
        suplarr: "\u297B",
        supmult: "\u2AC2",
        supnE: "\u2ACC",
        supne: "\u228B",
        supplus: "\u2AC0",
        Supset: "\u22D1",
        supset: "\u2283",
        supseteq: "\u2287",
        supseteqq: "\u2AC6",
        supsetneq: "\u228B",
        supsetneqq: "\u2ACC",
        supsim: "\u2AC8",
        supsub: "\u2AD4",
        supsup: "\u2AD6",
        swarhk: "\u2926",
        swArr: "\u21D9",
        swarr: "\u2199",
        swarrow: "\u2199",
        swnwar: "\u292A",
        szlig: "\xDF",
        Tab: "	",
        target: "\u2316",
        Tau: "\u03A4",
        tau: "\u03C4",
        tbrk: "\u23B4",
        Tcaron: "\u0164",
        tcaron: "\u0165",
        Tcedil: "\u0162",
        tcedil: "\u0163",
        Tcy: "\u0422",
        tcy: "\u0442",
        tdot: "\u20DB",
        telrec: "\u2315",
        Tfr: "\u{1D517}",
        tfr: "\u{1D531}",
        there4: "\u2234",
        Therefore: "\u2234",
        therefore: "\u2234",
        Theta: "\u0398",
        theta: "\u03B8",
        thetasym: "\u03D1",
        thetav: "\u03D1",
        thickapprox: "\u2248",
        thicksim: "\u223C",
        ThickSpace: "\u205F\u200A",
        thinsp: "\u2009",
        ThinSpace: "\u2009",
        thkap: "\u2248",
        thksim: "\u223C",
        THORN: "\xDE",
        thorn: "\xFE",
        Tilde: "\u223C",
        tilde: "\u02DC",
        TildeEqual: "\u2243",
        TildeFullEqual: "\u2245",
        TildeTilde: "\u2248",
        times: "\xD7",
        timesb: "\u22A0",
        timesbar: "\u2A31",
        timesd: "\u2A30",
        tint: "\u222D",
        toea: "\u2928",
        top: "\u22A4",
        topbot: "\u2336",
        topcir: "\u2AF1",
        Topf: "\u{1D54B}",
        topf: "\u{1D565}",
        topfork: "\u2ADA",
        tosa: "\u2929",
        tprime: "\u2034",
        TRADE: "\u2122",
        trade: "\u2122",
        triangle: "\u25B5",
        triangledown: "\u25BF",
        triangleleft: "\u25C3",
        trianglelefteq: "\u22B4",
        triangleq: "\u225C",
        triangleright: "\u25B9",
        trianglerighteq: "\u22B5",
        tridot: "\u25EC",
        trie: "\u225C",
        triminus: "\u2A3A",
        TripleDot: "\u20DB",
        triplus: "\u2A39",
        trisb: "\u29CD",
        tritime: "\u2A3B",
        trpezium: "\u23E2",
        Tscr: "\u{1D4AF}",
        tscr: "\u{1D4C9}",
        TScy: "\u0426",
        tscy: "\u0446",
        TSHcy: "\u040B",
        tshcy: "\u045B",
        Tstrok: "\u0166",
        tstrok: "\u0167",
        twixt: "\u226C",
        twoheadleftarrow: "\u219E",
        twoheadrightarrow: "\u21A0",
        Uacute: "\xDA",
        uacute: "\xFA",
        Uarr: "\u219F",
        uArr: "\u21D1",
        uarr: "\u2191",
        Uarrocir: "\u2949",
        Ubrcy: "\u040E",
        ubrcy: "\u045E",
        Ubreve: "\u016C",
        ubreve: "\u016D",
        Ucirc: "\xDB",
        ucirc: "\xFB",
        Ucy: "\u0423",
        ucy: "\u0443",
        udarr: "\u21C5",
        Udblac: "\u0170",
        udblac: "\u0171",
        udhar: "\u296E",
        ufisht: "\u297E",
        Ufr: "\u{1D518}",
        ufr: "\u{1D532}",
        Ugrave: "\xD9",
        ugrave: "\xF9",
        uHar: "\u2963",
        uharl: "\u21BF",
        uharr: "\u21BE",
        uhblk: "\u2580",
        ulcorn: "\u231C",
        ulcorner: "\u231C",
        ulcrop: "\u230F",
        ultri: "\u25F8",
        Umacr: "\u016A",
        umacr: "\u016B",
        uml: "\xA8",
        UnderBar: "_",
        UnderBrace: "\u23DF",
        UnderBracket: "\u23B5",
        UnderParenthesis: "\u23DD",
        Union: "\u22C3",
        UnionPlus: "\u228E",
        Uogon: "\u0172",
        uogon: "\u0173",
        Uopf: "\u{1D54C}",
        uopf: "\u{1D566}",
        UpArrow: "\u2191",
        Uparrow: "\u21D1",
        uparrow: "\u2191",
        UpArrowBar: "\u2912",
        UpArrowDownArrow: "\u21C5",
        UpDownArrow: "\u2195",
        Updownarrow: "\u21D5",
        updownarrow: "\u2195",
        UpEquilibrium: "\u296E",
        upharpoonleft: "\u21BF",
        upharpoonright: "\u21BE",
        uplus: "\u228E",
        UpperLeftArrow: "\u2196",
        UpperRightArrow: "\u2197",
        Upsi: "\u03D2",
        upsi: "\u03C5",
        upsih: "\u03D2",
        Upsilon: "\u03A5",
        upsilon: "\u03C5",
        UpTee: "\u22A5",
        UpTeeArrow: "\u21A5",
        upuparrows: "\u21C8",
        urcorn: "\u231D",
        urcorner: "\u231D",
        urcrop: "\u230E",
        Uring: "\u016E",
        uring: "\u016F",
        urtri: "\u25F9",
        Uscr: "\u{1D4B0}",
        uscr: "\u{1D4CA}",
        utdot: "\u22F0",
        Utilde: "\u0168",
        utilde: "\u0169",
        utri: "\u25B5",
        utrif: "\u25B4",
        uuarr: "\u21C8",
        Uuml: "\xDC",
        uuml: "\xFC",
        uwangle: "\u29A7",
        vangrt: "\u299C",
        varepsilon: "\u03F5",
        varkappa: "\u03F0",
        varnothing: "\u2205",
        varphi: "\u03D5",
        varpi: "\u03D6",
        varpropto: "\u221D",
        vArr: "\u21D5",
        varr: "\u2195",
        varrho: "\u03F1",
        varsigma: "\u03C2",
        varsubsetneq: "\u228A\uFE00",
        varsubsetneqq: "\u2ACB\uFE00",
        varsupsetneq: "\u228B\uFE00",
        varsupsetneqq: "\u2ACC\uFE00",
        vartheta: "\u03D1",
        vartriangleleft: "\u22B2",
        vartriangleright: "\u22B3",
        Vbar: "\u2AEB",
        vBar: "\u2AE8",
        vBarv: "\u2AE9",
        Vcy: "\u0412",
        vcy: "\u0432",
        VDash: "\u22AB",
        Vdash: "\u22A9",
        vDash: "\u22A8",
        vdash: "\u22A2",
        Vdashl: "\u2AE6",
        Vee: "\u22C1",
        vee: "\u2228",
        veebar: "\u22BB",
        veeeq: "\u225A",
        vellip: "\u22EE",
        Verbar: "\u2016",
        verbar: "|",
        Vert: "\u2016",
        vert: "|",
        VerticalBar: "\u2223",
        VerticalLine: "|",
        VerticalSeparator: "\u2758",
        VerticalTilde: "\u2240",
        VeryThinSpace: "\u200A",
        Vfr: "\u{1D519}",
        vfr: "\u{1D533}",
        vltri: "\u22B2",
        vnsub: "\u2282\u20D2",
        vnsup: "\u2283\u20D2",
        Vopf: "\u{1D54D}",
        vopf: "\u{1D567}",
        vprop: "\u221D",
        vrtri: "\u22B3",
        Vscr: "\u{1D4B1}",
        vscr: "\u{1D4CB}",
        vsubnE: "\u2ACB\uFE00",
        vsubne: "\u228A\uFE00",
        vsupnE: "\u2ACC\uFE00",
        vsupne: "\u228B\uFE00",
        Vvdash: "\u22AA",
        vzigzag: "\u299A",
        Wcirc: "\u0174",
        wcirc: "\u0175",
        wedbar: "\u2A5F",
        Wedge: "\u22C0",
        wedge: "\u2227",
        wedgeq: "\u2259",
        weierp: "\u2118",
        Wfr: "\u{1D51A}",
        wfr: "\u{1D534}",
        Wopf: "\u{1D54E}",
        wopf: "\u{1D568}",
        wp: "\u2118",
        wr: "\u2240",
        wreath: "\u2240",
        Wscr: "\u{1D4B2}",
        wscr: "\u{1D4CC}",
        xcap: "\u22C2",
        xcirc: "\u25EF",
        xcup: "\u22C3",
        xdtri: "\u25BD",
        Xfr: "\u{1D51B}",
        xfr: "\u{1D535}",
        xhArr: "\u27FA",
        xharr: "\u27F7",
        Xi: "\u039E",
        xi: "\u03BE",
        xlArr: "\u27F8",
        xlarr: "\u27F5",
        xmap: "\u27FC",
        xnis: "\u22FB",
        xodot: "\u2A00",
        Xopf: "\u{1D54F}",
        xopf: "\u{1D569}",
        xoplus: "\u2A01",
        xotime: "\u2A02",
        xrArr: "\u27F9",
        xrarr: "\u27F6",
        Xscr: "\u{1D4B3}",
        xscr: "\u{1D4CD}",
        xsqcup: "\u2A06",
        xuplus: "\u2A04",
        xutri: "\u25B3",
        xvee: "\u22C1",
        xwedge: "\u22C0",
        Yacute: "\xDD",
        yacute: "\xFD",
        YAcy: "\u042F",
        yacy: "\u044F",
        Ycirc: "\u0176",
        ycirc: "\u0177",
        Ycy: "\u042B",
        ycy: "\u044B",
        yen: "\xA5",
        Yfr: "\u{1D51C}",
        yfr: "\u{1D536}",
        YIcy: "\u0407",
        yicy: "\u0457",
        Yopf: "\u{1D550}",
        yopf: "\u{1D56A}",
        Yscr: "\u{1D4B4}",
        yscr: "\u{1D4CE}",
        YUcy: "\u042E",
        yucy: "\u044E",
        Yuml: "\u0178",
        yuml: "\xFF",
        Zacute: "\u0179",
        zacute: "\u017A",
        Zcaron: "\u017D",
        zcaron: "\u017E",
        Zcy: "\u0417",
        zcy: "\u0437",
        Zdot: "\u017B",
        zdot: "\u017C",
        zeetrf: "\u2128",
        ZeroWidthSpace: "\u200B",
        Zeta: "\u0396",
        zeta: "\u03B6",
        Zfr: "\u2128",
        zfr: "\u{1D537}",
        ZHcy: "\u0416",
        zhcy: "\u0436",
        zigrarr: "\u21DD",
        Zopf: "\u2124",
        zopf: "\u{1D56B}",
        Zscr: "\u{1D4B5}",
        zscr: "\u{1D4CF}",
        zwj: "\u200D",
        zwnj: "\u200C"
      });
      exports.entityMap = exports.HTML_ENTITIES;
    }
  });

  // node_modules/@xmldom/xmldom/lib/sax.js
  var require_sax = __commonJS({
    "node_modules/@xmldom/xmldom/lib/sax.js"(exports) {
      var NAMESPACE = require_conventions().NAMESPACE;
      var tagNamePattern = require_conventions().tagNamePattern;
      var S_TAG = 0;
      var S_ATTR = 1;
      var S_ATTR_SPACE = 2;
      var S_EQ = 3;
      var S_ATTR_NOQUOT_VALUE = 4;
      var S_ATTR_END = 5;
      var S_TAG_SPACE = 6;
      var S_TAG_CLOSE = 7;
      function ParseError(message, locator) {
        this.message = message;
        this.locator = locator;
        if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
      }
      ParseError.prototype = new Error();
      ParseError.prototype.name = ParseError.name;
      function XMLReader() {
      }
      XMLReader.prototype = {
        parse: function(source, defaultNSMap, entityMap) {
          var domBuilder = this.domBuilder;
          domBuilder.startDocument();
          _copy(defaultNSMap, defaultNSMap = {});
          parse(
            source,
            defaultNSMap,
            entityMap,
            domBuilder,
            this.errorHandler
          );
          domBuilder.endDocument();
        }
      };
      function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
        function fixedFromCharCode(code) {
          if (code > 65535) {
            code -= 65536;
            var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
            return String.fromCharCode(surrogate1, surrogate2);
          } else {
            return String.fromCharCode(code);
          }
        }
        function entityReplacer(a2) {
          var k = a2.slice(1, -1);
          if (Object.hasOwnProperty.call(entityMap, k)) {
            return entityMap[k];
          } else if (k.charAt(0) === "#") {
            return fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x")));
          } else {
            errorHandler.error("entity not found:" + a2);
            return a2;
          }
        }
        function appendText(end2) {
          if (end2 > start) {
            var xt = source.substring(start, end2).replace(/&#?\w+;/g, entityReplacer);
            locator && position(start);
            domBuilder.characters(xt, 0, end2 - start);
            start = end2;
          }
        }
        function position(p, m) {
          while (p >= lineEnd && (m = linePattern.exec(source))) {
            lineStart = m.index;
            lineEnd = lineStart + m[0].length;
            locator.lineNumber++;
          }
          locator.columnNumber = p - lineStart + 1;
        }
        var lineStart = 0;
        var lineEnd = 0;
        var linePattern = /.*(?:\r\n?|\n)|.*$/g;
        var locator = domBuilder.locator;
        var parseStack = [{ currentNSMap: defaultNSMapCopy }];
        var closeMap = {};
        var start = 0;
        while (true) {
          try {
            var tagStart = source.indexOf("<", start);
            if (tagStart < 0) {
              if (!source.substr(start).match(/^\s*$/)) {
                var doc = domBuilder.doc;
                var text = doc.createTextNode(source.substr(start));
                doc.appendChild(text);
                domBuilder.currentElement = text;
              }
              return;
            }
            if (tagStart > start) {
              appendText(tagStart);
            }
            switch (source.charAt(tagStart + 1)) {
              case "/":
                var end = source.indexOf(">", tagStart + 3);
                var tagName = source.substring(tagStart + 2, end).replace(/^([\s\S]*?[^ \t\n\r])?[ \t\n\r]*$/, "$1");
                var config = parseStack.pop();
                if (end < 0) {
                  tagName = source.substring(tagStart + 2).replace(/[\s<].*/, "");
                  errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName);
                  end = tagStart + 1 + tagName.length;
                } else if (tagName.match(/\s</)) {
                  tagName = tagName.replace(/[\s<].*/, "");
                  errorHandler.error("end tag name: " + tagName + " maybe not complete");
                  end = tagStart + 1 + tagName.length;
                } else if (/[ \t\n\r]/.test(tagName) && tagNamePattern.test(tagName.split(/[ \t\n\r]/)[0])) {
                  errorHandler.error('end tag name is followed by whitespace and trailing content: "' + tagName + '"');
                }
                var localNSMap = config.localNSMap;
                var endMatch = config.tagName == tagName;
                var endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
                if (endIgnoreCaseMach) {
                  domBuilder.endElement(config.uri, config.localName, tagName);
                  if (localNSMap) {
                    for (var prefix in localNSMap) {
                      if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
                        domBuilder.endPrefixMapping(prefix);
                      }
                    }
                  }
                  if (!endMatch) {
                    errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
                  }
                } else {
                  parseStack.push(config);
                }
                end++;
                break;
              // end elment
              case "?":
                locator && position(tagStart);
                end = parseInstruction(source, tagStart, domBuilder);
                break;
              case "!":
                locator && position(tagStart);
                end = parseDCC(source, tagStart, domBuilder, errorHandler);
                break;
              default:
                locator && position(tagStart);
                var el = new ElementAttributes();
                var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
                var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler);
                var len = el.length;
                if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap)) {
                  el.closed = true;
                  if (!entityMap.nbsp) {
                    errorHandler.warning("unclosed xml attribute");
                  }
                }
                if (locator && len) {
                  var locator2 = copyLocator(locator, {});
                  for (var i = 0; i < len; i++) {
                    var a = el[i];
                    position(a.offset);
                    a.locator = copyLocator(locator, {});
                  }
                  domBuilder.locator = locator2;
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                  domBuilder.locator = locator;
                } else {
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                }
                if (NAMESPACE.isHTML(el.uri) && !el.closed) {
                  end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
                } else {
                  end++;
                }
            }
          } catch (e) {
            if (e instanceof ParseError) {
              throw e;
            }
            errorHandler.error("element parse error: " + e);
            end = -1;
          }
          if (end > start) {
            start = end;
          } else {
            appendText(Math.max(tagStart, start) + 1);
          }
        }
      }
      function copyLocator(f, t) {
        t.lineNumber = f.lineNumber;
        t.columnNumber = f.columnNumber;
        return t;
      }
      function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
        function addAttribute(qname, value2, startIndex) {
          if (el.attributeNames.hasOwnProperty(qname)) {
            errorHandler.fatalError("Attribute " + qname + " redefined");
          }
          el.addValue(
            qname,
            // @see https://www.w3.org/TR/xml/#AVNormalize
            // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
            // - recursive replacement of (DTD) entity references
            // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
            value2.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, entityReplacer),
            startIndex
          );
        }
        var attrName;
        var value;
        var p = ++start;
        var s = S_TAG;
        while (true) {
          var c = source.charAt(p);
          if (s === S_TAG && c === "<") {
            throw new Error("unexpected < in tag name: " + source.slice(start, p));
          }
          switch (c) {
            case "=":
              if (s === S_ATTR) {
                attrName = source.slice(start, p);
                s = S_EQ;
              } else if (s === S_ATTR_SPACE) {
                s = S_EQ;
              } else {
                throw new Error("attribute equal must after attrName");
              }
              break;
            case "'":
            case '"':
              if (s === S_EQ || s === S_ATTR) {
                if (s === S_ATTR) {
                  errorHandler.warning('attribute value must after "="');
                  attrName = source.slice(start, p);
                }
                start = p + 1;
                p = source.indexOf(c, start);
                if (p > 0) {
                  value = source.slice(start, p);
                  addAttribute(attrName, value, start - 1);
                  s = S_ATTR_END;
                } else {
                  throw new Error("attribute value no end '" + c + "' match");
                }
              } else if (s == S_ATTR_NOQUOT_VALUE) {
                value = source.slice(start, p);
                addAttribute(attrName, value, start);
                errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
                start = p + 1;
                s = S_ATTR_END;
              } else {
                throw new Error('attribute value must after "="');
              }
              break;
            case "/":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  s = S_TAG_CLOSE;
                  el.closed = true;
                case S_ATTR_NOQUOT_VALUE:
                case S_ATTR:
                  break;
                case S_ATTR_SPACE:
                  el.closed = true;
                  break;
                //case S_EQ:
                default:
                  throw new Error("attribute invalid close char('/')");
              }
              break;
            case "":
              errorHandler.error("unexpected end of input");
              if (s == S_TAG) {
                el.setTagName(source.slice(start, p));
              }
              return p;
            case ">":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  break;
                //normal
                case S_ATTR_NOQUOT_VALUE:
                //Compatible state
                case S_ATTR:
                  value = source.slice(start, p);
                  if (value.slice(-1) === "/") {
                    el.closed = true;
                    value = value.slice(0, -1);
                  }
                case S_ATTR_SPACE:
                  if (s === S_ATTR_SPACE) {
                    value = attrName;
                  }
                  if (s == S_ATTR_NOQUOT_VALUE) {
                    errorHandler.warning('attribute "' + value + '" missed quot(")!');
                    addAttribute(attrName, value, start);
                  } else {
                    if (!NAMESPACE.isHTML(currentNSMap[""]) || !value.match(/^(?:disabled|checked|selected)$/i)) {
                      errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                    }
                    addAttribute(value, value, start);
                  }
                  break;
                case S_EQ:
                  throw new Error("attribute value missed!!");
              }
              return p;
            /*xml space '\x20' | #x9 | #xD | #xA; */
            case "\x80":
              c = " ";
            default:
              if (c <= " ") {
                switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p));
                    s = S_TAG_SPACE;
                    break;
                  case S_ATTR:
                    attrName = source.slice(start, p);
                    s = S_ATTR_SPACE;
                    break;
                  case S_ATTR_NOQUOT_VALUE:
                    var value = source.slice(start, p);
                    errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                    addAttribute(attrName, value, start);
                  case S_ATTR_END:
                    s = S_TAG_SPACE;
                    break;
                }
              } else {
                switch (s) {
                  //case S_TAG:void();break;
                  //case S_ATTR:void();break;
                  //case S_ATTR_NOQUOT_VALUE:void();break;
                  case S_ATTR_SPACE:
                    var tagName = el.tagName;
                    if (!NAMESPACE.isHTML(currentNSMap[""]) || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
                      errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                    }
                    addAttribute(attrName, attrName, start);
                    start = p;
                    s = S_ATTR;
                    break;
                  case S_ATTR_END:
                    errorHandler.warning('attribute space is required"' + attrName + '"!!');
                  case S_TAG_SPACE:
                    s = S_ATTR;
                    start = p;
                    break;
                  case S_EQ:
                    s = S_ATTR_NOQUOT_VALUE;
                    start = p;
                    break;
                  case S_TAG_CLOSE:
                    throw new Error("elements closed character '/' and '>' must be connected to");
                }
              }
          }
          p++;
        }
      }
      function appendElement(el, domBuilder, currentNSMap) {
        var tagName = el.tagName;
        var localNSMap = null;
        var i = el.length;
        while (i--) {
          var a = el[i];
          var qName = a.qName;
          var value = a.value;
          var nsp = qName.indexOf(":");
          if (nsp > 0) {
            var prefix = a.prefix = qName.slice(0, nsp);
            var localName = qName.slice(nsp + 1);
            var nsPrefix = prefix === "xmlns" && localName;
          } else {
            localName = qName;
            prefix = null;
            nsPrefix = qName === "xmlns" && "";
          }
          a.localName = localName;
          if (nsPrefix !== false) {
            if (localNSMap == null) {
              localNSMap = {};
              currentNSMap = Object.create(currentNSMap);
            }
            currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
            a.uri = NAMESPACE.XMLNS;
            domBuilder.startPrefixMapping(nsPrefix, value);
          }
        }
        var i = el.length;
        while (i--) {
          a = el[i];
          var prefix = a.prefix;
          if (prefix) {
            if (prefix === "xml") {
              a.uri = NAMESPACE.XML;
            }
            if (prefix !== "xmlns") {
              a.uri = currentNSMap[prefix || ""];
            }
          }
        }
        var nsp = tagName.indexOf(":");
        if (nsp > 0) {
          prefix = el.prefix = tagName.slice(0, nsp);
          localName = el.localName = tagName.slice(nsp + 1);
        } else {
          prefix = null;
          localName = el.localName = tagName;
        }
        var ns = el.uri = currentNSMap[prefix || ""];
        domBuilder.startElement(ns, localName, tagName, el);
        if (el.closed) {
          domBuilder.endElement(ns, localName, tagName);
          if (localNSMap) {
            for (prefix in localNSMap) {
              if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
                domBuilder.endPrefixMapping(prefix);
              }
            }
          }
        } else {
          el.currentNSMap = currentNSMap;
          el.localNSMap = localNSMap;
          return true;
        }
      }
      function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
        if (/^(?:script|textarea)$/i.test(tagName)) {
          var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
          var text = source.substring(elStartEnd + 1, elEndStart);
          if (/[&<]/.test(text)) {
            if (/^script$/i.test(tagName)) {
              domBuilder.characters(text, 0, text.length);
              return elEndStart;
            }
            text = text.replace(/&#?\w+;/g, entityReplacer);
            domBuilder.characters(text, 0, text.length);
            return elEndStart;
          }
        }
        return elStartEnd + 1;
      }
      function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
        var pos = closeMap[tagName];
        if (pos == null) {
          pos = source.lastIndexOf("</" + tagName + ">");
          if (pos < elStartEnd) {
            pos = source.lastIndexOf("</" + tagName);
          }
          closeMap[tagName] = pos;
        }
        return pos < elStartEnd;
      }
      function _copy(source, target) {
        for (var n in source) {
          if (Object.prototype.hasOwnProperty.call(source, n)) {
            target[n] = source[n];
          }
        }
      }
      function parseDCC(source, start, domBuilder, errorHandler) {
        var next = source.charAt(start + 2);
        switch (next) {
          case "-":
            if (source.charAt(start + 3) === "-") {
              var end = source.indexOf("-->", start + 4);
              if (end > start) {
                domBuilder.comment(source, start + 4, end - start - 4);
                return end + 3;
              } else {
                errorHandler.error("Unclosed comment");
                return -1;
              }
            } else {
              return -1;
            }
          default:
            if (source.substr(start + 3, 6) == "CDATA[") {
              var end = source.indexOf("]]>", start + 9);
              domBuilder.startCDATA();
              domBuilder.characters(source, start + 9, end - start - 9);
              domBuilder.endCDATA();
              return end + 3;
            }
            var matchs = split(source, start);
            var len = matchs.length;
            if (len > 1 && /!doctype/i.test(matchs[0][0])) {
              var name2 = matchs[1][0];
              var pubid = false;
              var sysid = false;
              if (len > 3) {
                if (/^public$/i.test(matchs[2][0])) {
                  pubid = matchs[3][0];
                  sysid = len > 4 && matchs[4][0];
                } else if (/^system$/i.test(matchs[2][0])) {
                  sysid = matchs[3][0];
                }
              }
              var lastMatch = matchs[len - 1];
              domBuilder.startDTD(name2, pubid, sysid);
              domBuilder.endDTD();
              return lastMatch.index + lastMatch[0].length;
            }
        }
        return -1;
      }
      function parseInstruction(source, start, domBuilder) {
        var end = source.indexOf("?>", start);
        if (end) {
          var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)$/);
          if (match) {
            var len = match[0].length;
            domBuilder.processingInstruction(match[1], match[2]);
            return end + 2;
          } else {
            return -1;
          }
        }
        return -1;
      }
      function ElementAttributes() {
        this.attributeNames = {};
      }
      ElementAttributes.prototype = {
        setTagName: function(tagName) {
          if (!tagNamePattern.test(tagName)) {
            throw new Error("invalid tagName:" + tagName);
          }
          this.tagName = tagName;
        },
        addValue: function(qName, value, offset) {
          if (!tagNamePattern.test(qName)) {
            throw new Error("invalid attribute:" + qName);
          }
          this.attributeNames[qName] = this.length;
          this[this.length++] = { qName, value, offset };
        },
        length: 0,
        getLocalName: function(i) {
          return this[i].localName;
        },
        getLocator: function(i) {
          return this[i].locator;
        },
        getQName: function(i) {
          return this[i].qName;
        },
        getURI: function(i) {
          return this[i].uri;
        },
        getValue: function(i) {
          return this[i].value;
        }
        //	,getIndex:function(uri, localName)){
        //		if(localName){
        //
        //		}else{
        //			var qName = uri
        //		}
        //	},
        //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
        //	getType:function(uri,localName){}
        //	getType:function(i){},
      };
      function split(source, start) {
        var match;
        var buf = [];
        var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
        reg.lastIndex = start;
        reg.exec(source);
        while (match = reg.exec(source)) {
          buf.push(match);
          if (match[1]) return buf;
        }
      }
      exports.XMLReader = XMLReader;
      exports.ParseError = ParseError;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom-parser.js
  var require_dom_parser = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports) {
      var conventions = require_conventions();
      var dom = require_dom();
      var entities = require_entities();
      var sax = require_sax();
      var DOMImplementation = dom.DOMImplementation;
      var NAMESPACE = conventions.NAMESPACE;
      var ParseError = sax.ParseError;
      var XMLReader = sax.XMLReader;
      function normalizeLineEndings(input) {
        return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028]/g, "\n");
      }
      function DOMParser(options) {
        this.options = options || { locator: {} };
      }
      DOMParser.prototype.parseFromString = function(source, mimeType) {
        var options = this.options;
        var sax2 = new XMLReader();
        var domBuilder = options.domBuilder || new DOMHandler();
        var errorHandler = options.errorHandler;
        var locator = options.locator;
        var defaultNSMap = options.xmlns || {};
        var isHTML = /\/x?html?$/.test(mimeType);
        var entityMap = isHTML ? entities.HTML_ENTITIES : entities.XML_ENTITIES;
        if (locator) {
          domBuilder.setDocumentLocator(locator);
        }
        sax2.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
        sax2.domBuilder = options.domBuilder || domBuilder;
        if (isHTML) {
          defaultNSMap[""] = NAMESPACE.HTML;
        }
        defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
        var normalize = options.normalizeLineEndings || normalizeLineEndings;
        if (source && typeof source === "string") {
          sax2.parse(
            normalize(source),
            defaultNSMap,
            entityMap
          );
        } else {
          sax2.errorHandler.error("invalid doc source");
        }
        return domBuilder.doc;
      };
      function buildErrorHandler(errorImpl, domBuilder, locator) {
        if (!errorImpl) {
          if (domBuilder instanceof DOMHandler) {
            return domBuilder;
          }
          errorImpl = domBuilder;
        }
        var errorHandler = {};
        var isCallback = errorImpl instanceof Function;
        locator = locator || {};
        function build(key) {
          var fn = errorImpl[key];
          if (!fn && isCallback) {
            fn = errorImpl.length == 2 ? function(msg) {
              errorImpl(key, msg);
            } : errorImpl;
          }
          errorHandler[key] = fn && function(msg) {
            fn("[xmldom " + key + "]	" + msg + _locator(locator));
          } || function() {
          };
        }
        build("warning");
        build("error");
        build("fatalError");
        return errorHandler;
      }
      function DOMHandler() {
        this.cdata = false;
      }
      function position(locator, node) {
        node.lineNumber = locator.lineNumber;
        node.columnNumber = locator.columnNumber;
      }
      DOMHandler.prototype = {
        startDocument: function() {
          this.doc = new DOMImplementation().createDocument(null, null, null);
          if (this.locator) {
            this.doc.documentURI = this.locator.systemId;
          }
        },
        startElement: function(namespaceURI, localName, qName, attrs) {
          var doc = this.doc;
          var el = doc.createElementNS(namespaceURI, qName || localName);
          var len = attrs.length;
          appendElement(this, el);
          this.currentElement = el;
          this.locator && position(this.locator, el);
          for (var i = 0; i < len; i++) {
            var namespaceURI = attrs.getURI(i);
            var value = attrs.getValue(i);
            var qName = attrs.getQName(i);
            var attr = doc.createAttributeNS(namespaceURI, qName);
            this.locator && position(attrs.getLocator(i), attr);
            attr.value = attr.nodeValue = value;
            el.setAttributeNode(attr);
          }
        },
        endElement: function(namespaceURI, localName, qName) {
          var current = this.currentElement;
          var tagName = current.tagName;
          this.currentElement = current.parentNode;
        },
        startPrefixMapping: function(prefix, uri) {
        },
        endPrefixMapping: function(prefix) {
        },
        processingInstruction: function(target, data) {
          var ins = this.doc.createProcessingInstruction(target, data);
          this.locator && position(this.locator, ins);
          appendElement(this, ins);
        },
        ignorableWhitespace: function(ch, start, length) {
        },
        characters: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          if (chars) {
            if (this.cdata) {
              var charNode = this.doc.createCDATASection(chars);
            } else {
              var charNode = this.doc.createTextNode(chars);
            }
            if (this.currentElement) {
              this.currentElement.appendChild(charNode);
            } else if (/^\s*$/.test(chars)) {
              this.doc.appendChild(charNode);
            }
            this.locator && position(this.locator, charNode);
          }
        },
        skippedEntity: function(name2) {
        },
        endDocument: function() {
          this.doc.normalize();
        },
        setDocumentLocator: function(locator) {
          if (this.locator = locator) {
            locator.lineNumber = 0;
          }
        },
        //LexicalHandler
        comment: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          var comm = this.doc.createComment(chars);
          this.locator && position(this.locator, comm);
          appendElement(this, comm);
        },
        startCDATA: function() {
          this.cdata = true;
        },
        endCDATA: function() {
          this.cdata = false;
        },
        startDTD: function(name2, publicId, systemId) {
          var impl = this.doc.implementation;
          if (impl && impl.createDocumentType) {
            var dt = impl.createDocumentType(name2, publicId, systemId);
            this.locator && position(this.locator, dt);
            appendElement(this, dt);
            this.doc.doctype = dt;
          }
        },
        /**
         * @see org.xml.sax.ErrorHandler
         * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
         */
        warning: function(error) {
          console.warn("[xmldom warning]	" + error, _locator(this.locator));
        },
        error: function(error) {
          console.error("[xmldom error]	" + error, _locator(this.locator));
        },
        fatalError: function(error) {
          throw new ParseError(error, this.locator);
        }
      };
      function _locator(l) {
        if (l) {
          return "\n@" + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
        }
      }
      function _toString(chars, start, length) {
        if (typeof chars == "string") {
          return chars.substr(start, length);
        } else {
          if (chars.length >= start + length || start) {
            return new java.lang.String(chars, start, length) + "";
          }
          return chars;
        }
      }
      "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(key) {
        DOMHandler.prototype[key] = function() {
          return null;
        };
      });
      function appendElement(hander, node) {
        if (!hander.currentElement) {
          hander.doc.appendChild(node);
        } else {
          hander.currentElement.appendChild(node);
        }
      }
      exports.__DOMHandler = DOMHandler;
      exports.normalizeLineEndings = normalizeLineEndings;
      exports.DOMParser = DOMParser;
    }
  });

  // node_modules/@xmldom/xmldom/lib/index.js
  var require_lib = __commonJS({
    "node_modules/@xmldom/xmldom/lib/index.js"(exports) {
      var dom = require_dom();
      exports.DOMImplementation = dom.DOMImplementation;
      exports.XMLSerializer = dom.XMLSerializer;
      exports.DOMParser = require_dom_parser().DOMParser;
    }
  });

  // node_modules/fonteditor-core/lib/common/DOMParser.js
  var require_DOMParser = __commonJS({
    "node_modules/fonteditor-core/lib/common/DOMParser.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = typeof window !== "undefined" && window.DOMParser ? window.DOMParser : require_lib().DOMParser;
    }
  });

  // node_modules/fonteditor-core/lib/graphics/getArc.js
  var require_getArc = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/getArc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = getArc;
      var _bezierCubic2Q = _interopRequireDefault(require_bezierCubic2Q2());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TAU = Math.PI * 2;
      function vectorAngle(ux, uy, vx, vy) {
        var sign = ux * vy - uy * vx < 0 ? -1 : 1;
        var umag = Math.sqrt(ux * ux + uy * uy);
        var vmag = Math.sqrt(ux * ux + uy * uy);
        var dot = ux * vx + uy * vy;
        var div = dot / (umag * vmag);
        if (div > 1 || div < -1) {
          div = Math.max(div, -1);
          div = Math.min(div, 1);
        }
        return sign * Math.acos(div);
      }
      function correctRadii(midx, midy, rx, ry) {
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        var \u039B = midx * midx / (rx * rx) + midy * midy / (ry * ry);
        if (\u039B > 1) {
          rx *= Math.sqrt(\u039B);
          ry *= Math.sqrt(\u039B);
        }
        return [rx, ry];
      }
      function getArcCenter(x1, y1, x2, y2, fa, fs, rx, ry, sin_\u03C6, cos_\u03C6) {
        var x1p = cos_\u03C6 * (x1 - x2) / 2 + sin_\u03C6 * (y1 - y2) / 2;
        var y1p = -sin_\u03C6 * (x1 - x2) / 2 + cos_\u03C6 * (y1 - y2) / 2;
        var rx_sq = rx * rx;
        var ry_sq = ry * ry;
        var x1p_sq = x1p * x1p;
        var y1p_sq = y1p * y1p;
        var radicant = rx_sq * ry_sq - rx_sq * y1p_sq - ry_sq * x1p_sq;
        if (radicant < 0) {
          radicant = 0;
        }
        radicant /= rx_sq * y1p_sq + ry_sq * x1p_sq;
        radicant = Math.sqrt(radicant) * (fa === fs ? -1 : 1);
        var cxp = radicant * rx / ry * y1p;
        var cyp = radicant * -ry / rx * x1p;
        var cx = cos_\u03C6 * cxp - sin_\u03C6 * cyp + (x1 + x2) / 2;
        var cy = sin_\u03C6 * cxp + cos_\u03C6 * cyp + (y1 + y2) / 2;
        var v1x = (x1p - cxp) / rx;
        var v1y = (y1p - cyp) / ry;
        var v2x = (-x1p - cxp) / rx;
        var v2y = (-y1p - cyp) / ry;
        var \u03B81 = vectorAngle(1, 0, v1x, v1y);
        var \u0394\u03B8 = vectorAngle(v1x, v1y, v2x, v2y);
        if (fs === 0 && \u0394\u03B8 > 0) {
          \u0394\u03B8 -= TAU;
        }
        if (fs === 1 && \u0394\u03B8 < 0) {
          \u0394\u03B8 += TAU;
        }
        return [cx, cy, \u03B81, \u0394\u03B8];
      }
      function approximateUnitArc(\u03B81, \u0394\u03B8) {
        var \u03B1 = 4 / 3 * Math.tan(\u0394\u03B8 / 4);
        var x1 = Math.cos(\u03B81);
        var y1 = Math.sin(\u03B81);
        var x2 = Math.cos(\u03B81 + \u0394\u03B8);
        var y2 = Math.sin(\u03B81 + \u0394\u03B8);
        return [x1, y1, x1 - y1 * \u03B1, y1 + x1 * \u03B1, x2 + y2 * \u03B1, y2 - x2 * \u03B1, x2, y2];
      }
      function a2c(x1, y1, x2, y2, fa, fs, rx, ry, \u03C6) {
        var sin_\u03C6 = Math.sin(\u03C6 * TAU / 360);
        var cos_\u03C6 = Math.cos(\u03C6 * TAU / 360);
        var x1p = cos_\u03C6 * (x1 - x2) / 2 + sin_\u03C6 * (y1 - y2) / 2;
        var y1p = -sin_\u03C6 * (x1 - x2) / 2 + cos_\u03C6 * (y1 - y2) / 2;
        if (x1p === 0 && y1p === 0) {
          return [];
        }
        if (rx === 0 || ry === 0) {
          return [];
        }
        var radii = correctRadii(x1p, y1p, rx, ry);
        rx = radii[0];
        ry = radii[1];
        var cc = getArcCenter(x1, y1, x2, y2, fa, fs, rx, ry, sin_\u03C6, cos_\u03C6);
        var result = [];
        var \u03B81 = cc[2];
        var \u0394\u03B8 = cc[3];
        var segments = Math.max(Math.ceil(Math.abs(\u0394\u03B8) / (TAU / 4)), 1);
        \u0394\u03B8 /= segments;
        for (var i = 0; i < segments; i++) {
          result.push(approximateUnitArc(\u03B81, \u0394\u03B8));
          \u03B81 += \u0394\u03B8;
        }
        return result.map(function(curve) {
          for (var _i = 0; _i < curve.length; _i += 2) {
            var x = curve[_i + 0];
            var y = curve[_i + 1];
            x *= rx;
            y *= ry;
            var xp = cos_\u03C6 * x - sin_\u03C6 * y;
            var yp = sin_\u03C6 * x + cos_\u03C6 * y;
            curve[_i + 0] = xp + cc[0];
            curve[_i + 1] = yp + cc[1];
          }
          return curve;
        });
      }
      function getArc(rx, ry, angle, largeArc, sweep, p0, p1) {
        var result = a2c(p0.x, p0.y, p1.x, p1.y, largeArc, sweep, rx, ry, angle);
        var path = [];
        if (result.length) {
          path.push({
            x: result[0][0],
            y: result[0][1],
            onCurve: true
          });
          result.forEach(function(c) {
            var q2Array = (0, _bezierCubic2Q.default)({
              x: c[0],
              y: c[1]
            }, {
              x: c[2],
              y: c[3]
            }, {
              x: c[4],
              y: c[5]
            }, {
              x: c[6],
              y: c[7]
            });
            q2Array[0][2].onCurve = true;
            path.push(q2Array[0][1]);
            path.push(q2Array[0][2]);
            if (q2Array[1]) {
              q2Array[1][2].onCurve = true;
              path.push(q2Array[1][1]);
              path.push(q2Array[1][2]);
            }
          });
        }
        return path;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/parseParams.js
  var require_parseParams = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/parseParams.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = _default;
      var SEGMENT_REGEX = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?\b/g;
      function getSegment(d) {
        return +d.trim();
      }
      function _default(str) {
        if (!str) {
          return [];
        }
        var matchs = str.match(SEGMENT_REGEX);
        return matchs ? matchs.map(getSegment) : [];
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/path2contours.js
  var require_path2contours = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/path2contours.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = path2contours;
      var _bezierCubic2Q = _interopRequireDefault(require_bezierCubic2Q2());
      var _getArc = _interopRequireDefault(require_getArc());
      var _parseParams = _interopRequireDefault(require_parseParams());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function cubic2Points(cubicList, contour) {
        var i;
        var l;
        var q2List = [];
        cubicList.forEach(function(c) {
          var list = (0, _bezierCubic2Q.default)(c[0], c[1], c[2], c[3]);
          for (i = 0, l = list.length; i < l; i++) {
            q2List.push(list[i]);
          }
        });
        var q2;
        var prevq2;
        for (i = 0, l = q2List.length; i < l; i++) {
          q2 = q2List[i];
          if (i === 0) {
            contour.push({
              x: q2[1].x,
              y: q2[1].y
            });
            contour.push({
              x: q2[2].x,
              y: q2[2].y,
              onCurve: true
            });
          } else {
            prevq2 = q2List[i - 1];
            if (prevq2[1].x + q2[1].x === 2 * q2[0].x && prevq2[1].y + q2[1].y === 2 * q2[0].y) {
              contour.pop();
            }
            contour.push({
              x: q2[1].x,
              y: q2[1].y
            });
            contour.push({
              x: q2[2].x,
              y: q2[2].y,
              onCurve: true
            });
          }
        }
        contour.push({
          x: q2[2].x,
          y: q2[2].y,
          onCurve: true
        });
        return contour;
      }
      function segments2Contours(segments) {
        var contours = [];
        var contour = [];
        var prevX = 0;
        var prevY = 0;
        var segment;
        var args;
        var cmd;
        var relative;
        var q;
        var ql;
        var px;
        var py;
        var cubicList;
        var p1;
        var p2;
        var c1;
        var c2;
        var prevCubicC1;
        for (var i = 0, l = segments.length; i < l; i++) {
          segment = segments[i];
          cmd = segment.cmd;
          relative = segment.relative;
          args = segment.args;
          if (args && !args.length && cmd !== "Z") {
            console.warn("`" + cmd + "` command args empty!");
            continue;
          }
          if (cmd === "Z") {
            contours.push(contour);
            contour = [];
          } else if (cmd === "M" || cmd === "L") {
            if (args.length % 2) {
              throw new Error("`M` command error:" + args.join(","));
            }
            if (relative) {
              px = prevX;
              py = prevY;
            } else {
              px = 0;
              py = 0;
            }
            for (q = 0, ql = args.length; q < ql; q += 2) {
              if (relative) {
                px += args[q];
                py += args[q + 1];
              } else {
                px = args[q];
                py = args[q + 1];
              }
              contour.push({
                x: px,
                y: py,
                onCurve: true
              });
            }
            prevX = px;
            prevY = py;
          } else if (cmd === "H") {
            if (relative) {
              prevX += args[0];
            } else {
              prevX = args[0];
            }
            contour.push({
              x: prevX,
              y: prevY,
              onCurve: true
            });
          } else if (cmd === "V") {
            if (relative) {
              prevY += args[0];
            } else {
              prevY = args[0];
            }
            contour.push({
              x: prevX,
              y: prevY,
              onCurve: true
            });
          } else if (cmd === "Q") {
            if (relative) {
              px = prevX;
              py = prevY;
            } else {
              px = 0;
              py = 0;
            }
            for (q = 0, ql = args.length; q < ql; q += 4) {
              contour.push({
                x: px + args[q],
                y: py + args[q + 1]
              });
              contour.push({
                x: px + args[q + 2],
                y: py + args[q + 3],
                onCurve: true
              });
              if (relative) {
                px += args[q + 2];
                py += args[q + 3];
              } else {
                px = 0;
                py = 0;
              }
            }
            if (relative) {
              prevX = px;
              prevY = py;
            } else {
              prevX = args[ql - 2];
              prevY = args[ql - 1];
            }
          } else if (cmd === "T") {
            var last = contour.pop();
            var pc = contour[contour.length - 1];
            if (!pc) {
              pc = last;
            }
            contour.push(pc = {
              x: 2 * last.x - pc.x,
              y: 2 * last.y - pc.y
            });
            px = prevX;
            py = prevY;
            for (q = 0, ql = args.length - 2; q < ql; q += 2) {
              if (relative) {
                px += args[q];
                py += args[q + 1];
              } else {
                px = args[q];
                py = args[q + 1];
              }
              last = {
                x: px,
                y: py
              };
              contour.push(pc = {
                x: 2 * last.x - pc.x,
                y: 2 * last.y - pc.y
              });
            }
            if (relative) {
              prevX = px + args[ql];
              prevY = py + args[ql + 1];
            } else {
              prevX = args[ql];
              prevY = args[ql + 1];
            }
            contour.push({
              x: prevX,
              y: prevY,
              onCurve: true
            });
          } else if (cmd === "C") {
            if (args.length % 6) {
              throw new Error("`C` command params error:" + args.join(","));
            }
            cubicList = [];
            if (relative) {
              px = prevX;
              py = prevY;
            } else {
              px = 0;
              py = 0;
            }
            p1 = {
              x: prevX,
              y: prevY
            };
            for (q = 0, ql = args.length; q < ql; q += 6) {
              c1 = {
                x: px + args[q],
                y: py + args[q + 1]
              };
              c2 = {
                x: px + args[q + 2],
                y: py + args[q + 3]
              };
              p2 = {
                x: px + args[q + 4],
                y: py + args[q + 5]
              };
              cubicList.push([p1, c1, c2, p2]);
              p1 = p2;
              if (relative) {
                px += args[q + 4];
                py += args[q + 5];
              } else {
                px = 0;
                py = 0;
              }
            }
            if (relative) {
              prevX = px;
              prevY = py;
            } else {
              prevX = args[ql - 2];
              prevY = args[ql - 1];
            }
            cubic2Points(cubicList, contour);
            prevCubicC1 = cubicList[cubicList.length - 1][2];
          } else if (cmd === "S") {
            if (args.length % 4) {
              throw new Error("`S` command params error:" + args.join(","));
            }
            cubicList = [];
            if (relative) {
              px = prevX;
              py = prevY;
            } else {
              px = 0;
              py = 0;
            }
            p1 = contour.pop();
            if (!prevCubicC1) {
              prevCubicC1 = p1;
            }
            c1 = {
              x: 2 * p1.x - prevCubicC1.x,
              y: 2 * p1.y - prevCubicC1.y
            };
            for (q = 0, ql = args.length; q < ql; q += 4) {
              c2 = {
                x: px + args[q],
                y: py + args[q + 1]
              };
              p2 = {
                x: px + args[q + 2],
                y: py + args[q + 3]
              };
              cubicList.push([p1, c1, c2, p2]);
              p1 = p2;
              c1 = {
                x: 2 * p1.x - c2.x,
                y: 2 * p1.y - c2.y
              };
              if (relative) {
                px += args[q + 2];
                py += args[q + 3];
              } else {
                px = 0;
                py = 0;
              }
            }
            if (relative) {
              prevX = px;
              prevY = py;
            } else {
              prevX = args[ql - 2];
              prevY = args[ql - 1];
            }
            cubic2Points(cubicList, contour);
            prevCubicC1 = cubicList[cubicList.length - 1][2];
          } else if (cmd === "A") {
            if (args.length % 7) {
              throw new Error("arc command params error:" + args.join(","));
            }
            for (q = 0, ql = args.length; q < ql; q += 7) {
              var ex = args[q + 5];
              var ey = args[q + 6];
              if (relative) {
                ex = prevX + ex;
                ey = prevY + ey;
              }
              var path = (0, _getArc.default)(args[q], args[q + 1], args[q + 2], args[q + 3], args[q + 4], {
                x: prevX,
                y: prevY
              }, {
                x: ex,
                y: ey
              });
              if (path && path.length > 1) {
                for (var r = 1, rl = path.length; r < rl; r++) {
                  contour.push(path[r]);
                }
              }
              prevX = ex;
              prevY = ey;
            }
          }
        }
        return contours;
      }
      function path2contours(path) {
        if (!path || !path.length) {
          return null;
        }
        path = path.trim();
        if (path[0] !== "M" && path[0] !== "m") {
          path = "M 0 0" + path;
        }
        path = path.replace(/(\d+)\s*(m|$)/gi, "$1z$2");
        var segments = [];
        var cmd;
        var relative = false;
        var lastIndex;
        var args;
        for (var i = 0, l = path.length; i < l; i++) {
          var c = path[i].toUpperCase();
          var r = c !== path[i];
          switch (c) {
            case "M":
              if (i === 0) {
                cmd = c;
                lastIndex = 1;
                break;
              }
            // eslint-disable-next-line no-fallthrough
            case "Q":
            case "T":
            case "C":
            case "S":
            case "H":
            case "V":
            case "L":
            case "A":
            case "Z":
              if (cmd === "Z") {
                segments.push({
                  cmd: "Z"
                });
              } else {
                args = path.slice(lastIndex, i);
                segments.push({
                  cmd,
                  relative,
                  args: (0, _parseParams.default)(args)
                });
              }
              cmd = c;
              relative = r;
              lastIndex = i + 1;
              break;
          }
        }
        segments.push({
          cmd: "Z"
        });
        return segments2Contours(segments);
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/path/circle.js
  var require_circle = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/path/circle.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = [{
        x: 582,
        y: 0
      }, {
        x: 758,
        y: 75
      }, {
        x: 890,
        y: 208
      }, {
        x: 965,
        y: 384
      }, {
        x: 965,
        y: 583
      }, {
        x: 890,
        y: 760
      }, {
        x: 758,
        y: 891
      }, {
        x: 582,
        y: 966
      }, {
        x: 383,
        y: 966
      }, {
        x: 207,
        y: 891
      }, {
        x: 75,
        y: 760
      }, {
        x: 0,
        y: 583
      }, {
        x: 0,
        y: 384
      }, {
        x: 75,
        y: 208
      }, {
        x: 207,
        y: 75
      }, {
        x: 383,
        y: 0
      }];
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/oval2contour.js
  var require_oval2contour = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/oval2contour.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = oval2contour;
      var _computeBoundingBox = require_computeBoundingBox();
      var _pathAdjust = _interopRequireDefault(require_pathAdjust());
      var _circle = _interopRequireDefault(require_circle());
      var _lang = require_lang();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function oval2contour(cx, cy, rx, ry) {
        if (void 0 === ry) {
          ry = rx;
        }
        var bound = (0, _computeBoundingBox.computePath)(_circle.default);
        var scaleX = +rx * 2 / bound.width;
        var scaleY = +ry * 2 / bound.height;
        var centerX = bound.width * scaleX / 2;
        var centerY = bound.height * scaleY / 2;
        var contour = (0, _lang.clone)(_circle.default);
        (0, _pathAdjust.default)(contour, scaleX, scaleY);
        (0, _pathAdjust.default)(contour, 1, 1, +cx - centerX, +cy - centerY);
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/polygon2contour.js
  var require_polygon2contour = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/polygon2contour.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = polygon2contour;
      var _parseParams = _interopRequireDefault(require_parseParams());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function polygon2contour(points) {
        if (!points || !points.length) {
          return null;
        }
        var contours = [];
        var segments = (0, _parseParams.default)(points);
        for (var i = 0, l = segments.length; i < l; i += 2) {
          contours.push({
            x: segments[i],
            y: segments[i + 1],
            onCurve: true
          });
        }
        return contours;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/rect2contour.js
  var require_rect2contour = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/rect2contour.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = rect2contour;
      function rect2contour(x, y, width, height) {
        x = +x;
        y = +y;
        width = +width;
        height = +height;
        return [{
          x,
          y,
          onCurve: true
        }, {
          x: x + width,
          y,
          onCurve: true
        }, {
          x: x + width,
          y: y + height,
          onCurve: true
        }, {
          x,
          y: y + height,
          onCurve: true
        }];
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/parseTransform.js
  var require_parseTransform = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/parseTransform.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parseTransform;
      var _parseParams = _interopRequireDefault(require_parseParams());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TRANSFORM_REGEX = /(\w+)\s*\(([\d-.,\s]*)\)/g;
      function parseTransform(str) {
        if (!str) {
          return false;
        }
        TRANSFORM_REGEX.lastIndex = 0;
        var transforms = [];
        var match;
        while (match = TRANSFORM_REGEX.exec(str)) {
          transforms.push({
            name: match[1],
            params: (0, _parseParams.default)(match[2])
          });
        }
        return transforms;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/matrix.js
  var require_matrix = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/matrix.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.mul = mul;
      exports.multiply = multiply;
      function mul() {
        var matrix1 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [1, 0, 0, 1];
        var matrix2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [1, 0, 0, 1];
        if (matrix1.length === 4) {
          return [matrix1[0] * matrix2[0] + matrix1[2] * matrix2[1], matrix1[1] * matrix2[0] + matrix1[3] * matrix2[1], matrix1[0] * matrix2[2] + matrix1[2] * matrix2[3], matrix1[1] * matrix2[2] + matrix1[3] * matrix2[3]];
        }
        return [matrix1[0] * matrix2[0] + matrix1[2] * matrix2[1], matrix1[1] * matrix2[0] + matrix1[3] * matrix2[1], matrix1[0] * matrix2[2] + matrix1[2] * matrix2[3], matrix1[1] * matrix2[2] + matrix1[3] * matrix2[3], matrix1[0] * matrix2[4] + matrix1[2] * matrix2[5] + matrix1[4], matrix1[1] * matrix2[4] + matrix1[3] * matrix2[5] + matrix1[5]];
      }
      function multiply() {
        var result = arguments.length <= 0 ? void 0 : arguments[0];
        for (var i = 1, matrix; matrix = i < 0 || arguments.length <= i ? void 0 : arguments[i]; i++) {
          result = mul(result, matrix);
        }
        return result;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/contoursTransform.js
  var require_contoursTransform = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/contoursTransform.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = contoursTransform;
      var _matrix = require_matrix();
      var _pathTransform = _interopRequireDefault(require_pathTransform());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function contoursTransform(contours, transforms) {
        if (!contours || !contours.length || !transforms || !transforms.length) {
          return contours;
        }
        var matrix = [1, 0, 0, 1, 0, 0];
        for (var i = 0, l = transforms.length; i < l; i++) {
          var transform = transforms[i];
          var params = transform.params;
          var radian = null;
          switch (transform.name) {
            case "translate":
              matrix = (0, _matrix.mul)(matrix, [1, 0, 0, 1, params[0], params[1]]);
              break;
            case "scale":
              matrix = (0, _matrix.mul)(matrix, [params[0], 0, 0, params[1], 0, 0]);
              break;
            case "matrix":
              matrix = (0, _matrix.mul)(matrix, [params[0], params[1], params[2], params[3], params[4], params[5]]);
              break;
            case "rotate":
              radian = params[0] * Math.PI / 180;
              if (params.length > 1) {
                matrix = (0, _matrix.multiply)(matrix, [1, 0, 0, 1, -params[1], -params[2]], [Math.cos(radian), Math.sin(radian), -Math.sin(radian), Math.cos(radian), 0, 0], [1, 0, 0, 1, params[1], params[2]]);
              } else {
                matrix = (0, _matrix.mul)(matrix, [Math.cos(radian), Math.sin(radian), -Math.sin(radian), Math.cos(radian), 0, 0]);
              }
              break;
            case "skewX":
              matrix = (0, _matrix.mul)(matrix, [1, 0, Math.tan(params[0] * Math.PI / 180), 1, 0, 0]);
              break;
            case "skewY":
              matrix = (0, _matrix.mul)(matrix, [1, Math.tan(params[0] * Math.PI / 180), 0, 1, 0, 0]);
              break;
          }
        }
        contours.forEach(function(p) {
          (0, _pathTransform.default)(p, matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
        });
        return contours;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg/svgnode2contours.js
  var require_svgnode2contours = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg/svgnode2contours.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = svgnode2contours;
      var _path2contours = _interopRequireDefault(require_path2contours());
      var _oval2contour = _interopRequireDefault(require_oval2contour());
      var _polygon2contour = _interopRequireDefault(require_polygon2contour());
      var _rect2contour = _interopRequireDefault(require_rect2contour());
      var _parseTransform = _interopRequireDefault(require_parseTransform());
      var _contoursTransform = _interopRequireDefault(require_contoursTransform());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var support = {
        path: {
          parse: _path2contours.default,
          // 解析器
          params: ["d"],
          // 参数列表
          contours: true
          // 是否是多个轮廓
        },
        circle: {
          parse: _oval2contour.default,
          params: ["cx", "cy", "r"]
        },
        ellipse: {
          parse: _oval2contour.default,
          params: ["cx", "cy", "rx", "ry"]
        },
        rect: {
          parse: _rect2contour.default,
          params: ["x", "y", "width", "height"]
        },
        polygon: {
          parse: _polygon2contour.default,
          params: ["points"]
        },
        polyline: {
          parse: _polygon2contour.default,
          params: ["points"]
        }
      };
      function svgnode2contours(xmlNodes) {
        var i;
        var length;
        var j;
        var jlength;
        var segment;
        var parsedSegments = [];
        if (xmlNodes.length) {
          var _loop = function _loop2() {
            var node = xmlNodes[i];
            var name2 = node.tagName;
            if (support[name2]) {
              var supportParams = support[name2].params;
              var params = [];
              for (j = 0, jlength = supportParams.length; j < jlength; j++) {
                params.push(node.getAttribute(supportParams[j]));
              }
              segment = {
                name: name2,
                params,
                transform: (0, _parseTransform.default)(node.getAttribute("transform"))
              };
              if (node.parentNode) {
                var curNode = node.parentNode;
                var transforms = segment.transform || [];
                var transAttr;
                var iterator = function iterator2(t) {
                  transforms.unshift(t);
                };
                while (curNode !== null && curNode.tagName !== "svg") {
                  transAttr = curNode.getAttribute("transform");
                  if (transAttr) {
                    (0, _parseTransform.default)(transAttr).reverse().forEach(iterator);
                  }
                  curNode = curNode.parentNode;
                }
                segment.transform = transforms.length ? transforms : null;
              }
              parsedSegments.push(segment);
            }
          };
          for (i = 0, length = xmlNodes.length; i < length; i++) {
            _loop();
          }
        }
        if (parsedSegments.length) {
          var result = [];
          for (i = 0, length = parsedSegments.length; i < length; i++) {
            segment = parsedSegments[i];
            var parser = support[segment.name];
            var contour = parser.parse.apply(null, segment.params);
            if (contour && contour.length) {
              var contours = parser.contours ? contour : [contour];
              if (segment.transform) {
                contours = (0, _contoursTransform.default)(contours, segment.transform);
              }
              for (j = 0, jlength = contours.length; j < jlength; j++) {
                result.push(contours[j]);
              }
            }
          }
          return result;
        }
        return false;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathRotate.js
  var require_pathRotate = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathRotate.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = pathRotate;
      function pathRotate(contour, angle, centerX, centerY) {
        angle = angle === void 0 ? 0 : angle;
        var x = centerX || 0;
        var y = centerY || 0;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var px;
        var py;
        var p;
        for (var i = 0, l = contour.length; i < l; i++) {
          p = contour[i];
          px = cos * (p.x - x) - sin * (p.y - y);
          py = cos * (p.y - y) + sin * (p.x - x);
          p.x = px + x;
          p.y = py + y;
        }
        return contour;
      }
    }
  });

  // node_modules/fonteditor-core/lib/graphics/pathsUtil.js
  var require_pathsUtil = __commonJS({
    "node_modules/fonteditor-core/lib/graphics/pathsUtil.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _computeBoundingBox = require_computeBoundingBox();
      var _pathAdjust = _interopRequireDefault(require_pathAdjust());
      var _pathRotate = _interopRequireDefault(require_pathRotate());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function mirrorPaths(paths, xScale, yScale) {
        var _computePath = _computeBoundingBox.computePath.apply(void 0, _toConsumableArray(paths)), x = _computePath.x, y = _computePath.y, width = _computePath.width, height = _computePath.height;
        if (xScale === -1) {
          paths.forEach(function(p) {
            (0, _pathAdjust.default)(p, -1, 1, -x, 0);
            (0, _pathAdjust.default)(p, 1, 1, x + width, 0);
            p.reverse();
          });
        }
        if (yScale === -1) {
          paths.forEach(function(p) {
            (0, _pathAdjust.default)(p, 1, -1, 0, -y);
            (0, _pathAdjust.default)(p, 1, 1, 0, y + height);
            p.reverse();
          });
        }
        return paths;
      }
      var _default = exports.default = {
        /**
         * 旋转路径
         *
         * @param {Array} paths 路径数组
         * @param {number} angle 弧度
         * @return {Array} 变换后的路径
         */
        rotate: function rotate(paths, angle) {
          if (!angle) {
            return paths;
          }
          var bound = _computeBoundingBox.computePath.apply(void 0, _toConsumableArray(paths));
          var cx = bound.x + bound.width / 2;
          var cy = bound.y + bound.height / 2;
          paths.forEach(function(p) {
            (0, _pathRotate.default)(p, angle, cx, cy);
          });
          return paths;
        },
        /**
         * 路径组变换
         *
         * @param {Array} paths 路径数组
         * @param {number} x x 方向缩放
         * @param {number} y y 方向缩放
         * @return {Array} 变换后的路径
         */
        move: function move(paths, x, y) {
          var bound = _computeBoundingBox.computePath.apply(void 0, _toConsumableArray(paths));
          paths.forEach(function(path) {
            (0, _pathAdjust.default)(path, 1, 1, x - bound.x, y - bound.y);
          });
          return paths;
        },
        mirror: function mirror(paths) {
          return mirrorPaths(paths, -1, 1);
        },
        flip: function flip(paths) {
          return mirrorPaths(paths, 1, -1);
        }
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg2ttfobject.js
  var require_svg2ttfobject = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg2ttfobject.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = svg2ttfObject;
      var _string = _interopRequireDefault(require_string2());
      var _DOMParser = _interopRequireDefault(require_DOMParser());
      var _path2contours = _interopRequireDefault(require_path2contours());
      var _svgnode2contours = _interopRequireDefault(require_svgnode2contours());
      var _computeBoundingBox = require_computeBoundingBox();
      var _pathsUtil = _interopRequireDefault(require_pathsUtil());
      var _glyfAdjust = _interopRequireDefault(require_glyfAdjust());
      var _error = _interopRequireDefault(require_error());
      var _getEmptyttfObject = _interopRequireDefault(require_getEmptyttfObject());
      var _reduceGlyf = _interopRequireDefault(require_reduceGlyf());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function loadXML(xml) {
        if (_DOMParser.default) {
          try {
            var domParser = new _DOMParser.default();
            var xmlDoc = domParser.parseFromString(xml, "text/xml");
            return xmlDoc;
          } catch (exp) {
            _error.default.raise(10103);
          }
        }
        _error.default.raise(10004);
      }
      function resolveSVG(svg) {
        svg = svg.replace(/\s+xmlns(?::[\w-]+)?=("|')[^"']*\1/g, " ").replace(/<defs[>\s][\s\S]+?\/defs>/g, function(text) {
          if (text.indexOf("</font>") >= 0) {
            return text;
          }
          return "";
        }).replace(/<use[>\s][\s\S]+?\/use>/g, "");
        return svg;
      }
      function getEmptyTTF() {
        var ttf = (0, _getEmptyttfObject.default)();
        ttf.head.unitsPerEm = 0;
        ttf.from = "svgfont";
        return ttf;
      }
      function getEmptyObject() {
        return {
          "from": "svg",
          "OS/2": {},
          "name": {},
          "hhea": {},
          "head": {},
          "post": {},
          "glyf": []
        };
      }
      function getUnitsPerEm(xMin, xMax, yMin, yMax) {
        var seed = Math.ceil(Math.min(yMax - yMin, xMax - xMin));
        if (!seed) {
          return 1024;
        }
        if (seed <= 128) {
          return seed;
        }
        var unitsPerEm = 128;
        while (unitsPerEm < 16384) {
          if (seed <= 1.2 * unitsPerEm) {
            return unitsPerEm;
          }
          unitsPerEm <<= 1;
        }
        return 1024;
      }
      function resolve(ttf) {
        if (ttf.from === "svgfont" && ttf.head.unitsPerEm > 128) {
          ttf.glyf.forEach(function(g) {
            if (g.contours) {
              (0, _glyfAdjust.default)(g);
              (0, _reduceGlyf.default)(g);
            }
          });
        } else {
          var xMin = 16384;
          var xMax = -16384;
          var yMin = 16384;
          var yMax = -16384;
          ttf.glyf.forEach(function(g) {
            if (g.contours) {
              var bound = _computeBoundingBox.computePathBox.apply(void 0, _toConsumableArray(g.contours));
              if (bound) {
                xMin = Math.min(xMin, bound.x);
                xMax = Math.max(xMax, bound.x + bound.width);
                yMin = Math.min(yMin, bound.y);
                yMax = Math.max(yMax, bound.y + bound.height);
              }
            }
          });
          var unitsPerEm = getUnitsPerEm(xMin, xMax, yMin, yMax);
          var scale = 1024 / unitsPerEm;
          ttf.glyf.forEach(function(g) {
            (0, _glyfAdjust.default)(g, scale, scale);
            (0, _reduceGlyf.default)(g);
          });
          ttf.head.unitsPerEm = 1024;
        }
        return ttf;
      }
      function parseFont(xmlDoc, ttf) {
        var metaNode = xmlDoc.getElementsByTagName("metadata")[0];
        var fontNode = xmlDoc.getElementsByTagName("font")[0];
        var fontFaceNode = xmlDoc.getElementsByTagName("font-face")[0];
        if (metaNode && metaNode.textContent) {
          ttf.metadata = _string.default.decodeHTML(metaNode.textContent.trim());
        }
        if (fontNode) {
          ttf.id = fontNode.getAttribute("id") || "";
          ttf.hhea.advanceWidthMax = +(fontNode.getAttribute("horiz-adv-x") || 0);
          ttf.from = "svgfont";
        }
        if (fontFaceNode) {
          var OS2 = ttf["OS/2"];
          ttf.name.fontFamily = fontFaceNode.getAttribute("font-family") || "";
          OS2.usWeightClass = +(fontFaceNode.getAttribute("font-weight") || 0);
          ttf.head.unitsPerEm = +(fontFaceNode.getAttribute("units-per-em") || 0);
          var panose = (fontFaceNode.getAttribute("panose-1") || "").split(" ");
          ["bFamilyType", "bSerifStyle", "bWeight", "bProportion", "bContrast", "bStrokeVariation", "bArmStyle", "bLetterform", "bMidline", "bXHeight"].forEach(function(name2, i) {
            OS2[name2] = +(panose[i] || 0);
          });
          ttf.hhea.ascent = +(fontFaceNode.getAttribute("ascent") || 0);
          ttf.hhea.descent = +(fontFaceNode.getAttribute("descent") || 0);
          OS2.bXHeight = +(fontFaceNode.getAttribute("x-height") || 0);
          var box = (fontFaceNode.getAttribute("bbox") || "").split(" ");
          ["xMin", "yMin", "xMax", "yMax"].forEach(function(name2, i) {
            ttf.head[name2] = +(box[i] || "");
          });
          ttf.post.underlineThickness = +(fontFaceNode.getAttribute("underline-thickness") || 0);
          ttf.post.underlinePosition = +(fontFaceNode.getAttribute("underline-position") || 0);
          var unicodeRange = fontFaceNode.getAttribute("unicode-range");
          if (unicodeRange) {
            unicodeRange.replace(/u\+([0-9A-Z]+)(-[0-9A-Z]+)?/i, function($0, a, b) {
              OS2.usFirstCharIndex = Number("0x" + a);
              OS2.usLastCharIndex = b ? Number("0x" + b.slice(1)) : 4294967295;
            });
          }
        }
        return ttf;
      }
      function parseGlyf(xmlDoc, ttf) {
        var missingNode = xmlDoc.getElementsByTagName("missing-glyph")[0];
        var d;
        var unicode;
        if (missingNode) {
          var missing = {
            name: ".notdef"
          };
          if (missingNode.getAttribute("horiz-adv-x")) {
            missing.advanceWidth = +missingNode.getAttribute("horiz-adv-x");
          }
          if (d = missingNode.getAttribute("d")) {
            missing.contours = (0, _path2contours.default)(d);
          }
          if (ttf.glyf[0] && ttf.glyf[0].name === ".notdef") {
            ttf.glyf.splice(0, 1);
          }
          ttf.glyf.unshift(missing);
        }
        var glyfNodes = xmlDoc.getElementsByTagName("glyph");
        if (glyfNodes.length) {
          for (var i = 0, l = glyfNodes.length; i < l; i++) {
            var node = glyfNodes[i];
            var glyf = {
              name: node.getAttribute("glyph-name") || node.getAttribute("name") || ""
            };
            if (node.getAttribute("horiz-adv-x")) {
              glyf.advanceWidth = +node.getAttribute("horiz-adv-x");
            }
            if (unicode = node.getAttribute("unicode")) {
              var nextUnicode = [];
              var totalCodePoints = 0;
              for (var ui = 0; ui < unicode.length; ui++) {
                var ucp = unicode.codePointAt(ui);
                nextUnicode.push(ucp);
                ui = ucp > 65535 ? ui + 1 : ui;
                totalCodePoints += 1;
              }
              if (totalCodePoints === 1) {
                glyf.unicode = nextUnicode;
                if (d = node.getAttribute("d")) {
                  glyf.contours = (0, _path2contours.default)(d);
                }
                ttf.glyf.push(glyf);
              }
            }
          }
        }
        return ttf;
      }
      function parsePath(xmlDoc, ttf) {
        var contours;
        var glyf;
        var node;
        var pathNodes = xmlDoc.getElementsByTagName("path");
        if (pathNodes.length) {
          for (var i = 0, l = pathNodes.length; i < l; i++) {
            node = pathNodes[i];
            glyf = {
              name: node.getAttribute("name") || ""
            };
            contours = (0, _svgnode2contours.default)([node]);
            glyf.contours = contours;
            ttf.glyf.push(glyf);
          }
        }
        contours = (0, _svgnode2contours.default)(Array.prototype.slice.call(xmlDoc.getElementsByTagName("*")).filter(function(node2) {
          return node2.tagName !== "path";
        }));
        if (contours) {
          glyf = {
            name: ""
          };
          glyf.contours = contours;
          ttf.glyf.push(glyf);
        }
      }
      function parseXML(xmlDoc, options) {
        if (!xmlDoc.getElementsByTagName("svg").length) {
          _error.default.raise(10106);
        }
        var ttf;
        if (xmlDoc.getElementsByTagName("font")[0]) {
          ttf = getEmptyTTF();
          parseFont(xmlDoc, ttf);
          parseGlyf(xmlDoc, ttf);
        } else {
          ttf = getEmptyObject();
          parsePath(xmlDoc, ttf);
        }
        if (!ttf.glyf.length) {
          _error.default.raise(10201);
        }
        if (ttf.from === "svg") {
          var glyf = ttf.glyf;
          var i;
          var l;
          if (options.combinePath) {
            var combined = [];
            for (i = 0, l = glyf.length; i < l; i++) {
              var contours = glyf[i].contours;
              for (var index = 0, length = contours.length; index < length; index++) {
                combined.push(contours[index]);
              }
            }
            glyf[0].contours = combined;
            glyf.splice(1);
          }
          for (i = 0, l = glyf.length; i < l; i++) {
            glyf[i].contours = _pathsUtil.default.flip(glyf[i].contours);
          }
        }
        return ttf;
      }
      function svg2ttfObject(svg) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
          combinePath: false
        };
        var xmlDoc = svg;
        if (typeof svg === "string") {
          svg = resolveSVG(svg);
          xmlDoc = loadXML(svg);
        }
        var ttf = parseXML(xmlDoc, options);
        return resolve(ttf);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/loca.js
  var require_loca = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/loca.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("loca", [], {
        read: function read2(reader, ttf) {
          var offset = this.offset;
          var indexToLocFormat = ttf.head.indexToLocFormat;
          var type = _struct.default.names[indexToLocFormat === 0 ? _struct.default.Uint16 : _struct.default.Uint32];
          var size = indexToLocFormat === 0 ? 2 : 4;
          var sizeRatio = indexToLocFormat === 0 ? 2 : 1;
          var wordOffset = [];
          reader.seek(offset);
          var numGlyphs = ttf.maxp.numGlyphs;
          for (var i = 0; i < numGlyphs; ++i) {
            wordOffset.push(reader.read(type, offset, false) * sizeRatio);
            offset += size;
          }
          return wordOffset;
        },
        write: function write(writer, ttf) {
          var glyfSupport = ttf.support.glyf;
          var offset = ttf.support.glyf.offset || 0;
          var indexToLocFormat = ttf.head.indexToLocFormat;
          var sizeRatio = indexToLocFormat === 0 ? 0.5 : 1;
          var numGlyphs = ttf.glyf.length;
          for (var i = 0; i < numGlyphs; ++i) {
            if (indexToLocFormat) {
              writer.writeUint32(offset);
            } else {
              writer.writeUint16(offset);
            }
            offset += glyfSupport[i].size * sizeRatio;
          }
          if (indexToLocFormat) {
            writer.writeUint32(offset);
          } else {
            writer.writeUint16(offset);
          }
          return writer;
        },
        size: function size(ttf) {
          var locaCount = ttf.glyf.length + 1;
          return ttf.head.indexToLocFormat ? locaCount * 4 : locaCount * 2;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/glyFlag.js
  var require_glyFlag = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/glyFlag.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        ONCURVE: 1,
        // on curve ,off curve
        XSHORT: 2,
        // x-Short Vector
        YSHORT: 4,
        // y-Short Vector
        REPEAT: 8,
        // next byte is flag repeat count
        XSAME: 16,
        // This x is same (Positive x-Short vector)
        YSAME: 32,
        // This y is same (Positive y-Short vector)
        Reserved1: 64,
        Reserved2: 128
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/enum/componentFlag.js
  var require_componentFlag = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/enum/componentFlag.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = exports.default = {
        ARG_1_AND_2_ARE_WORDS: 1,
        ARGS_ARE_XY_VALUES: 2,
        ROUND_XY_TO_GRID: 4,
        WE_HAVE_A_SCALE: 8,
        RESERVED: 16,
        MORE_COMPONENTS: 32,
        WE_HAVE_AN_X_AND_Y_SCALE: 64,
        WE_HAVE_A_TWO_BY_TWO: 128,
        WE_HAVE_INSTRUCTIONS: 256,
        USE_MY_METRICS: 512,
        OVERLAP_COMPOUND: 1024,
        SCALED_COMPONENT_OFFSET: 2048,
        UNSCALED_COMPONENT_OFFSET: 4096
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/glyf/parse.js
  var require_parse2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/glyf/parse.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = parseGlyf;
      var _glyFlag = _interopRequireDefault(require_glyFlag());
      var _componentFlag = _interopRequireDefault(require_componentFlag());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var MAX_INSTRUCTION_LENGTH = 5e3;
      var MAX_NUMBER_OF_COORDINATES = 2e4;
      function parseSimpleGlyf(reader, glyf) {
        var offset = reader.offset;
        var numberOfCoordinates = glyf.endPtsOfContours[glyf.endPtsOfContours.length - 1] + 1;
        if (numberOfCoordinates > MAX_NUMBER_OF_COORDINATES) {
          console.warn("error read glyf coordinates:" + offset);
          return glyf;
        }
        var i;
        var length;
        var flags = [];
        var flag;
        i = 0;
        while (i < numberOfCoordinates) {
          flag = reader.readUint8();
          flags.push(flag);
          i++;
          if (flag & _glyFlag.default.REPEAT && i < numberOfCoordinates) {
            var repeat = reader.readUint8();
            for (var j = 0; j < repeat; j++) {
              flags.push(flag);
              i++;
            }
          }
        }
        var coordinates = [];
        var xCoordinates = [];
        var prevX = 0;
        var x;
        for (i = 0, length = flags.length; i < length; ++i) {
          x = 0;
          flag = flags[i];
          if (flag & _glyFlag.default.XSHORT) {
            x = reader.readUint8();
            x = flag & _glyFlag.default.XSAME ? x : -1 * x;
          } else if (flag & _glyFlag.default.XSAME) {
            x = 0;
          } else {
            x = reader.readInt16();
          }
          prevX += x;
          xCoordinates[i] = prevX;
          coordinates[i] = {
            x: prevX,
            y: 0
          };
          if (flag & _glyFlag.default.ONCURVE) {
            coordinates[i].onCurve = true;
          }
        }
        var yCoordinates = [];
        var prevY = 0;
        var y;
        for (i = 0, length = flags.length; i < length; i++) {
          y = 0;
          flag = flags[i];
          if (flag & _glyFlag.default.YSHORT) {
            y = reader.readUint8();
            y = flag & _glyFlag.default.YSAME ? y : -1 * y;
          } else if (flag & _glyFlag.default.YSAME) {
            y = 0;
          } else {
            y = reader.readInt16();
          }
          prevY += y;
          yCoordinates[i] = prevY;
          if (coordinates[i]) {
            coordinates[i].y = prevY;
          }
        }
        if (coordinates.length) {
          var endPtsOfContours = glyf.endPtsOfContours;
          var contours = [];
          contours.push(coordinates.slice(0, endPtsOfContours[0] + 1));
          for (i = 1, length = endPtsOfContours.length; i < length; i++) {
            contours.push(coordinates.slice(endPtsOfContours[i - 1] + 1, endPtsOfContours[i] + 1));
          }
          glyf.contours = contours;
        }
        return glyf;
      }
      function parseCompoundGlyf(reader, glyf) {
        glyf.compound = true;
        glyf.glyfs = [];
        var flags;
        var g;
        do {
          flags = reader.readUint16();
          g = {};
          g.flags = flags;
          g.glyphIndex = reader.readUint16();
          var arg1 = 0;
          var arg2 = 0;
          var scaleX = 16384;
          var scaleY = 16384;
          var scale01 = 0;
          var scale10 = 0;
          if (_componentFlag.default.ARG_1_AND_2_ARE_WORDS & flags) {
            arg1 = reader.readInt16();
            arg2 = reader.readInt16();
          } else {
            arg1 = reader.readInt8();
            arg2 = reader.readInt8();
          }
          if (_componentFlag.default.ROUND_XY_TO_GRID & flags) {
            arg1 = Math.round(arg1);
            arg2 = Math.round(arg2);
          }
          if (_componentFlag.default.WE_HAVE_A_SCALE & flags) {
            scaleX = reader.readInt16();
            scaleY = scaleX;
          } else if (_componentFlag.default.WE_HAVE_AN_X_AND_Y_SCALE & flags) {
            scaleX = reader.readInt16();
            scaleY = reader.readInt16();
          } else if (_componentFlag.default.WE_HAVE_A_TWO_BY_TWO & flags) {
            scaleX = reader.readInt16();
            scale01 = reader.readInt16();
            scale10 = reader.readInt16();
            scaleY = reader.readInt16();
          }
          if (_componentFlag.default.ARGS_ARE_XY_VALUES & flags) {
            g.useMyMetrics = !!flags & _componentFlag.default.USE_MY_METRICS;
            g.overlapCompound = !!flags & _componentFlag.default.OVERLAP_COMPOUND;
            g.transform = {
              a: Math.round(1e4 * scaleX / 16384) / 1e4,
              b: Math.round(1e4 * scale01 / 16384) / 1e4,
              c: Math.round(1e4 * scale10 / 16384) / 1e4,
              d: Math.round(1e4 * scaleY / 16384) / 1e4,
              e: arg1,
              f: arg2
            };
          } else {
            g.points = [arg1, arg2];
            g.transform = {
              a: Math.round(1e4 * scaleX / 16384) / 1e4,
              b: Math.round(1e4 * scale01 / 16384) / 1e4,
              c: Math.round(1e4 * scale10 / 16384) / 1e4,
              d: Math.round(1e4 * scaleY / 16384) / 1e4,
              e: 0,
              f: 0
            };
          }
          glyf.glyfs.push(g);
        } while (_componentFlag.default.MORE_COMPONENTS & flags);
        if (_componentFlag.default.WE_HAVE_INSTRUCTIONS & flags) {
          var length = reader.readUint16();
          if (length < MAX_INSTRUCTION_LENGTH) {
            var instructions = [];
            for (var i = 0; i < length; ++i) {
              instructions.push(reader.readUint8());
            }
            glyf.instructions = instructions;
          } else {
            console.warn(length);
          }
        }
        return glyf;
      }
      function parseGlyf(reader, ttf, offset) {
        if (null != offset) {
          reader.seek(offset);
        }
        var glyf = {};
        var i;
        var length;
        var instructions;
        var numberOfContours = reader.readInt16();
        glyf.xMin = reader.readInt16();
        glyf.yMin = reader.readInt16();
        glyf.xMax = reader.readInt16();
        glyf.yMax = reader.readInt16();
        if (numberOfContours >= 0) {
          glyf.endPtsOfContours = [];
          if (numberOfContours > 0) {
            for (i = 0; i < numberOfContours; i++) {
              glyf.endPtsOfContours.push(reader.readUint16());
            }
          } else {
            delete glyf.xMin;
            delete glyf.yMin;
            delete glyf.xMax;
            delete glyf.yMax;
          }
          length = reader.readUint16();
          if (length) {
            if (length < MAX_INSTRUCTION_LENGTH) {
              instructions = [];
              for (i = 0; i < length; ++i) {
                instructions.push(reader.readUint8());
              }
              glyf.instructions = instructions;
            } else {
              console.warn(length);
            }
          }
          parseSimpleGlyf(reader, glyf);
          delete glyf.endPtsOfContours;
        } else {
          parseCompoundGlyf(reader, glyf);
        }
        return glyf;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/glyf/write.js
  var require_write2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/glyf/write.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = write;
      var _componentFlag = _interopRequireDefault(require_componentFlag());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function write(writer, ttf) {
        var hinting = ttf.writeOptions ? ttf.writeOptions.hinting : false;
        var writeZeroContoursGlyfData = ttf.writeOptions ? ttf.writeOptions.writeZeroContoursGlyfData : false;
        ttf.glyf.forEach(function(glyf, index) {
          if (!glyf.compound && !writeZeroContoursGlyfData && (!glyf.contours || !glyf.contours.length)) {
            return;
          }
          writer.writeInt16(glyf.compound ? -1 : (glyf.contours || []).length);
          writer.writeInt16(glyf.xMin);
          writer.writeInt16(glyf.yMin);
          writer.writeInt16(glyf.xMax);
          writer.writeInt16(glyf.yMax);
          var i;
          var l;
          var flags;
          if (glyf.compound) {
            for (i = 0, l = glyf.glyfs.length; i < l; i++) {
              var g = glyf.glyfs[i];
              flags = g.points ? 0 : _componentFlag.default.ARGS_ARE_XY_VALUES + _componentFlag.default.ROUND_XY_TO_GRID;
              if (i < l - 1) {
                flags += _componentFlag.default.MORE_COMPONENTS;
              }
              flags += g.useMyMetrics ? _componentFlag.default.USE_MY_METRICS : 0;
              flags += g.overlapCompound ? _componentFlag.default.OVERLAP_COMPOUND : 0;
              var transform = g.transform;
              var a = transform.a;
              var b = transform.b;
              var c = transform.c;
              var d = transform.d;
              var e = g.points ? g.points[0] : transform.e;
              var f = g.points ? g.points[1] : transform.f;
              if (e < 0 || e > 127 || f < 0 || f > 127) {
                flags += _componentFlag.default.ARG_1_AND_2_ARE_WORDS;
              }
              if (b || c) {
                flags += _componentFlag.default.WE_HAVE_A_TWO_BY_TWO;
              } else if ((a !== 1 || d !== 1) && a === d) {
                flags += _componentFlag.default.WE_HAVE_A_SCALE;
              } else if (a !== 1 || d !== 1) {
                flags += _componentFlag.default.WE_HAVE_AN_X_AND_Y_SCALE;
              }
              writer.writeUint16(flags);
              writer.writeUint16(g.glyphIndex);
              if (_componentFlag.default.ARG_1_AND_2_ARE_WORDS & flags) {
                writer.writeInt16(e);
                writer.writeInt16(f);
              } else {
                writer.writeUint8(e);
                writer.writeUint8(f);
              }
              if (_componentFlag.default.WE_HAVE_A_SCALE & flags) {
                writer.writeInt16(Math.round(a * 16384));
              } else if (_componentFlag.default.WE_HAVE_AN_X_AND_Y_SCALE & flags) {
                writer.writeInt16(Math.round(a * 16384));
                writer.writeInt16(Math.round(d * 16384));
              } else if (_componentFlag.default.WE_HAVE_A_TWO_BY_TWO & flags) {
                writer.writeInt16(Math.round(a * 16384));
                writer.writeInt16(Math.round(b * 16384));
                writer.writeInt16(Math.round(c * 16384));
                writer.writeInt16(Math.round(d * 16384));
              }
            }
          } else {
            var endPtsOfContours = -1;
            (glyf.contours || []).forEach(function(contour) {
              endPtsOfContours += contour.length;
              writer.writeUint16(endPtsOfContours);
            });
            if (hinting && glyf.instructions) {
              var instructions = glyf.instructions;
              writer.writeUint16(instructions.length);
              for (i = 0, l = instructions.length; i < l; i++) {
                writer.writeUint8(instructions[i]);
              }
            } else {
              writer.writeUint16(0);
            }
            flags = ttf.support.glyf[index].flags || [];
            for (i = 0, l = flags.length; i < l; i++) {
              writer.writeUint8(flags[i]);
            }
            var xCoord = ttf.support.glyf[index].xCoord || [];
            for (i = 0, l = xCoord.length; i < l; i++) {
              if (0 <= xCoord[i] && xCoord[i] <= 255) {
                writer.writeUint8(xCoord[i]);
              } else {
                writer.writeInt16(xCoord[i]);
              }
            }
            var yCoord = ttf.support.glyf[index].yCoord || [];
            for (i = 0, l = yCoord.length; i < l; i++) {
              if (0 <= yCoord[i] && yCoord[i] <= 255) {
                writer.writeUint8(yCoord[i]);
              } else {
                writer.writeInt16(yCoord[i]);
              }
            }
          }
          var glyfSize = ttf.support.glyf[index].glyfSize;
          if (glyfSize % 4) {
            writer.writeEmpty(4 - glyfSize % 4);
          }
        });
        return writer;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/glyf/sizeof.js
  var require_sizeof2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/glyf/sizeof.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = sizeof;
      var _glyFlag = _interopRequireDefault(require_glyFlag());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function sizeofSimple(glyf, glyfSupport, hinting, writeZeroContoursGlyfData) {
        if (!writeZeroContoursGlyfData && (!glyf.contours || !glyf.contours.length)) {
          return 0;
        }
        var result = 12 + (glyf.contours || []).length * 2 + (glyfSupport.flags || []).length;
        (glyfSupport.xCoord || []).forEach(function(x) {
          result += 0 <= x && x <= 255 ? 1 : 2;
        });
        (glyfSupport.yCoord || []).forEach(function(y) {
          result += 0 <= y && y <= 255 ? 1 : 2;
        });
        return result + (hinting && glyf.instructions ? glyf.instructions.length : 0);
      }
      function sizeofCompound(glyf, hinting) {
        var size = 10;
        var transform;
        glyf.glyfs.forEach(function(g) {
          transform = g.transform;
          size += 4;
          if (transform.e < 0 || transform.e > 127 || transform.f < 0 || transform.f > 127) {
            size += 4;
          } else {
            size += 2;
          }
          if (transform.b || transform.c) {
            size += 8;
          } else if (transform.a !== 1 || transform.d !== 1) {
            size += transform.a === transform.d ? 2 : 4;
          }
        });
        return size;
      }
      function getFlags(glyf, glyfSupport) {
        if (!glyf.contours || 0 === glyf.contours.length) {
          return glyfSupport;
        }
        var flags = [];
        var xCoord = [];
        var yCoord = [];
        var contours = glyf.contours;
        var contour;
        var prev;
        var first = true;
        for (var j = 0, cl = contours.length; j < cl; j++) {
          contour = contours[j];
          for (var i = 0, l = contour.length; i < l; i++) {
            var point = contour[i];
            if (first) {
              xCoord.push(point.x);
              yCoord.push(point.y);
              first = false;
            } else {
              xCoord.push(point.x - prev.x);
              yCoord.push(point.y - prev.y);
            }
            flags.push(point.onCurve ? _glyFlag.default.ONCURVE : 0);
            prev = point;
          }
        }
        var flagsC = [];
        var xCoordC = [];
        var yCoordC = [];
        var x;
        var y;
        var prevFlag;
        var repeatPoint = -1;
        flags.forEach(function(flag, index) {
          x = xCoord[index];
          y = yCoord[index];
          if (index === 0) {
            if (-255 <= x && x <= 255) {
              flag += _glyFlag.default.XSHORT;
              if (x >= 0) {
                flag += _glyFlag.default.XSAME;
              }
              x = Math.abs(x);
            }
            if (-255 <= y && y <= 255) {
              flag += _glyFlag.default.YSHORT;
              if (y >= 0) {
                flag += _glyFlag.default.YSAME;
              }
              y = Math.abs(y);
            }
            flagsC.push(prevFlag = flag);
            xCoordC.push(x);
            yCoordC.push(y);
          } else {
            if (x === 0) {
              flag += _glyFlag.default.XSAME;
            } else {
              if (-255 <= x && x <= 255) {
                flag += _glyFlag.default.XSHORT;
                if (x > 0) {
                  flag += _glyFlag.default.XSAME;
                }
                x = Math.abs(x);
              }
              xCoordC.push(x);
            }
            if (y === 0) {
              flag += _glyFlag.default.YSAME;
            } else {
              if (-255 <= y && y <= 255) {
                flag += _glyFlag.default.YSHORT;
                if (y > 0) {
                  flag += _glyFlag.default.YSAME;
                }
                y = Math.abs(y);
              }
              yCoordC.push(y);
            }
            if (flag === prevFlag) {
              if (-1 === repeatPoint) {
                repeatPoint = flagsC.length - 1;
                flagsC[repeatPoint] |= _glyFlag.default.REPEAT;
                flagsC.push(1);
              } else {
                ++flagsC[repeatPoint + 1];
              }
            } else {
              repeatPoint = -1;
              flagsC.push(prevFlag = flag);
            }
          }
        });
        glyfSupport.flags = flagsC;
        glyfSupport.xCoord = xCoordC;
        glyfSupport.yCoord = yCoordC;
        return glyfSupport;
      }
      function sizeof(ttf) {
        ttf.support.glyf = [];
        var tableSize = 0;
        var hinting = ttf.writeOptions ? ttf.writeOptions.hinting : false;
        var writeZeroContoursGlyfData = ttf.writeOptions ? ttf.writeOptions.writeZeroContoursGlyfData : false;
        ttf.glyf.forEach(function(glyf) {
          var glyfSupport = {};
          glyfSupport = glyf.compound ? glyfSupport : getFlags(glyf, glyfSupport);
          var glyfSize = glyf.compound ? sizeofCompound(glyf, hinting) : sizeofSimple(glyf, glyfSupport, hinting, writeZeroContoursGlyfData);
          var size = glyfSize;
          if (size % 4) {
            size += 4 - size % 4;
          }
          glyfSupport.glyfSize = glyfSize;
          glyfSupport.size = size;
          ttf.support.glyf.push(glyfSupport);
          tableSize += size;
        });
        ttf.support.glyf.tableSize = tableSize;
        ttf.head.indexToLocFormat = tableSize > 65536 ? 1 : 0;
        return ttf.support.glyf.tableSize;
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/glyf.js
  var require_glyf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/glyf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      var _parse = _interopRequireDefault(require_parse2());
      var _write = _interopRequireDefault(require_write2());
      var _sizeof = _interopRequireDefault(require_sizeof2());
      var _lang = require_lang();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("glyf", [], {
        read: function read2(reader, ttf) {
          var startOffset = this.offset;
          var loca = ttf.loca;
          var numGlyphs = ttf.maxp.numGlyphs;
          var glyphs = [];
          reader.seek(startOffset);
          var subset = ttf.readOptions.subset;
          if (subset && subset.length > 0) {
            var subsetMap = {
              0: true
              // 设置.notdef
            };
            subsetMap[0] = true;
            var cmap = ttf.cmap;
            Object.keys(cmap).forEach(function(c) {
              if (subset.indexOf(+c) > -1) {
                var _i = cmap[c];
                subsetMap[_i] = true;
              }
            });
            ttf.subsetMap = subsetMap;
            var parsedGlyfMap = {};
            var travelsParse = function travels(subsetMap2) {
              var newSubsetMap = {};
              Object.keys(subsetMap2).forEach(function(i2) {
                var index = +i2;
                parsedGlyfMap[index] = true;
                if (loca[index] === loca[index + 1]) {
                  glyphs[index] = {
                    contours: []
                  };
                } else {
                  glyphs[index] = (0, _parse.default)(reader, ttf, startOffset + loca[index]);
                }
                if (glyphs[index].compound) {
                  glyphs[index].glyfs.forEach(function(g) {
                    if (!parsedGlyfMap[g.glyphIndex]) {
                      newSubsetMap[g.glyphIndex] = true;
                    }
                  });
                }
              });
              if (!(0, _lang.isEmptyObject)(newSubsetMap)) {
                travels(newSubsetMap);
              }
            };
            travelsParse(subsetMap);
            return glyphs;
          }
          var i;
          var l;
          for (i = 0, l = numGlyphs - 1; i < l; i++) {
            if (loca[i] === loca[i + 1]) {
              glyphs[i] = {
                contours: []
              };
            } else {
              glyphs[i] = (0, _parse.default)(reader, ttf, startOffset + loca[i]);
            }
          }
          if (ttf.tables.glyf.length - loca[i] < 5) {
            glyphs[i] = {
              contours: []
            };
          } else {
            glyphs[i] = (0, _parse.default)(reader, ttf, startOffset + loca[i]);
          }
          return glyphs;
        },
        write: _write.default,
        size: _sizeof.default
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/fpgm.js
  var require_fpgm = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/fpgm.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("fpgm", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.fpgm.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.fpgm) {
            writer.writeBytes(ttf.fpgm, ttf.fpgm.length);
          }
        },
        size: function size(ttf) {
          return ttf.fpgm ? ttf.fpgm.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/cvt.js
  var require_cvt = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/cvt.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("cvt", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.cvt.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.cvt) {
            writer.writeBytes(ttf.cvt, ttf.cvt.length);
          }
        },
        size: function size(ttf) {
          return ttf.cvt ? ttf.cvt.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/prep.js
  var require_prep = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/prep.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("prep", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.prep.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.prep) {
            writer.writeBytes(ttf.prep, ttf.prep.length);
          }
        },
        size: function size(ttf) {
          return ttf.prep ? ttf.prep.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/gasp.js
  var require_gasp = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/gasp.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("gasp", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.gasp.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.gasp) {
            writer.writeBytes(ttf.gasp, ttf.gasp.length);
          }
        },
        size: function size(ttf) {
          return ttf.gasp ? ttf.gasp.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/kerx.js
  var require_kerx = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/kerx.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _table = _interopRequireDefault(require_table());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = _table.default.create("kerx", [], {
        read: function read2(reader, ttf) {
          var length = ttf.tables.kerx.length;
          return reader.readBytes(this.offset, length);
        },
        write: function write(writer, ttf) {
          if (ttf.kerx) {
            writer.writeBytes(ttf.kerx, ttf.kerx.length);
          }
        },
        size: function size(ttf) {
          return ttf.kerx ? ttf.kerx.length : 0;
        }
      });
    }
  });

  // node_modules/fonteditor-core/lib/ttf/table/support.js
  var require_support = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/table/support.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _head = _interopRequireDefault(require_head());
      var _maxp = _interopRequireDefault(require_maxp());
      var _loca = _interopRequireDefault(require_loca());
      var _cmap = _interopRequireDefault(require_cmap());
      var _glyf = _interopRequireDefault(require_glyf());
      var _name = _interopRequireDefault(require_name());
      var _hhea = _interopRequireDefault(require_hhea());
      var _hmtx = _interopRequireDefault(require_hmtx());
      var _post = _interopRequireDefault(require_post());
      var _OS = _interopRequireDefault(require_OS2());
      var _fpgm = _interopRequireDefault(require_fpgm());
      var _cvt = _interopRequireDefault(require_cvt());
      var _prep = _interopRequireDefault(require_prep());
      var _gasp = _interopRequireDefault(require_gasp());
      var _GPOS = _interopRequireDefault(require_GPOS());
      var _kern = _interopRequireDefault(require_kern());
      var _kerx = _interopRequireDefault(require_kerx());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var _default = exports.default = {
        head: _head.default,
        maxp: _maxp.default,
        loca: _loca.default,
        cmap: _cmap.default,
        glyf: _glyf.default,
        name: _name.default,
        hhea: _hhea.default,
        hmtx: _hmtx.default,
        post: _post.default,
        "OS/2": _OS.default,
        fpgm: _fpgm.default,
        cvt: _cvt.default,
        prep: _prep.default,
        gasp: _gasp.default,
        GPOS: _GPOS.default,
        kern: _kern.default,
        kerx: _kerx.default
      };
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttfreader.js
  var require_ttfreader = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttfreader.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _directory = _interopRequireDefault(require_directory());
      var _support = _interopRequireDefault(require_support());
      var _reader = _interopRequireDefault(require_reader());
      var _postName = _interopRequireDefault(require_postName());
      var _error = _interopRequireDefault(require_error());
      var _compound2simpleglyf = _interopRequireDefault(require_compound2simpleglyf());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      var TTFReader = exports.default = /* @__PURE__ */ function() {
        function TTFReader2() {
          var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _classCallCheck(this, TTFReader2);
          options.subset = options.subset || [];
          options.hinting = options.hinting || false;
          options.kerning = options.kerning || false;
          options.compound2simple = options.compound2simple || false;
          this.options = options;
        }
        return _createClass(TTFReader2, [{
          key: "readBuffer",
          value: function readBuffer(buffer) {
            var reader = new _reader.default(buffer, 0, buffer.byteLength, false);
            var ttf = {};
            ttf.version = reader.readFixed(0);
            if (ttf.version !== 1) {
              _error.default.raise(10101);
            }
            ttf.numTables = reader.readUint16();
            if (ttf.numTables <= 0 || ttf.numTables > 100) {
              _error.default.raise(10101);
            }
            ttf.searchRange = reader.readUint16();
            ttf.entrySelector = reader.readUint16();
            ttf.rangeShift = reader.readUint16();
            ttf.tables = new _directory.default(reader.offset).read(reader, ttf);
            if (!ttf.tables.glyf || !ttf.tables.head || !ttf.tables.cmap || !ttf.tables.hmtx) {
              _error.default.raise(10204);
            }
            ttf.readOptions = this.options;
            Object.keys(_support.default).forEach(function(tableName) {
              if (ttf.tables[tableName]) {
                var offset = ttf.tables[tableName].offset;
                ttf[tableName] = new _support.default[tableName](offset).read(reader, ttf);
              }
            });
            if (!ttf.glyf) {
              _error.default.raise(10201);
            }
            reader.dispose();
            return ttf;
          }
          /**
           * 关联glyf相关的信息
           *
           * @param {Object} ttf ttf对象
           */
        }, {
          key: "resolveGlyf",
          value: function resolveGlyf(ttf) {
            var codes = ttf.cmap;
            var glyf = ttf.glyf;
            var subsetMap = ttf.readOptions.subset ? ttf.subsetMap : null;
            Object.keys(codes).forEach(function(c) {
              var i = codes[c];
              if (subsetMap && !subsetMap[i]) {
                return;
              }
              if (!glyf[i].unicode) {
                glyf[i].unicode = [];
              }
              glyf[i].unicode.push(+c);
            });
            ttf.hmtx.forEach(function(item, i) {
              if (subsetMap && !subsetMap[i]) {
                return;
              }
              glyf[i].advanceWidth = item.advanceWidth;
              glyf[i].leftSideBearing = item.leftSideBearing;
            });
            if (ttf.post && 2 === ttf.post.format) {
              var nameIndex = ttf.post.nameIndex;
              var names = ttf.post.names;
              nameIndex.forEach(function(nameIndex2, i) {
                if (subsetMap && !subsetMap[i]) {
                  return;
                }
                if (nameIndex2 <= 257) {
                  glyf[i].name = _postName.default[nameIndex2];
                } else {
                  glyf[i].name = names[nameIndex2 - 258] || "";
                }
              });
            }
            if (subsetMap) {
              var subGlyf = [];
              Object.keys(subsetMap).forEach(function(i) {
                i = +i;
                if (glyf[i].compound) {
                  (0, _compound2simpleglyf.default)(i, ttf, true);
                }
                subGlyf.push(glyf[i]);
              });
              ttf.glyf = subGlyf;
              ttf.maxp.maxComponentElements = 0;
              ttf.maxp.maxComponentDepth = 0;
            }
          }
          /**
           * 清除非必须的表
           *
           * @param {Object} ttf ttf对象
           */
        }, {
          key: "cleanTables",
          value: function cleanTables(ttf) {
            delete ttf.readOptions;
            delete ttf.tables;
            delete ttf.hmtx;
            delete ttf.loca;
            if (ttf.post) {
              delete ttf.post.nameIndex;
              delete ttf.post.names;
            }
            delete ttf.subsetMap;
            if (!this.options.hinting) {
              delete ttf.fpgm;
              delete ttf.cvt;
              delete ttf.prep;
              ttf.glyf.forEach(function(glyf) {
                delete glyf.instructions;
              });
            }
            if (!this.options.hinting && !this.options.kerning) {
              delete ttf.GPOS;
              delete ttf.kern;
              delete ttf.kerx;
            }
            if (this.options.compound2simple && ttf.maxp.maxComponentElements) {
              ttf.glyf.forEach(function(glyf, index) {
                if (glyf.compound) {
                  (0, _compound2simpleglyf.default)(index, ttf, true);
                }
              });
              ttf.maxp.maxComponentElements = 0;
              ttf.maxp.maxComponentDepth = 0;
            }
          }
          /**
           * 获取解析后的ttf文档
           *
           * @param {ArrayBuffer} buffer buffer对象
           * @return {Object} ttf文档
           */
        }, {
          key: "read",
          value: function read2(buffer) {
            this.ttf = this.readBuffer(buffer);
            this.resolveGlyf(this.ttf);
            this.cleanTables(this.ttf);
            return this.ttf;
          }
          /**
           * 注销
           */
        }, {
          key: "dispose",
          value: function dispose() {
            delete this.ttf;
            delete this.options;
          }
        }]);
      }();
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/checkSum.js
  var require_checkSum = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/checkSum.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = checkSum;
      function checkSumArrayBuffer(buffer) {
        var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        var length = arguments.length > 2 ? arguments[2] : void 0;
        length = length == null ? buffer.byteLength : length;
        if (offset + length > buffer.byteLength) {
          throw new Error("check sum out of bound");
        }
        var nLongs = Math.floor(length / 4);
        var view = new DataView(buffer, offset, length);
        var sum = 0;
        var i = 0;
        while (i < nLongs) {
          sum += view.getUint32(4 * i++, false);
        }
        var leftBytes = length - nLongs * 4;
        if (leftBytes) {
          offset = nLongs * 4;
          while (leftBytes > 0) {
            sum += view.getUint8(offset, false) << leftBytes * 8;
            offset++;
            leftBytes--;
          }
        }
        return sum % 4294967296;
      }
      function checkSumArray(buffer) {
        var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        var length = arguments.length > 2 ? arguments[2] : void 0;
        length = length || buffer.length;
        if (offset + length > buffer.length) {
          throw new Error("check sum out of bound");
        }
        var nLongs = Math.floor(length / 4);
        var sum = 0;
        var i = 0;
        while (i < nLongs) {
          sum += (buffer[i++] << 24) + (buffer[i++] << 16) + (buffer[i++] << 8) + buffer[i++];
        }
        var leftBytes = length - nLongs * 4;
        if (leftBytes) {
          offset = nLongs * 4;
          while (leftBytes > 0) {
            sum += buffer[offset] << leftBytes * 8;
            offset++;
            leftBytes--;
          }
        }
        return sum % 4294967296;
      }
      function checkSum(buffer, offset, length) {
        if (buffer instanceof ArrayBuffer) {
          return checkSumArrayBuffer(buffer, offset, length);
        } else if (buffer instanceof Array) {
          return checkSumArray(buffer, offset, length);
        }
        throw new Error("not support checksum buffer type");
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttfwriter.js
  var require_ttfwriter = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttfwriter.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _writer = _interopRequireDefault(require_writer());
      var _directory = _interopRequireDefault(require_directory());
      var _support = _interopRequireDefault(require_support());
      var _checkSum = _interopRequireDefault(require_checkSum());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      var SUPPORT_TABLES = ["OS/2", "cmap", "glyf", "head", "hhea", "hmtx", "loca", "maxp", "name", "post"];
      var TTFWriter = exports.default = /* @__PURE__ */ function() {
        function TTFWriter2() {
          var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _classCallCheck(this, TTFWriter2);
          this.options = {
            writeZeroContoursGlyfData: options.writeZeroContoursGlyfData || false,
            // 不写入空 glyf 数据
            hinting: options.hinting || false,
            // 默认不保留hints信息
            kerning: options.kerning || false,
            // 默认不保留 kernings space 信息
            support: options.support
            // 自定义的导出表结构，可以自己修改某些表项目
          };
        }
        return _createClass(TTFWriter2, [{
          key: "resolveTTF",
          value: function resolveTTF(ttf) {
            ttf.version = ttf.version || 1;
            ttf.numTables = ttf.writeOptions.tables.length;
            ttf.entrySelector = Math.floor(Math.log(ttf.numTables) / Math.LN2);
            ttf.searchRange = Math.pow(2, ttf.entrySelector) * 16;
            ttf.rangeShift = ttf.numTables * 16 - ttf.searchRange;
            ttf.head.checkSumAdjustment = 0;
            ttf.head.magickNumber = 1594834165;
            if (typeof ttf.head.created === "string") {
              ttf.head.created = /^\d+$/.test(ttf.head.created) ? +ttf.head.created : Date.parse(ttf.head.created);
            }
            if (typeof ttf.head.modified === "string") {
              ttf.head.modified = /^\d+$/.test(ttf.head.modified) ? +ttf.head.modified : Date.parse(ttf.head.modified);
            }
            if (!ttf.head.created) {
              ttf.head.created = Date.now();
            }
            if (!ttf.head.modified) {
              ttf.head.modified = ttf.head.created;
            }
            var checkUnicodeRepeat = {};
            ttf.glyf.forEach(function(glyf, index) {
              if (glyf.unicode) {
                glyf.unicode = glyf.unicode.sort();
                glyf.unicode.forEach(function(u) {
                  if (checkUnicodeRepeat[u]) {
                    _error.default.raise({
                      number: 10200,
                      data: index
                    }, index);
                  } else {
                    checkUnicodeRepeat[u] = true;
                  }
                });
              }
            });
          }
          /**
           * 写ttf文件
           *
           * @param {ttfObject} ttf ttf数据结构
           * @return {ArrayBuffer} 字节流
           */
        }, {
          key: "dump",
          value: function dump(ttf) {
            ttf.support = Object.assign({}, this.options.support);
            var ttfSize = 12 + ttf.numTables * 16;
            var ttfHeadOffset = 0;
            ttf.support.tables = [];
            ttf.writeOptions.tables.forEach(function(tableName) {
              var offset = ttfSize;
              var TableClass = _support.default[tableName];
              var tableSize = new TableClass().size(ttf);
              var size = tableSize;
              if (tableName === "head") {
                ttfHeadOffset = offset;
              }
              if (size % 4) {
                size += 4 - size % 4;
              }
              ttf.support.tables.push({
                name: tableName,
                checkSum: 0,
                offset,
                length: tableSize,
                size
              });
              ttfSize += size;
            });
            var writer = new _writer.default(new ArrayBuffer(ttfSize));
            writer.writeFixed(ttf.version);
            writer.writeUint16(ttf.numTables);
            writer.writeUint16(ttf.searchRange);
            writer.writeUint16(ttf.entrySelector);
            writer.writeUint16(ttf.rangeShift);
            new _directory.default().write(writer, ttf);
            ttf.support.tables.forEach(function(table) {
              var tableStart = writer.offset;
              var TableClass = _support.default[table.name];
              new TableClass().write(writer, ttf);
              if (table.length % 4) {
                writer.writeEmpty(4 - table.length % 4);
              }
              table.checkSum = (0, _checkSum.default)(writer.getBuffer(), tableStart, table.size);
            });
            ttf.support.tables.forEach(function(table, index) {
              var offset = 12 + index * 16 + 4;
              writer.writeUint32(table.checkSum, offset);
            });
            var ttfCheckSum = (2981146554 - (0, _checkSum.default)(writer.getBuffer()) + 4294967296) % 4294967296;
            writer.writeUint32(ttfCheckSum, ttfHeadOffset + 8);
            delete ttf.writeOptions;
            delete ttf.support;
            var buffer = writer.getBuffer();
            writer.dispose();
            return buffer;
          }
          /**
           * 对ttf的表进行评估，标记需要处理的表
           *
           * @param  {Object} ttf ttf对象
           */
        }, {
          key: "prepareDump",
          value: function prepareDump(ttf) {
            if (!ttf.glyf || ttf.glyf.length === 0) {
              _error.default.raise(10201);
            }
            if (!ttf["OS/2"] || !ttf.head || !ttf.name) {
              _error.default.raise(10204);
            }
            var tables = SUPPORT_TABLES.slice(0);
            ttf.writeOptions = {};
            if (this.options.hinting) {
              ["cvt", "fpgm", "prep", "gasp", "GPOS", "kern", "kerx"].forEach(function(table) {
                if (ttf[table]) {
                  tables.push(table);
                }
              });
            }
            if (this.options.kerning) {
              ["GPOS", "kern", "kerx"].forEach(function(table) {
                if (ttf[table]) {
                  tables.push(table);
                }
              });
            }
            ttf.writeOptions.writeZeroContoursGlyfData = !!this.options.writeZeroContoursGlyfData;
            ttf.writeOptions.hinting = !!this.options.hinting;
            ttf.writeOptions.kerning = !!this.options.kerning;
            ttf.writeOptions.tables = tables.sort();
          }
          /**
           * 写一个ttf字体结构
           *
           * @param {Object} ttf ttf数据结构
           * @return {ArrayBuffer} 缓冲数组
           */
        }, {
          key: "write",
          value: function write(ttf) {
            this.prepareDump(ttf);
            this.resolveTTF(ttf);
            var buffer = this.dump(ttf);
            return buffer;
          }
          /**
           * 注销
           */
        }, {
          key: "dispose",
          value: function dispose() {
            delete this.options;
          }
        }]);
      }();
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2eot.js
  var require_ttf2eot = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2eot.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2eot;
      var _reader = _interopRequireDefault(require_reader());
      var _writer = _interopRequireDefault(require_writer());
      var _string = _interopRequireDefault(require_string());
      var _error = _interopRequireDefault(require_error());
      var _table = _interopRequireDefault(require_table());
      var _struct = _interopRequireDefault(require_struct());
      var _name = _interopRequireDefault(require_name());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var EotHead = _table.default.create("head", [["EOTSize", _struct.default.Uint32], ["FontDataSize", _struct.default.Uint32], ["Version", _struct.default.Uint32], ["Flags", _struct.default.Uint32], ["PANOSE", _struct.default.Bytes, 10], ["Charset", _struct.default.Uint8], ["Italic", _struct.default.Uint8], ["Weight", _struct.default.Uint32], ["fsType", _struct.default.Uint16], ["MagicNumber", _struct.default.Uint16], ["UnicodeRange", _struct.default.Bytes, 16], ["CodePageRange", _struct.default.Bytes, 8], ["CheckSumAdjustment", _struct.default.Uint32], ["Reserved", _struct.default.Bytes, 16], ["Padding1", _struct.default.Uint16]]);
      function ttf2eot(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var eotHead = new EotHead();
        var eotHeaderSize = eotHead.size();
        var eot = {};
        eot.head = eotHead.read(new _reader.default(new ArrayBuffer(eotHeaderSize)));
        eot.head.FontDataSize = ttfBuffer.byteLength || ttfBuffer.length;
        eot.head.Version = 131073;
        eot.head.Flags = 0;
        eot.head.Charset = 1;
        eot.head.MagicNumber = 20556;
        eot.head.Padding1 = 0;
        var ttfReader = new _reader.default(ttfBuffer);
        var numTables = ttfReader.readUint16(4);
        if (numTables <= 0 || numTables > 100) {
          _error.default.raise(10101);
        }
        ttfReader.seek(12);
        var tblReaded = 0;
        for (var i = 0; i < numTables && tblReaded !== 7; ++i) {
          var tableEntry = {
            tag: ttfReader.readString(ttfReader.offset, 4),
            checkSum: ttfReader.readUint32(),
            offset: ttfReader.readUint32(),
            length: ttfReader.readUint32()
          };
          var entryOffset = ttfReader.offset;
          if (tableEntry.tag === "head") {
            eot.head.CheckSumAdjustment = ttfReader.readUint32(tableEntry.offset + 8);
            tblReaded += 1;
          } else if (tableEntry.tag === "OS/2") {
            eot.head.PANOSE = ttfReader.readBytes(tableEntry.offset + 32, 10);
            eot.head.Italic = ttfReader.readUint16(tableEntry.offset + 62);
            eot.head.Weight = ttfReader.readUint16(tableEntry.offset + 4);
            eot.head.fsType = ttfReader.readUint16(tableEntry.offset + 8);
            eot.head.UnicodeRange = ttfReader.readBytes(tableEntry.offset + 42, 16);
            eot.head.CodePageRange = ttfReader.readBytes(tableEntry.offset + 78, 8);
            tblReaded += 2;
          } else if (tableEntry.tag === "name") {
            var names = new _name.default(tableEntry.offset).read(ttfReader);
            eot.FamilyName = _string.default.toUCS2Bytes(names.fontFamily || "");
            eot.FamilyNameSize = eot.FamilyName.length;
            eot.StyleName = _string.default.toUCS2Bytes(names.fontStyle || "");
            eot.StyleNameSize = eot.StyleName.length;
            eot.VersionName = _string.default.toUCS2Bytes(names.version || "");
            eot.VersionNameSize = eot.VersionName.length;
            eot.FullName = _string.default.toUCS2Bytes(names.fullName || "");
            eot.FullNameSize = eot.FullName.length;
            tblReaded += 3;
          }
          ttfReader.seek(entryOffset);
        }
        eot.head.EOTSize = eotHeaderSize + 4 + eot.FamilyNameSize + 4 + eot.StyleNameSize + 4 + eot.VersionNameSize + 4 + eot.FullNameSize + 2 + eot.head.FontDataSize;
        var eotWriter = new _writer.default(new ArrayBuffer(eot.head.EOTSize), 0, eot.head.EOTSize, true);
        eotHead.write(eotWriter, eot);
        eotWriter.writeUint16(eot.FamilyNameSize);
        eotWriter.writeBytes(eot.FamilyName, eot.FamilyNameSize);
        eotWriter.writeUint16(0);
        eotWriter.writeUint16(eot.StyleNameSize);
        eotWriter.writeBytes(eot.StyleName, eot.StyleNameSize);
        eotWriter.writeUint16(0);
        eotWriter.writeUint16(eot.VersionNameSize);
        eotWriter.writeBytes(eot.VersionName, eot.VersionNameSize);
        eotWriter.writeUint16(0);
        eotWriter.writeUint16(eot.FullNameSize);
        eotWriter.writeBytes(eot.FullName, eot.FullNameSize);
        eotWriter.writeUint16(0);
        eotWriter.writeUint16(0);
        eotWriter.writeBytes(ttfBuffer, eot.head.FontDataSize);
        return eotWriter.getBuffer();
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2woff.js
  var require_ttf2woff = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2woff.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2woff;
      var _reader = _interopRequireDefault(require_reader());
      var _writer = _interopRequireDefault(require_writer());
      var _string = _interopRequireDefault(require_string2());
      var _string2 = _interopRequireDefault(require_string());
      var _error = _interopRequireDefault(require_error());
      var _default = _interopRequireDefault(require_default());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function metadata2xml(metadata) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><metadata version="1.0">';
        metadata.uniqueid = metadata.uniqueid || _default.default.fontId + "." + Date.now();
        xml += '<uniqueid id="' + _string.default.encodeHTML(metadata.uniqueid) + '" />';
        if (metadata.vendor) {
          xml += '<vendor name="' + _string.default.encodeHTML(metadata.vendor.name) + '" url="' + _string.default.encodeHTML(metadata.vendor.url) + '" />';
        }
        if (metadata.credit) {
          xml += "<credits>";
          var credits = metadata.credit instanceof Array ? metadata.credit : [metadata.credit];
          credits.forEach(function(credit) {
            xml += '<credit name="' + _string.default.encodeHTML(credit.name) + '" url="' + _string.default.encodeHTML(credit.url) + '" role="' + _string.default.encodeHTML(credit.role || "Contributor") + '" />';
          });
          xml += "</credits>";
        }
        if (metadata.description) {
          xml += '<description><text xml:lang="en">' + _string.default.encodeHTML(metadata.description) + "</text></description>";
        }
        if (metadata.license) {
          xml += '<license url="' + _string.default.encodeHTML(metadata.license.url) + '" id="' + _string.default.encodeHTML(metadata.license.id) + '"><text xml:lang="en">';
          xml += _string.default.encodeHTML(metadata.license.text);
          xml += "</text></license>";
        }
        if (metadata.copyright) {
          xml += '<copyright><text xml:lang="en">';
          xml += _string.default.encodeHTML(metadata.copyright);
          xml += "</text></copyright>";
        }
        if (metadata.trademark) {
          xml += '<trademark><text xml:lang="en">' + _string.default.encodeHTML(metadata.trademark) + "</text></trademark>";
        }
        if (metadata.licensee) {
          xml += '<licensee name="' + _string.default.encodeHTML(metadata.licensee) + '"/>';
        }
        xml += "</metadata>";
        return xml;
      }
      function ttf2woff(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var woffHeader = {
          signature: 2001684038,
          // for woff
          flavor: 65536,
          // for ttf
          length: 0,
          numTables: 0,
          reserved: 0,
          totalSfntSize: 0,
          majorVersion: 0,
          minorVersion: 0,
          metaOffset: 0,
          metaLength: 0,
          metaOrigLength: 0,
          privOffset: 0,
          privLength: 0
        };
        var ttfReader = new _reader.default(ttfBuffer);
        var tableEntries = [];
        var numTables = ttfReader.readUint16(4);
        var tableEntry;
        var deflatedData;
        var i;
        var l;
        if (numTables <= 0 || numTables > 100) {
          _error.default.raise(10101);
        }
        ttfReader.seek(12);
        for (i = 0; i < numTables; ++i) {
          tableEntry = {
            tag: ttfReader.readString(ttfReader.offset, 4),
            checkSum: ttfReader.readUint32(),
            offset: ttfReader.readUint32(),
            length: ttfReader.readUint32()
          };
          var entryOffset = ttfReader.offset;
          if (tableEntry.tag === "head") {
            woffHeader.majorVersion = ttfReader.readUint16(tableEntry.offset + 4);
            woffHeader.minorVersion = ttfReader.readUint16(tableEntry.offset + 6);
          }
          var sfntData = ttfReader.readBytes(tableEntry.offset, tableEntry.length);
          if (options.deflate) {
            deflatedData = options.deflate(sfntData);
            if (deflatedData.length < sfntData.length) {
              tableEntry.data = deflatedData;
              tableEntry.deflated = true;
            } else {
              tableEntry.data = sfntData;
            }
          } else {
            tableEntry.data = sfntData;
          }
          tableEntry.compLength = tableEntry.data.length;
          tableEntries.push(tableEntry);
          ttfReader.seek(entryOffset);
        }
        if (!tableEntries.length) {
          _error.default.raise(10204);
        }
        tableEntries = tableEntries.sort(function(a, b) {
          return a.tag === b.tag ? 0 : a.tag < b.tag ? -1 : 1;
        });
        var woffSize = 44 + 20 * numTables;
        var ttfSize = 12 + 16 * numTables;
        for (i = 0, l = tableEntries.length; i < l; ++i) {
          tableEntry = tableEntries[i];
          tableEntry.offset = woffSize;
          woffSize += tableEntry.compLength + (tableEntry.compLength % 4 ? 4 - tableEntry.compLength % 4 : 0);
          ttfSize += tableEntry.length + (tableEntry.length % 4 ? 4 - tableEntry.length % 4 : 0);
        }
        var metadata = null;
        if (options.metadata) {
          var xml = _string2.default.toUTF8Bytes(metadata2xml(options.metadata));
          if (options.deflate) {
            deflatedData = options.deflate(xml);
            if (deflatedData.length < xml.length) {
              metadata = deflatedData;
            } else {
              metadata = xml;
            }
          } else {
            metadata = xml;
          }
          woffHeader.metaLength = metadata.length;
          woffHeader.metaOrigLength = xml.length;
          woffHeader.metaOffset = woffSize;
          woffSize += woffHeader.metaLength + (woffHeader.metaLength % 4 ? 4 - woffHeader.metaLength % 4 : 0);
        }
        woffHeader.numTables = tableEntries.length;
        woffHeader.length = woffSize;
        woffHeader.totalSfntSize = ttfSize;
        var woffWriter = new _writer.default(new ArrayBuffer(woffSize));
        woffWriter.writeUint32(woffHeader.signature);
        woffWriter.writeUint32(woffHeader.flavor);
        woffWriter.writeUint32(woffHeader.length);
        woffWriter.writeUint16(woffHeader.numTables);
        woffWriter.writeUint16(woffHeader.reserved);
        woffWriter.writeUint32(woffHeader.totalSfntSize);
        woffWriter.writeUint16(woffHeader.majorVersion);
        woffWriter.writeUint16(woffHeader.minorVersion);
        woffWriter.writeUint32(woffHeader.metaOffset);
        woffWriter.writeUint32(woffHeader.metaLength);
        woffWriter.writeUint32(woffHeader.metaOrigLength);
        woffWriter.writeUint32(woffHeader.privOffset);
        woffWriter.writeUint32(woffHeader.privLength);
        for (i = 0, l = tableEntries.length; i < l; ++i) {
          tableEntry = tableEntries[i];
          woffWriter.writeString(tableEntry.tag);
          woffWriter.writeUint32(tableEntry.offset);
          woffWriter.writeUint32(tableEntry.compLength);
          woffWriter.writeUint32(tableEntry.length);
          woffWriter.writeUint32(tableEntry.checkSum);
        }
        for (i = 0, l = tableEntries.length; i < l; ++i) {
          tableEntry = tableEntries[i];
          woffWriter.writeBytes(tableEntry.data);
          if (tableEntry.compLength % 4) {
            woffWriter.writeEmpty(4 - tableEntry.compLength % 4);
          }
        }
        if (metadata) {
          woffWriter.writeBytes(metadata);
          if (woffHeader.metaLength % 4) {
            woffWriter.writeEmpty(4 - woffHeader.metaLength % 4);
          }
        }
        return woffWriter.getBuffer();
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/contour2svg.js
  var require_contour2svg = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/contour2svg.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = contour2svg;
      function contour2svg(contour) {
        var precision = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
        if (!contour.length) {
          return "";
        }
        var ceil = function ceil2(number) {
          return +number.toFixed(precision);
        };
        var pathArr = [];
        var curPoint;
        var prevPoint;
        var nextPoint;
        var x;
        var y;
        for (var i = 0, l = contour.length; i < l; i++) {
          curPoint = contour[i];
          prevPoint = i === 0 ? contour[l - 1] : contour[i - 1];
          nextPoint = i === l - 1 ? contour[0] : contour[i + 1];
          if (i === 0) {
            if (curPoint.onCurve) {
              x = curPoint.x;
              y = curPoint.y;
              pathArr.push("M" + ceil(x) + " " + ceil(y));
            } else if (prevPoint.onCurve) {
              x = prevPoint.x;
              y = prevPoint.y;
              pathArr.push("M" + ceil(x) + " " + ceil(y));
            } else {
              x = (prevPoint.x + curPoint.x) / 2;
              y = (prevPoint.y + curPoint.y) / 2;
              pathArr.push("M" + ceil(x) + " " + ceil(y));
            }
          }
          if (curPoint.onCurve && nextPoint.onCurve) {
            pathArr.push("l" + ceil(nextPoint.x - x) + " " + ceil(nextPoint.y - y));
            x = nextPoint.x;
            y = nextPoint.y;
          } else if (!curPoint.onCurve) {
            if (nextPoint.onCurve) {
              pathArr.push("q" + ceil(curPoint.x - x) + " " + ceil(curPoint.y - y) + " " + ceil(nextPoint.x - x) + " " + ceil(nextPoint.y - y));
              x = nextPoint.x;
              y = nextPoint.y;
            } else {
              var x1 = (curPoint.x + nextPoint.x) / 2;
              var y1 = (curPoint.y + nextPoint.y) / 2;
              pathArr.push("q" + ceil(curPoint.x - x) + " " + ceil(curPoint.y - y) + " " + ceil(x1 - x) + " " + ceil(y1 - y));
              x = x1;
              y = y1;
            }
          }
        }
        pathArr.push("Z");
        return pathArr.join(" ");
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/contours2svg.js
  var require_contours2svg = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/contours2svg.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = contours2svg;
      var _contour2svg = _interopRequireDefault(require_contour2svg());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function contours2svg(contours, precision) {
        if (!contours.length) {
          return "";
        }
        return contours.map(function(contour) {
          return (0, _contour2svg.default)(contour, precision);
        }).join("");
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/unicode2xml.js
  var require_unicode2xml = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/unicode2xml.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = unicode2xml;
      var _string = _interopRequireDefault(require_string2());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function unicode2xml(unicodeList) {
        if (typeof unicodeList === "number") {
          unicodeList = [unicodeList];
        }
        return unicodeList.map(function(u) {
          if (u < 32) {
            return "";
          }
          return u >= 32 && u <= 255 ? _string.default.encodeHTML(String.fromCharCode(u)) : "&#x" + u.toString(16) + ";";
        }).join("");
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2svg.js
  var require_ttf2svg = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2svg.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2svg;
      var _string = _interopRequireDefault(require_string2());
      var _string2 = _interopRequireDefault(require_string());
      var _ttfreader = _interopRequireDefault(require_ttfreader());
      var _contours2svg = _interopRequireDefault(require_contours2svg());
      var _unicode2xml = _interopRequireDefault(require_unicode2xml());
      var _error = _interopRequireDefault(require_error());
      var _default = _interopRequireDefault(require_default());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var SVG_FONT_ID = _default.default.fontId;
      var XML_TPL = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" ><svg xmlns="http://www.w3.org/2000/svg"><metadata>${metadata}</metadata><defs><font id="${id}" horiz-adv-x="${advanceWidth}"><font-face font-family="${fontFamily}" font-weight="${fontWeight}" font-stretch="normal" units-per-em="${unitsPerEm}" panose-1="${panose}" ascent="${ascent}" descent="${descent}" x-height="${xHeight}" bbox="${bbox}" underline-thickness="${underlineThickness}" underline-position="${underlinePosition}" unicode-range="${unicodeRange}" /><missing-glyph horiz-adv-x="${missing.advanceWidth}" ${missing.d} />${glyphList}</font></defs></svg>';
      var GLYPH_TPL = '<glyph glyph-name="${name}" unicode="${unicode}" d="${d}" />';
      function ttfobject2svg(ttf, options) {
        var OS2 = ttf["OS/2"];
        var xmlObject = {
          id: ttf.name.uniqueSubFamily || SVG_FONT_ID,
          metadata: _string.default.encodeHTML(options.metadata || ""),
          advanceWidth: ttf.hhea.advanceWidthMax,
          fontFamily: ttf.name.fontFamily,
          fontWeight: OS2.usWeightClass,
          unitsPerEm: ttf.head.unitsPerEm,
          panose: [OS2.bFamilyType, OS2.bSerifStyle, OS2.bWeight, OS2.bProportion, OS2.bContrast, OS2.bStrokeVariation, OS2.bArmStyle, OS2.bLetterform, OS2.bMidline, OS2.bXHeight].join(" "),
          ascent: ttf.hhea.ascent,
          descent: ttf.hhea.descent,
          xHeight: OS2.bXHeight,
          bbox: [ttf.head.xMin, ttf.head.yMin, ttf.head.xMax, ttf.head.yMax].join(" "),
          underlineThickness: ttf.post.underlineThickness,
          underlinePosition: ttf.post.underlinePosition,
          unicodeRange: "U+" + _string.default.pad(OS2.usFirstCharIndex.toString(16), 4) + "-" + _string.default.pad(OS2.usLastCharIndex.toString(16), 4)
        };
        xmlObject.missing = {};
        xmlObject.missing.advanceWidth = ttf.glyf[0].advanceWidth || 0;
        xmlObject.missing.d = ttf.glyf[0].contours && ttf.glyf[0].contours.length ? 'd="' + (0, _contours2svg.default)(ttf.glyf[0].contours) + '"' : "";
        var glyphList = "";
        for (var i = 1, l = ttf.glyf.length; i < l; i++) {
          var glyf = ttf.glyf[i];
          if (!glyf.compound && glyf.contours && glyf.unicode && glyf.unicode.length) {
            var glyfObject = {
              name: _string2.default.escape(glyf.name),
              unicode: (0, _unicode2xml.default)(glyf.unicode),
              d: (0, _contours2svg.default)(glyf.contours)
            };
            glyphList += _string.default.format(GLYPH_TPL, glyfObject);
          }
        }
        xmlObject.glyphList = glyphList;
        return _string.default.format(XML_TPL, xmlObject);
      }
      function ttf2svg(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if (ttfBuffer instanceof ArrayBuffer) {
          var reader = new _ttfreader.default();
          var ttfObject = reader.read(ttfBuffer);
          reader.dispose();
          return ttfobject2svg(ttfObject, options);
        } else if (ttfBuffer.version && ttfBuffer.glyf) {
          return ttfobject2svg(ttfBuffer, options);
        }
        _error.default.raise(10109);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2symbol.js
  var require_ttf2symbol = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2symbol.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2symbol;
      exports.getSymbolId = getSymbolId;
      var _string = _interopRequireDefault(require_string2());
      var _ttfreader = _interopRequireDefault(require_ttfreader());
      var _contours2svg = _interopRequireDefault(require_contours2svg());
      var _pathsUtil = _interopRequireDefault(require_pathsUtil());
      var _error = _interopRequireDefault(require_error());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var XML_TPL = '<svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${symbolList}</defs></svg>';
      var SYMBOL_TPL = '<symbol id="${id}" viewBox="0 ${descent} ${unitsPerEm} ${unitsPerEm}"><path d="${d}"></path></symbol>';
      function getSymbolId(glyf, index) {
        if (glyf.name) {
          return glyf.name;
        }
        if (glyf.unicode && glyf.unicode.length) {
          return "uni-" + glyf.unicode[0];
        }
        return "symbol-" + index;
      }
      function ttfobject2symbol(ttf) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var xmlObject = {};
        var unitsPerEm = ttf.head.unitsPerEm;
        var descent = ttf.hhea.descent;
        var symbolList = "";
        for (var i = 1, l = ttf.glyf.length; i < l; i++) {
          var glyf = ttf.glyf[i];
          if (!glyf.compound && glyf.contours) {
            var contours = _pathsUtil.default.flip(glyf.contours);
            var glyfObject = {
              descent,
              unitsPerEm,
              id: getSymbolId(glyf, i),
              d: (0, _contours2svg.default)(contours)
            };
            symbolList += _string.default.format(SYMBOL_TPL, glyfObject);
          }
        }
        xmlObject.symbolList = symbolList;
        return _string.default.format(XML_TPL, xmlObject);
      }
      function ttf2symbol(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if (ttfBuffer instanceof ArrayBuffer) {
          var reader = new _ttfreader.default();
          var ttfObject = reader.read(ttfBuffer);
          reader.dispose();
          return ttfobject2symbol(ttfObject, options);
        } else if (ttfBuffer.version && ttfBuffer.glyf) {
          return ttfobject2symbol(ttfBuffer, options);
        }
        _error.default.raise(10112);
      }
    }
  });

  // node_modules/fonteditor-core/woff2/woff2.js
  var require_woff2 = __commonJS({
    "node_modules/fonteditor-core/woff2/woff2.js"(exports, module) {
      var Module = function() {
        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
        return function(Module2) {
          Module2 = Module2 || {};
          "use strict";
          var Module2 = typeof Module2 !== "undefined" ? Module2 : {};
          var moduleOverrides = {};
          var key;
          for (key in Module2) {
            if (Module2.hasOwnProperty(key)) {
              moduleOverrides[key] = Module2[key];
            }
          }
          var arguments_ = [];
          var thisProgram = "./this.program";
          var quit_ = function(status, toThrow) {
            throw toThrow;
          };
          var ENVIRONMENT_IS_WEB = false;
          var ENVIRONMENT_IS_WORKER = false;
          var ENVIRONMENT_IS_NODE = false;
          var ENVIRONMENT_HAS_NODE = false;
          var ENVIRONMENT_IS_SHELL = false;
          ENVIRONMENT_IS_WEB = typeof window === "object";
          ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
          ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
          ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
          ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
          if (Module2["ENVIRONMENT"]) {
            throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)");
          }
          var scriptDirectory = "";
          function locateFile(path) {
            if (Module2["locateFile"]) {
              return Module2["locateFile"](path, scriptDirectory);
            }
            return scriptDirectory + path;
          }
          var read_, readAsync, readBinary, setWindowTitle;
          if (ENVIRONMENT_IS_NODE) {
            scriptDirectory = __dirname + "/";
            var nodeFS;
            var nodePath;
            read_ = function shell_read(filename, binary) {
              var ret;
              if (!nodeFS) nodeFS = __require(["fs"].join());
              if (!nodePath) nodePath = __require(["path"].join());
              filename = nodePath["normalize"](filename);
              ret = nodeFS["readFileSync"](filename);
              return binary ? ret : ret.toString();
            };
            readBinary = function readBinary2(filename) {
              var ret = read_(filename, true);
              if (!ret.buffer) {
                ret = new Uint8Array(ret);
              }
              assert(ret.buffer);
              return ret;
            };
            if (process["argv"].length > 1) {
              thisProgram = process["argv"][1].replace(/\\/g, "/");
            }
            arguments_ = process["argv"].slice(2);
            process["on"]("uncaughtException", function(ex) {
              if (!(ex instanceof ExitStatus)) {
                throw ex;
              }
            });
            process["on"]("unhandledRejection", abort);
            quit_ = function(status) {
              process["exit"](status);
            };
            Module2["inspect"] = function() {
              return "[Emscripten Module object]";
            };
          } else if (ENVIRONMENT_IS_SHELL) {
            if (typeof read != "undefined") {
              read_ = function shell_read(f) {
                return read(f);
              };
            }
            readBinary = function readBinary2(f) {
              var data;
              if (typeof readbuffer === "function") {
                return new Uint8Array(readbuffer(f));
              }
              data = read(f, "binary");
              assert(typeof data === "object");
              return data;
            };
            if (typeof scriptArgs != "undefined") {
              arguments_ = scriptArgs;
            } else if (typeof arguments != "undefined") {
              arguments_ = arguments;
            }
            if (typeof quit === "function") {
              quit_ = function(status) {
                quit(status);
              };
            }
            if (typeof print !== "undefined") {
              if (typeof console === "undefined") console = {};
              console.log = print;
              console.warn = console.error = typeof printErr !== "undefined" ? printErr : print;
            }
          } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            if (ENVIRONMENT_IS_WORKER) {
              scriptDirectory = self.location.href;
            } else if (document.currentScript) {
              scriptDirectory = document.currentScript.src;
            }
            if (_scriptDir) {
              scriptDirectory = _scriptDir;
            }
            if (scriptDirectory.indexOf("blob:") !== 0) {
              scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1);
            } else {
              scriptDirectory = "";
            }
            read_ = function shell_read(url) {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = function readBinary2(url) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = function readAsync2(url, onload, onerror) {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = function xhr_onload() {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
            setWindowTitle = function(title) {
              document.title = title;
            };
          } else {
            throw new Error("environment detection error");
          }
          var out = Module2["print"] || function() {
          };
          var err = Module2["printErr"] || function() {
          };
          for (key in moduleOverrides) {
            if (moduleOverrides.hasOwnProperty(key)) {
              Module2[key] = moduleOverrides[key];
            }
          }
          moduleOverrides = null;
          if (Module2["arguments"]) arguments_ = Module2["arguments"];
          if (!Object.getOwnPropertyDescriptor(Module2, "arguments")) Object.defineProperty(Module2, "arguments", { configurable: true, get: function() {
            abort("Module.arguments has been replaced with plain arguments_");
          } });
          if (Module2["thisProgram"]) thisProgram = Module2["thisProgram"];
          if (!Object.getOwnPropertyDescriptor(Module2, "thisProgram")) Object.defineProperty(Module2, "thisProgram", { configurable: true, get: function() {
            abort("Module.thisProgram has been replaced with plain thisProgram");
          } });
          if (Module2["quit"]) quit_ = Module2["quit"];
          if (!Object.getOwnPropertyDescriptor(Module2, "quit")) Object.defineProperty(Module2, "quit", { configurable: true, get: function() {
            abort("Module.quit has been replaced with plain quit_");
          } });
          assert(typeof Module2["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module2["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module2["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module2["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
          assert(typeof Module2["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");
          assert(typeof Module2["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
          assert(typeof Module2["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
          assert(typeof Module2["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
          if (!Object.getOwnPropertyDescriptor(Module2, "read")) Object.defineProperty(Module2, "read", { configurable: true, get: function() {
            abort("Module.read has been replaced with plain read_");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "readAsync")) Object.defineProperty(Module2, "readAsync", { configurable: true, get: function() {
            abort("Module.readAsync has been replaced with plain readAsync");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "readBinary")) Object.defineProperty(Module2, "readBinary", { configurable: true, get: function() {
            abort("Module.readBinary has been replaced with plain readBinary");
          } });
          stackSave = stackRestore = stackAlloc = function() {
            abort("cannot use the stack before compiled code is ready to run, and has provided stack access");
          };
          function warnOnce(text) {
            if (!warnOnce.shown) warnOnce.shown = {};
            if (!warnOnce.shown[text]) {
              warnOnce.shown[text] = 1;
              err(text);
            }
          }
          var asm2wasmImports = { "f64-rem": function(x, y) {
            return x % y;
          }, "debugger": function() {
            debugger;
          } };
          var functionPointers = new Array(0);
          var tempRet0 = 0;
          var setTempRet0 = function(value) {
            tempRet0 = value;
          };
          var wasmBinary;
          if (Module2["wasmBinary"]) wasmBinary = Module2["wasmBinary"];
          if (!Object.getOwnPropertyDescriptor(Module2, "wasmBinary")) Object.defineProperty(Module2, "wasmBinary", { configurable: true, get: function() {
            abort("Module.wasmBinary has been replaced with plain wasmBinary");
          } });
          var noExitRuntime;
          if (Module2["noExitRuntime"]) noExitRuntime = Module2["noExitRuntime"];
          if (!Object.getOwnPropertyDescriptor(Module2, "noExitRuntime")) Object.defineProperty(Module2, "noExitRuntime", { configurable: true, get: function() {
            abort("Module.noExitRuntime has been replaced with plain noExitRuntime");
          } });
          if (typeof WebAssembly !== "object") {
            abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.");
          }
          var wasmMemory;
          var wasmTable = new WebAssembly.Table({ "initial": 352, "maximum": 352, "element": "anyfunc" });
          var ABORT = false;
          var EXITSTATUS = 0;
          function assert(condition, text) {
            if (!condition) {
              abort("Assertion failed: " + text);
            }
          }
          function getCFunc(ident) {
            var func = Module2["_" + ident];
            assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
            return func;
          }
          function ccall(ident, returnType, argTypes, args, opts) {
            var toC = { "string": function(str) {
              var ret2 = 0;
              if (str !== null && str !== void 0 && str !== 0) {
                var len = (str.length << 2) + 1;
                ret2 = stackAlloc(len);
                stringToUTF8(str, ret2, len);
              }
              return ret2;
            }, "array": function(arr) {
              var ret2 = stackAlloc(arr.length);
              writeArrayToMemory(arr, ret2);
              return ret2;
            } };
            function convertReturnValue(ret2) {
              if (returnType === "string") return UTF8ToString(ret2);
              if (returnType === "boolean") return Boolean(ret2);
              return ret2;
            }
            var func = getCFunc(ident);
            var cArgs = [];
            var stack = 0;
            assert(returnType !== "array", 'Return type should not be "array".');
            if (args) {
              for (var i = 0; i < args.length; i++) {
                var converter = toC[argTypes[i]];
                if (converter) {
                  if (stack === 0) stack = stackSave();
                  cArgs[i] = converter(args[i]);
                } else {
                  cArgs[i] = args[i];
                }
              }
            }
            var ret = func.apply(null, cArgs);
            ret = convertReturnValue(ret);
            if (stack !== 0) stackRestore(stack);
            return ret;
          }
          function cwrap(ident, returnType, argTypes, opts) {
            return function() {
              return ccall(ident, returnType, argTypes, arguments, opts);
            };
          }
          var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : void 0;
          function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
            var endIdx = idx + maxBytesToRead;
            var endPtr = idx;
            while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
            if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
              return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
            } else {
              var str = "";
              while (idx < endPtr) {
                var u0 = u8Array[idx++];
                if (!(u0 & 128)) {
                  str += String.fromCharCode(u0);
                  continue;
                }
                var u1 = u8Array[idx++] & 63;
                if ((u0 & 224) == 192) {
                  str += String.fromCharCode((u0 & 31) << 6 | u1);
                  continue;
                }
                var u2 = u8Array[idx++] & 63;
                if ((u0 & 240) == 224) {
                  u0 = (u0 & 15) << 12 | u1 << 6 | u2;
                } else {
                  if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
                  u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63;
                }
                if (u0 < 65536) {
                  str += String.fromCharCode(u0);
                } else {
                  var ch = u0 - 65536;
                  str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                }
              }
            }
            return str;
          }
          function UTF8ToString(ptr, maxBytesToRead) {
            return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
          }
          function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
            if (!(maxBytesToWrite > 0)) return 0;
            var startIdx = outIdx;
            var endIdx = outIdx + maxBytesToWrite - 1;
            for (var i = 0; i < str.length; ++i) {
              var u = str.charCodeAt(i);
              if (u >= 55296 && u <= 57343) {
                var u1 = str.charCodeAt(++i);
                u = 65536 + ((u & 1023) << 10) | u1 & 1023;
              }
              if (u <= 127) {
                if (outIdx >= endIdx) break;
                outU8Array[outIdx++] = u;
              } else if (u <= 2047) {
                if (outIdx + 1 >= endIdx) break;
                outU8Array[outIdx++] = 192 | u >> 6;
                outU8Array[outIdx++] = 128 | u & 63;
              } else if (u <= 65535) {
                if (outIdx + 2 >= endIdx) break;
                outU8Array[outIdx++] = 224 | u >> 12;
                outU8Array[outIdx++] = 128 | u >> 6 & 63;
                outU8Array[outIdx++] = 128 | u & 63;
              } else {
                if (outIdx + 3 >= endIdx) break;
                if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
                outU8Array[outIdx++] = 240 | u >> 18;
                outU8Array[outIdx++] = 128 | u >> 12 & 63;
                outU8Array[outIdx++] = 128 | u >> 6 & 63;
                outU8Array[outIdx++] = 128 | u & 63;
              }
            }
            outU8Array[outIdx] = 0;
            return outIdx - startIdx;
          }
          function stringToUTF8(str, outPtr, maxBytesToWrite) {
            assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
            return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
          }
          function lengthBytesUTF8(str) {
            var len = 0;
            for (var i = 0; i < str.length; ++i) {
              var u = str.charCodeAt(i);
              if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
              if (u <= 127) ++len;
              else if (u <= 2047) len += 2;
              else if (u <= 65535) len += 3;
              else len += 4;
            }
            return len;
          }
          var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : void 0;
          function writeArrayToMemory(array, buffer2) {
            assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
            HEAP8.set(array, buffer2);
          }
          var WASM_PAGE_SIZE = 65536;
          function alignUp(x, multiple) {
            if (x % multiple > 0) {
              x += multiple - x % multiple;
            }
            return x;
          }
          var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
          function updateGlobalBufferAndViews(buf) {
            buffer = buf;
            Module2["HEAP8"] = HEAP8 = new Int8Array(buf);
            Module2["HEAP16"] = HEAP16 = new Int16Array(buf);
            Module2["HEAP32"] = HEAP32 = new Int32Array(buf);
            Module2["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
            Module2["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
            Module2["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
            Module2["HEAPF32"] = HEAPF32 = new Float32Array(buf);
            Module2["HEAPF64"] = HEAPF64 = new Float64Array(buf);
          }
          var STACK_BASE = 434112, STACK_MAX = 5676992, DYNAMIC_BASE = 5676992, DYNAMICTOP_PTR = 433920;
          assert(STACK_BASE % 16 === 0, "stack must start aligned");
          assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");
          var TOTAL_STACK = 5242880;
          if (Module2["TOTAL_STACK"]) assert(TOTAL_STACK === Module2["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
          var INITIAL_TOTAL_MEMORY = Module2["TOTAL_MEMORY"] || 16777216;
          if (!Object.getOwnPropertyDescriptor(Module2, "TOTAL_MEMORY")) Object.defineProperty(Module2, "TOTAL_MEMORY", { configurable: true, get: function() {
            abort("Module.TOTAL_MEMORY has been replaced with plain INITIAL_TOTAL_MEMORY");
          } });
          assert(INITIAL_TOTAL_MEMORY >= TOTAL_STACK, "TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
          assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== void 0 && Int32Array.prototype.set !== void 0, "JS engine does not provide full typed array support");
          if (Module2["wasmMemory"]) {
            wasmMemory = Module2["wasmMemory"];
          } else {
            wasmMemory = new WebAssembly.Memory({ "initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE });
          }
          if (wasmMemory) {
            buffer = wasmMemory.buffer;
          }
          INITIAL_TOTAL_MEMORY = buffer.byteLength;
          assert(INITIAL_TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
          updateGlobalBufferAndViews(buffer);
          HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
          function writeStackCookie() {
            assert((STACK_MAX & 3) == 0);
            HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
            HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
            HEAP32[0] = 1668509029;
          }
          function checkStackCookie() {
            var cookie1 = HEAPU32[(STACK_MAX >> 2) - 1];
            var cookie2 = HEAPU32[(STACK_MAX >> 2) - 2];
            if (cookie1 != 34821223 || cookie2 != 2310721022) {
              abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16));
            }
            if (HEAP32[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
          }
          function abortStackOverflow(allocSize) {
            abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!");
          }
          (function() {
            var h16 = new Int16Array(1);
            var h8 = new Int8Array(h16.buffer);
            h16[0] = 25459;
            if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian!";
          })();
          function abortFnPtrError(ptr, sig) {
            abort("Invalid function pointer " + ptr + " called with signature '" + sig + "'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this). Build with ASSERTIONS=2 for more info.");
          }
          function callRuntimeCallbacks(callbacks) {
            while (callbacks.length > 0) {
              var callback = callbacks.shift();
              if (typeof callback == "function") {
                callback();
                continue;
              }
              var func = callback.func;
              if (typeof func === "number") {
                if (callback.arg === void 0) {
                  Module2["dynCall_v"](func);
                } else {
                  Module2["dynCall_vi"](func, callback.arg);
                }
              } else {
                func(callback.arg === void 0 ? null : callback.arg);
              }
            }
          }
          var __ATPRERUN__ = [];
          var __ATINIT__ = [];
          var __ATMAIN__ = [];
          var __ATPOSTRUN__ = [];
          var runtimeInitialized = false;
          var runtimeExited = false;
          function preRun() {
            if (Module2["preRun"]) {
              if (typeof Module2["preRun"] == "function") Module2["preRun"] = [Module2["preRun"]];
              while (Module2["preRun"].length) {
                addOnPreRun(Module2["preRun"].shift());
              }
            }
            callRuntimeCallbacks(__ATPRERUN__);
          }
          function initRuntime() {
            checkStackCookie();
            assert(!runtimeInitialized);
            runtimeInitialized = true;
            callRuntimeCallbacks(__ATINIT__);
          }
          function preMain() {
            checkStackCookie();
            callRuntimeCallbacks(__ATMAIN__);
          }
          function exitRuntime() {
            checkStackCookie();
            runtimeExited = true;
          }
          function postRun() {
            checkStackCookie();
            if (Module2["postRun"]) {
              if (typeof Module2["postRun"] == "function") Module2["postRun"] = [Module2["postRun"]];
              while (Module2["postRun"].length) {
                addOnPostRun(Module2["postRun"].shift());
              }
            }
            callRuntimeCallbacks(__ATPOSTRUN__);
          }
          function addOnPreRun(cb) {
            __ATPRERUN__.unshift(cb);
          }
          function addOnPostRun(cb) {
            __ATPOSTRUN__.unshift(cb);
          }
          assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
          var runDependencies = 0;
          var runDependencyWatcher = null;
          var dependenciesFulfilled = null;
          var runDependencyTracking = {};
          function addRunDependency(id) {
            runDependencies++;
            if (Module2["monitorRunDependencies"]) {
              Module2["monitorRunDependencies"](runDependencies);
            }
            if (id) {
              assert(!runDependencyTracking[id]);
              runDependencyTracking[id] = 1;
              if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
                runDependencyWatcher = setInterval(function() {
                  if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return;
                  }
                  var shown = false;
                  for (var dep in runDependencyTracking) {
                    if (!shown) {
                      shown = true;
                      err("still waiting on run dependencies:");
                    }
                    err("dependency: " + dep);
                  }
                  if (shown) {
                    err("(end of list)");
                  }
                }, 1e4);
              }
            } else {
              err("warning: run dependency added without ID");
            }
          }
          function removeRunDependency(id) {
            runDependencies--;
            if (Module2["monitorRunDependencies"]) {
              Module2["monitorRunDependencies"](runDependencies);
            }
            if (id) {
              assert(runDependencyTracking[id]);
              delete runDependencyTracking[id];
            } else {
              err("warning: run dependency removed without ID");
            }
            if (runDependencies == 0) {
              if (runDependencyWatcher !== null) {
                clearInterval(runDependencyWatcher);
                runDependencyWatcher = null;
              }
              if (dependenciesFulfilled) {
                var callback = dependenciesFulfilled;
                dependenciesFulfilled = null;
                callback();
              }
            }
          }
          Module2["preloadedImages"] = {};
          Module2["preloadedAudios"] = {};
          function abort(what) {
            if (Module2["onAbort"]) {
              Module2["onAbort"](what);
            }
            what += "";
            out(what);
            err(what);
            ABORT = true;
            EXITSTATUS = 1;
            var extra = "";
            var output = "abort(" + what + ") at " + stackTrace() + extra;
            throw output;
          }
          var FS = { error: function() {
            abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1");
          }, init: function() {
            FS.error();
          }, createDataFile: function() {
            FS.error();
          }, createPreloadedFile: function() {
            FS.error();
          }, createLazyFile: function() {
            FS.error();
          }, open: function() {
            FS.error();
          }, mkdev: function() {
            FS.error();
          }, registerDevice: function() {
            FS.error();
          }, analyzePath: function() {
            FS.error();
          }, loadFilesFromDB: function() {
            FS.error();
          }, ErrnoError: function ErrnoError() {
            FS.error();
          } };
          Module2["FS_createDataFile"] = FS.createDataFile;
          Module2["FS_createPreloadedFile"] = FS.createPreloadedFile;
          var dataURIPrefix = "data:application/octet-stream;base64,";
          function isDataURI(filename) {
            return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0;
          }
          var wasmBinaryFile = "woff2.wasm";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
          function getBinary() {
            try {
              if (wasmBinary) {
                return new Uint8Array(wasmBinary);
              }
              if (readBinary) {
                return readBinary(wasmBinaryFile);
              } else {
                throw "both async and sync fetching of the wasm failed";
              }
            } catch (err2) {
              abort(err2);
            }
          }
          function getBinaryPromise() {
            if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
              return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
                if (!response["ok"]) {
                  throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response["arrayBuffer"]();
              }).catch(function() {
                return getBinary();
              });
            }
            return new Promise(function(resolve, reject) {
              resolve(getBinary());
            });
          }
          function createWasm() {
            var info = { "env": asmLibraryArg, "wasi_unstable": asmLibraryArg, "global": { "NaN": NaN, Infinity: Infinity }, "global.Math": Math, "asm2wasm": asm2wasmImports };
            function receiveInstance(instance, module2) {
              var exports3 = instance.exports;
              Module2["asm"] = exports3;
              removeRunDependency("wasm-instantiate");
            }
            addRunDependency("wasm-instantiate");
            var trueModule = Module2;
            function receiveInstantiatedSource(output) {
              assert(Module2 === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
              trueModule = null;
              receiveInstance(output["instance"]);
            }
            function instantiateArrayBuffer(receiver) {
              return getBinaryPromise().then(function(binary) {
                return WebAssembly.instantiate(binary, info);
              }).then(receiver, function(reason) {
                err("failed to asynchronously prepare wasm: " + reason);
                abort(reason);
              });
            }
            function instantiateAsync() {
              if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function" && typeof process === "object" && process.versions && process.versions.node && +process.versions.node.split(".")[0] < 17) {
                fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
                  var result = WebAssembly.instantiateStreaming(response, info);
                  return result.then(receiveInstantiatedSource, function(reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    instantiateArrayBuffer(receiveInstantiatedSource);
                  });
                });
              } else {
                return instantiateArrayBuffer(receiveInstantiatedSource);
              }
            }
            if (Module2["instantiateWasm"]) {
              try {
                var exports2 = Module2["instantiateWasm"](info, receiveInstance);
                return exports2;
              } catch (e) {
                err("Module.instantiateWasm callback failed with error: " + e);
                return false;
              }
            }
            instantiateAsync();
            return {};
          }
          Module2["asm"] = createWasm;
          __ATINIT__.push({ func: function() {
            globalCtors();
          } });
          var tempDoublePtr = 434096;
          assert(tempDoublePtr % 8 == 0);
          function demangle(func) {
            var __cxa_demangle_func = Module2["___cxa_demangle"] || Module2["__cxa_demangle"];
            assert(__cxa_demangle_func);
            try {
              var s = func;
              if (s.startsWith("__Z")) s = s.substr(1);
              var len = lengthBytesUTF8(s) + 1;
              var buf = _malloc(len);
              stringToUTF8(s, buf, len);
              var status = _malloc(4);
              var ret = __cxa_demangle_func(buf, 0, 0, status);
              if (HEAP32[status >> 2] === 0 && ret) {
                return UTF8ToString(ret);
              }
            } catch (e) {
            } finally {
              if (buf) _free(buf);
              if (status) _free(status);
              if (ret) _free(ret);
            }
            return func;
          }
          function demangleAll(text) {
            var regex = /\b__Z[\w\d_]+/g;
            return text.replace(regex, function(x) {
              var y = demangle(x);
              return x === y ? x : y + " [" + x + "]";
            });
          }
          function jsStackTrace() {
            var err2 = new Error();
            if (!err2.stack) {
              try {
                throw new Error(0);
              } catch (e) {
                err2 = e;
              }
              if (!err2.stack) {
                return "(no stack trace available)";
              }
            }
            return err2.stack.toString();
          }
          function stackTrace() {
            var js = jsStackTrace();
            if (Module2["extraStackTrace"]) js += "\n" + Module2["extraStackTrace"]();
            return demangleAll(js);
          }
          function ___assert_fail(condition, filename, line, func) {
            abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
          }
          function ___cxa_allocate_exception(size) {
            return _malloc(size);
          }
          var ___exception_infos = {};
          var ___exception_last = 0;
          function ___cxa_throw(ptr, type, destructor) {
            ___exception_infos[ptr] = { ptr, adjusted: [ptr], type, destructor, refcount: 0, caught: false, rethrown: false };
            ___exception_last = ptr;
            if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
              __ZSt18uncaught_exceptionv.uncaught_exceptions = 1;
            } else {
              __ZSt18uncaught_exceptionv.uncaught_exceptions++;
            }
            throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
          }
          function ___lock() {
          }
          function ___unlock() {
          }
          var PATH = { splitPath: function(filename) {
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            return splitPathRe.exec(filename).slice(1);
          }, normalizeArray: function(parts, allowAboveRoot) {
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
              var last = parts[i];
              if (last === ".") {
                parts.splice(i, 1);
              } else if (last === "..") {
                parts.splice(i, 1);
                up++;
              } else if (up) {
                parts.splice(i, 1);
                up--;
              }
            }
            if (allowAboveRoot) {
              for (; up; up--) {
                parts.unshift("..");
              }
            }
            return parts;
          }, normalize: function(path) {
            var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
            path = PATH.normalizeArray(path.split("/").filter(function(p) {
              return !!p;
            }), !isAbsolute).join("/");
            if (!path && !isAbsolute) {
              path = ".";
            }
            if (path && trailingSlash) {
              path += "/";
            }
            return (isAbsolute ? "/" : "") + path;
          }, dirname: function(path) {
            var result = PATH.splitPath(path), root = result[0], dir = result[1];
            if (!root && !dir) {
              return ".";
            }
            if (dir) {
              dir = dir.substr(0, dir.length - 1);
            }
            return root + dir;
          }, basename: function(path) {
            if (path === "/") return "/";
            var lastSlash = path.lastIndexOf("/");
            if (lastSlash === -1) return path;
            return path.substr(lastSlash + 1);
          }, extname: function(path) {
            return PATH.splitPath(path)[3];
          }, join: function() {
            var paths = Array.prototype.slice.call(arguments, 0);
            return PATH.normalize(paths.join("/"));
          }, join2: function(l, r) {
            return PATH.normalize(l + "/" + r);
          } };
          var SYSCALLS = { buffers: [null, [], []], printChar: function(stream, curr) {
            var buffer2 = SYSCALLS.buffers[stream];
            assert(buffer2);
            if (curr === 0 || curr === 10) {
              (stream === 1 ? out : err)(UTF8ArrayToString(buffer2, 0));
              buffer2.length = 0;
            } else {
              buffer2.push(curr);
            }
          }, varargs: 0, get: function(varargs) {
            SYSCALLS.varargs += 4;
            var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
            return ret;
          }, getStr: function() {
            var ret = UTF8ToString(SYSCALLS.get());
            return ret;
          }, get64: function() {
            var low = SYSCALLS.get(), high = SYSCALLS.get();
            if (low >= 0) assert(high === 0);
            else assert(high === -1);
            return low;
          }, getZero: function() {
            assert(SYSCALLS.get() === 0);
          } };
          function _fd_close(fd) {
            try {
              abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
              return 0;
            } catch (e) {
              if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
              return e.errno;
            }
          }
          function ___wasi_fd_close() {
            return _fd_close.apply(null, arguments);
          }
          function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
            try {
              abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
              return 0;
            } catch (e) {
              if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
              return e.errno;
            }
          }
          function ___wasi_fd_seek() {
            return _fd_seek.apply(null, arguments);
          }
          function flush_NO_FILESYSTEM() {
            var fflush = Module2["_fflush"];
            if (fflush) fflush(0);
            var buffers = SYSCALLS.buffers;
            if (buffers[1].length) SYSCALLS.printChar(1, 10);
            if (buffers[2].length) SYSCALLS.printChar(2, 10);
          }
          function _fd_write(fd, iov, iovcnt, pnum) {
            try {
              var num = 0;
              for (var i = 0; i < iovcnt; i++) {
                var ptr = HEAP32[iov + i * 8 >> 2];
                var len = HEAP32[iov + (i * 8 + 4) >> 2];
                for (var j = 0; j < len; j++) {
                  SYSCALLS.printChar(fd, HEAPU8[ptr + j]);
                }
                num += len;
              }
              HEAP32[pnum >> 2] = num;
              return 0;
            } catch (e) {
              if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
              return e.errno;
            }
          }
          function ___wasi_fd_write() {
            return _fd_write.apply(null, arguments);
          }
          function getShiftFromSize(size) {
            switch (size) {
              case 1:
                return 0;
              case 2:
                return 1;
              case 4:
                return 2;
              case 8:
                return 3;
              default:
                throw new TypeError("Unknown type size: " + size);
            }
          }
          function embind_init_charCodes() {
            var codes = new Array(256);
            for (var i = 0; i < 256; ++i) {
              codes[i] = String.fromCharCode(i);
            }
            embind_charCodes = codes;
          }
          var embind_charCodes = void 0;
          function readLatin1String(ptr) {
            var ret = "";
            var c = ptr;
            while (HEAPU8[c]) {
              ret += embind_charCodes[HEAPU8[c++]];
            }
            return ret;
          }
          var awaitingDependencies = {};
          var registeredTypes = {};
          var typeDependencies = {};
          var char_0 = 48;
          var char_9 = 57;
          function makeLegalFunctionName(name2) {
            if (void 0 === name2) {
              return "_unknown";
            }
            name2 = name2.replace(/[^a-zA-Z0-9_]/g, "$");
            var f = name2.charCodeAt(0);
            if (f >= char_0 && f <= char_9) {
              return "_" + name2;
            } else {
              return name2;
            }
          }
          function createNamedFunction(name2, body) {
            name2 = makeLegalFunctionName(name2);
            return new Function("body", "return function " + name2 + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(body);
          }
          function extendError(baseErrorType, errorName) {
            var errorClass = createNamedFunction(errorName, function(message) {
              this.name = errorName;
              this.message = message;
              var stack = new Error(message).stack;
              if (stack !== void 0) {
                this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
              }
            });
            errorClass.prototype = Object.create(baseErrorType.prototype);
            errorClass.prototype.constructor = errorClass;
            errorClass.prototype.toString = function() {
              if (this.message === void 0) {
                return this.name;
              } else {
                return this.name + ": " + this.message;
              }
            };
            return errorClass;
          }
          var BindingError = void 0;
          function throwBindingError(message) {
            throw new BindingError(message);
          }
          var InternalError = void 0;
          function throwInternalError(message) {
            throw new InternalError(message);
          }
          function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
            myTypes.forEach(function(type) {
              typeDependencies[type] = dependentTypes;
            });
            function onComplete(typeConverters2) {
              var myTypeConverters = getTypeConverters(typeConverters2);
              if (myTypeConverters.length !== myTypes.length) {
                throwInternalError("Mismatched type converter count");
              }
              for (var i = 0; i < myTypes.length; ++i) {
                registerType(myTypes[i], myTypeConverters[i]);
              }
            }
            var typeConverters = new Array(dependentTypes.length);
            var unregisteredTypes = [];
            var registered = 0;
            dependentTypes.forEach(function(dt, i) {
              if (registeredTypes.hasOwnProperty(dt)) {
                typeConverters[i] = registeredTypes[dt];
              } else {
                unregisteredTypes.push(dt);
                if (!awaitingDependencies.hasOwnProperty(dt)) {
                  awaitingDependencies[dt] = [];
                }
                awaitingDependencies[dt].push(function() {
                  typeConverters[i] = registeredTypes[dt];
                  ++registered;
                  if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                  }
                });
              }
            });
            if (0 === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          }
          function registerType(rawType, registeredInstance, options) {
            options = options || {};
            if (!("argPackAdvance" in registeredInstance)) {
              throw new TypeError("registerType registeredInstance requires argPackAdvance");
            }
            var name2 = registeredInstance.name;
            if (!rawType) {
              throwBindingError('type "' + name2 + '" must have a positive integer typeid pointer');
            }
            if (registeredTypes.hasOwnProperty(rawType)) {
              if (options.ignoreDuplicateRegistrations) {
                return;
              } else {
                throwBindingError("Cannot register type '" + name2 + "' twice");
              }
            }
            registeredTypes[rawType] = registeredInstance;
            delete typeDependencies[rawType];
            if (awaitingDependencies.hasOwnProperty(rawType)) {
              var callbacks = awaitingDependencies[rawType];
              delete awaitingDependencies[rawType];
              callbacks.forEach(function(cb) {
                cb();
              });
            }
          }
          function __embind_register_bool(rawType, name2, size, trueValue, falseValue) {
            var shift = getShiftFromSize(size);
            name2 = readLatin1String(name2);
            registerType(rawType, { name: name2, "fromWireType": function(wt) {
              return !!wt;
            }, "toWireType": function(destructors, o) {
              return o ? trueValue : falseValue;
            }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
              var heap;
              if (size === 1) {
                heap = HEAP8;
              } else if (size === 2) {
                heap = HEAP16;
              } else if (size === 4) {
                heap = HEAP32;
              } else {
                throw new TypeError("Unknown boolean type size: " + name2);
              }
              return this["fromWireType"](heap[pointer >> shift]);
            }, destructorFunction: null });
          }
          function ClassHandle_isAliasOf(other) {
            if (!(this instanceof ClassHandle)) {
              return false;
            }
            if (!(other instanceof ClassHandle)) {
              return false;
            }
            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            var rightClass = other.$$.ptrType.registeredClass;
            var right = other.$$.ptr;
            while (leftClass.baseClass) {
              left = leftClass.upcast(left);
              leftClass = leftClass.baseClass;
            }
            while (rightClass.baseClass) {
              right = rightClass.upcast(right);
              rightClass = rightClass.baseClass;
            }
            return leftClass === rightClass && left === right;
          }
          function shallowCopyInternalPointer(o) {
            return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType };
          }
          function throwInstanceAlreadyDeleted(obj) {
            function getInstanceTypeName(handle) {
              return handle.$$.ptrType.registeredClass.name;
            }
            throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
          }
          var finalizationGroup = false;
          function detachFinalizer(handle) {
          }
          function runDestructor($$) {
            if ($$.smartPtr) {
              $$.smartPtrType.rawDestructor($$.smartPtr);
            } else {
              $$.ptrType.registeredClass.rawDestructor($$.ptr);
            }
          }
          function releaseClassHandle($$) {
            $$.count.value -= 1;
            var toDelete = 0 === $$.count.value;
            if (toDelete) {
              runDestructor($$);
            }
          }
          function attachFinalizer(handle) {
            if ("undefined" === typeof FinalizationGroup) {
              attachFinalizer = function(handle2) {
                return handle2;
              };
              return handle;
            }
            finalizationGroup = new FinalizationGroup(function(iter) {
              for (var result = iter.next(); !result.done; result = iter.next()) {
                var $$ = result.value;
                if (!$$.ptr) {
                  console.warn("object already deleted: " + $$.ptr);
                } else {
                  releaseClassHandle($$);
                }
              }
            });
            attachFinalizer = function(handle2) {
              finalizationGroup.register(handle2, handle2.$$, handle2.$$);
              return handle2;
            };
            detachFinalizer = function(handle2) {
              finalizationGroup.unregister(handle2.$$);
            };
            return attachFinalizer(handle);
          }
          function ClassHandle_clone() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.preservePointerOnDelete) {
              this.$$.count.value += 1;
              return this;
            } else {
              var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
              clone.$$.count.value += 1;
              clone.$$.deleteScheduled = false;
              return clone;
            }
          }
          function ClassHandle_delete() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError("Object already scheduled for deletion");
            }
            detachFinalizer(this);
            releaseClassHandle(this.$$);
            if (!this.$$.preservePointerOnDelete) {
              this.$$.smartPtr = void 0;
              this.$$.ptr = void 0;
            }
          }
          function ClassHandle_isDeleted() {
            return !this.$$.ptr;
          }
          var delayFunction = void 0;
          var deletionQueue = [];
          function flushPendingDeletes() {
            while (deletionQueue.length) {
              var obj = deletionQueue.pop();
              obj.$$.deleteScheduled = false;
              obj["delete"]();
            }
          }
          function ClassHandle_deleteLater() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError("Object already scheduled for deletion");
            }
            deletionQueue.push(this);
            if (deletionQueue.length === 1 && delayFunction) {
              delayFunction(flushPendingDeletes);
            }
            this.$$.deleteScheduled = true;
            return this;
          }
          function init_ClassHandle() {
            ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
            ClassHandle.prototype["clone"] = ClassHandle_clone;
            ClassHandle.prototype["delete"] = ClassHandle_delete;
            ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
            ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater;
          }
          function ClassHandle() {
          }
          var registeredPointers = {};
          function ensureOverloadTable(proto, methodName, humanName) {
            if (void 0 === proto[methodName].overloadTable) {
              var prevFunc = proto[methodName];
              proto[methodName] = function() {
                if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                  throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
                }
                return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
              };
              proto[methodName].overloadTable = [];
              proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
            }
          }
          function exposePublicSymbol(name2, value, numArguments) {
            if (Module2.hasOwnProperty(name2)) {
              if (void 0 === numArguments || void 0 !== Module2[name2].overloadTable && void 0 !== Module2[name2].overloadTable[numArguments]) {
                throwBindingError("Cannot register public name '" + name2 + "' twice");
              }
              ensureOverloadTable(Module2, name2, name2);
              if (Module2.hasOwnProperty(numArguments)) {
                throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
              }
              Module2[name2].overloadTable[numArguments] = value;
            } else {
              Module2[name2] = value;
              if (void 0 !== numArguments) {
                Module2[name2].numArguments = numArguments;
              }
            }
          }
          function RegisteredClass(name2, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
            this.name = name2;
            this.constructor = constructor;
            this.instancePrototype = instancePrototype;
            this.rawDestructor = rawDestructor;
            this.baseClass = baseClass;
            this.getActualType = getActualType;
            this.upcast = upcast;
            this.downcast = downcast;
            this.pureVirtualFunctions = [];
          }
          function upcastPointer(ptr, ptrClass, desiredClass) {
            while (ptrClass !== desiredClass) {
              if (!ptrClass.upcast) {
                throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
              }
              ptr = ptrClass.upcast(ptr);
              ptrClass = ptrClass.baseClass;
            }
            return ptr;
          }
          function constNoSmartPtrRawPointerToWireType(destructors, handle) {
            if (handle === null) {
              if (this.isReference) {
                throwBindingError("null is not a valid " + this.name);
              }
              return 0;
            }
            if (!handle.$$) {
              throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
            }
            if (!handle.$$.ptr) {
              throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
            return ptr;
          }
          function genericPointerToWireType(destructors, handle) {
            var ptr;
            if (handle === null) {
              if (this.isReference) {
                throwBindingError("null is not a valid " + this.name);
              }
              if (this.isSmartPointer) {
                ptr = this.rawConstructor();
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
                return ptr;
              } else {
                return 0;
              }
            }
            if (!handle.$$) {
              throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
            }
            if (!handle.$$.ptr) {
              throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
            }
            if (!this.isConst && handle.$$.ptrType.isConst) {
              throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
            if (this.isSmartPointer) {
              if (void 0 === handle.$$.smartPtr) {
                throwBindingError("Passing raw pointer to smart pointer is illegal");
              }
              switch (this.sharingPolicy) {
                case 0:
                  if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                  } else {
                    throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
                  }
                  break;
                case 1:
                  ptr = handle.$$.smartPtr;
                  break;
                case 2:
                  if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                  } else {
                    var clonedHandle = handle["clone"]();
                    ptr = this.rawShare(ptr, __emval_register(function() {
                      clonedHandle["delete"]();
                    }));
                    if (destructors !== null) {
                      destructors.push(this.rawDestructor, ptr);
                    }
                  }
                  break;
                default:
                  throwBindingError("Unsupporting sharing policy");
              }
            }
            return ptr;
          }
          function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
            if (handle === null) {
              if (this.isReference) {
                throwBindingError("null is not a valid " + this.name);
              }
              return 0;
            }
            if (!handle.$$) {
              throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
            }
            if (!handle.$$.ptr) {
              throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
            }
            if (handle.$$.ptrType.isConst) {
              throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
            return ptr;
          }
          function simpleReadValueFromPointer(pointer) {
            return this["fromWireType"](HEAPU32[pointer >> 2]);
          }
          function RegisteredPointer_getPointee(ptr) {
            if (this.rawGetPointee) {
              ptr = this.rawGetPointee(ptr);
            }
            return ptr;
          }
          function RegisteredPointer_destructor(ptr) {
            if (this.rawDestructor) {
              this.rawDestructor(ptr);
            }
          }
          function RegisteredPointer_deleteObject(handle) {
            if (handle !== null) {
              handle["delete"]();
            }
          }
          function downcastPointer(ptr, ptrClass, desiredClass) {
            if (ptrClass === desiredClass) {
              return ptr;
            }
            if (void 0 === desiredClass.baseClass) {
              return null;
            }
            var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
            if (rv === null) {
              return null;
            }
            return desiredClass.downcast(rv);
          }
          function getInheritedInstanceCount() {
            return Object.keys(registeredInstances).length;
          }
          function getLiveInheritedInstances() {
            var rv = [];
            for (var k in registeredInstances) {
              if (registeredInstances.hasOwnProperty(k)) {
                rv.push(registeredInstances[k]);
              }
            }
            return rv;
          }
          function setDelayFunction(fn) {
            delayFunction = fn;
            if (deletionQueue.length && delayFunction) {
              delayFunction(flushPendingDeletes);
            }
          }
          function init_embind() {
            Module2["getInheritedInstanceCount"] = getInheritedInstanceCount;
            Module2["getLiveInheritedInstances"] = getLiveInheritedInstances;
            Module2["flushPendingDeletes"] = flushPendingDeletes;
            Module2["setDelayFunction"] = setDelayFunction;
          }
          var registeredInstances = {};
          function getBasestPointer(class_, ptr) {
            if (ptr === void 0) {
              throwBindingError("ptr should not be undefined");
            }
            while (class_.baseClass) {
              ptr = class_.upcast(ptr);
              class_ = class_.baseClass;
            }
            return ptr;
          }
          function getInheritedInstance(class_, ptr) {
            ptr = getBasestPointer(class_, ptr);
            return registeredInstances[ptr];
          }
          function makeClassHandle(prototype, record) {
            if (!record.ptrType || !record.ptr) {
              throwInternalError("makeClassHandle requires ptr and ptrType");
            }
            var hasSmartPtrType = !!record.smartPtrType;
            var hasSmartPtr = !!record.smartPtr;
            if (hasSmartPtrType !== hasSmartPtr) {
              throwInternalError("Both smartPtrType and smartPtr must be specified");
            }
            record.count = { value: 1 };
            return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
          }
          function RegisteredPointer_fromWireType(ptr) {
            var rawPointer = this.getPointee(ptr);
            if (!rawPointer) {
              this.destructor(ptr);
              return null;
            }
            var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
            if (void 0 !== registeredInstance) {
              if (0 === registeredInstance.$$.count.value) {
                registeredInstance.$$.ptr = rawPointer;
                registeredInstance.$$.smartPtr = ptr;
                return registeredInstance["clone"]();
              } else {
                var rv = registeredInstance["clone"]();
                this.destructor(ptr);
                return rv;
              }
            }
            function makeDefaultHandle() {
              if (this.isSmartPointer) {
                return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
              } else {
                return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
              }
            }
            var actualType = this.registeredClass.getActualType(rawPointer);
            var registeredPointerRecord = registeredPointers[actualType];
            if (!registeredPointerRecord) {
              return makeDefaultHandle.call(this);
            }
            var toType;
            if (this.isConst) {
              toType = registeredPointerRecord.constPointerType;
            } else {
              toType = registeredPointerRecord.pointerType;
            }
            var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
            if (dp === null) {
              return makeDefaultHandle.call(this);
            }
            if (this.isSmartPointer) {
              return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
            } else {
              return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
            }
          }
          function init_RegisteredPointer() {
            RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
            RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
            RegisteredPointer.prototype["argPackAdvance"] = 8;
            RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
            RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
            RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType;
          }
          function RegisteredPointer(name2, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
            this.name = name2;
            this.registeredClass = registeredClass;
            this.isReference = isReference;
            this.isConst = isConst;
            this.isSmartPointer = isSmartPointer;
            this.pointeeType = pointeeType;
            this.sharingPolicy = sharingPolicy;
            this.rawGetPointee = rawGetPointee;
            this.rawConstructor = rawConstructor;
            this.rawShare = rawShare;
            this.rawDestructor = rawDestructor;
            if (!isSmartPointer && registeredClass.baseClass === void 0) {
              if (isConst) {
                this["toWireType"] = constNoSmartPtrRawPointerToWireType;
                this.destructorFunction = null;
              } else {
                this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
                this.destructorFunction = null;
              }
            } else {
              this["toWireType"] = genericPointerToWireType;
            }
          }
          function replacePublicSymbol(name2, value, numArguments) {
            if (!Module2.hasOwnProperty(name2)) {
              throwInternalError("Replacing nonexistant public symbol");
            }
            if (void 0 !== Module2[name2].overloadTable && void 0 !== numArguments) {
              Module2[name2].overloadTable[numArguments] = value;
            } else {
              Module2[name2] = value;
              Module2[name2].argCount = numArguments;
            }
          }
          function embind__requireFunction(signature, rawFunction) {
            signature = readLatin1String(signature);
            function makeDynCaller(dynCall) {
              var args = [];
              for (var i = 1; i < signature.length; ++i) {
                args.push("a" + i);
              }
              var name2 = "dynCall_" + signature + "_" + rawFunction;
              var body = "return function " + name2 + "(" + args.join(", ") + ") {\n";
              body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n";
              body += "};\n";
              return new Function("dynCall", "rawFunction", body)(dynCall, rawFunction);
            }
            var fp;
            if (Module2["FUNCTION_TABLE_" + signature] !== void 0) {
              fp = Module2["FUNCTION_TABLE_" + signature][rawFunction];
            } else if (typeof FUNCTION_TABLE !== "undefined") {
              fp = FUNCTION_TABLE[rawFunction];
            } else {
              var dc = Module2["dynCall_" + signature];
              if (dc === void 0) {
                dc = Module2["dynCall_" + signature.replace(/f/g, "d")];
                if (dc === void 0) {
                  throwBindingError("No dynCall invoker for signature: " + signature);
                }
              }
              fp = makeDynCaller(dc);
            }
            if (typeof fp !== "function") {
              throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
            }
            return fp;
          }
          var UnboundTypeError = void 0;
          function getTypeName(type) {
            var ptr = ___getTypeName(type);
            var rv = readLatin1String(ptr);
            _free(ptr);
            return rv;
          }
          function throwUnboundTypeError(message, types) {
            var unboundTypes = [];
            var seen = {};
            function visit(type) {
              if (seen[type]) {
                return;
              }
              if (registeredTypes[type]) {
                return;
              }
              if (typeDependencies[type]) {
                typeDependencies[type].forEach(visit);
                return;
              }
              unboundTypes.push(type);
              seen[type] = true;
            }
            types.forEach(visit);
            throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
          }
          function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name2, destructorSignature, rawDestructor) {
            name2 = readLatin1String(name2);
            getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
            if (upcast) {
              upcast = embind__requireFunction(upcastSignature, upcast);
            }
            if (downcast) {
              downcast = embind__requireFunction(downcastSignature, downcast);
            }
            rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
            var legalFunctionName = makeLegalFunctionName(name2);
            exposePublicSymbol(legalFunctionName, function() {
              throwUnboundTypeError("Cannot construct " + name2 + " due to unbound types", [baseClassRawType]);
            });
            whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
              base = base[0];
              var baseClass;
              var basePrototype;
              if (baseClassRawType) {
                baseClass = base.registeredClass;
                basePrototype = baseClass.instancePrototype;
              } else {
                basePrototype = ClassHandle.prototype;
              }
              var constructor = createNamedFunction(legalFunctionName, function() {
                if (Object.getPrototypeOf(this) !== instancePrototype) {
                  throw new BindingError("Use 'new' to construct " + name2);
                }
                if (void 0 === registeredClass.constructor_body) {
                  throw new BindingError(name2 + " has no accessible constructor");
                }
                var body = registeredClass.constructor_body[arguments.length];
                if (void 0 === body) {
                  throw new BindingError("Tried to invoke ctor of " + name2 + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                }
                return body.apply(this, arguments);
              });
              var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
              constructor.prototype = instancePrototype;
              var registeredClass = new RegisteredClass(name2, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
              var referenceConverter = new RegisteredPointer(name2, registeredClass, true, false, false);
              var pointerConverter = new RegisteredPointer(name2 + "*", registeredClass, false, false, false);
              var constPointerConverter = new RegisteredPointer(name2 + " const*", registeredClass, false, true, false);
              registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
              replacePublicSymbol(legalFunctionName, constructor);
              return [referenceConverter, pointerConverter, constPointerConverter];
            });
          }
          function heap32VectorToArray(count, firstElement) {
            var array = [];
            for (var i = 0; i < count; i++) {
              array.push(HEAP32[(firstElement >> 2) + i]);
            }
            return array;
          }
          function runDestructors(destructors) {
            while (destructors.length) {
              var ptr = destructors.pop();
              var del = destructors.pop();
              del(ptr);
            }
          }
          function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
            var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
            invoker = embind__requireFunction(invokerSignature, invoker);
            whenDependentTypesAreResolved([], [rawClassType], function(classType) {
              classType = classType[0];
              var humanName = "constructor " + classType.name;
              if (void 0 === classType.registeredClass.constructor_body) {
                classType.registeredClass.constructor_body = [];
              }
              if (void 0 !== classType.registeredClass.constructor_body[argCount - 1]) {
                throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
              }
              classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
                throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes);
              };
              whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
                classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                  if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + " called with " + arguments.length + " arguments, expected " + (argCount - 1));
                  }
                  var destructors = [];
                  var args = new Array(argCount);
                  args[0] = rawConstructor;
                  for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]["toWireType"](destructors, arguments[i - 1]);
                  }
                  var ptr = invoker.apply(null, args);
                  runDestructors(destructors);
                  return argTypes[0]["fromWireType"](ptr);
                };
                return [];
              });
              return [];
            });
          }
          function new_(constructor, argumentList) {
            if (!(constructor instanceof Function)) {
              throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
            }
            var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {
            });
            dummy.prototype = constructor.prototype;
            var obj = new dummy();
            var r = constructor.apply(obj, argumentList);
            return r instanceof Object ? r : obj;
          }
          function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
            var argCount = argTypes.length;
            if (argCount < 2) {
              throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
            }
            var isClassMethodFunc = argTypes[1] !== null && classType !== null;
            var needsDestructorStack = false;
            for (var i = 1; i < argTypes.length; ++i) {
              if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
                needsDestructorStack = true;
                break;
              }
            }
            var returns = argTypes[0].name !== "void";
            var argsList = "";
            var argsListWired = "";
            for (var i = 0; i < argCount - 2; ++i) {
              argsList += (i !== 0 ? ", " : "") + "arg" + i;
              argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
            }
            var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\nif (arguments.length !== " + (argCount - 2) + ") {\nthrowBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n}\n";
            if (needsDestructorStack) {
              invokerFnBody += "var destructors = [];\n";
            }
            var dtorStack = needsDestructorStack ? "destructors" : "null";
            var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
            var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
            if (isClassMethodFunc) {
              invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
            }
            for (var i = 0; i < argCount - 2; ++i) {
              invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
              args1.push("argType" + i);
              args2.push(argTypes[i + 2]);
            }
            if (isClassMethodFunc) {
              argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
            }
            invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
            if (needsDestructorStack) {
              invokerFnBody += "runDestructors(destructors);\n";
            } else {
              for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
                var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
                if (argTypes[i].destructorFunction !== null) {
                  invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                  args1.push(paramName + "_dtor");
                  args2.push(argTypes[i].destructorFunction);
                }
              }
            }
            if (returns) {
              invokerFnBody += "var ret = retType.fromWireType(rv);\nreturn ret;\n";
            } else {
            }
            invokerFnBody += "}\n";
            args1.push(invokerFnBody);
            var invokerFunction = new_(Function, args1).apply(null, args2);
            return invokerFunction;
          }
          function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
            var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
            methodName = readLatin1String(methodName);
            rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
            whenDependentTypesAreResolved([], [rawClassType], function(classType) {
              classType = classType[0];
              var humanName = classType.name + "." + methodName;
              if (isPureVirtual) {
                classType.registeredClass.pureVirtualFunctions.push(methodName);
              }
              function unboundTypesHandler() {
                throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
              }
              var proto = classType.registeredClass.instancePrototype;
              var method = proto[methodName];
              if (void 0 === method || void 0 === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
                unboundTypesHandler.argCount = argCount - 2;
                unboundTypesHandler.className = classType.name;
                proto[methodName] = unboundTypesHandler;
              } else {
                ensureOverloadTable(proto, methodName, humanName);
                proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
              }
              whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
                var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
                if (void 0 === proto[methodName].overloadTable) {
                  memberFunction.argCount = argCount - 2;
                  proto[methodName] = memberFunction;
                } else {
                  proto[methodName].overloadTable[argCount - 2] = memberFunction;
                }
                return [];
              });
              return [];
            });
          }
          var emval_free_list = [];
          var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
          function __emval_decref(handle) {
            if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
              emval_handle_array[handle] = void 0;
              emval_free_list.push(handle);
            }
          }
          function count_emval_handles() {
            var count = 0;
            for (var i = 5; i < emval_handle_array.length; ++i) {
              if (emval_handle_array[i] !== void 0) {
                ++count;
              }
            }
            return count;
          }
          function get_first_emval() {
            for (var i = 5; i < emval_handle_array.length; ++i) {
              if (emval_handle_array[i] !== void 0) {
                return emval_handle_array[i];
              }
            }
            return null;
          }
          function init_emval() {
            Module2["count_emval_handles"] = count_emval_handles;
            Module2["get_first_emval"] = get_first_emval;
          }
          function __emval_register(value) {
            switch (value) {
              case void 0: {
                return 1;
              }
              case null: {
                return 2;
              }
              case true: {
                return 3;
              }
              case false: {
                return 4;
              }
              default: {
                var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
                emval_handle_array[handle] = { refcount: 1, value };
                return handle;
              }
            }
          }
          function __embind_register_emval(rawType, name2) {
            name2 = readLatin1String(name2);
            registerType(rawType, { name: name2, "fromWireType": function(handle) {
              var rv = emval_handle_array[handle].value;
              __emval_decref(handle);
              return rv;
            }, "toWireType": function(destructors, value) {
              return __emval_register(value);
            }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
          }
          function _embind_repr(v) {
            if (v === null) {
              return "null";
            }
            var t = typeof v;
            if (t === "object" || t === "array" || t === "function") {
              return v.toString();
            } else {
              return "" + v;
            }
          }
          function floatReadValueFromPointer(name2, shift) {
            switch (shift) {
              case 2:
                return function(pointer) {
                  return this["fromWireType"](HEAPF32[pointer >> 2]);
                };
              case 3:
                return function(pointer) {
                  return this["fromWireType"](HEAPF64[pointer >> 3]);
                };
              default:
                throw new TypeError("Unknown float type: " + name2);
            }
          }
          function __embind_register_float(rawType, name2, size) {
            var shift = getShiftFromSize(size);
            name2 = readLatin1String(name2);
            registerType(rawType, { name: name2, "fromWireType": function(value) {
              return value;
            }, "toWireType": function(destructors, value) {
              if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              return value;
            }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name2, shift), destructorFunction: null });
          }
          function __embind_register_function(name2, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
            var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
            name2 = readLatin1String(name2);
            rawInvoker = embind__requireFunction(signature, rawInvoker);
            exposePublicSymbol(name2, function() {
              throwUnboundTypeError("Cannot call " + name2 + " due to unbound types", argTypes);
            }, argCount - 1);
            whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
              var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
              replacePublicSymbol(name2, craftInvokerFunction(name2, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
              return [];
            });
          }
          function integerReadValueFromPointer(name2, shift, signed) {
            switch (shift) {
              case 0:
                return signed ? function readS8FromPointer(pointer) {
                  return HEAP8[pointer];
                } : function readU8FromPointer(pointer) {
                  return HEAPU8[pointer];
                };
              case 1:
                return signed ? function readS16FromPointer(pointer) {
                  return HEAP16[pointer >> 1];
                } : function readU16FromPointer(pointer) {
                  return HEAPU16[pointer >> 1];
                };
              case 2:
                return signed ? function readS32FromPointer(pointer) {
                  return HEAP32[pointer >> 2];
                } : function readU32FromPointer(pointer) {
                  return HEAPU32[pointer >> 2];
                };
              default:
                throw new TypeError("Unknown integer type: " + name2);
            }
          }
          function __embind_register_integer(primitiveType, name2, size, minRange, maxRange) {
            name2 = readLatin1String(name2);
            if (maxRange === -1) {
              maxRange = 4294967295;
            }
            var shift = getShiftFromSize(size);
            var fromWireType = function(value) {
              return value;
            };
            if (minRange === 0) {
              var bitshift = 32 - 8 * size;
              fromWireType = function(value) {
                return value << bitshift >>> bitshift;
              };
            }
            var isUnsignedType = name2.indexOf("unsigned") != -1;
            registerType(primitiveType, { name: name2, "fromWireType": fromWireType, "toWireType": function(destructors, value) {
              if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name2 + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
              }
              return isUnsignedType ? value >>> 0 : value | 0;
            }, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name2, shift, minRange !== 0), destructorFunction: null });
          }
          function __embind_register_memory_view(rawType, dataTypeIndex, name2) {
            var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
            var TA = typeMapping[dataTypeIndex];
            function decodeMemoryView(handle) {
              handle = handle >> 2;
              var heap = HEAPU32;
              var size = heap[handle];
              var data = heap[handle + 1];
              return new TA(heap["buffer"], data, size);
            }
            name2 = readLatin1String(name2);
            registerType(rawType, { name: name2, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
          }
          function __embind_register_std_string(rawType, name2) {
            name2 = readLatin1String(name2);
            var stdStringIsUTF8 = name2 === "std::string";
            registerType(rawType, { name: name2, "fromWireType": function(value) {
              var length = HEAPU32[value >> 2];
              var str;
              if (stdStringIsUTF8) {
                var endChar = HEAPU8[value + 4 + length];
                var endCharSwap = 0;
                if (endChar != 0) {
                  endCharSwap = endChar;
                  HEAPU8[value + 4 + length] = 0;
                }
                var decodeStartPtr = value + 4;
                for (var i = 0; i <= length; ++i) {
                  var currentBytePtr = value + 4 + i;
                  if (HEAPU8[currentBytePtr] == 0) {
                    var stringSegment = UTF8ToString(decodeStartPtr);
                    if (str === void 0) str = stringSegment;
                    else {
                      str += String.fromCharCode(0);
                      str += stringSegment;
                    }
                    decodeStartPtr = currentBytePtr + 1;
                  }
                }
                if (endCharSwap != 0) HEAPU8[value + 4 + length] = endCharSwap;
              } else {
                var a = new Array(length);
                for (var i = 0; i < length; ++i) {
                  a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
                }
                str = a.join("");
              }
              _free(value);
              return str;
            }, "toWireType": function(destructors, value) {
              if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
              }
              var getLength;
              var valueIsOfTypeString = typeof value === "string";
              if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                throwBindingError("Cannot pass non-string to std::string");
              }
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                getLength = function() {
                  return lengthBytesUTF8(value);
                };
              } else {
                getLength = function() {
                  return value.length;
                };
              }
              var length = getLength();
              var ptr = _malloc(4 + length + 1);
              HEAPU32[ptr >> 2] = length;
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                stringToUTF8(value, ptr + 4, length + 1);
              } else {
                if (valueIsOfTypeString) {
                  for (var i = 0; i < length; ++i) {
                    var charCode = value.charCodeAt(i);
                    if (charCode > 255) {
                      _free(ptr);
                      throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                    }
                    HEAPU8[ptr + 4 + i] = charCode;
                  }
                } else {
                  for (var i = 0; i < length; ++i) {
                    HEAPU8[ptr + 4 + i] = value[i];
                  }
                }
              }
              if (destructors !== null) {
                destructors.push(_free, ptr);
              }
              return ptr;
            }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
              _free(ptr);
            } });
          }
          function __embind_register_std_wstring(rawType, charSize, name2) {
            name2 = readLatin1String(name2);
            var getHeap, shift;
            if (charSize === 2) {
              getHeap = function() {
                return HEAPU16;
              };
              shift = 1;
            } else if (charSize === 4) {
              getHeap = function() {
                return HEAPU32;
              };
              shift = 2;
            }
            registerType(rawType, { name: name2, "fromWireType": function(value) {
              var HEAP = getHeap();
              var length = HEAPU32[value >> 2];
              var a = new Array(length);
              var start = value + 4 >> shift;
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i]);
              }
              _free(value);
              return a.join("");
            }, "toWireType": function(destructors, value) {
              var length = value.length;
              var ptr = _malloc(4 + length * charSize);
              var HEAP = getHeap();
              HEAPU32[ptr >> 2] = length;
              var start = ptr + 4 >> shift;
              for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i);
              }
              if (destructors !== null) {
                destructors.push(_free, ptr);
              }
              return ptr;
            }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
              _free(ptr);
            } });
          }
          function __embind_register_void(rawType, name2) {
            name2 = readLatin1String(name2);
            registerType(rawType, { isVoid: true, name: name2, "argPackAdvance": 0, "fromWireType": function() {
              return void 0;
            }, "toWireType": function(destructors, o) {
              return void 0;
            } });
          }
          function __emval_incref(handle) {
            if (handle > 4) {
              emval_handle_array[handle].refcount += 1;
            }
          }
          function requireRegisteredType(rawType, humanName) {
            var impl = registeredTypes[rawType];
            if (void 0 === impl) {
              throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
            }
            return impl;
          }
          function __emval_take_value(type, argv) {
            type = requireRegisteredType(type, "_emval_take_value");
            var v = type["readValueFromPointer"](argv);
            return __emval_register(v);
          }
          function _abort() {
            abort();
          }
          function _emscripten_get_heap_size() {
            return HEAP8.length;
          }
          function emscripten_realloc_buffer(size) {
            try {
              wasmMemory.grow(size - buffer.byteLength + 65535 >> 16);
              updateGlobalBufferAndViews(wasmMemory.buffer);
              return 1;
            } catch (e) {
              console.error("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
            }
          }
          function _emscripten_resize_heap(requestedSize) {
            var oldSize = _emscripten_get_heap_size();
            assert(requestedSize > oldSize);
            var PAGE_MULTIPLE = 65536;
            var LIMIT = 2147483648 - PAGE_MULTIPLE;
            if (requestedSize > LIMIT) {
              err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + LIMIT + " bytes!");
              return false;
            }
            var MIN_TOTAL_MEMORY = 16777216;
            var newSize = Math.max(oldSize, MIN_TOTAL_MEMORY);
            while (newSize < requestedSize) {
              if (newSize <= 536870912) {
                newSize = alignUp(2 * newSize, PAGE_MULTIPLE);
              } else {
                newSize = Math.min(alignUp((3 * newSize + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
              }
              if (newSize === oldSize) {
                warnOnce("Cannot ask for more memory since we reached the practical limit in browsers (which is just below 2GB), so the request would have failed. Requesting only " + HEAP8.length);
              }
            }
            var replacement = emscripten_realloc_buffer(newSize);
            if (!replacement) {
              err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
              return false;
            }
            return true;
          }
          function _exit(status) {
            exit(status);
          }
          function _llvm_log2_f32(x) {
            return Math.log(x) / Math.LN2;
          }
          function _llvm_log2_f64(a0) {
            return _llvm_log2_f32(a0);
          }
          function _llvm_trap() {
            abort("trap!");
          }
          function _emscripten_memcpy_big(dest, src, num) {
            HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
          }
          embind_init_charCodes();
          BindingError = Module2["BindingError"] = extendError(Error, "BindingError");
          InternalError = Module2["InternalError"] = extendError(Error, "InternalError");
          init_ClassHandle();
          init_RegisteredPointer();
          init_embind();
          UnboundTypeError = Module2["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
          init_emval();
          function nullFunc_i(x) {
            abortFnPtrError(x, "i");
          }
          function nullFunc_ii(x) {
            abortFnPtrError(x, "ii");
          }
          function nullFunc_iidiiii(x) {
            abortFnPtrError(x, "iidiiii");
          }
          function nullFunc_iii(x) {
            abortFnPtrError(x, "iii");
          }
          function nullFunc_iiii(x) {
            abortFnPtrError(x, "iiii");
          }
          function nullFunc_iiiii(x) {
            abortFnPtrError(x, "iiiii");
          }
          function nullFunc_jiji(x) {
            abortFnPtrError(x, "jiji");
          }
          function nullFunc_v(x) {
            abortFnPtrError(x, "v");
          }
          function nullFunc_vi(x) {
            abortFnPtrError(x, "vi");
          }
          function nullFunc_vii(x) {
            abortFnPtrError(x, "vii");
          }
          function nullFunc_viii(x) {
            abortFnPtrError(x, "viii");
          }
          function nullFunc_viiii(x) {
            abortFnPtrError(x, "viiii");
          }
          function nullFunc_viiiii(x) {
            abortFnPtrError(x, "viiiii");
          }
          function nullFunc_viiiiii(x) {
            abortFnPtrError(x, "viiiiii");
          }
          var asmGlobalArg = {};
          var asmLibraryArg = { "___assert_fail": ___assert_fail, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_throw": ___cxa_throw, "___lock": ___lock, "___unlock": ___unlock, "___wasi_fd_close": ___wasi_fd_close, "___wasi_fd_seek": ___wasi_fd_seek, "___wasi_fd_write": ___wasi_fd_write, "__embind_register_bool": __embind_register_bool, "__embind_register_class": __embind_register_class, "__embind_register_class_constructor": __embind_register_class_constructor, "__embind_register_class_function": __embind_register_class_function, "__embind_register_emval": __embind_register_emval, "__embind_register_float": __embind_register_float, "__embind_register_function": __embind_register_function, "__embind_register_integer": __embind_register_integer, "__embind_register_memory_view": __embind_register_memory_view, "__embind_register_std_string": __embind_register_std_string, "__embind_register_std_wstring": __embind_register_std_wstring, "__embind_register_void": __embind_register_void, "__emval_decref": __emval_decref, "__emval_incref": __emval_incref, "__emval_take_value": __emval_take_value, "__memory_base": 1024, "__table_base": 0, "_abort": _abort, "_emscripten_get_heap_size": _emscripten_get_heap_size, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_emscripten_resize_heap": _emscripten_resize_heap, "_exit": _exit, "_llvm_log2_f64": _llvm_log2_f64, "_llvm_trap": _llvm_trap, "abortStackOverflow": abortStackOverflow, "memory": wasmMemory, "nullFunc_i": nullFunc_i, "nullFunc_ii": nullFunc_ii, "nullFunc_iidiiii": nullFunc_iidiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_iiii": nullFunc_iiii, "nullFunc_iiiii": nullFunc_iiiii, "nullFunc_jiji": nullFunc_jiji, "nullFunc_v": nullFunc_v, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_viii": nullFunc_viii, "nullFunc_viiii": nullFunc_viiii, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_viiiiii": nullFunc_viiiiii, "setTempRet0": setTempRet0, "table": wasmTable };
          var asm = Module2["asm"](asmGlobalArg, asmLibraryArg, buffer);
          Module2["asm"] = asm;
          var __ZSt18uncaught_exceptionv = Module2["__ZSt18uncaught_exceptionv"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["__ZSt18uncaught_exceptionv"].apply(null, arguments);
          };
          var ___cxa_demangle = Module2["___cxa_demangle"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["___cxa_demangle"].apply(null, arguments);
          };
          var ___embind_register_native_and_builtin_types = Module2["___embind_register_native_and_builtin_types"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["___embind_register_native_and_builtin_types"].apply(null, arguments);
          };
          var ___getTypeName = Module2["___getTypeName"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["___getTypeName"].apply(null, arguments);
          };
          var _fflush = Module2["_fflush"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["_fflush"].apply(null, arguments);
          };
          var _free = Module2["_free"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["_free"].apply(null, arguments);
          };
          var _malloc = Module2["_malloc"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["_malloc"].apply(null, arguments);
          };
          var establishStackSpace = Module2["establishStackSpace"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["establishStackSpace"].apply(null, arguments);
          };
          var globalCtors = Module2["globalCtors"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["globalCtors"].apply(null, arguments);
          };
          var stackAlloc = Module2["stackAlloc"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["stackAlloc"].apply(null, arguments);
          };
          var stackRestore = Module2["stackRestore"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["stackRestore"].apply(null, arguments);
          };
          var stackSave = Module2["stackSave"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["stackSave"].apply(null, arguments);
          };
          var dynCall_i = Module2["dynCall_i"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_i"].apply(null, arguments);
          };
          var dynCall_ii = Module2["dynCall_ii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_ii"].apply(null, arguments);
          };
          var dynCall_iidiiii = Module2["dynCall_iidiiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_iidiiii"].apply(null, arguments);
          };
          var dynCall_iii = Module2["dynCall_iii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_iii"].apply(null, arguments);
          };
          var dynCall_iiii = Module2["dynCall_iiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_iiii"].apply(null, arguments);
          };
          var dynCall_iiiii = Module2["dynCall_iiiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_iiiii"].apply(null, arguments);
          };
          var dynCall_jiji = Module2["dynCall_jiji"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_jiji"].apply(null, arguments);
          };
          var dynCall_v = Module2["dynCall_v"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_v"].apply(null, arguments);
          };
          var dynCall_vi = Module2["dynCall_vi"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_vi"].apply(null, arguments);
          };
          var dynCall_vii = Module2["dynCall_vii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_vii"].apply(null, arguments);
          };
          var dynCall_viii = Module2["dynCall_viii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_viii"].apply(null, arguments);
          };
          var dynCall_viiii = Module2["dynCall_viiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_viiii"].apply(null, arguments);
          };
          var dynCall_viiiii = Module2["dynCall_viiiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_viiiii"].apply(null, arguments);
          };
          var dynCall_viiiiii = Module2["dynCall_viiiiii"] = function() {
            assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
            assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
            return Module2["asm"]["dynCall_viiiiii"].apply(null, arguments);
          };
          Module2["asm"] = asm;
          if (!Object.getOwnPropertyDescriptor(Module2, "intArrayFromString")) Module2["intArrayFromString"] = function() {
            abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "intArrayToString")) Module2["intArrayToString"] = function() {
            abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          Module2["ccall"] = ccall;
          Module2["cwrap"] = cwrap;
          if (!Object.getOwnPropertyDescriptor(Module2, "setValue")) Module2["setValue"] = function() {
            abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getValue")) Module2["getValue"] = function() {
            abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "allocate")) Module2["allocate"] = function() {
            abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getMemory")) Module2["getMemory"] = function() {
            abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "AsciiToString")) Module2["AsciiToString"] = function() {
            abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stringToAscii")) Module2["stringToAscii"] = function() {
            abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "UTF8ArrayToString")) Module2["UTF8ArrayToString"] = function() {
            abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "UTF8ToString")) Module2["UTF8ToString"] = function() {
            abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stringToUTF8Array")) Module2["stringToUTF8Array"] = function() {
            abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          Module2["stringToUTF8"] = stringToUTF8;
          if (!Object.getOwnPropertyDescriptor(Module2, "lengthBytesUTF8")) Module2["lengthBytesUTF8"] = function() {
            abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "UTF16ToString")) Module2["UTF16ToString"] = function() {
            abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stringToUTF16")) Module2["stringToUTF16"] = function() {
            abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "lengthBytesUTF16")) Module2["lengthBytesUTF16"] = function() {
            abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "UTF32ToString")) Module2["UTF32ToString"] = function() {
            abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stringToUTF32")) Module2["stringToUTF32"] = function() {
            abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "lengthBytesUTF32")) Module2["lengthBytesUTF32"] = function() {
            abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "allocateUTF8")) Module2["allocateUTF8"] = function() {
            abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stackTrace")) Module2["stackTrace"] = function() {
            abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addOnPreRun")) Module2["addOnPreRun"] = function() {
            abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addOnInit")) Module2["addOnInit"] = function() {
            abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addOnPreMain")) Module2["addOnPreMain"] = function() {
            abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addOnExit")) Module2["addOnExit"] = function() {
            abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addOnPostRun")) Module2["addOnPostRun"] = function() {
            abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "writeStringToMemory")) Module2["writeStringToMemory"] = function() {
            abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "writeArrayToMemory")) Module2["writeArrayToMemory"] = function() {
            abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "writeAsciiToMemory")) Module2["writeAsciiToMemory"] = function() {
            abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addRunDependency")) Module2["addRunDependency"] = function() {
            abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "removeRunDependency")) Module2["removeRunDependency"] = function() {
            abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "ENV")) Module2["ENV"] = function() {
            abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS")) Module2["FS"] = function() {
            abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createFolder")) Module2["FS_createFolder"] = function() {
            abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createPath")) Module2["FS_createPath"] = function() {
            abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createDataFile")) Module2["FS_createDataFile"] = function() {
            abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createPreloadedFile")) Module2["FS_createPreloadedFile"] = function() {
            abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createLazyFile")) Module2["FS_createLazyFile"] = function() {
            abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createLink")) Module2["FS_createLink"] = function() {
            abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_createDevice")) Module2["FS_createDevice"] = function() {
            abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "FS_unlink")) Module2["FS_unlink"] = function() {
            abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "GL")) Module2["GL"] = function() {
            abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "dynamicAlloc")) Module2["dynamicAlloc"] = function() {
            abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "loadDynamicLibrary")) Module2["loadDynamicLibrary"] = function() {
            abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "loadWebAssemblyModule")) Module2["loadWebAssemblyModule"] = function() {
            abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getLEB")) Module2["getLEB"] = function() {
            abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getFunctionTables")) Module2["getFunctionTables"] = function() {
            abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "alignFunctionTables")) Module2["alignFunctionTables"] = function() {
            abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "registerFunctions")) Module2["registerFunctions"] = function() {
            abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "addFunction")) Module2["addFunction"] = function() {
            abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "removeFunction")) Module2["removeFunction"] = function() {
            abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getFuncWrapper")) Module2["getFuncWrapper"] = function() {
            abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "prettyPrint")) Module2["prettyPrint"] = function() {
            abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "makeBigInt")) Module2["makeBigInt"] = function() {
            abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "dynCall")) Module2["dynCall"] = function() {
            abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getCompilerSetting")) Module2["getCompilerSetting"] = function() {
            abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stackSave")) Module2["stackSave"] = function() {
            abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stackRestore")) Module2["stackRestore"] = function() {
            abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "stackAlloc")) Module2["stackAlloc"] = function() {
            abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "establishStackSpace")) Module2["establishStackSpace"] = function() {
            abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "print")) Module2["print"] = function() {
            abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "printErr")) Module2["printErr"] = function() {
            abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "getTempRet0")) Module2["getTempRet0"] = function() {
            abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "setTempRet0")) Module2["setTempRet0"] = function() {
            abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "callMain")) Module2["callMain"] = function() {
            abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "abort")) Module2["abort"] = function() {
            abort("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "Pointer_stringify")) Module2["Pointer_stringify"] = function() {
            abort("'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          if (!Object.getOwnPropertyDescriptor(Module2, "warnOnce")) Module2["warnOnce"] = function() {
            abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          };
          Module2["writeStackCookie"] = writeStackCookie;
          Module2["checkStackCookie"] = checkStackCookie;
          Module2["abortStackOverflow"] = abortStackOverflow;
          if (!Object.getOwnPropertyDescriptor(Module2, "ALLOC_NORMAL")) Object.defineProperty(Module2, "ALLOC_NORMAL", { configurable: true, get: function() {
            abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "ALLOC_STACK")) Object.defineProperty(Module2, "ALLOC_STACK", { configurable: true, get: function() {
            abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "ALLOC_DYNAMIC")) Object.defineProperty(Module2, "ALLOC_DYNAMIC", { configurable: true, get: function() {
            abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "ALLOC_NONE")) Object.defineProperty(Module2, "ALLOC_NONE", { configurable: true, get: function() {
            abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
          } });
          if (!Object.getOwnPropertyDescriptor(Module2, "calledRun")) Object.defineProperty(Module2, "calledRun", { configurable: true, get: function() {
            abort("'calledRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
          } });
          var calledRun;
          Module2["then"] = function(func) {
            if (calledRun) {
              func(Module2);
            } else {
              var old = Module2["onRuntimeInitialized"];
              Module2["onRuntimeInitialized"] = function() {
                if (old) old();
                func(Module2);
              };
            }
            return Module2;
          };
          function ExitStatus(status) {
            this.name = "ExitStatus";
            this.message = "Program terminated with exit(" + status + ")";
            this.status = status;
          }
          dependenciesFulfilled = function runCaller() {
            if (!calledRun) run();
            if (!calledRun) dependenciesFulfilled = runCaller;
          };
          function run(args) {
            args = args || arguments_;
            if (runDependencies > 0) {
              return;
            }
            writeStackCookie();
            preRun();
            if (runDependencies > 0) return;
            function doRun() {
              if (calledRun) return;
              calledRun = true;
              if (ABORT) return;
              initRuntime();
              preMain();
              if (Module2["onRuntimeInitialized"]) Module2["onRuntimeInitialized"]();
              assert(!Module2["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
              postRun();
            }
            if (Module2["setStatus"]) {
              Module2["setStatus"]("Running...");
              setTimeout(function() {
                setTimeout(function() {
                  Module2["setStatus"]("");
                }, 1);
                doRun();
              }, 1);
            } else {
              doRun();
            }
            checkStackCookie();
          }
          Module2["run"] = run;
          function checkUnflushedContent() {
            var print2 = out;
            var printErr2 = err;
            var has = false;
            out = err = function(x) {
              has = true;
            };
            try {
              var flush = flush_NO_FILESYSTEM;
              if (flush) flush(0);
            } catch (e) {
            }
            out = print2;
            err = printErr2;
            if (has) {
              warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");
              warnOnce("(this may also be due to not including full filesystem support - try building with -s FORCE_FILESYSTEM=1)");
            }
          }
          function exit(status, implicit) {
            checkUnflushedContent();
            if (implicit && noExitRuntime && status === 0) {
              return;
            }
            if (noExitRuntime) {
              if (!implicit) {
                err("program exited (with status: " + status + "), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)");
              }
            } else {
              ABORT = true;
              EXITSTATUS = status;
              exitRuntime();
              if (Module2["onExit"]) Module2["onExit"](status);
            }
            quit_(status, new ExitStatus(status));
          }
          if (Module2["preInit"]) {
            if (typeof Module2["preInit"] == "function") Module2["preInit"] = [Module2["preInit"]];
            while (Module2["preInit"].length > 0) {
              Module2["preInit"].pop()();
            }
          }
          noExitRuntime = true;
          run();
          return Module2;
        };
      }();
      if (typeof exports === "object" && typeof module === "object")
        module.exports = Module;
      else if (typeof define === "function" && define["amd"])
        define([], function() {
          return Module;
        });
      else if (typeof exports === "object")
        exports["Module"] = Module;
    }
  });

  // node_modules/fonteditor-core/woff2/index.js
  var require_woff22 = __commonJS({
    "node_modules/fonteditor-core/woff2/index.js"(exports, module) {
      var woff2ModuleLoader = require_woff2();
      function convertFromVecToUint8Array(vector) {
        const arr = [];
        for (let i = 0, l = vector.size(); i < l; i++) {
          arr.push(vector.get(i));
        }
        return new Uint8Array(arr);
      }
      var woff2Module = {
        woff2Module: null,
        /**
         * 是否已经加载完毕
         *
         * @return {boolean}
         */
        isInited() {
          return this.woff2Module && this.woff2Module.woff2Enc && this.woff2Module.woff2Dec;
        },
        /**
         * 初始化 woff 模块
         *
         * @param {string|ArrayBuffer} wasmUrl woff2.wasm file url
         * @return {Promise}
         */
        init(wasmUrl) {
          return new Promise((resolve) => {
            if (this.woff2Module) {
              resolve(this);
              return;
            }
            let moduleLoaderConfig = null;
            if (typeof window !== "undefined") {
              moduleLoaderConfig = {
                locateFile(path) {
                  if (path.endsWith(".wasm")) {
                    return wasmUrl;
                  }
                  return path;
                }
              };
            } else {
              let wasmPath = "./woff2.wasm";
              if (typeof __dirname !== "undefined") {
                wasmPath = __dirname + "/woff2.wasm";
              }
              moduleLoaderConfig = {
                wasmBinaryFile: wasmPath
              };
            }
            const woffModule = woff2ModuleLoader(moduleLoaderConfig);
            woffModule.onRuntimeInitialized = () => {
              this.woff2Module = woffModule;
              resolve(this);
            };
          });
        },
        /**
         * 将ttf buffer 转换成 woff2 buffer
         *
         * @param {ArrayBuffer|Buffer|Array} ttfBuffer ttf buffer
         * @return {Uint8Array} uint8 array
         */
        encode(ttfBuffer) {
          const buffer = new Uint8Array(ttfBuffer);
          const woffbuff = this.woff2Module.woff2Enc(buffer, buffer.byteLength);
          return convertFromVecToUint8Array(woffbuff);
        },
        /**
         * 将woff2 buffer 转换成 ttf buffer
         *
         * @param {ArrayBuffer|Buffer|Array} woff2Buffer woff2 buffer
         * @return {Uint8Array} uint8 array
         */
        decode(woff2Buffer) {
          const buffer = new Uint8Array(woff2Buffer);
          const ttfbuff = this.woff2Module.woff2Dec(buffer, buffer.byteLength);
          return convertFromVecToUint8Array(ttfbuff);
        }
      };
      module.exports = woff2Module;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttftowoff2.js
  var require_ttftowoff2 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttftowoff2.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttftowoff2;
      exports.ttftowoff2async = ttftowoff2async;
      var _index = _interopRequireDefault(require_woff22());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function ttftowoff2(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if (!_index.default.isInited()) {
          throw new Error("use woff2.init() to init woff2 module!");
        }
        var result = _index.default.encode(ttfBuffer);
        return result.buffer;
      }
      function ttftowoff2async(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        return _index.default.init(options.wasmUrl).then(function() {
          var result = _index.default.encode(ttfBuffer);
          return result.buffer;
        });
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/woff2tottf.js
  var require_woff2tottf = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/woff2tottf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = woff2tottf;
      exports.woff2tottfasync = woff2tottfasync;
      var _index = _interopRequireDefault(require_woff22());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function woff2tottf(woff2Buffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if (!_index.default.isInited()) {
          throw new Error("use woff2.init() to init woff2 module!");
        }
        var result = _index.default.decode(woff2Buffer);
        return result.buffer;
      }
      function woff2tottfasync(woff2Buffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        return _index.default.init(options.wasmUrl).then(function() {
          var result = _index.default.decode(woff2Buffer);
          return result.buffer;
        });
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/util/bytes2base64.js
  var require_bytes2base64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/util/bytes2base64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = bytes2base64;
      function bytes2base64(buffer) {
        var str = "";
        var length;
        var i;
        if (buffer instanceof ArrayBuffer) {
          length = buffer.byteLength;
          var view = new DataView(buffer, 0, length);
          for (i = 0; i < length; i++) {
            str += String.fromCharCode(view.getUint8(i, false));
          }
        } else if (buffer.length) {
          length = buffer.length;
          for (i = 0; i < length; i++) {
            str += String.fromCharCode(buffer[i]);
          }
        }
        if (!str) {
          return "";
        }
        return typeof btoa !== "undefined" ? btoa(str) : Buffer.from(str, "binary").toString("base64");
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2base64.js
  var require_ttf2base64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2base64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2base64;
      var _bytes2base = _interopRequireDefault(require_bytes2base64());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function ttf2base64(arrayBuffer) {
        return "data:font/ttf;charset=utf-8;base64," + (0, _bytes2base.default)(arrayBuffer);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/eot2base64.js
  var require_eot2base64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/eot2base64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = eot2base64;
      var _bytes2base = _interopRequireDefault(require_bytes2base64());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function eot2base64(arrayBuffer) {
        return "data:font/eot;charset=utf-8;base64," + (0, _bytes2base.default)(arrayBuffer);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/woff2base64.js
  var require_woff2base64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/woff2base64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = woff2base64;
      var _bytes2base = _interopRequireDefault(require_bytes2base64());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function woff2base64(arrayBuffer) {
        return "data:font/woff;charset=utf-8;base64," + (0, _bytes2base.default)(arrayBuffer);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/svg2base64.js
  var require_svg2base64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/svg2base64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = svg2base64;
      function svg2base64(svg) {
        var scheme = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "font/svg";
        if (typeof btoa === "undefined") {
          return "data:" + scheme + ";charset=utf-8;base64," + Buffer.from(svg, "binary").toString("base64");
        }
        return "data:" + scheme + ";charset=utf-8;base64," + btoa(svg);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/woff2tobase64.js
  var require_woff2tobase64 = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/woff2tobase64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = woff2tobase64;
      var _bytes2base = _interopRequireDefault(require_bytes2base64());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function woff2tobase64(arrayBuffer) {
        return "data:font/woff2;charset=utf-8;base64," + (0, _bytes2base.default)(arrayBuffer);
      }
    }
  });

  // node_modules/fonteditor-core/lib/ttf/font.js
  var require_font = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/font.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.Font = void 0;
      exports.createFont = createFont;
      exports.default = void 0;
      var _buffer = _interopRequireDefault(require_buffer());
      var _getEmptyttfObject = _interopRequireDefault(require_getEmptyttfObject());
      var _ttf = _interopRequireDefault(require_ttf());
      var _woff2ttf = _interopRequireDefault(require_woff2ttf());
      var _otf2ttfobject = _interopRequireDefault(require_otf2ttfobject());
      var _eot2ttf = _interopRequireDefault(require_eot2ttf());
      var _svg2ttfobject = _interopRequireDefault(require_svg2ttfobject());
      var _ttfreader = _interopRequireDefault(require_ttfreader());
      var _ttfwriter = _interopRequireDefault(require_ttfwriter());
      var _ttf2eot = _interopRequireDefault(require_ttf2eot());
      var _ttf2woff = _interopRequireDefault(require_ttf2woff());
      var _ttf2svg = _interopRequireDefault(require_ttf2svg());
      var _ttf2symbol = _interopRequireDefault(require_ttf2symbol());
      var _ttftowoff = _interopRequireDefault(require_ttftowoff2());
      var _woff2tottf = _interopRequireDefault(require_woff2tottf());
      var _ttf2base = _interopRequireDefault(require_ttf2base64());
      var _eot2base = _interopRequireDefault(require_eot2base64());
      var _woff2base = _interopRequireDefault(require_woff2base64());
      var _svg2base = _interopRequireDefault(require_svg2base64());
      var _bytes2base = _interopRequireDefault(require_bytes2base64());
      var _woff2tobase = _interopRequireDefault(require_woff2tobase64());
      var _optimizettf = _interopRequireDefault(require_optimizettf());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      function _toPrimitive(t, r) {
        if ("object" != _typeof(t) || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t, r || "default");
          if ("object" != _typeof(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      var SUPPORT_BUFFER = (typeof process === "undefined" ? "undefined" : _typeof(process)) === "object" && _typeof(process.versions) === "object" && typeof process.versions.node !== "undefined" && typeof Buffer === "function";
      var Font = exports.Font = /* @__PURE__ */ function() {
        function Font2(buffer) {
          var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
            type: "ttf"
          };
          _classCallCheck(this, Font2);
          if (_typeof(buffer) === "object" && buffer.glyf) {
            this.set(buffer);
          } else if (buffer) {
            this.read(buffer, options);
          } else {
            this.readEmpty();
          }
        }
        return _createClass(Font2, [{
          key: "readEmpty",
          value: (
            /**
             * 设置一个空的 ttfObject 对象
             *
             * @return {Font}
             */
            function readEmpty() {
              this.data = (0, _getEmptyttfObject.default)();
              return this;
            }
          )
          /**
           * 读取字体数据
           *
           * @param {ArrayBuffer|Buffer|string|Document} buffer  字体数据
           * @param {Object} options  读取参数
           * @param {string} options.type 字体类型
           *
           * ttf, woff , eot 读取配置
           * @param {boolean} options.hinting 是否保留 hinting 信息
           * @param {boolean} options.kerning 是否保留 kerning 信息
           * @param {boolean} options.compound2simple 复合字形转简单字形
           *
           * woff 读取配置
           * @param {Function} options.inflate 解压相关函数
           *
           * svg 读取配置
           * @param {boolean} options.combinePath 是否合并成单个字形，仅限于普通svg导入
           * @return {Font}
           */
        }, {
          key: "read",
          value: function read2(buffer, options) {
            if (SUPPORT_BUFFER) {
              if (buffer instanceof Buffer) {
                buffer = _buffer.default.toArrayBuffer(buffer);
              }
            }
            if (options.type === "ttf") {
              this.data = new _ttfreader.default(options).read(buffer);
            } else if (options.type === "otf") {
              this.data = (0, _otf2ttfobject.default)(buffer, options);
            } else if (options.type === "eot") {
              buffer = (0, _eot2ttf.default)(buffer, options);
              this.data = new _ttfreader.default(options).read(buffer);
            } else if (options.type === "woff") {
              buffer = (0, _woff2ttf.default)(buffer, options);
              this.data = new _ttfreader.default(options).read(buffer);
            } else if (options.type === "woff2") {
              buffer = (0, _woff2tottf.default)(buffer, options);
              this.data = new _ttfreader.default(options).read(buffer);
            } else if (options.type === "svg") {
              this.data = (0, _svg2ttfobject.default)(buffer, options);
            } else {
              throw new Error("not support font type" + options.type);
            }
            this.type = options.type;
            return this;
          }
          /**
           * 写入字体数据
           *
           * @param {Object} options  写入参数
           * @param {string} options.type   字体类型, 默认 ttf
           * @param {boolean} options.toBuffer nodejs 环境中返回 Buffer 对象, 默认 true
           *
           * ttf 字体参数
           * @param {boolean} options.hinting 是否保留 hinting 信息
           * @param {boolean} options.kerning 是否保留 kerning 信息
           * svg,woff 字体参数
           * @param {Object} options.metadata 字体相关的信息
           *
           * woff 字体参数
           * @param {Function} options.deflate 压缩相关函数
           * @return {Buffer|ArrayBuffer|string}
           */
        }, {
          key: "write",
          value: function write() {
            var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            if (!options.type) {
              options.type = this.type;
            }
            var buffer = null;
            if (options.type === "ttf") {
              buffer = new _ttfwriter.default(options).write(this.data);
            } else if (options.type === "eot") {
              buffer = new _ttfwriter.default(options).write(this.data);
              buffer = (0, _ttf2eot.default)(buffer, options);
            } else if (options.type === "woff") {
              buffer = new _ttfwriter.default(options).write(this.data);
              buffer = (0, _ttf2woff.default)(buffer, options);
            } else if (options.type === "woff2") {
              buffer = new _ttfwriter.default(options).write(this.data);
              buffer = (0, _ttftowoff.default)(buffer, options);
            } else if (options.type === "svg") {
              buffer = (0, _ttf2svg.default)(this.data, options);
            } else if (options.type === "symbol") {
              buffer = (0, _ttf2symbol.default)(this.data, options);
            } else {
              throw new Error("not support font type" + options.type);
            }
            if (SUPPORT_BUFFER) {
              if (false !== options.toBuffer && buffer instanceof ArrayBuffer) {
                buffer = _buffer.default.toBuffer(buffer);
              }
            }
            return buffer;
          }
          /**
           * 转换成 base64编码
           *
           * @param {Object} options  写入参数
           * @param {string} options.type   字体类型, 默认 ttf
           * 其他 options参数, 参考 write
           * @see write
           *
           * @param {ArrayBuffer=} buffer  如果提供了buffer数据则使用 buffer数据, 否则转换现有的 font
           * @return {string}
           */
        }, {
          key: "toBase64",
          value: function toBase64(options, buffer) {
            if (!options.type) {
              options.type = this.type;
            }
            if (buffer) {
              if (SUPPORT_BUFFER) {
                if (buffer instanceof Buffer) {
                  buffer = _buffer.default.toArrayBuffer(buffer);
                }
              }
            } else {
              options.toBuffer = false;
              buffer = this.write(options);
            }
            var base64Str;
            if (options.type === "ttf") {
              base64Str = (0, _ttf2base.default)(buffer);
            } else if (options.type === "eot") {
              base64Str = (0, _eot2base.default)(buffer);
            } else if (options.type === "woff") {
              base64Str = (0, _woff2base.default)(buffer);
            } else if (options.type === "woff2") {
              base64Str = (0, _woff2tobase.default)(buffer);
            } else if (options.type === "svg") {
              base64Str = (0, _svg2base.default)(buffer);
            } else if (options.type === "symbol") {
              base64Str = (0, _svg2base.default)(buffer, "image/svg+xml");
            } else {
              throw new Error("not support font type" + options.type);
            }
            return base64Str;
          }
          /**
           * 设置 font 对象
           *
           * @param {Object} data font的ttfObject对象
           * @return {this}
           */
        }, {
          key: "set",
          value: function set(data) {
            this.data = data;
            return this;
          }
          /**
           * 获取 font 数据
           *
           * @return {Object} ttfObject 对象
           */
        }, {
          key: "get",
          value: function get() {
            return this.data;
          }
          /**
           * 对字形数据进行优化
           *
           * @param  {Object} out  输出结果
           * @param  {boolean|Object} out.result `true` 或者有问题的地方
           * @return {Font}
           */
        }, {
          key: "optimize",
          value: function optimize(out) {
            var result = (0, _optimizettf.default)(this.data);
            if (out) {
              out.result = result;
            }
            return this;
          }
          /**
           * 将字体中的复合字形转为简单字形
           *
           * @return {this}
           */
        }, {
          key: "compound2simple",
          value: function compound2simple() {
            var ttfHelper = this.getHelper();
            ttfHelper.compound2simple();
            this.data = ttfHelper.get();
            return this;
          }
          /**
           * 对字形按照unicode编码排序
           *
           * @return {this}
           */
        }, {
          key: "sort",
          value: function sort() {
            var ttfHelper = this.getHelper();
            ttfHelper.sortGlyf();
            this.data = ttfHelper.get();
            return this;
          }
          /**
           * 查找相关字形
           *
           * @param  {Object} condition 查询条件
           * @param  {Array|number} condition.unicode unicode编码列表或者单个unicode编码
           * @param  {string} condition.name glyf名字，例如`uniE001`, `uniE`
           * @param  {Function} condition.filter 自定义过滤器
           * @example
           *     condition.filter(glyf) {
           *         return glyf.name === 'logo';
           *     }
           * @return {Array}  glyf字形列表
           */
        }, {
          key: "find",
          value: function find(condition) {
            var ttfHelper = this.getHelper();
            var indexList = ttfHelper.findGlyf(condition);
            return indexList.length ? ttfHelper.getGlyf(indexList) : indexList;
          }
          /**
           * 合并 font 到当前的 font
           *
           * @param {Object} font Font 对象
           * @param {Object} options 参数选项
           * @param {boolean} options.scale 是否自动缩放
           * @param {boolean} options.adjustGlyf 是否调整字形以适应边界
           *                                     (和 options.scale 参数互斥)
           *
           * @return {Font}
           */
        }, {
          key: "merge",
          value: function merge(font, options) {
            var ttfHelper = this.getHelper();
            ttfHelper.mergeGlyf(font.get(), options);
            this.data = ttfHelper.get();
            return this;
          }
          /**
           * 获取 TTF helper 实例
           */
        }, {
          key: "getHelper",
          value: function getHelper() {
            return new _ttf.default(this.data);
          }
        }], [{
          key: "create",
          value: function create(buffer, options) {
            return new Font2(buffer, options);
          }
        }]);
      }();
      Font.toBase64 = function(buffer) {
        if (typeof buffer === "string") {
          if (typeof btoa === "undefined") {
            return Buffer.from(buffer, "binary").toString("base64");
          }
          return btoa(buffer);
        }
        return (0, _bytes2base.default)(buffer);
      };
      function createFont(buffer, options) {
        return new Font(buffer, options);
      }
      var _default = exports.default = Font;
    }
  });

  // node_modules/fonteditor-core/lib/ttf/ttf2icon.js
  var require_ttf2icon = __commonJS({
    "node_modules/fonteditor-core/lib/ttf/ttf2icon.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = ttf2icon;
      var _ttfreader = _interopRequireDefault(require_ttfreader());
      var _error = _interopRequireDefault(require_error());
      var _default = _interopRequireDefault(require_default());
      var _ttf2symbol = require_ttf2symbol();
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function listUnicode(unicode) {
        return unicode.map(function(u) {
          return "\\" + u.toString(16);
        }).join(",");
      }
      function ttfobject2icon(ttf) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var glyfList = [];
        var filtered = ttf.glyf.filter(function(g) {
          return g.name !== ".notdef" && g.name !== ".null" && g.name !== "nonmarkingreturn" && g.unicode && g.unicode.length;
        });
        filtered.forEach(function(g, i) {
          glyfList.push({
            code: "&#x" + g.unicode[0].toString(16) + ";",
            codeName: listUnicode(g.unicode),
            name: g.name,
            id: (0, _ttf2symbol.getSymbolId)(g, i)
          });
        });
        return {
          fontFamily: ttf.name.fontFamily || _default.default.name.fontFamily,
          iconPrefix: options.iconPrefix || "icon",
          glyfList
        };
      }
      function ttf2icon(ttfBuffer) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if (ttfBuffer instanceof ArrayBuffer) {
          var reader = new _ttfreader.default();
          var ttfObject = reader.read(ttfBuffer);
          reader.dispose();
          return ttfobject2icon(ttfObject, options);
        } else if (ttfBuffer.version && ttfBuffer.glyf) {
          return ttfobject2icon(ttfBuffer, options);
        }
        _error.default.raise(10101);
      }
    }
  });

  // node_modules/fonteditor-core/lib/main.js
  var require_main = __commonJS({
    "node_modules/fonteditor-core/lib/main.js"(exports, module) {
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "Font", {
        enumerable: true,
        get: function get() {
          return _font.Font;
        }
      });
      Object.defineProperty(exports, "createFont", {
        enumerable: true,
        get: function get() {
          return _font.createFont;
        }
      });
      exports.default = void 0;
      Object.defineProperty(exports, "woff2", {
        enumerable: true,
        get: function get() {
          return _index.default;
        }
      });
      var _font = require_font();
      var _ttf = _interopRequireDefault(require_ttf());
      var _ttfreader = _interopRequireDefault(require_ttfreader());
      var _ttfwriter = _interopRequireDefault(require_ttfwriter());
      var _ttf2eot = _interopRequireDefault(require_ttf2eot());
      var _eot2ttf = _interopRequireDefault(require_eot2ttf());
      var _ttf2woff = _interopRequireDefault(require_ttf2woff());
      var _woff2ttf = _interopRequireDefault(require_woff2ttf());
      var _ttf2svg = _interopRequireDefault(require_ttf2svg());
      var _svg2ttfobject = _interopRequireDefault(require_svg2ttfobject());
      var _reader = _interopRequireDefault(require_reader());
      var _writer = _interopRequireDefault(require_writer());
      var _otfreader = _interopRequireDefault(require_otfreader());
      var _otf2ttfobject = _interopRequireDefault(require_otf2ttfobject());
      var _ttf2base = _interopRequireDefault(require_ttf2base64());
      var _ttf2icon = _interopRequireDefault(require_ttf2icon());
      var _ttftowoff = _interopRequireDefault(require_ttftowoff2());
      var _woff2tottf = _interopRequireDefault(require_woff2tottf());
      var _index = _interopRequireDefault(require_woff22());
      var _buffer = _interopRequireDefault(require_buffer());
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var modules = {
        createFont: _font.createFont,
        Font: _font.Font,
        TTF: _ttf.default,
        TTFReader: _ttfreader.default,
        TTFWriter: _ttfwriter.default,
        ttf2eot: _ttf2eot.default,
        eot2ttf: _eot2ttf.default,
        ttf2woff: _ttf2woff.default,
        woff2ttf: _woff2ttf.default,
        ttf2svg: _ttf2svg.default,
        svg2ttfobject: _svg2ttfobject.default,
        Reader: _reader.default,
        Writer: _writer.default,
        OTFReader: _otfreader.default,
        otf2ttfobject: _otf2ttfobject.default,
        ttf2base64: _ttf2base.default,
        ttf2icon: _ttf2icon.default,
        ttftowoff2: _ttftowoff.default,
        woff2tottf: _woff2tottf.default,
        woff2: _index.default,
        toArrayBuffer: _buffer.default.toArrayBuffer,
        toBuffer: _buffer.default.toBuffer
      };
      var _default = exports.default = modules;
      if (typeof exports !== "undefined") {
        module.exports = modules;
      }
    }
  });
  return require_main();
})();
