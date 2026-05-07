'use strict';

/* ── LOAD .env FILE ───────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.trim().split('=');
    if (k && !k.startsWith('#') && rest.length) process.env[k] = rest.join('=');
  });
}

/* ── CORE MODULES ─────────────────────────────────────────────── */
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const { Server } = require('socket.io');

/* ── CONTROLLERS ──────────────────────────────────────────────── */
const authCtrl = require('./controllers/authController');
const sensorCtrl = require('./controllers/sensorController');
const ctrlCtrl = require('./controllers/controlController');
const userCtrl = require('./controllers/userController');
const dataCtrl = require('./controllers/dataController');
const reportCtrl = require('./controllers/reportController');
const analysisCtrl = require('./controllers/analysisController');
const telemetryCtrl = require('./controllers/telemetryController');
const esp32Ctrl = require('./controllers/esp32DataController');

/* ── UTILS ────────────────────────────────────────────────────── */
const wsUtil = require('./utils/ws');
const { authMiddleware } = require('./utils/auth');

let io; // Global socket.io instance

/* ── CONFIG ───────────────────────────────────────────────────── */
const PORT = parseInt(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

/* ── MIME MAP ─────────────────────────────────────────────────── */
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/* ── BODY PARSER ──────────────────────────────────────────────── */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => raw += c.toString());
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/* ── STATIC FILE SERVER ───────────────────────────────────────── */
function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}

/* ── CORS HEADERS ─────────────────────────────────────────────── */
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Key');
}

/* ── JSON RESPONSE HELPER ─────────────────────────────────────── */
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/* ── HTTP ROUTER ──────────────────────────────────────────────── */
async function router(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;
  const method = req.method;

  /* ── API ROUTES ───────────────────────────────────────────── */
  if (pathname.startsWith('/api')) {
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try { body = await readBody(req); } catch { /* ignore parse errors */ }
    }

    /* ── Device / ESP32 endpoints (X-Device-Key auth) ── */
    if (method === 'POST' && pathname === '/api/telemetry')
      return telemetryCtrl.ingestTelemetry(req, res, body);
    if (method === 'GET' && pathname === '/api/commands')
      return telemetryCtrl.getPendingCommands(req, res);

    /* ── WebSocket status (for polling fallback health check) ── */
    if (method === 'GET' && pathname === '/api/ws-status') {
      return sendJSON(res, 200, {
        ws_clients: wsUtil.clientCount(),
        server_time: new Date().toISOString(),
      });
    }

    /* ── Auth ── */
    if (method === 'POST' && pathname === '/api/auth/login')
      return authCtrl.login(req, res, body);
    if (method === 'POST' && pathname === '/api/auth/reset-password')
      return authCtrl.resetPassword(req, res, body);

    /* ── AI Analysis ── */
    if (pathname === '/api/analysis' || pathname === '/api/analysis/') {
      if (method === 'GET') return analysisCtrl.listRecords(req, res);
      if (method === 'POST') return analysisCtrl.createRecord(req, res, body);
    }
    if (method === 'GET' && pathname.startsWith('/api/analysis/')) {
      const parts = pathname.split('/');
      const id = parts[3];
      if (parts[4] === 'export') {
        if (query.format === 'pdf') return analysisCtrl.exportPDF(req, res, id);
        return analysisCtrl.exportCSV(req, res, id);
      }
      if (id) return analysisCtrl.getRecord(req, res, id);
    }
    if (method === 'GET' && pathname === '/api/analysis-export') {
      if (query.format === 'pdf') return analysisCtrl.exportPDF(req, res);
      return analysisCtrl.exportCSV(req, res);
    }

    /* ── Sensors (Legacy/General) ── */
    if (method === 'GET' && pathname === '/api/sensors')
      return sensorCtrl.getLatest(req, res);

    /* ── ESP32 Real-time Data (Strict Schema) ── */
    if (method === 'POST' && pathname === '/api/sensor-data')
      return esp32Ctrl.postSensorData(req, res, body);
    if (method === 'GET' && pathname === '/api/sensor-data/latest')
      return esp32Ctrl.getLatestSensorData(req, res);
    if (method === 'GET' && pathname === '/api/sensor-history')
      return sensorCtrl.getHistory(req, res, query);

    /* ── Control ── */
    if (method === 'POST' && pathname === '/api/control')
      return esp32Ctrl.postControl(req, res, body);
    if (method === 'GET' && pathname === '/api/control/pending')
      return esp32Ctrl.getPendingControl(req, res);
    if (method === 'GET' && pathname === '/api/actuator-log')
      return ctrlCtrl.getLog(req, res);

    /* ── Users ── */
    if (method === 'GET' && pathname === '/api/users')
      return userCtrl.listUsers(req, res);
    if (method === 'POST' && pathname === '/api/users')
      return userCtrl.createUser(req, res, body);
    if (method === 'POST' && pathname === '/api/users/admin-reset')
      return userCtrl.adminResetPassword(req, res, body);
    if (method === 'DELETE' && pathname.startsWith('/api/users/')) {
      const username = pathname.split('/api/users/')[1];
      return userCtrl.deleteUser(req, res, username);
    }

    /* ── Alerts ── */
    if (method === 'GET' && pathname === '/api/alerts')
      return dataCtrl.getAlerts(req, res);
    if (method === 'POST' && pathname.match(/^\/api\/alerts\/\d+\/read$/)) {
      const id = pathname.split('/')[3];
      return dataCtrl.markRead(req, res, id);
    }

    /* ── Camera ── */
    if (method === 'GET' && pathname === '/api/camera-metadata')
      return dataCtrl.getCameraMetadata(req, res);
    if (method === 'POST' && pathname === '/api/camera/capture')
      return dataCtrl.triggerCapture(req, res);

    /* ── Automation ── */
    if (method === 'GET' && pathname === '/api/automation')
      return dataCtrl.getAutomationRules(req, res);
    if (method === 'POST' && pathname === '/api/automation')
      return dataCtrl.createRule(req, res, body);
    if (method === 'DELETE' && pathname.match(/^\/api\/automation\/\d+$/)) {
      const id = pathname.split('/').pop();
      return dataCtrl.deleteRule(req, res, id);
    }
    if (method === 'POST' && pathname.match(/^\/api\/automation\/\d+\/toggle$/)) {
      const id = pathname.split('/')[3];
      return dataCtrl.toggleRule(req, res, id, body);
    }

    /* ── Audit ── */
    if (method === 'GET' && pathname === '/api/audit')
      return dataCtrl.getAuditLogs(req, res);

    /* ── Reports ── */
    if (method === 'GET' && pathname === '/api/reports/data')
      return reportCtrl.getReportData(req, res, query);
    if (method === 'GET' && pathname === '/api/reports/csv')
      return reportCtrl.exportCSV(req, res, query);
    if (method === 'GET' && pathname === '/api/reports/pdf')
      return reportCtrl.exportPDF(req, res, query);

    /* ── Stats ── */
    if (method === 'GET' && pathname === '/api/stats')
      return dataCtrl.getStats(req, res);

    /* ── 404 fallthrough ── */
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  /* ── STATIC FILES ─────────────────────────────────────────── */
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(PUBLIC_DIR, 'pages', 'login.html');
  } else {
    const direct = path.join(PUBLIC_DIR, pathname);
    const asPage = path.join(PUBLIC_DIR, 'pages', pathname.replace(/^\//, '') + '.html');
    const asPageNoExt = path.join(PUBLIC_DIR, 'pages', pathname.replace(/^\//, ''));

    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
      filePath = direct;
    } else if (fs.existsSync(asPageNoExt) && fs.statSync(asPageNoExt).isFile()) {
      filePath = asPageNoExt;
    } else if (fs.existsSync(asPage)) {
      filePath = asPage;
    } else {
      filePath = direct; // will 404 naturally
    }
  }

  serveStatic(res, filePath);
}

/* ── CREATE HTTP + WEBSOCKET SERVER ───────────────────────────── */
const server = http.createServer(router);

// 1. Raw WebSocket Server (for ESP32 using WebSockets library)
const wss = new WebSocket.Server({ server, path: '/ws' });
wsUtil.init(wss);

// 2. Socket.IO Server (for Dashboard)
io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Export io for controllers
module.exports.io = io;

/* ── START ────────────────────────────────────────────────────── */
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🌿 ═══════════════════════════════════════════════');
  console.log(`   Greenhouse IoT Server  →  http://localhost:${PORT}`);
  console.log(`   WebSocket stream       →  ws://localhost:${PORT}/ws`);
  console.log(`   ESP32 telemetry        →  POST /api/telemetry  (X-Device-Key)`);
  console.log(`   Default login: admin / admin123  |  student / student123`);
  console.log('🌿 ═══════════════════════════════════════════════\n');
});
