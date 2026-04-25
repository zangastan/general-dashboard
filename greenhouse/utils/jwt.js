const jwt = require('jsonwebtoken');
const JWT_SECRET = 'greenhouse_secret_key_12345';

function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req) {
  const auth = req.headers['authorization'] || '';
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
  if (user.role_id !== 1) throw Object.assign(new Error('Admin access required'), { status: 403 });
  return user;
}

module.exports = { sign, verify, authMiddleware, adminOnly };
