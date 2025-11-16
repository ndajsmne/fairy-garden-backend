const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'revoked_tokens.json');

let revoked = new Set();

// load existing file if present
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE_PATH)) {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.forEach(t => revoked.add(t));
  }
} catch (e) {
  // ignore load errors
}

function persist() {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(Array.from(revoked), null, 2));
  } catch (e) {
    // ignore write errors in dev
  }
}

function revokeToken(token) {
  revoked.add(token);
  persist();
}

function isRevoked(token) {
  return revoked.has(token);
}

module.exports = { revokeToken, isRevoked };
