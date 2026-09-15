const crypto = require('crypto');

/**
 * Classical Cryptography Engine
 * Covers: Caesar, Vigenère, Base64, and General Substitution
 */

// --- CAESAR CIPHER ---
function caesarEncrypt(text, shift = 3) {
  const k = ((shift % 26) + 26) % 26;
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + k) % 26) + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + k) % 26) + 97);
    }
    return char;
  }).join('');
}

function caesarDecrypt(text, shift = 3) {
  const k = ((shift % 26) + 26) % 26;
  return caesarEncrypt(text, 26 - k);
}

function caesarVisualAlignment(shift = 3) {
  const k = ((shift % 26) + 26) % 26;
  const standard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const shifted = caesarEncrypt(standard, k);
  return {
    shift: k,
    plainAlphabet: standard.split(''),
    cipherAlphabet: shifted.split(''),
    offsets: standard.split('').map((ch, idx) => ({
      plain: ch,
      cipher: shifted[idx],
      shift: k,
      angle: (360 / 26) * idx
    }))
  };
}

// --- VIGENÈRE CIPHER ---
function cleanKeyword(keyword) {
  return (keyword || 'KEY').replace(/[^a-zA-Z]/g, '').toUpperCase() || 'KEY';
}

function vigenereEncrypt(text, keyword) {
  const key = cleanKeyword(keyword);
  let keyIndex = 0;
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;

    if (!isUpper && !isLower) return char;

    const base = isUpper ? 65 : 97;
    const shift = key[keyIndex % key.length].charCodeAt(0) - 65;
    keyIndex++;
    return String.fromCharCode(((code - base + shift) % 26) + base);
  }).join('');
}

function vigenereDecrypt(text, keyword) {
  const key = cleanKeyword(keyword);
  let keyIndex = 0;
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;

    if (!isUpper && !isLower) return char;

    const base = isUpper ? 65 : 97;
    const shift = key[keyIndex % key.length].charCodeAt(0) - 65;
    keyIndex++;
    return String.fromCharCode(((code - base - shift + 26) % 26) + base);
  }).join('');
}

function vigenereTrace(text, keyword, mode = 'encrypt') {
  const key = cleanKeyword(keyword);
  let keyIdx = 0;
  const trace = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;

    if (!isUpper && !isLower) {
      trace.push({
        index: i,
        char,
        keyChar: '-',
        shift: 0,
        result: char,
        isAlpha: false
      });
      continue;
    }

    const base = isUpper ? 65 : 97;
    const keyChar = key[keyIdx % key.length];
    const shift = keyChar.charCodeAt(0) - 65;
    keyIdx++;

    let resultChar;
    if (mode === 'encrypt') {
      resultChar = String.fromCharCode(((code - base + shift) % 26) + base);
    } else {
      resultChar = String.fromCharCode(((code - base - shift + 26) % 26) + base);
    }

    trace.push({
      index: i,
      char,
      keyChar,
      shift,
      result: resultChar,
      isAlpha: true
    });
  }

  return { keyword: key, trace };
}

// --- BASE64 CIPHER ---
function base64Encode(text) {
  return Buffer.from(text, 'utf-8').toString('base64');
}

function base64Decode(b64Str) {
  try {
    const clean = (b64Str || '').trim();
    if (!clean) return '';
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(clean) || clean.length % 4 !== 0) {
      return '[Invalid Base64 string]';
    }
    return Buffer.from(clean, 'base64').toString('utf-8');
  } catch (e) {
    return '[Invalid Base64 string]';
  }
}

function base64PaddingVisualization(text) {
  const buf = Buffer.from(text, 'utf-8');
  const totalBytes = buf.length;
  const remainder = totalBytes % 3;
  const paddingNeeded = remainder === 0 ? 0 : 3 - remainder;
  const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const chunks = [];
  for (let i = 0; i < totalBytes; i += 3) {
    const slice = buf.subarray(i, i + 3);
    const bytes = Array.from(slice);
    const binary = bytes.map(b => b.toString(2).padStart(8, '0')).join('');
    
    // Pad binary string to multiple of 6 for full 24-bit representation
    const fullBinary = binary.padEnd(24, '0');
    const sextets = [
      fullBinary.slice(0, 6),
      fullBinary.slice(6, 12),
      fullBinary.slice(12, 18),
      fullBinary.slice(18, 24)
    ];

    const chars = [];
    chars.push(b64Chars[parseInt(sextets[0], 2)]);
    chars.push(b64Chars[parseInt(sextets[1], 2)]);
    if (bytes.length === 1) {
      chars.push('=');
      chars.push('=');
    } else if (bytes.length === 2) {
      chars.push(b64Chars[parseInt(sextets[2], 2)]);
      chars.push('=');
    } else {
      chars.push(b64Chars[parseInt(sextets[2], 2)]);
      chars.push(b64Chars[parseInt(sextets[3], 2)]);
    }

    chunks.push({
      chunkIndex: Math.floor(i / 3),
      bytes,
      hex: bytes.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()),
      binary,
      sextets,
      encoded: chars.join('')
    });
  }

  const encodedString = base64Encode(text);

  return {
    text,
    totalBytes,
    paddingChars: '='.repeat(paddingNeeded),
    paddingCount: paddingNeeded,
    chunks,
    encoded: encodedString
  };
}

// --- GENERAL SUBSTITUTION CIPHER ---
function substitutionEncrypt(text, mapping) {
  // mapping is an object: { "A": "⚓", "B": "☠", ... }
  // We match uppercase, lowercase, and digits if provided
  let result = '';
  for (const char of text) {
    const upper = char.toUpperCase();
    if (mapping[upper] !== undefined) {
      result += mapping[upper];
    } else if (mapping[char] !== undefined) {
      result += mapping[char];
    } else {
      result += char;
    }
  }
  return result;
}

function substitutionDecrypt(text, mapping) {
  // Invert mapping: value -> key
  // Note: glyphs can be multiple code points (e.g. 🏴‍☠️ or 𓀀)
  const inverted = {};
  for (const [key, val] of Object.entries(mapping)) {
    inverted[val] = key;
  }

  // Sort glyph keys descending by length so compound glyphs match before sub-glyphs
  const glyphs = Object.keys(inverted).sort((a, b) => b.length - a.length);

  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const glyph of glyphs) {
      if (text.startsWith(glyph, i)) {
        result += inverted[glyph];
        i += glyph.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

// --- CORRUPTED DECRYPTION SECURITY LOGIC ---
/**
 * If decryption is attempted using an incorrect user salt or key,
 * run the ciphertext through a deterministic pseudorandom scrambler
 * that returns plausible corrupted glyphs rather than plain failure.
 */
function scrambleWithCorruptSalt(ciphertext, wrongSalt, themeGlyphs = []) {
  const fallbackCorruptPool = [
    '§', '¤', '†', '‡', '░', '▒', '▓', '¿', '¡', '¶', '©', '®',
    '∆', '∇', '◊', '◈', '✦', '✧', '⌖', '⊗', '⊕', '⊘', '⨂', '⨁', '⩰', '☍'
  ];
  const corruptPool = (themeGlyphs.length >= 26) ? themeGlyphs : fallbackCorruptPool;

  // Hash the wrongSalt + ciphertext to create deterministic seed
  const hash = crypto.createHash('sha256').update(wrongSalt + ':' + ciphertext).digest();
  
  let seed = hash.readUInt32BE(0);
  function pseudoRandom() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Segment ciphertext into Unicode characters/graphemes using Intl.Segmenter if available
  const segmenter = (typeof Intl !== 'undefined' && Intl.Segmenter)
    ? new Intl.Segmenter('en', { granularity: 'grapheme' })
    : null;
  const graphemes = segmenter
    ? Array.from(segmenter.segment(ciphertext), s => s.segment)
    : Array.from(ciphertext);

  const corrupted = graphemes.map(g => {
    if (g === ' ' || g === '\n' || g === '\t') return g;
    const r = pseudoRandom();
    if (r < 0.75) {
      // Pick corrupted glyph deterministically
      const idx = Math.floor(pseudoRandom() * corruptPool.length);
      return corruptPool[idx];
    }
    return g;
  });

  return corrupted.join('');
}

// Check bijection of a character alphabet mapping (A-Z and 0-9)
function validateBijection(mapping) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const digits = '0123456789'.split('');
  const seenValues = new Map();
  const duplicates = [];
  const missingKeys = [];

  letters.forEach(letter => {
    const val = mapping[letter];
    if (val === undefined || val === null || val === '') {
      missingKeys.push(letter);
      return;
    }
    if (seenValues.has(val)) {
      duplicates.push({ value: val, keys: [seenValues.get(val), letter] });
    } else {
      seenValues.set(val, letter);
    }
  });

  digits.forEach(digit => {
    const val = mapping[digit];
    if (val !== undefined && val !== null && val !== '') {
      if (seenValues.has(val)) {
        duplicates.push({ value: val, keys: [seenValues.get(val), digit] });
      } else {
        seenValues.set(val, digit);
      }
    }
  });

  const isValid = missingKeys.length === 0 && duplicates.length === 0;
  return {
    isValid,
    totalMapped: seenValues.size,
    required: 26,
    missingKeys,
    duplicates
  };
}

// --- ATBASH CIPHER ---
function atbashEncrypt(text) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(155 - code); // 90 - (code - 65) = 155 - code
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(219 - code); // 122 - (code - 97) = 219 - code
    }
    return char;
  }).join('');
}

function atbashDecrypt(text) {
  // Atbash is an involution: encryption and decryption are identical operations
  return atbashEncrypt(text);
}

// --- AFFINE CIPHER ---
function gcd(a, b) {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function modInverse26(a) {
  const normA = ((a % 26) + 26) % 26;
  for (let x = 1; x < 26; x++) {
    if ((normA * x) % 26 === 1) {
      return x;
    }
  }
  throw new Error(`Coefficient 'a' (${a}) has no modular inverse mod 26. gcd(a, 26) must be 1.`);
}

function affineEncrypt(text, a = 5, b = 8) {
  if (gcd(a, 26) !== 1) {
    throw new Error(`Slope 'a' (${a}) must be coprime with 26.`);
  }
  const normA = ((a % 26) + 26) % 26;
  const normB = ((b % 26) + 26) % 26;

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const p = code - 65;
      const c = (normA * p + normB) % 26;
      return String.fromCharCode(c + 65);
    }
    if (code >= 97 && code <= 122) {
      const p = code - 97;
      const c = (normA * p + normB) % 26;
      return String.fromCharCode(c + 97);
    }
    return char;
  }).join('');
}

function affineDecrypt(text, a = 5, b = 8) {
  const aInv = modInverse26(a);
  const normB = ((b % 26) + 26) % 26;

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const c = code - 65;
      const p = ((aInv * (c - normB)) % 26 + 26) % 26;
      return String.fromCharCode(p + 65);
    }
    if (code >= 97 && code <= 122) {
      const c = code - 97;
      const p = ((aInv * (c - normB)) % 26 + 26) % 26;
      return String.fromCharCode(p + 97);
    }
    return char;
  }).join('');
}

// --- RAIL FENCE (ZIG-ZAG TRANSPOSITION) CIPHER ---
function railFenceEncrypt(text, rails = 3) {
  if (!text) return '';
  const numRails = Math.max(2, parseInt(rails, 10) || 3);
  if (numRails >= text.length) return text;

  const fence = Array.from({ length: numRails }, () => []);
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    rail += direction;
    if (rail === numRails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return fence.map(r => r.join('')).join('');
}

function railFenceDecrypt(ciphertext, rails = 3) {
  if (!ciphertext) return '';
  const numRails = Math.max(2, parseInt(rails, 10) || 3);
  if (numRails >= ciphertext.length) return ciphertext;

  // Determine character count per rail
  const railLengths = new Array(numRails).fill(0);
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < ciphertext.length; i++) {
    railLengths[rail]++;
    rail += direction;
    if (rail === numRails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Slice ciphertext into rails
  const fence = [];
  let idx = 0;
  for (let r = 0; r < numRails; r++) {
    fence.push(ciphertext.slice(idx, idx + railLengths[r]).split(''));
    idx += railLengths[r];
  }

  // Reconstruct plaintext along zig-zag path
  let plaintext = '';
  rail = 0;
  direction = 1;

  for (let i = 0; i < ciphertext.length; i++) {
    plaintext += fence[rail].shift();
    rail += direction;
    if (rail === numRails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return plaintext;
}

function railFenceMatrix(text, rails = 3) {
  if (!text) return { rails: 3, matrix: [], cycleLength: 4 };
  const numRails = Math.max(2, parseInt(rails, 10) || 3);
  const matrix = Array.from({ length: numRails }, () => new Array(text.length).fill(null));

  let rail = 0;
  let direction = 1;

  for (let col = 0; col < text.length; col++) {
    matrix[rail][col] = {
      char: text[col],
      col,
      rail
    };
    if (numRails > 1) {
      rail += direction;
      if (rail === numRails - 1 || rail === 0) {
        direction = -direction;
      }
    }
  }

  return {
    rails: numRails,
    matrix,
    cycleLength: 2 * (numRails - 1),
    totalChars: text.length
  };
}

// --- RSA (PUBLIC-KEY ASYMMETRIC CRYPTOGRAPHY) ---
function isPrime(num) {
  const n = parseInt(num, 10);
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function extendedGCD(a, b) {
  if (b === 0n) return { gcd: a, x: 1n, y: 0n };
  const { gcd: g, x: x1, y: y1 } = extendedGCD(b, a % b);
  const x = y1;
  const y = x1 - (a / b) * y1;
  return { gcd: g, x, y };
}

function modInverse(e, phi) {
  const eBig = BigInt(e);
  const phiBig = BigInt(phi);
  const { gcd: g, x } = extendedGCD(eBig, phiBig);
  if (g !== 1n) {
    throw new Error(`Exponent ${e} is not coprime with totient ${phi}. gcd is ${g}`);
  }
  return ((x % phiBig) + phiBig) % phiBig;
}

function modPow(base, exp, mod) {
  let res = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e % 2n === 1n) {
      res = (res * b) % m;
    }
    b = (b * b) % m;
    e = e / 2n;
  }
  return res;
}

function rsaGenerateKeypair(p = 61, q = 53, preferredE = 17) {
  const pInt = parseInt(p, 10);
  const qInt = parseInt(q, 10);
  if (!isPrime(pInt)) throw new Error(`p (${pInt}) must be a prime number.`);
  if (!isPrime(qInt)) throw new Error(`q (${qInt}) must be a prime number.`);
  if (pInt === qInt) throw new Error(`Primes p and q must be distinct.`);

  const n = pInt * qInt;
  const phi = (pInt - 1) * (qInt - 1);

  const candidates = [preferredE, 17, 65537, 3, 5, 7, 11, 13, 19, 23, 29, 31];
  let e = null;
  for (const cand of candidates) {
    if (cand && cand < phi && gcd(cand, phi) === 1) {
      e = cand;
      break;
    }
  }
  if (!e) {
    for (let i = 3; i < phi; i += 2) {
      if (gcd(i, phi) === 1) {
        e = i;
        break;
      }
    }
  }
  if (!e) throw new Error(`Could not find a valid coprime exponent e for totient ${phi}.`);

  const d = Number(modInverse(e, phi));

  return {
    p: pInt,
    q: qInt,
    n,
    phi,
    e,
    d,
    publicKey: { e, n },
    privateKey: { d, n }
  };
}

function rsaEncrypt(text, e = 17, n = 3233) {
  if (!text) return '';
  const eBig = BigInt(e);
  const nBig = BigInt(n);
  const cipherInts = [];
  for (let i = 0; i < text.length; i++) {
    const m = BigInt(text.charCodeAt(i));
    const c = modPow(m, eBig, nBig);
    cipherInts.push(c.toString());
  }
  return cipherInts.join(' ');
}

function rsaDecrypt(cipherText, d = 2753, n = 3233) {
  if (!cipherText) return '';
  const dBig = BigInt(d);
  const nBig = BigInt(n);
  const tokens = cipherText.trim().split(/\s+/).filter(Boolean);
  let plain = '';
  for (const token of tokens) {
    try {
      const c = BigInt(token);
      const m = modPow(c, dBig, nBig);
      plain += String.fromCharCode(Number(m));
    } catch (err) {
      plain += '?';
    }
  }
  return plain;
}

function rsaTrace(text, p = 61, q = 53, preferredE = 17) {
  const keypair = rsaGenerateKeypair(p, q, preferredE);
  const trace = [];
  const maxChars = Math.min(text ? text.length : 0, 32);
  for (let i = 0; i < maxChars; i++) {
    const char = text[i];
    const m = BigInt(char.charCodeAt(0));
    const c = modPow(m, BigInt(keypair.e), BigInt(keypair.n));
    const decryptedM = modPow(c, BigInt(keypair.d), BigInt(keypair.n));
    const decryptedChar = String.fromCharCode(Number(decryptedM));
    trace.push({
      char,
      ascii: Number(m),
      cipherInt: c.toString(),
      decryptedAscii: Number(decryptedM),
      decryptedChar,
      formulaEnc: `${Number(m)}^${keypair.e} mod ${keypair.n} = ${c.toString()}`,
      formulaDec: `${c.toString()}^${keypair.d} mod ${keypair.n} = ${Number(m)}`
    });
  }
  return {
    keypair,
    trace,
    totalChars: text ? text.length : 0
  };
}

// --- PLAYFAIR CIPHER (5x5 KEY MATRIX DIGRAPH SUBSTITUTION) ---
function playfairGenerateMatrix(keyword = 'MONARCHY') {
  const cleanKey = (keyword + 'ABCDEFGHIKLMNOPQRSTUVWXYZ')
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');

  const seen = new Set();
  const matrix = [];
  const charPos = {};

  for (const ch of cleanKey) {
    if (!seen.has(ch) && ch !== 'J') {
      seen.add(ch);
      const row = Math.floor(matrix.length / 5);
      const col = matrix.length % 5;
      charPos[ch] = { row, col };
      matrix.push(ch);
      if (matrix.length === 25) break;
    }
  }

  // Convert 1D list to 5x5 grid
  const grid = [];
  for (let r = 0; r < 5; r++) {
    grid.push(matrix.slice(r * 5, (r + 1) * 5));
  }

  return { matrix, grid, charPos };
}

function playfairPrepareText(text) {
  const clean = (text || '')
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');

  const digraphs = [];
  let i = 0;
  while (i < clean.length) {
    const a = clean[i];
    let b = clean[i + 1];

    if (!b) {
      digraphs.push([a, 'X']);
      i += 1;
    } else if (a === b) {
      digraphs.push([a, a === 'X' ? 'Q' : 'X']);
      i += 1;
    } else {
      digraphs.push([a, b]);
      i += 2;
    }
  }
  return digraphs;
}

function playfairEncrypt(text, keyword = 'MONARCHY') {
  const { grid, charPos } = playfairGenerateMatrix(keyword);
  const digraphs = playfairPrepareText(text);

  return digraphs.map(([a, b]) => {
    const p1 = charPos[a];
    const p2 = charPos[b];

    if (p1.row === p2.row) {
      // Same row: shift right
      const c1 = grid[p1.row][(p1.col + 1) % 5];
      const c2 = grid[p2.row][(p2.col + 1) % 5];
      return c1 + c2;
    } else if (p1.col === p2.col) {
      // Same column: shift down
      const c1 = grid[(p1.row + 1) % 5][p1.col];
      const c2 = grid[(p2.row + 1) % 5][p2.col];
      return c1 + c2;
    } else {
      // Rectangle: swap columns
      const c1 = grid[p1.row][p2.col];
      const c2 = grid[p2.row][p1.col];
      return c1 + c2;
    }
  }).join('');
}

function playfairDecrypt(ciphertext, keyword = 'MONARCHY') {
  const { grid, charPos } = playfairGenerateMatrix(keyword);
  const clean = (ciphertext || '')
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');

  const digraphs = [];
  for (let i = 0; i < clean.length; i += 2) {
    if (i + 1 < clean.length) {
      digraphs.push([clean[i], clean[i + 1]]);
    } else {
      digraphs.push([clean[i], 'X']);
    }
  }

  return digraphs.map(([a, b]) => {
    const p1 = charPos[a];
    const p2 = charPos[b];
    if (!p1 || !p2) return a + (b || '');

    if (p1.row === p2.row) {
      // Same row: shift left
      const c1 = grid[p1.row][(p1.col - 1 + 5) % 5];
      const c2 = grid[p2.row][(p2.col - 1 + 5) % 5];
      return c1 + c2;
    } else if (p1.col === p2.col) {
      // Same column: shift up
      const c1 = grid[(p1.row - 1 + 5) % 5][p1.col];
      const c2 = grid[(p2.row - 1 + 5) % 5][p2.col];
      return c1 + c2;
    } else {
      // Rectangle: swap columns
      const c1 = grid[p1.row][p2.col];
      const c2 = grid[p2.row][p1.col];
      return c1 + c2;
    }
  }).join('');
}

function playfairTrace(text, keyword = 'MONARCHY') {
  const { grid, charPos } = playfairGenerateMatrix(keyword);
  const digraphs = playfairPrepareText(text);

  const steps = digraphs.map(([a, b]) => {
    const p1 = charPos[a];
    const p2 = charPos[b];
    let rule = 'rectangle';
    let out = '';

    if (p1.row === p2.row) {
      rule = 'same_row';
      out = grid[p1.row][(p1.col + 1) % 5] + grid[p2.row][(p2.col + 1) % 5];
    } else if (p1.col === p2.col) {
      rule = 'same_col';
      out = grid[(p1.row + 1) % 5][p1.col] + grid[(p2.row + 1) % 5][p2.col];
    } else {
      rule = 'rectangle';
      out = grid[p1.row][p2.col] + grid[p2.row][p1.col];
    }

    return {
      pair: a + b,
      pos1: `[${p1.row}, ${p1.col}]`,
      pos2: `[${p2.row}, ${p2.col}]`,
      rule,
      cipherPair: out
    };
  });

  return { keyword, grid, steps };
}

// --- HILL CIPHER (2x2 MODULAR MATRIX MULTIPLICATION) ---
function hillValidateMatrix(matrix = [[3, 3], [2, 5]]) {
  const [[a, b], [c, d]] = matrix;
  const det = ((a * d - b * c) % 26 + 26) % 26;
  if (gcd(det, 26) !== 1) {
    throw new Error(`Matrix determinant (${det}) must be coprime with 26.`);
  }
  const detInv = modInverse26(det);
  // Invert 2x2 matrix: K^-1 = detInv * [[d, -b], [-c, a]] mod 26
  const invMatrix = [
    [((d * detInv) % 26 + 26) % 26, (((-b) * detInv) % 26 + 26) % 26],
    [(((-c) * detInv) % 26 + 26) % 26, ((a * detInv) % 26 + 26) % 26]
  ];
  return { det, detInv, invMatrix };
}

function hillEncrypt(text, matrix = [[3, 3], [2, 5]]) {
  const { det } = hillValidateMatrix(matrix);
  const [[a, b], [c, d]] = matrix;

  let clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) clean += 'X';

  let encrypted = '';
  for (let i = 0; i < clean.length; i += 2) {
    const p1 = clean.charCodeAt(i) - 65;
    const p2 = clean.charCodeAt(i + 1) - 65;

    const c1 = (a * p1 + b * p2) % 26;
    const c2 = (c * p1 + d * p2) % 26;

    encrypted += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
  }
  return encrypted;
}

function hillDecrypt(ciphertext, matrix = [[3, 3], [2, 5]]) {
  const { invMatrix } = hillValidateMatrix(matrix);
  const [[ia, ib], [ic, id]] = invMatrix;

  let clean = (ciphertext || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) clean += 'X';

  let decrypted = '';
  for (let i = 0; i < clean.length; i += 2) {
    const c1 = clean.charCodeAt(i) - 65;
    const c2 = clean.charCodeAt(i + 1) - 65;

    const p1 = (ia * c1 + ib * c2) % 26;
    const p2 = (ic * c1 + id * c2) % 26;

    decrypted += String.fromCharCode(p1 + 65) + String.fromCharCode(p2 + 65);
  }
  return decrypted;
}

function hillTrace(text, matrix = [[3, 3], [2, 5]]) {
  const { det, detInv, invMatrix } = hillValidateMatrix(matrix);
  const [[a, b], [c, d]] = matrix;

  let clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) clean += 'X';

  const steps = [];
  for (let i = 0; i < clean.length; i += 2) {
    const p1 = clean.charCodeAt(i) - 65;
    const p2 = clean.charCodeAt(i + 1) - 65;

    const c1 = (a * p1 + b * p2) % 26;
    const c2 = (c * p1 + d * p2) % 26;

    steps.push({
      vector: `[${clean[i]}=${p1}, ${clean[i + 1]}=${p2}]`,
      formula: `[${a}*${p1} + ${b}*${p2} = ${c1}, ${c}*${p1} + ${d}*${p2} = ${c2}] mod 26`,
      cipherVector: `[${String.fromCharCode(c1 + 65)}, ${String.fromCharCode(c2 + 65)}]`
    });
  }

  return { matrix, det, detInv, invMatrix, steps };
}

// ====================================================
// --- CRYPTANALYSIS SUITE & THE CRYPTANALYST'S DESK ---
// ====================================================

const ENGLISH_LETTER_PROB = {
  A: 0.08167, B: 0.01492, C: 0.02782, D: 0.04253, E: 0.12702,
  F: 0.02228, G: 0.02015, H: 0.06094, I: 0.06966, J: 0.00153,
  K: 0.00772, L: 0.04025, M: 0.02406, N: 0.06749, O: 0.07507,
  P: 0.01929, Q: 0.00095, R: 0.05987, S: 0.06327, T: 0.09056,
  U: 0.02758, V: 0.00978, W: 0.02360, X: 0.00150, Y: 0.01974,
  Z: 0.00074
};

const COMMON_ENGLISH_WORDS = new Set([
  'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
  'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
  'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER', 'SHE',
  'OR', 'AN', 'WILL', 'MY', 'ONE', 'ALL', 'WOULD', 'THERE', 'THEIR', 'WHAT',
  'SO', 'UP', 'OUT', 'IF', 'ABOUT', 'WHO', 'GET', 'WHICH', 'GO', 'ME',
  'HELLO', 'WORLD', 'SECRET', 'CIPHER', 'ATTACK', 'DAWN', 'EAGLE', 'NIGHT',
  'PROTOCOL', 'AETHER', 'TEST', 'MISSION', 'MESSAGE', 'CODE', 'RADIO', 'STATION'
]);

/**
 * Calculates Index of Coincidence (IoC)
 * English standard: ~0.0667, Random noise: ~0.0385
 */
function indexOfCoincidence(text) {
  const clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n <= 1) return 0;

  const counts = {};
  for (let i = 0; i < n; i++) {
    const ch = clean[i];
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let sum = 0;
  for (const ch in counts) {
    const f = counts[ch];
    sum += f * (f - 1);
  }

  return sum / (n * (n - 1));
}

/**
 * Evaluates Caesar brute force for all 25 non-zero shifts
 * and scores results against English letter probabilities and common vocabulary
 */
function caesarBruteForce(ciphertext) {
  const clean = (ciphertext || '').trim();
  if (!clean) return { candidates: [], topCandidate: null };

  const candidates = [];

  for (let shift = 1; shift <= 25; shift++) {
    const decrypted = caesarDecrypt(clean, shift);
    const upperDecrypted = decrypted.toUpperCase().replace(/[^A-Z]/g, '');
    const n = upperDecrypted.length;

    let score = 0;
    if (n > 0) {
      // 1. Frequency correlation
      const counts = {};
      for (let i = 0; i < n; i++) {
        const ch = upperDecrypted[i];
        counts[ch] = (counts[ch] || 0) + 1;
      }
      for (const ch in counts) {
        const pObserved = counts[ch] / n;
        const pExpected = ENGLISH_LETTER_PROB[ch] || 0.001;
        score += pObserved * pExpected;
      }

      // 2. Word bonus (heavily favors real dictionary vocabulary)
      const words = decrypted.toUpperCase().split(/[^A-Z]+/).filter(Boolean);
      let matchedWords = 0;
      for (const w of words) {
        if (COMMON_ENGLISH_WORDS.has(w)) {
          matchedWords++;
        }
      }
      if (words.length > 0) {
        score += (matchedWords / words.length) * 0.25;
      }
    }

    candidates.push({
      shift,
      text: decrypted,
      score: parseFloat(score.toFixed(6))
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // Normalize confidence percentages
  const maxScore = candidates[0].score || 0.001;
  const minScore = candidates[candidates.length - 1].score || 0;
  const range = maxScore - minScore || 0.001;

  candidates.forEach(c => {
    c.confidence = Math.min(99.9, Math.max(10.0, parseFloat((((c.score - minScore) / range) * 89.9 + 10.0).toFixed(1))));
  });

  return {
    candidates,
    topCandidate: candidates[0]
  };
}

/**
 * Estimates Vigenère key length using the Index of Coincidence across slice cosets
 */
function vigenereEstimateKeyLength(ciphertext, maxLen = 10) {
  const clean = (ciphertext || '').toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n < 6) {
    return { periods: [], estimatedLength: 1 };
  }

  const effectiveMax = Math.min(maxLen, Math.floor(n / 2), 12);
  const periods = [];

  for (let L = 1; L <= effectiveMax; L++) {
    // Split into L cosets
    let totalIc = 0;
    let validSlices = 0;

    for (let offset = 0; offset < L; offset++) {
      let slice = '';
      for (let i = offset; i < n; i += L) {
        slice += clean[i];
      }
      if (slice.length > 1) {
        totalIc += indexOfCoincidence(slice);
        validSlices++;
      }
    }

    const avgIc = validSlices > 0 ? totalIc / validSlices : 0;
    periods.push({
      period: L,
      avgIc: parseFloat(avgIc.toFixed(5)),
      diffFromEnglish: Math.abs(avgIc - 0.0667)
    });
  }

  // Best period is the one closest to English IoC (0.0667)
  let best = periods[0];
  for (let i = 1; i < periods.length; i++) {
    if (periods[i].diffFromEnglish < best.diffFromEnglish) {
      best = periods[i];
    }
  }

  periods.forEach(p => {
    p.isPeak = p.period === best.period;
  });

  return {
    periods,
    estimatedLength: best ? best.period : 1
  };
}

/**
 * Computes Shannon Entropy H(X) in bits per character
 */
function shannonEntropy(text) {
  const clean = (text || '').replace(/\s+/g, '');
  const n = clean.length;
  if (n === 0) return { entropy: 0, maxEntropy: 4.7004, uniformityRatio: 0 };

  const counts = {};
  for (let i = 0; i < n; i++) {
    const ch = clean[i];
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let entropy = 0;
  for (const ch in counts) {
    const p = counts[ch] / n;
    entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(26); // 4.7004 bits
  const uniformityRatio = Math.min(1, entropy / maxEntropy);

  return {
    entropy: parseFloat(entropy.toFixed(4)),
    maxEntropy: parseFloat(maxEntropy.toFixed(4)),
    uniformityRatio: parseFloat(uniformityRatio.toFixed(3))
  };
}

/**
 * Computes theoretical Unicity Distance U = H(K) / D
 */
function calculateUnicityDistance(keySpaceBits = 88.4, redundancy = 3.2) {
  const u = keySpaceBits / redundancy;
  return parseFloat(u.toFixed(1));
}

// ====================================================
// --- WEHRMACHT ENIGMA M3 SIMULATOR ENGINE ---
// ====================================================

const ENIGMA_WIRINGS = {
  'I': {
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    notch: 16 // 'Q'
  },
  'II': {
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    notch: 4 // 'E'
  },
  'III': {
    wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    notch: 21 // 'V'
  },
  'IV': {
    wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    notch: 9 // 'J'
  },
  'V': {
    wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    notch: 25 // 'Z'
  }
};

const ENIGMA_REFLECTORS = {
  'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
};

/**
 * Inverts a 26-letter substitution string for backward rotor passes
 */
function invertWiring(wiring) {
  const inv = new Array(26);
  for (let i = 0; i < 26; i++) {
    const target = wiring.charCodeAt(i) - 65;
    inv[target] = String.fromCharCode(i + 65);
  }
  return inv.join('');
}

/**
 * Parses and validates plugboard pairs e.g. "AB CD EF" or ["AB", "CD"]
 */
function buildPlugboardMap(steckerPairs) {
  const map = {};
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(i + 65);
    map[ch] = ch;
  }

  let pairs = [];
  if (typeof steckerPairs === 'string') {
    pairs = steckerPairs.toUpperCase().trim().split(/[\s,;-]+/);
  } else if (Array.isArray(steckerPairs)) {
    pairs = steckerPairs;
  }

  const used = new Set();
  pairs.forEach(pair => {
    const p = pair.replace(/[^A-Z]/g, '');
    if (p.length === 2) {
      const a = p[0];
      const b = p[1];
      if (a !== b && !used.has(a) && !used.has(b)) {
        map[a] = b;
        map[b] = a;
        used.add(a);
        used.add(b);
      }
    }
  });

  return map;
}

/**
 * Simulates the historical Wehrmacht Enigma M3 machine
 * Supports Rotors I, II, III (or IV, V), Reflector B, Ringstellung, Grundstellung,
 * authentic double-stepping mechanical pawls, and Steckerbrett plugboard.
 */
function enigmaSimulate(text, options = {}) {
  const rotorKeys = options.rotors || ['I', 'II', 'III']; // Left, Middle, Right
  const reflectorKey = options.reflector || 'B';
  const positions = options.positions ? options.positions.slice() : [0, 0, 0]; // [L, M, R] (0-25)
  const rings = options.rings ? options.rings.slice() : [0, 0, 0]; // [L, M, R] (0-25)
  const plugboardMap = buildPlugboardMap(options.plugboard || '');

  // Convert letter positions (e.g. 'A' -> 0)
  for (let i = 0; i < 3; i++) {
    if (typeof positions[i] === 'string') {
      positions[i] = (positions[i].toUpperCase().charCodeAt(0) - 65 + 26) % 26;
    }
    if (typeof rings[i] === 'string') {
      rings[i] = (rings[i].toUpperCase().charCodeAt(0) - 65 + 26) % 26;
    }
  }

  const rL = ENIGMA_WIRINGS[rotorKeys[0]] || ENIGMA_WIRINGS['I'];
  const rM = ENIGMA_WIRINGS[rotorKeys[1]] || ENIGMA_WIRINGS['II'];
  const rR = ENIGMA_WIRINGS[rotorKeys[2]] || ENIGMA_WIRINGS['III'];
  const ref = ENIGMA_REFLECTORS[reflectorKey] || ENIGMA_REFLECTORS['B'];

  const rLInv = invertWiring(rL.wiring);
  const rMInv = invertWiring(rM.wiring);
  const rRInv = invertWiring(rR.wiring);

  const clean = (text || '').toUpperCase();
  let result = '';
  const trace = [];

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch < 'A' || ch > 'Z') {
      result += ch;
      continue;
    }

    // --- 1. ROTOR STEPPING MECHANISM (Authentic Double-Stepping) ---
    // If middle rotor is at turnover notch -> double stepping: middle & left step
    if (positions[1] === rM.notch) {
      positions[1] = (positions[1] + 1) % 26;
      positions[0] = (positions[0] + 1) % 26;
    } else if (positions[2] === rR.notch) {
      // If right rotor is at notch -> middle rotor steps
      positions[1] = (positions[1] + 1) % 26;
    }
    // Right rotor steps on every single keystroke
    positions[2] = (positions[2] + 1) % 26;

    const stepPositions = [
      String.fromCharCode(positions[0] + 65),
      String.fromCharCode(positions[1] + 65),
      String.fromCharCode(positions[2] + 65)
    ];

    // Helper for passing through a rotor in forward direction
    function passForward(charIdx, rotorWiring, pos, ring) {
      const shift = (pos - ring + 26) % 26;
      const enterPin = (charIdx + shift) % 26;
      const exitLetter = rotorWiring.charCodeAt(enterPin) - 65;
      return (exitLetter - shift + 26) % 26;
    }

    // Helper for passing backward through a rotor
    function passBackward(charIdx, invWiring, pos, ring) {
      const shift = (pos - ring + 26) % 26;
      const enterPin = (charIdx + shift) % 26;
      const exitLetter = invWiring.charCodeAt(enterPin) - 65;
      return (exitLetter - shift + 26) % 26;
    }

    // --- 2. SIGNAL PATH CIRCUITING ---
    // Step A: Plugboard entry
    const p1 = plugboardMap[ch] || ch;
    let idx = p1.charCodeAt(0) - 65;

    // Step B: Right rotor forward
    const idxR = passForward(idx, rR.wiring, positions[2], rings[2]);

    // Step C: Middle rotor forward
    const idxM = passForward(idxR, rM.wiring, positions[1], rings[1]);

    // Step D: Left rotor forward
    const idxL = passForward(idxM, rL.wiring, positions[0], rings[0]);

    // Step E: Reflector
    const refCh = ref[idxL];
    const idxRef = refCh.charCodeAt(0) - 65;

    // Step F: Left rotor reverse
    const idxLRev = passBackward(idxRef, rLInv, positions[0], rings[0]);

    // Step G: Middle rotor reverse
    const idxMRev = passBackward(idxLRev, rMInv, positions[1], rings[1]);

    // Step H: Right rotor reverse
    const idxRRev = passBackward(idxMRev, rRInv, positions[2], rings[2]);

    // Step I: Plugboard exit
    const beforePlug = String.fromCharCode(idxRRev + 65);
    const finalChar = plugboardMap[beforePlug] || beforePlug;

    result += finalChar;

    if (trace.length < 16) {
      trace.push({
        input: ch,
        output: finalChar,
        positions: stepPositions,
        path: [
          `Key: ${ch}`,
          `Plugboard: ${p1}`,
          `R3: ${String.fromCharCode(idxR + 65)}`,
          `R2: ${String.fromCharCode(idxM + 65)}`,
          `R1: ${String.fromCharCode(idxL + 65)}`,
          `Reflector: ${refCh}`,
          `R1 rev: ${String.fromCharCode(idxLRev + 65)}`,
          `R2 rev: ${String.fromCharCode(idxMRev + 65)}`,
          `R3 rev: ${beforePlug}`,
          `Lamp: ${finalChar}`
        ]
      });
    }
  }

  return {
    ciphertext: result,
    finalPositions: [
      String.fromCharCode(positions[0] + 65),
      String.fromCharCode(positions[1] + 65),
      String.fromCharCode(positions[2] + 65)
    ],
    trace
  };
}

module.exports = {
  caesarEncrypt,
  caesarDecrypt,
  caesarVisualAlignment,
  vigenereEncrypt,
  vigenereDecrypt,
  vigenereTrace,
  base64Encode,
  base64Decode,
  base64PaddingVisualization,
  substitutionEncrypt,
  substitutionDecrypt,
  scrambleWithCorruptSalt,
  validateBijection,
  atbashEncrypt,
  atbashDecrypt,
  affineEncrypt,
  affineDecrypt,
  railFenceEncrypt,
  railFenceDecrypt,
  railFenceMatrix,
  rsaGenerateKeypair,
  rsaEncrypt,
  rsaDecrypt,
  rsaTrace,
  playfairGenerateMatrix,
  playfairEncrypt,
  playfairDecrypt,
  playfairTrace,
  hillValidateMatrix,
  hillEncrypt,
  hillDecrypt,
  hillTrace,
  isPrime,
  modInverse,
  modPow,
  gcd,
  modInverse26,
  indexOfCoincidence,
  caesarBruteForce,
  vigenereEstimateKeyLength,
  shannonEntropy,
  calculateUnicityDistance,
  enigmaSimulate,
  buildPlugboardMap,
  ENIGMA_WIRINGS,
  ENIGMA_REFLECTORS
};

