const db = require('../db/db');
const { authMiddleware } = require('../utils/jwt');
const PDFDocument = require('pdfkit');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function getReportData(req, res, query) {
  try {
    authMiddleware(req);
    const { type, from, to } = query;
    let sql = 'SELECT * FROM sensors WHERE 1=1';
    const params = [];
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (from) { sql += ' AND date(timestamp) >= ?'; params.push(from); }
    if (to)   { sql += ' AND date(timestamp) <= ?'; params.push(to); }
    sql += ' ORDER BY timestamp DESC LIMIT 500';
    const rows = await db.all(sql, params);
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function exportCSV(req, res, query) {
  try {
    authMiddleware(req);
    const { type, from, to } = query;
    let sql = 'SELECT * FROM sensors WHERE 1=1';
    const params = [];
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (from) { sql += ' AND date(timestamp) >= ?'; params.push(from); }
    if (to)   { sql += ' AND date(timestamp) <= ?'; params.push(to); }
    sql += ' ORDER BY timestamp DESC LIMIT 1000';
    const rows = await db.all(sql, params);

    let csv = 'ID,Type,Value,Unit,Timestamp\r\n';
    rows.forEach(r => { csv += `${r.id},"${r.type}",${r.value},"${r.unit}","${r.timestamp}"\r\n`; });

    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="greenhouse_sensor_report.csv"'
    });
    res.end(csv);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function exportPDF(req, res, query) {
  try {
    authMiddleware(req);
    const { type, from, to } = query;
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    if (from) { sql += ' AND date(timestamp) >= ?'; params.push(from); }
    if (to)   { sql += ' AND date(timestamp) <= ?'; params.push(to); }
    sql += ' ORDER BY timestamp DESC LIMIT 200';
    const alerts = await db.all(sql, params);

    const doc = new PDFDocument({ margin: 40 });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="greenhouse_alerts_report.pdf"'
    });
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#1a6b2f').text('Greenhouse CMS', { align: 'center' });
    doc.fontSize(14).fillColor('#333').text('Alerts Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#777').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);

    if (!alerts.length) {
      doc.fontSize(11).fillColor('#333').text('No alerts found for the selected period.');
    } else {
      // Table header
      doc.fontSize(9).fillColor('#555').text('TIMESTAMP          SEVERITY    TYPE         MESSAGE', { underline: true });
      doc.moveDown(0.3);
      alerts.forEach(a => {
        const line = `${a.timestamp.slice(0,16).padEnd(18)} ${a.severity.padEnd(11)} ${a.type.padEnd(12)} ${a.message}`;
        const color = a.severity === 'High' ? '#c62828' : a.severity === 'Medium' ? '#e65100' : '#2e7d32';
        doc.fontSize(8).fillColor(color).text(line, { lineBreak: true });
      });
    }

    doc.end();
  } catch (e) {
    if (!res.headersSent) send(res, e.status || 500, { error: e.message });
  }
}

module.exports = { getReportData, exportCSV, exportPDF };
