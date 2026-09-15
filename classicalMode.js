/**
 * Mode 3: Cyber Ciphers (Pure Algorithmic Cryptography)
 * Interactive Caesar Disk, Vigenère Alignment Trace, and Base64 Padding Visualizer
 */

window.ClassicalMode = (function() {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function init() {
    attachEventListeners();
    renderCaesarComparison(window.AppState.caesarShift);
    renderAtbashComparison();
    renderAffineControls();
    renderRailFenceMatrix('AETHERCRYPT OBSERVATORY', window.AppState.railFenceRails || 3);
    renderRsaControls();
    renderRsaTrace('AETHER');
    renderPlayfairControls();
    renderHillControls();
    renderEnigmaControls();
    renderEnigmaTrace('AETHER');
  }

  function attachEventListeners() {
    // Subnav tabs: Caesar, Vigenère, Base64, Atbash, Affine, Rail Fence, RSA
    const subtabs = document.querySelectorAll('.subtab-btn');
    subtabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        subtabs.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cipher = e.currentTarget.dataset.cipher;
        window.AppState.classicalCipher = cipher;

        // Toggle sub panels
        document.querySelectorAll('.cipher-subpane').forEach(p => p.style.display = 'none');
        const targetPane = document.getElementById(`subpane-${cipher}`);
        if (targetPane) targetPane.style.display = 'block';

        window.LiveCipher.transformText();
      });
    });

    // Caesar Shift Slider & Number Input
    const slider = document.getElementById('caesarShiftSlider');
    const numInput = document.getElementById('caesarShiftNumber');

    if (slider && numInput) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        numInput.value = val;
        window.AppState.caesarShift = val;
        renderCaesarComparison(val);
        window.LiveCipher.transformText();
      });

      numInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 1;
        if (val < 1) val = 1;
        if (val > 25) val = 25;
        slider.value = val;
        window.AppState.caesarShift = val;
        renderCaesarComparison(val);
        window.LiveCipher.transformText();
      });
    }

    // Vigenère Keyword Input
    const vigenereInput = document.getElementById('vigenereKeyword');
    if (vigenereInput) {
      vigenereInput.addEventListener('input', (e) => {
        const cleaned = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'KEY';
        window.AppState.vigenereKey = cleaned;
        window.LiveCipher.transformText();
      });
    }

    // Affine Controls
    const slopeSelect = document.getElementById('affineSlopeSelect');
    const shiftSlider = document.getElementById('affineShiftSlider');
    const shiftNum = document.getElementById('affineShiftNumber');

    if (slopeSelect) {
      slopeSelect.addEventListener('change', (e) => {
        window.AppState.affineA = parseInt(e.target.value, 10);
        renderAffineControls();
        window.LiveCipher.transformText();
      });
    }

    if (shiftSlider && shiftNum) {
      shiftSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        shiftNum.value = val;
        window.AppState.affineB = val;
        renderAffineControls();
        window.LiveCipher.transformText();
      });

      shiftNum.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 0;
        if (val < 0) val = 0;
        if (val > 25) val = 25;
        shiftSlider.value = val;
        window.AppState.affineB = val;
        renderAffineControls();
        window.LiveCipher.transformText();
      });
    }

    // Rail Fence Controls
    const rfSlider = document.getElementById('railFenceSlider');
    const rfNum = document.getElementById('railFenceNumber');

    if (rfSlider && rfNum) {
      rfSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        rfNum.value = val;
        window.AppState.railFenceRails = val;
        const input = document.getElementById('plainInput');
        renderRailFenceMatrix(input ? input.value : '', val);
        window.LiveCipher.transformText();
      });

      rfNum.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 2;
        if (val < 2) val = 2;
        if (val > 8) val = 8;
        rfSlider.value = val;
        window.AppState.railFenceRails = val;
        const input = document.getElementById('plainInput');
        renderRailFenceMatrix(input ? input.value : '', val);
        window.LiveCipher.transformText();
      });
    }

    // RSA Controls
    const primePresetSelect = document.getElementById('rsaPrimePresetSelect');
    const inputP = document.getElementById('rsaInputP');
    const inputQ = document.getElementById('rsaInputQ');
    const inputE = document.getElementById('rsaInputE');
    const regenBtn = document.getElementById('rsaRegenBtn');

    if (primePresetSelect) {
      primePresetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val !== 'custom') {
          const [p, q] = val.split(',').map(Number);
          if (inputP) inputP.value = p;
          if (inputQ) inputQ.value = q;
          window.AppState.rsaP = p;
          window.AppState.rsaQ = q;
          renderRsaControls();
          const input = document.getElementById('plainInput');
          renderRsaTrace(input ? input.value : 'AETHER');
          window.LiveCipher.transformText();
        }
      });
    }

    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        if (inputP) window.AppState.rsaP = parseInt(inputP.value, 10) || 61;
        if (inputQ) window.AppState.rsaQ = parseInt(inputQ.value, 10) || 53;
        if (inputE) window.AppState.rsaE = parseInt(inputE.value, 10) || 17;
        renderRsaControls();
        const input = document.getElementById('plainInput');
        renderRsaTrace(input ? input.value : 'AETHER');
        window.LiveCipher.transformText();
        if (window.LiveCipher && typeof window.LiveCipher.showToast === 'function') {
          window.LiveCipher.showToast('RSA Keypair recalculated successfully.');
        }
      });
    }
  }

  // Render Caesar Live Rotating Visual Cipher Disk & Dual-Alphabet Comparison Strip
  function renderCaesarComparison(shift) {
    const container = document.getElementById('caesarComparisonRow');
    const diskWrapper = document.getElementById('caesarDiskWrapper');
    const diskLabel = document.getElementById('caesarOffsetLabel');

    const k = ((shift % 26) + 26) % 26;
    const angle = Math.round((k / 26) * 360);

    if (diskLabel) {
      diskLabel.textContent = `Shift: K = ${k} (Rotate +${angle}°)`;
    }

    // Render Dual Alphabet Comparison Row
    if (container) {
      container.innerHTML = '';
      for (let i = 0; i < 26; i++) {
        const plainChar = ALPHABET[i];
        const shiftedChar = ALPHABET[(i + k) % 26];

        const cell = document.createElement('div');
        cell.className = 'alphabet-cell-pair';
        cell.innerHTML = `
          <span class="alphabet-plain">${plainChar}</span>
          <span class="alphabet-cipher">${shiftedChar}</span>
        `;
        container.appendChild(cell);
      }
    }

    // Render Rotating Concentric Cipher Disk (SVG)
    if (diskWrapper) {
      const radiusOuter = 95;
      const radiusInner = 65;
      const cx = 115;
      const cy = 115;

      // Outer ring letters (shifted by rotation)
      let outerLettersSvg = '';
      for (let i = 0; i < 26; i++) {
        const theta = (i * 360 / 26) - 90;
        const rad = (theta * Math.PI) / 180;
        const x = cx + radiusOuter * Math.cos(rad);
        const y = cy + radiusOuter * Math.sin(rad) + 4; // slight vertical adjust
        outerLettersSvg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--accent)" font-weight="bold" font-family="var(--font-mono)">${ALPHABET[i]}</text>`;
      }

      // Inner ring letters (plain reference)
      let innerLettersSvg = '';
      for (let i = 0; i < 26; i++) {
        const theta = (i * 360 / 26) - 90;
        const rad = (theta * Math.PI) / 180;
        const x = cx + radiusInner * Math.cos(rad);
        const y = cy + radiusInner * Math.sin(rad) + 3.5;
        innerLettersSvg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="8.5" fill="var(--text)" font-family="var(--font-mono)">${ALPHABET[i]}</text>`;
      }

      diskWrapper.innerHTML = `
        <div class="caesar-disk-unit">
          <svg viewBox="0 0 230 230" class="caesar-svg-disk">
            <!-- Background circles -->
            <circle cx="${cx}" cy="${cy}" r="110" fill="var(--input-bg)" stroke="var(--border)" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy}" r="82" fill="none" stroke="var(--border)" stroke-dasharray="3 3"/>
            
            <!-- Outer Rotating Ring (Shift +K) -->
            <g class="rotating-ring" style="transform-origin: ${cx}px ${cy}px; transform: rotate(${angle}deg); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <circle cx="${cx}" cy="${cy}" r="${radiusOuter + 10}" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.6"/>
              ${outerLettersSvg}
            </g>

            <!-- Inner Fixed Ring (Plain A-Z) -->
            <g class="inner-fixed-ring">
              <circle cx="${cx}" cy="${cy}" r="${radiusInner + 8}" fill="none" stroke="var(--border)" stroke-width="1"/>
              ${innerLettersSvg}
            </g>

            <!-- Center Core Hub -->
            <circle cx="${cx}" cy="${cy}" r="38" fill="var(--panel)" stroke="var(--accent)" stroke-width="1.5"/>
            <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" fill="var(--accent)" font-weight="bold" font-family="var(--font-mono)">K = ${k}</text>
            <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="8.5" fill="var(--text-muted)" font-family="var(--font-mono)">+${angle}°</text>
          </svg>
        </div>
      `;
    }

    // Also synchronize the 26-box visual alphabet grid
    if (window.App && typeof window.App.renderAlphabetGrid === 'function') {
      window.App.renderAlphabetGrid();
    }
  }

  // Update visualizers depending on active sub-cipher
  function updateVisualizers(text) {
    const cipher = window.AppState.classicalCipher;
    if (cipher === 'vigenere') {
      renderVigenereTrace(text, window.AppState.vigenereKey || 'KEY', window.AppState.direction);
    } else if (cipher === 'base64') {
      renderBase64Padding(text);
    } else if (cipher === 'caesar') {
      renderCaesarComparison(window.AppState.caesarShift);
    } else if (cipher === 'atbash') {
      renderAtbashComparison();
    } else if (cipher === 'affine') {
      renderAffineControls();
    } else if (cipher === 'railfence' || cipher === 'rail_fence') {
      renderRailFenceMatrix(text, window.AppState.railFenceRails || 3);
    } else if (cipher === 'rsa') {
      renderRsaTrace(text);
    } else if (cipher === 'playfair') {
      renderPlayfairTrace(text);
    } else if (cipher === 'hill') {
      renderHillTrace(text);
    } else if (cipher === 'enigma') {
      renderEnigmaTrace(text);
    }
  }

  // Render Vigenère visual step-by-step trace showing repeated key alignment above plaintext
  function renderVigenereTrace(text, keyword, direction) {
    const container = document.getElementById('vigenereTraceContainer');
    if (!container) return;

    if (!text || text.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe key repetition & shift calculations...</p>';
      return;
    }

    const cleanKey = (keyword || 'KEY').replace(/[^a-zA-Z]/g, '').toUpperCase() || 'KEY';
    let keyIdx = 0;
    const isEnc = direction === 'encrypt';

    const maxChars = Math.min(text.length, 24);
    let ribbonKeyCells = '';
    let ribbonPlainCells = '';
    let ribbonShiftCells = '';
    let ribbonOutCells = '';
    let rowsHtml = '';

    for (let i = 0; i < maxChars; i++) {
      const ch = text[i];
      const code = ch.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;

      let keyChar = '-';
      let shiftVal = '-';
      let resultChar = ch;

      if (isUpper || isLower) {
        const base = isUpper ? 65 : 97;
        keyChar = cleanKey[keyIdx % cleanKey.length];
        const shift = keyChar.charCodeAt(0) - 65;
        shiftVal = `+${shift}`;
        keyIdx++;

        if (isEnc) {
          resultChar = String.fromCharCode(((code - base + shift) % 26) + base);
        } else {
          resultChar = String.fromCharCode(((code - base - shift + 26) % 26) + base);
          shiftVal = `-${shift}`;
        }
      }

      // Visual Alignment Ribbon Cells
      ribbonKeyCells += `<div class="ribbon-cell key-cell" title="Key Char">${escapeHtml(keyChar)}</div>`;
      ribbonPlainCells += `<div class="ribbon-cell plain-cell" title="Plain Char">${escapeHtml(ch)}</div>`;
      ribbonShiftCells += `<div class="ribbon-cell shift-cell" title="Shift Value">${escapeHtml(shiftVal)}</div>`;
      ribbonOutCells += `<div class="ribbon-cell out-cell" title="Output Result">${escapeHtml(resultChar)}</div>`;

      // Trace Table Rows
      rowsHtml += `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${escapeHtml(ch)}</strong></td>
          <td style="color: var(--accent);">${escapeHtml(keyChar)}</td>
          <td>${shiftVal}</td>
          <td style="color: var(--success); font-weight: bold;">${escapeHtml(resultChar)}</td>
        </tr>
      `;
    }

    container.innerHTML = `
      <!-- Visual Step-by-Step Alignment Ribbon (Key directly above Plaintext) -->
      <div class="vigenere-ribbon-wrapper">
        <div class="ribbon-label-col">
          <span style="color: var(--accent);">KEY:</span>
          <span>PLAIN:</span>
          <span style="color: var(--text-muted);">OFFSET:</span>
          <span style="color: var(--success);">OUTPUT:</span>
        </div>
        <div class="ribbon-stream-scroll">
          <div class="ribbon-track ribbon-key-track">${ribbonKeyCells}</div>
          <div class="ribbon-track ribbon-plain-track">${ribbonPlainCells}</div>
          <div class="ribbon-track ribbon-shift-track">${ribbonShiftCells}</div>
          <div class="ribbon-track ribbon-out-track">${ribbonOutCells}</div>
        </div>
      </div>

      <!-- Step-by-step trace table -->
      <table class="vigenere-trace-table" style="margin-top: 0.85rem;">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Plaintext</th>
            <th>Key Char</th>
            <th>Shift Formula</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      ${text.length > maxChars ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">(Displaying first ${maxChars} of ${text.length} characters in trace strip)</p>` : ''}
    `;
  }

  // Render Base64 byte-level padding visualizer
  function renderBase64Padding(text) {
    const container = document.getElementById('b64PaddingContainer');
    if (!container) return;

    if (!text) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Input text to inspect 24-bit quantum blocks and "=" padding logic...</p>';
      return;
    }

    // Convert string to bytes
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i) & 0xFF);
    }

    const remainder = bytes.length % 3;
    const paddingNeeded = remainder === 0 ? 0 : 3 - remainder;
    const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let cardsHtml = '';
    const totalChunks = Math.ceil(bytes.length / 3);

    for (let c = 0; c < Math.min(totalChunks, 6); c++) {
      const slice = bytes.slice(c * 3, c * 3 + 3);
      const hex = slice.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      const binary = slice.map(b => b.toString(2).padStart(8, '0')).join('');
      const fullBinary = binary.padEnd(24, '0');

      const sextets = [
        fullBinary.slice(0, 6),
        fullBinary.slice(6, 12),
        fullBinary.slice(12, 18),
        fullBinary.slice(18, 24)
      ];

      let encodedChars = '';
      encodedChars += b64Chars[parseInt(sextets[0], 2)];
      encodedChars += b64Chars[parseInt(sextets[1], 2)];
      if (slice.length === 1) {
        encodedChars += '==';
      } else if (slice.length === 2) {
        encodedChars += b64Chars[parseInt(sextets[2], 2)] + '=';
      } else {
        encodedChars += b64Chars[parseInt(sextets[2], 2)];
        encodedChars += b64Chars[parseInt(sextets[3], 2)];
      }

      cardsHtml += `
        <div class="b64-chunk-card">
          <div style="color: var(--text-muted); font-weight: bold;">Chunk #${c + 1} (${slice.length} byte${slice.length > 1 ? 's' : ''})</div>
          <div>Hex: <code style="color: var(--text);">${hex}</code></div>
          <div>Binary: <code style="font-size: 0.7rem; color: #a5b4fc;">${binary}</code></div>
          <div style="margin-top: 4px;">6-bit Sextets: <code style="color: var(--accent);">${sextets.slice(0, slice.length + 1).join(' ')}</code></div>
          <div class="b64-chunk-encoded">${encodedChars}</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
        Total Bytes: <strong>${bytes.length}</strong> | 
        Mod 3: <strong>${remainder}</strong> | 
        Padding Added: <strong style="color: var(--accent);">${paddingNeeded > 0 ? '='.repeat(paddingNeeded) + ` (${paddingNeeded} byte padding)` : 'None (Exact 24-bit alignment)'}</strong>
      </div>
      <div class="b64-chunks-grid">
        ${cardsHtml}
      </div>
      ${totalChunks > 6 ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">(Showing first 6 chunks)</p>` : ''}
    `;
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  // Render Atbash Mirrored Alphabet Comparison Row
  function renderAtbashComparison() {
    const container = document.getElementById('atbashComparisonRow');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 26; i++) {
      const plainChar = ALPHABET[i];
      const reversedChar = ALPHABET[25 - i];

      const cell = document.createElement('div');
      cell.className = 'alphabet-cell-pair';
      cell.innerHTML = `
        <span class="alphabet-plain">${plainChar}</span>
        <span class="alphabet-cipher" style="color: var(--accent);">${reversedChar}</span>
      `;
      container.appendChild(cell);
    }
  }

  // Render Affine Algebra Controls & Comparison Row
  function renderAffineControls() {
    const a = window.AppState.affineA || 5;
    const b = window.AppState.affineB !== undefined ? window.AppState.affineB : 8;
    const formulaLabel = document.getElementById('affineFormulaLabel');
    const container = document.getElementById('affineComparisonRow');
    const shiftedLabel = document.getElementById('affineShiftedLabel');

    if (formulaLabel) {
      formulaLabel.textContent = `C ≡ (${a}P + ${b}) mod 26`;
    }

    if (shiftedLabel) {
      shiftedLabel.textContent = `Affine (+${b}, ×${a})`;
    }

    if (container) {
      container.innerHTML = '';
      for (let i = 0; i < 26; i++) {
        const plainChar = ALPHABET[i];
        const cipherIdx = (a * i + b) % 26;
        const cipherChar = ALPHABET[cipherIdx];

        const cell = document.createElement('div');
        cell.className = 'alphabet-cell-pair';
        cell.innerHTML = `
          <span class="alphabet-plain">${plainChar}</span>
          <span class="alphabet-cipher" style="color: var(--accent);">${cipherChar}</span>
        `;
        container.appendChild(cell);
      }
    }
  }

  // Render Rail Fence Live Zig-Zag Wave Matrix Visualizer
  function renderRailFenceMatrix(text, rails) {
    const container = document.getElementById('railFenceMatrixContainer');
    const cycleLabel = document.getElementById('railFenceCycleLabel');
    if (!container) return;

    const numRails = Math.max(2, Math.min(8, parseInt(rails, 10) || 3));
    const cycleLength = 2 * (numRails - 1);

    if (cycleLabel) {
      cycleLabel.textContent = `Wave Period: ${cycleLength} steps • Cycle: 2(N - 1)`;
    }

    const cleanText = text !== undefined && text !== null ? text : '';
    if (!cleanText || cleanText.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe zig-zag wave propagation across ${numRails} rails...</p>`;
      return;
    }

    const maxCols = Math.min(cleanText.length, 48);
    const fence = Array.from({ length: numRails }, () => new Array(maxCols).fill(null));
    let rail = 0;
    let direction = 1;

    for (let col = 0; col < maxCols; col++) {
      fence[rail][col] = cleanText[col];
      if (numRails > 1) {
        if (rail === 0) direction = 1;
        else if (rail === numRails - 1) direction = -1;
        rail += direction;
      }
    }

    let rowsHtml = '';
    for (let r = 0; r < numRails; r++) {
      const railChars = fence[r];
      let cellsHtml = '';
      for (let c = 0; c < maxCols; c++) {
        const ch = railChars[c];
        if (ch !== null) {
          cellsHtml += `<span class="rf-matrix-cell rf-cell-filled" title="Col ${c + 1} (Rail #${r + 1}): '${escapeHtml(ch)}'">${escapeHtml(ch === ' ' ? '␣' : ch)}</span>`;
        } else {
          cellsHtml += `<span class="rf-matrix-cell rf-cell-empty">·</span>`;
        }
      }
      const railExtracted = railChars.filter(ch => ch !== null).join('');
      rowsHtml += `
        <div class="rf-matrix-row">
          <div class="rf-rail-badge">Rail #${r + 1}</div>
          <div class="rf-cells-stream">${cellsHtml}</div>
          <div class="rf-rail-extracted" title="Sequential characters along Rail #${r + 1}">
            <span style="font-size: 0.72rem; color: var(--text-muted);">Extract:</span>
            <code>${escapeHtml(railExtracted)}</code>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <span>Visualizing <strong>${maxCols}</strong> character column${maxCols !== 1 ? 's' : ''} along <strong>${numRails}</strong> rails:</span>
        <span style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--accent);">Transposition Stream: Rail 1 → Rail ${numRails}</span>
      </div>
      <div class="rf-matrix-scroll-wrapper">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          ${rowsHtml}
        </div>
      </div>
      ${cleanText.length > maxCols ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">(Showing first 48 characters)</p>` : ''}
    `;
  }

  // RSA Keypair Computation and Visualizers
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
    const { gcd, x: x1, y: y1 } = extendedGCD(b, a % b);
    const x = y1;
    const y = x1 - (a / b) * y1;
    return { gcd, x, y };
  }

  function modInverse(e, phi) {
    const eBig = BigInt(e);
    const phiBig = BigInt(phi);
    const { gcd: g, x } = extendedGCD(eBig, phiBig);
    if (g !== 1n) {
      throw new Error(`Exponent ${e} is not coprime with totient ${phi}.`);
    }
    return Number(((x % phiBig) + phiBig) % phiBig);
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

  function computeRsaKeypair(p, q, e) {
    const pInt = parseInt(p, 10) || 61;
    const qInt = parseInt(q, 10) || 53;
    let eInt = parseInt(e, 10) || 17;

    const n = pInt * qInt;
    const phi = (pInt - 1) * (qInt - 1);

    function gcdSimple(a, b) {
      while (b) { const t = b; b = a % b; a = t; } return a;
    }

    if (gcdSimple(eInt, phi) !== 1) {
      const candidates = [17, 65537, 3, 5, 7, 11, 13, 19, 23, 29, 31];
      for (const cand of candidates) {
        if (cand < phi && gcdSimple(cand, phi) === 1) {
          eInt = cand;
          break;
        }
      }
    }

    const d = modInverse(eInt, phi);

    return {
      p: pInt,
      q: qInt,
      n,
      phi,
      e: eInt,
      d
    };
  }

  function renderRsaControls() {
    const p = window.AppState.rsaP || 61;
    const q = window.AppState.rsaQ || 53;
    const e = window.AppState.rsaE || 17;

    try {
      const kp = computeRsaKeypair(p, q, e);
      window.AppState.rsaP = kp.p;
      window.AppState.rsaQ = kp.q;
      window.AppState.rsaN = kp.n;
      window.AppState.rsaPhi = kp.phi;
      window.AppState.rsaE = kp.e;
      window.AppState.rsaD = kp.d;

      const dispE = document.getElementById('rsaDisplayE');
      const dispN = document.getElementById('rsaDisplayN');
      const dispD = document.getElementById('rsaDisplayD');
      const dispPhi = document.getElementById('rsaDisplayPhi');
      const inE = document.getElementById('rsaInputE');

      if (dispE) dispE.textContent = kp.e;
      if (dispN) dispN.textContent = kp.n;
      if (dispD) dispD.textContent = kp.d;
      if (dispPhi) dispPhi.textContent = `(${kp.p - 1} × ${kp.q - 1}) = ${kp.phi}`;
      if (inE) inE.value = kp.e;
    } catch (err) {
      console.warn('RSA Keypair calculation error:', err.message);
    }
  }

  function renderRsaTrace(text) {
    const container = document.getElementById('rsaTraceContainer');
    if (!container) return;

    if (!text || text.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe step-by-step modular exponentiation...</p>';
      return;
    }

    const e = BigInt(window.AppState.rsaE || 17);
    const d = BigInt(window.AppState.rsaD || 2753);
    const n = BigInt(window.AppState.rsaN || 3233);

    const maxChars = Math.min(text.length, 16);
    let cardsHtml = '';

    for (let i = 0; i < maxChars; i++) {
      const ch = text[i];
      const m = BigInt(ch.charCodeAt(0));
      const c = modPow(m, e, n);
      const decM = modPow(c, d, n);
      const decCh = String.fromCharCode(Number(decM));

      cardsHtml += `
        <div class="rsa-trace-card">
          <div class="rsa-trace-top">
            <span style="font-size: 1.1rem; color: var(--text-primary); font-weight: bold;">'${escapeHtml(ch)}'</span>
            <span style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.75rem;">ASCII ${Number(m)}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Encrypt:</div>
          <div class="rsa-trace-formula">${Number(m)}<sup>${e.toString()}</sup> mod ${n.toString()} = <strong>${c.toString()}</strong></div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Decrypt:</div>
          <div class="rsa-trace-formula" style="background: rgba(180, 83, 9, 0.08); color: #b45309;">${c.toString()}<sup>${d.toString()}</sup> mod ${n.toString()} = <strong>${Number(decM)} ('${escapeHtml(decCh)}')</strong></div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
        Showing modular exponentiation for first <strong>${maxChars}</strong> character${maxChars !== 1 ? 's' : ''}:
      </div>
      <div class="rsa-trace-grid">
        ${cardsHtml}
      </div>
      ${text.length > maxChars ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">(Showing first 16 characters)</p>` : ''}
    `;
  }

  // --- PLAYFAIR 5x5 CONTROLS & TRACE ---
  function renderPlayfairControls() {
    const keyInput = document.getElementById('playfairKeyword');
    const royalBtn = document.getElementById('playfairPresetRoyal');
    const aetherBtn = document.getElementById('playfairPresetAether');

    if (keyInput) {
      keyInput.addEventListener('input', (e) => {
        window.AppState.playfairKey = e.target.value.toUpperCase();
        renderPlayfairMatrix();
        renderPlayfairTrace(window.AppState.lastTransformed || 'INSTRUMENTS');
        window.LiveCipher.transformText();
      });
    }

    if (royalBtn && keyInput) {
      royalBtn.addEventListener('click', () => {
        keyInput.value = 'ROYAL';
        window.AppState.playfairKey = 'ROYAL';
        renderPlayfairMatrix();
        renderPlayfairTrace(window.AppState.lastTransformed || 'INSTRUMENTS');
        window.LiveCipher.transformText();
      });
    }

    if (aetherBtn && keyInput) {
      aetherBtn.addEventListener('click', () => {
        keyInput.value = 'AETHER';
        window.AppState.playfairKey = 'AETHER';
        renderPlayfairMatrix();
        renderPlayfairTrace(window.AppState.lastTransformed || 'INSTRUMENTS');
        window.LiveCipher.transformText();
      });
    }

    renderPlayfairMatrix();
  }

  function renderPlayfairMatrix() {
    const gridContainer = document.getElementById('playfair5x5Grid');
    if (!gridContainer) return;

    const keyword = window.AppState.playfairKey || 'MONARCHY';
    const cleanKey = (keyword + 'ABCDEFGHIKLMNOPQRSTUVWXYZ')
      .toUpperCase()
      .replace(/J/g, 'I')
      .replace(/[^A-Z]/g, '');

    const seen = new Set();
    const cells = [];
    for (const ch of cleanKey) {
      if (!seen.has(ch) && ch !== 'J') {
        seen.add(ch);
        cells.push(ch);
        if (cells.length === 25) break;
      }
    }

    gridContainer.innerHTML = cells.map(ch => `
      <div class="playfair-cell" data-char="${ch}">${ch}</div>
    `).join('');
  }

  function renderPlayfairTrace(text) {
    const container = document.getElementById('playfairTraceContainer');
    if (!container) return;

    const clean = (text || '').toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if (!clean) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe 5×5 geometric digraph transformations...</p>';
      return;
    }

    const keyword = window.AppState.playfairKey || 'MONARCHY';
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
    for (let r = 0; r < 5; r++) grid.push(matrix.slice(r * 5, (r + 1) * 5));

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

    const maxPairs = Math.min(digraphs.length, 12);
    let rowsHtml = '';
    for (let k = 0; k < maxPairs; k++) {
      const [a, b] = digraphs[k];
      const p1 = charPos[a];
      const p2 = charPos[b];
      let ruleBadge = '';
      let out = '';

      if (!p1 || !p2) continue;

      if (p1.row === p2.row) {
        ruleBadge = '<span class="badge" style="background: rgba(110, 92, 168, 0.12); color: var(--accent);">Same Row → Shift Right</span>';
        out = grid[p1.row][(p1.col + 1) % 5] + grid[p2.row][(p2.col + 1) % 5];
      } else if (p1.col === p2.col) {
        ruleBadge = '<span class="badge" style="background: rgba(67, 113, 92, 0.12); color: var(--sage-deep);">Same Col → Shift Down</span>';
        out = grid[(p1.row + 1) % 5][p1.col] + grid[(p2.row + 1) % 5][p2.col];
      } else {
        ruleBadge = '<span class="badge" style="background: rgba(168, 90, 67, 0.12); color: var(--peach-deep);">Rectangle → Swap Corners</span>';
        out = grid[p1.row][p2.col] + grid[p2.row][p1.col];
      }

      rowsHtml += `
        <div class="playfair-step-row">
          <span style="font-weight: 800; color: var(--text-primary); min-width: 60px;">[ ${a} · ${b} ]</span>
          <span style="color: var(--text-muted); font-size: 0.75rem;">(r${p1.row}c${p1.col}, r${p2.row}c${p2.col})</span>
          <span style="flex: 1;">${ruleBadge}</span>
          <span style="font-weight: 800; color: var(--accent); min-width: 60px; text-align: right;">➔ [ ${out[0]} · ${out[1]} ]</span>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
        Showing geometric transformations for first <strong>${maxPairs}</strong> letter pair${maxPairs !== 1 ? 's' : ''}:
      </div>
      <div>${rowsHtml}</div>
      ${digraphs.length > maxPairs ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">(Showing first 12 letter pairs)</p>` : ''}
    `;
  }

  // --- HILL 2x2 CIPHER CONTROLS & TRACE ---
  function renderHillControls() {
    const inA = document.getElementById('hillMatA');
    const inB = document.getElementById('hillMatB');
    const inC = document.getElementById('hillMatC');
    const inD = document.getElementById('hillMatD');

    const pClassic = document.getElementById('hillPresetClassic');
    const pBak = document.getElementById('hillPresetBak');
    const pAlt = document.getElementById('hillPresetAlt');

    function syncHill() {
      if (!inA || !inB || !inC || !inD) return;
      const a = parseInt(inA.value, 10) || 3;
      const b = parseInt(inB.value, 10) || 3;
      const c = parseInt(inC.value, 10) || 2;
      const d = parseInt(inD.value, 10) || 5;

      window.AppState.hillMatrix = [[a, b], [c, d]];
      updateHillDeterminantUI(a, b, c, d);
      renderHillTrace(window.AppState.lastTransformed || 'HELP');
      window.LiveCipher.transformText();
    }

    [inA, inB, inC, inD].forEach(input => {
      if (input) input.addEventListener('input', syncHill);
    });

    if (pClassic && inA && inB && inC && inD) {
      pClassic.addEventListener('click', () => {
        inA.value = 3; inB.value = 3; inC.value = 2; inD.value = 5;
        syncHill();
      });
    }

    if (pBak && inA && inB && inC && inD) {
      pBak.addEventListener('click', () => {
        inA.value = 5; inB.value = 8; inC.value = 17; inD.value = 3;
        syncHill();
      });
    }

    if (pAlt && inA && inB && inC && inD) {
      pAlt.addEventListener('click', () => {
        inA.value = 7; inB.value = 8; inC.value = 11; inD.value = 11;
        syncHill();
      });
    }

    syncHill();
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  function updateHillDeterminantUI(a, b, c, d) {
    const detBadge = document.getElementById('hillDetBadge');
    const invLabel = document.getElementById('hillInverseLabel');

    const det = ((a * d - b * c) % 26 + 26) % 26;
    const isCoprime = gcd(det, 26) === 1;

    if (detBadge) {
      if (isCoprime) {
        detBadge.className = 'badge badge-accent';
        detBadge.textContent = `det(K) = ${det} • gcd(${det}, 26) = 1 (Invertible)`;
      } else {
        detBadge.className = 'badge';
        detBadge.style.background = 'rgba(192, 67, 67, 0.15)';
        detBadge.style.color = 'var(--danger)';
        detBadge.textContent = `det(K) = ${det} • gcd(${det}, 26) = ${gcd(det, 26)} (NOT Invertible!)`;
      }
    }

    if (invLabel) {
      if (isCoprime) {
        let detInv = 1;
        for (let x = 1; x < 26; x++) {
          if ((det * x) % 26 === 1) {
            detInv = x;
            break;
          }
        }
        const ia = ((d * detInv) % 26 + 26) % 26;
        const ib = (((-b) * detInv) % 26 + 26) % 26;
        const ic = (((-c) * detInv) % 26 + 26) % 26;
        const id = ((a * detInv) % 26 + 26) % 26;

        invLabel.style.color = 'var(--accent)';
        invLabel.textContent = `K⁻¹ = [[${ia}, ${ib}], [${ic}, ${id}]] mod 26 (det⁻¹ = ${detInv})`;
      } else {
        invLabel.style.color = 'var(--danger)';
        invLabel.textContent = `Matrix K is singular mod 26 — decryption not possible!`;
      }
    }
  }

  function renderHillTrace(text) {
    const container = document.getElementById('hillTraceContainer');
    if (!container) return;

    let clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe 2×2 modular matrix vector multiplication...</p>';
      return;
    }

    const [[a, b], [c, d]] = window.AppState.hillMatrix || [[3, 3], [2, 5]];
    if (clean.length % 2 !== 0) clean += 'X';

    const maxPairs = Math.min(Math.floor(clean.length / 2), 8);
    let cardsHtml = '';

    for (let i = 0; i < maxPairs * 2; i += 2) {
      const ch1 = clean[i];
      const ch2 = clean[i + 1];
      const p1 = ch1.charCodeAt(0) - 65;
      const p2 = ch2.charCodeAt(0) - 65;

      const c1 = (a * p1 + b * p2) % 26;
      const c2 = (c * p1 + d * p2) % 26;
      const out1 = String.fromCharCode(c1 + 65);
      const out2 = String.fromCharCode(c2 + 65);

      cardsHtml += `
        <div class="hill-step-card">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: bold; color: var(--text-primary); font-size: 0.95rem;">[${ch1}, ${ch2}]ᵀ</span>
            <span style="color: var(--text-muted); font-size: 0.78rem;">= [${p1}, ${p2}]ᵀ</span>
          </div>
          <div style="color: var(--text-secondary); font-size: 0.8rem;">
            [${a}·${p1} + ${b}·${p2}, ${c}·${p1} + ${d}·${p2}] mod 26
          </div>
          <div style="font-weight: 800; color: var(--accent); font-size: 0.95rem;">
            = [${out1}, ${out2}]ᵀ (${c1}, ${c2})
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
        Showing vector multiplications for first <strong>${maxPairs}</strong> digraph pair${maxPairs !== 1 ? 's' : ''}:
      </div>
      <div>${cardsHtml}</div>
      ${clean.length > maxPairs * 2 ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">(Showing first 8 digraph pairs)</p>` : ''}
    `;
  }

  // ====================================================
  // WEHRMACHT ENIGMA M3 SIMULATOR CONTROLS & TRACE
  // ====================================================
  function renderEnigmaControls() {
    if (!window.AppState.enigmaPositions) {
      window.AppState.enigmaPositions = ['A', 'A', 'A'];
      window.AppState.enigmaRings = [1, 1, 1];
      window.AppState.enigmaRotors = ['I', 'II', 'III'];
      window.AppState.enigmaPlugboard = 'AE TH BQ';
    }

    // Dial buttons (increment/decrement A-Z)
    document.querySelectorAll('.enigma-dial-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rotorIdx = parseInt(e.currentTarget.dataset.rotor, 10);
        const dir = parseInt(e.currentTarget.dataset.dir, 10);
        const curr = window.AppState.enigmaPositions[rotorIdx] || 'A';
        const code = curr.charCodeAt(0) - 65;
        const nextCode = (code + dir + 26) % 26;
        const nextLetter = String.fromCharCode(nextCode + 65);
        window.AppState.enigmaPositions[rotorIdx] = nextLetter;
        const win = document.getElementById('enigmaPos' + rotorIdx);
        if (win) win.textContent = nextLetter;
        window.LiveCipher.transformText();
      });
    });

    // Ring settings inputs
    [0, 1, 2].forEach(idx => {
      const ringInput = document.getElementById('enigmaRing' + idx);
      if (ringInput) {
        ringInput.addEventListener('input', (e) => {
          let val = parseInt(e.target.value, 10) || 1;
          if (val < 1) val = 1;
          if (val > 26) val = 26;
          window.AppState.enigmaRings[idx] = val;
          window.LiveCipher.transformText();
        });
      }
    });

    // Plugboard
    const plugInput = document.getElementById('enigmaPlugboardInput');
    if (plugInput) {
      plugInput.addEventListener('input', (e) => {
        window.AppState.enigmaPlugboard = e.target.value.toUpperCase();
        window.LiveCipher.transformText();
      });
    }

    // Presets
    const defaultBtn = document.getElementById('enigmaPresetDefault');
    if (defaultBtn) {
      defaultBtn.addEventListener('click', () => {
        if (plugInput) plugInput.value = '';
        window.AppState.enigmaPlugboard = '';
        window.LiveCipher.transformText();
      });
    }

    const bletchleyBtn = document.getElementById('enigmaPresetBletchley');
    if (bletchleyBtn) {
      bletchleyBtn.addEventListener('click', () => {
        if (plugInput) plugInput.value = 'AE BF CM DQ';
        window.AppState.enigmaPlugboard = 'AE BF CM DQ';
        window.LiveCipher.transformText();
      });
    }

    const resetRotorsBtn = document.getElementById('enigmaResetRotors');
    if (resetRotorsBtn) {
      resetRotorsBtn.addEventListener('click', () => {
        window.AppState.enigmaPositions = ['A', 'A', 'A'];
        [0, 1, 2].forEach(i => {
          const win = document.getElementById('enigmaPos' + i);
          if (win) win.textContent = 'A';
        });
        window.LiveCipher.transformText();
      });
    }
  }

  function renderEnigmaTrace(text) {
    const container = document.getElementById('enigmaTraceContainer');
    if (!container) return;

    const sample = (text || 'AETHER').toUpperCase().replace(/[^A-Z]/g, '');
    if (!sample) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Type text in input to observe mechanical rotor stepping and signal circuits...</p>';
      return;
    }

    const options = {
      rotors: window.AppState.enigmaRotors || ['I', 'II', 'III'],
      positions: window.AppState.enigmaPositions || ['A', 'A', 'A'],
      rings: window.AppState.enigmaRings || [1, 1, 1],
      plugboard: window.AppState.enigmaPlugboard || ''
    };

    const res = window.LiveCipher.enigmaClientSimulate ? window.LiveCipher.enigmaClientSimulate(sample, options) : null;
    if (!res || !res.trace) return;

    let rowsHtml = '';
    res.trace.slice(0, 10).forEach(step => {
      rowsHtml += `
        <div class="enigma-trace-row">
          <span style="font-weight: 800; color: var(--text-primary); width: 45px;">[ ${step.input} ]</span>
          <span style="color: var(--text-muted); font-size: 0.76rem; width: 75px;">Rotors: ${step.positions.join('·')}</span>
          <span class="enigma-trace-tag">${step.path[0]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[1]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[2]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[3]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[4]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag" style="background: rgba(110, 92, 168, 0.12); border-color: var(--accent); color: var(--accent); font-weight: 700;">${step.path[5]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[6]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[7]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span class="enigma-trace-tag">${step.path[8]}</span>
          <span style="color: var(--text-muted);">→</span>
          <span style="font-weight: 800; color: #10B981; font-size: 0.92rem; padding: 0.1rem 0.4rem; background: rgba(16, 185, 129, 0.12); border-radius: 4px;">Lamp: ${step.output}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
        Showing electro-mechanical circuit path for first <strong>${Math.min(10, res.trace.length)}</strong> letters:
      </div>
      <div>${rowsHtml}</div>
    `;
  }

  return {
    init,
    renderCaesarComparison,
    renderAtbashComparison,
    renderAffineControls,
    renderRailFenceMatrix,
    renderRsaControls,
    renderRsaTrace,
    renderPlayfairControls,
    renderPlayfairMatrix,
    renderPlayfairTrace,
    renderHillControls,
    renderHillTrace,
    renderEnigmaControls,
    renderEnigmaTrace,
    updateVisualizers
  };
})();
