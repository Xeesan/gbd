// ============================
// Detox Page
// ============================
let focusActive = false;
let focusStartTime = null;
let focusInterval = null;
let focusElapsed = 0;

function renderDetox(container) {
    container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Detox</h1>
          <p class="page-desc">Stay ahead of your academic schedule.</p>
        </div>
        <button class="focus-btn" id="focus-toggle-btn" onclick="toggleFocus()">
          ${focusActive ? 'STOP FOCUS' : 'START FOCUS'}
        </button>
      </div>

      <div class="detox-page" id="detox-content">
        ${focusActive ? `
          <div class="focus-timer">
            <div class="timer-display" id="focus-timer-display">00:00:00</div>
            <div class="timer-label">Focus Session Active</div>
          </div>
        ` : `
          <div style="text-align:center;padding:60px 20px">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="0.5" style="margin-bottom:20px;opacity:0.3">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <p style="color:var(--text-muted);font-size:1rem">Click <strong style="color:var(--accent)">START FOCUS</strong> to begin a distraction-free session</p>
          </div>
        `}
      </div>

      <!-- Focus History -->
      <div class="glass-card" style="margin-top:24px">
        <h3 style="margin-bottom:16px">Recent Sessions</h3>
        ${renderFocusHistory()}
      </div>

      <!-- FAB -->
      <button class="fab fab-red" onclick="toggleFocus()">
        ${focusActive ?
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
        }
      </button>
    </div>
  `;

    if (focusActive) {
        updateFocusTimer();
    }
}

function toggleFocus() {
    if (focusActive) {
        // Stop focus
        focusActive = false;
        clearInterval(focusInterval);
        const duration = Math.floor((Date.now() - focusStartTime) / 60000); // minutes
        Storage.addFocusSession({ date: new Date().toISOString(), duration });
        Storage.addXP(Math.max(5, duration));
        focusStartTime = null;
        focusElapsed = 0;
    } else {
        // Start focus
        focusActive = true;
        focusStartTime = Date.now();
        focusElapsed = 0;
        focusInterval = setInterval(updateFocusTimer, 1000);
    }
    navigateTo('detox');
}

function updateFocusTimer() {
    if (!focusActive || !focusStartTime) return;
    focusElapsed = Math.floor((Date.now() - focusStartTime) / 1000);
    const h = String(Math.floor(focusElapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((focusElapsed % 3600) / 60)).padStart(2, '0');
    const s = String(focusElapsed % 60).padStart(2, '0');
    const display = document.getElementById('focus-timer-display');
    if (display) display.textContent = `${h}:${m}:${s}`;
}

function renderFocusHistory() {
    const sessions = Storage.getFocusSessions().slice().reverse().slice(0, 10);
    if (sessions.length === 0) {
        return '<p style="color:var(--text-muted);font-size:0.9rem">No focus sessions yet. Start your first one!</p>';
    }
    return sessions.map(s => `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary)">${formatDate(s.date)}</span>
      <span style="color:var(--accent);font-weight:600">${s.duration} min</span>
    </div>
  `).join('');
}
