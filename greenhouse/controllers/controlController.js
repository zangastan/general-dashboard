const db      = require('../db/db');
const { authMiddleware } = require('../utils/jwt');
const audit   = require('../utils/audit');
const wsUtil  = require('../utils/ws');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function controlDevice(req, res, body) {
  try {
    const user = authMiddleware(req);
    const { device, action } = body;
    if (!device || !action) return send(res, 400, { error: 'device and action required' });

    // Log to actuator history
    await db.run(
      'INSERT INTO actuator_logs (device, action, user_id) VALUES (?, ?, ?)',
      [device, action, user.id]
    );

    // Queue command for ESP32 to pick up on next telemetry or /api/commands poll
    await db.run(
      'INSERT INTO device_commands (device, action, source) VALUES (?, ?, ?)',
      [device, action, 'dashboard']
    );

    await audit.log(user.id, 'DEVICE_CONTROL', `${device} set to ${action}`, req);

    // Broadcast actuator change to all dashboard clients immediately
    wsUtil.broadcast('actuator', { device, action, user: user.username, ts: new Date().toISOString() });

    send(res, 200, { message: `${device} → ${action}`, queued: true });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getLog(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all(`
      SELECT actuator_logs.*, users.username
      FROM actuator_logs
      LEFT JOIN users ON actuator_logs.user_id = users.id
      ORDER BY actuator_logs.timestamp DESC LIMIT 30
    `);
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

module.exports = { controlDevice, getLog };
