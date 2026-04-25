/**
 * ui.js — shared layout renderer (sidebar + topbar) + auth guard
 * Included on every protected page via <script src="../js/ui.js"></script>
 */

const UI = (() => {
  /* ── SVG ICONS ─────────────────────────────────────────────── */
  const icon = {
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    monitoring: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    controls: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`,
    imaging: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    automation:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    alerts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    analytics:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    audit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    settings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    chevron:`<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px"><polyline points="9 18 15 12 9 6"/></svg>`,
    wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    sync: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    warn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
    lock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    temp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
    hum: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    moist: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1L12 2l2.2 4.1A7 7 0 0 1 13 20z"/><path d="M12 9v11"/></svg>`,
    fan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3m10-10h-3M5 12H2m14.07-7.07l-2.12 2.12M7.05 16.95l-2.12 2.12M16.95 16.95l2.12 2.12M7.05 7.05L4.93 4.93"/></svg>`,
    window: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    robot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    users_group: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    siren: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  };

  /* ── HELPERS ──────────────────────────────────────────────── */
  function getUser() { return JSON.parse(localStorage.getItem('user') || '{}'); }
  function getToken() { return localStorage.getItem('token') || ''; }
  function isAdmin() { return getUser().role_id === 1; }

  /* ── AUTH CHECK ───────────────────────────────────────────── */
  function checkAuth() {
    const publicPages = ['login', 'reset-password'];
    const page = location.pathname.split('/').pop() || '';
    const isPublic = publicPages.some(p => page.includes(p));
    if (!isPublic && !getToken()) {
      location.href = 'login';
    }
  }

  /* ── SIDEBAR ──────────────────────────────────────────────── */
  function renderSidebar() {
    const el = document.getElementById('sidebar');
    if (!el) return;
    const user = getUser();
    const initials = (user.username || 'U').slice(0, 2).toUpperCase();
    const roleName = user.role_id === 1 ? 'Farm Manager' : 'Student';
    const page = location.pathname.split('/').pop() || 'dashboard';

    const navLink = (href, label, ic, extraClass = '') => {
      const active = page === href || page === href + '.html' ? ' active' : '';
      return `<a href="${href}" class="sb-nav-link${active}${extraClass ? ' ' + extraClass : ''}">${ic} ${label}</a>`;
    };

    const adminLinks = isAdmin() ? `
      <div class="sb-section-label">Admin</div>
      <button class="sb-submenu-trigger" id="usermgmt-trigger">
        ${icon.users} User Management ${icon.chevron}
      </button>
      <div class="sb-submenu" id="usermgmt-submenu">
        ${navLink('users', 'Users', icon.users)}
        ${navLink('audit', 'Audit Logs', icon.audit)}
      </div>
    ` : '';

    el.innerHTML = `
      <div class="sb-brand">
        <h1>Greenhouse CMS</h1>
        <p>Command Center v2.4</p>
      </div>
      <nav class="sb-nav">
        ${navLink('dashboard', 'Dashboard', icon.dashboard)}
        ${navLink('monitoring', 'Environmental', icon.monitoring)}
        ${navLink('control', 'Controls', icon.controls)}
        ${navLink('camera', 'Imaging', icon.imaging)}
        ${navLink('automation', 'Automation', icon.automation)}
        ${navLink('alerts', 'Alerts', icon.alerts)}
        ${navLink('reports', 'Analytics', icon.analytics)}
        ${adminLinks}
      </nav>
      <div class="sb-footer">
        <button class="btn-add-sensor" id="btn-add-sensor">${icon.plus} Add Sensor</button>
        ${navLink('settings', 'Settings', icon.settings)}
        <a href="#" id="btn-logout">${icon.logout} Logout</a>
      </div>
      <div class="sb-user">
        <div class="sb-user-avatar">${initials}</div>
        <div class="sb-user-info">
          <p>${user.username || 'Operator'}</p>
          <span>${roleName}</span>
        </div>
      </div>
    `;

    // Submenu toggle
    const trigger = document.getElementById('usermgmt-trigger');
    const submenu = document.getElementById('usermgmt-submenu');
    if (trigger && submenu) {
      const inSubmenu = ['users', 'audit'].includes(page);
      if (inSubmenu) { trigger.classList.add('open'); submenu.classList.add('open'); }
      trigger.addEventListener('click', () => {
        trigger.classList.toggle('open');
        submenu.classList.toggle('open');
      });
    }

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = 'login';
    });
  }

  /* ── TOPBAR ───────────────────────────────────────────────── */
  function renderTopbar() {
    const el = document.getElementById('topbar');
    if (!el) return;
    el.innerHTML = `
      <div class="topbar-brand">
        GREENHOUSE COMMAND
        <span class="sep">|</span>
        <div class="topbar-cluster"><div class="dot"></div> LIVE CLUSTERS: 4/4 ONLINE</div>
      </div>
      <div class="topbar-right">
        <div class="search-bar">
          ${icon.sync.replace('stroke-width="2"','stroke-width="2" width="14" height="14"')}
          <input placeholder="Search parameters..." type="text">
        </div>
        <div class="topbar-icons">
          ${icon.wifi} ${icon.camera} ${icon.sync}
        </div>
      </div>
    `;
  }

  /* ── TOAST NOTIFICATIONS ──────────────────────────────────── */
  function toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:8px;font-size:.83rem;font-weight:600;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.2);background:${type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#0054a7'};transition:opacity .3s`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ── FETCH HELPER ─────────────────────────────────────────── */
  async function apiFetch(url, opts = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
    const res = await fetch(url, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    checkAuth();
    renderSidebar();
    renderTopbar();
  }

  return { init, getUser, getToken, isAdmin, apiFetch, toast, icon };
})();

document.addEventListener('DOMContentLoaded', UI.init.bind(UI));
