/**
 * Printable Codebook & Shareable Card Generator
 * Uses client-side html2canvas and jsPDF for high-DPI A4 PDF and PNG exports
 */

window.ExportPoster = (function() {
  let activeTemplate = 'parchment';

  function init() {
    attachEventListeners();
  }

  function attachEventListeners() {
    // Layout template selector inside codebook modal
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeTemplate = e.currentTarget.dataset.template || 'parchment';
        renderCodebookPreview();
      });
    });

    // Open Codebook Modal
    const openCodebookBtn = document.getElementById('openCodebookBtn');
    if (openCodebookBtn) {
      openCodebookBtn.addEventListener('click', openCodebookModal);
    }

    // Download PDF action inside modal
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', downloadCodebookPdf);
    }

    // Open Share Card Modal
    const openCardBtn = document.getElementById('openShareCardBtn');
    if (openCardBtn) {
      openCardBtn.addEventListener('click', openShareCardModal);
    }

    // Download PNG action inside modal
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', downloadShareCardPng);
    }

    // Close buttons for modals
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });
  }

  function openCodebookModal() {
    const modal = document.getElementById('codebookModal');
    if (!modal) return;

    // Default template according to active theme
    const curTheme = window.AppState.currentTheme || 'cyberpunk';
    if (curTheme === 'cyberpunk' || curTheme === 'matrix') {
      activeTemplate = 'cyberpunk';
    } else if (curTheme === 'deep_space' || curTheme === 'quantum_realm') {
      activeTemplate = 'scifi';
    } else {
      activeTemplate = 'parchment';
    }

    // Update active button state
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.template === activeTemplate);
    });

    renderCodebookPreview();
    modal.classList.add('active');
  }

  function renderCodebookPreview() {
    const container = document.getElementById('codebookSheetPreview');
    if (!container) return;

    const themeName = window.AppState.currentThemeName || 'Themed Cipher';
    const username = window.AppState.currentUser ? window.AppState.currentUser.username : 'GUEST-OPERATIVE';
    const timestamp = new Date().toLocaleString();
    const mapping = window.AppState.currentMapping;
    const salt = window.AppState.activeSalt || 'N/A';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Generate 2 columns of 13 letters
    let rowsHtml = '';
    for (let i = 0; i < 13; i++) {
      const l1 = letters[i];
      const s1 = mapping[l1] || l1;
      const l2 = letters[i + 13];
      const s2 = mapping[l2] || l2;

      rowsHtml += `
        <tr>
          <td class="codebook-letter">${l1}</td>
          <td class="codebook-symbol">${s1}</td>
          <td class="codebook-spacer"></td>
          <td class="codebook-letter">${l2}</td>
          <td class="codebook-symbol">${s2}</td>
        </tr>
      `;
    }

    container.innerHTML = `
      <div class="codebook-sheet template-${activeTemplate}" id="printableCodebookElement">
        <div class="codebook-header">
          <div class="codebook-badge">Classified Cipher Manual</div>
          <h1 class="codebook-title">${themeName}</h1>
          <div class="codebook-meta">
            <span>OPERATIVE ID: <strong>${escapeHtml(username)}</strong></span>
            <span>SALT KEY: <strong>${escapeHtml(salt)}</strong></span>
            <span>ISSUED: <strong>${timestamp}</strong></span>
          </div>
        </div>

        <div class="codebook-section">
          <h3 class="codebook-section-title">Visual Substitution Key (A–Z)</h3>
          <table class="codebook-table">
            <thead>
              <tr>
                <th class="cb-th-letter">Letter</th>
                <th class="cb-th-symbol">Symbol</th>
                <th class="cb-th-spacer"></th>
                <th class="cb-th-letter">Letter</th>
                <th class="cb-th-symbol">Symbol</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div class="codebook-instruction-box">
          <div class="codebook-instruction-title">DECODING INSTRUCTIONS:</div>
          <ol class="codebook-instruction-list">
            <li>Locate each transmitted glyph in the reference table above.</li>
            <li>Map the matching symbol back to its primary Latin character.</li>
            <li>Maintain original whitespace and punctuation.</li>
            <li>If ciphertext appears scrambled with unmapped glyphs, verify your salt key authorization.</li>
          </ol>
        </div>

        <div class="codebook-footer">
          AetherCrypt Secure Cryptographic Engine // Confidential Distribution Only
        </div>
      </div>
    `;
  }

  async function downloadCodebookPdf() {
    const btn = document.getElementById('downloadPdfBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Rendering A4 PDF...';
    }

    const sheetEl = document.getElementById('printableCodebookElement');
    if (!sheetEl) return;

    try {
      if (window.html2canvas && window.jspdf) {
        const canvas = await window.html2canvas(sheetEl, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const fileName = `codebook-${window.AppState.currentTheme || 'cipher'}-${Date.now()}.pdf`;
        pdf.save(fileName);
        window.LiveCipher.showToast('Codebook PDF downloaded!');
      } else {
        // Fallback: Browser Print
        window.print();
      }
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📥 Download A4 PDF';
      }
    }
  }

  function openShareCardModal() {
    const modal = document.getElementById('shareCardModal');
    if (!modal) return;

    renderShareCardPreview();
    modal.classList.add('active');
  }

  function renderShareCardPreview() {
    const container = document.getElementById('shareCardPreview');
    if (!container) return;

    const themeName = window.AppState.currentThemeName || 'AetherCrypt';
    const text = window.AppState.lastTransformed || 'TRANSMISSION SEALED';
    const username = window.AppState.currentUser ? window.AppState.currentUser.username : 'Operative';

    container.innerHTML = `
      <div class="share-card-canvas" id="shareCardElement">
        <div style="font-size: 2rem;">🛡️</div>
        <div class="share-card-title">${escapeHtml(themeName)} Transmission</div>
        <div class="share-card-body">${escapeHtml(text)}</div>
        <div style="font-size: 0.85rem; color: var(--accent);">Encrypted by: @${escapeHtml(username)}</div>
        <div class="share-card-watermark">AETHERCRYPT // DECODE AT LOCALHOST:3000</div>
      </div>
    `;
  }

  async function downloadShareCardPng() {
    const btn = document.getElementById('downloadPngBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Capturing Card PNG...';
    }

    const cardEl = document.getElementById('shareCardElement');
    if (!cardEl) return;

    try {
      if (window.html2canvas) {
        const canvas = await window.html2canvas(cardEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: null
        });

        const link = document.createElement('a');
        link.download = `cipher-card-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        window.LiveCipher.showToast('Shareable Card PNG exported!');
      } else {
        alert('html2canvas library is still loading. Please try again.');
      }
    } catch (err) {
      console.error('Card export error:', err);
      alert('Failed to export card image: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🖼️ Download PNG Image';
      }
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  return {
    init,
    openCodebookModal,
    openShareCardModal,
    downloadCodebookPdf,
    downloadShareCardPng
  };
})();
