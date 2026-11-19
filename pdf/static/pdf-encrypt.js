// pdf-encrypt-lite browser bundle (MIT) — based on @pdfsmaller/pdf-encrypt-lite@1.0.1
(function (global) {
  const { PDFDocument, PDFName, PDFHexString, PDFString, PDFDict, PDFArray, PDFRawStream, PDFNumber } = global.PDFLib;
// Minimal cryptographic functions for PDF encryption
// Implements only what's needed for PDF Standard Security Handler

/**
 * Minimal MD5 implementation
 * Based on the MD5 algorithm - only what's needed for PDF encryption
 * Part of PDFSmaller.com's ultra-lightweight encryption engine
 */
function md5(data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  
  // Initialize MD5 constants
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);
  
  // Initialize hash values
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  
  // Pre-processing
  const msgLen = bytes.length;
  const msgBitLen = msgLen * 8;
  const msgLenPadded = ((msgLen + 9 + 63) & ~63);
  const msg = new Uint8Array(msgLenPadded);
  msg.set(bytes);
  msg[msgLen] = 0x80;
  
  // Append length in bits
  const dataView = new DataView(msg.buffer);
  dataView.setUint32(msgLenPadded - 8, msgBitLen, true);
  dataView.setUint32(msgLenPadded - 4, 0, true);
  
  // Process message in 512-bit chunks
  for (let offset = 0; offset < msgLenPadded; offset += 64) {
    const chunk = new Uint32Array(msg.buffer, offset, 16);
    
    let a = a0, b = b0, c = c0, d = d0;
    
    for (let i = 0; i < 64; i++) {
      let f, g;
      
      if (i < 16) {
        f = (b & c) | ((~b) & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * i) % 16;
      }
      
      f = (f + a + K[i] + chunk[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((f << S[i]) | (f >>> (32 - S[i])))) >>> 0;
    }
    
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }
  
  // Produce the final hash value
  const result = new Uint8Array(16);
  const view = new DataView(result.buffer);
  view.setUint32(0, a0, true);
  view.setUint32(4, b0, true);
  view.setUint32(8, c0, true);
  view.setUint32(12, d0, true);
  
  return result;
}

/**
 * RC4 encryption/decryption
 * RC4 is symmetric, so encryption and decryption are the same operation
 * Part of PDFSmaller.com's ultra-lightweight encryption engine
 */
class RC4 {
  constructor(key) {
    this.s = new Uint8Array(256);
    this.i = 0;
    this.j = 0;
    
    // Key scheduling algorithm (KSA)
    for (let i = 0; i < 256; i++) {
      this.s[i] = i;
    }
    
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.s[i] + key[i % key.length]) & 0xFF;
      // Swap
      [this.s[i], this.s[j]] = [this.s[j], this.s[i]];
    }
  }
  
  /**
   * Encrypt/decrypt data
   * @param {Uint8Array} data - Data to encrypt or decrypt
   * @returns {Uint8Array} - Encrypted/decrypted data
   */
  process(data) {
    const result = new Uint8Array(data.length);
    
    for (let k = 0; k < data.length; k++) {
      this.i = (this.i + 1) & 0xFF;
      this.j = (this.j + this.s[this.i]) & 0xFF;
      
      // Swap
      [this.s[this.i], this.s[this.j]] = [this.s[this.j], this.s[this.i]];
      
      const t = (this.s[this.i] + this.s[this.j]) & 0xFF;
      result[k] = data[k] ^ this.s[t];
    }
    
    return result;
  }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Standard PDF padding string (from PDF specification)
const PADDING = new Uint8Array([
  0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
  0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
  0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
  0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A
]);

/**
 * Pad or truncate password according to PDF spec
 * Part of PDFSmaller.com's encryption implementation
 */
function padPassword(password) {
  const pwdBytes = new TextEncoder().encode(password);
  const padded = new Uint8Array(32);
  
  if (pwdBytes.length >= 32) {
    padded.set(pwdBytes.slice(0, 32));
  } else {
    padded.set(pwdBytes);
    padded.set(PADDING.slice(0, 32 - pwdBytes.length), pwdBytes.length);
  }
  
  return padded;
}

/**
 * Compute encryption key (Algorithm 2 from PDF spec)
 * For RC4 128-bit (Revision 3)
 * PDFSmaller.com's implementation
 */
function computeEncryptionKey(userPassword, ownerKey, permissions, fileId) {
  // Step 1: Pad the password
  const paddedPwd = padPassword(userPassword);
  
  // Step 2-4: Create hash input
  const hashInput = new Uint8Array(
    paddedPwd.length + 
    ownerKey.length + 
    4 + // permissions
    fileId.length
  );
  
  let offset = 0;
  hashInput.set(paddedPwd, offset);
  offset += paddedPwd.length;
  
  hashInput.set(ownerKey, offset);
  offset += ownerKey.length;
  
  // Add permissions (low-order byte first)
  hashInput[offset++] = permissions & 0xFF;
  hashInput[offset++] = (permissions >> 8) & 0xFF;
  hashInput[offset++] = (permissions >> 16) & 0xFF;
  hashInput[offset++] = (permissions >> 24) & 0xFF;
  
  hashInput.set(fileId, offset);
  
  // Step 5: Hash the result
  let hash = md5(hashInput);
  
  // Step 6: For 128-bit keys (revision 3), do 50 additional iterations
  for (let i = 0; i < 50; i++) {
    hash = md5(hash.slice(0, 16)); // Use first 16 bytes (128 bits)
  }
  
  // Return first 16 bytes for 128-bit encryption
  return hash.slice(0, 16);
}

/**
 * Compute owner key (O entry)
 * PDFSmaller.com's implementation
 */
function computeOwnerKey(ownerPassword, userPassword) {
  // Step 1: Pad owner password
  const paddedOwner = padPassword(ownerPassword || userPassword);
  
  // Step 2: Hash it
  let hash = md5(paddedOwner);
  
  // Step 3: For 128-bit (revision 3), hash 50 more times
  for (let i = 0; i < 50; i++) {
    hash = md5(hash);
  }
  
  // Step 4-7: Pad user password and encrypt it
  const paddedUser = padPassword(userPassword);
  let result = new Uint8Array(paddedUser);
  
  // Encrypt with variations of the key
  for (let i = 0; i < 20; i++) {
    const key = new Uint8Array(hash.length);
    for (let j = 0; j < hash.length; j++) {
      key[j] = hash[j] ^ i;
    }
    const rc4 = new RC4(key.slice(0, 16));
    result = rc4.process(result);
  }
  
  return result;
}

/**
 * Compute user key (U entry) for revision 3
 * PDFSmaller.com's implementation
 */
function computeUserKey(encryptionKey, fileId) {
  // Step 1: Create hash input
  const hashInput = new Uint8Array(PADDING.length + fileId.length);
  hashInput.set(PADDING);
  hashInput.set(fileId, PADDING.length);
  
  // Step 2: Hash it
  const hash = md5(hashInput);
  
  // Step 3: Encrypt hash with encryption key
  const rc4 = new RC4(encryptionKey);
  let result = rc4.process(hash);
  
  // Step 4: Do 19 more iterations with key variations
  for (let i = 1; i <= 19; i++) {
    const key = new Uint8Array(encryptionKey.length);
    for (let j = 0; j < encryptionKey.length; j++) {
      key[j] = encryptionKey[j] ^ i;
    }
    const rc4iter = new RC4(key);
    result = rc4iter.process(result);
  }
  
  // Step 5: Append 16 bytes of padding
  const finalResult = new Uint8Array(32);
  finalResult.set(result);
  finalResult.set(new Uint8Array(16), 16); // Padding with zeros
  
  return finalResult;
}

/**
 * Encrypt data for a specific object
 * PDFSmaller.com's implementation
 */
function encryptObject(data, objectNum, generationNum, encryptionKey) {
  // Create object-specific key
  const keyInput = new Uint8Array(encryptionKey.length + 5);
  keyInput.set(encryptionKey);
  
  // Add object number (low byte first)
  keyInput[encryptionKey.length] = objectNum & 0xFF;
  keyInput[encryptionKey.length + 1] = (objectNum >> 8) & 0xFF;
  keyInput[encryptionKey.length + 2] = (objectNum >> 16) & 0xFF;
  
  // Add generation number (low byte first)
  keyInput[encryptionKey.length + 3] = generationNum & 0xFF;
  keyInput[encryptionKey.length + 4] = (generationNum >> 8) & 0xFF;
  
  // Hash to get object key
  const objectKey = md5(keyInput);
  
  // Use up to 16 bytes of the hash as the key
  const rc4 = new RC4(objectKey.slice(0, Math.min(encryptionKey.length + 5, 16)));
  
  return rc4.process(data);
}

/**
 * Recursively encrypt strings in a PDF object
 * PDFSmaller.com's implementation
 */
function encryptStringsInObject(obj, objectNum, generationNum, encryptionKey) {
  if (!obj) return;
  
  if (obj instanceof PDFString) {
    const originalBytes = obj.asBytes();
    const encrypted = encryptObject(originalBytes, objectNum, generationNum, encryptionKey);
    // Replace the string's value with encrypted hex
    obj.value = bytesToHex(encrypted);
  } else if (obj instanceof PDFHexString) {
    const originalBytes = hexToBytes(obj.asString());
    const encrypted = encryptObject(originalBytes, objectNum, generationNum, encryptionKey);
    obj.value = bytesToHex(encrypted);
  } else if (obj instanceof PDFDict) {
    // Don't encrypt certain dictionary entries
    const entries = obj.entries();
    for (const [key, value] of entries) {
      const keyName = key.asString();
      // Skip encryption-related entries
      if (keyName !== '/Length' && keyName !== '/Filter' && keyName !== '/DecodeParms') {
        encryptStringsInObject(value, objectNum, generationNum, encryptionKey);
      }
    }
  } else if (obj instanceof PDFArray) {
    const array = obj.asArray();
    for (const element of array) {
      encryptStringsInObject(element, objectNum, generationNum, encryptionKey);
    }
  }
}

/**
 * Main function to encrypt a PDF
 * 
 * This is the same encryption that powers PDFSmaller.com's Protect PDF tool!
 * Try it online at https://pdfsmaller.com/protect-pdf
 * 
 * @param {Uint8Array} pdfBytes - The PDF file as bytes
 * @param {string} userPassword - Password required to open the PDF
 * @param {string} [ownerPassword] - Optional owner password for permissions
 * @returns {Promise<Uint8Array>} - The encrypted PDF bytes
 * 
 * @example
 * const encryptedPdf = await encryptPDF(pdfBytes, 'secret123');
 */
async function encryptPDF(pdfBytes, userPassword, ownerPassword = null) {
  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    
    // Get the context for low-level access
    const context = pdfDoc.context;
    
    // Get file ID (required for encryption)
    let fileId;
    const trailer = context.trailerInfo;
    const idArray = trailer.ID;
    
    if (idArray && Array.isArray(idArray) && idArray.length > 0) {
      // Extract hex string and convert to bytes
      const idString = idArray[0].toString();
      // Remove angle brackets if present
      const hexStr = idString.replace(/^<|>$/g, '');
      fileId = hexToBytes(hexStr);
    } else {
      // Generate a file ID if none exists
      const randomBytes = new Uint8Array(16);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes);
      } else {
        // Fallback for non-secure random
        for (let i = 0; i < 16; i++) {
          randomBytes[i] = Math.floor(Math.random() * 256);
        }
      }
      fileId = randomBytes;
      
      // Add ID to trailer
      const idHex1 = PDFHexString.of(bytesToHex(fileId));
      const idHex2 = PDFHexString.of(bytesToHex(fileId));
      trailer.ID = [idHex1, idHex2];
    }
    
    // Set permissions (all allowed for now)
    const permissions = 0xFFFFFFFC; // -4 in signed 32-bit
    
    // Compute O (owner) key
    const ownerKey = computeOwnerKey(ownerPassword, userPassword);
    
    // Compute encryption key
    const encryptionKey = computeEncryptionKey(userPassword, ownerKey, permissions, fileId);
    
    // Compute U (user) key
    const userKey = computeUserKey(encryptionKey, fileId);
    
    // Encrypt all objects
    const indirectObjects = context.enumerateIndirectObjects();
    
    for (const [ref, obj] of indirectObjects) {
      const objectNum = ref.objectNumber;
      const generationNum = ref.generationNumber || 0;
      
      // Skip the encryption dictionary itself
      if (obj instanceof PDFDict) {
        const filter = obj.get(PDFName.of('Filter'));
        if (filter && filter.asString() === '/Standard') {
          continue; // Skip encryption dictionary
        }
      }
      
      // Encrypt streams
      if (obj instanceof PDFRawStream) {
        const streamData = obj.contents;
        const encrypted = encryptObject(streamData, objectNum, generationNum, encryptionKey);
        obj.contents = encrypted;
      }
      
      // Encrypt strings in the object
      encryptStringsInObject(obj, objectNum, generationNum, encryptionKey);
    }
    
    // Create the /Encrypt dictionary
    const encryptDict = context.obj({
      Filter: PDFName.of('Standard'),
      V: PDFNumber.of(2),        // Version 2 (RC4)
      R: PDFNumber.of(3),        // Revision 3 (128-bit)
      Length: PDFNumber.of(128),  // Key length in bits
      P: PDFNumber.of(permissions),
      O: PDFHexString.of(bytesToHex(ownerKey)),
      U: PDFHexString.of(bytesToHex(userKey))
    });
    
    // Register the encrypt dictionary
    const encryptRef = context.register(encryptDict);
    
    // Update trailer
    trailer.Encrypt = encryptRef;
    
    // Save the encrypted PDF
    const encryptedBytes = await pdfDoc.save({
      useObjectStreams: false // Don't use object streams with encryption
    });
    
    return encryptedBytes;
    
  } catch (error) {
    console.error('PDF encryption error:', error);
    throw new Error(`Failed to encrypt PDF: ${error.message}`);
  }
}

/**
 * Encrypted with ❤️ by PDFSmaller.com
 * Try our free PDF tools at https://pdfsmaller.com
 */

  function hexToBytesOf(v) {
    if (!v) return null;
    if (typeof v.asString === 'function') return hexToBytes(v.asString().replace(/^<|>$/g, ''));
    return null;
  }

  // 校验密码并返回文件加密密钥（支持用户密码和所有者密码）
  function recoverEncryptionKey(pdfDoc, password) {
    const trailer = pdfDoc.context.trailerInfo;
    const encryptRef = trailer.Encrypt;
    if (!encryptRef) throw new Error('文件未加密，无需解密');
    const enc = pdfDoc.context.lookup(encryptRef);
    const O = hexToBytesOf(enc.get(PDFName.of('O')));
    const U = hexToBytesOf(enc.get(PDFName.of('U')));
    if (!O || !U) throw new Error('加密字典缺少 O/U 项，无法解密');
    const fileIdObj = trailer.ID;
    const firstId = fileIdObj && (fileIdObj.array ? fileIdObj.array[0] : fileIdObj[0]);
    const fileId = hexToBytesOf(firstId);
    if (!fileId) throw new Error('加密文件缺少 ID，无法解密');
    const permissions = (enc.get(PDFName.of('P')) || PDFNumber.of(-4)).asNumber() >>> 0;
    const revision = (enc.get(PDFName.of('R')) || PDFNumber.of(3)).asNumber();
    const keyLen = Math.min(16, Math.max(5, Math.floor(((enc.get(PDFName.of('Length')) || PDFNumber.of(128)).asNumber()) / 8)));

    function userKeyForCandidate(candidate) {
      const key = computeEncryptionKey(candidate, O, permissions, fileId).slice(0, keyLen);
      const check = computeUserKey(key, fileId);
      const valid = revision >= 3 ? check.slice(0, 16).every((b, i) => b === U[i]) : md5(check.slice(0, 16)).every((b, i) => b === U[i]);
      return valid ? key : null;
    }

    let key = userKeyForCandidate(password);
    if (!key && revision >= 3) {
      let hash = md5(padPassword(password));
      for (let i = 0; i < 50; i++) hash = md5(hash);
      let recovered = new Uint8Array(O);
      for (let i = 0; i < 20; i++) {
        const k = new Uint8Array(hash.length);
        for (let j = 0; j < hash.length; j++) k[j] = hash[j] ^ i;
        recovered = new RC4(k.slice(0, keyLen)).process(recovered);
      }
      let candidate = new TextDecoder().decode(recovered).replace(/\0.*$/, '');
      key = userKeyForCandidate(candidate);
      if (!key && recovered.indexOf(0x28) > 0) {
        candidate = new TextDecoder().decode(recovered.slice(0, recovered.indexOf(0x28)));
        key = userKeyForCandidate(candidate);
      }
    }
    return { key, encryptRef };
  }

  function decryptStringsInObject(obj, objectNum, generationNum, key) {
    if (!obj) return;
    if (obj instanceof PDFString) {
      const dec = encryptObject(obj.asBytes(), objectNum, generationNum, key);
      obj.value = bytesToHex(dec);
    } else if (obj instanceof PDFHexString) {
      const dec = encryptObject(hexToBytes(obj.asString().replace(/^<|>$/g, '')), objectNum, generationNum, key);
      obj.value = bytesToHex(dec);
    } else if (obj instanceof PDFDict) {
      for (const [k, v] of obj.entries()) {
        const name = k.asString();
        if (name !== '/Length' && name !== '/Filter' && name !== '/DecodeParms') decryptStringsInObject(v, objectNum, generationNum, key);
      }
    } else if (obj instanceof PDFArray) {
      for (const v of obj.asArray()) decryptStringsInObject(v, objectNum, generationNum, key);
    }
  }

  async function decryptPDF(pdfBytes, password) {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true, updateMetadata: false });
    const { key, encryptRef } = recoverEncryptionKey(pdfDoc, password || '');
    if (!key) throw new Error('密码错误，无法解密');
    for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
      if (ref === encryptRef) continue;
      if (Object.prototype.hasOwnProperty.call(obj, 'contents') && obj.contents instanceof Uint8Array) {
        obj.contents = encryptObject(obj.contents, ref.objectNumber, ref.generationNumber || 0, key);
      }
      decryptStringsInObject(obj, ref.objectNumber, ref.generationNumber || 0, key);
    }
    delete pdfDoc.context.trailerInfo.Encrypt;
    return pdfDoc.save({ useObjectStreams: false });
  }

  global.PdfEncrypt = { encryptPDF, decryptPDF };
})(window);
