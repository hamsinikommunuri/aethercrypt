# AETHERCRYPT // Themed Cipher & Codebook Platform

A production-grade, full-stack autonomous cryptographic workspace and themed codebook generator built with **Node.js**, **Express**, **SQLite**, and **Vanilla ES6+**.

---

## 🚀 Quick Start

### 1. Installation & Boot
From the project directory:
```bash
# Install dependencies (optional if running standalone with Node built-ins)
npm install

# Start the Express server
npm start
# or: node server/index.js
```

### 2. Access the Platform
Open your browser and navigate to:
```text
http://localhost:3000
```
*(You can also double-click `public/index.html` directly in any web browser to run in zero-dependency client-side offline mode!)*

---

## 🏛️ System Architecture

```text
themed-cipher-app/
├── server/
│   ├── index.js              # Express app bootstrap & static asset pipeline
│   ├── db.js                 # SQLite database connection & schema migrations
│   ├── routes/
│   │   ├── auth.js           # Password hashing, JWT token auth, session state
│   │   └── cipher.js         # AI generation, cryptographic endpoints, profiles
│   └── crypto/
│       ├── classical.js      # Caesar, Vigenère, Base64 & Substitution engines
│       └── aiGenerator.js    # 20 theme dictionaries, deterministic PRNG, LLM caller
├── public/
│   ├── index.html            # Single Page Application dashboard
│   ├── css/
│   │   ├── main.css          # Glassmorphism layouts, dual-editor grid, visual grid
│   │   ├── themes.css        # Dynamic CSS variable skinning engine (20 themes)
│   │   └── animations.css    # 3D card flips, mechanical decryption reels, glitch FX
│   └── js/
│       ├── app.js            # State store, theme switcher, auth & grid manager
│       ├── liveCipher.js     # Dual reactive editor, debounced streaming, 3D flips
│       ├── manualMode.js     # Mode 1 bijective mapping board & validators
│       ├── aiMode.js         # Mode 2 preset generator, custom prompt & salt tester
│       ├── classicalMode.js  # Mode 3 Caesar rotating disk, Vigenère trace, Base64
│       ├── audioFx.js        # Web Audio API procedural sound synthesizer
│       ├── demoTour.js       # Autonomous live tour showcase presenter
│       └── exportPoster.js   # html2canvas & jsPDF high-DPI A4 PDF and PNG exporter
├── tests/
│   ├── test-crypto.js        # Deep crypto unit tests & SQLite verification
│   └── test-api.js           # Express API route verification
├── package.json
└── README.md
```

---

## 🧩 Core Features & Functional Modules

### A. Unified Reactive Workspace (Shared Across All 3 Modes)
* **Dual Reactive Editors**:
  * Input Transmission Textarea $\leftrightarrow$ Transformed Output Display Box.
  * Real-time reactive transformation updated on input events with **50ms debouncing**.
  * Direction toggle button: `[ 🔒 Encrypt Mode ⇄ 🔓 Decrypt Mode ]`.
  * Quick actions: `Copy to Clipboard`, `Clear`, `Swap Input/Output`, Live Character & Word Counters.
* **Visual Cipher Alphabet Grid**:
  * 26-box interactive grid displaying the current mapping (`A ➔ [Symbol]`).
  * **Click-to-highlight**: clicking any letter in the grid immediately highlights all occurrences of that letter and its symbol inside the input and output boxes.

### B. Mode 1: Manual Language Creator
* **Interactive Mapping Board**: Customize character mappings for `A`–`Z` and digits `0`–`9`.
* **1-to-1 Bijection Enforcement**: Real-time validation warning notifies the user if duplicate symbols are assigned or unmapped letters exist.
* **Quick Fill Packs**: One-click apply Emoji, Nordic Runes, Egyptian Hieroglyphs, and Alchemical Sigils.
* **Symbol Shuffle & Reset**: Deterministic and randomized symbol permutations.
* **Persistence**: "Save Custom Language to Profile" writes mapping directly to SQLite `cipher_profiles`.

### C. Mode 2: AI Themed Language Generator
* **20 Built-In Themes**:
  1. 🏴‍☠️ Pirate Seadog
  2. ⚡ Cyberpunk 2099
  3. 𓀀 Ancient Egypt
  4. ⚗️ Medieval Alchemist
  5. 🌌 Deep Space Galaxy
  6. ⚙️ Steampunk Victorian
  7. ᚠ Nordic Elder Futhark
  8. ☣️ Biohazard Lab
  9. 🟩 Matrix Digital Rain
  10. 🕯️ Gothic Victorian
  11. 🔱 Atlantis Abyssal
  12. ⚔️ Feudal Samurai
  13. 🔮 Witchcraft Occult
  14. 👾 Alien Hivemind
  15. ☀️ Aztec Sun Temple
  16. ☢️ Post-Apocalyptic Wasteland
  17. 🌴 Neon Synthwave 80s
  18. ⚛️ Quantum Realm
  19. 🌲 Cryptid Redwood
  20. ✨ Celestial Empyrean
* **Deterministic User-Specific Salt**: Every generated alphabet is salted (`SHA256(theme + salt)`) so two operatives choosing "Pirate" receive distinct substitution keys.
* **Corrupted Decryption Security Logic**: If decryption is attempted using an incorrect user salt or key, the ciphertext is processed through a deterministic pseudorandom scrambler that returns plausible corrupted glyphs rather than plain failure.
* **LLM Engine & Offline Fallback**: Queries OpenAI/Anthropic APIs with strict JSON schema when an API key is present in `.env`, falling back smoothly to the deterministic offline dictionary engine when absent.

### D. Mode 3: Cyber Ciphers (Algorithmic Cryptography)
* **Caesar Cipher**:
  * Shift parameter selector ($K \in [1, 25]$) via synchronized range slider and number input.
  * Live rotating comparison row and angular offset indicator showing exact offset.
* **Vigenère Cipher**:
  * Custom alphanumeric keyword input.
  * Step-by-step visual trace table breaking down position, plaintext character, keyword character, shift formula, and output character.
* **Base64 RFC 4648**:
  * Full standard encode/decode.
  * Byte-level padding inspector showing 8-bit ASCII octets, 24-bit quantum blocks, 6-bit sextets, and '=' padding calculations.
* **Atbash Inversion**:
  * Biblical symmetric reversal involution ($A \leftrightarrow Z$) where encryption is identical to decryption: $E(E(x)) = x$.
  * Interactive mirrored Latin alphabet comparison strip.
* **Affine Algebra**:
  * Algebraic monoalphabetic substitution: $C \equiv (aP + b) \bmod 26$.
  * Configurable coprime slope selector ($a \in \{1, 3, 5, \dots, 25\}$) and intercept slider ($b \in [0, 25]$) with live modular inverse decryption.
* **Rail Fence Transposition**:
  * Depth-based zig-zag wave permutation across $N \in [2, 8]$ rails.
  * Live 2D wave matrix visualization tracking character trajectories, bounce vertices, wave period $2(N - 1)$, and rail extraction streams.
* **RSA Public-Key Cryptography**:
  * Asymmetric trapdoor one-way permutation: $C \equiv M^e \pmod n$ and $M \equiv C^d \pmod n$.
  * Interactive prime selector ($p, q$), totient calculation ($\phi(n) = (p-1)(q-1)$), coprime exponent validator ($e$), and private key derivation ($d$).
  * Visual Public Key $(e, n)$ vs. Private Key $(d, n)$ cards and step-by-step modular exponentiation trace table.
* **Playfair Cipher (Charles Wheatstone, 1854)**:
  * First historic literal digraph substitution cipher.
  * Interactive 5×5 polygraphic matrix generation ($I=J$ merge), custom key phrase input, and presets (`ROYAL`, `AETHER`).
  * Step-by-step digraph pairing and geometric trace engine evaluating Row shifts, Column shifts, and Rectangle corner swaps.
* **Hill Cipher (Lester S. Hill, 1929)**:
  * Polygraphic linear algebra substitution: $\mathbf{c} \equiv K \cdot \mathbf{p} \pmod{26}$.
  * Configurable $2 \times 2$ invertible matrix inputs with live determinant $\det(K)$ and invertibility badge ($\gcd(\det(K), 26) = 1$).
  * Presets (`[[3,3],[2,5]]`, `[[5,8],[17,3]]`, `[[7,8],[11,11]]`), modular inverse matrix $K^{-1}$, and step-by-step vector multiplication trace cards.

### E. Visual Polish, UX & High-DPI Exports
* **Cryptographic Observatory UI**: Clean cream base (`#F7F5F2`), pastel lavender/sage/peach surfaces, dark charcoal typography (`#1E1D24`), restrained glassmorphism, and responsive breakpoints down to 390px mobile with zero horizontal overflow.
* **Bespoke Vector Artwork**: Hand-crafted inline SVG illustrations for each mode (Floating Codebook, Radiant AI Core, Concentric Caesar Disk).
* **3D Letter-Flip Animation**: Transforms output into 3D card tokens that execute staggered CSS card flips (`transform: rotateY(180deg)`) over interval delays to simulate mechanical decryption reels.
* **Real-Time Frequency Analysis**: Dual-bar distribution comparison showing live ciphertext frequencies vs. standard English letter frequencies.
* **Procedural Web Audio Engine**: Synthesizes mechanical ticks on 3D flips, crystal chimes on alphabet generation, laser clicks on mode change, and header mute toggle.
* **Raycast Command Palette (`⌘K` / `Ctrl+K`)**: Instant fuzzy-search keyboard launcher for all modes, actions, and themes.
* **Autonomous Showcase Tour**: Guided self-running presentation demo showing the platform's core capabilities in real-time.
* **Printable A4 Codebook (PDF)**:
  * Generates high-DPI classified cipher manuals (Parchment, Cyberpunk, Sci-Fi) via `html2canvas` and `jsPDF`.
  * Contains themed header, 26-character visual reference table, operative ID, timestamp, and official decoding protocol instructions.
* **Shareable Transmission Card (PNG)**:
  * Generates high-resolution social cards formatted for WhatsApp/Instagram with custom branding and watermark.
* **Codebooks JSON Backup & Restore**:
  * Download all saved cipher profiles as an indented `.json` file or import external `.json` codebooks directly into SQLite and local storage.

---

## 🗄️ Database Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cipher_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  mapping_json TEXT NOT NULL,
  salt_key TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🧪 Testing

Run the test suite:
```bash
node tests/test-crypto.js
node tests/test-api.js
```
The test suite validates (**34 / 34 tests passing - 100% green**):
- Caesar cipher boundary shifts, ROT13, and visual alignment structures.
- Vigenère encryption/decryption, case preservation, and trace breakdown.
- Base64 RFC 4648 encoding, UTF-8 strings, and byte-level padding calculations.
- Atbash symmetric involution and case preservation.
- Affine algebraic substitution and modular inverse coprime validation.
- Rail fence zig-zag multi-rail transposition and wave matrix reconstruction.
- RSA keypair generation, coprimality, integer streams, and modular exponentiation.
- Playfair 5×5 digraph key matrix generation, rules (row, column, rectangle), and decryption.
- Hill 2×2 modular matrix invertibility, vector multiplication, and decryption.
- Substitution bijective consistency across Unicode emojis and runes.
- Bijection validator with duplicate symbol detection.
- All 20 preset themes verifying exactly 26 distinct, unique glyphs.
- Deterministic salt permutation ensuring user distinctness.
- Corrupted decryption scrambler security logic.
- Database schema CRUD and user password hashing.
- Express API HTTP routes, auth flow, profile persistence, and static serving.
