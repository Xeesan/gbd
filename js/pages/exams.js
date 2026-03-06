// ============================
// Exams Page
// ============================
let examTab = 'exams';

function renderExams(container) {
  const exams = Storage.getExams();
  const filtered = exams.filter(e => e.type === examTab || (!e.type && examTab === 'exams'));

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Exam Tracker</h1>
          <p class="page-desc">Stay ahead of your academic schedule.</p>
        </div>
        <div class="tab-group">
          <button class="tab-item ${examTab === 'exams' ? 'active' : ''}" onclick="switchExamTab('exams')">EXAMS</button>
          <button class="tab-item ${examTab === 'assignments' ? 'active' : ''}" onclick="switchExamTab('assignments')">ASSIGNMENTS</button>
        </div>
      </div>

      <div class="glass-card" style="margin-bottom:16px">
        <div class="exam-form">
          <div class="exam-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              SUBJECT
            </label>
            <input type="text" id="exam-subject" class="input-simple" placeholder="e.g. Mathematics">
          </div>
          <div class="exam-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              EXAM DATE
            </label>
            <input type="date" id="exam-date" class="input-simple" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="exam-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              EXAM TIME
            </label>
            <input type="time" id="exam-time" class="input-simple" value="09:00">
          </div>
          <div class="exam-field">
            <label>TARGET GRADE</label>
            <input type="text" id="exam-grade" class="input-simple" placeholder="A+" value="A+">
          </div>
        </div>
        <div class="exam-form-bottom">
          <div class="exam-field">
            <label>CREDITS</label>
            <input type="number" id="exam-credits" class="input-simple" value="3" min="1" max="10">
          </div>
          <div class="exam-field">
            <label>REMINDERS</label>
            <select id="exam-reminder" class="input-simple">
              <option value="2">2 set</option>
              <option value="1">1 set</option>
              <option value="0">No reminders</option>
            </select>
          </div>
        </div>
        <div style="padding:0 24px 24px;display:flex;gap:12px">
          <button class="btn-green" style="flex:1" onclick="addExamSubmit()">+ ADD EXAM</button>
          <button class="btn-pdf-import" onclick="openPdfImportModal('exam')">
            🖼️ Import from Image
          </button>
        </div>
      </div>

      <!-- Exam List -->
      <div class="glass-card" style="min-height:100px">
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <p>No exams tracked yet.</p>
          </div>
        ` : filtered.map(e => `
          <div class="exam-card">
            <div>
              <strong>${e.subject}</strong>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
                ${e.date} at ${e.time} · Target: ${e.grade} · ${e.credits} credits
              </div>
            </div>
            <button class="icon-btn" style="color:var(--danger)" onclick="deleteExamItem(${e.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `).join('')}
      </div>

      <!-- AI Advisor -->
      <div class="ai-advisor ai-advisor-purple">
        <div class="advisor-left">
          <div class="advisor-icon" style="background:rgba(168,85,247,0.2)">🤖</div>
          <div>
            <div class="advisor-title">AI EXAMS ADVISOR</div>
            <div class="advisor-desc">GET PERSONALIZED INSIGHTS & RECOMMENDATIONS</div>
          </div>
        </div>
        <button class="ask-btn">ASK AI ✨</button>
      </div>
    </div>
  `;
}

function switchExamTab(tab) {
  examTab = tab;
  navigateTo('exams');
}

function addExamSubmit() {
  const subject = document.getElementById('exam-subject').value.trim();
  if (!subject) { alert('Please enter a subject'); return; }

  Storage.addExam({
    subject,
    date: document.getElementById('exam-date').value,
    time: document.getElementById('exam-time').value,
    grade: document.getElementById('exam-grade').value,
    credits: parseInt(document.getElementById('exam-credits').value) || 3,
    reminder: document.getElementById('exam-reminder').value,
    type: examTab
  });
  Storage.addXP(15);
  navigateTo('exams');
}

function deleteExamItem(id) {
  if (confirm('Delete this exam?')) {
    Storage.deleteExam(id);
    navigateTo('exams');
  }
}
