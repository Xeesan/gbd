// ============================
// Notes Page
// ============================
let noteCategory = 'all';
let noteView = 'list';
let editingNoteId = null;

function renderNotes(container) {
    const notes = Storage.getNotes();
    const filtered = noteCategory === 'all' ? notes : notes.filter(n => n.category === noteCategory);
    const categories = ['all', 'General', 'Study', 'Personal', 'Ideas'];

    container.innerHTML = `
    <div class="page-enter">
      <div class="notes-layout">
        <!-- Notes Sidebar -->
        <div class="notes-sidebar-inner">
          <button class="btn-green" style="width:100%;text-align:center" onclick="showNewNoteModal()">+ New Note</button>
          
          <div class="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search notes..." oninput="searchNotes(this.value)">
          </div>

          <div class="category-filters">
            ${categories.map(c => `
              <button class="category-pill ${noteCategory === c.toLowerCase() || (c === 'all' && noteCategory === 'all') ? 'active' : ''}" 
                      onclick="filterNotes('${c.toLowerCase()}')">${c}</button>
            `).join('')}
          </div>

          <div>
            <div class="notes-header-row">
              <span class="text-uppercase" style="color:var(--text-muted)">RECENT NOTES</span>
              <div class="view-toggle">
                <button class="${noteView === 'list' ? 'active' : ''}" onclick="setNoteView('list')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <button class="${noteView === 'grid' ? 'active' : ''}" onclick="setNoteView('grid')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
              </div>
            </div>
            
            <div style="margin-top:12px">
              ${filtered.map(n => `
                <div class="note-card" onclick="viewNote(${n.id})">
                  <div class="note-card-title">${n.title}</div>
                  <div class="note-card-preview">${(n.content || '').substring(0, 80)}${n.content && n.content.length > 80 ? '...' : ''}</div>
                  <div class="note-card-meta">
                    <span class="note-category-tag">${n.category || 'General'}</span>
                    <span>${formatDate(n.updatedAt)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Note Content -->
        <div class="glass-card" style="min-height:300px">
          <div id="note-content-area">
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
              <p>No notes yet. Start capturing your thoughts!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB -->
      <button class="fab fab-cyan" onclick="showNewNoteModal()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      </button>
    </div>
  `;
}

function filterNotes(category) {
    noteCategory = category;
    navigateTo('notes');
}

function setNoteView(view) {
    noteView = view;
    navigateTo('notes');
}

function searchNotes(query) {
    // Basic search - future improvement
}

function showNewNoteModal() {
    const modal = document.createElement('div');
    modal.className = 'note-modal-overlay';
    modal.id = 'note-modal';
    modal.innerHTML = `
    <div class="note-modal">
      <h2>${editingNoteId ? 'Edit Note' : 'New Note'}</h2>
      <div class="form-group" style="margin-bottom:12px">
        <input type="text" id="note-title-input" class="input-simple" placeholder="Note title" value="${editingNoteId ? Storage.getNotes().find(n => n.id === editingNoteId)?.title || '' : ''}">
      </div>
      <textarea id="note-content-input" placeholder="Write your thoughts...">${editingNoteId ? Storage.getNotes().find(n => n.id === editingNoteId)?.content || '' : ''}</textarea>
      <div class="form-group" style="margin-bottom:16px">
        <label style="display:block;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:8px">Category</label>
        <select id="note-category-input" class="input-simple">
          <option value="General">General</option>
          <option value="Study">Study</option>
          <option value="Personal">Personal</option>
          <option value="Ideas">Ideas</option>
        </select>
      </div>
      <div class="note-modal-actions">
        <button class="btn-outline" onclick="editingNoteId=null;closeModal('note-modal')">Cancel</button>
        <button class="btn-green" onclick="saveNote()">Save Note</button>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

function saveNote() {
    const title = document.getElementById('note-title-input').value.trim();
    const content = document.getElementById('note-content-input').value.trim();
    const category = document.getElementById('note-category-input').value;

    if (!title) { alert('Please enter a title'); return; }

    if (editingNoteId) {
        Storage.updateNote(editingNoteId, { title, content, category });
        editingNoteId = null;
    } else {
        Storage.addNote({ title, content, category });
        Storage.addXP(10);
    }

    closeModal('note-modal');
    navigateTo('notes');
}

function viewNote(id) {
    const note = Storage.getNotes().find(n => n.id === id);
    if (!note) return;

    const area = document.getElementById('note-content-area');
    area.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2>${note.title}</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-outline" style="padding:6px 12px;font-size:0.8rem" onclick="editingNoteId=${note.id};showNewNoteModal()">Edit</button>
        <button class="btn-outline" style="padding:6px 12px;font-size:0.8rem;color:var(--danger);border-color:rgba(255,71,87,0.3)" onclick="deleteNoteItem(${note.id})">Delete</button>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <span class="note-category-tag">${note.category || 'General'}</span>
      <span style="font-size:0.75rem;color:var(--text-muted)">${formatDate(note.updatedAt)}</span>
    </div>
    <div style="color:var(--text-secondary);line-height:1.8;white-space:pre-wrap">${note.content || 'No content'}</div>
  `;
}

function deleteNoteItem(id) {
    if (confirm('Delete this note?')) {
        Storage.deleteNote(id);
        navigateTo('notes');
    }
}
