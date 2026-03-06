// ============================
// Planner Page
// ============================
function renderPlanner(container) {
    const tasks = Storage.getTasks();
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Daily Planner</h1>
          <p class="page-desc">Master your schedule, conquer your goals.</p>
        </div>
        <div class="search-input-wrap" style="width:240px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search tasks..." oninput="filterTasks(this.value)">
        </div>
      </div>

      <div class="planner-layout">
        <!-- Task Form -->
        <div class="glass-card task-form-section">
          <h3>
            <span style="color:var(--accent);font-size:1.2rem">+</span>
            New Task
          </h3>
          
          <label class="form-label">TASK TITLE</label>
          <input type="text" id="task-title" class="input-simple" placeholder="What needs to be done" style="margin-bottom:16px">
          
          <div class="form-row">
            <div>
              <label class="form-label">DATE</label>
              <input type="date" id="task-date" class="input-simple" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label class="form-label">EXAM TIME</label>
              <input type="time" id="task-time" class="input-simple" value="12:00">
            </div>
          </div>
          
          <label class="form-label">PRIORITY</label>
          <div class="priority-group">
            <button class="priority-btn" data-priority="low" onclick="setPriority(this, 'low')">LOW</button>
            <button class="priority-btn active" data-priority="medium" onclick="setPriority(this, 'medium')">MEDIUM</button>
            <button class="priority-btn" data-priority="high" onclick="setPriority(this, 'high')">HIGH</button>
          </div>
          
          <label class="form-label">REMINDERS</label>
          <select id="task-reminder" class="input-simple" style="margin-bottom:20px">
            <option value="">No reminders</option>
            <option value="5">5 minutes before</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
          </select>
          
          <button class="btn-green" style="width:100%" onclick="createTask()">
            <span style="font-size:1.1rem">+</span> CREATE TASK
          </button>
        </div>
        
        <!-- Kanban Board -->
        <div class="kanban-columns">
          <div>
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span class="kanban-dot green"></span> TO DO
              </div>
              <span class="kanban-count">${todoTasks.length}</span>
            </div>
            <div id="kanban-todo">
              ${todoTasks.length === 0 ? `
                <div class="empty-state" style="padding:30px">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  <p>Your agenda is clear.</p>
                </div>
              ` : todoTasks.map(t => renderTaskCard(t)).join('')}
            </div>
          </div>
          <div>
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span class="kanban-dot orange"></span> IN PROGRESS
              </div>
              <span class="kanban-count">${inProgressTasks.length}</span>
            </div>
            <div id="kanban-progress">
              ${inProgressTasks.map(t => renderTaskCard(t)).join('')}
            </div>
          </div>
          <div>
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span class="kanban-dot gray"></span> DONE
              </div>
              <span class="kanban-count">${doneTasks.length}</span>
            </div>
            <div id="kanban-done">
              ${doneTasks.map(t => renderTaskCard(t)).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- AI Advisor -->
      <div class="ai-advisor ai-advisor-orange">
        <div class="advisor-left">
          <div class="advisor-icon" style="background:rgba(249,115,22,0.2)">🤖</div>
          <div>
            <div class="advisor-title">AI PLANNER ADVISOR</div>
            <div class="advisor-desc">GET PERSONALIZED INSIGHTS & RECOMMENDATIONS</div>
          </div>
        </div>
        <button class="ask-btn">ASK AI ✨</button>
      </div>
    </div>
  `;
}

let selectedPriority = 'medium';

function setPriority(btn, priority) {
    selectedPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '';
        b.style.color = '';
        b.style.background = '';
    });
    btn.classList.add('active');
}

function createTask() {
    const title = document.getElementById('task-title').value.trim();
    if (!title) { alert('Please enter a task title'); return; }

    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;
    const reminder = document.getElementById('task-reminder').value;

    Storage.addTask({ title, date, time, priority: selectedPriority, reminder });
    Storage.addXP(10);
    navigateTo('planner');
}

function renderTaskCard(task) {
    return `
    <div class="task-card">
      <div class="task-card-title">${task.title}</div>
      <div class="task-card-meta">
        <span class="task-priority ${task.priority}">${task.priority}</span>
        <span>${task.date || ''}</span>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px">
        ${task.status !== 'in-progress' ? `<button class="btn-outline" style="padding:4px 10px;font-size:0.7rem" onclick="moveTask(${task.id}, 'in-progress')">→ Progress</button>` : ''}
        ${task.status !== 'done' ? `<button class="btn-outline" style="padding:4px 10px;font-size:0.7rem" onclick="moveTask(${task.id}, 'done')">✓ Done</button>` : ''}
        <button class="btn-outline" style="padding:4px 10px;font-size:0.7rem;color:var(--danger);border-color:rgba(255,71,87,0.3)" onclick="deleteTaskItem(${task.id})">✕</button>
      </div>
    </div>
  `;
}

function moveTask(id, status) {
    Storage.updateTask(id, { status });
    if (status === 'done') Storage.addXP(20);
    navigateTo('planner');
}

function deleteTaskItem(id) {
    if (confirm('Delete this task?')) {
        Storage.deleteTask(id);
        navigateTo('planner');
    }
}

function filterTasks(query) {
    // Simple filter - re-render with filtered results
    // For now just visual feedback
}
