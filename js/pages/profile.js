// ============================
// Profile Page
// ============================
function renderProfile(container) {
  const user = Storage.getUser();
  const settings = Storage.getSettings();

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Profile</h1>
          <p class="page-desc">Manage your academic profile and settings</p>
        </div>
      </div>

      <div class="profile-section">
        <!-- Academic Profile -->
        <div class="glass-card-accent">
          <h3 style="margin-bottom:20px">Academic Profile</h3>
          <div class="profile-form">
            <div class="profile-field">
              <label>FULL NAME</label>
              <input type="text" class="input-simple" id="profile-name" value="${user ? user.name : ''}">
            </div>
            <div class="profile-field">
              <label>INSTITUTION</label>
              <input type="text" class="input-simple" id="profile-institution" placeholder="e.g. University of Dhaka" value="${settings.institution || ''}">
            </div>
            <div class="profile-field">
              <label>SUBJECT</label>
              <input type="text" class="input-simple" id="profile-subject" placeholder="e.g. Computer Science" value="${settings.subject || ''}">
            </div>
            <div class="profile-field">
              <label>SEMESTER</label>
              <input type="text" class="input-simple" id="profile-semester" placeholder="e.g. 4th" value="${settings.semester || ''}">
            </div>
            <div class="profile-field">
              <label>YEAR</label>
              <input type="text" class="input-simple" id="profile-year" placeholder="e.g. 2nd" value="${settings.year || ''}">
            </div>
            <div class="profile-field">
              <label>GENDER</label>
              <select class="input-simple" id="profile-gender">
                <option value="">Select</option>
                <option value="male" ${settings.gender === 'male' ? 'selected' : ''}>Male</option>
                <option value="female" ${settings.gender === 'female' ? 'selected' : ''}>Female</option>
                <option value="other" ${settings.gender === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>
          <div style="margin-top:20px">
            <button class="btn-green" onclick="saveProfile()">Save Changes</button>
          </div>
        </div>

        <!-- Management -->
        <div class="glass-card-accent">
          <h3 style="margin-bottom:20px">Management</h3>
          <div class="profile-actions">
            <button class="copy-id-btn" onclick="copyUniqueId()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Unique ID: ${user ? user.uid : '---'}
            </button>
            <button class="logout-btn" onclick="handleLogout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>

        <!-- App Info -->
        <div class="glass-card" style="text-align:center;padding:20px">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px">
            <div class="logo-icon" style="width:24px;height:24px;font-size:0.7rem">G</div>
            <span style="font-weight:700;font-size:1.1rem">GBD</span>
          </div>
          <p style="color:var(--text-muted);font-size:0.8rem">Good Bye Dopamine v2.0</p>
          <p style="color:var(--text-muted);font-size:0.75rem;margin-top:4px">Built with ❤️ for students</p>
        </div>
      </div>
    </div>
  `;
}

function saveProfile() {
  const user = Storage.getUser();
  const settings = Storage.getSettings();

  user.name = document.getElementById('profile-name').value.trim() || user.name;
  settings.institution = document.getElementById('profile-institution').value.trim();
  settings.subject = document.getElementById('profile-subject').value.trim();
  settings.semester = document.getElementById('profile-semester').value.trim();
  settings.year = document.getElementById('profile-year').value.trim();
  settings.gender = document.getElementById('profile-gender').value;

  Storage.setUser(user);
  Storage.setSettings(settings);

  // Update sidebar
  document.getElementById('sidebar-username').textContent = user.name;

  alert('Profile saved successfully!');
}

function copyUniqueId() {
  const user = Storage.getUser();
  if (user) {
    navigator.clipboard.writeText(user.uid).then(() => {
      alert('Unique ID copied: ' + user.uid);
    }).catch(() => {
      prompt('Copy your Unique ID:', user.uid);
    });
  }
}
