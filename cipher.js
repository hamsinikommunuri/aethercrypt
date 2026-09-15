const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../db');
const { authMiddleware } = require('./auth');
const {
  PRESET_THEMES,
  generateThemedAlphabet,
  queryLlmTheme,
  shuffleArray
} = require('../crypto/aiGenerator');
const {
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
  indexOfCoincidence,
  caesarBruteForce,
  vigenereEstimateKeyLength,
  shannonEntropy,
  calculateUnicityDistance,
  enigmaSimulate
} = require('../crypto/classical');

const router = express.Router();

// GET /api/cipher/presets
router.get('/presets', (req, res) => {
  const list = Object.entries(PRESET_THEMES).map(([key, theme]) => ({
    key,
    name: theme.name,
    description: theme.description,
    palette: theme.palette,
    sampleGlyphs: theme.glyphs.slice(0, 8),
    totalGlyphs: theme.glyphs.length
  }));
  res.json({ presets: list });
});

// POST /api/cipher/generate
router.post('/generate', async (req, res) => {
  const { themeKey = 'cyberpunk', customPrompt = '', salt = 'salt-' + Date.now() } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  try {
    let result;
    // If user provided a bespoke custom prompt and API key exists, try LLM
    if (customPrompt && customPrompt.trim().length > 3 && apiKey) {
      try {
        const llmResult = await queryLlmTheme(customPrompt, apiKey);
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        // Apply deterministic user-specific salt to ensure two users receive distinct substitution maps
        const permutedLlmGlyphs = shuffleArray(llmResult.glyphs.slice(0, 26), `${salt}:${customPrompt}`);
        const mapping = {};
        permutedLlmGlyphs.forEach((g, i) => {
          mapping[alphabet[i]] = g;
        });
        result = {
          themeKey: 'custom_ai',
          themeName: llmResult.themeName || 'Custom AI Theme',
          palette: { bg: '#100a1c', panel: '#1d1330', accent: '#38bdf8', text: '#f1f5f9', border: '#6366f1' },
          saltUsed: salt,
          mapping,
          glyphs: permutedLlmGlyphs,
          isAiGenerated: true
        };
      } catch (llmErr) {
        console.warn('[AI GENERATOR] LLM failed or offline, falling back to deterministic engine:', llmErr.message);
        result = generateThemedAlphabet(themeKey, customPrompt, salt);
        result.fallbackUsed = true;
      }
    } else {
      // Deterministic offline fallback engine
      result = generateThemedAlphabet(themeKey, customPrompt, salt);
    }

    res.json(result);
  } catch (err) {
    console.error('[CIPHER GENERATE ERROR]', err);
    res.status(500).json({ error: 'Failed to generate alphabet: ' + err.message });
  }
});

// POST /api/cipher/encrypt
router.post('/encrypt', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.plaintext !== undefined ? body.plaintext : '');
  const mode = body.mode || 'substitution';
  const params = { ...body, ...(body.params || {}) };

  if (!text) {
    return res.json({ result: '', charCount: 0 });
  }

  try {
    let encrypted = '';
    if (mode === 'caesar') {
      const shift = (params.shift !== undefined && !isNaN(parseInt(params.shift, 10))) ? parseInt(params.shift, 10) : 3;
      encrypted = caesarEncrypt(text, shift);
    } else if (mode === 'vigenere') {
      const keyword = params.keyword || 'KEY';
      encrypted = vigenereEncrypt(text, keyword);
    } else if (mode === 'base64') {
      encrypted = base64Encode(text);
    } else if (mode === 'atbash') {
      encrypted = atbashEncrypt(text);
    } else if (mode === 'affine') {
      const a = (params.a !== undefined && !isNaN(parseInt(params.a, 10))) ? parseInt(params.a, 10) : 5;
      const b = (params.b !== undefined && !isNaN(parseInt(params.b, 10))) ? parseInt(params.b, 10) : 8;
      encrypted = affineEncrypt(text, a, b);
    } else if (mode === 'rail_fence' || mode === 'railfence') {
      const rails = (params.rails !== undefined && !isNaN(parseInt(params.rails, 10))) ? parseInt(params.rails, 10) : 3;
      encrypted = railFenceEncrypt(text, rails);
    } else if (mode === 'rsa') {
      const e = (params.e !== undefined && !isNaN(parseInt(params.e, 10))) ? parseInt(params.e, 10) : 17;
      const n = (params.n !== undefined && !isNaN(parseInt(params.n, 10))) ? parseInt(params.n, 10) : 3233;
      encrypted = rsaEncrypt(text, e, n);
    } else if (mode === 'playfair') {
      const keyword = params.keyword || 'MONARCHY';
      encrypted = playfairEncrypt(text, keyword);
    } else if (mode === 'hill') {
      const a = params.a !== undefined ? parseInt(params.a, 10) : 3;
      const b = params.b !== undefined ? parseInt(params.b, 10) : 3;
      const c = params.c !== undefined ? parseInt(params.c, 10) : 2;
      const d = params.d !== undefined ? parseInt(params.d, 10) : 5;
      const matrix = params.matrix || [[a, b], [c, d]];
      encrypted = hillEncrypt(text, matrix);
    } else if (mode === 'enigma') {
      const rotors = params.rotors || ['I', 'II', 'III'];
      const positions = params.positions || [0, 0, 0];
      const rings = params.rings || [0, 0, 0];
      const plugboard = params.plugboard || '';
      const enigmaRes = enigmaSimulate(text, { rotors, positions, rings, plugboard });
      encrypted = enigmaRes.ciphertext;
    } else {
      // Substitution mode
      const mapping = params.mapping || {};
      encrypted = substitutionEncrypt(text, mapping);
    }

    res.json({
      original: text,
      result: encrypted,
      mode,
      charCount: encrypted.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Encryption failed: ' + err.message });
  }
});

// POST /api/cipher/decrypt
router.post('/decrypt', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.ciphertext !== undefined ? body.ciphertext : '');
  const mode = body.mode || 'substitution';
  const params = { ...body, ...(body.params || {}) };
  const attemptSalt = body.attemptSalt || params.attemptSalt || '';
  const originalSalt = body.originalSalt || params.originalSalt || '';
  const themeName = body.themeName || params.themeName || 'generic';

  if (!text) {
    return res.json({ result: '', charCount: 0 });
  }

  try {
    let decrypted = '';

    // Corrupted Decryption Security Logic check for themed substitution
    if (mode === 'substitution' && originalSalt && attemptSalt && attemptSalt !== originalSalt) {
      // Wrong salt provided! Return plausible corrupted glyphs rather than plain failure
      const themeGlyphs = params.glyphs || (params.mapping ? Object.values(params.mapping) : []);
      const corrupted = scrambleWithCorruptSalt(text, attemptSalt, themeGlyphs);
      return res.json({
        original: text,
        result: corrupted,
        isCorrupted: true,
        warning: 'Key/Salt mismatch detected! Decryption matrix corrupted.',
        charCount: corrupted.length
      });
    }

    if (mode === 'caesar') {
      const shift = (params.shift !== undefined && !isNaN(parseInt(params.shift, 10))) ? parseInt(params.shift, 10) : 3;
      decrypted = caesarDecrypt(text, shift);
    } else if (mode === 'vigenere') {
      const keyword = params.keyword || 'KEY';
      decrypted = vigenereDecrypt(text, keyword);
    } else if (mode === 'base64') {
      decrypted = base64Decode(text);
    } else if (mode === 'atbash') {
      decrypted = atbashDecrypt(text);
    } else if (mode === 'affine') {
      const a = (params.a !== undefined && !isNaN(parseInt(params.a, 10))) ? parseInt(params.a, 10) : 5;
      const b = (params.b !== undefined && !isNaN(parseInt(params.b, 10))) ? parseInt(params.b, 10) : 8;
      decrypted = affineDecrypt(text, a, b);
    } else if (mode === 'rail_fence' || mode === 'railfence') {
      const rails = (params.rails !== undefined && !isNaN(parseInt(params.rails, 10))) ? parseInt(params.rails, 10) : 3;
      decrypted = railFenceDecrypt(text, rails);
    } else if (mode === 'rsa') {
      const d = (params.d !== undefined && !isNaN(parseInt(params.d, 10))) ? parseInt(params.d, 10) : 2753;
      const n = (params.n !== undefined && !isNaN(parseInt(params.n, 10))) ? parseInt(params.n, 10) : 3233;
      decrypted = rsaDecrypt(text, d, n);
    } else if (mode === 'playfair') {
      const keyword = params.keyword || 'MONARCHY';
      decrypted = playfairDecrypt(text, keyword);
    } else if (mode === 'hill') {
      const a = params.a !== undefined ? parseInt(params.a, 10) : 3;
      const b = params.b !== undefined ? parseInt(params.b, 10) : 3;
      const c = params.c !== undefined ? parseInt(params.c, 10) : 2;
      const d = params.d !== undefined ? parseInt(params.d, 10) : 5;
      const matrix = params.matrix || [[a, b], [c, d]];
      decrypted = hillDecrypt(text, matrix);
    } else if (mode === 'enigma') {
      const rotors = params.rotors || ['I', 'II', 'III'];
      const positions = params.positions || [0, 0, 0];
      const rings = params.rings || [0, 0, 0];
      const plugboard = params.plugboard || '';
      const enigmaRes = enigmaSimulate(text, { rotors, positions, rings, plugboard });
      decrypted = enigmaRes.ciphertext;
    } else {
      // Substitution mode
      const mapping = params.mapping || {};
      decrypted = substitutionDecrypt(text, mapping);
    }

    res.json({
      original: text,
      result: decrypted,
      mode,
      isCorrupted: false,
      charCount: decrypted.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Decryption failed: ' + err.message });
  }
});

// GET /api/cipher/rsa/keypair?p=61&q=53&e=17
router.get('/rsa/keypair', (req, res) => {
  const p = parseInt(req.query.p || '61', 10);
  const q = parseInt(req.query.q || '53', 10);
  const e = parseInt(req.query.e || '17', 10);
  try {
    const keypair = rsaGenerateKeypair(p, q, e);
    res.json(keypair);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/cipher/trace
router.post('/trace', (req, res) => {
  const { mode = 'vigenere', text = '', params = {}, traceMode = 'encrypt' } = req.body || {};

  try {
    if (mode === 'vigenere') {
      const keyword = params.keyword || 'CIPHER';
      const trace = vigenereTrace(text, keyword, traceMode);
      return res.json({ mode: 'vigenere', ...trace });
    }
    if (mode === 'caesar') {
      const shift = parseInt(params.shift, 10) || 3;
      const alignment = caesarVisualAlignment(shift);
      return res.json({ mode: 'caesar', ...alignment });
    }
    if (mode === 'base64') {
      const visualization = base64PaddingVisualization(text);
      return res.json({ mode: 'base64', ...visualization });
    }
    if (mode === 'rsa') {
      const p = parseInt(params.p || '61', 10);
      const q = parseInt(params.q || '53', 10);
      const e = parseInt(params.e || '17', 10);
      const traceData = rsaTrace(text, p, q, e);
      return res.json({ mode: 'rsa', ...traceData });
    }
    if (mode === 'playfair') {
      const keyword = params.keyword || 'MONARCHY';
      const traceData = playfairTrace(text || 'INSTRUMENTS', keyword);
      return res.json({ mode: 'playfair', ...traceData });
    }
    if (mode === 'hill') {
      const a = params.a !== undefined ? parseInt(params.a, 10) : 3;
      const b = params.b !== undefined ? parseInt(params.b, 10) : 3;
      const c = params.c !== undefined ? parseInt(params.c, 10) : 2;
      const d = params.d !== undefined ? parseInt(params.d, 10) : 5;
      const matrix = params.matrix || [[a, b], [c, d]];
      const traceData = hillTrace(text || 'HELP', matrix);
      return res.json({ mode: 'hill', ...traceData });
    }

    if (mode === 'enigma') {
      const rotors = params.rotors || ['I', 'II', 'III'];
      const positions = params.positions || [0, 0, 0];
      const rings = params.rings || [0, 0, 0];
      const plugboard = params.plugboard || '';
      const enigmaRes = enigmaSimulate(text || 'AETHER', { rotors, positions, rings, plugboard });
      return res.json({ mode: 'enigma', ...enigmaRes });
    }

    res.status(400).json({ error: 'Unsupported mode for trace' });
  } catch (err) {
    res.status(500).json({ error: 'Trace failed: ' + err.message });
  }
});

// POST /api/cipher/enigma/simulate
router.post('/enigma/simulate', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.plaintext || '');
  const rotors = body.rotors || ['I', 'II', 'III'];
  const positions = body.positions || [0, 0, 0];
  const rings = body.rings || [0, 0, 0];
  const plugboard = body.plugboard || '';
  const reflector = body.reflector || 'B';

  try {
    const result = enigmaSimulate(text, { rotors, positions, rings, plugboard, reflector });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Enigma simulation failed: ' + err.message });
  }
});

// POST /api/cipher/cryptanalysis/caesar-break
router.post('/cryptanalysis/caesar-break', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.ciphertext || '');

  try {
    const result = caesarBruteForce(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Caesar cryptanalysis failed: ' + err.message });
  }
});

// POST /api/cipher/cryptanalysis/vigenere-ioc
router.post('/cryptanalysis/vigenere-ioc', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.ciphertext || '');
  const maxLen = body.maxLen ? parseInt(body.maxLen, 10) : 10;

  try {
    const result = vigenereEstimateKeyLength(text, maxLen);
    const overallIc = indexOfCoincidence(text);
    res.json({
      ...result,
      overallIc: parseFloat(overallIc.toFixed(5))
    });
  } catch (err) {
    res.status(500).json({ error: 'Vigenere IoC analysis failed: ' + err.message });
  }
});

// POST /api/cipher/cryptanalysis/entropy
router.post('/cryptanalysis/entropy', (req, res) => {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : (body.ciphertext || '');
  const keySpaceBits = body.keySpaceBits ? parseFloat(body.keySpaceBits) : 88.4;

  try {
    const result = shannonEntropy(text);
    const unicity = calculateUnicityDistance(keySpaceBits);
    res.json({
      ...result,
      unicityDistance: unicity
    });
  } catch (err) {
    res.status(500).json({ error: 'Entropy calculation failed: ' + err.message });
  }
});

// GET /api/cipher/profiles
router.get('/profiles', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.userId : 'guest';
  const db = getDb();
  try {
    const rows = db.prepare('SELECT * FROM cipher_profiles WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const profiles = rows.map(r => ({
      ...r,
      mapping: JSON.parse(r.mapping_json)
    }));
    res.json({ profiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cipher/profiles
router.post('/profiles', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.userId : (req.body.user_id || 'guest');
  const { theme_name = 'Custom Theme', mapping = {}, salt_key = 'default' } = req.body || {};

  // Validate mapping bijection
  const validation = validateBijection(mapping);
  if (!validation.isValid && validation.duplicates.length > 0) {
    return res.status(400).json({
      error: 'Invalid substitution mapping: duplicate symbols detected',
      details: validation
    });
  }

  const db = getDb();
  try {
    const id = 'prf_' + crypto.randomUUID();
    const mapping_json = JSON.stringify(mapping);
    db.prepare(`
      INSERT INTO cipher_profiles (id, user_id, theme_name, mapping_json, salt_key)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, theme_name, mapping_json, salt_key);

    res.status(201).json({
      message: 'Cipher profile saved',
      profile: { id, user_id: userId, theme_name, mapping, salt_key }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile: ' + err.message });
  }
});

// DELETE /api/cipher/profiles/:id
router.delete('/profiles/:id', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.userId : 'guest';
  const { id } = req.params;
  const db = getDb();
  try {
    const result = db.prepare('DELETE FROM cipher_profiles WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
      // Also try deleting if guest
      db.prepare('DELETE FROM cipher_profiles WHERE id = ?').run(id);
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router };
