/**
 * AETHERCRYPT // Autonomous Guided Tour & Demo Showcase
 * Provides a 1-click self-running presentation for hackathons, evaluators and academic demos.
 */
window.DemoTour = (function() {
  let isRunning = false;
  let tourTimer = null;

  function sleep(ms) {
    return new Promise(res => {
      tourTimer = setTimeout(res, ms);
    });
  }

  async function startTour() {
    if (isRunning) return;
    isRunning = true;

    // Ensure user session
    if (!window.AppState.currentUser) {
      window.AppState.currentUser = { id: 'guest', username: 'Operative' };
    }

    createTourOverlay();
    setStep(1, 6, "Initiating Transmission", "Preparing covert transmission for the AetherCrypt laboratory...");

    // 1. Switch to Home
    window.App.openView('home');
    if (window.AudioFx) window.AudioFx.playLaser();
    await sleep(1800);

    // 2. Open Mode 2 AI Forge
    setStep(2, 6, "AI Themed Cipher Forge", "Synthesizing a 26-glyph unique visual substitution language for Pirate Seadog...");
    window.App.openMode('ai');
    window.App.switchTheme('pirate');
    if (window.AudioFx) window.AudioFx.playChime();
    await sleep(1800);

    // 3. Type Message
    setStep(3, 6, "Dual Reactive Message Lab", "Streaming plaintext across the 50ms reactive transformation engine...");
    const input = document.getElementById('cipherInput');
    if (input) {
      const msg = "ATTACK AT DAWN. OBSIDIAN FLEET ARRIVES AT MIDNIGHT.";
      input.value = "";
      for (let i = 0; i < msg.length; i++) {
        input.value += msg[i];
        input.dispatchEvent(new Event('input'));
        if (window.AudioFx && i % 4 === 0) window.AudioFx.playTick(1000 + (i * 15), 0.02);
        await sleep(40);
      }
    }
    await sleep(800);

    // 4. Run 3D Encryption Reels
    setStep(4, 6, "3D Mechanical Letter Reels", "Executing mechanical 3D card flips across all encrypted tokens...");
    const runBtn = document.getElementById('runEncryptBtn');
    if (runBtn) runBtn.click();
    await sleep(2200);

    // 5. Jump to Mode 3 Classical Caesar Disk
    setStep(5, 6, "Classical Cryptography Lab", "Exploring Kerckhoffs's principle with dynamic rotating Caesar disk...");
    window.App.openMode('classical');
    const slider = document.getElementById('caesarShiftSlider');
    if (slider) {
      for (let s = 4; s <= 13; s++) {
        slider.value = s;
        slider.dispatchEvent(new Event('input'));
        if (window.AudioFx) window.AudioFx.playTick(800 + s * 30, 0.02);
        await sleep(100);
      }
    }
    await sleep(1500);

    // 6. Complete & Open Codebook
    setStep(6, 6, "High-DPI Codebook Generation", "Showcase complete! Opening printable classified manual...");
    if (window.AudioFx) window.AudioFx.playChime();
    const codebookBtn = document.getElementById('openCodebookBtn');
    if (codebookBtn) codebookBtn.click();
    await sleep(2500);

    closeTour();
  }

  function createTourOverlay() {
    let overlay = document.getElementById('tourBannerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tourBannerOverlay';
      overlay.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        border: 1px solid var(--accent);
        border-radius: 16px;
        box-shadow: 0 16px 40px rgba(45, 35, 65, 0.2);
        padding: 1.2rem;
        z-index: 9999;
        font-family: var(--font-family);
        animation: tourSlideIn 0.3s ease both;
      `;

      overlay.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; color: var(--accent); text-transform: uppercase;">
            ✦ LIVE SHOWCASE IN PROGRESS
          </span>
          <button id="cancelTourBtn" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted); font-size: 1rem;">✕</button>
        </div>
        <div id="tourStepTitle" style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.3rem;"></div>
        <div id="tourStepDesc" style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.8rem;"></div>
        <div style="width: 100%; height: 6px; background: var(--bg-subtle); border-radius: 999px; overflow: hidden;">
          <div id="tourProgressBar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.4s ease;"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('cancelTourBtn').addEventListener('click', closeTour);
    }
  }

  function setStep(cur, total, title, desc) {
    const tEl = document.getElementById('tourStepTitle');
    const dEl = document.getElementById('tourStepDesc');
    const bEl = document.getElementById('tourProgressBar');

    if (tEl) tEl.textContent = title;
    if (dEl) dEl.textContent = desc;
    if (bEl) bEl.style.width = Math.round((cur / total) * 100) + '%';
  }

  function closeTour() {
    clearTimeout(tourTimer);
    isRunning = false;
    const overlay = document.getElementById('tourBannerOverlay');
    if (overlay) overlay.remove();
  }

  function init() {
    const btn = document.getElementById('launchShowcaseBtn');
    if (btn) {
      btn.addEventListener('click', startTour);
    }
    const navBtn = document.getElementById('navShowcaseBtn');
    if (navBtn) {
      navBtn.addEventListener('click', startTour);
    }

    if (window.location.hash.toLowerCase() === '#showcase') {
      setTimeout(startTour, 500);
    }
  }

  return {
    init,
    startTour,
    closeTour
  };
})();
