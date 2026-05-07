/**
 * utils/auth.js
 * Unified authentication module.
 *  - authMiddleware(req)   → verifies Bearer JWT for human users
 *  - adminOnly(req)        → same + admin role check
 *  - verifyDeviceKey(req)  → verifies X-Device-Key header for ESP32
 */

const jwt = require('jsonwebtoken');

/* ── JWT SECRET ───────────────────────────────────────────────── */
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('[AUTH] ⚠️  JWT_SECRET not set in environment! Using insecure default. Set it in .env before production use.');
  return 'greenhouse_secret_key_CHANGE_ME';
})();

/* ── DEVICE API KEY ───────────────────────────────────────────── */
const DEVICE_API_KEY = process.env.DEVICE_API_KEY || (() => {
  console.warn('[AUTH] ⚠️  DEVICE_API_KEY not set in environment! Using insecure default.');
  return 'ESP32_GH_PROD_KEY_CHANGE_ME';
})();

/* ── JWT HELPERS ──────────────────────────────────────────────── */
function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

/* ── USER AUTH MIDDLEWARE ─────────────────────────────────────── */
function authMiddleware(req) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw Object.assign(new Error('Missing token'), { status: 401 });
  try {
    return verify(token);
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { status: 403 });
  }
}

function adminOnly(req) {
  const user = authMiddleware(req);
  if (user.role_id !== 1)
    throw Object.assign(new Error('Admin access required'), { status: 403 });
  return user;
}

/* ── DEVICE AUTH MIDDLEWARE ───────────────────────────────────── */
function verifyDeviceKey(req) {
  const key = req.headers['x-device-key'] || '';
  if (!key || key !== DEVICE_API_KEY) {
    throw Object.assign(new Error('Invalid or missing device API key'), { status: 401 });
  }
  return true;
}

module.exports = { sign, verify, authMiddleware, adminOnly, verifyDeviceKey, JWT_SECRET };
