const db = require('../db/db');
const { authMiddleware } = require('../utils/jwt');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function getLatest(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all(
      'SELECT type, ROUND(value,2) as value, unit, timestamp FROM sensors WHERE id IN (SELECT MAX(id) FROM sensors GROUP BY type)'
    );
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getHistory(req, res, query) {
  try {
    authMiddleware(req);
    const type = query.type || null;
    const from = query.from || null;
    const to   = query.to   || null;
    let sql = 'SELECT * FROM sensors WHERE 1=1';
    const params = [];
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (from) { sql += ' AND date(timestamp) >= ?'; params.push(from); }
    if (to)   { sql += ' AND date(timestamp) <= ?'; params.push(to); }
    sql += ' ORDER BY timestamp DESC LIMIT 100';
    const rows = await db.all(sql, params);
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

module.exports = { getLatest, getHistory };
