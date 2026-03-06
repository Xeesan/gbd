// ============================
// Routine Page
// ============================
let selectedDay = getCurrentDayName();

function renderRoutine(container) {
  const routine = Storage.getRoutine();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const periods = routine[selectedDay] || [];

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Class Routine</h1>
          <p class="page-desc">Your weekly academic schedule at a glance.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn-pdf-import" onclick="openPdfImportModal('routine')">
            🖼️ Import from Image
          </button>
          <button class="btn-green" onclick="showAddPeriodModal()">
            <span>+</span> Add Period
          </button>
        </div>
      </div>

      <div class="day-tabs">
        ${days.map((d, i) => `
          <button class="day-tab ${d === selectedDay ? 'active' : ''}" onclick="selectDay('${d}')">${dayLabels[i]}</button>
        `).join('')}
      </div>

      <div class="glass-card" style="min-height:200px">
        ${periods.length === 0 ? `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <p>No classes scheduled for this day. for ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</p>
            <button class="btn-outline" style="margin-top:12px" onclick="showAddPeriodModal()">+ ADD PERIOD</button>
          </div>
        ` : periods.map(p => `
          <div class="period-card">
            <div class="period-info">
              <span class="period-time">${p.startTime} - ${p.endTime}</span>
              <span class="period-subject">${p.subject}</span>
              <span class="period-room">${p.room || ''}</span>
            </div>
            <button class="icon-btn" onclick="deletePeriodItem('${selectedDay}', ${p.id})" style="color:var(--danger)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Active Plans section -->
      <div class="glass-card" style="margin-top:24px;min-height:100px">
        <div class="empty-state" style="padding:30px">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <p style="color:var(--accent);font-weight:600;font-size:1rem">No active plans. Start your journey now!</p>
        </div>
      </div>
    </div>
  `;
}

function selectDay(day) {
  selectedDay = day;
  navigateTo('routine');
}

function showAddPeriodModal() {
  const modal = document.createElement('div');
  modal.className = 'period-modal-overlay';
  modal.id = 'period-modal';
  modal.innerHTML = `
    <div class="period-modal">
      <h2>Add Period</h2>
      <div class="form-group">
        <label>Subject</label>
        <input type="text" id="period-subject" class="input-simple" placeholder="e.g. Mathematics">
      </div>
      <div class="form-group">
        <label>Start Time</label>
        <input type="time" id="period-start" class="input-simple" value="09:00">
      </div>
      <div class="form-group">
        <label>End Time</label>
        <input type="time" id="period-end" class="input-simple" value="10:00">
      </div>
      <div class="form-group">
        <label>Room (Optional)</label>
        <input type="text" id="period-room" class="input-simple" placeholder="e.g. Room 302">
      </div>
      <div style="display:flex;gap:12px;margin-top:20px">
        <button class="btn-outline" style="flex:1" onclick="closeModal('period-modal')">Cancel</button>
        <button class="btn-green" style="flex:1" onclick="addPeriodSubmit()">Add Period</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function addPeriodSubmit() {
  const subject = document.getElementById('period-subject').value.trim();
  if (!subject) { alert('Please enter a subject'); return; }

  const startTime = document.getElementById('period-start').value;
  const endTime = document.getElementById('period-end').value;
  const room = document.getElementById('period-room').value.trim();

  Storage.addPeriod(selectedDay, { subject, startTime, endTime, room });
  Storage.addXP(5);
  closeModal('period-modal');
  navigateTo('routine');
}

function deletePeriodItem(day, id) {
  if (confirm('Delete this period?')) {
    Storage.deletePeriod(day, id);
    navigateTo('routine');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
}
