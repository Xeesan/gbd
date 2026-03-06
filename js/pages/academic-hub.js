// ============================
// Academic Hub Page
// ============================
let hubTab = 'tracker';

function renderAcademicHub(container) {
    const semesters = Storage.getSemesters();
    const settings = Storage.getSettings();

    // Calculate CGPA
    let totalPoints = 0;
    let totalCredits = 0;
    semesters.forEach(sem => {
        (sem.courses || []).forEach(c => {
            totalPoints += (c.gpa || 0) * (c.credits || 0);
            totalCredits += c.credits || 0;
        });
    });
    const currentCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    const requiredGPA = totalCredits < settings.totalCreditsRequired
        ? ((settings.targetCGPA * settings.totalCreditsRequired - totalPoints) / (settings.totalCreditsRequired - totalCredits)).toFixed(2)
        : settings.targetCGPA.toFixed(2);

    container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Academic Hub</h1>
          <p class="page-desc">Track your grades, CGPA, and academic goals</p>
        </div>
        <div class="page-header-actions">
          <div class="tab-group">
            <button class="tab-item ${hubTab === 'tracker' ? 'active' : ''}" onclick="switchHubTab('tracker')">TRACKER</button>
            <button class="tab-item ${hubTab === 'calculator' ? 'active' : ''}" onclick="switchHubTab('calculator')">CALCULATOR</button>
            <button class="tab-item ${hubTab === 'simulation' ? 'active' : ''}" onclick="switchHubTab('simulation')">SIMULATION</button>
          </div>
          <button class="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
          <button class="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
        </div>
      </div>

      <!-- CGPA Cards -->
      <div class="cgpa-cards">
        <div class="glass-card-accent cgpa-card">
          <div class="cgpa-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            CURRENT CGPA
          </div>
          <div class="cgpa-value ${parseFloat(currentCGPA) < 2 ? 'red' : ''}">${currentCGPA}</div>
        </div>
        <div class="glass-card-accent cgpa-card">
          <div class="cgpa-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/></svg>
            TARGET CGPA
          </div>
          <div class="cgpa-value">${settings.targetCGPA.toFixed(2)}</div>
        </div>
        <div class="glass-card-accent cgpa-card">
          <div class="cgpa-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            TOTAL CREDITS
          </div>
          <div class="cgpa-value">${totalCredits}</div>
          <div class="cgpa-sub">${totalCredits} / ${settings.totalCreditsRequired} CREDITS COMPLETED</div>
        </div>
        <div class="glass-card-accent cgpa-card">
          <div class="cgpa-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            REQUIRED GPA
          </div>
          <div class="cgpa-value">${requiredGPA}</div>
          <div class="cgpa-sub">FOR REMAINING SEMESTERS</div>
        </div>
      </div>

      <!-- Semesters & GPA Trend -->
      <div class="semester-section">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h2 style="font-size:1.25rem">Semesters</h2>
            <button class="btn-green" onclick="addSemesterPrompt()">+ Add Semester</button>
          </div>
          ${semesters.length === 0 ? `
            <div class="glass-card empty-state" style="padding:40px">
              <p>No semesters added yet. Add your first semester to start tracking!</p>
            </div>
          ` : semesters.map((s, i) => `
            <div class="glass-card" style="margin-bottom:12px;padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <h3>${s.name || 'Semester ' + (i + 1)}</h3>
                <span class="text-accent font-weight:600">${s.courses.length > 0 ? (s.courses.reduce((a, c) => a + c.gpa * c.credits, 0) / s.courses.reduce((a, c) => a + c.credits, 0)).toFixed(2) : '-'} GPA</span>
              </div>
              <div style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)">${s.courses.length} courses</div>
            </div>
          `).join('')}
        </div>
        <div class="glass-card-accent chart-card">
          <h3 style="display:flex;align-items:center;gap:8px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            GPA Trend
          </h3>
          <div class="chart-area" style="display:flex;align-items:center;justify-content:center">
            <p class="text-muted" style="font-size:0.85rem">Add semesters to see your GPA trend</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchHubTab(tab) {
    hubTab = tab;
    navigateTo('academic-hub');
}

function addSemesterPrompt() {
    const name = prompt('Semester name (e.g. Fall 2025):');
    if (!name) return;
    Storage.addSemester({ name });
    navigateTo('academic-hub');
}
