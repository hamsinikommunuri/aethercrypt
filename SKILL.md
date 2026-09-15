---
name: themed-cipher-studio
description: >-
  Scaffolds, tests, and styles production-ready Themed Cipher & Codebook Platforms.
  Supports classical cryptographic algorithms (Caesar with rotating disk, Vigenère
  ribbon, Base64 padding visualizer), deterministic AI substitution languages with 20
  presets and user salting, 10/10 editorial observatory UI/UX design tokens, procedural
  Web Audio feedback, and high-DPI A4 PDF, PNG, and JSON codebook export pipelines.
---

# Themed Cipher Studio

## Overview
**Themed Cipher Studio** provides end-to-end specifications, architectural patterns, design tokens, and automation tools for engineering premium cryptographic web applications and secret language codebooks.

The core philosophy moves away from generic developer dashboards toward a **"Quiet, Luxurious Cryptographic Observatory"** (Apple + Linear + Arc + Raycast aesthetic with scientific rigor).

---

## Dependencies

* **Runtime**: Node.js (v18+)
* **Backend**: Express.js, `better-sqlite3`, `bcryptjs`, `dotenv`
* **Frontend**: Vanilla HTML5, modern CSS3 (CSS Grid, 3D perspective transforms), modern ES6+ JS
* **Client Export CDNs**: `html2canvas` (v1.4.1), `jspdf` (v2.5.1)
* **Referenced Skills**:
  * `credentials`: Handles optional LLM API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) for custom universe generation.
  * `generative_ui`: Inlines interactive visual cipher disks, frequency distribution bars, and SVG diagrams.
  * `agy-customizations`: Follows Antigravity customization discovery conventions.

---

## Quick Start

### 1. Inspect Themes and Design Tokens
```bash
# List all 20 pre-packaged deterministic themes
node scripts/scaffold_cipher_app.js list-themes

# Export the 26-character glyph dictionary for a specific theme
node scripts/scaffold_cipher_app.js export-dict --theme pirate --output pirate_codebook.json

# View the 10/10 Observatory design tokens
node scripts/scaffold_cipher_app.js tokens
```

### 2. Run Test Verification
```bash
# Run unit and API tests on an existing cipher app
node scripts/scaffold_cipher_app.js verify --dir .
```

---

## Utility Scripts

The CLI helper at `scripts/scaffold_cipher_app.js` exposes the following subcommands:

| Subcommand | Description | Example |
| :--- | :--- | :--- |
| `list-themes` | Lists all 20 deterministic themes with sample glyphs | `node scripts/scaffold_cipher_app.js list-themes` |
| `export-dict` | Exports substitution mapping (`A`–`Z`, `0`–`9`) | `node scripts/scaffold_cipher_app.js export-dict --theme cyberpunk` |
| `tokens` | Outputs Observatory color, typography, and motion tokens | `node scripts/scaffold_cipher_app.js tokens --output tokens.json` |
| `verify` | Executes `tests/test-crypto.js` and `tests/test-api.js` | `node scripts/scaffold_cipher_app.js verify --dir /path/to/app` |

---

## Core Workflows

### Workflow 1: Scaffolding a Full-Stack Cipher Application

1. **Database Schema (SQLite)**:
   Ensure two core tables exist:
   - `users`: `id`, `username`, `password_hash`, `created_at`
   - `cipher_profiles`: `id`, `user_id`, `theme_name`, `mapping_json`, `salt_key`, `created_at`
2. **Cryptographic Engines**:
   - **Caesar**: Shift calculation $(P + K) \bmod 26$ with dynamic angular offset.
   - **Vigenère**: Modular polyalphabetic addition with visual keyword alignment trace.
   - **Base64**: RFC 4648 standard encoding with 6-bit sextet padding inspector.
   - **Custom Substitution**: Bijective character mapping with strict 1-to-1 validation.
3. **Deterministic User Salting**:
   Always derive user permutations using:
   $$\text{Seed} = \text{SHA256}(\text{theme\_name} + \text{salt\_key})$$
   Pass this seed into a Linear Congruential Generator (LCG) to shuffle glyphs deterministically so distinct users receive unique languages.
4. **Corrupted Decryption Engine**:
   If decryption is attempted with a mismatched key or salt, run ciphertext through a deterministic pseudo-random scrambler rather than returning a hard error.

---

### Workflow 2: Applying the 10/10 Observatory UI/UX System

Transform raw interfaces by strictly applying the design tokens in `references/design_tokens.json`:

1. **Surface Palette**:
   - Canvas: Warm soft cream `#F7F5F2` (avoid dark neon cyberpunk or pink/purple glass).
   - Pastel Accents: Lavender `#DDD7F5`, Sage `#D8E8DF`, Peach `#F6DDD3`.
   - Typography: Dark charcoal `#1E1D24` (WCAG AAA compliant contrast).
2. **Product View Routing**:
   Separate into 3 clean stages:
   - **Stage 1 (Auth Portal)**: Glass card with operative codename and access key.
   - **Stage 2 (Observatory Home)**: Hero banner with 3 large editorial mode cards (large whitespace, custom inline SVG art, 28px border radius).
   - **Stage 3 (Dedicated Workspaces)**: Mode 1 (Glyph Atelier), Mode 2 (AI Cipher Forge), Mode 3 (Classical Cryptography Lab).
3. **Interactive Polish**:
   - **Message Lab**: Live dual-box reactive editor with 50ms debouncing.
   - **Frequency Analysis**: Live ciphertext distribution bars compared directly against standard English frequencies.
   - **3D Letter Flips**: Character tokens executing staggered `transform: rotateY(180deg)` flips.
   - **Procedural Audio**: Web Audio API oscillator synthesizers (ticks, chimes, laser clicks).
   - **Command Palette**: Raycast-style shortcut modal triggered via <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>.

---

### Workflow 3: Codebook Generation & JSON Portability

1. **A4 PDF Generation**:
   Use `html2canvas` and `jsPDF` to render styled classified manuals with 26-glyph reference tables, operative metadata, and decoding instructions across 3 themes (Parchment, Cyberpunk, Sci-Fi).
2. **Social PNG Card**:
   Render formatted square/landscape cards for WhatsApp/Instagram sharing.
3. **JSON Backup & Restore**:
   Serialize profiles into downloadable `.json` files and accept uploaded JSON files to synchronize across remote database and client storage.

---

## Offline Engine & Rate Limiting

* **LLM Prompts**: When generating bespoke themes with an LLM, enforce a strict JSON schema requiring 26 distinct Unicode characters.
* **Rate Limits**: If querying external AI APIs, throttle to $\le 1$ request per second with exponential backoff.
* **Offline Guarantee**: When API keys are absent or offline, always seamlessly fallback to the 20 pre-packaged dictionaries in `references/cipher_presets.json`.

---

## Common Mistakes & Guardrails

> [!CAUTION]
> 1. **Never use standard string `.split('')` for Unicode glyphs**: Multi-byte composite emojis (e.g., `🏴‍☠️`, `𓀀`) split into broken surrogate halves. Always use `Array.from(str)` or Unicode-aware regex `/\p{Emoji}|\p{L}|\S/gu`.
> 2. **Never destroy bijection**: Substitution ciphers must maintain a strict 1-to-1 mapping. Highlight duplicate assignments in real-time before saving.
> 3. **Avoid neon-on-black aesthetics**: Professional presentation requires restrained pastel glassmorphism, soft ambient shadows, and crisp charcoal typography.
