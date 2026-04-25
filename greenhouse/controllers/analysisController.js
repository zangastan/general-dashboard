const db = require('../db/db');
const { authMiddleware } = require('../utils/jwt');
const PDFDocument = require('pdfkit');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function listRecords(req, res) {
  try {
    authMiddleware(req);
    const rows = await db.all('SELECT * FROM analysis_records ORDER BY created_at DESC');
    send(res, 200, rows);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function getRecord(req, res, id) {
  try {
    authMiddleware(req);
    const row = await db.get('SELECT * FROM analysis_records WHERE id = ?', [id]);
    if (!row) return send(res, 404, { error: 'Record not found' });
    send(res, 200, row);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function createRecord(req, res) {
  try {
    authMiddleware(req);
    
    // Fetch latest sensor data for AI simulation
    const latest = await db.all('SELECT type, value FROM sensors WHERE id IN (SELECT MAX(id) FROM sensors GROUP BY type)');
    const temp = latest.find(s => s.type === 'Temperature')?.value || 25;
    const moist = latest.find(s => s.type === 'Soil Moisture')?.value || 50;

    // AI Simulation Logic
    let health = 'Healthy';
    let action = 'System in monitoring state';
    let rec = 'Continue standard maintenance. Monitor growth.';
    let desc = 'Conditions within optimal range. No deviations detected.';
    let conf = (Math.random() * 4 + 94).toFixed(1);

    if (moist < 40) {
      health = 'Water Stress';
      action = 'Irrigation system activated via automation';
      rec = 'Increase watering frequency. Check for soil drainage issues.';
      desc = 'Soil moisture dropped below critical 40% threshold.';
      conf = (Math.random() * 5 + 88).toFixed(1);
    } else if (temp > 30) {
      health = 'Heat Stress';
      action = 'Ventilation windows and fans activated';
      rec = 'Verify ventilation operation. Consider shading if persists.';
      desc = 'Ambient temperature exceeded 30°C threshold.';
      conf = (Math.random() * 5 + 85).toFixed(1);
    }

    const mockImg = `https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80`;
    
    const result = await db.run(
      `INSERT INTO analysis_records (image_path, health_status, confidence, description, action_taken, recommendation) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mockImg, health, conf, desc, action, rec]
    );

    send(res, 201, { id: result.lastID, health_status: health });
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function exportCSV(req, res, id = null) {
  try {
    authMiddleware(req);
    let rows;
    if (id) {
      const row = await db.get('SELECT * FROM analysis_records WHERE id = ?', [id]);
      if (!row) return send(res, 404, { error: 'Record not found' });
      rows = [row];
    } else {
      rows = await db.all('SELECT * FROM analysis_records ORDER BY created_at DESC');
    }

    let csv = 'ID,Date,Health Status,Confidence,Description,Action Taken,Recommendation\n';
    rows.forEach(r => {
      csv += `"${r.id}","${r.created_at}","${r.health_status}","${r.confidence}%","${r.description}","${r.action_taken}","${r.recommendation}"\n`;
    });
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=analysis_report_${id || 'bulk'}.csv`
    });
    res.end(csv);
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

async function exportPDF(req, res, id = null) {
  try {
    authMiddleware(req);
    let rows;
    if (id) {
      const row = await db.get('SELECT * FROM analysis_records WHERE id = ?', [id]);
      if (!row) return send(res, 404, { error: 'Record not found' });
      rows = [row];
    } else {
      rows = await db.all('SELECT * FROM analysis_records ORDER BY created_at DESC');
    }

    const doc = new PDFDocument();
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=analysis_report_${id || 'bulk'}.pdf`
    });
    doc.pipe(res);

    doc.fontSize(20).text('Advanced AI Plant Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text('Generated: ' + new Date().toLocaleString(), { align: 'right' });
    doc.moveDown();

    rows.forEach((r, i) => {
      doc.rect(doc.x, doc.y, 500, 150).stroke('#eeeeee');
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#2e7d32').text(`Record #${r.id} - ${r.health_status}`, { indent: 10 });
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Captured: ${new Date(r.created_at).toLocaleString()}`, { indent: 10 });
      doc.text(`Confidence: ${r.confidence}%`, { indent: 10 });
      doc.moveDown(0.5);
      doc.text(`Condition: ${r.description}`, { indent: 10 });
      doc.moveDown(0.5);
      doc.fillColor('#d32f2f').text(`Action Taken: ${r.action_taken}`, { indent: 10 });
      doc.fillColor('#1976d2').text(`Recommendation: ${r.recommendation}`, { indent: 10 });
      doc.moveDown(2);
      if (i < rows.length - 1) doc.addPage();
    });

    doc.end();
  } catch (e) { send(res, e.status || 500, { error: e.message }); }
}

module.exports = { listRecords, getRecord, createRecord, exportCSV, exportPDF };
