const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aethercrypt-secret-key-2026';

// Safe password hashing using Node's standard crypto.scryptSync
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (e) {
    return false;
  }
}

// Lightweight token sign / verify
function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
  } catch (e) {
    return null;
  }
}

// Middleware to authenticate requests
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies && req.cookies.token);
  const decoded = verifyToken(token);
  if (decoded && decoded.userId) {
    req.user = decoded;
  }
  next();
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || username.trim().length < 2 || password.length < 4) {
    return res.status(400).json({ error: 'Username (2+ chars) and password (4+ chars) are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const db = getDb();

  try {
    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists. Please pick another or log in.' });
    }

    const id = 'usr_' + crypto.randomUUID();
    const password_hash = hashPassword(password);
    db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, cleanUsername, password_hash);

    const token = signToken({ userId: id, username: cleanUsername });
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id, username: cleanUsername }
    });
  } catch (err) {
    console.error('[AUTH SIGNUP ERROR]', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null, message: 'Unauthenticated' });
  }
  const db = getDb();
  try {
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ user: null, error: 'User not found' });
    }
    const profiles = db.prepare('SELECT * FROM cipher_profiles WHERE user_id = ?').all(user.id);
    return res.json({ user, profiles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = { router, authMiddleware, verifyToken };
