const express = require('express');
const path = require('path');
const http = require('http');

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is not loaded
}

const { router: authRouter } = require('./routes/auth');
const { router: cipherRouter } = require('./routes/cipher');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB schema on boot
try {
  getDb();
} catch (dbErr) {
  console.error('[SERVER] Warning: DB initialisation note:', dbErr.message);
}

// Global middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/cipher', cipherRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AetherCrypt Themed Cipher Platform',
    timestamp: new Date().toISOString(),
    llmConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Express server if run directly (and not on Vercel)
let server = null;
if (require.main === module && !process.env.VERCEL) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
=====================================================
  AETHERCRYPT // THEMED CIPHER & CODEBOOK PLATFORM
  STATUS : Running
  LOCAL  : http://localhost:${PORT}
  NETWORK: http://0.0.0.0:${PORT}
  MODES  : [1] Manual Creator
           [2] AI Themed Generator (20 Presets + LLM)
           [3] Cyber Ciphers (Caesar, Vigenère, Base64)
=====================================================
    `);
  });
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('[FATAL UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED PROMISE REJECTION]', reason);
});

module.exports = { app, server };
