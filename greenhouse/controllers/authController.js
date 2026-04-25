const bcrypt = require('bcrypt');
const db = require('../db/db');
const { sign, authMiddleware } = require('../utils/jwt');
const audit = require('../utils/audit');

async function login(req, res, body) {
  const { username, password } = body;
  if (!username || !password) return send(res, 400, { error: 'Username and password required' });
  try {
    const user = await db.get('SELECT users.*, roles.name as role_name FROM users JOIN roles ON users.role_id = roles.id WHERE users.username = ?', [username]);
    if (!user) {
      await audit.log(null, 'FAILED_LOGIN', `Failed login attempt for: ${username}`, req);
      return send(res, 401, { error: 'Invalid username or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await audit.log(null, 'FAILED_LOGIN', `Wrong password for: ${username}`, req);
      return send(res, 401, { error: 'Invalid username or password' });
    }
    const token = sign({ id: user.id, username: user.username, role_id: user.role_id });
    await audit.log(user.id, 'LOGIN', `User ${username} logged in`, req);
    return send(res, 200, {
      token,
      user: { username: user.username, role_id: user.role_id, must_reset: user.must_reset_password }
    });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}

async function resetPassword(req, res, body) {
  const { username, oldPassword, newPassword } = body;
  if (!username || !oldPassword || !newPassword) return send(res, 400, { error: 'All fields required' });
  if (newPassword.length < 6) return send(res, 400, { error: 'New password too short' });
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return send(res, 404, { error: 'User not found' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return send(res, 401, { error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ?, must_reset_password = 0 WHERE id = ?', [hashed, user.id]);
    await audit.log(user.id, 'PASSWORD_RESET', `Password reset for ${username}`, req);
    return send(res, 200, { message: 'Password updated successfully' });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

module.exports = { login, resetPassword };
