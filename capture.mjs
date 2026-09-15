import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

const outDir = 'C:\\Users\\hamsi\\.gemini\\antigravity\\brain\\73674890-fe98-42b7-8cce-9f4a9a8f01df\\screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Launching headless browser:', browserPath);
const browserProc = spawn(browserPath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  '--window-size=1440,960',
  '--hide-scrollbars',
  'http://localhost:3000'
]);

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function main() {
  await sleep(2500);

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const resp = await fetch('http://127.0.0.1:9222/json/list');
      targets = await resp.json();
      if (targets && targets.length > 0) break;
    } catch (e) {
      await sleep(500);
    }
  }

  if (!targets || !targets[0]) {
    console.error('Could not find debug target');
    browserProc.kill();
    process.exit(1);
  }

  const wsUrl = targets[0].webSocketDebuggerUrl;
  console.log('Connecting to CDP at:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  await new Promise(res => ws.onopen = res);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, awaitPromise: true });
    return res;
  }

  async function takeScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const filePath = path.join(outDir, filename);
    fs.writeFileSync(filePath, buf);
    console.log(`[Captured] ${filename} (${buf.length} bytes)`);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(1000);

  // 1. Initial Auth View
  await takeScreenshot('01_auth_view.png');

  // 2. Click "Explore as Guest Operative" -> Home View
  console.log('Navigating to Home View...');
  await evaluate(`document.getElementById('guestEnterBtn').click()`);
  await sleep(1200);
  await takeScreenshot('02_home_observatory_view.png');

  // 3. Open Mode 1: Manual Language
  console.log('Navigating to Mode 1 (Manual Language)...');
  await evaluate(`document.getElementById('homeCardManual').click()`);
  await sleep(800);
  await takeScreenshot('03_mode1_manual.png');

  // 4. Open Mode 2: AI Themed Cipher Forge
  console.log('Navigating to Mode 2 (AI Themed Cipher)...');
  await evaluate(`window.App.openMode('ai')`);
  await sleep(800);
  await takeScreenshot('04_mode2_ai.png');

  // 5. Open Mode 3: Classical Cryptography Lab
  console.log('Navigating to Mode 3 (Classical Cryptography)...');
  await evaluate(`window.App.openMode('classical')`);
  await sleep(800);
  await takeScreenshot('05_mode3_classical.png');

  // 6. Test Caesar Disk and Shift
  console.log('Testing Caesar Disk shift adjustment...');
  await evaluate(`
    const slider = document.getElementById('caesarShiftSlider');
    if (slider) {
      slider.value = 7;
      slider.dispatchEvent(new Event('input'));
    }
  `);
  await sleep(600);
  await takeScreenshot('06_caesar_shifted.png');

  // 7. Test Message Lab Encryption with 3D animation
  console.log('Testing Message Lab live encryption...');
  await evaluate(`
    const input = document.getElementById('cipherInput');
    if (input) {
      input.value = 'TOP SECRET TRANSMISSION FOR AGENT OMEGA';
      input.dispatchEvent(new Event('input'));
    }
    const runBtn = document.getElementById('runEncryptBtn');
    if (runBtn) runBtn.click();
  `);
  await sleep(1000);
  await takeScreenshot('07_live_cipher_encrypted.png');

  // 8. Open Codebook Export Modal
  console.log('Opening Codebook Modal...');
  await evaluate(`
    const btn = document.getElementById('exportCodebookBtn');
    if (btn) btn.click();
  `);
  await sleep(800);
  await takeScreenshot('08_codebook_modal.png');

  // Close codebook modal
  await evaluate(`
    const closeBtn = document.getElementById('closeCodebookModalBtn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(500);

  // 9. Open Shareable Card Modal
  console.log('Opening Shareable Card Modal...');
  await evaluate(`
    const shareBtn = document.getElementById('shareCardBtn');
    if (shareBtn) shareBtn.click();
  `);
  await sleep(800);
  await takeScreenshot('09_shareable_card_modal.png');

  console.log('All visual screenshots successfully captured.');
  ws.close();
  browserProc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Error during capture:', err);
  browserProc.kill();
  process.exit(1);
});
