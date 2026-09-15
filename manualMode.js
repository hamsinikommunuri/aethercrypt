/**
 * Mode 1: Manual Language Creator
 * Interactive Mapping Board, 1-to-1 Bijection Enforcement, and Persistence
 */

window.ManualMode = (function() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const digits = '0123456789'.split('');

  const PRESET_PACKS = {
    emoji: ['⚡', '💎', '🔥', '🌊', '🔮', '⚔️', '🛡️', '👑', '🗝️', '🚀', '🪐', '👾', '🌟', '🌙', '⚓', '☠', '🎯', '🧩', '🧪', '🧬', '👁️', '🍄', '🕊️', '🏹', '🩸', '✨'],
    runes: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', 'ᛠ', 'ᛡ'],
    hieroglyphs: ['𓀀', '𓁐', '𓃠', '𓆣', '𓇋', '𓈖', '𓉐', '𓊹', '𓋹', '𓌕', '𓍯', '𓎛', '𓏏', '𓐍', '𓐎', '𓏲', '𓂋', '𓂝', '𓃀', '𓄿', '𓅓', '𓆓', '𓇯', '𓈗', '𓉔', '𓊃'],
    alchemy: ['🜁', '🜂', '🜃', '🜄', '🜔', '🜕', '🜖', '🜗', '🜘', '🜙', '🜚', '🜛', '🜜', '🜝', '🜞', '🜟', '🜠', '🜡', '🜢', '🜣', '🜤', '🜥', '🜦', '🜧', '🜨', '🜩']
  };

  function init() {
    renderBoard();
    attachEventListeners();
    validateBijection();
  }

  function renderBoard() {
    const board = document.getElementById('manualMappingBoard');
    if (!board) return;

    board.innerHTML = '';
    const currentMapping = window.AppState.currentMapping;

    // Render A-Z
    letters.forEach(letter => {
      const cell = createCell(letter, currentMapping[letter] || letter);
      board.appendChild(cell);
    });

    // Render 0-9 section if needed
    digits.forEach(digit => {
      const cell = createCell(digit, currentMapping[digit] || digit);
      board.appendChild(cell);
    });
  }

  function createCell(char, currentSymbol) {
    const cell = document.createElement('div');
    cell.className = 'manual-cell';
    cell.dataset.char = char;

    const label = document.createElement('span');
    label.className = 'manual-char-label';
    label.textContent = char;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'manual-symbol-input';
    input.value = currentSymbol;
    input.maxLength = 4; // allow unicode graphemes

    input.addEventListener('input', (e) => {
      const newSymbol = e.target.value.trim();
      window.AppState.currentMapping[char] = newSymbol;
      validateBijection();
      window.LiveCipher.transformText();
      window.App.renderAlphabetGrid();
    });

    cell.appendChild(label);
    cell.appendChild(input);
    return cell;
  }

  function validateBijection() {
    const statusEl = document.getElementById('bijectionStatus');
    const mapping = window.AppState.currentMapping;
    const seen = new Map();
    const duplicates = [];
    let emptyCount = 0;

    letters.forEach(letter => {
      const val = mapping[letter];
      if (!val) {
        emptyCount++;
        return;
      }
      if (seen.has(val)) {
        duplicates.push({ value: val, keys: [seen.get(val), letter] });
      } else {
        seen.set(val, letter);
      }
    });

    digits.forEach(digit => {
      const val = mapping[digit];
      if (val !== undefined && val !== null && val !== '') {
        if (seen.has(val)) {
          duplicates.push({ value: val, keys: [seen.get(val), digit] });
        } else {
          seen.set(val, digit);
        }
      }
    });

    if (!statusEl) return;

    if (emptyCount === 0 && duplicates.length === 0) {
      statusEl.className = 'bijection-status bijection-valid';
      statusEl.innerHTML = `✅ <strong>Valid Bijection:</strong> 26/26 letters (${seen.size}/36 total chars) unique`;
      window.AppState.isValidBijection = true;
    } else {
      statusEl.className = 'bijection-status bijection-invalid';
      let msg = '⚠️ <strong>Bijection Warning:</strong> ';
      if (duplicates.length > 0) {
        msg += `Duplicate symbol "${duplicates[0].value}" assigned to ${duplicates[0].keys.join(' & ')}! `;
      }
      if (emptyCount > 0) {
        msg += `${emptyCount} unmapped letter(s).`;
      }
      statusEl.innerHTML = msg;
      window.AppState.isValidBijection = false;
    }
  }

  function loadPresetPack(packName) {
    const pack = PRESET_PACKS[packName];
    if (!pack) return;

    letters.forEach((letter, i) => {
      window.AppState.currentMapping[letter] = pack[i] || letter;
    });

    renderBoard();
    validateBijection();
    window.LiveCipher.transformText();
    window.App.renderAlphabetGrid();
    window.LiveCipher.showToast(`Applied ${packName.toUpperCase()} pack`);
  }

  function shuffleCurrentSymbols() {
    const vals = letters.map(l => window.AppState.currentMapping[l] || l);
    // Fisher-Yates
    for (let i = vals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }

    letters.forEach((l, idx) => {
      window.AppState.currentMapping[l] = vals[idx];
    });

    renderBoard();
    validateBijection();
    window.LiveCipher.transformText();
    window.App.renderAlphabetGrid();
    window.LiveCipher.showToast('Symbols shuffled!');
  }

  function resetToDefault() {
    letters.forEach(l => {
      window.AppState.currentMapping[l] = l;
    });
    digits.forEach(d => {
      window.AppState.currentMapping[d] = d;
    });
    renderBoard();
    validateBijection();
    window.LiveCipher.transformText();
    window.App.renderAlphabetGrid();
    window.LiveCipher.showToast('Reset to standard alphabet');
  }

  async function saveCustomLanguage() {
    const profileNameInput = document.getElementById('manualProfileName');
    const profileName = (profileNameInput ? profileNameInput.value.trim() : '') || 'Custom Language ' + new Date().toLocaleDateString();

    if (!window.AppState.isValidBijection) {
      alert('Cannot save: Bijection error detected. Ensure all 26 letters have unique symbols.');
      return;
    }

    const payload = {
      theme_name: profileName,
      mapping: window.AppState.currentMapping,
      salt_key: window.AppState.activeSalt || 'custom-salt',
      user_id: window.AppState.currentUser ? window.AppState.currentUser.id : 'guest'
    };

    try {
      const token = localStorage.getItem('aethercrypt_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch('/api/cipher/profiles', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.LiveCipher.showToast(`Saved "${profileName}" to profile!`);
        window.App.loadUserProfiles();
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      // Offline fallback: Save in localStorage
      const localProfiles = JSON.parse(localStorage.getItem('aethercrypt_profiles') || '[]');
      const newProfile = {
        id: 'local_' + Date.now(),
        theme_name: profileName,
        mapping: window.AppState.currentMapping,
        salt_key: payload.salt_key,
        created_at: new Date().toISOString()
      };
      localProfiles.unshift(newProfile);
      localStorage.setItem('aethercrypt_profiles', JSON.stringify(localProfiles));
      window.LiveCipher.showToast(`Saved locally: "${profileName}"`);
      window.App.loadUserProfiles();
    }
  }

  function attachEventListeners() {
    const btnSave = document.getElementById('saveManualLangBtn');
    if (btnSave) btnSave.addEventListener('click', saveCustomLanguage);

    const btnShuffle = document.getElementById('shuffleManualBtn');
    if (btnShuffle) btnShuffle.addEventListener('click', shuffleCurrentSymbols);

    const btnReset = document.getElementById('resetManualBtn');
    if (btnReset) btnReset.addEventListener('click', resetToDefault);

    const presetSelect = document.getElementById('manualPackSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          loadPresetPack(e.target.value);
          e.target.value = '';
        }
      });
    }
  }

  return {
    init,
    renderBoard,
    validateBijection,
    loadPresetPack,
    shuffleCurrentSymbols,
    saveCustomLanguage
  };
})();
