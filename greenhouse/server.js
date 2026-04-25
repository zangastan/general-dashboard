const http = require('http');
const url  = require('url');
const path = require('path');
const fs   = require('fs');

const authCtrl   = require('./controllers/authController');
const sensorCtrl = require('./controllers/sensorController');
const ctrlCtrl   = require('./controllers/controlController');
const userCtrl   = require('./controllers/userController');
const dataCtrl   = require('./controllers/dataController');
const reportCtrl = require('./controllers/reportController');
const analysisCtrl = require('./controllers/analysisController');

const PORT      = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

/* ── MIME MAP ─────────────────────────────────────────────── */
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

/* ── BODY PARSER ──────────────────────────────────────────── */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => raw += c.toString());
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
  });
}

/* ── STATIC FILE SERVER ───────────────────────────────────── */
function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}

/* ── CORS HEADERS ─────────────────────────────────────────── */
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/* ── ROUTER ───────────────────────────────────────────────── */
async function router(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query    = parsed.query;
  const method   = req.method;

  /* ── API ROUTES ─────────────────────────────────────────── */
  if (pathname.startsWith('/api')) {
    let body = {};
    if (['POST','PUT','PATCH'].includes(method)) {
      try { body = await readBody(req); } catch { /* ignore */ }
    }

    // Auth
    if (method === 'POST' && pathname === '/api/auth/login')          return authCtrl.login(req, res, body);
    if (method === 'POST' && pathname === '/api/auth/reset-password') return authCtrl.resetPassword(req, res, body);
    
    // AI Analysis
    if (pathname === '/api/analysis' || pathname === '/api/analysis/') {
      if (method === 'GET')  return analysisCtrl.listRecords(req, res);
      if (method === 'POST') return analysisCtrl.createRecord(req, res);
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

    // Sensors
    if (method === 'GET' && pathname === '/api/sensors')              return sensorCtrl.getLatest(req, res);
    if (method === 'GET' && pathname === '/api/sensor-history')       return sensorCtrl.getHistory(req, res, query);

    // Control
    if (method === 'POST' && pathname === '/api/control')             return ctrlCtrl.controlDevice(req, res, body);
    if (method === 'GET'  && pathname === '/api/actuator-log')        return ctrlCtrl.getLog(req, res);

    // Users
    if (method === 'GET'  && pathname === '/api/users')               return userCtrl.listUsers(req, res);
    if (method === 'POST' && pathname === '/api/users')               return userCtrl.createUser(req, res, body);
    if (method === 'POST' && pathname === '/api/users/admin-reset')   return userCtrl.adminResetPassword(req, res, body);
    if (method === 'DELETE' && pathname.startsWith('/api/users/')) {
      const username = pathname.split('/api/users/')[1];
      return userCtrl.deleteUser(req, res, username);
    }

    // Alerts
    if (method === 'GET'  && pathname === '/api/alerts')              return dataCtrl.getAlerts(req, res);
    if (method === 'POST' && pathname.match(/^\/api\/alerts\/\d+\/read$/)) {
      const id = pathname.split('/')[3];
      return dataCtrl.markRead(req, res, id);
    }

    // Camera
    if (method === 'GET'  && pathname === '/api/camera-metadata')     return dataCtrl.getCameraMetadata(req, res);
    if (method === 'POST' && pathname === '/api/camera/capture')      return dataCtrl.triggerCapture(req, res);

    // Automation
    if (method === 'GET'  && pathname === '/api/automation')          return dataCtrl.getAutomationRules(req, res);
    if (method === 'POST' && pathname === '/api/automation')          return dataCtrl.createRule(req, res, body);
    if (method === 'DELETE' && pathname.match(/^\/api\/automation\/\d+$/)) {
      const id = pathname.split('/').pop();
      return dataCtrl.deleteRule(req, res, id);
    }
    if (method === 'POST' && pathname.match(/^\/api\/automation\/\d+\/toggle$/)) {
      const id = pathname.split('/')[3];
      return dataCtrl.toggleRule(req, res, id, body);
    }

    // Audit
    if (method === 'GET' && pathname === '/api/audit')                return dataCtrl.getAuditLogs(req, res);

    // Reports
    if (method === 'GET' && pathname === '/api/reports/data')         return reportCtrl.getReportData(req, res, query);
    if (method === 'GET' && pathname === '/api/reports/csv')          return reportCtrl.exportCSV(req, res, query);
    if (method === 'GET' && pathname === '/api/reports/pdf')          return reportCtrl.exportPDF(req, res, query);

    // Stats
    if (method === 'GET' && pathname === '/api/stats')                return dataCtrl.getStats(req, res);

    // 404 for unknown API
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  /* ── STATIC FILES ───────────────────────────────────────── */
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(PUBLIC_DIR, 'pages', 'login.html');
  } else {
    // Try direct path first
    const direct = path.join(PUBLIC_DIR, pathname);
    // Then try as a page name
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

/* ── START ────────────────────────────────────────────────── */
const server = http.createServer(router);
server.listen(PORT, () => {
  console.log(`\n🌿 Greenhouse Server running → http://localhost:${PORT}`);
  console.log(`   Default login: admin / admin123  |  student / student123\n`);
});
