const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'greenhouse.db');

function open() {
  return new sqlite3.Database(DB_PATH);
}

function run(sql, params = []) {
  return new Promise((res, rej) => {
    const db = open();
    db.run(sql, params, function(err) {
      db.close();
      err ? rej(err) : res({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((res, rej) => {
    const db = open();
    db.get(sql, params, (err, row) => {
      db.close();
      err ? rej(err) : res(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((res, rej) => {
    const db = open();
    db.all(sql, params, (err, rows) => {
      db.close();
      err ? rej(err) : res(rows);
    });
  });
}

module.exports = { run, get, all };
