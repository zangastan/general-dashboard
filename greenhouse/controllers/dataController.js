const db = require('../db/db');
const { authMiddleware, adminOnly } = require('../utils/jwt');
const audit = require('../utils/audit');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function getAlerts(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50');
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function markRead(req, res, id) {
  try {
    authMiddleware(req);
    await db.run('UPDATE alerts SET is_read = 1 WHERE id = ?', [id]);
    send(res, 200, { message: 'Alert marked as read' });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getAuditLogs(req, res) {
  try {
    adminOnly(req);
    const rows = await db.all(`
      SELECT audit_logs.*, users.username
      FROM audit_logs
      LEFT JOIN users ON audit_logs.user_id = users.id
      ORDER BY audit_logs.timestamp DESC LIMIT 100
    `);
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getCameraMetadata(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all('SELECT * FROM camera_metadata ORDER BY timestamp DESC LIMIT 20');
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function triggerCapture(req, res) {
  try {
    const user = authMiddleware(req);
    // Record a camera trigger event — actual image analysis happens via the AI Analysis page
    // (browser webcam → /api/analysis). This endpoint queues a capture request.
    const filename = `cam_${Date.now()}.jpg`;
    const result   = 'Pending Analysis';
    await db.run(
      'INSERT INTO camera_metadata (filename, analysis_result) VALUES (?, ?)',
      [filename, result]
    );
    // Queue a camera_capture command so ESP32 knows a snapshot was requested
    await db.run(
      'INSERT INTO device_commands (device, action, source) VALUES (?, ?, ?)',
      ['camera', 'CAPTURE', 'dashboard']
    );
    await audit.log(user ? user.id : null, 'CAMERA_CAPTURE', `Trigger queued: ${filename}`, req);
    send(res, 201, { filename, analysis_result: result, queued: true });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getAutomationRules(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all('SELECT * FROM automation_rules ORDER BY id DESC');
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function createRule(req, res, body) {
  try {
    authMiddleware(req);
    const { name, trigger_sensor, condition, trigger_value, action_device, action_value } = body;
    if (!name || !trigger_sensor || !condition || trigger_value == null || !action_device || !action_value) {
      return send(res, 400, { error: 'All fields required' });
    }
    const result = await db.run(
      'INSERT INTO automation_rules (name, trigger_sensor, condition, trigger_value, action_device, action_value, is_active) VALUES (?,?,?,?,?,?,1)',
      [name, trigger_sensor, condition, trigger_value, action_device, action_value]
    );
    send(res, 201, { message: 'Rule created', id: result.lastID });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function toggleRule(req, res, id, body) {
  try {
    authMiddleware(req);
    const { active } = body;
    await db.run('UPDATE automation_rules SET is_active = ? WHERE id = ?', [active ? 1 : 0, id]);
    send(res, 200, { message: 'Rule updated' });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function deleteRule(req, res, id) {
  try {
    authMiddleware(req);
    await db.run('DELETE FROM automation_rules WHERE id = ?', [id]);
    send(res, 200, { message: 'Rule deleted' });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getStats(req, res) {
  try {
    authMiddleware(req);
    const readings = await db.get('SELECT COUNT(*) as cnt FROM sensors');
    const alerts   = await db.get('SELECT COUNT(*) as cnt FROM alerts');
    const upSecs   = Math.floor(process.uptime());
    const h = Math.floor(upSecs / 3600), m = Math.floor((upSecs % 3600) / 60), s = upSecs % 60;
    send(res, 200, { readings: readings.cnt, alerts: alerts.cnt, uptime: `${h}h ${m}m ${s}s` });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

module.exports = {
  getAlerts, markRead, getAuditLogs,
  getCameraMetadata, triggerCapture,
  getAutomationRules, createRule, toggleRule, deleteRule,
  getStats
};
