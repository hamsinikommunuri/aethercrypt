const crypto = require('crypto');
const https = require('https');

/**
 * 20 Pre-packaged Themed Glyph Dictionaries
 * Every dictionary contains 26 distinct, unique Unicode characters / glyphs
 */
const PRESET_THEMES = {
  pirate: {
    name: 'Pirate Seadog',
    description: 'Nautical treasures, galleons, and sea curse symbols',
    palette: { bg: '#2b1d0c', panel: '#4a3525', accent: '#d4af37', text: '#f3e5ab', border: '#8b6914' },
    glyphs: ['⚓', '☠', '🏴‍☠️', '🦜', '🪙', '🗺️', '⚔️', '🧭', '🥃', '⛵', '💣', '🐙', '💎', '🏝️', '🦈', '🪵', '🗝️', '🍺', '🌊', '🍖', '🎣', '🪝', '🚩', '📜', '🔭', '💰'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  cyberpunk: {
    name: 'Cyberpunk 2099',
    description: 'Neon circuitry, synthetic augments, and hacker protocols',
    palette: { bg: '#0d0221', panel: '#0f084b', accent: '#00f0ff', text: '#f0e6ff', border: '#ff007f' },
    glyphs: ['⚡', '💾', '🤖', '🕶️', '🧬', '📡', '🔋', '🕹️', '💻', '🖲️', '📟', '🏙️', '🟣', '🟢', '🌐', '💉', '🎛️', '🦾', '🦿', '🛰️', '📶', '🔌', '💿', '🚀', '💡', '🥽'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  ancient_egypt: {
    name: 'Ancient Egypt',
    description: 'Hieroglyphs from the Valley of the Pharaohs',
    palette: { bg: '#1c150c', panel: '#382a17', accent: '#e5b84c', text: '#faebd7', border: '#b8860b' },
    glyphs: ['𓀀', '𓁐', '𓃠', '𓆣', '𓇋', '𓈖', '𓉐', '𓊹', '𓋹', '𓌕', '𓍯', '𓎛', '𓏏', '𓐍', '𓐎', '𓏲', '𓂋', '𓂝', '𓃀', '𓄿', '𓅓', '𓆓', '𓇯', '𓈗', '𓉔', '𓊃'],
    digits: ['𓏺', '𓏻', '𓏼', '𓏽', '𓏾', '𓏿', '𓐀', '𓐁', '𓐂', '𓎆']
  },
  medieval_alchemist: {
    name: 'Medieval Alchemist',
    description: 'Occult elixirs, philosopher stones, and grimoire sigils',
    palette: { bg: '#1f1510', panel: '#38271e', accent: '#c8963e', text: '#e8d8c8', border: '#784421' },
    glyphs: ['⚗️', '🧪', '🔮', '📜', '🕯️', '🗝️', '🛡️', '⚔️', '👑', '🧙', '🐉', '🍷', '⚜️', '🪙', '🏰', '🪶', '📖', '🗡️', '🩸', '🕸️', '⚖️', '🧭', '⌛', '💍', '🪵', '🔔'],
    digits: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ']
  },
  deep_space: {
    name: 'Deep Space Galaxy',
    description: 'Cosmic nebulae, wormholes, and astral constellations',
    palette: { bg: '#050510', panel: '#11142d', accent: '#7928ca', text: '#e2e8f0', border: '#4c1d95' },
    glyphs: ['🌌', '🪐', '🛸', '🌠', '🛰️', '🚀', '🌑', '☄️', '🔭', '👽', '⚛️', '💫', '🌟', '🌕', '🕳️', '☀️', '🌐', '📡', '👾', '🌍', '🌒', '🌓', '🌔', '🌗', '🌘', '♾️'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  steampunk: {
    name: 'Steampunk Victorian',
    description: 'Brass cogs, steam boilers, and clockwork automata',
    palette: { bg: '#211812', panel: '#3d2e24', accent: '#cd7f32', text: '#eedc82', border: '#8b5a2b' },
    glyphs: ['⚙️', '🕰️', '🚂', '🎩', '🔧', '🧭', '🥽', '🕯️', '🗝️', '🧪', '📜', '🧲', '🔦', '⏱️', '🪙', '🗜️', '🔨', '📻', '⚖️', '🖋️', '🪚', '🪜', '🧱', '💡', '🪓', '🔩'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  nordic_runes: {
    name: 'Nordic Elder Futhark',
    description: 'Viking runes carved into ancient Scandinavian monoliths',
    palette: { bg: '#14181a', panel: '#222d32', accent: '#64b5f6', text: '#eceff1', border: '#37474f' },
    glyphs: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', 'ᛠ', 'ᛡ'],
    digits: ['ᛁ', '᛬', '᛭', 'ᛮ', 'ᛯ', 'ᛰ', 'ᛱ', 'ᛲ', 'ᛳ', 'ᛴ']
  },
  biohazard: {
    name: 'Biohazard Lab',
    description: 'Synthetic pathogens, centrifuge vials, and toxic quarantine',
    palette: { bg: '#0f1710', panel: '#1a2e1d', accent: '#00ff66', text: '#e6ffe6', border: '#107c41' },
    glyphs: ['☣️', '🧬', '🧫', '💉', '🔬', '🧪', '⚠️', '🧯', '☢️', '🦠', '💊', '🩸', '🧤', '🧼', '🥼', '😷', '🧻', '🩺', '🪣', '🧲', '🌡️', '🏥', '🫀', '🫁', '💀', '⚰️'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  matrix: {
    name: 'Matrix Digital Rain',
    description: 'Cascading green code characters and digital glyph fragments',
    palette: { bg: '#030a04', panel: '#081c0c', accent: '#00ff41', text: '#d4ffd9', border: '#008f11' },
    glyphs: ['0', '1', '░', '▒', '▓', 'ｦ', 'ｱ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ', 'ﾀ', 'ﾂ', 'ﾃ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ'],
    digits: ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  },
  gothic_victorian: {
    name: 'Gothic Victorian',
    description: 'Candlelit crypts, black lace, ravens, and velvet coffins',
    palette: { bg: '#120b12', panel: '#261726', accent: '#b03060', text: '#e6d8e6', border: '#5c1236' },
    glyphs: ['🕯️', '🦇', '🍷', '🗝️', '🥀', '🕸️', '⏳', '🏰', '🪞', '🖤', '🌙', '🗡️', '🩸', '💍', '⚰️', '🪦', '🪶', '📜', '🎩', '🎻', '♟️', '🪆', '🫀', '🪟', '🍂', '🪔'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  atlantis_ocean: {
    name: 'Atlantis Abyssal',
    description: 'Sunken marble cities, bioluminescent trenches, and tridents',
    palette: { bg: '#031424', panel: '#08253d', accent: '#00d2ff', text: '#e0f7fa', border: '#007799' },
    glyphs: ['🔱', '🌊', '🐚', '🦈', '🐬', '🧜', '🪸', '🫧', '🦑', '🐙', '🐠', '🐋', '⚓', '🏝️', '🪼', '🦪', '🦞', '🦀', '🐢', '🧭', '💎', '🧊', '🏖️', '🤿', '🛶', '🪨'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  feudal_samurai: {
    name: 'Feudal Samurai',
    description: 'Cherry blossom petals, forged steel katanas, and shinto gates',
    palette: { bg: '#1c1012', panel: '#381c20', accent: '#ff4d4d', text: '#fff0f0', border: '#991b1b' },
    glyphs: ['⚔️', '🏯', '🌸', '👺', '🥷', '🎏', '🎋', '⛩️', '🥋', '🏮', '🍵', '🍶', '🍙', '🥢', '🗻', '🐅', '🐉', '🏹', '🛡️', '🎴', '📜', '🎐', '🪵', '🎎', '🪭', '👘'],
    digits: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  },
  witchcraft_occult: {
    name: 'Witchcraft Occult',
    description: 'Hollow moondust, raven feathers, and tarot divination',
    palette: { bg: '#130c1c', panel: '#27173a', accent: '#b76e79', text: '#f3e8ff', border: '#6b21a8' },
    glyphs: ['🔮', '🌙', '🕯️', '🧹', '👁️', '🪶', '📜', '🗝️', '🍄', '🖤', '🐍', '🪞', '🪵', '🪦', '🕷️', '🥀', '🍵', '📿', '🦴', '🏺', '⏳', '🪬', '🧿', '💫', '✨', '🌑'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  alien_hive: {
    name: 'Alien Hivemind',
    description: 'Xenomorphic brood chambers, chitin pods, and cosmic spores',
    palette: { bg: '#08170c', panel: '#112b18', accent: '#39ff14', text: '#d9f99d', border: '#15803d' },
    glyphs: ['👾', '🛸', '👽', '🧬', '☄️', '🧪', '👁️', '🕸️', '🦠', '🥚', '🦗', '🦂', '🪱', '🫀', '🧫', '🕳️', '📡', '💥', '⚡', '🪐', '🌌', '🩸', '🪳', '☣️', '🌋', '🟢'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  aztec_sun: {
    name: 'Aztec Sun Temple',
    description: 'Gold solar calendar, obsidian macuahuitl, and quetzal plumes',
    palette: { bg: '#211306', panel: '#3f250e', accent: '#ff9900', text: '#ffeedd', border: '#b45309' },
    glyphs: ['☀️', '🐆', '🦅', '🌽', '🏛️', '🗿', '🏺', '🐍', '🔥', '🪙', '🏹', '🌿', '🪵', '🩸', '👑', '🛡️', '🪶', '🌕', '🌵', '🪓', '🪞', '🪨', '🌾', '🌋', '👁️', '💫'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  post_apocalyptic: {
    name: 'Post-Apocalyptic Wasteland',
    description: 'Barbed wire barricades, rusted barrels, and radioactive dust',
    palette: { bg: '#17120e', panel: '#30261f', accent: '#e65100', text: '#ebdccb', border: '#78350f' },
    glyphs: ['☢️', '💀', '⛽', '🌪️', '🛢️', '⛓️', '🏜️', '🔧', '🏚️', '🚗', '🦴', '🧱', '🪚', '🪓', '🪝', '💣', '🧰', '🩹', '🚬', '🔋', '🥫', '📻', '🗝️', '🥽', '🪖', '🥩'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  neon_synthwave: {
    name: 'Neon Synthwave 80s',
    description: 'Palm tree sunsets, chrome supercars, and cassette nostalgia',
    palette: { bg: '#18022b', panel: '#310656', accent: '#ff007f', text: '#ffe6ff', border: '#ff7700' },
    glyphs: ['🌴', '🕶️', '📼', '🌆', '🏎️', '🕹️', '🦩', '🍕', '🍸', '🎹', '🎧', '💾', '📻', '🏙️', '🌇', '🛼', '🟣', '🟪', '⚡', '🪩', '🎆', '🐬', '🍹', '🛹', '🌃', '👾'],
    digits: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  },
  quantum_realm: {
    name: 'Quantum Realm Subatomic',
    description: 'Superposition orbitals, entanglement spins, and flux coils',
    palette: { bg: '#050c1e', panel: '#0d1d42', accent: '#38bdf8', text: '#e0f2fe', border: '#1e40af' },
    glyphs: ['⚛️', '🌀', '🔬', '🧲', '🌐', '🌌', '💡', '⚡', '♾️', '🔮', '💫', '🪞', '🧬', '📡', '🛸', '🚀', '🧪', '🪐', '🔭', '💥', '🧊', '🕯️', '🕳️', '🧭', '⏱️', '🗝️'],
    digits: ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  },
  cryptid_woods: {
    name: 'Cryptid Redwood Forest',
    description: 'Glowing moss, misty pine needles, and horned silhouette eyes',
    palette: { bg: '#0b160e', panel: '#152b1b', accent: '#4ade80', text: '#dcfce7', border: '#166534' },
    glyphs: ['🌲', '🐾', '🦉', '🌕', '🏕️', '🦌', '🐺', '🍄', '🪓', '🪵', '🍃', '🍂', '🦇', '🐻', '🐍', '🪹', '🪲', '🪨', '🔦', '🗺️', '🥾', '🕸️', '🌿', '🪱', '👁️', '👣'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  },
  celestial_angels: {
    name: 'Celestial Empyrean',
    description: 'Seraphim wings, golden halos, and radiant divine script',
    palette: { bg: '#17140b', panel: '#332c19', accent: '#ffd700', text: '#fffdf0', border: '#a16207' },
    glyphs: ['✨', '🪽', '🕊️', '👑', '🎺', '🌟', '🪞', '⚜️', '☀️', '⛅', '🌈', '🕯️', '📖', '📜', '🛡️', '⚔️', '🤍', '🔔', '💎', '🪷', '🏛️', '📿', '🪐', '💫', '👼', '⛪'],
    digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
  }
};

/**
 * Deterministic Pseudo-Random Number Generator based on Seed (LCG)
 */
function createPrng(seedStr) {
  const hash = crypto.createHash('sha256').update(String(seedStr)).digest();
  let state = hash.readUInt32BE(0);
  return function() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates Shuffle using Salted PRNG
 */
function shuffleArray(arr, salt) {
  const result = [...arr];
  const rand = createPrng(salt);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 26-character bijective mapping for A-Z (and 0-9)
 * Applies user-specific salt to ensure two users selecting "Pirate" receive distinct substitution maps
 */
function generateThemedAlphabet(themeKey, customPrompt = '', userSalt = 'default-salt') {
  const theme = PRESET_THEMES[themeKey] || PRESET_THEMES.cyberpunk;
  let baseGlyphs = [...theme.glyphs];

  // If customPrompt is given, we can procedurally select/blend symbols or permute
  const combinedSeed = `${themeKey}:${customPrompt.trim()}:${userSalt}`;
  const permutedGlyphs = shuffleArray(baseGlyphs, combinedSeed);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const mapping = {};

  alphabet.forEach((letter, idx) => {
    mapping[letter] = permutedGlyphs[idx];
  });

  // Digits 0-9
  const digits = '0123456789'.split('');
  const permutedDigits = shuffleArray(theme.digits, combinedSeed + ':digits');
  digits.forEach((digit, idx) => {
    mapping[digit] = permutedDigits[idx];
  });

  return {
    themeKey,
    themeName: theme.name,
    palette: theme.palette,
    saltUsed: userSalt,
    mapping,
    glyphs: permutedGlyphs
  };
}

/**
 * Optional LLM query with strict JSON schema if API keys are present
 */
async function queryLlmTheme(promptText, apiKey, provider = 'openai') {
  if (!apiKey) {
    throw new Error('No API key provided for LLM');
  }

  const isAnthropic = provider === 'anthropic' || apiKey.startsWith('sk-ant');

  if (isAnthropic) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: 'You are an ancient cryptographer. You must respond with valid JSON containing exactly: {"themeName": "Theme Name", "glyphs": ["26 unique distinct symbols/emojis"]}',
        messages: [
          { role: 'user', content: `Provide 26 unique Unicode glyphs or emojis for letters A-Z for theme: ${promptText}. Respond only with valid JSON.` }
        ]
      });

      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.content[0].text;
            const match = content.match(/\{[\s\S]*\}/);
            const result = JSON.parse(match ? match[0] : content);
            if (Array.isArray(result.glyphs) && result.glyphs.length >= 26) {
              resolve(result);
            } else {
              reject(new Error('Anthropic LLM did not return 26 glyphs'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('LLM request timed out')); });
      req.write(postData);
      req.end();
    });
  }

  // Implementation supporting OpenAI JSON Schema
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an ancient cryptographer. Provide 26 UNIQUE, distinct, theme-fitting Unicode glyphs or emojis for characters A-Z, matching the user theme.'
        },
        { role: 'user', content: promptText }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'cipher_alphabet',
          schema: {
            type: 'object',
            properties: {
              glyphs: {
                type: 'array',
                items: { type: 'string' },
                description: 'Exactly 26 unique Unicode glyphs or emojis'
              },
              themeName: { type: 'string' }
            },
            required: ['glyphs', 'themeName'],
            additionalProperties: false
          },
          strict: true
        }
      },
      temperature: 0.7
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0].message.content;
          const result = JSON.parse(content);
          if (Array.isArray(result.glyphs) && result.glyphs.length >= 26) {
            resolve(result);
          } else {
            reject(new Error('LLM did not return 26 glyphs'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM request timed out'));
    });
    req.write(postData);
    req.end();
  });
}

module.exports = {
  PRESET_THEMES,
  generateThemedAlphabet,
  queryLlmTheme,
  shuffleArray
};
