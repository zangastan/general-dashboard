/**
 * controllers/telemetryController.js
 *
 * Handles all ESP32 device communication:
 *  POST /api/telemetry  — ingest sensor payload, store, evaluate rules, broadcast
 *  GET  /api/commands   — return pending relay commands to ESP32, mark acknowledged
 */

'use strict';

const db      = require('../db/db');
const wsUtil  = require('../utils/ws');
const { verifyDeviceKey } = require('../utils/auth');

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/* ── VALIDATION ───────────────────────────────────────────────── */
const SENSOR_RANGES = {
  temperature:   { min: -10, max: 60  },
  humidity:      { min: 0,   max: 100 },
  soil_moisture: { min: 0,   max: 100 },
};

function validateField(name, value) {
  if (value === null || value === undefined) return null;
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  const range = SENSOR_RANGES[name];
  if (range && (v < range.min || v > range.max)) return null;
  return v;
}

/* ── AUTOMATION RULE EVALUATION ───────────────────────────────── */
async function evaluateRules(sensors) {
  try {
    const rules = await db.all('SELECT * FROM automation_rules WHERE is_active = 1');
    for (const rule of rules) {
      const val = sensors[rule.trigger_sensor.toLowerCase().replace(' ', '_')];
      if (val === undefined || val === null) continue;
      let triggered = false;
      switch (rule.condition) {
        case '<':  triggered = val <  rule.trigger_value; break;
        case '>':  triggered = val >  rule.trigger_value; break;
        case '<=': triggered = val <= rule.trigger_value; break;
        case '>=': triggered = val >= rule.trigger_value; break;
        case '==': triggered = val == rule.trigger_value; break;
      }
      if (triggered) {
        // Queue the relay command
        await db.run(
          'INSERT INTO device_commands (device, action, source) VALUES (?, ?, ?)',
          [rule.action_device, rule.action_value, 'automation']
        );
        // Log to actuator log
        await db.run(
          'INSERT INTO actuator_logs (device, action, user_id) VALUES (?, ?, NULL)',
          [rule.action_device, rule.action_value]
        );
        console.log(`[AUTOMATION] Rule "${rule.name}" triggered → ${rule.action_device}:${rule.action_value}`);
      }
    }
  } catch (e) {
    console.error('[AUTOMATION] Rule evaluation error:', e.message);
  }
}

/* ── ALERT GENERATION ─────────────────────────────────────────── */
async function generateAlerts(payload) {
  const alerts = [];

  // Soil moisture critical
  if (payload.soil_moisture !== null && payload.soil_moisture < 20) {
    alerts.push(['Critical', `Low Soil Moisture: ${payload.soil_moisture.toFixed(1)}%`, 'High']);
  }
  // High temperature
  if (payload.temperature !== null && payload.temperature > 35) {
    alerts.push(['Warning', `High Temperature: ${payload.temperature.toFixed(1)}°C`, 'Medium']);
  }
  // Very low humidity
  if (payload.humidity !== null && payload.humidity < 30) {
    alerts.push(['Warning', `Low Humidity: ${payload.humidity.toFixed(1)}%`, 'Medium']);
  }
  // Sensor error state
  if (payload.error_state) {
    alerts.push(['Error', `Device Error: ${payload.error_state}`, 'High']);
  }

  for (const [type, message, severity] of alerts) {
    try {
      await db.run(
        'INSERT INTO alerts (type, message, severity) VALUES (?, ?, ?)',
        [type, message, severity]
      );
    } catch (e) {
      console.error('[ALERT] Insert error:', e.message);
    }
  }
  return alerts.length;
}

/* ── INGEST TELEMETRY ─────────────────────────────────────────── */
async function ingestTelemetry(req, res, body) {
  try {
    verifyDeviceKey(req);

    const { device_id, timestamp, soil_moisture, temperature, humidity,
            camera_trigger, pump_status, signal_quality, error_state } = body;

    if (!device_id) return send(res, 400, { error: 'device_id required' });

    // Validate & sanitise sensor readings
    const temp  = validateField('temperature',   temperature);
    const hum   = validateField('humidity',      humidity);
    const moist = validateField('soil_moisture', soil_moisture);
    const rssi  = signal_quality !== undefined ? parseInt(signal_quality) : null;
    const errSt = error_state || null;

    const ts = timestamp || new Date().toISOString();

    // Persist sensor rows
    if (temp !== null) {
      await db.run(
        'INSERT INTO sensors (type, value, unit, timestamp) VALUES (?, ?, ?, ?)',
        ['Temperature', temp, '°C', ts]
      );
    }
    if (hum !== null) {
      await db.run(
        'INSERT INTO sensors (type, value, unit, timestamp) VALUES (?, ?, ?, ?)',
        ['Humidity', hum, '%', ts]
      );
    }
    if (moist !== null) {
      await db.run(
        'INSERT INTO sensors (type, value, unit, timestamp) VALUES (?, ?, ?, ?)',
        ['Soil Moisture', moist, '%', ts]
      );
    }

    // Build clean broadcast payload
    const broadcastPayload = {
      device_id,
      timestamp: ts,
      temperature: temp,
      humidity:    hum,
      soil_moisture: moist,
      pump_status:   pump_status || 'UNKNOWN',
      camera_trigger: !!camera_trigger,
      signal_quality: rssi,
      error_state:    errSt,
    };

    // Evaluate automation rules
    await evaluateRules({ temperature: temp, humidity: hum, soil_moisture: moist });

    // Generate threshold alerts
    const alertCount = await generateAlerts(broadcastPayload);

    // Push to all connected WebSocket browser clients
    wsUtil.broadcast('telemetry', broadcastPayload);

    // If new alerts were generated, broadcast them too
    if (alertCount > 0) {
      const latestAlerts = await db.all(
        'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 10'
      );
      wsUtil.broadcast('alerts', latestAlerts);
    }

    // Fetch pending commands for this device
    const commands = await db.all(
      'SELECT id, device, action FROM device_commands WHERE acknowledged = 0 ORDER BY created_at ASC'
    );

    // Mark them acknowledged immediately (pull model — ESP32 gets them once)
    if (commands.length > 0) {
      const ids = commands.map(c => c.id).join(',');
      await db.run(`UPDATE device_commands SET acknowledged = 1 WHERE id IN (${ids})`);
      console.log(`[TELEMETRY] Delivered ${commands.length} command(s) to ${device_id}`);
    }

    console.log(`[TELEMETRY] ${device_id} | T:${temp}°C H:${hum}% M:${moist}% RSSI:${rssi} | WS clients: ${wsUtil.clientCount()}`);

    send(res, 200, {
      status: 'ok',
      commands,
      ws_clients: wsUtil.clientCount(),
    });

  } catch (e) {
    console.error('[TELEMETRY] Error:', e.message);
    send(res, e.status || 500, { error: e.message });
  }
}

/* ── PENDING COMMANDS (poll fallback for ESP32) ───────────────── */
async function getPendingCommands(req, res) {
  try {
    verifyDeviceKey(req);
    const commands = await db.all(
      'SELECT id, device, action FROM device_commands WHERE acknowledged = 0 ORDER BY created_at ASC'
    );
    if (commands.length > 0) {
      const ids = commands.map(c => c.id).join(',');
      await db.run(`UPDATE device_commands SET acknowledged = 1 WHERE id IN (${ids})`);
    }
    send(res, 200, { commands });
  } catch (e) {
    send(res, e.status || 500, { error: e.message });
  }
}

module.exports = { ingestTelemetry, getPendingCommands };
