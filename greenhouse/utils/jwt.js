/**
 * utils/jwt.js — backwards-compatibility shim.
 * All logic now lives in utils/auth.js (env-based secrets, device key support).
 * Existing controllers that require('./utils/jwt') continue to work unchanged.
 */
module.exports = require('./auth');
