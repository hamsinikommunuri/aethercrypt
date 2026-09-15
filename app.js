/**
 * AETHERCRYPT - Main Application Bootstrap & State Orchestrator
 * "A quiet, luxurious cryptographic observatory"
 */

// Full dictionary of 20 preset themes for offline resilience
window.CLIENT_PRESET_THEMES = {
  pirate: {
    name: '🏴‍☠️ Pirate Seadog',
    desc: 'Nautical treasures and sea curse symbols',
    glyphs: ['⚓', '☠', '🏴‍☠️', '🦜', '🪙', '🗺️', '⚔️', '🧭', '🥃', '⛵', '💣', '🐙', '💎', '🏝️', '🦈', '🪵', '🗝️', '🍺', '🌊', '🍖', '🎣', '🪝', '🚩', '📜', '🔭', '💰']
  },
  cyberpunk: {
    name: '⚡ Cyberpunk 2099',
    desc: 'Neon circuitry and synthetic protocols',
    glyphs: ['⚡', '💾', '🤖', '🕶️', '🧬', '📡', '🔋', '🕹️', '💻', '🖲️', '📟', '🏙️', '🟣', '🟢', '🌐', '💉', '🎛️', '🦾', '🦿', '🛰️', '📶', '🔌', '💿', '🚀', '💡', '🥽']
  },
  ancient_egypt: {
    name: '𓀀 Ancient Egypt',
    desc: 'Sacred hieroglyphs of the Pharaohs',
    glyphs: ['𓀀', '𓁐', '𓃠', '𓆣', '𓇋', '𓈖', '𓉐', '𓊹', '𓋹', '𓌕', '𓍯', '𓎛', '𓏏', '𓐍', '𓐎', '𓏲', '𓂋', '𓂝', '𓃀', '𓄿', '𓅓', '𓆓', '𓇯', '𓈗', '𓉔', '𓊃']
  },
  medieval_alchemist: {
    name: '⚗️ Medieval Alchemist',
    desc: 'Occult elixirs and grimoire seals',
    glyphs: ['⚗️', '🧪', '🔮', '📜', '🕯️', '🗝️', '🛡️', '⚔️', '👑', '🧙', '🐉', '🍷', '⚜️', '🪙', '🏰', '🪶', '📖', '🗡️', '🩸', '🕸️', '⚖️', '🧭', '⌛', '💍', '🪵', '🔔']
  },
  deep_space: {
    name: '🌌 Deep Space Galaxy',
    desc: 'Cosmic nebulae and astral signs',
    glyphs: ['🌌', '🪐', '🛸', '🌠', '🛰️', '🚀', '🌑', '☄️', '🔭', '👽', '⚛️', '💫', '🌟', '🌕', '🕳️', '☀️', '🌐', '📡', '👾', '🌍', '🌒', '🌓', '🌔', '🌗', '🌘', '♾️']
  },
  steampunk: {
    name: '⚙️ Steampunk Victorian',
    desc: 'Brass clockwork and automata',
    glyphs: ['⚙️', '🕰️', '🚂', '🎩', '🔧', '🧭', '🥽', '🕯️', '🗝️', '🧪', '📜', '🧲', '🔦', '⏱️', '🪙', '🗜️', '🔨', '📻', '⚖️', '🖋️', '🪚', '🪜', '🧱', '💡', '🪓', '🔩']
  },
  nordic_runes: {
    name: 'ᚠ Nordic Elder Futhark',
    desc: 'Runes carved into stone monoliths',
    glyphs: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', 'ᛠ', 'ᛡ']
  },
  biohazard: {
    name: '☣️ Biohazard Lab',
    desc: 'Synthetic pathogens and quarantine',
    glyphs: ['☣️', '🧬', '🧫', '💉', '🔬', '🧪', '⚠️', '🧯', '☢️', '🦠', '💊', '🩸', '🧤', '🧼', '🥼', '😷', '🧻', '🩺', '🪣', '🧲', '🌡️', '🏥', '🫀', '🫁', '💀', '⚰️']
  },
  matrix: {
    name: '🟩 Matrix Digital Rain',
    desc: 'Cascading digital glyph fragments',
    glyphs: ['0', '1', '░', '▒', '▓', 'ｦ', 'ｱ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ', 'ﾀ', 'ﾂ', 'ﾃ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ']
  },
  gothic_victorian: {
    name: '🕯️ Gothic Victorian',
    desc: 'Crypts, lace, ravens and velvet',
    glyphs: ['🕯️', '🦇', '🍷', '🗝️', '🥀', '🕸️', '⏳', '🏰', '🪞', '🖤', '🌙', '🗡️', '🩸', '💍', '⚰️', '🪦', '🪶', '📜', '🎩', '🎻', '♟️', '🪆', '🫀', '🪟', '🍂', '🪔']
  },
  atlantis_ocean: {
    name: '🔱 Atlantis Abyssal',
    desc: 'Sunken cities and bioluminescence',
    glyphs: ['🔱', '🌊', '🐚', '🦈', '🐬', '🧜', '🪸', '🫧', '🦑', '🐙', '🐠', '🐋', '⚓', '🏝️', '🪼', '🦪', '🦞', '🦀', '🐢', '🧭', '💎', '🧊', '🏖️', '🤿', '🛶', '🪨']
  },
  feudal_samurai: {
    name: '⚔️ Feudal Samurai',
    desc: 'Forged steel katanas and cherry blossom',
    glyphs: ['⚔️', '🏯', '🌸', '👺', '🥷', '🎏', '🎋', '⛩️', '🥋', '🏮', '🍵', '🍶', '🍙', '🥢', '🗻', '🐅', '🐉', '🏹', '🛡️', '🎴', '📜', '🎐', '🪵', '🎎', '🪭', '👘']
  },
  witchcraft_occult: {
    name: '🔮 Witchcraft Occult',
    desc: 'Tarot divination and astral moondust',
    glyphs: ['🔮', '🌙', '🕯️', '🧹', '👁️', '🪶', '📜', '🗝️', '🍄', '🖤', '🐍', '🪞', '🪵', '🪦', '🕷️', '🥀', '🍵', '📿', '🦴', '🏺', '⏳', '🪬', '🧿', '💫', '✨', '🌑']
  },
  alien_hive: {
    name: '👾 Alien Hivemind',
    desc: 'Xenomorphic pods and cosmic spores',
    glyphs: ['👾', '🛸', '👽', '🧬', '☄️', '🧪', '👁️', '🕸️', '🦠', '🥚', '🦗', '🦂', '🪱', '🫀', '🧫', '🕳️', '📡', '💥', '⚡', '🪐', '🌌', '🩸', '🪳', '☣️', '🌋', '🟢']
  },
  aztec_sun: {
    name: '☀️ Aztec Sun Temple',
    desc: 'Gold solar calendar and obsidian blades',
    glyphs: ['☀️', '🐆', '🦅', '🌽', '🏛️', '🗿', '🏺', '🐍', '🔥', '🪙', '🏹', '🌿', '🪵', '🩸', '👑', '🛡️', '🪶', '🌕', '🌵', '🪓', '🪞', '🪨', '🌾', '🌋', '👁️', '💫']
  },
  post_apocalyptic: {
    name: '☢️ Post-Apocalyptic',
    desc: 'Barbed wire and radioactive dust',
    glyphs: ['☢️', '💀', '⛽', '🌪️', '🛢️', '⛓️', '🏜️', '🔧', '🏚️', '🚗', '🦴', '🧱', '🪚', '🪓', '🪝', '💣', '🧰', '🩹', '🚬', '🔋', '🥫', '📻', '🗝️', '🥽', '🪖', '🥩']
  },
  neon_synthwave: {
    name: '🌴 Neon Synthwave 80s',
    desc: 'Palm sunsets and cassette nostalgia',
    glyphs: ['🌴', '🕶️', '📼', '🌆', '🏎️', '🕹️', '🦩', '🍕', '🍸', '🎹', '🎧', '💾', '📻', '🏙️', '🌇', '🛼', '🟣', '🟪', '⚡', '🪩', '🎆', '🐬', '🍹', '🛹', '🌃', '👾']
  },
  quantum_realm: {
    name: '⚛️ Quantum Realm',
    desc: 'Superposition orbitals and flux coils',
    glyphs: ['⚛️', '🌀', '🔬', '🧲', '🌐', '🌌', '💡', '⚡', '♾️', '🔮', '💫', '🪞', '🧬', '📡', '🛸', '🚀', '🧪', '🪐', '🔭', '💥', '🧊', '🕯️', '🕳️', '🧭', '⏱️', '🗝️']
  },
  cryptid_woods: {
    name: '🌲 Cryptid Redwood',
    desc: 'Glowing moss and horned pine eyes',
    glyphs: ['🌲', '🐾', '🦉', '🌕', '🏕️', '🦌', '🐺', '🍄', '🪓', '🪵', '🍃', '🍂', '🦇', '🐻', '🐍', '🪹', '🪲', '🪨', '🔦', '🗺️', '🥾', '🕸️', '🌿', '🪱', '👁️', '👣']
  },
  celestial_angels: {
    name: '✨ Celestial Empyrean',
    desc: 'Seraphim wings and divine script',
    glyphs: ['✨', '🪽', '🕊️', '👑', '🎺', '🌟', '🪞', '⚜️', '☀️', '⛅', '🌈', '🕯️', '📖', '📜', '🛡️', '⚔️', '🤍', '🔔', '💎', '🪷', '🏛️', '📿', '🪐', '💫', '👼', '⛪']
  }
};

// Global App State
window.AppState = {
  currentView: 'auth', // 'auth', 'home', 'workspace'
  currentMode: 'manual', // 'manual', 'ai', 'classical'
  direction: 'encrypt', // 'encrypt', 'decrypt'
  currentTheme: 'cyberpunk',
  currentThemeName: '⚡ Cyberpunk 2099',
  currentMapping: {},
  activeSalt: 'aether_salt_01',
  attemptSalt: 'aether_salt_01',
  caesarShift: 3,
  vigenereKey: 'CIPHER',
  classicalCipher: 'caesar',
  affineA: 5,
  affineB: 8,
  railFenceRails: 3,
  rsaP: 61,
  rsaQ: 53,
  rsaN: 3233,
  rsaPhi: 3120,
  rsaE: 17,
  rsaD: 2753,
  playfairKey: 'MONARCHY',
  hillMatrix: [[3, 3], [2, 5]],
  enigmaRotors: ['I', 'II', 'III'],
  enigmaPositions: ['A', 'A', 'A'],
  enigmaRings: [1, 1, 1],
  enigmaPlugboard: 'AE TH BQ',
  isValidBijection: true,
  currentUser: null,
  savedProfiles: [],
  lastTransformed: ''
};

window.App = (function() {
  let authMode = 'login'; // 'login' or 'signup'

  function init() {
    initDefaultMapping('cyberpunk');
    initHeaderThemePicker();
    initNavigationRouting();
    initAuth();
    initProfileModal();
    initCommandPalette();

    // Initialize sub-engines
    window.LiveCipher.init();
    window.ManualMode.init();
    window.AiMode.init();
    window.ClassicalMode.init();
    window.ExportPoster.init();
    if (window.AudioFx) window.AudioFx.init();
    if (window.DemoTour) window.DemoTour.init();

    // Initial render
    renderAlphabetGrid();
    switchTheme('cyberpunk');

    // Prepopulate sample transmission
    const input = document.getElementById('cipherInput');
    if (input) {
      input.value = 'THE EAGLE FLIES AT MIDNIGHT. INITIATE PROTOCOL AETHER.';
      window.LiveCipher.transformText();
    }

    // Check existing session or show auth
    checkUserSession();
  }

  function initDefaultMapping(themeKey) {
    const theme = window.CLIENT_PRESET_THEMES[themeKey] || window.CLIENT_PRESET_THEMES.cyberpunk;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const map = {};
    alphabet.forEach((l, idx) => {
      map[l] = theme.glyphs[idx] || l;
    });
    // Digits
    for (let d = 0; d <= 9; d++) {
      map[d.toString()] = d.toString();
    }
    window.AppState.currentMapping = map;
    window.AppState.currentTheme = themeKey;
    window.AppState.currentThemeName = theme.name;
  }

  function openView(viewName) {
    window.AppState.currentView = viewName;

    // Toggle view containers
    const views = document.querySelectorAll('.view-container');
    views.forEach(v => v.classList.remove('active-view'));

    const target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Header context updates
    const homeStatusPill = document.getElementById('homeStatusPill');
    const workspaceNav = document.getElementById('workspaceNavContainer');

    if (viewName === 'auth') {
      if (homeStatusPill) homeStatusPill.style.display = 'none';
      if (workspaceNav) workspaceNav.style.display = 'none';
    } else if (viewName === 'home') {
      if (homeStatusPill) homeStatusPill.style.display = 'inline-flex';
      if (workspaceNav) workspaceNav.style.display = 'none';
      updateHeroGreeting();
    } else if (viewName === 'workspace') {
      if (homeStatusPill) homeStatusPill.style.display = 'none';
      if (workspaceNav) workspaceNav.style.display = 'flex';
      syncWorkspaceHeader();
    }
  }

  function openMode(modeName) {
    window.AppState.currentMode = modeName;

    // Update active mode panel
    document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + modeName);
    if (panel) panel.classList.add('active');

    // Update workspace header text
    syncWorkspaceHeader();

    // Open workspace view
    openView('workspace');

    // Ensure alphabet grid & live cipher are synced
    renderAlphabetGrid();
    window.LiveCipher.transformText();
  }

  function syncWorkspaceHeader() {
    const badge = document.getElementById('activeModeBadge');
    const headline = document.getElementById('activeModeHeadline');
    const subline = document.getElementById('activeModeSubline');
    const mode = window.AppState.currentMode;

    const navPillManual = document.getElementById('navPillManual');
    const navPillAi = document.getElementById('navPillAi');
    const navPillClassical = document.getElementById('navPillClassical');

    [navPillManual, navPillAi, navPillClassical].forEach(p => {
      if (p) p.classList.remove('active');
    });

    if (mode === 'manual') {
      if (badge) badge.textContent = 'MODE 01 // MANUAL LANGUAGE';
      if (headline) headline.textContent = 'Create Your Own Language';
      if (subline) subline.textContent = 'Build a personal secret language by assigning your own symbols to every character.';
      if (navPillManual) navPillManual.classList.add('active');
    } else if (mode === 'ai') {
      const themeTitle = window.AppState.currentThemeName || 'AI Themed';
      if (badge) badge.textContent = 'MODE 02 // AI THEMED CIPHER FORGE';
      if (headline) headline.textContent = 'AI Themed Cipher Forge';
      if (subline) subline.textContent = 'Choose a world (' + themeTitle + '), describe a vibe, and generate a unique symbolic alphabet.';
      if (navPillAi) navPillAi.classList.add('active');
    } else if (mode === 'classical') {
      if (badge) badge.textContent = 'MODE 03 // CLASSICAL CRYPTOGRAPHY LAB';
      if (headline) headline.textContent = 'Explore Classical Ciphers';
      if (subline) subline.textContent = 'Experiment with Caesar, Vigenère, Base64 and asymmetric cryptography.';
      if (navPillClassical) navPillClassical.classList.add('active');
    }
  }

  function updateHeroGreeting() {
    const greetingEl = document.getElementById('heroGreetingText');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';

    const user = window.AppState.currentUser;
    const name = user ? user.username : 'Operative';
    greetingEl.textContent = timeGreeting + ', ' + name + '.';
  }

  function initNavigationRouting() {
    // Brand click: If logged in, go to home, else to auth
    const brand = document.getElementById('navBrandHome');
    if (brand) {
      brand.addEventListener('click', () => {
        if (window.AppState.currentUser) {
          openView('home');
        } else {
          openView('auth');
        }
      });
    }

    // Three Large Mode Cards on Home
    const cardManual = document.getElementById('homeCardManual');
    if (cardManual) {
      cardManual.addEventListener('click', () => openMode('manual'));
    }

    const cardAi = document.getElementById('homeCardAi');
    if (cardAi) {
      cardAi.addEventListener('click', () => openMode('ai'));
    }

    const cardClassical = document.getElementById('homeCardClassical');
    if (cardClassical) {
      cardClassical.addEventListener('click', () => openMode('classical'));
    }

    // Back to Home buttons
    const backBtnHeader = document.getElementById('backToHomeBtn');
    if (backBtnHeader) {
      backBtnHeader.addEventListener('click', () => openView('home'));
    }

    const backBtnWorkspace = document.getElementById('workspaceBackBtn');
    if (backBtnWorkspace) {
      backBtnWorkspace.addEventListener('click', () => openView('home'));
    }

    // Workspace navigation pills
    const pillManual = document.getElementById('navPillManual');
    if (pillManual) {
      pillManual.addEventListener('click', () => openMode('manual'));
    }

    const pillAi = document.getElementById('navPillAi');
    if (pillAi) {
      pillAi.addEventListener('click', () => openMode('ai'));
    }

    const pillClassical = document.getElementById('navPillClassical');
    if (pillClassical) {
      pillClassical.addEventListener('click', () => openMode('classical'));
    }

    window.addEventListener('hashchange', () => {
      checkUserSession();
    });
  }

  function initHeaderThemePicker() {
    const select = document.getElementById('headerThemeSelect');
    if (!select) return;

    select.innerHTML = '';
    Object.entries(window.CLIENT_PRESET_THEMES).forEach(([key, t]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = t.name;
      select.appendChild(opt);
    });

    select.value = window.AppState.currentTheme;
    select.addEventListener('change', (e) => {
      switchTheme(e.target.value);
    });
  }

  function switchTheme(themeKey) {
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');

    document.body.classList.add('theme-' + themeKey);
    window.AppState.currentTheme = themeKey;

    const theme = window.CLIENT_PRESET_THEMES[themeKey];
    if (theme) {
      window.AppState.currentThemeName = theme.name;
    }

    const headerSelect = document.getElementById('headerThemeSelect');
    if (headerSelect) headerSelect.value = themeKey;

    const aiSelect = document.getElementById('aiThemeSelect');
    if (aiSelect) aiSelect.value = themeKey;

    // Highlight card in AI theme gallery if available
    document.querySelectorAll('.ai-gallery-card').forEach(c => {
      c.classList.toggle('active', c.dataset.key === themeKey);
    });
  }

  function renderAlphabetGrid(animate = false) {
    const grid = document.getElementById('alphabetGridCards');
    if (!grid) return;

    grid.innerHTML = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let mapping = window.AppState.currentMapping;

    if (window.AppState.currentMode === 'classical' && window.AppState.classicalCipher === 'caesar') {
      const shift = ((window.AppState.caesarShift % 26) + 26) % 26;
      mapping = {};
      letters.forEach((l, idx) => {
        mapping[l] = letters[(idx + shift) % 26];
      });
    }

    letters.forEach((letter, idx) => {
      const symbol = mapping[letter] || letter;
      const card = document.createElement('div');
      card.className = 'alphabet-card';
      card.dataset.letter = letter;
      card.dataset.symbol = symbol;
      card.title = 'Click to highlight "' + letter + '" (➔ ' + symbol + ') in text';

      if (animate) {
        card.style.animation = 'alphabetCardPop 0.45s cubic-bezier(0.16, 1, 0.3, 1) ' + (idx * 22) + 'ms both';
      }

      card.innerHTML = 
        '<span class="card-letter">' + letter + '</span>' +
        '<span class="card-arrow">➔</span>' +
        '<span class="card-symbol">' + symbol + '</span>';

      card.addEventListener('click', () => {
        const isAlreadyActive = card.classList.contains('active-match');
        document.querySelectorAll('.alphabet-card').forEach(c => c.classList.remove('active-match'));
        if (!isAlreadyActive) {
          card.classList.add('active-match');
          window.LiveCipher.highlightCharacter(letter, symbol);
        } else {
          window.LiveCipher.clearHighlight();
        }
      });

      grid.appendChild(card);
    });
  }

  function initAuth() {
    const tabLogin = document.getElementById('authTabLogin');
    const tabSignup = document.getElementById('authTabSignup');
    const submitBtn = document.getElementById('authSubmitBtn');

    if (tabLogin && tabSignup) {
      tabLogin.addEventListener('click', () => {
        authMode = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        if (submitBtn) submitBtn.innerHTML = '<span>Enter the Laboratory</span><span>→</span>';
      });

      tabSignup.addEventListener('click', () => {
        authMode = 'signup';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        if (submitBtn) submitBtn.innerHTML = '<span>Create Operative Account</span><span>→</span>';
      });
    }

    const landingForm = document.getElementById('loginForm');
    if (landingForm) {
      landingForm.addEventListener('submit', handleLandingAuthSubmit);
    }

    const guestBtn = document.getElementById('guestEnterBtn');
    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
        openView('home');
        window.LiveCipher.showToast('Entered as Guest Operative. Welcome to Aethercrypt!');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    const authActionBtn = document.getElementById('authActionBtn');
    const authModal = document.getElementById('authModal');
    if (authActionBtn && authModal) {
      authActionBtn.addEventListener('click', () => {
        authModal.classList.add('active');
      });
    }

    document.querySelectorAll('.modal-auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-auth-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const type = e.currentTarget.dataset.type;
        const btn = document.getElementById('modalAuthSubmitBtn');
        if (btn) btn.textContent = type === 'signup' ? 'Create Account' : 'Log In';
      });
    });

    const modalForm = document.getElementById('modalLoginForm');
    if (modalForm) {
      modalForm.addEventListener('submit', handleModalAuthSubmit);
    }
  }

  async function handleLandingAuthSubmit(e) {
    e.preventDefault();
    const userIn = document.getElementById('authUsername');
    const passIn = document.getElementById('authPassword');
    const btn = document.getElementById('authSubmitBtn');

    const username = userIn ? userIn.value.trim() : '';
    const password = passIn ? passIn.value : '';

    if (!username || !password) return;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Verifying Credentials...</span>';
    }

    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('aether_token', data.token);
      window.AppState.currentUser = data.user;
      updateUserBadgeUI();
      loadUserProfiles();

      openView('home');
      window.LiveCipher.showToast('Welcome to Aethercrypt, Operative ' + data.user.username + '!');
    } catch (err) {
      alert(err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = authMode === 'signup' 
          ? '<span>Create Operative Account</span><span>→</span>' 
          : '<span>Enter the Laboratory</span><span>→</span>';
      }
    }
  }

  async function handleModalAuthSubmit(e) {
    e.preventDefault();
    const userIn = document.getElementById('modalAuthUsername');
    const passIn = document.getElementById('modalAuthPassword');
    const activeTab = document.querySelector('.modal-auth-tab.active');
    const type = activeTab ? activeTab.dataset.type : 'login';

    const username = userIn ? userIn.value.trim() : '';
    const password = passIn ? passIn.value : '';

    if (!username || !password) return;

    const endpoint = type === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('aether_token', data.token);
      window.AppState.currentUser = data.user;
      updateUserBadgeUI();
      loadUserProfiles();

      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      window.LiveCipher.showToast('Authenticated as ' + data.user.username);
      openView('home');
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('aether_token');
    window.AppState.currentUser = null;
    updateUserBadgeUI();
    openView('auth');
    window.LiveCipher.showToast('Signed out of operative terminal.');
  }

  async function checkUserSession() {
    const hash = (window.location.hash || '').toLowerCase();
    if (hash === '#home' || hash === '#manual' || hash === '#ai' || hash === '#classical') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      if (hash === '#home') openView('home');
      else if (hash === '#manual') openMode('manual');
      else if (hash === '#ai') openMode('ai');
      else if (hash === '#classical') openMode('classical');
      return;
    }

    if (hash === '#railfence' || hash === '#rail-fence' || hash === '#atbash' || hash === '#affine' || hash === '#rsa' || hash === '#playfair' || hash === '#hill' || hash === '#enigma') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openMode('classical');
      const cipherKey = hash.includes('rail') ? 'railfence' : hash.replace('#', '');
      setTimeout(() => {
        const btn = document.querySelector(`.subtab-btn[data-cipher="${cipherKey}"]`);
        if (btn) btn.click();
      }, 150);
      return;
    }

    if (hash === '#cryptanalysis' || hash === '#codebreaker' || hash === '#desk') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openMode('classical');
      setTimeout(() => {
        const desk = document.getElementById('cryptanalysisSection');
        if (desk) {
          desk.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
      return;
    }

    if (hash === '#codebook' || hash.startsWith('#codebook:')) {
      const tpl = hash.startsWith('#codebook:') ? hash.split(':')[1] : null;
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openMode('manual');
      setTimeout(() => {
        const btn = document.getElementById('openCodebookBtn');
        if (btn) btn.click();
        if (tpl) {
          setTimeout(() => {
            const tplBtn = document.querySelector(`.template-btn[data-template="${tpl}"]`);
            if (tplBtn) tplBtn.click();
          }, 200);
        }
      }, 300);
      return;
    }

    if (hash === '#share') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openMode('manual');
      setTimeout(() => {
        const btn = document.getElementById('openShareCardBtn');
        if (btn) btn.click();
      }, 300);
      return;
    }

    if (hash === '#codebooks') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openView('home');
      setTimeout(() => {
        const btn = document.getElementById('openProfilesBtn');
        if (btn) btn.click();
      }, 300);
      return;
    }

    if (hash === '#palette') {
      if (!window.AppState.currentUser) {
        window.AppState.currentUser = { id: 'guest', username: 'Operative' };
        updateUserBadgeUI();
      }
      openView('home');
      setTimeout(() => {
        const btn = document.getElementById('openCommandPaletteBtn');
        if (btn) btn.click();
      }, 300);
      return;
    }

    const token = localStorage.getItem('aether_token');
    if (!token) {
      openView('auth');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        window.AppState.currentUser = data.user;
        updateUserBadgeUI();
        loadUserProfiles();
        openView('home');
      } else {
        localStorage.removeItem('aether_token');
        openView('auth');
      }
    } catch (e) {
      openView('auth');
    }
  }

  function updateUserBadgeUI() {
    const authBtn = document.getElementById('authActionBtn');
    const badge = document.getElementById('userBadgeContainer');
    const usernameSpan = document.getElementById('currentUsernameSpan');

    if (window.AppState.currentUser) {
      if (authBtn) authBtn.style.display = 'none';
      if (badge) badge.style.display = 'inline-flex';
      if (usernameSpan) usernameSpan.textContent = window.AppState.currentUser.username;
    } else {
      if (authBtn) authBtn.style.display = 'inline-flex';
      if (badge) badge.style.display = 'none';
    }
  }

  function initProfileModal() {
    const openBtn = document.getElementById('openProfilesBtn');
    const modal = document.getElementById('profilesModal');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        loadUserProfiles();
        modal.classList.add('active');
      });
    }

    const exportBtn = document.getElementById('exportProfilesJsonBtn');
    const importBtn = document.getElementById('importProfilesJsonBtn');
    const fileInput = document.getElementById('importProfilesFileInput');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const profiles = window.AppState.savedProfiles || [];
        if (!profiles || profiles.length === 0) {
          if (window.LiveCipher && window.LiveCipher.showToast) {
            window.LiveCipher.showToast('No saved codebooks to export!');
          }
          return;
        }

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `aethercrypt_codebooks_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        if (window.LiveCipher && window.LiveCipher.showToast) {
          window.LiveCipher.showToast(`Exported ${profiles.length} codebook(s) to JSON!`);
        }
        if (window.AudioFx && window.AudioFx.playChime) {
          window.AudioFx.playChime();
        }
      });
    }

    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            let imported = JSON.parse(event.target.result);
            if (!Array.isArray(imported)) {
              if (imported && Array.isArray(imported.profiles)) {
                imported = imported.profiles;
              } else if (imported && typeof imported === 'object' && imported.mapping) {
                imported = [imported];
              } else {
                throw new Error('JSON is not an array or profile object');
              }
            }

            if (imported.length === 0) {
              if (window.LiveCipher && window.LiveCipher.showToast) {
                window.LiveCipher.showToast('Imported file contains no codebooks.');
              }
              return;
            }

            const token = localStorage.getItem('aether_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            let successCount = 0;
            const localProfiles = JSON.parse(localStorage.getItem('aethercrypt_profiles') || '[]');

            for (const p of imported) {
              const themeName = p.theme_name || p.name || 'Imported Language';
              let mapping = p.mapping_json || p.mapping;
              if (typeof mapping === 'string') {
                try { mapping = JSON.parse(mapping); } catch (err) { mapping = {}; }
              }
              const saltKey = p.salt_key || 'imported_' + Math.floor(Math.random() * 1000);

              if (token) {
                try {
                  const res = await fetch('/api/cipher/profiles', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                      theme_name: themeName,
                      mapping: mapping,
                      salt_key: saltKey
                    })
                  });
                  if (res.ok) successCount++;
                } catch (err) {
                  console.warn('Failed to upload profile to server:', err);
                }
              }

              const localEntry = {
                id: p.id || ('local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
                theme_name: themeName,
                mapping: mapping,
                salt_key: saltKey,
                created_at: p.created_at || new Date().toISOString()
              };
              localProfiles.unshift(localEntry);
              if (!token) successCount++;
            }

            localStorage.setItem('aethercrypt_profiles', JSON.stringify(localProfiles));
            await loadUserProfiles();

            if (window.LiveCipher && window.LiveCipher.showToast) {
              window.LiveCipher.showToast(`Imported ${successCount} codebook(s) successfully!`);
            }
            if (window.AudioFx && window.AudioFx.playChime) {
              window.AudioFx.playChime();
            }
          } catch (err) {
            console.error('Import error:', err);
            if (window.LiveCipher && window.LiveCipher.showToast) {
              window.LiveCipher.showToast('Failed to import JSON: Invalid format');
            }
          }
        };
        reader.readAsText(file);
      });
    }
  }

  async function loadUserProfiles() {
    const container = document.getElementById('profilesListContainer');
    if (!container) return;

    const token = localStorage.getItem('aether_token');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

    try {
      const res = await fetch('/api/cipher/profiles', { headers });
      if (res.ok) {
        const data = await res.json();
        const serverProfiles = data.profiles || [];
        if (serverProfiles.length > 0) {
          window.AppState.savedProfiles = serverProfiles;
          renderProfilesList(window.AppState.savedProfiles);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load profiles from server');
    }

    const localProfiles = JSON.parse(localStorage.getItem('aethercrypt_profiles') || '[]');
    window.AppState.savedProfiles = localProfiles;
    renderProfilesList(window.AppState.savedProfiles);
  }

  function renderProfilesList(profiles) {
    const container = document.getElementById('profilesListContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!profiles || profiles.length === 0) {
      container.innerHTML = 
        '<div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">' +
          '<div style="font-size: 2rem; margin-bottom: 0.5rem;">📜</div>' +
          '<div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">No Codebooks Saved Yet</div>' +
          '<p style="font-size: 0.85rem;">Create a custom language in Mode 1 or AI Mode and click "Save" to build your repository.</p>' +
        '</div>';
      return;
    }

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '0.75rem';

    profiles.forEach(p => {
      const item = document.createElement('div');
      item.style.background = 'var(--bg-surface-elevated)';
      item.style.border = '1px solid var(--border-subtle)';
      item.style.borderRadius = 'var(--radius-md)';
      item.style.padding = '1rem 1.2rem';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.gap = '1rem';

      const previewChars = Object.values(p.mapping || {}).slice(0, 7).join(' ');

      item.innerHTML = 
        '<div>' +
          '<div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">' + p.theme_name + '</div>' +
          '<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">' +
            '<span>Sample: ' + previewChars + '</span> • <span style="font-family: var(--font-mono);">Salt: ' + p.salt_key + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 0.5rem;">' +
          '<button class="btn-primary load-profile-btn" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;">Activate</button>' +
          '<button class="btn-secondary del-profile-btn" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; color: var(--danger);">✕</button>' +
        '</div>';

      item.querySelector('.load-profile-btn').addEventListener('click', () => {
        window.AppState.currentMapping = { ...p.mapping };
        window.AppState.activeSalt = p.salt_key;
        window.AppState.attemptSalt = p.salt_key;
        renderAlphabetGrid();
        window.ManualMode.renderBoard();
        window.LiveCipher.transformText();
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        openMode('manual');
        window.LiveCipher.showToast('Activated codebook: ' + p.theme_name);
      });

      item.querySelector('.del-profile-btn').addEventListener('click', async () => {
        const token = localStorage.getItem('aether_token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        if (p.id) {
          try {
            await fetch('/api/cipher/profiles/' + p.id, { method: 'DELETE', headers });
          } catch (e) {}
        }
        const local = JSON.parse(localStorage.getItem('aethercrypt_profiles') || '[]');
        const updated = local.filter(x => x.id !== p.id && x.theme_name !== p.theme_name);
        localStorage.setItem('aethercrypt_profiles', JSON.stringify(updated));
        await loadUserProfiles();
      });

      list.appendChild(item);
    });

    container.appendChild(list);
  }

  function initCommandPalette() {
    const modal = document.getElementById('commandPaletteModal');
    const input = document.getElementById('commandPaletteInput');
    const results = document.getElementById('commandPaletteResults');
    const openBtn = document.getElementById('openCommandPaletteBtn');

    if (!modal || !input || !results) return;

    let activeIndex = 0;
    let filteredCommands = [];

    const ALL_COMMANDS = [
      // Navigation
      { cat: 'Navigation', title: 'Observatory Home', sub: 'Return to mode overview and insights', icon: '🏛️', action: () => openView('home') },
      { cat: 'Navigation', title: 'Mode 01: Glyph Atelier', sub: 'Manual character-by-character alphabet designer', icon: '✍️', action: () => openMode('manual') },
      { cat: 'Navigation', title: 'Mode 02: AI Themed Cipher Forge', sub: 'Generate themed alphabets and custom prompts', icon: '✨', action: () => openMode('ai') },
      { cat: 'Navigation', title: 'Mode 03: Classical Cryptography Lab', sub: 'Caesar disk, Vigenère ribbon, Base64 visualizer', icon: '🏛️', action: () => openMode('classical') },
      { cat: 'Navigation', title: 'Saved Codebooks Library', sub: 'View and activate saved cipher profiles', icon: '📁', action: () => {
        const btn = document.getElementById('openProfilesBtn');
        if (btn) btn.click();
      }},

      // Algorithms
      { cat: 'Algorithms', title: 'Caesar Cipher', sub: 'Rotational substitution with live concentric disk', icon: '🏛️', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="caesar"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Vigenère Cipher', sub: 'Polyalphabetic key alignment trace', icon: '🔑', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="vigenere"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Base64 RFC 4648', sub: '8-bit octet to 6-bit sextet padding inspector', icon: '📦', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="base64"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Atbash Inversion', sub: 'Biblical symmetric reversal involution (A ↔ Z)', icon: '🔄', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="atbash"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Affine Algebra', sub: 'Algebraic substitution: C ≡ (aP + b) mod 26', icon: '📐', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="affine"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Rail Fence Transposition', sub: 'Depth-based zig-zag wave permutation', icon: '🌊', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="railfence"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'RSA Public-Key Cryptography', sub: 'Asymmetric trapdoor modular exponentiation: C ≡ Mᵉ mod n', icon: '🔐', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="rsa"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Playfair Cipher', sub: '5×5 digraph key matrix substitution & rule tracing', icon: '🔲', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="playfair"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Hill Cipher', sub: '2×2 modular matrix linear algebra: C ≡ K · P (mod 26)', icon: '🔢', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="hill"]');
        if (btn) btn.click();
      }},
      { cat: 'Algorithms', title: 'Wehrmacht Enigma M3 Simulator', sub: 'Rotors I–V, Reflector B, Ringstellung & Steckerbrett circuit trace', icon: '⚙️', action: () => {
        openMode('classical');
        const btn = document.querySelector('.subtab-btn[data-cipher="enigma"]');
        if (btn) btn.click();
      }},
      { cat: 'Analysis', title: "The Cryptanalyst's Desk", sub: 'Shannon Entropy, Index of Coincidence, and 25-Shift Caesar Brute Force', icon: '🔍', action: () => {
        openMode('classical');
        setTimeout(() => {
          const desk = document.getElementById('cryptanalysisSection');
          if (desk) desk.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }},

      // Actions
      { cat: 'Actions', title: 'Run Encryption (3D Letter Flip)', sub: 'Execute mechanical letter-reel decryption animation', icon: '▶️', action: () => {
        const btn = document.getElementById('runEncryptBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Toggle Direction [Encrypt ⇄ Decrypt]', sub: 'Invert transformation stream direction', icon: '⇄', action: () => {
        window.LiveCipher.toggleDirection();
      }},
      { cat: 'Actions', title: 'Export Physical Codebook (A4 PDF)', sub: 'Generate high-DPI printable reference manual', icon: '📜', action: () => {
        const btn = document.getElementById('openCodebookBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Export Shareable Transmission Card (PNG)', sub: 'Export styled social image card', icon: '🖼️', action: () => {
        const btn = document.getElementById('openShareCardBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Shuffle Alphabet Glyphs', sub: 'Randomize active substitution symbols', icon: '🔀', action: () => {
        const btn = document.getElementById('shuffleAlphabetBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Reset Alphabet to Plain (A-Z)', sub: 'Restore standard Latin characters', icon: '🔄', action: () => {
        const btn = document.getElementById('resetAlphabetBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Generate New Operative Salt Key', sub: 'Regenerate user-specific cryptographic seed', icon: '🎲', action: () => {
        const btn = document.getElementById('generateNewSaltBtn');
        if (btn) btn.click();
      }},
      { cat: 'Actions', title: 'Watch Live Cryptographic Showcase', sub: 'Autonomous presentation across all modes', icon: '▶️', action: () => {
        if (window.DemoTour) window.DemoTour.startTour();
      }},
      { cat: 'Actions', title: 'Toggle Synthesizer Sound Effects', sub: 'Enable or mute mechanical audio haptics', icon: '🔊', action: () => {
        if (window.AudioFx) window.AudioFx.toggleMute();
      }},

      // Themes
      ...Object.entries(window.CLIENT_PRESET_THEMES).map(([k, t]) => ({
        cat: 'Switch Theme',
        title: t.name,
        sub: t.desc,
        icon: t.glyphs[0] || '✦',
        action: () => {
          switchTheme(k);
          window.LiveCipher.transformText();
          window.LiveCipher.showToast('Switched theme: ' + t.name);
        }
      }))
    ];

    function openPalette() {
      modal.classList.add('active');
      input.value = '';
      activeIndex = 0;
      renderFiltered('');
      setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
      modal.classList.remove('active');
    }

    function renderFiltered(query) {
      const q = query.trim().toLowerCase();
      filteredCommands = ALL_COMMANDS.filter(cmd => 
        !q || cmd.title.toLowerCase().includes(q) || cmd.sub.toLowerCase().includes(q) || cmd.cat.toLowerCase().includes(q)
      );

      results.innerHTML = '';
      if (filteredCommands.length === 0) {
        results.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">No matching commands found</div>';
        return;
      }

      let currentCat = '';
      filteredCommands.forEach((cmd, idx) => {
        if (cmd.cat !== currentCat) {
          currentCat = cmd.cat;
          const catHeading = document.createElement('div');
          catHeading.className = 'cmd-category-title';
          catHeading.textContent = currentCat;
          results.appendChild(catHeading);
        }

        const item = document.createElement('div');
        item.className = 'cmd-item' + (idx === activeIndex ? ' active' : '');
        item.innerHTML = 
          '<div class="cmd-item-left">' +
            '<span class="cmd-item-icon">' + cmd.icon + '</span>' +
            '<div class="cmd-item-text">' +
              '<span class="cmd-item-title">' + cmd.title + '</span>' +
              '<span class="cmd-item-subtitle">' + cmd.sub + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="cmd-item-badge">↵</span>';

        item.addEventListener('mouseenter', () => {
          activeIndex = idx;
          updateActiveItem();
        });

        item.addEventListener('click', () => {
          closePalette();
          cmd.action();
        });

        results.appendChild(item);
      });

      scrollActiveIntoView();
    }

    function updateActiveItem() {
      const items = results.querySelectorAll('.cmd-item');
      items.forEach((it, idx) => {
        it.classList.toggle('active', idx === activeIndex);
      });
      scrollActiveIntoView();
    }

    function scrollActiveIntoView() {
      const activeEl = results.querySelectorAll('.cmd-item')[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }

    input.addEventListener('input', (e) => {
      activeIndex = 0;
      renderFiltered(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          activeIndex = (activeIndex + 1) % filteredCommands.length;
          updateActiveItem();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
          updateActiveItem();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          closePalette();
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    if (openBtn) {
      openBtn.addEventListener('click', openPalette);
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape' && modal.classList.contains('active')) {
        closePalette();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.id === 'cipherInput' || activeEl.tagName === 'TEXTAREA')) {
          e.preventDefault();
          const runBtn = document.getElementById('runEncryptBtn');
          if (runBtn) runBtn.click();
        }
      }
    });
  }

  return {
    init,
    openView,
    openMode,
    switchTheme,
    renderAlphabetGrid,
    loadUserProfiles
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
