const assert = require('assert');
const http = require('http');
const path = require('path');
const express = require('express');
const { router: authRouter } = require('../server/routes/auth');
const { router: cipherRouter } = require('../server/routes/cipher');
const { getDb } = require('../server/db');

console.log('====================================================');
console.log('  RUNNING EXPRESS API & HTTP ROUTE TEST SUITE       ');
console.log('====================================================\n');

let total = 0;
let passed = 0;

function runSync(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`  [FAIL] ${name}`);
    console.error('         ', e.message);
  }
}

async function runAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`  [FAIL] ${name}`);
    console.error('         ', e.message);
  }
}

// Helper for making HTTP requests
function makeRequest(server, options, body = null) {
  const addr = server.address();
  const reqOptions = {
    hostname: '127.0.0.1',
    port: addr.port,
    path: options.path,
    method: options.method || 'GET',
    headers: options.headers || {}
  };

  return new Promise((resolve, reject) => {
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  // 1. DB initialization test
  runSync('Database connection provides schema and prepared statements', () => {
    const db = getDb();
    assert.ok(db);
    assert.ok(typeof db.prepare === 'function');
  });

  // Build test Express server instance
  const app = express();
  app.use(express.json());
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));
  app.use('/api/auth', authRouter);
  app.use('/api/cipher', cipherRouter);
  app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // 2. Health check
    await runAsync('HTTP GET /api/health returns online status', async () => {
      const res = await makeRequest(server, { path: '/api/health' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'online');
    });

    // 3. Presets endpoint
    await runAsync('HTTP GET /api/cipher/presets returns all 20 unique presets', async () => {
      const res = await makeRequest(server, { path: '/api/cipher/presets' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.presets.length, 20);
      const pirate = res.body.presets.find(p => p.key === 'pirate');
      assert.ok(pirate);
      const cryptid = res.body.presets.find(p => p.key === 'cryptid_woods');
      assert.ok(cryptid);
    });

    // 4. Generate endpoint (deterministic salt)
    await runAsync('HTTP POST /api/cipher/generate produces deterministic salt mapping', async () => {
      const payload = { themeKey: 'pirate', salt: 'test_salt_alpha' };
      const res1 = await makeRequest(server, {
        path: '/api/cipher/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, payload);

      const res2 = await makeRequest(server, {
        path: '/api/cipher/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, payload);

      assert.strictEqual(res1.status, 200);
      assert.deepStrictEqual(res1.body.mapping, res2.body.mapping);
      assert.strictEqual(res1.body.themeKey, 'pirate');
    });

    // 5. Encrypt endpoint (Caesar, Vigenere, Base64, Substitution)
    await runAsync('HTTP POST /api/cipher/encrypt handles all modes', async () => {
      // Caesar
      const cRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'HELLO', mode: 'caesar', params: { shift: 3 } });
      assert.strictEqual(cRes.body.result, 'KHOOR');

      // Caesar shift 0
      const cZero = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'HELLO', mode: 'caesar', params: { shift: 0 } });
      assert.strictEqual(cZero.body.result, 'HELLO');

      // Vigenere
      const vRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'ATTACKATDAWN', mode: 'vigenere', params: { keyword: 'LEMON' } });
      assert.strictEqual(vRes.body.result, 'LXFOPVEFRNHR');

      // Base64
      const bRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'CyberSecure', mode: 'base64' });
      assert.strictEqual(bRes.body.result, Buffer.from('CyberSecure').toString('base64'));

      // Atbash
      const atbashRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'HELLO', mode: 'atbash' });
      assert.strictEqual(atbashRes.body.result, 'SVOOL');

      // Affine
      const affineRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'AFFINE', mode: 'affine', params: { a: 5, b: 8 } });
      assert.strictEqual(affineRes.body.result, 'IHHWVC');

      // Rail Fence
      const rfRes = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'DEFENDTHEEASTWALL', mode: 'rail_fence', params: { rails: 3 } });
      assert.strictEqual(rfRes.status, 200);
      assert.ok(rfRes.body.result.length === 'DEFENDTHEEASTWALL'.length);

      // RSA
      const rsaEnc = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'AETHER', mode: 'rsa', params: { e: 17, n: 3233 } });
      assert.strictEqual(rsaEnc.status, 200);
      assert.ok(rsaEnc.body.result.includes(' '));

      // Playfair
      const pfEnc = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'INSTRUMENTS', mode: 'playfair', params: { keyword: 'MONARCHY' } });
      assert.strictEqual(pfEnc.status, 200);
      assert.strictEqual(pfEnc.body.result, 'GATLMZCLRQXA');

      // Hill
      const hillEnc = await makeRequest(server, {
        path: '/api/cipher/encrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'HELP', mode: 'hill', params: { a: 3, b: 3, c: 2, d: 5 } });
      assert.strictEqual(hillEnc.status, 200);
      assert.strictEqual(hillEnc.body.result, 'HIAT');
    });

    // 6. Decrypt endpoint + Corrupted Decryption Security Check
    await runAsync('HTTP POST /api/cipher/decrypt detects wrong salt and returns scrambled glyphs', async () => {
      const normalRes = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'KHOOR', mode: 'caesar', params: { shift: 3 } });
      assert.strictEqual(normalRes.body.result, 'HELLO');
      assert.strictEqual(normalRes.body.isCorrupted, false);

      // Atbash decrypt
      const atbashDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'SVOOL', mode: 'atbash' });
      assert.strictEqual(atbashDec.body.result, 'HELLO');

      // Affine decrypt
      const affineDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'IHHWVC', mode: 'affine', params: { a: 5, b: 8 } });
      assert.strictEqual(affineDec.body.result, 'AFFINE');

      // Rail Fence decrypt
      const rfDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'DNETLEEDHESWLFTAA', mode: 'rail_fence', params: { rails: 3 } });
      assert.strictEqual(rfDec.body.result, 'DEFENDTHEEASTWALL');

      // RSA decrypt
      const rsaDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: '2790 28 2159 3000 28 1859', mode: 'rsa', params: { d: 2753, n: 3233 } });
      assert.strictEqual(rsaDec.body.result, 'AETHER');

      // Playfair decrypt
      const pfDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'GATLMZCLRQXA', mode: 'playfair', params: { keyword: 'MONARCHY' } });
      assert.strictEqual(pfDec.body.result, 'INSTRUMENTSX');

      // Hill decrypt
      const hillDec = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { text: 'HIAT', mode: 'hill', params: { a: 3, b: 3, c: 2, d: 5 } });
      assert.strictEqual(hillDec.body.result, 'HELP');

      // Corrupted salt trigger
      const corruptRes = await makeRequest(server, {
        path: '/api/cipher/decrypt',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        text: '⚓☠ 🦜',
        mode: 'substitution',
        attemptSalt: 'wrong_salt',
        originalSalt: 'correct_salt',
        params: { glyphs: ['⚓', '☠', '🦜'] }
      });
      assert.strictEqual(corruptRes.status, 200);
      assert.strictEqual(corruptRes.body.isCorrupted, true);
      assert.ok(corruptRes.body.warning.includes('Key/Salt mismatch'));
      assert.notStrictEqual(corruptRes.body.result, '⚓☠ 🦜');
    });

    // 6.5. RSA Keypair Endpoint
    await runAsync('HTTP GET /api/cipher/rsa/keypair generates valid keypair', async () => {
      const res = await makeRequest(server, { path: '/api/cipher/rsa/keypair?p=61&q=53&e=17' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.n, 3233);
      assert.strictEqual(res.body.phi, 3120);
      assert.strictEqual(res.body.e, 17);
      assert.strictEqual(res.body.d, 2753);
    });

    // 7. Auth flow: Signup, Login, Me
    let testToken = '';
    const testUser = 'agent_' + Math.floor(Math.random() * 100000);
    await runAsync('HTTP Auth flow: Signup -> Login -> Verify JWT Session', async () => {
      const signupRes = await makeRequest(server, {
        path: '/api/auth/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: testUser, password: 'password123' });
      assert.strictEqual(signupRes.status, 201);
      assert.ok(signupRes.body.token);

      const loginRes = await makeRequest(server, {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: testUser, password: 'password123' });
      assert.strictEqual(loginRes.status, 200);
      assert.ok(loginRes.body.token);
      testToken = loginRes.body.token;

      const meRes = await makeRequest(server, {
        path: '/api/auth/me',
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      assert.strictEqual(meRes.status, 200);
      assert.strictEqual(meRes.body.user.username, testUser);
    });

    // 8. Profiles CRUD
    await runAsync('HTTP Cipher Profiles CRUD: Save -> List -> Delete', async () => {
      const map = { A: '⚡', B: '🤖' };
      const saveRes = await makeRequest(server, {
        path: '/api/cipher/profiles',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        }
      }, { theme_name: 'E2E Cyber Test', mapping: map, salt_key: 'e2e_salt' });
      assert.strictEqual(saveRes.status, 201);
      const profileId = saveRes.body.profile.id;

      const listRes = await makeRequest(server, {
        path: '/api/cipher/profiles',
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      assert.strictEqual(listRes.status, 200);
      const found = listRes.body.profiles.find(p => p.id === profileId);
      assert.ok(found);

      const delRes = await makeRequest(server, {
        path: `/api/cipher/profiles/${profileId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      assert.strictEqual(delRes.status, 200);
    });

    // 9. Static asset check
    await runAsync('HTTP Static File Serving: index.html serves SPA dashboard', async () => {
      const res = await makeRequest(server, { path: '/index.html' });
      assert.ok(res.raw.includes('AETHERCRYPT'));
    });

    // 10. Enigma M3 Simulation endpoint
    await runAsync('HTTP POST /api/cipher/enigma/simulate performs authentic rotor encryption and trace', async () => {
      const res = await makeRequest(server, {
        path: '/api/cipher/enigma/simulate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        text: 'AETHERLAB',
        rotors: ['I', 'II', 'III'],
        positions: ['A', 'A', 'A'],
        rings: [0, 0, 0],
        plugboard: 'AE TH'
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.ciphertext);
      assert.strictEqual(res.body.ciphertext.length, 9);
      assert.ok(res.body.finalPositions);
      assert.ok(res.body.trace && res.body.trace.length > 0);

      // Reciprocal check over HTTP
      const decRes = await makeRequest(server, {
        path: '/api/cipher/enigma/simulate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        text: res.body.ciphertext,
        rotors: ['I', 'II', 'III'],
        positions: ['A', 'A', 'A'],
        rings: [0, 0, 0],
        plugboard: 'AE TH'
      });
      assert.strictEqual(decRes.status, 200);
      assert.strictEqual(decRes.body.ciphertext, 'AETHERLAB');
    });

    // 11. Cryptanalysis Endpoints
    await runAsync('HTTP Cryptanalysis endpoints: Caesar break, Vigenere IoC & Shannon Entropy', async () => {
      // A. Caesar break
      const breakRes = await makeRequest(server, {
        path: '/api/cipher/cryptanalysis/caesar-break',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { ciphertext: 'KHOOR ZRUOG' }); // HELLO WORLD shifted by 3
      assert.strictEqual(breakRes.status, 200);
      assert.ok(breakRes.body.candidates.length === 25);
      assert.strictEqual(breakRes.body.topCandidate.shift, 3);
      assert.strictEqual(breakRes.body.topCandidate.text, 'HELLO WORLD');

      // B. Vigenere IoC
      const iocRes = await makeRequest(server, {
        path: '/api/cipher/cryptanalysis/vigenere-ioc',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { ciphertext: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG' });
      assert.strictEqual(iocRes.status, 200);
      assert.ok(iocRes.body.periods.length > 0);
      assert.ok(iocRes.body.overallIc > 0);

      // C. Shannon Entropy
      const entRes = await makeRequest(server, {
        path: '/api/cipher/cryptanalysis/entropy',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { ciphertext: 'SECRET TRANSMISSION' });
      assert.strictEqual(entRes.status, 200);
      assert.ok(entRes.body.entropy > 0);
      assert.ok(entRes.body.unicityDistance > 0);
    });

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`  API TEST RESULTS: ${passed} / ${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
