/**
 * Mode 2: AI Themed Cipher Forge
 * 20 Collectible Theme Worlds, Custom Prompt Studio, Deterministic User Salt & Corrupted Decryption Logic
 */

window.AiMode = (function() {
  const PRESET_LIST = [
    { key: 'pirate', name: '🏴‍☠️ Pirate Seadog', desc: 'Nautical curses and galleon sigils' },
    { key: 'cyberpunk', name: '⚡ Cyberpunk 2099', desc: 'Neon circuitry and synthetic protocols' },
    { key: 'ancient_egypt', name: '𓀀 Ancient Egypt', desc: 'Sacred hieroglyphs of the Pharaohs' },
    { key: 'medieval_alchemist', name: '⚗️ Medieval Alchemist', desc: 'Occult elixirs and grimoire seals' },
    { key: 'deep_space', name: '🌌 Deep Space Galaxy', desc: 'Cosmic nebulae and astral signs' },
    { key: 'steampunk', name: '⚙️ Steampunk Victorian', desc: 'Brass clockwork and automata' },
    { key: 'nordic_runes', name: 'ᚠ Nordic Elder Futhark', desc: 'Runes carved into stone monoliths' },
    { key: 'biohazard', name: '☣️ Biohazard Lab', desc: 'Synthetic pathogens and quarantine' },
    { key: 'matrix', name: '🟩 Matrix Digital Rain', desc: 'Cascading digital glyph fragments' },
    { key: 'gothic_victorian', name: '🕯️ Gothic Victorian', desc: 'Crypts, lace, ravens and velvet' },
    { key: 'atlantis_ocean', name: '🔱 Atlantis Abyssal', desc: 'Sunken cities and bioluminescence' },
    { key: 'feudal_samurai', name: '⚔️ Feudal Samurai', desc: 'Forged steel katanas and cherry blossom' },
    { key: 'witchcraft_occult', name: '🔮 Witchcraft Occult', desc: 'Tarot divination and astral moondust' },
    { key: 'alien_hive', name: '👾 Alien Hivemind', desc: 'Xenomorphic pods and cosmic spores' },
    { key: 'aztec_sun', name: '☀️ Aztec Sun Temple', desc: 'Gold solar calendar and obsidian blades' },
    { key: 'post_apocalyptic', name: '☢️ Post-Apocalyptic', desc: 'Barbed wire and radioactive dust' },
    { key: 'neon_synthwave', name: '🌴 Neon Synthwave 80s', desc: 'Palm sunsets and cassette nostalgia' },
    { key: 'quantum_realm', name: '⚛️ Quantum Realm', desc: 'Superposition orbitals and flux coils' },
    { key: 'cryptid_woods', name: '🌲 Cryptid Redwood', desc: 'Glowing moss and horned pine eyes' },
    { key: 'celestial_angels', name: '✨ Celestial Empyrean', desc: 'Seraphim wings and divine script' }
  ];

  function init() {
    populatePresetDropdown();
    renderThemeGallery();
    attachEventListeners();
    initRandomSalt();
  }

  function populatePresetDropdown() {
    const select = document.getElementById('aiThemeSelect');
    if (!select) return;

    select.innerHTML = '';
    PRESET_LIST.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.key;
      opt.textContent = item.name;
      select.appendChild(opt);
    });

    select.value = window.AppState.currentTheme || 'cyberpunk';
  }

  /**
   * Render 20 Collectible Theme Cards inside the Visual Theme Gallery
   */
  function renderThemeGallery() {
    const container = document.getElementById('aiThemeGalleryCards');
    if (!container) return;

    container.innerHTML = '';
    const currentKey = window.AppState.currentTheme || 'cyberpunk';

    PRESET_LIST.forEach(item => {
      const themeData = window.CLIENT_PRESET_THEMES && window.CLIENT_PRESET_THEMES[item.key]
        ? window.CLIENT_PRESET_THEMES[item.key]
        : { glyphs: ['✦', '◇', '☽', '⟡'] };

      const card = document.createElement('div');
      card.className = 'ai-gallery-card' + (item.key === currentKey ? ' active' : '');
      card.dataset.key = item.key;

      const sampleGlyphs = themeData.glyphs.slice(0, 4).join(' ');

      card.innerHTML = 
        '<div class="ai-gallery-card-header">' +
          '<span class="ai-gallery-card-title">' + item.name + '</span>' +
          '<span class="ai-gallery-card-check">✓</span>' +
        '</div>' +
        '<div class="ai-gallery-card-glyphs">' + sampleGlyphs + '</div>' +
        '<div class="ai-gallery-card-desc">' + item.desc + '</div>';

      card.addEventListener('click', () => {
        document.querySelectorAll('.ai-gallery-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const select = document.getElementById('aiThemeSelect');
        if (select) select.value = item.key;

        window.App.switchTheme(item.key);
        generateAlphabet();
      });

      container.appendChild(card);
    });
  }

  function initRandomSalt() {
    const saltInput = document.getElementById('aiUserSalt');
    if (saltInput && !saltInput.value) {
      saltInput.value = generateSaltString();
      window.AppState.activeSalt = saltInput.value;
      window.AppState.attemptSalt = saltInput.value;
    }
  }

  function generateSaltString() {
    return 'salt_' + Math.random().toString(36).substring(2, 8);
  }

  function attachEventListeners() {
    // Generate Button
    const genBtn = document.getElementById('generateAiAlphabetBtn');
    if (genBtn) {
      genBtn.addEventListener('click', generateAlphabet);
    }

    // New Salt Button
    const newSaltBtn = document.getElementById('generateNewSaltBtn');
    if (newSaltBtn) {
      newSaltBtn.addEventListener('click', () => {
        const saltInput = document.getElementById('aiUserSalt');
        if (saltInput) {
          saltInput.value = generateSaltString();
          window.AppState.activeSalt = saltInput.value;
          window.AppState.attemptSalt = saltInput.value;
          const attemptIn = document.getElementById('decryptionAttemptSalt');
          if (attemptIn) attemptIn.value = saltInput.value;
          window.LiveCipher.showToast('Generated fresh user salt: ' + saltInput.value);
        }
      });
    }

    // Theme selector change
    const themeSelect = document.getElementById('aiThemeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        window.App.switchTheme(e.target.value);
        document.querySelectorAll('.ai-gallery-card').forEach(c => {
          c.classList.toggle('active', c.dataset.key === e.target.value);
        });
      });
    }

    // Corrupted Decryption Security Key input
    const attemptSaltInput = document.getElementById('decryptionAttemptSalt');
    if (attemptSaltInput) {
      attemptSaltInput.addEventListener('input', (e) => {
        window.AppState.attemptSalt = e.target.value.trim();
        window.LiveCipher.transformText();
      });
    }

    // Simulate Corrupt Salt Test Button
    const corruptTestBtn = document.getElementById('testCorruptedSaltBtn');
    if (corruptTestBtn) {
      corruptTestBtn.addEventListener('click', () => {
        const attemptSaltInput = document.getElementById('decryptionAttemptSalt');
        if (attemptSaltInput) {
          const fakeSalt = 'corrupt_key_' + Math.floor(Math.random() * 9999);
          attemptSaltInput.value = fakeSalt;
          window.AppState.attemptSalt = fakeSalt;
          if (window.AppState.direction !== 'decrypt') {
            window.LiveCipher.toggleDirection();
          } else {
            window.LiveCipher.transformText();
          }
          window.LiveCipher.showToast('Injected wrong decryption key: ' + fakeSalt);
        }
      });
    }

    // Reset Decryption Salt button
    const resetSaltBtn = document.getElementById('resetAttemptSaltBtn');
    if (resetSaltBtn) {
      resetSaltBtn.addEventListener('click', () => {
        const attemptSaltInput = document.getElementById('decryptionAttemptSalt');
        if (attemptSaltInput) {
          attemptSaltInput.value = window.AppState.activeSalt;
          window.AppState.attemptSalt = window.AppState.activeSalt;
          window.LiveCipher.transformText();
          window.LiveCipher.showToast('Restored correct matching salt');
        }
      });
    }
  }

  async function generateAlphabet() {
    const themeSelect = document.getElementById('aiThemeSelect');
    const promptInput = document.getElementById('aiCustomPrompt');
    const saltInput = document.getElementById('aiUserSalt');

    const themeKey = themeSelect ? themeSelect.value : 'cyberpunk';
    const customPrompt = promptInput ? promptInput.value.trim() : '';
    const salt = saltInput && saltInput.value.trim() ? saltInput.value.trim() : 'salt_' + Date.now();

    window.AppState.activeSalt = salt;
    window.AppState.currentTheme = themeKey;

    const btn = document.getElementById('generateAiAlphabetBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>✨ Constructing Cipher Matrix...</span>';
    }

    try {
      const res = await fetch('/api/cipher/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeKey, customPrompt, salt })
      });

      if (res.ok) {
        const data = await res.json();
        applyGeneratedAlphabet(data);
        window.LiveCipher.showToast('Alphabet generated for ' + data.themeName + '!');
      } else {
        throw new Error('Backend generation unavailable');
      }
    } catch (e) {
      console.warn('Using client-side deterministic fallback generator');
      const fallbackData = generateClientFallback(themeKey, customPrompt, salt);
      applyGeneratedAlphabet(fallbackData);
      window.LiveCipher.showToast('Alphabet generated (Offline Deterministic Engine)!');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✨ Generate Cipher Alphabet</span>';
      }
    }
  }

  function applyGeneratedAlphabet(data) {
    window.AppState.currentMapping = { ...data.mapping };
    window.AppState.activeSalt = data.saltUsed || window.AppState.activeSalt;

    const attemptSaltInput = document.getElementById('decryptionAttemptSalt');
    if (attemptSaltInput && !attemptSaltInput.value) {
      attemptSaltInput.value = window.AppState.activeSalt;
      window.AppState.attemptSalt = window.AppState.activeSalt;
    }

    window.App.switchTheme(data.themeKey);
    window.App.renderAlphabetGrid(true);
    window.ManualMode.renderBoard();
    window.ManualMode.validateBijection();
    window.LiveCipher.transformText();
  }

  function generateClientFallback(themeKey, customPrompt, salt) {
    const rawTheme = window.CLIENT_PRESET_THEMES && window.CLIENT_PRESET_THEMES[themeKey]
      ? window.CLIENT_PRESET_THEMES[themeKey]
      : { glyphs: ['⚡', '💾', '🤖', '🕶️', '🧬', '📡', '🔋', '🕹️', '💻', '🖲️', '📟', '🏙️', '🟣', '🟢', '🌐', '💉', '🎛️', '🦾', '🦿', '🛰️', '📶', '🔌', '💿', '🚀', '💡', '🥽'], name: 'Cyberpunk' };

    let seedStr = themeKey + ':' + customPrompt + ':' + salt;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    let seed = Math.abs(hash);

    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    const shuffled = [...rawTheme.glyphs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const mapping = {};
    alphabet.forEach((l, idx) => {
      mapping[l] = shuffled[idx];
    });

    return {
      themeKey,
      themeName: rawTheme.name,
      saltUsed: salt,
      mapping,
      glyphs: shuffled
    };
  }

  return {
    init,
    generateAlphabet,
    populatePresetDropdown,
    renderThemeGallery
  };
})();
