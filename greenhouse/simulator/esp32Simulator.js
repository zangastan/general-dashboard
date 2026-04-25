const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'greenhouse.db');

function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function simulate() {
    const db = new sqlite3.Database(dbPath);

    setInterval(() => {
        const timestamp = new Date().toISOString();

        // Simulate Temperature
        const temp = getRandom(20, 35);
        db.run('INSERT INTO sensors (type, value, unit) VALUES (?, ?, ?)', ['Temperature', temp, '°C']);

        // Simulate Humidity
        const humidity = getRandom(40, 80);
        db.run('INSERT INTO sensors (type, value, unit) VALUES (?, ?, ?)', ['Humidity', humidity, '%']);

        // Simulate Soil Moisture
        const moisture = getRandom(10, 60);
        db.run('INSERT INTO sensors (type, value, unit) VALUES (?, ?, ?)', ['Soil Moisture', moisture, '%']);

        // Check for Alerts
        if (moisture < 20) {
            db.run('INSERT INTO alerts (type, message, severity) VALUES (?, ?, ?)', 
                ['Critical', `Low Soil Moisture Detected: ${moisture}%`, 'High']);
        }

        if (temp > 30) {
            db.run('INSERT INTO alerts (type, message, severity) VALUES (?, ?, ?)', 
                ['Warning', `High Temperature Detected: ${temp}°C`, 'Medium']);
        }

        // Mock Camera Meta (occasionally)
        if (Math.random() > 0.8) {
            const results = ['Healthy', 'Water Stress', 'Disease Detected'];
            const res = results[Math.floor(Math.random() * results.length)];
            db.run('INSERT INTO camera_metadata (filename, analysis_result) VALUES (?, ?)', 
                [`cam_${Date.now()}.jpg`, res]);
        }

        console.log(`[Simulator] Data updated at ${timestamp}`);
    }, 5000);
}

simulate();
console.log('IoT Simulator started...');
