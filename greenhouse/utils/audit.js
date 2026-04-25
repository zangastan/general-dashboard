const db = require('../db/db');

async function log(userId, action, details, req) {
  try {
    const ip = (req && (req.headers['x-forwarded-for'] || req.socket?.remoteAddress)) || null;
    await db.run(
      'INSERT INTO audit_logs (action, details, user_id, ip_address) VALUES (?, ?, ?, ?)',
      [action, details, userId || null, ip]
    );
  } catch (e) {
    console.error('[Audit] Failed to log:', e.message);
  }
}

module.exports = { log };
