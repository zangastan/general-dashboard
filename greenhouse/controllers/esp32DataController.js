// Controller for ESP32 Data and Commands (Polling Mode)
let latestSensorData = null;
let pendingControlCommand = null;

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * POST /api/sensor-data
 * Expects strict JSON schema
 */
async function postSensorData(req, res, body) {
  try {
    // 1. Log every POST request
    console.log(`[SENSOR-DATA] POST received:`, JSON.stringify(body));

    // 2. Reject any non-JSON request
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return sendJSON(res, 400, { error: 'Content-Type must be application/json' });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJSON(res, 400, { error: 'Invalid JSON payload' });
    }

    const { temp, hum, soil, status, fan, pump } = body;

    // 3. Validation Rules (ENFORCE STRICTLY)
    const errors = [];

    if (typeof temp !== 'number' || temp < -10 || temp > 80) {
      errors.push('temp must be a number between -10 and 80');
    }
    if (typeof hum !== 'number' || hum < 0 || hum > 100) {
      errors.push('hum must be a number between 0 and 100');
    }
    if (typeof soil !== 'number' || soil < 0 || soil > 4095) {
      errors.push('soil must be a number between 0 and 4095');
    }
    if (status !== 'DRY' && status !== 'WET') {
      errors.push('status must be "DRY" or "WET"');
    }
    if (typeof fan !== 'boolean') {
      errors.push('fan must be a boolean');
    }
    if (typeof pump !== 'boolean') {
      errors.push('pump must be a boolean');
    }

    if (errors.length > 0) {
      return sendJSON(res, 400, { error: 'Validation failed', messages: errors });
    }

    // 4. Storage: Store ONLY the latest record (overwrite previous)
    latestSensorData = {
      temp,
      hum,
      soil,
      status,
      fan,
      pump,
      timestamp: Date.now()
    };

    // 5. Broadcast removed (Polling mode)

    // 6. Response
    return sendJSON(res, 200, {
      success: true,
      timestamp: latestSensorData.timestamp
    });

  } catch (err) {
    console.error('[SENSOR-DATA] POST Error:', err.message);
    return sendJSON(res, 500, { error: 'Internal server error' });
  }
}

/**
 * GET /api/sensor-data/latest
 */
async function getLatestSensorData(req, res) {
  try {
    if (!latestSensorData) {
      return sendJSON(res, 200, { status: 'AWAITING_DEVICE' });
    }

    return sendJSON(res, 200, latestSensorData);
  } catch (err) {
    console.error('[SENSOR-DATA] GET Error:', err.message);
    return sendJSON(res, 500, { error: 'Internal server error' });
  }
}

/**
 * POST /api/control
 * Body: { "fan": boolean, "pump": boolean }
 */
async function postControl(req, res, body) {
  try {
    console.log(`[CONTROL] Request received:`, JSON.stringify(body));

    if (!body || typeof body !== 'object') {
      return sendJSON(res, 400, { error: 'Invalid control payload' });
    }

    // Store command for ESP32 to poll
    pendingControlCommand = body;
    console.log(`[CONTROL] Command queued for ESP32:`, JSON.stringify(body));

    return sendJSON(res, 200, { success: true, command: body });
  } catch (err) {
    console.error('[CONTROL] Error:', err.message);
    return sendJSON(res, 500, { error: 'Internal server error' });
  }
}

/**
 * GET /api/control/pending
 * ESP32 polls this to get pending commands
 */
async function getPendingControl(req, res) {
  try {
    if (pendingControlCommand) {
      const cmd = pendingControlCommand;
      pendingControlCommand = null; // Clear after sending
      return sendJSON(res, 200, cmd);
    }
    return sendJSON(res, 200, {}); // Empty if no command
  } catch (err) {
    return sendJSON(res, 500, { error: 'Internal server error' });
  }
}

module.exports = {
  postSensorData,
  getLatestSensorData,
  postControl,
  getPendingControl
};
