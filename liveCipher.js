/**
 * Live Dual-Box Reactive Editor & 3D Flip Engine
 */

window.LiveCipher = (function() {
  let debounceTimer = null;
  let isAnimating = false;

  // Cache DOM elements
  const inputEl = () => document.getElementById('cipherInput');
  const outputEl = () => document.getElementById('cipherOutput');
  const inputCountEl = () => document.getElementById('inputCharCount');
  const outputCountEl = () => document.getElementById('outputCharCount');
  const directionPillEncrypt = () => document.getElementById('pillEncrypt');
  const directionPillDecrypt = () => document.getElementById('pillDecrypt');
  const corruptAlertEl = () => document.getElementById('corruptedAlert');

  function init() {
    const input = inputEl();
    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          transformText();
        }, 50);
      });
    }

    // Direction toggle
    const toggleBtn = document.getElementById('directionToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleDirection);
    }

    // Copy action
    const copyBtn = document.getElementById('copyOutputBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyOutput);
    }

    // Clear action
    const clearBtn = document.getElementById('clearInputBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAll);
    }

    // Swap text action
    const swapBtn = document.getElementById('swapTextBtn');
    if (swapBtn) {
      swapBtn.addEventListener('click', swapText);
    }

    // 3D Reel Animation Run
    const runAnimBtn = document.getElementById('runAnimationBtn');
    if (runAnimBtn) {
      runAnimBtn.addEventListener('click', run3DFlipAnimation);
    }
    const runEncBtn = document.getElementById('runEncryptionBtn');
    if (runEncBtn) {
      runEncBtn.addEventListener('click', run3DFlipAnimation);
    }
  }

  function toggleDirection() {
    window.AppState.direction = window.AppState.direction === 'encrypt' ? 'decrypt' : 'encrypt';
    updateDirectionUI();
    transformText();
  }

  function updateDirectionUI() {
    const isEnc = window.AppState.direction === 'encrypt';
    const pEnc = directionPillEncrypt();
    const pDec = directionPillDecrypt();
    if (pEnc && pDec) {
      if (isEnc) {
        pEnc.classList.add('active');
        pDec.classList.remove('active');
      } else {
        pDec.classList.add('active');
        pEnc.classList.remove('active');
      }
    }
    const runEncBtn = document.getElementById('runEncryptionBtn');
    if (runEncBtn) {
      runEncBtn.textContent = isEnc ? '▶ Run Encryption' : '▶ Run Decryption';
    }
  }

  function updateCounters(inputText, outputText) {
    const inCount = inputCountEl();
    const outCount = outputCountEl();
    if (inCount) inCount.textContent = `${inputText.length} chars | ${inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words`;
    if (outCount) outCount.textContent = `${outputText.length} chars`;
  }

  /**
   * Main reactive transformation
   */
  async function transformText() {
    const input = inputEl();
    const output = outputEl();
    const alertBox = corruptAlertEl();
    if (!input || !output) return;

    const rawText = input.value;
    if (!rawText) {
      output.innerHTML = '';
      if (alertBox) alertBox.classList.remove('active');
      updateCounters('', '');
    renderFrequencyChart('');
      return;
    }

    const mode = window.AppState.currentMode; // 'manual', 'ai', 'classical'
    const direction = window.AppState.direction; // 'encrypt', 'decrypt'

    let transformed = '';
    let isCorrupted = false;

    if (mode === 'manual' || mode === 'ai') {
      const mapping = window.AppState.currentMapping;
      if (direction === 'encrypt') {
        transformed = encryptSubstitution(rawText, mapping);
      } else {
        // Decryption: check salt mismatch for AI mode
        const originalSalt = window.AppState.activeSalt;
        const attemptSalt = window.AppState.attemptSalt;

        if (mode === 'ai' && attemptSalt && originalSalt && attemptSalt !== originalSalt) {
          // Trigger deterministic corrupted scrambling
          isCorrupted = true;
          transformed = scrambleCorrupted(rawText, attemptSalt, Object.values(mapping));
        } else {
          transformed = decryptSubstitution(rawText, mapping);
        }
      }
    } else if (mode === 'classical') {
      const cipherType = window.AppState.classicalCipher; // 'caesar', 'vigenere', 'base64'
      if (cipherType === 'caesar') {
        const shift = window.AppState.caesarShift;
        transformed = direction === 'encrypt' ? caesarShift(rawText, shift) : caesarShift(rawText, 26 - (shift % 26));
      } else if (cipherType === 'vigenere') {
        const key = window.AppState.vigenereKey || 'KEY';
        transformed = direction === 'encrypt' ? vigenereCrypt(rawText, key, true) : vigenereCrypt(rawText, key, false);
      } else if (cipherType === 'base64') {
        transformed = direction === 'encrypt' ? b64Encode(rawText) : b64Decode(rawText);
      } else if (cipherType === 'atbash') {
        transformed = atbashCrypt(rawText);
      } else if (cipherType === 'affine') {
        const a = window.AppState.affineA || 5;
        const b = window.AppState.affineB !== undefined ? window.AppState.affineB : 8;
        transformed = direction === 'encrypt' ? affineEncrypt(rawText, a, b) : affineDecrypt(rawText, a, b);
      } else if (cipherType === 'railfence' || cipherType === 'rail_fence') {
        const rails = window.AppState.railFenceRails || 3;
        transformed = direction === 'encrypt' ? railFenceEncrypt(rawText, rails) : railFenceDecrypt(rawText, rails);
      } else if (cipherType === 'rsa') {
        const e = window.AppState.rsaE || 17;
        const d = window.AppState.rsaD || 2753;
        const n = window.AppState.rsaN || 3233;
        transformed = direction === 'encrypt' ? rsaClientEncrypt(rawText, e, n) : rsaClientDecrypt(rawText, d, n);
      } else if (cipherType === 'playfair') {
        const keyword = window.AppState.playfairKey || 'MONARCHY';
        transformed = direction === 'encrypt' ? playfairClientEncrypt(rawText, keyword) : playfairClientDecrypt(rawText, keyword);
      } else if (cipherType === 'hill') {
        const matrix = window.AppState.hillMatrix || [[3, 3], [2, 5]];
        transformed = direction === 'encrypt' ? hillClientEncrypt(rawText, matrix) : hillClientDecrypt(rawText, matrix);
      } else if (cipherType === 'enigma') {
        const rotors = window.AppState.enigmaRotors || ['I', 'II', 'III'];
        const positions = window.AppState.enigmaPositions || ['A', 'A', 'A'];
        const rings = window.AppState.enigmaRings || [1, 1, 1];
        const plugboard = window.AppState.enigmaPlugboard || '';
        const enigmaRes = enigmaClientSimulate(rawText, { rotors, positions, rings, plugboard });
        transformed = enigmaRes.ciphertext;
      }
    }

    // Display output
    output.textContent = transformed;
    window.AppState.lastTransformed = transformed;
    updateCounters(rawText, transformed);
    renderFrequencyChart(rawText);
    updateCryptanalysisDesk(direction === 'encrypt' ? transformed : rawText);

    if (alertBox) {
      if (isCorrupted) {
        alertBox.classList.add('active');
        alertBox.innerHTML = `⚠️ <strong>KEY MISMATCH DETECTED:</strong> Decryption attempted with invalid salt key (<code>${escapeHtml(window.AppState.attemptSalt)}</code>). Output deterministic scrambled matrix!`;
      } else {
        alertBox.classList.remove('active');
      }
    }

    // If classical mode, update traces
    if (mode === 'classical') {
      window.ClassicalMode.updateVisualizers(rawText);
    }
  }

  // Substitution logic
  function encryptSubstitution(text, mapping) {
    let res = '';
    for (const ch of text) {
      const upper = ch.toUpperCase();
      if (mapping[upper] !== undefined) {
        res += mapping[upper];
      } else if (mapping[ch] !== undefined) {
        res += mapping[ch];
      } else {
        res += ch;
      }
    }
    return res;
  }

  function decryptSubstitution(text, mapping) {
    const inverted = {};
    for (const [k, v] of Object.entries(mapping)) {
      inverted[v] = k;
    }
    const glyphs = Object.keys(inverted).sort((a, b) => b.length - a.length);
    let res = '';
    let i = 0;
    while (i < text.length) {
      let matched = false;
      for (const glyph of glyphs) {
        if (text.startsWith(glyph, i)) {
          res += inverted[glyph];
          i += glyph.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        res += text[i];
        i++;
      }
    }
    return res;
  }

  // Corrupted Scrambler Logic
  function scrambleCorrupted(ciphertext, wrongSalt, glyphPool = []) {
    const fallbackCorruptPool = [
      '§', '¤', '†', '‡', '░', '▒', '▓', '¿', '¡', '¶', '©', '®',
      '∆', '∇', '◊', '◈', '✦', '✧', '⌖', '⊗', '⊕', '⊘', '⨂', '⨁', '⩰', '☍'
    ];
    const pool = (glyphPool.length >= 26) ? glyphPool : fallbackCorruptPool;

    let hashVal = 0;
    const str = wrongSalt + ':' + ciphertext;
    for (let j = 0; j < str.length; j++) {
      hashVal = ((hashVal << 5) - hashVal) + str.charCodeAt(j);
      hashVal |= 0;
    }

    let seed = Math.abs(hashVal);
    function pseudoRand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    const segmenter = (typeof Intl !== 'undefined' && Intl.Segmenter)
      ? new Intl.Segmenter('en', { granularity: 'grapheme' })
      : null;
    const chars = segmenter
      ? Array.from(segmenter.segment(ciphertext), s => s.segment)
      : Array.from(ciphertext);

    return chars.map(c => {
      if (c === ' ' || c === '\n' || c === '\t') return c;
      if (pseudoRand() < 0.8) {
        const idx = Math.floor(pseudoRand() * pool.length);
        return pool[idx];
      }
      return c;
    }).join('');
  }

  // Caesar shift
  function caesarShift(text, shift) {
    const k = ((shift % 26) + 26) % 26;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + k) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + k) % 26) + 97);
      return char;
    }).join('');
  }

  // Vigenere
  function vigenereCrypt(text, key, isEncrypt) {
    const cleanKey = (key || 'KEY').replace(/[^a-zA-Z]/g, '').toUpperCase() || 'KEY';
    let keyIdx = 0;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (!isUpper && !isLower) return char;

      const base = isUpper ? 65 : 97;
      const shift = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      keyIdx++;

      if (isEncrypt) {
        return String.fromCharCode(((code - base + shift) % 26) + base);
      } else {
        return String.fromCharCode(((code - base - shift + 26) % 26) + base);
      }
    }).join('');
  }

  // Base64
  function b64Encode(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return '[Encoding Error]';
    }
  }

  function b64Decode(str) {
    try {
      const clean = (str || '').trim();
      if (!clean) return '';
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(clean) || clean.length % 4 !== 0) {
        return '[Invalid Base64]';
      }
      return decodeURIComponent(escape(atob(clean)));
    } catch (e) {
      return '[Invalid Base64]';
    }
  }

  // Atbash Cipher (Historic biblical reversal involution)
  function atbashCrypt(text) {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(155 - code);
      if (code >= 97 && code <= 122) return String.fromCharCode(219 - code);
      return char;
    }).join('');
  }

  // Affine Cipher (Algebraic monoalphabetic substitution)
  function modInv26(a) {
    const normA = ((a % 26) + 26) % 26;
    for (let x = 1; x < 26; x++) {
      if ((normA * x) % 26 === 1) return x;
    }
    return 1;
  }

  function affineEncrypt(text, a = 5, b = 8) {
    const normA = ((a % 26) + 26) % 26;
    const normB = ((b % 26) + 26) % 26;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((normA * (code - 65) + normB) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((normA * (code - 97) + normB) % 26) + 97);
      }
      return char;
    }).join('');
  }

  function affineDecrypt(text, a = 5, b = 8) {
    const aInv = modInv26(a);
    const normB = ((b % 26) + 26) % 26;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode((((aInv * (code - 65 - normB)) % 26 + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode((((aInv * (code - 97 - normB)) % 26 + 26) % 26) + 97);
      }
      return char;
    }).join('');
  }

  // Rail Fence (Zig-Zag Transposition Cipher)
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
      if (rail === numRails - 1 || rail === 0) direction = -direction;
    }

    return fence.map(r => r.join('')).join('');
  }

  function railFenceDecrypt(ciphertext, rails = 3) {
    if (!ciphertext) return '';
    const numRails = Math.max(2, parseInt(rails, 10) || 3);
    if (numRails >= ciphertext.length) return ciphertext;

    const railLengths = new Array(numRails).fill(0);
    let rail = 0;
    let direction = 1;

    for (let i = 0; i < ciphertext.length; i++) {
      railLengths[rail]++;
      rail += direction;
      if (rail === numRails - 1 || rail === 0) direction = -direction;
    }

    const fence = [];
    let idx = 0;
    for (let r = 0; r < numRails; r++) {
      fence.push(ciphertext.slice(idx, idx + railLengths[r]).split(''));
      idx += railLengths[r];
    }

    let plaintext = '';
    rail = 0;
    direction = 1;

    for (let i = 0; i < ciphertext.length; i++) {
      plaintext += fence[rail].shift();
      rail += direction;
      if (rail === numRails - 1 || rail === 0) direction = -direction;
    }

    return plaintext;
  }

  // RSA Client-side Exponentiation Math
  function rsaClientEncrypt(text, e, n) {
    if (!text) return '';
    const eBig = BigInt(e);
    const nBig = BigInt(n);
    const ints = [];
    for (let i = 0; i < text.length; i++) {
      const m = BigInt(text.charCodeAt(i));
      let res = 1n, base = m % nBig, exp = eBig;
      while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % nBig;
        base = (base * base) % nBig;
        exp = exp / 2n;
      }
      ints.push(res.toString());
    }
    return ints.join(' ');
  }

  function rsaClientDecrypt(cipherText, d, n) {
    if (!cipherText) return '';
    const dBig = BigInt(d);
    const nBig = BigInt(n);
    const tokens = cipherText.trim().split(/\s+/).filter(Boolean);
    let plain = '';
    for (const tok of tokens) {
      try {
        const c = BigInt(tok);
        let res = 1n, base = c % nBig, exp = dBig;
        while (exp > 0n) {
          if (exp % 2n === 1n) res = (res * base) % nBig;
          base = (base * base) % nBig;
          exp = exp / 2n;
        }
        plain += String.fromCharCode(Number(res));
      } catch (err) {
        plain += '?';
      }
    }
    return plain;
  }

  // Playfair Client-side Math
  function playfairClientGenerateMatrix(keyword = 'MONARCHY') {
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

    const grid = [];
    for (let r = 0; r < 5; r++) {
      grid.push(matrix.slice(r * 5, (r + 1) * 5));
    }
    return { matrix, grid, charPos };
  }

  function playfairClientEncrypt(text, keyword = 'MONARCHY') {
    if (!text) return '';
    const { grid, charPos } = playfairClientGenerateMatrix(keyword);
    const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
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

    return digraphs.map(([a, b]) => {
      const p1 = charPos[a];
      const p2 = charPos[b];
      if (p1.row === p2.row) {
        return grid[p1.row][(p1.col + 1) % 5] + grid[p2.row][(p2.col + 1) % 5];
      } else if (p1.col === p2.col) {
        return grid[(p1.row + 1) % 5][p1.col] + grid[(p2.row + 1) % 5][p2.col];
      } else {
        return grid[p1.row][p2.col] + grid[p2.row][p1.col];
      }
    }).join('');
  }

  function playfairClientDecrypt(ciphertext, keyword = 'MONARCHY') {
    if (!ciphertext) return '';
    const { grid, charPos } = playfairClientGenerateMatrix(keyword);
    const clean = ciphertext.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const digraphs = [];
    for (let i = 0; i < clean.length; i += 2) {
      digraphs.push([clean[i], clean[i + 1] || 'X']);
    }

    return digraphs.map(([a, b]) => {
      const p1 = charPos[a];
      const p2 = charPos[b];
      if (!p1 || !p2) return a + (b || '');
      if (p1.row === p2.row) {
        return grid[p1.row][(p1.col - 1 + 5) % 5] + grid[p2.row][(p2.col - 1 + 5) % 5];
      } else if (p1.col === p2.col) {
        return grid[(p1.row - 1 + 5) % 5][p1.col] + grid[(p2.row - 1 + 5) % 5][p2.col];
      } else {
        return grid[p1.row][p2.col] + grid[p2.row][p1.col];
      }
    }).join('');
  }

  // Hill Client-side Math
  function hillClientEncrypt(text, matrix = [[3, 3], [2, 5]]) {
    if (!text) return '';
    const [[a, b], [c, d]] = matrix;
    let clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length % 2 !== 0) clean += 'X';

    let out = '';
    for (let i = 0; i < clean.length; i += 2) {
      const p1 = clean.charCodeAt(i) - 65;
      const p2 = clean.charCodeAt(i + 1) - 65;
      const c1 = (a * p1 + b * p2) % 26;
      const c2 = (c * p1 + d * p2) % 26;
      out += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
    }
    return out;
  }

  function hillClientDecrypt(ciphertext, matrix = [[3, 3], [2, 5]]) {
    if (!ciphertext) return '';
    const [[a, b], [c, d]] = matrix;
    const det = ((a * d - b * c) % 26 + 26) % 26;
    let detInv = 1;
    for (let x = 1; x < 26; x++) {
      if ((det * x) % 26 === 1) {
        detInv = x;
        break;
      }
    }
    const invMatrix = [
      [((d * detInv) % 26 + 26) % 26, (((-b) * detInv) % 26 + 26) % 26],
      [(((-c) * detInv) % 26 + 26) % 26, ((a * detInv) % 26 + 26) % 26]
    ];
    const [[ia, ib], [ic, id]] = invMatrix;

    let clean = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length % 2 !== 0) clean += 'X';

    let out = '';
    for (let i = 0; i < clean.length; i += 2) {
      const c1 = clean.charCodeAt(i) - 65;
      const c2 = clean.charCodeAt(i + 1) - 65;
      const p1 = (ia * c1 + ib * c2) % 26;
      const p2 = (ic * c1 + id * c2) % 26;
      out += String.fromCharCode(p1 + 65) + String.fromCharCode(p2 + 65);
    }
    return out;
  }

  /**
   * 3D Letter-Flip Animation
   * Splits output into individual <span> tokens and executes staggered CSS 3D card flips
   * with mechanical decryption reel simulation.
   */
  function run3DFlipAnimation() {
    if (isAnimating) return;
    const input = inputEl();
    const output = outputEl();
    if (!input || !output) return;

    const raw = input.value;
    if (!raw) return;

    isAnimating = true;
    transformText();
    const targetText = window.AppState.lastTransformed || output.textContent;

    // Build flip container
    output.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'flip-token-container';
    output.appendChild(container);

    const segmenter = (typeof Intl !== 'undefined' && Intl.Segmenter)
      ? new Intl.Segmenter('en', { granularity: 'grapheme' })
      : null;
    const rawGraphemes = segmenter ? Array.from(segmenter.segment(raw), s => s.segment) : Array.from(raw);
    const targetGraphemes = segmenter ? Array.from(segmenter.segment(targetText), s => s.segment) : Array.from(targetText);

    const tokenElements = [];

    targetGraphemes.forEach((glyph, idx) => {
      if (glyph === ' ') {
        const space = document.createElement('span');
        space.style.display = 'inline-block';
        space.style.width = '12px';
        container.appendChild(space);
        return;
      }
      if (glyph === '\n') {
        const br = document.createElement('div');
        br.style.width = '100%';
        container.appendChild(br);
        return;
      }

      // Split output into individual <span> tokens
      const token = document.createElement('span');
      token.className = 'flip-token reel-active';

      const front = document.createElement('span');
      front.className = 'flip-token-face flip-token-front';
      front.textContent = rawGraphemes[idx] || '?';

      const back = document.createElement('span');
      back.className = 'flip-token-face flip-token-back';
      back.textContent = glyph;

      token.appendChild(front);
      token.appendChild(back);
      container.appendChild(token);
      tokenElements.push(token);
    });

    // Execute staggered CSS 3D card flips (transform: rotateY(180deg)) per character
    // Paced between 30ms and 150ms per token for mechanical reel realism
    const delayStep = Math.min(120, Math.max(25, 1200 / (tokenElements.length || 1)));
    tokenElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('flipped');
        if (window.AudioFx && index % 2 === 0) {
          window.AudioFx.playTick(1100 - (index * 8), 0.025);
        }
      }, index * delayStep);
    });

    setTimeout(() => {
      isAnimating = false;
      if (window.AudioFx) {
        window.AudioFx.playChime();
      }
    }, tokenElements.length * delayStep + 450);
  }

  // Highlight character in output
  function highlightCharacter(letter, symbol) {
    const output = outputEl();
    if (!output) return;

    clearHighlight();

    const currentText = window.AppState.lastTransformed || output.textContent;
    if (!currentText) return;

    const s = symbol || '';
    const l = letter || '';
    if (!s && !l) return;

    const pattern = new RegExp(`(${escapeRegExp(s)}|${escapeRegExp(l)})`, 'gi');
    const parts = currentText.split(pattern);
    output.innerHTML = parts.map(part => {
      if ((s && part.toLowerCase() === s.toLowerCase()) || (l && part.toLowerCase() === l.toLowerCase())) {
        return `<span class="highlight-match">${escapeHtml(part)}</span>`;
      }
      return escapeHtml(part);
    }).join('');
  }

  function clearHighlight() {
    document.querySelectorAll('.highlight-match').forEach(el => {
      el.classList.remove('highlight-match');
    });
    const output = outputEl();
    if (output && window.AppState.lastTransformed) {
      output.textContent = window.AppState.lastTransformed;
    }
    document.querySelectorAll('.alphabet-card').forEach(c => c.classList.remove('active-match'));
  }

  function clearAll() {
    const input = inputEl();
    const output = outputEl();
    if (input) input.value = '';
    if (output) output.innerHTML = '';
    updateCounters('', '');
    const alertBox = corruptAlertEl();
    if (alertBox) alertBox.classList.remove('active');
  }

  function swapText() {
    const input = inputEl();
    const output = outputEl();
    if (!input || !output) return;

    const outText = output.textContent;
    input.value = outText;
    toggleDirection();
  }

  function copyOutput() {
    const output = outputEl();
    if (!output) return;
    const text = output.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    });
  }

  function showToast(msg) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.background = 'var(--panel)';
      toast.style.border = '1px solid var(--accent)';
      toast.style.color = 'var(--accent)';
      toast.style.padding = '0.75rem 1.25rem';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 0 16px var(--accent-glow)';
      toast.style.zIndex = '9999';
      toast.style.fontWeight = 'bold';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  
  const ENGLISH_FREQ = {
    E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1,
    R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2,
    G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.2, X: 0.2,
    Q: 0.1, Z: 0.1
  };

  function renderFrequencyChart(text) {
    const container = document.getElementById('freqChartContainer');
    if (!container) return;

    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Awaiting transmission text to compute real-time frequency distribution...</div>';
      return;
    }

    const counts = {};
    for (const ch of clean) {
      counts[ch] = (counts[ch] || 0) + 1;
    }

    const total = clean.length;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem;">';

    sorted.forEach(([letter, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      const expected = ENGLISH_FREQ[letter] || 0.1;
      const widthPct = Math.min(100, Math.round((pct / 20) * 100));

      html += 
        '<div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">' +
            '<span style="font-family: var(--font-mono); font-weight: 800; font-size: 1rem; color: var(--accent);">' + letter + '</span>' +
            '<span style="font-size: 0.78rem; color: var(--text-secondary);">' + count + ' (' + pct + '%)</span>' +
          '</div>' +
          '<div style="width: 100%; height: 6px; background: var(--bg-subtle); border-radius: 999px; overflow: hidden; margin-bottom: 0.25rem;">' +
            '<div style="width: ' + widthPct + '%; height: 100%; background: var(--accent); border-radius: 999px;"></div>' +
          '</div>' +
          '<div style="font-size: 0.68rem; color: var(--text-muted); display: flex; justify-content: space-between;">' +
            '<span>Expected (EN): ' + expected + '%</span>' +
            '<span>' + (parseFloat(pct) > expected ? '▲ Higher' : '▼ Lower') + '</span>' +
          '</div>' +
        '</div>';
    });

    html += '</div>';
  // ====================================================
  // ENIGMA M3 CLIENT-SIDE SIMULATOR
  // ====================================================
  const CLIENT_ENIGMA_WIRINGS = {
    'I': { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 16 },
    'II': { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 4 },
    'III': { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 21 },
    'IV': { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 9 },
    'V': { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 25 }
  };
  const CLIENT_ENIGMA_REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

  function invertWiringClient(w) {
    const inv = new Array(26);
    for (let i = 0; i < 26; i++) {
      const t = w.charCodeAt(i) - 65;
      inv[t] = String.fromCharCode(i + 65);
    }
    return inv.join('');
  }

  function enigmaClientSimulate(text, options = {}) {
    const rotorKeys = options.rotors || ['I', 'II', 'III'];
    const positions = (options.positions || ['A', 'A', 'A']).map(p => {
      if (typeof p === 'number') return (p % 26 + 26) % 26;
      return (p.toUpperCase().charCodeAt(0) - 65 + 26) % 26;
    });
    const rings = (options.rings || [1, 1, 1]).map(r => {
      if (typeof r === 'number') return ((r - 1) % 26 + 26) % 26;
      return (r.toUpperCase().charCodeAt(0) - 65 + 26) % 26;
    });

    const plugMap = {};
    for (let i = 0; i < 26; i++) {
      const ch = String.fromCharCode(i + 65);
      plugMap[ch] = ch;
    }
    const pairs = (options.plugboard || '').toUpperCase().trim().split(/[\s,;-]+/);
    const used = new Set();
    pairs.forEach(p => {
      const s = p.replace(/[^A-Z]/g, '');
      if (s.length === 2 && s[0] !== s[1] && !used.has(s[0]) && !used.has(s[1])) {
        plugMap[s[0]] = s[1];
        plugMap[s[1]] = s[0];
        used.add(s[0]);
        used.add(s[1]);
      }
    });

    const rL = CLIENT_ENIGMA_WIRINGS[rotorKeys[0]] || CLIENT_ENIGMA_WIRINGS['I'];
    const rM = CLIENT_ENIGMA_WIRINGS[rotorKeys[1]] || CLIENT_ENIGMA_WIRINGS['II'];
    const rR = CLIENT_ENIGMA_WIRINGS[rotorKeys[2]] || CLIENT_ENIGMA_WIRINGS['III'];
    const rLInv = invertWiringClient(rL.wiring);
    const rMInv = invertWiringClient(rM.wiring);
    const rRInv = invertWiringClient(rR.wiring);
    const ref = CLIENT_ENIGMA_REFLECTOR_B;

    let res = '';
    const trace = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i].toUpperCase();
      if (ch < 'A' || ch > 'Z') {
        res += text[i];
        continue;
      }

      // Step mechanism (double stepping)
      if (positions[1] === rM.notch) {
        positions[1] = (positions[1] + 1) % 26;
        positions[0] = (positions[0] + 1) % 26;
      } else if (positions[2] === rR.notch) {
        positions[1] = (positions[1] + 1) % 26;
      }
      positions[2] = (positions[2] + 1) % 26;

      function passF(idx, w, pos, ring) {
        const s = (pos - ring + 26) % 26;
        const inPin = (idx + s) % 26;
        const outPin = w.charCodeAt(inPin) - 65;
        return (outPin - s + 26) % 26;
      }
      function passB(idx, invW, pos, ring) {
        const s = (pos - ring + 26) % 26;
        const inPin = (idx + s) % 26;
        const outPin = invW.charCodeAt(inPin) - 65;
        return (outPin - s + 26) % 26;
      }

      const p1 = plugMap[ch] || ch;
      let idx = p1.charCodeAt(0) - 65;
      const idxR = passF(idx, rR.wiring, positions[2], rings[2]);
      const idxM = passF(idxR, rM.wiring, positions[1], rings[1]);
      const idxL = passF(idxM, rL.wiring, positions[0], rings[0]);
      const refCh = ref[idxL];
      const idxRef = refCh.charCodeAt(0) - 65;
      const idxLRev = passB(idxRef, rLInv, positions[0], rings[0]);
      const idxMRev = passB(idxLRev, rMInv, positions[1], rings[1]);
      const idxRRev = passB(idxMRev, rRInv, positions[2], rings[2]);
      const beforePlug = String.fromCharCode(idxRRev + 65);
      const outChar = plugMap[beforePlug] || beforePlug;

      res += outChar;
      if (trace.length < 12) {
        trace.push({
          input: ch,
          output: outChar,
          positions: [
            String.fromCharCode(positions[0] + 65),
            String.fromCharCode(positions[1] + 65),
            String.fromCharCode(positions[2] + 65)
          ],
          path: [
            `Key: ${ch}`,
            `Plugboard: ${p1}`,
            `R3: ${String.fromCharCode(idxR + 65)}`,
            `R2: ${String.fromCharCode(idxM + 65)}`,
            `R1: ${String.fromCharCode(idxL + 65)}`,
            `Ref: ${refCh}`,
            `R1rev: ${String.fromCharCode(idxLRev + 65)}`,
            `R2rev: ${String.fromCharCode(idxMRev + 65)}`,
            `R3rev: ${beforePlug}`,
            `Lamp: ${outChar}`
          ]
        });
      }
    }

    return { ciphertext: res, trace };
  }

  // ====================================================
  // THE CRYPTANALYST'S DESK CLIENT-SIDE STATISTICAL ENGINE
  // ====================================================
  const ENGLISH_PROB = {
    A: 0.08167, B: 0.01492, C: 0.02782, D: 0.04253, E: 0.12702,
    F: 0.02228, G: 0.02015, H: 0.06094, I: 0.06966, J: 0.00153,
    K: 0.00772, L: 0.04025, M: 0.02406, N: 0.06749, O: 0.07507,
    P: 0.01929, Q: 0.00095, R: 0.05987, S: 0.06327, T: 0.09056,
    U: 0.02758, V: 0.00978, W: 0.02360, X: 0.00150, Y: 0.01974,
    Z: 0.00074
  };
  const CLIENT_WORDS = new Set([
    'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
    'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
    'HELLO', 'WORLD', 'SECRET', 'CIPHER', 'ATTACK', 'DAWN', 'EAGLE', 'NIGHT',
    'PROTOCOL', 'AETHER', 'TEST', 'MISSION', 'MESSAGE', 'CODE'
  ]);

  function updateCryptanalysisDesk(text) {
    const clean = (text || '').replace(/\s+/g, '');
    const cleanAlpha = (text || '').toUpperCase().replace(/[^A-Z]/g, '');

    // 1. Shannon Entropy
    const entVal = document.getElementById('statEntropyVal');
    const entBar = document.getElementById('statEntropyBar');
    const entSub = document.getElementById('statEntropySub');
    if (entVal && entBar && entSub) {
      if (clean.length === 0) {
        entVal.textContent = '0.00';
        entBar.style.width = '0%';
        entSub.textContent = 'Uniformity: 0%';
      } else {
        const counts = {};
        for (const c of clean) counts[c] = (counts[c] || 0) + 1;
        let H = 0;
        for (const c in counts) {
          const p = counts[c] / clean.length;
          H -= p * Math.log2(p);
        }
        const maxH = Math.log2(26);
        const ratio = Math.min(100, Math.round((H / maxH) * 100));
        entVal.textContent = H.toFixed(2);
        entBar.style.width = ratio + '%';
        entSub.textContent = `Uniformity: ${ratio}% • ${clean.length} symbols`;
      }
    }

    // 2. Index of Coincidence
    const iocVal = document.getElementById('statIocVal');
    const iocVerdict = document.getElementById('statIocVerdict');
    let overallIoC = 0;
    if (iocVal && iocVerdict) {
      if (cleanAlpha.length <= 1) {
        iocVal.textContent = '0.0000';
        iocVerdict.textContent = 'Awaiting ciphertext';
      } else {
        const n = cleanAlpha.length;
        const counts = {};
        for (const ch of cleanAlpha) counts[ch] = (counts[ch] || 0) + 1;
        let sum = 0;
        for (const ch in counts) sum += counts[ch] * (counts[ch] - 1);
        overallIoC = sum / (n * (n - 1));
        iocVal.textContent = overallIoC.toFixed(4);

        if (overallIoC >= 0.058) {
          iocVerdict.innerHTML = '<span style="color: #10B981;">● Monoalphabetic / Natural Language Pattern</span>';
        } else if (overallIoC >= 0.046) {
          iocVerdict.innerHTML = '<span style="color: var(--accent);">● Polyalphabetic Distribution</span>';
        } else {
          iocVerdict.innerHTML = '<span style="color: var(--text-secondary);">● High Diffusion / Pseudorandom</span>';
        }
      }
    }

    // 3. Caesar 25-Shift Brute Force
    const caesarGrid = document.getElementById('caesarBruteForceGrid');
    const caesarBadge = document.getElementById('caesarTopCandidateBadge');
    if (caesarGrid && cleanAlpha.length >= 3) {
      const candidates = [];
      for (let s = 1; s <= 25; s++) {
        const dec = caesarShift(cleanAlpha, 26 - s);
        let score = 0;
        const n = dec.length;
        const counts = {};
        for (const ch of dec) counts[ch] = (counts[ch] || 0) + 1;
        for (const ch in counts) {
          score += (counts[ch] / n) * (ENGLISH_PROB[ch] || 0.001);
        }
        const words = dec.split(/[^A-Z]+/).filter(Boolean);
        let matched = 0;
        for (const w of words) {
          if (CLIENT_WORDS.has(w)) matched++;
        }
        if (words.length > 0) score += (matched / words.length) * 0.25;
        candidates.push({ shift: s, text: dec, score });
      }
      candidates.sort((a, b) => b.score - a.score);

      const top = candidates[0];
      if (caesarBadge) {
        caesarBadge.style.display = 'inline-flex';
        caesarBadge.textContent = `Shift ${top.shift} — Top Candidate`;
      }

      caesarGrid.innerHTML = candidates.slice(0, 8).map((c, idx) => `
        <div class="caesar-candidate-card ${idx === 0 ? 'top-match' : ''}" data-shift="${c.shift}" title="Click to load shift ${c.shift} into Caesar workspace">
          <div style="overflow: hidden;">
            <div style="font-weight: 800; color: ${idx === 0 ? 'var(--accent)' : 'var(--text-primary)'}; font-size: 0.76rem;">
              Shift ${c.shift} ${idx === 0 ? '★ (Best Match)' : ''}
            </div>
            <div style="color: var(--text-secondary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 0.74rem;">
              ${escapeHtml(c.text.slice(0, 32))}
            </div>
          </div>
          <button class="btn-secondary" style="padding: 0.2rem 0.45rem; font-size: 0.7rem;">Apply</button>
        </div>
      `).join('');

      caesarGrid.querySelectorAll('.caesar-candidate-card').forEach(card => {
        card.addEventListener('click', () => {
          const shift = parseInt(card.dataset.shift, 10);
          window.AppState.caesarShift = shift;
          const caesarSlider = document.getElementById('caesarShiftSlider');
          const caesarNum = document.getElementById('caesarShiftNumber');
          if (caesarSlider) caesarSlider.value = shift;
          if (caesarNum) caesarNum.value = shift;
          window.ClassicalMode.updateCaesarLabels();
          transformText();
          showToast(`Applied Caesar Shift ${shift}`);
        });
      });
    }

    // 4. Vigenere IoC Periodicity Radar
    const iocChart = document.getElementById('vigenereIocChart');
    const vigenereBadge = document.getElementById('vigenereEstimatedKeyBadge');
    if (iocChart) {
      if (cleanAlpha.length < 8) {
        iocChart.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-muted); align-self: center; margin: auto;">Enter at least 8 characters to analyze periodic cosets</span>';
        if (vigenereBadge) vigenereBadge.style.display = 'none';
      } else {
        const periods = [];
        const maxP = Math.min(10, Math.floor(cleanAlpha.length / 2));
        for (let L = 1; L <= maxP; L++) {
          let tot = 0;
          let val = 0;
          for (let o = 0; o < L; o++) {
            let slice = '';
            for (let i = o; i < cleanAlpha.length; i += L) slice += cleanAlpha[i];
            if (slice.length > 1) {
              const counts = {};
              for (const ch of slice) counts[ch] = (counts[ch] || 0) + 1;
              let s = 0;
              for (const ch in counts) s += counts[ch] * (counts[ch] - 1);
              tot += s / (slice.length * (slice.length - 1));
              val++;
            }
          }
          const avg = val > 0 ? tot / val : 0;
          periods.push({ period: L, avg, diff: Math.abs(avg - 0.0667) });
        }

        let best = periods[0];
        for (let i = 1; i < periods.length; i++) {
          if (periods[i].diff < best.diff) best = periods[i];
        }

        if (vigenereBadge) {
          vigenereBadge.style.display = 'inline-flex';
          vigenereBadge.textContent = `Estimated Key Length: ${best.period}`;
        }

        iocChart.innerHTML = periods.map(p => {
          const heightPct = Math.min(100, Math.max(10, Math.round((p.avg / 0.08) * 100)));
          const isPeak = p.period === best.period;
          return `
            <div class="ioc-bar-col" title="Period ${p.period}: IoC = ${p.avg.toFixed(4)}">
              <div class="ioc-bar-fill ${isPeak ? 'peak-bar' : ''}" style="height: ${heightPct}%;"></div>
              <span class="ioc-bar-label">${p.period}</span>
            </div>
          `;
        }).join('');
      }
    }
  }

  return {
    init,
    transformText,
    run3DFlipAnimation,
    highlightCharacter,
    toggleDirection,
    showToast,
    enigmaClientSimulate,
    updateCryptanalysisDesk
  };
})();
