const fs = require('fs');
const path = require('path');

const isVercel = Boolean(process.env.VERCEL);
const DB_PATH = isVercel
  ? path.join('/tmp', 'ciphers.db')
  : path.join(__dirname, '..', 'ciphers.db');

let dbInstance = null;

// Initialize database with table definitions
function initSchema(db) {
  db.exec(`
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

    INSERT OR IGNORE INTO users (id, username, password_hash)
    VALUES ('guest', 'guest', 'locked');
  `);
}

// Universal SQLite adapter interface
function getDb() {
  if (dbInstance) return dbInstance;

  // 1. Try better-sqlite3
  try {
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
    dbInstance = db;
    console.log('[DB] Connected to SQLite via better-sqlite3:', DB_PATH);
    return dbInstance;
  } catch (errBetter) {
    console.warn('[DB] better-sqlite3 unavailable or not compiled, checking node:sqlite...', errBetter.message);
  }

  // 2. Try Node built-in node:sqlite (Node 22+)
  try {
    const { DatabaseSync } = require('node:sqlite');
    if (DatabaseSync) {
      const db = new DatabaseSync(DB_PATH);
      initSchema(db);
      dbInstance = db;
      console.log('[DB] Connected to SQLite via node:sqlite (DatabaseSync):', DB_PATH);
      return dbInstance;
    }
  } catch (errNode) {
    console.warn('[DB] node:sqlite unavailable:', errNode.message);
  }

  // 3. Fallback: Robust file-backed SQLite-compatible engine using JSON storage
  console.log('[DB] Using file-backed fallback database engine at:', DB_PATH + '.json');
  const JSON_PATH = DB_PATH + '.json';
  
  let store = { users: [], cipher_profiles: [] };
  if (fs.existsSync(JSON_PATH)) {
    try {
      store = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
      if (!store.users) store.users = [];
      if (!store.cipher_profiles) store.cipher_profiles = [];
    } catch (e) {
      console.error('[DB] Failed to read JSON store, resetting:', e);
    }
  }

  function saveStore() {
    fs.writeFileSync(JSON_PATH, JSON.stringify(store, null, 2), 'utf8');
  }

  dbInstance = {
    exec(sql) {
      // Schema initialized in memory
      saveStore();
    },
    pragma(cmd) {},
    prepare(sql) {
      const cleanSql = sql.trim().replace(/\s+/g, ' ');
      return {
        run(...params) {
          if (/INSERT INTO users/i.test(cleanSql)) {
            const [id, username, password_hash] = params;
            // Check unique username
            if (store.users.some(u => u.username === username)) {
              const err = new Error('UNIQUE constraint failed: users.username');
              err.code = 'SQLITE_CONSTRAINT';
              throw err;
            }
            const record = { id, username, password_hash, created_at: new Date().toISOString() };
            store.users.push(record);
            saveStore();
            return { changes: 1 };
          }
          if (/INSERT INTO cipher_profiles/i.test(cleanSql)) {
            const [id, user_id, theme_name, mapping_json, salt_key] = params;
            const record = { id, user_id, theme_name, mapping_json, salt_key, created_at: new Date().toISOString() };
            store.cipher_profiles.push(record);
            saveStore();
            return { changes: 1 };
          }
          if (/DELETE FROM cipher_profiles WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
            const [id, user_id] = params;
            const initialLen = store.cipher_profiles.length;
            store.cipher_profiles = store.cipher_profiles.filter(p => !(p.id === id && p.user_id === user_id));
            saveStore();
            return { changes: initialLen - store.cipher_profiles.length };
          }
          if (/DELETE FROM cipher_profiles WHERE id = \?/i.test(cleanSql)) {
            const [id] = params;
            const initialLen = store.cipher_profiles.length;
            store.cipher_profiles = store.cipher_profiles.filter(p => p.id !== id);
            saveStore();
            return { changes: initialLen - store.cipher_profiles.length };
          }
          return { changes: 0 };
        },
        get(...params) {
          if (/SELECT \* FROM users WHERE username = \?/i.test(cleanSql)) {
            const [username] = params;
            return store.users.find(u => u.username === username);
          }
          if (/SELECT \* FROM users WHERE id = \?/i.test(cleanSql)) {
            const [id] = params;
            return store.users.find(u => u.id === id);
          }
          if (/SELECT \* FROM cipher_profiles WHERE id = \?/i.test(cleanSql)) {
            const [id] = params;
            return store.cipher_profiles.find(p => p.id === id);
          }
          return undefined;
        },
        all(...params) {
          if (/SELECT \* FROM cipher_profiles WHERE user_id = \?/i.test(cleanSql)) {
            const [user_id] = params;
            return store.cipher_profiles
              .filter(p => p.user_id === user_id)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          if (/SELECT \* FROM cipher_profiles/i.test(cleanSql)) {
            return store.cipher_profiles.slice().reverse();
          }
          return [];
        }
      };
    }
  };

  return dbInstance;
}

module.exports = { getDb };
