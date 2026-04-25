/**
 * Smart Greenhouse Control System - Core Logic (SPA Version)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // App State
    const state = {
        currentView: 'dashboard',
        sensors: {
            temperature: 24,
            humidity: 65,
            moisture: 28,
            light: 850
        },
        actuators: {
            pump: { status: 'OFF', duration: 12 },
            windows: { status: 'CLOSED', position: 0 },
            fan: { status: 'ON', speed: 'MED' }
        },
        alerts: [
            { id: 1, type: 'critical', title: 'Low soil moisture detected', sub: 'Zone 01 - Sensors #4, #9 report < 30%', time: '12m ago' },
            { id: 2, type: 'info', title: 'Camera sync scheduled', sub: 'Imaging node #1 will refresh in 5m', time: '28m ago' },
            { id: 3, type: 'success', title: 'Nutrient flush complete', sub: 'Automated cycle executed successfully', time: '1h 15m ago' }
        ]
    };

    // Navigation
    const navItems = document.querySelectorAll('.sidebar-nav li, .user-profile');
    const viewContainer = document.getElementById('view-container');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            if (view) switchView(view);
        });
    });

    function switchView(viewName) {
        state.currentView = viewName;
        
        // Update active class in sidebar
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.toggle('active', li.getAttribute('data-view') === viewName);
        });

        // Render the view
        renderView(viewName);
    }

    function renderView(viewName) {
        viewContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>';
        
        setTimeout(() => {
            switch(viewName) {
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'environmental':
                    renderEnvironmental();
                    break;
                case 'controls':
                    renderControls();
                    break;
                case 'imaging':
                    renderImaging();
                    break;
                case 'automation':
                    renderAutomation();
                    break;
                case 'alerts':
                    renderAlerts();
                    break;
                case 'analytics':
                    renderAnalytics();
                    break;
                case 'settings':
                    renderSettings();
                    break;
                default:
                    viewContainer.innerHTML = `<h2>View ${viewName} not implemented yet</h2>`;
            }
            lucide.createIcons();
        }, 300);
    }

    function renderDashboard() {
        viewContainer.innerHTML = `
            <div class="view-content dashboard-view">
                <header class="page-header">
                    <div class="page-title">
                        <h2>Zone 01 Dashboard</h2>
                        <p>Hydroponic Lettuce Array • Batch #8842</p>
                    </div>
                    <div class="header-btns">
                        <span class="status-badge optimal" style="background: #E8F5E9; color: #2E7D32; display: flex; align-items: center; gap: 6px;">
                            <span class="dot on"></span> LIVE DATA
                        </span>
                    </div>
                </header>

                <div class="dashboard-grid">
                    <!-- Sensor Cards -->
                    <div class="card sensor-card temp">
                        <div class="card-header">
                            <div class="icon-box"><i data-lucide="thermometer"></i></div>
                            <span class="status-badge optimal">Optimal</span>
                        </div>
                        <div class="sensor-value">
                            <h3>${state.sensors.temperature}°C</h3>
                            <span>TEMPERATURE</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill"></div></div>
                    </div>

                    <div class="card sensor-card humidity">
                        <div class="card-header">
                            <div class="icon-box"><i data-lucide="droplets"></i></div>
                            <span class="status-badge stable">Stable</span>
                        </div>
                        <div class="sensor-value">
                            <h3>${state.sensors.humidity}%</h3>
                            <span>HUMIDITY</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill"></div></div>
                    </div>

                    <div class="card sensor-card moisture">
                        <div class="card-header">
                            <div class="icon-box"><i data-lucide="sprout"></i></div>
                            <span class="status-badge warning">Warning</span>
                        </div>
                        <div class="sensor-value">
                            <h3>${state.sensors.moisture}%</h3>
                            <span>SOIL MOISTURE</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" style="width: 28%; background: #EF4444;"></div></div>
                    </div>

                    <div class="card sensor-card light">
                        <div class="card-header">
                            <div class="icon-box"><i data-lucide="sun"></i></div>
                            <span class="status-badge nominal">Nominal</span>
                        </div>
                        <div class="sensor-value">
                            <h3>${state.sensors.light}lx</h3>
                            <span>LIGHT LEVEL</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill"></div></div>
                    </div>

                    <!-- Actuator Panel -->
                    <div class="actuator-panel card" style="grid-column: span 3; display: block;">
                        <div class="section-header" style="margin-bottom: 24px;">
                            <h3 style="font-size: 1.1rem; font-weight: 700;">Active Actuators</h3>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                            <div class="actuator-item">
                                <div class="actuator-info">
                                    <i data-lucide="droplet"></i>
                                    <h4 style="font-size: 0.95rem;">Water Pump</h4>
                                    <span class="actuator-status"><span class="dot off"></span> OFF</span>
                                </div>
                                <div class="actuator-controls" style="margin-top: 12px;">
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Toggle Status</span>
                                    <button class="control-btn" style="background: #1B5E20;">ACTIVATE</button>
                                </div>
                            </div>
                            <div class="actuator-item">
                                <div class="actuator-info">
                                    <i data-lucide="layout"></i>
                                    <h4 style="font-size: 0.95rem;">Vent Windows</h4>
                                    <span class="actuator-status" style="color: var(--text-muted);"><span class="dot" style="background: #94A3B8;"></span> CLOSED</span>
                                </div>
                                <div class="actuator-controls" style="margin-top: 12px;">
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Toggle Status</span>
                                    <button class="control-btn secondary">OPEN NOW</button>
                                </div>
                            </div>
                            <div class="actuator-item">
                                <div class="actuator-info">
                                    <i data-lucide="wind"></i>
                                    <h4 style="font-size: 0.95rem;">Air Circulation</h4>
                                    <span class="actuator-status"><span class="dot on"></span> ON</span>
                                </div>
                                <div class="actuator-controls" style="margin-top: 12px;">
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Toggle Status</span>
                                    <button class="control-btn" style="background: #EF4444;">DEACTIVATE</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Health -->
                    <div class="card system-health">
                         <div class="section-header">
                            <h3 style="font-size: 1.1rem; font-weight: 700;">System Health</h3>
                        </div>
                        <div class="health-stat">
                            <span>WiFi Strength</span>
                            <span style="color: var(--success);"><i data-lucide="signal" style="width: 14px; vertical-align: middle;"></i> -42 dBm</span>
                        </div>
                        <div class="health-stat">
                            <span>Uptime</span>
                            <span>14d 06h 22m</span>
                        </div>
                        <div class="health-stat">
                            <span>CPU Load</span>
                            <span>12%</span>
                        </div>
                        <div class="health-alert">
                            <i data-lucide="check-circle"></i>
                            <div>
                                <p>ALL SYSTEMS GO</p>
                                <span>No hardware faults detected.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Alerts -->
                    <div class="alerts-section">
                        <div class="section-header">
                            <h3 style="font-size: 1.1rem; font-weight: 700;"><i data-lucide="alert-triangle" style="color: var(--danger); width: 20px; vertical-align: middle;"></i> Critical Alerts</h3>
                            <a href="#" class="view-all" onclick="switchView('alerts')">VIEW ALL</a>
                        </div>
                        <div class="alert-list">
                            ${state.alerts.map(alert => `
                                <div class="alert-item">
                                    <span class="alert-dot ${alert.type}"></span>
                                    <div class="alert-content">
                                        <h4>${alert.title}</h4>
                                        <p>${alert.sub}</p>
                                    </div>
                                    <span class="alert-time">${alert.time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Environmental View
    function renderEnvironmental() {
        viewContainer.innerHTML = `
            <div class="view-content environmental-view">
                <header class="page-header">
                    <div class="page-title">
                        <h2>Environmental Monitoring</h2>
                        <p>Real-time climate dynamics across Zone A-14 and B-2</p>
                    </div>
                    <div class="header-btns">
                        <button class="btn btn-outline"><i data-lucide="calendar"></i> Last 24 Hours</button>
                        <button class="btn btn-primary"><i data-lucide="download"></i> Download CSV</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="card">
                            <div class="section-header">
                                <h3 style="font-size: 1rem; font-weight: 600;"><i data-lucide="thermometer" style="color: var(--danger);"></i> Temperature Trend</h3>
                                <span class="status-badge optimal">Safe: 22°C - 28°C</span>
                            </div>
                            <div style="height: 200px;"><canvas id="tempChart"></canvas></div>
                        </div>
                        <div class="card">
                            <div class="section-header">
                                <h3 style="font-size: 1rem; font-weight: 600;"><i data-lucide="droplets" style="color: var(--info);"></i> Relative Humidity</h3>
                                <span class="status-badge optimal">Safe: 55% - 70%</span>
                            </div>
                            <div style="height: 200px;"><canvas id="humidityChart"></canvas></div>
                        </div>
                        <div class="card">
                            <div class="section-header">
                                <h3 style="font-size: 1rem; font-weight: 600;"><i data-lucide="droplet" style="color: #92400E;"></i> Soil Moisture Content</h3>
                                <span class="status-badge optimal">Safe: 35% - 50%</span>
                            </div>
                            <div style="height: 200px;"><canvas id="moistureChart"></canvas></div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="card">
                            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 20px;">Active Sensors</h3>
                            <div class="sensor-mini-list">
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="font-size: 0.85rem; color: var(--text-muted);">Temp: North Cluster</span>
                                        <span style="font-weight: 700; color: var(--success);">24.8°C</span>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" style="width: 70%; background: var(--success);"></div></div>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="font-size: 0.85rem; color: var(--text-muted);">Humidity: North Cluster</span>
                                        <span style="font-weight: 700; color: var(--info);">62.1%</span>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" style="width: 60%; background: var(--info);"></div></div>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="font-size: 0.85rem; color: var(--text-muted);">CO2 Concentration</span>
                                        <span style="font-weight: 700; color: #92400E;">1150 PPM</span>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" style="width: 40%; background: #92400E;"></div></div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 20px;">Zone Coverage Map</h3>
                            <div style="background: #F1F5F9; border-radius: var(--radius-md); height: 200px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                                <img src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.2; filter: grayscale(1);">
                                <div style="position: absolute; top: 30%; left: 40%; width: 12px; height: 12px; background: var(--success); border-radius: 50%; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></div>
                                <div style="position: absolute; bottom: 40%; right: 30%; width: 12px; height: 12px; background: var(--success); border-radius: 50%; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></div>
                                <span style="position: absolute; font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">INTERACTIVE GRID VIEW</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        initCharts();
    }

    // Controls View
    function renderControls() {
        viewContainer.innerHTML = `
            <div class="view-content controls-view">
                <header class="page-header">
                    <div class="page-title">
                        <h2>Actuator Control Center</h2>
                        <p>Direct operator control for all greenhouse mechanical systems</p>
                    </div>
                </header>

                <div class="card" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 700;">System Operation Mode</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Select between centralized automation and direct operator control.</p>
                    </div>
                    <div style="background: var(--bg-main); padding: 4px; border-radius: var(--radius-md); display: flex;">
                        <button class="btn btn-primary" style="font-size: 0.75rem; padding: 8px 16px;">MANUAL MODE</button>
                        <button class="btn btn-outline" style="font-size: 0.75rem; padding: 8px 16px; border: none;">AUTOMATIC</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px;">
                    <div class="card">
                        <div class="section-header">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="icon-box" style="background: var(--primary-bg); color: var(--primary); padding: 10px; border-radius: var(--radius-md);"><i data-lucide="droplet"></i></div>
                                <div>
                                    <h4 style="font-weight: 700;">Irrigation Pump</h4>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;"><span class="dot off" style="display: inline-block; vertical-align: middle;"></span> STANDBY</span>
                                </div>
                            </div>
                            <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                        </div>
                        <div style="margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-size: 0.85rem; color: var(--text-muted);">FLOW DURATION</span>
                                <span style="font-weight: 700; color: var(--success);">12 mins</span>
                            </div>
                            <input type="range" style="width: 100%; accent-color: var(--primary);">
                            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                                <span>0m</span><span>30m</span><span>60m</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="section-header">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="icon-box" style="background: #FFF7ED; color: #EA580C; padding: 10px; border-radius: var(--radius-md);"><i data-lucide="layout"></i></div>
                                <div>
                                    <h4 style="font-weight: 700;">Window Vents</h4>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;"><span class="dot" style="background: #94A3B8; display: inline-block; vertical-align: middle;"></span> CLOSED</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                            <button class="btn btn-outline" style="width: 100%; font-size: 0.75rem;">OPEN ALL</button>
                            <button class="btn btn-primary" style="width: 100%; font-size: 0.75rem; background: #EA580C;">CLOSE ALL</button>
                        </div>
                        <div style="margin-top: 20px;">
                             <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-size: 0.85rem; color: var(--text-muted);">POSITION</span>
                                <span style="font-weight: 700;">0%</span>
                            </div>
                            <input type="range" value="0" style="width: 100%; accent-color: #EA580C;">
                        </div>
                    </div>

                    <div class="card">
                        <div class="section-header">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="icon-box" style="background: #ECFDF5; color: #10B981; padding: 10px; border-radius: var(--radius-md);"><i data-lucide="wind"></i></div>
                                <div>
                                    <h4 style="font-weight: 700;">Ventilation Fan</h4>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;"><span class="dot on" style="display: inline-block; vertical-align: middle;"></span> RUNNING</span>
                                </div>
                            </div>
                            <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                        </div>
                        <div style="margin-top: 20px;">
                            <span style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 12px;">SPEED SELECTOR</span>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                                <button class="btn btn-outline" style="font-size: 0.7rem; padding: 6px;">LOW</button>
                                <button class="btn btn-primary" style="font-size: 0.7rem; padding: 6px; background: #10B981; border-color: #10B981;">MED</button>
                                <button class="btn btn-outline" style="font-size: 0.7rem; padding: 6px;">HIGH</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    <div class="card">
                        <div class="section-header">
                            <h3 style="font-size: 1rem; font-weight: 700;"><i data-lucide="history"></i> Control Activity Log</h3>
                            <button class="btn btn-outline" style="font-size: 0.7rem; padding: 4px 12px;">EXPORT LOG</button>
                        </div>
                        <div class="log-list" style="margin-top: 20px;">
                            <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border);">
                                <span class="dot on"></span>
                                <div style="flex: 1;">
                                    <h5 style="font-size: 0.9rem; font-weight: 600;">Ventilation Fan set to MEDIUM</h5>
                                    <span style="font-size: 0.7rem; color: var(--text-muted);">Admin_User_01</span>
                                </div>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">JUST NOW</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border);">
                                <span class="dot on" style="background: #3B82F6;"></span>
                                <div style="flex: 1;">
                                    <h5 style="font-size: 0.9rem; font-weight: 600;">Irrigation Pump deactivated</h5>
                                    <span style="font-size: 0.7rem; color: var(--text-muted);">Admin_User_01</span>
                                </div>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">2 MINS AGO</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 16px; padding: 12px 0;">
                                <span class="dot on" style="background: #F59E0B;"></span>
                                <div style="flex: 1;">
                                    <h5 style="font-size: 0.9rem; font-weight: 600;">Window System: All Vents Closed</h5>
                                    <span style="font-size: 0.7rem; color: var(--text-muted);">System_Auto</span>
                                </div>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">15 MINS AGO</span>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="background: #FEE2E2; border-color: #F87171; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; padding: 32px;">
                        <div style="background: #FFFFFF; color: #EF4444; width: 64px; height: 64px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);">
                            <i data-lucide="alert-octagon" style="width: 32px; height: 32px;"></i>
                        </div>
                        <h3 style="color: #991B1B; font-weight: 800; font-size: 1.2rem; letter-spacing: 0.05em;">EMERGENCY STOP</h3>
                        <p style="color: #B91C1C; font-size: 0.8rem; margin: 12px 0 24px 0; font-weight: 500;">Kill power to all actuators immediately. This action cannot be undone automatically.</p>
                        <button class="btn" style="background: #DC2626; color: white; width: 100%; justify-content: center; font-weight: 800; padding: 16px;">ACTIVATE SYSTEM KILL</button>
                        <span style="font-size: 0.65rem; color: #B91C1C; font-weight: 800; margin-top: 16px; letter-spacing: 0.1em;">PROTOCOL 4-A ACTIVE</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Imaging View
    function renderImaging() {
        viewContainer.innerHTML = `
            <div class="view-content imaging-view">
                 <header class="page-header">
                    <div class="page-title">
                        <h2>Zone 04 - High Density Cultivation</h2>
                        <p>Camera 08 • Live 4K Stream • 34 Plants in view</p>
                    </div>
                    <div class="header-btns">
                        <div style="background: var(--bg-main); padding: 4px; border-radius: var(--radius-md); display: flex;">
                            <button class="btn btn-primary" style="font-size: 0.75rem; padding: 8px 16px;">Live Feed</button>
                            <button class="btn btn-outline" style="font-size: 0.75rem; padding: 8px 16px; border: none;">Archived</button>
                            <button class="btn btn-outline" style="font-size: 0.75rem; padding: 8px 16px; border: none;">Health Reports</button>
                        </div>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
                    <div class="card" style="padding: 0; overflow: hidden; position: relative;">
                        <img src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=1200" style="width: 100%; height: 500px; object-fit: cover;">
                        <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.5); color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                            <span style="width: 8px; height: 8px; background: red; border-radius: 50%; animation: pulse 1s infinite;"></span> REC
                        </div>
                        <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.5); color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-align: right;">
                            ISO 200<br>F/2.8
                        </div>
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); display: flex; align-items: center; gap: 20px; color: white;">
                             <i data-lucide="pause"></i>
                             <i data-lucide="volume-2"></i>
                             <span style="font-size: 0.8rem; font-weight: 500;">14:24:02 UTC</span>
                             <div style="margin-left: auto; display: flex; gap: 16px;">
                                <i data-lucide="search"></i>
                                <i data-lucide="maximize"></i>
                             </div>
                        </div>
                    </div>

                    <div class="card" style="display: flex; flex-direction: column; gap: 24px;">
                        <h3 style="font-size: 1.1rem; font-weight: 700;"><i data-lucide="activity" style="color: var(--primary);"></i> Real-time Analysis</h3>
                        
                        <div style="border-left: 4px solid var(--success); padding-left: 16px; background: var(--bg-main); padding: 16px; border-radius: 0 var(--radius-md) var(--radius-md) 0;">
                            <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">OVERALL HEALTH SCORE</span>
                            <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
                                <h2 style="font-size: 2rem; font-weight: 800; color: var(--primary);">92%</h2>
                                <span style="font-size: 0.8rem; color: var(--success); font-weight: 700;">↑ 2%</span>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md);">
                                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 8px;">PEST SCAN</span>
                                <span style="color: var(--success); font-weight: 700; font-size: 0.9rem;"><i data-lucide="check-circle" style="width: 14px; vertical-align: middle;"></i> Clear</span>
                            </div>
                            <div style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md);">
                                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 8px;">LEAF STATUS</span>
                                <span style="color: var(--success); font-weight: 700; font-size: 0.9rem;">Healthy</span>
                            </div>
                        </div>

                        <div>
                            <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 12px;">CONFIDENCE METRICS</span>
                            <div class="progress-bar" style="height: 8px;"><div class="progress-fill" style="width: 98%; background: var(--primary);"></div></div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); margin-top: 6px; font-weight: 600;">
                                <span>IDENTIFICATION</span><span>98% CONFIDENCE</span>
                            </div>
                        </div>

                        <button class="btn btn-outline" style="width: 100%; justify-content: center; background: #E2E8F0;">Generate Full Report</button>
                        <a href="#" style="text-align: center; font-size: 0.75rem; color: #92400E; font-weight: 700; text-decoration: none;">Manual Override Calibration</a>
                    </div>
                </div>

                <div class="section-header">
                    <h3 style="font-size: 1.1rem; font-weight: 700;">Recent Snapshots</h3>
                    <div style="display: flex; gap: 8px;">
                        <button class="icon-btn" style="border: 1px solid var(--border);"><i data-lucide="chevron-left"></i></button>
                        <button class="icon-btn" style="border: 1px solid var(--border);"><i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="position: relative; height: 160px;">
                            <img src="https://images.unsplash.com/photo-1530836361253-efad5cb2f6de?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover;">
                            <span class="status-badge optimal" style="position: absolute; top: 12px; right: 12px; font-size: 0.6rem;">Healthy</span>
                        </div>
                        <div style="padding: 16px;">
                            <h5 style="font-weight: 700; margin-bottom: 4px;">12:15 PM Today</h5>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Ref: SNAP-0042 • Zone 04</p>
                        </div>
                    </div>
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="position: relative; height: 160px;">
                            <img src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover;">
                            <span class="status-badge warning" style="position: absolute; top: 12px; right: 12px; font-size: 0.6rem; background: #FEF3C7; color: #92400E;">Water Stress</span>
                        </div>
                        <div style="padding: 16px;">
                            <h5 style="font-weight: 700; margin-bottom: 4px;">09:40 AM Today</h5>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Ref: SNAP-0041 • Zone 04</p>
                        </div>
                    </div>
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="position: relative; height: 160px;">
                            <img src="https://images.unsplash.com/photo-1525498122346-81c34a0be19a?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover;">
                            <span class="status-badge optimal" style="position: absolute; top: 12px; right: 12px; font-size: 0.6rem;">Healthy</span>
                        </div>
                        <div style="padding: 16px;">
                            <h5 style="font-weight: 700; margin-bottom: 4px;">06:00 AM Today</h5>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Ref: SNAP-0040 • Zone 04</p>
                        </div>
                    </div>
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="relative; height: 160px;">
                            <img src="https://images.unsplash.com/photo-1491147334573-44cbb4602074?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="padding: 16px;">
                            <h5 style="font-weight: 700; margin-bottom: 4px;">Yesterday 11:30 PM</h5>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Ref: SNAP-0039 • Zone 04</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Automation View
    function renderAutomation() {
        viewContainer.innerHTML = `
            <div class="view-content automation-view">
                 <header class="page-header">
                    <div class="page-title">
                        <h2>Automation Logic</h2>
                        <p>Configure smart rules and autonomous system behavior</p>
                    </div>
                    <div class="header-btns">
                        <button class="btn btn-primary"><i data-lucide="plus"></i> New Rule</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="card">
                            <div class="section-header">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="icon-box" style="background: var(--primary-bg); color: var(--primary); padding: 8px; border-radius: 8px;"><i data-lucide="droplet"></i></div>
                                    <h4 style="font-weight: 700;">Smart Irrigation Cycle</h4>
                                </div>
                                <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin: 12px 0;">IF <span style="font-weight: 700; color: var(--primary);">Soil Moisture < 35%</span> THEN <span style="font-weight: 700; color: var(--primary);">Activate Pump for 5 mins</span></p>
                            <div style="display: flex; gap: 12px; margin-top: 16px;">
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;">Edit Logic</button>
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px; color: var(--danger); border-color: #FEE2E2;">Delete</button>
                            </div>
                        </div>
                        <div class="card">
                            <div class="section-header">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="icon-box" style="background: #FEF3C7; color: #D97706; padding: 8px; border-radius: 8px;"><i data-lucide="thermometer"></i></div>
                                    <h4 style="font-weight: 700;">Climate Cooling</h4>
                                </div>
                                <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin: 12px 0;">IF <span style="font-weight: 700; color: #D97706;">Temperature > 28°C</span> THEN <span style="font-weight: 700; color: #D97706;">Open Vents & Start Fan</span></p>
                            <div style="display: flex; gap: 12px; margin-top: 16px;">
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;">Edit Logic</button>
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px; color: var(--danger); border-color: #FEE2E2;">Delete</button>
                            </div>
                        </div>
                        <div class="card">
                            <div class="section-header">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="icon-box" style="background: #DBEAFE; color: #2563EB; padding: 8px; border-radius: 8px;"><i data-lucide="sun"></i></div>
                                    <h4 style="font-weight: 700;">Supplemental Lighting</h4>
                                </div>
                                <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin: 12px 0;">IF <span style="font-weight: 700; color: #2563EB;">Light Level < 400lx</span> BETWEEN <span style="font-weight: 700;">06:00 - 18:00</span> THEN <span style="font-weight: 700; color: #2563EB;">Turn on Grow Lights</span></p>
                            <div style="display: flex; gap: 12px; margin-top: 16px;">
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;">Edit Logic</button>
                                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px; color: var(--danger); border-color: #FEE2E2;">Delete</button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 20px;">Scheduling</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="background: var(--bg-main); padding: 12px; border-radius: var(--radius-md);">
                                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">NEXT IRRIGATION</span>
                                <p style="font-weight: 700; margin-top: 4px;">Today, 06:00 PM</p>
                            </div>
                            <div style="background: var(--bg-main); padding: 12px; border-radius: var(--radius-md);">
                                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">NEXT DATA SYNC</span>
                                <p style="font-weight: 700; margin-top: 4px;">In 14 minutes</p>
                            </div>
                        </div>
                        <div style="margin-top: 24px;">
                            <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px;">Weekly Calendar</h4>
                            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
                                ${['M','T','W','T','F','S','S'].map(d => `<div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: ${d==='W'?'var(--primary)':'#F1F5F9'}; color: ${d==='W'?'white':'var(--text-muted)'}; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">${d}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Alerts View
    function renderAlerts() {
        viewContainer.innerHTML = `
            <div class="view-content alerts-view">
                 <header class="page-header">
                    <div class="page-title">
                        <h2>Alerts & Notifications</h2>
                        <p>System events and critical hardware notifications</p>
                    </div>
                    <div class="header-btns">
                        <button class="btn btn-outline">Filter By Severity</button>
                        <button class="btn btn-primary">Mark All Resolved</button>
                    </div>
                </header>

                <div class="card" style="padding: 0;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; gap: 20px;">
                        <span style="font-weight: 700; color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 4px; cursor: pointer;">All Alerts</span>
                        <span style="font-weight: 600; color: var(--text-muted); cursor: pointer;">Critical (1)</span>
                        <span style="font-weight: 600; color: var(--text-muted); cursor: pointer;">System (2)</span>
                    </div>
                    <div class="alert-list">
                         ${state.alerts.map(alert => `
                            <div class="alert-item" style="padding: 24px;">
                                <span class="alert-dot ${alert.type}"></span>
                                <div class="alert-content">
                                    <h4 style="font-size: 1rem;">${alert.title}</h4>
                                    <p style="font-size: 0.85rem; margin-top: 4px;">${alert.sub}</p>
                                </div>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <span class="alert-time" style="font-weight: 600;">${alert.time}</span>
                                    <button class="btn btn-outline" style="font-size: 0.7rem; padding: 6px 12px;">Acknowledge</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Analytics View
    function renderAnalytics() {
        viewContainer.innerHTML = `
            <div class="view-content analytics-view">
                <header class="page-header">
                    <div class="page-title">
                        <h2>System Analytics</h2>
                        <p>Comprehensive reports on resource consumption and efficiency</p>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
                    <div class="card">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">WATER USAGE</span>
                        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0;">142.5 L</h3>
                        <span style="font-size: 0.8rem; color: var(--success); font-weight: 700;">↓ 4% vs last week</span>
                    </div>
                    <div class="card">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">POWER CONSUMPTION</span>
                        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0;">12.8 kWh</h3>
                        <span style="font-size: 0.8rem; color: var(--danger); font-weight: 700;">↑ 2% vs last week</span>
                    </div>
                    <div class="card">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">AVG HUMIDITY</span>
                        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0;">64%</h3>
                        <span style="font-size: 0.8rem; color: var(--info); font-weight: 700;">Within optimal range</span>
                    </div>
                    <div class="card">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">PLANT GROWTH RATE</span>
                        <h3 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0;">1.2 cm/day</h3>
                        <span style="font-size: 0.8rem; color: var(--success); font-weight: 700;">↑ 0.1 cm baseline</span>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 24px;">Resource Consumption Trend</h3>
                    <div style="height: 300px;"><canvas id="analyticsChart"></canvas></div>
                </div>
            </div>
        `;
        initAnalyticsChart();
    }

    // Settings View
    function renderSettings() {
        viewContainer.innerHTML = `
            <div class="view-content settings-view">
                 <header class="page-header">
                    <div class="page-title">
                        <h2>System Settings</h2>
                        <p>Global configuration and user preferences</p>
                    </div>
                    <div class="header-btns">
                        <button class="btn btn-primary">Save All Changes</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 32px;">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div class="card" style="background: var(--primary-bg); border-color: var(--primary);">
                            <h5 style="font-weight: 700; color: var(--primary);">General Settings</h5>
                        </div>
                        <div class="card">
                            <h5 style="font-weight: 600;">Sensor Calibration</h5>
                        </div>
                        <div class="card">
                            <h5 style="font-weight: 600;">Threshold Config</h5>
                        </div>
                        <div class="card">
                            <h5 style="font-weight: 600;">Network & Connectivity</h5>
                        </div>
                        <div class="card">
                            <h5 style="font-weight: 600;">User Management</h5>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 24px;">Sensor Thresholds</h3>
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">Temperature Alert (High)</label>
                                <div style="display: flex; gap: 12px; align-items: center;">
                                    <input type="number" value="30" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); width: 100px;">
                                    <span>°C</span>
                                </div>
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">Humidity Alert (Low)</label>
                                <div style="display: flex; gap: 12px; align-items: center;">
                                    <input type="number" value="40" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); width: 100px;">
                                    <span>%</span>
                                </div>
                            </div>
                             <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">ESP32 Data Sync Interval</label>
                                <select style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); width: 100%;">
                                    <option>Every 1 minute</option>
                                    <option selected>Every 5 minutes</option>
                                    <option>Every 15 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Chart Initialization Functions
    function initCharts() {
        const ctxTemp = document.getElementById('tempChart')?.getContext('2d');
        const ctxHum = document.getElementById('humidityChart')?.getContext('2d');
        const ctxMoist = document.getElementById('moistureChart')?.getContext('2d');

        if (ctxTemp) {
            new Chart(ctxTemp, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'Temperature',
                        data: [22, 21, 24, 28, 26, 23],
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        if (ctxHum) {
            new Chart(ctxHum, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'Humidity',
                        data: [70, 75, 68, 62, 65, 68],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        if (ctxMoist) {
            new Chart(ctxMoist, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'Soil Moisture',
                        data: [45, 42, 40, 38, 35, 33],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }

    function initAnalyticsChart() {
        const ctx = document.getElementById('analyticsChart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        { label: 'Water (L)', data: [20, 25, 22, 18, 24, 20, 22], backgroundColor: 'rgba(59, 130, 246, 0.6)' },
                        { label: 'Power (kWh)', data: [2, 2.5, 2.2, 1.8, 2.4, 2, 2.2], backgroundColor: 'rgba(245, 158, 11, 0.6)' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    // Mock Data Generator
    setInterval(() => {
        state.sensors.temperature = (23 + Math.random() * 2).toFixed(1);
        state.sensors.humidity = (60 + Math.random() * 10).toFixed(0);
        state.sensors.light = (800 + Math.random() * 100).toFixed(0);
        
        // Update DOM if on dashboard
        if (state.currentView === 'dashboard') {
            const tempEl = document.querySelector('.sensor-card.temp h3');
            const humEl = document.querySelector('.sensor-card.humidity h3');
            const lightEl = document.querySelector('.sensor-card.light h3');
            
            if (tempEl) tempEl.innerText = `${state.sensors.temperature}°C`;
            if (humEl) humEl.innerText = `${state.sensors.humidity}%`;
            if (lightEl) lightEl.innerText = `${state.sensors.light}lx`;
        }
    }, 5000);

    // Global Event Listeners for Dynamic Content
    document.addEventListener('click', (e) => {
        if (e.target.closest('.control-btn') || e.target.closest('.btn-primary') || e.target.closest('.switch')) {
            const btn = e.target.closest('.btn, .control-btn, .switch');
            if (btn && !btn.closest('.sidebar')) {
                showNotification('Command sent to ESP32 successfully');
            }
        }
        
        if (e.target.closest('.add-sensor-btn')) {
            showNotification('Add Sensor module coming soon!');
        }
    });

    function showNotification(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        toast.innerText = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add Keyframes for Notification
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);

    // Initial load
    switchView('dashboard');
});
