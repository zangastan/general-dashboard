/**
 * utils/ws.js
 * WebSocket broadcaster — manages all connected browser clients.
 *
 * Usage:
 *   const wsUtil = require('./utils/ws');
 *   wsUtil.init(wss);               // call once after creating wss
 *   wsUtil.broadcast('telemetry', payload); // push to all clients
 */

'use strict';

const WebSocket = require('ws');

let _wss = null;

/** Attach to an existing ws.Server instance */
function init(wss) {
  _wss = wss;
  _wss.on('connection', (socket, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connected: ${ip}  (total: ${_wss.clients.size})`);

    // Keep-alive ping every 25 s to prevent proxy timeouts
    socket._pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.ping();
    }, 25000);

    socket.on('pong', () => { socket._isAlive = true; });

    socket.on('close', () => {
      clearInterval(socket._pingInterval);
      console.log(`[WS] Client disconnected. (remaining: ${_wss.clients.size})`);
    });

    socket.on('error', err => {
      console.error('[WS] Socket error:', err.message);
    });

    // Send a welcome/handshake so client knows WS is live
    _send(socket, 'connected', { message: 'Greenhouse WS stream active' });
  });
}

/** Send a typed message to one socket */
function _send(socket, event, data) {
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ event, data, ts: Date.now() }));
    } catch (e) {
      console.error('[WS] Send error:', e.message);
    }
  }
}

/**
 * Broadcast a named event + payload to ALL connected browser clients.
 * @param {string} event  - e.g. 'telemetry', 'alert', 'command_ack'
 * @param {object} data   - serialisable payload
 */
function broadcast(event, data) {
  if (!_wss) return;
  const msg = JSON.stringify({ event, data, ts: Date.now() });
  let sent = 0;
  _wss.clients.forEach(socket => {
    if (socket.readyState === WebSocket.OPEN) {
      try { socket.send(msg); sent++; } catch { /* ignore dead socket */ }
    }
  });
  if (process.env.WS_DEBUG === '1') {
    console.log(`[WS] Broadcast '${event}' → ${sent} client(s)`);
  }
}

/** How many browser clients are connected right now */
function clientCount() {
  return _wss ? _wss.clients.size : 0;
}

module.exports = { init, broadcast, clientCount };
