const assert = require('assert');
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
} = require('../server/crypto/classical');

const {
  PRESET_THEMES,
  generateThemedAlphabet,
  shuffleArray
} = require('../server/crypto/aiGenerator');

const { getDb } = require('../server/db');

console.log('====================================================');
console.log('  RUNNING DEEP CRYPTOGRAPHIC & SYSTEM TEST SUITE    ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error('         ', err.message);
  }
}

// 1. Caesar Cipher Tests
runTest('Caesar Cipher: Standard Shift 3 and ROT13', () => {
  const plain = 'HELLO WORLD!';
  const enc3 = caesarEncrypt(plain, 3);
  assert.strictEqual(enc3, 'KHOOR ZRUOG!');
  const dec3 = caesarDecrypt(enc3, 3);
  assert.strictEqual(dec3, plain);

  const rot13 = caesarEncrypt('Attack at Dawn!', 13);
  assert.strictEqual(rot13, 'Nggnpx ng Qnja!');
  assert.strictEqual(caesarDecrypt(rot13, 13), 'Attack at Dawn!');
});

runTest('Caesar Cipher: Boundary Shifts (0, 25, 26, negative, wrap)', () => {
  const plain = 'The Quick Brown Fox Jumps Over 123 Lazy Dogs.';
  assert.strictEqual(caesarDecrypt(caesarEncrypt(plain, 0), 0), plain);
  assert.strictEqual(caesarDecrypt(caesarEncrypt(plain, 25), 25), plain);
  assert.strictEqual(caesarDecrypt(caesarEncrypt(plain, 52), 52), plain);
  assert.strictEqual(caesarDecrypt(caesarEncrypt(plain, -3), -3), plain);
});

runTest('Caesar Cipher: Visual Alignment Structure', () => {
  const align = caesarVisualAlignment(4);
  assert.strictEqual(align.shift, 4);
  assert.strictEqual(align.plainAlphabet.length, 26);
  assert.strictEqual(align.cipherAlphabet.length, 26);
  assert.strictEqual(align.plainAlphabet[0], 'A');
  assert.strictEqual(align.cipherAlphabet[0], 'E');
  assert.strictEqual(align.offsets.length, 26);
});

// 2. Vigenère Cipher Tests
runTest('Vigenère Cipher: Standard Encryption and Decryption', () => {
  const plain = 'ATTACKATDAWN';
  const key = 'LEMON';
  const enc = vigenereEncrypt(plain, key);
  assert.strictEqual(enc, 'LXFOPVEFRNHR');
  const dec = vigenereDecrypt(enc, key);
  assert.strictEqual(dec, plain);
});

runTest('Vigenère Cipher: Case Preservation and Punctuation Passthrough', () => {
  const plain = 'Secret Mission: 007, Proceed with Caution!';
  const key = 'SKYFALL';
  const enc = vigenereEncrypt(plain, key);
  const dec = vigenereDecrypt(enc, key);
  assert.strictEqual(dec, plain);
  assert.match(enc, /: 007, /);
});

runTest('Vigenère Cipher: Trace Step-by-Step Alignment', () => {
  const traceResult = vigenereTrace('HELLO', 'KEY', 'encrypt');
  assert.strictEqual(traceResult.keyword, 'KEY');
  assert.strictEqual(traceResult.trace.length, 5);
  assert.strictEqual(traceResult.trace[0].keyChar, 'K');
  assert.strictEqual(traceResult.trace[0].result, 'R'); // H(7) + K(10) = 17 -> R
  assert.strictEqual(traceResult.trace[1].keyChar, 'E');
  assert.strictEqual(traceResult.trace[2].keyChar, 'Y');
  assert.strictEqual(traceResult.trace[3].keyChar, 'K');
});

// 3. Base64 Cipher Tests
runTest('Base64: RFC 4648 Standard Encoding and UTF-8 Decoding', () => {
  assert.strictEqual(base64Encode('Man'), 'TWFu');
  assert.strictEqual(base64Decode('TWFu'), 'Man');
  assert.strictEqual(base64Encode('pleasure.'), 'cGxlYXN1cmUu');
  assert.strictEqual(base64Decode('cGxlYXN1cmUu'), 'pleasure.');
  
  // UTF-8 multibyte strings
  const utf8Text = 'AetherCrypt ⚡ 2026';
  const encUtf8 = base64Encode(utf8Text);
  assert.strictEqual(base64Decode(encUtf8), utf8Text);
});

runTest('Base64: Byte-Level Padding Visualization (0, 1, 2 bytes remainder)', () => {
  // 3 bytes -> 0 padding chars
  const vis0 = base64PaddingVisualization('ABC');
  assert.strictEqual(vis0.totalBytes, 3);
  assert.strictEqual(vis0.paddingCount, 0);
  assert.strictEqual(vis0.paddingChars, '');
  assert.strictEqual(vis0.encoded, 'QUJD');

  // 2 bytes -> 1 padding char '='
  const vis1 = base64PaddingVisualization('AB');
  assert.strictEqual(vis1.totalBytes, 2);
  assert.strictEqual(vis1.paddingCount, 1);
  assert.strictEqual(vis1.paddingChars, '=');
  assert.strictEqual(vis1.encoded, 'QUI=');

  // 1 byte -> 2 padding chars '=='
  const vis2 = base64PaddingVisualization('A');
  assert.strictEqual(vis2.totalBytes, 1);
  assert.strictEqual(vis2.paddingCount, 2);
  assert.strictEqual(vis2.paddingChars, '==');
  assert.strictEqual(vis2.encoded, 'QQ==');
});

// 3b. Atbash & Affine Ciphers
runTest('Atbash Cipher: Involution & Case Preservation', () => {
  const plain = 'Hello, World! 123';
  const encrypted = atbashEncrypt(plain);
  assert.strictEqual(encrypted, 'Svool, Dliow! 123');
  const decrypted = atbashDecrypt(encrypted);
  assert.strictEqual(decrypted, plain);
  // Full alphabet inversion check
  assert.strictEqual(atbashEncrypt('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'ZYXWVUTSRQPONMLKJIHGFEDCBA');
});

runTest('Affine Cipher: Algebraic Encryption, Decryption & Coprimality', () => {
  const text = 'AFFINE CIPHER';
  // a = 5, b = 8
  const encrypted = affineEncrypt(text, 5, 8);
  assert.strictEqual(encrypted, 'IHHWVC SWFRCP');
  const decrypted = affineDecrypt(encrypted, 5, 8);
  assert.strictEqual(decrypted, text);

  // Coprimality error check (a = 4 is not coprime with 26)
  assert.throws(() => {
    affineEncrypt('TEST', 4, 1);
  }, /must be coprime/);
});

runTest('Rail Fence Cipher: Multi-Rail Zig-Zag Transposition & Inversion', () => {
  const plain = 'DEFEND THE EAST WALL';
  // 3 rails
  const enc3 = railFenceEncrypt(plain, 3);
  const dec3 = railFenceDecrypt(enc3, 3);
  assert.strictEqual(dec3, plain);

  // 4 rails
  const enc4 = railFenceEncrypt(plain, 4);
  const dec4 = railFenceDecrypt(enc4, 4);
  assert.strictEqual(dec4, plain);

  // Boundary cases: rails = 1 or rails >= text.length
  assert.strictEqual(railFenceEncrypt('SHORT', 10), 'SHORT');
  assert.strictEqual(railFenceDecrypt('SHORT', 10), 'SHORT');

  // Matrix structure
  const mat = railFenceMatrix('HELLO', 3);
  assert.strictEqual(mat.rails, 3);
  assert.strictEqual(mat.totalChars, 5);
  assert.ok(Array.isArray(mat.matrix));
  assert.strictEqual(mat.matrix.length, 3);
});

// 3.5. RSA Public-Key Asymmetric Cryptography Tests
runTest('RSA: Keypair Generation, Coprimality, and Modulo Arithmetic', () => {
  const kp = rsaGenerateKeypair(61, 53, 17);
  assert.strictEqual(kp.n, 3233);
  assert.strictEqual(kp.phi, 3120);
  assert.strictEqual(kp.e, 17);
  assert.strictEqual(kp.d, 2753);
  // Verify e * d mod phi == 1
  assert.strictEqual((BigInt(kp.e) * BigInt(kp.d)) % BigInt(kp.phi), 1n);

  // Error handling for composite inputs
  assert.throws(() => rsaGenerateKeypair(60, 53), /must be a prime/);
  assert.throws(() => rsaGenerateKeypair(53, 53), /must be distinct/);
});

runTest('RSA: Text Encryption, Integer Stream & Lossless Decryption', () => {
  const kp = rsaGenerateKeypair(61, 53, 17);
  const plain = 'AETHER 2026';
  const cipher = rsaEncrypt(plain, kp.e, kp.n);
  assert.ok(typeof cipher === 'string');
  const tokens = cipher.split(' ');
  assert.strictEqual(tokens.length, plain.length);

  const decrypted = rsaDecrypt(cipher, kp.d, kp.n);
  assert.strictEqual(decrypted, plain);
});

runTest('RSA: Trace Exponentiation Table', () => {
  const res = rsaTrace('AETH', 61, 53, 17);
  assert.strictEqual(res.trace.length, 4);
  assert.strictEqual(res.trace[0].char, 'A');
  assert.strictEqual(res.trace[0].decryptedChar, 'A');
  assert.ok(res.trace[0].formulaEnc.includes('mod 3233'));
});

// 3.6. Playfair & Hill Matrix Ciphers
runTest('Playfair Cipher: 5x5 Matrix Generation, Digraph Rules & Inversion', () => {
  const { grid } = playfairGenerateMatrix('MONARCHY');
  assert.strictEqual(grid.length, 5);
  assert.strictEqual(grid[0].length, 5);
  assert.strictEqual(grid[0][0], 'M');
  assert.strictEqual(grid[0][1], 'O');

  // Standard textbook vector: INSTRUMENTS under MONARCHY -> GATLMZCLRQXA
  const enc = playfairEncrypt('INSTRUMENTS', 'MONARCHY');
  assert.strictEqual(enc, 'GATLMZCLRQXA');

  const dec = playfairDecrypt(enc, 'MONARCHY');
  assert.strictEqual(dec, 'INSTRUMENTSX'); // Trailing X padding preserved

  // Test Trace
  const trace = playfairTrace('HELLO', 'MONARCHY');
  assert.ok(trace.steps.length > 0);
  assert.ok(trace.steps[0].rule);
});

runTest('Hill Cipher: 2x2 Matrix Invertibility, Vector Multiplication & Inversion', () => {
  const keyMatrix = [[3, 3], [2, 5]];
  const validation = hillValidateMatrix(keyMatrix);
  assert.strictEqual(validation.det, 9);
  assert.strictEqual(validation.detInv, 3); // 9 * 3 = 27 = 1 mod 26
  assert.deepStrictEqual(validation.invMatrix, [[15, 17], [20, 9]]);

  // Test HELP -> HIAT under [[3,3],[2,5]]
  const enc = hillEncrypt('HELP', keyMatrix);
  assert.strictEqual(enc, 'HIAT');

  const dec = hillDecrypt(enc, keyMatrix);
  assert.strictEqual(dec, 'HELP');

  // Non-invertible matrix error check (det = 0 or gcd(det, 26) != 1)
  assert.throws(() => hillValidateMatrix([[2, 4], [2, 4]]), /must be coprime with 26/);
});

// 4. General Substitution & Bijection Tests
runTest('Substitution: Emoji / Rune Multi-codepoint Bijection', () => {
  const sampleMap = {
    'A': '⚓', 'B': '☠', 'C': '🏴‍☠️', 'D': '🦜', 'E': '🪙',
    'F': '🗺️', 'G': '⚔️', 'H': '🧭', 'I': '🥃', 'J': '⛵',
    'K': '💣', 'L': '🐙', 'M': '💎', 'N': '🏝️', 'O': '🦈',
    'P': '🪵', 'Q': '🗝️', 'R': '🍺', 'S': '🌊', 'T': '🍖',
    'U': '🎣', 'V': '🪝', 'W': '🚩', 'X': '📜', 'Y': '🔭', 'Z': '💰'
  };

  const plain = 'CAPTAIN HOOK ON THE SHIP';
  const encrypted = substitutionEncrypt(plain, sampleMap);
  assert.ok(encrypted.includes('⚓'));
  assert.ok(encrypted.includes('🏴‍☠️'));

  const decrypted = substitutionDecrypt(encrypted, sampleMap);
  assert.strictEqual(decrypted, plain);
});

runTest('Substitution: Bijection Validation (Success & Duplicate Detection)', () => {
  const validMap = {};
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l, i) => {
    validMap[l] = `[${i}]`;
  });
  const validCheck = validateBijection(validMap);
  assert.strictEqual(validCheck.isValid, true);
  assert.strictEqual(validCheck.duplicates.length, 0);

  // Duplicate test
  const duplicateMap = { ...validMap, 'Z': validMap['A'] };
  const dupCheck = validateBijection(duplicateMap);
  assert.strictEqual(dupCheck.isValid, false);
  assert.ok(dupCheck.duplicates.length > 0);
  assert.strictEqual(dupCheck.duplicates[0].value, validMap['A']);
});

// 5. AI Themed Generator & Presets Tests
runTest('Presets: All 20 Themes Defined with 26 Distinct Glyphs Each', () => {
  const themeKeys = Object.keys(PRESET_THEMES);
  assert.strictEqual(themeKeys.length, 20, 'Should have exactly 20 preset themes');

  themeKeys.forEach(key => {
    const theme = PRESET_THEMES[key];
    assert.ok(theme.name, `Theme ${key} should have a name`);
    assert.strictEqual(theme.glyphs.length, 26, `Theme ${key} must have exactly 26 glyphs`);
    
    // Check uniqueness
    const uniqueGlyphs = new Set(theme.glyphs);
    assert.strictEqual(uniqueGlyphs.size, 26, `Theme ${key} has duplicate glyphs! Found ${uniqueGlyphs.size}/26 unique`);
  });
});

runTest('AI Generator: Salt Determinism & User Distinctness', () => {
  // Same salt -> identical mapping
  const run1 = generateThemedAlphabet('pirate', '', 'salt_alpha');
  const run2 = generateThemedAlphabet('pirate', '', 'salt_alpha');
  assert.deepStrictEqual(run1.mapping, run2.mapping, 'Identical salt must yield identical mapping');

  // Different salt -> distinct permutation
  const runBeta = generateThemedAlphabet('pirate', '', 'salt_beta');
  let matchCount = 0;
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
    if (run1.mapping[l] === runBeta.mapping[l]) matchCount++;
  });
  assert.ok(matchCount < 26, 'Different salts must permute mapping differently');
});

// 6. Corrupted Decryption Security Logic Tests
runTest('Corrupted Decryption: Scrambles Ciphertext with Plausible Glyphs on Wrong Salt', () => {
  const cipher = generateThemedAlphabet('cyberpunk', '', 'user_salt_123');
  const plaintext = 'TOP SECRET LAUNCH CODE 99';
  const encrypted = substitutionEncrypt(plaintext, cipher.mapping);

  // Decrypt with correct mapping works
  const successDecrypted = substitutionDecrypt(encrypted, cipher.mapping);
  assert.strictEqual(successDecrypted, plaintext);

  // Decrypt with WRONG salt
  const corruptOutput1 = scrambleWithCorruptSalt(encrypted, 'wrong_salt_999', cipher.glyphs);
  assert.notStrictEqual(corruptOutput1, plaintext, 'Corrupt decryption must not return plaintext');
  assert.ok(corruptOutput1.length > 0);

  // Deterministic: same wrong salt produces identical scrambled output
  const corruptOutput2 = scrambleWithCorruptSalt(encrypted, 'wrong_salt_999', cipher.glyphs);
  assert.strictEqual(corruptOutput1, corruptOutput2, 'Same wrong salt must deterministically produce same scrambled output');

  // Different wrong salt produces different scrambled output
  const corruptOutput3 = scrambleWithCorruptSalt(encrypted, 'another_wrong_salt', cipher.glyphs);
  assert.notStrictEqual(corruptOutput1, corruptOutput3, 'Different wrong salt must produce different scrambled output');
});

// 7. Database Engine Tests
runTest('Database: Users and Cipher Profiles Schema & CRUD', () => {
  const db = getDb();
  
  // Insert test user
  const testUserId = 'test_user_' + Date.now();
  const testUsername = 'operative_' + Math.floor(Math.random() * 10000);
  db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(
    testUserId,
    testUsername,
    'salt:dummyhash'
  );

  const queriedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
  assert.ok(queriedUser);
  assert.strictEqual(queriedUser.username, testUsername);

  // Insert profile
  const profileId = 'prf_' + Date.now();
  const sampleMapJson = JSON.stringify({ A: '⚡', B: '🤖' });
  db.prepare(`
    INSERT INTO cipher_profiles (id, user_id, theme_name, mapping_json, salt_key)
    VALUES (?, ?, ?, ?, ?)
  `).run(profileId, testUserId, 'Test Cyber Profile', sampleMapJson, 'salt_99');

  const profile = db.prepare('SELECT * FROM cipher_profiles WHERE id = ?').get(profileId);
  assert.ok(profile);
  assert.strictEqual(profile.theme_name, 'Test Cyber Profile');

  // Query by user
  const userProfiles = db.prepare('SELECT * FROM cipher_profiles WHERE user_id = ?').all(testUserId);
  assert.strictEqual(userProfiles.length, 1);

  // Delete profile
  db.prepare('DELETE FROM cipher_profiles WHERE id = ?').run(profileId);
  const deletedProfile = db.prepare('SELECT * FROM cipher_profiles WHERE id = ?').get(profileId);
  assert.strictEqual(deletedProfile, undefined);

  // Guest user insertion test (foreign key integrity)
  const guestPrfId = 'prf_guest_' + Date.now();
  db.prepare(`
    INSERT INTO cipher_profiles (id, user_id, theme_name, mapping_json, salt_key)
    VALUES (?, ?, ?, ?, ?)
  `).run(guestPrfId, 'guest', 'Guest Profile', JSON.stringify({ A: '1' }), 'guest_salt');
  const guestPrf = db.prepare('SELECT * FROM cipher_profiles WHERE id = ?').get(guestPrfId);
  assert.ok(guestPrf);
  db.prepare('DELETE FROM cipher_profiles WHERE id = ?').run(guestPrfId);
});

runTest('Edge Case: Digit Bijection Duplicate Detection across board', () => {
  const mapWithDigitDup = {};
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l, i) => {
    mapWithDigitDup[l] = `[${i}]`;
  });
  // Assign same symbol to '0' as 'A'
  mapWithDigitDup['0'] = mapWithDigitDup['A'];
  const check = validateBijection(mapWithDigitDup);
  assert.strictEqual(check.isValid, false);
  assert.ok(check.duplicates.length > 0);
  assert.strictEqual(check.duplicates[0].keys.includes('A'), true);
  assert.strictEqual(check.duplicates[0].keys.includes('0'), true);
});

runTest('Edge Case: Corrupted Decryption preserves composite multi-byte emoji intact', () => {
  const compositeText = '🏴‍☠️ ⚓ ⚔️';
  const scrambled = scrambleWithCorruptSalt(compositeText, 'random_wrong_salt');
  assert.ok(scrambled.length > 0);
  assert.notStrictEqual(scrambled, compositeText);
});

runTest('Cryptanalysis: Caesar Brute Force & Confidence Scoring', () => {
  const plain = 'THE EAGLE FLIES AT MIDNIGHT ACROSS THE OBSERVATORY';
  const shift = 7;
  const cipher = caesarEncrypt(plain, shift);
  const result = caesarBruteForce(cipher);

  assert.ok(result.candidates.length === 25);
  assert.ok(result.topCandidate);
  assert.strictEqual(result.topCandidate.shift, shift);
  assert.strictEqual(result.topCandidate.text, plain);
  assert.ok(result.topCandidate.confidence > 75);
});

runTest('Cryptanalysis: Index of Coincidence (IoC) & English Discrimination', () => {
  const englishText = 'THE OBSERVATORY MONITORS SECRET TRANSMISSIONS ACROSS SECURE ATMOSPHERIC CHANNELS';
  const englishIc = indexOfCoincidence(englishText);
  // Standard English IoC is around 0.0667, text sample should be significantly higher than 0.040
  assert.ok(englishIc > 0.048, `Expected English IoC > 0.048, got ${englishIc}`);

  const randomChars = 'QWXJ ZVBN MPKL TYRU FHCO SGID EAOP';
  const randomIc = indexOfCoincidence(randomChars);
  assert.ok(randomIc < englishIc, `Random IoC (${randomIc}) should be less than English IoC (${englishIc})`);
});

runTest('Cryptanalysis: Vigenère Periodic Coset Key-Length Estimation', () => {
  const plain = 'THE OBSERVATORY HAS MONITORED THE SECRET SATELLITE COMMUNICATIONS TRANSMITTED OVER DEEP SPACE FREQUENCIES TO CONFIRM THAT ALL CODES ARE SYNCHRONIZED ACROSS GROUND STATIONS';
  const keyword = 'KEY'; // Length 3
  const cipher = vigenereEncrypt(plain, keyword);
  const result = vigenereEstimateKeyLength(cipher, 8);

  assert.ok(result.periods.length > 0);
  // The estimated period should be 3 or a harmonic multiple (e.g. 6)
  assert.ok(result.estimatedLength % 3 === 0, `Expected period to be multiple of 3, got ${result.estimatedLength}`);
});

runTest('Cryptanalysis: Shannon Information Entropy & Unicity Distance', () => {
  const uniformRepeated = 'AAAAAAAAAAAAAAAA';
  const h0 = shannonEntropy(uniformRepeated);
  assert.strictEqual(h0.entropy, 0);

  const englishSample = 'THE SECRET PROTOCOL IS INITIATED';
  const hEng = shannonEntropy(englishSample);
  assert.ok(hEng.entropy > 2.5 && hEng.entropy < 4.7);
  assert.ok(hEng.uniformityRatio > 0 && hEng.uniformityRatio <= 1);

  const unicity = calculateUnicityDistance(88.4, 3.2);
  assert.ok(unicity > 20 && unicity < 35);
});

runTest('Enigma M3: Mechanical Stepping, Reflector B, Plugboard & Self-Reciprocity', () => {
  const plain = 'ATTACKATDAWN';
  const options = {
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'B', 'C'],
    rings: [0, 0, 0],
    plugboard: 'AT DE'
  };

  // 1. Encryption
  const enc = enigmaSimulate(plain, options);
  assert.ok(enc.ciphertext.length === plain.length);
  assert.notStrictEqual(enc.ciphertext, plain);

  // 2. Fatal Enigma flaw: a letter never encrypts to itself
  for (let i = 0; i < plain.length; i++) {
    assert.notStrictEqual(enc.ciphertext[i], plain[i], `Letter ${plain[i]} encrypted to itself at pos ${i}`);
  }

  // 3. Reciprocal decryption: running ciphertext through identical starting settings recovers plaintext
  const dec = enigmaSimulate(enc.ciphertext, {
    rotors: ['I', 'II', 'III'],
    positions: ['A', 'B', 'C'],
    rings: [0, 0, 0],
    plugboard: 'AT DE'
  });
  assert.strictEqual(dec.ciphertext, plain, 'Enigma failed reciprocal decryption');
  assert.ok(enc.trace.length > 0);
  assert.ok(enc.trace[0].path.length > 5);
});

console.log('\n====================================================');
console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
