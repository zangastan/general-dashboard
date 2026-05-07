const sqlite3 = require('sqlite3').verbose();
const bcrypt  = require('bcrypt');
const path    = require('path');
const fs      = require('fs');

// Load env vars from .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.trim().split('=');
    if (k && !k.startsWith('#') && rest.length) process.env[k] = rest.join('=');
  });
}

const DEVICE_API_KEY = process.env.DEVICE_API_KEY || 'ESP32_GH_PROD_KEY_CHANGE_ME';
const dbPath = path.join(__dirname, 'greenhouse.db');

if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname);
}

const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
    console.log('Initializing database...');

    // Roles table
    db.run(`CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    // Permissions table
    db.run(`CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    // User Permissions mapping
    db.run(`CREATE TABLE IF NOT EXISTS user_permissions (
        user_id INTEGER,
        permission_id INTEGER,
        PRIMARY KEY (user_id, permission_id)
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role_id INTEGER,
        must_reset_password INTEGER DEFAULT 1,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id)
    )`);

    // Sensors table
    db.run(`CREATE TABLE IF NOT EXISTS sensors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Camera Metadata
    db.run(`CREATE TABLE IF NOT EXISTS camera_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        analysis_result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Actuator Logs
    db.run(`CREATE TABLE IF NOT EXISTS actuator_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device TEXT NOT NULL,
        action TEXT NOT NULL,
        user_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Alerts
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Automation Rules
    db.run(`CREATE TABLE IF NOT EXISTS automation_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        trigger_sensor TEXT,
        trigger_value REAL,
        condition TEXT,
        action_device TEXT,
        action_value TEXT,
        is_active INTEGER DEFAULT 1
    )`);

    // Audit Logs
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        user_id INTEGER,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // AI Analysis Records
    db.run(`CREATE TABLE IF NOT EXISTS analysis_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_path TEXT,
        health_status TEXT,
        confidence REAL,
        description TEXT,
        action_taken TEXT,
        recommendation TEXT,
        greenness_value REAL,
        brightness_value REAL,
        analysis_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Device Commands Queue (dashboard → ESP32 relay commands)
    db.run(`CREATE TABLE IF NOT EXISTS device_commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device TEXT NOT NULL,
        action TEXT NOT NULL,
        source TEXT DEFAULT 'dashboard',
        acknowledged INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Device API Keys
    db.run(`CREATE TABLE IF NOT EXISTS device_api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE NOT NULL,
        api_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add signal_quality column to sensors if not already present (migration guard)
    db.run(`ALTER TABLE sensors ADD COLUMN signal_quality INTEGER`, () => {});

    // Seed default device API key
    db.run(
        `INSERT OR IGNORE INTO device_api_keys (device_id, api_key) VALUES (?, ?)`,
        ['ESP32_GREENHOUSE_01', DEVICE_API_KEY]
    );

    // Seed Roles
    const roles = ['Farm Manager', 'Student'];
    roles.forEach(role => {
        db.run('INSERT OR IGNORE INTO roles (name) VALUES (?)', [role]);
    });

    // Seed Permissions
    const perms = [
        'view_dashboard', 'view_monitoring', 'control_devices', 
        'view_camera', 'manage_automation', 'view_alerts', 
        'view_reports', 'manage_users', 'view_audit_logs', 'manage_settings'
    ];
    perms.forEach(perm => {
        db.run('INSERT OR IGNORE INTO permissions (name) VALUES (?)', [perm]);
    });

    // Seed Default Admin (Farm Manager)
    const adminPassword = await bcrypt.hash('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role_id, must_reset_password) 
            VALUES ('admin', ?, 1, 1)`, [adminPassword]);

    // Seed Default Student
    const studentPassword = await bcrypt.hash('student123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role_id, must_reset_password) 
            VALUES ('student', ?, 2, 1)`, [studentPassword], (err) => {
        if (err) console.error('Seeding error:', err);
        console.log('Database initialization complete.');
        db.close();
    });
});
