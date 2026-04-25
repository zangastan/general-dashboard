const bcrypt = require('bcrypt');
const db = require('../db/db');
const { authMiddleware, adminOnly } = require('../utils/jwt');
const audit = require('../utils/audit');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function listUsers(req, res) {
  try {
    adminOnly(req);
    const rows = await db.all(`
      SELECT users.id, users.username, users.email, users.created_at, users.must_reset_password,
             roles.id as role_id, roles.name as role_name
      FROM users JOIN roles ON users.role_id = roles.id
      ORDER BY users.created_at DESC
    `);
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function createUser(req, res, body) {
  try {
    adminOnly(req);
    const { username, email, role_id, password } = body;
    if (!username || !password) return send(res, 400, { error: 'Username and password required' });
    if (password.length < 6) return send(res, 400, { error: 'Password must be at least 6 characters' });
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return send(res, 409, { error: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, role_id, password, must_reset_password) VALUES (?, ?, ?, ?, 1)',
      [username, email || null, role_id || 2, hashed]
    );
    // Log simulated email
    console.log(`[EMAIL SIM] New user created: ${username} | Default password: ${password} | Must reset on first login.`);
    const caller = authMiddleware(req);
    await audit.log(caller.id, 'USER_CREATED', `Created user: ${username}`, req);
    send(res, 201, { message: 'User created', id: result.lastID });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function deleteUser(req, res, username) {
  try {
    adminOnly(req);
    if (username === 'admin') return send(res, 403, { error: 'Cannot delete admin user' });
    const user = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) return send(res, 404, { error: 'User not found' });
    await db.run('DELETE FROM users WHERE username = ?', [username]);
    const caller = authMiddleware(req);
    await audit.log(caller.id, 'USER_DELETED', `Deleted user: ${username}`, req);
    send(res, 200, { message: 'User deleted' });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function adminResetPassword(req, res, body) {
  try {
    adminOnly(req);
    const { username, newPassword } = body;
    if (!username || !newPassword) return send(res, 400, { error: 'username and newPassword required' });
    if (newPassword.length < 6) return send(res, 400, { error: 'Password too short' });
    const user = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) return send(res, 404, { error: 'User not found' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ?, must_reset_password = 1 WHERE id = ?', [hashed, user.id]);
    console.log(`[EMAIL SIM] Password reset for: ${username} | Temp password: ${newPassword}`);
    const caller = authMiddleware(req);
    await audit.log(caller.id, 'PASSWORD_RESET', `Admin reset password for: ${username}`, req);
    send(res, 200, { message: 'Password reset successfully' });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

module.exports = { listUsers, createUser, deleteUser, adminResetPassword };
