// ============================
// LocalStorage Utilities
// ============================
const Storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem('gbd_' + key);
      return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem('gbd_' + key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem('gbd_' + key);
  },

  // User
  getUser() { return this.get('user', null); },
  setUser(user) { this.set('user', user); },
  clearUser() { this.remove('user'); },

  // Tasks (Planner)
  getTasks() { return this.get('tasks', []); },
  setTasks(tasks) { this.set('tasks', tasks); },
  addTask(task) {
    const tasks = this.getTasks();
    tasks.push({ ...task, id: Date.now() + Math.random().toString().slice(2, 6), status: 'todo', createdAt: new Date().toISOString() });
    this.setTasks(tasks);
  },
  updateTask(id, updates) {
    const tasks = this.getTasks().map(t => t.id === id ? { ...t, ...updates } : t);
    this.setTasks(tasks);
  },
  deleteTask(id) {
    this.setTasks(this.getTasks().filter(t => t.id !== id));
  },

  // Routine
  getRoutine() { return this.get('routine', { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }); },
  setRoutine(routine) { this.set('routine', routine); },
  addPeriod(day, period) {
    const routine = this.getRoutine();
    routine[day].push({ ...period, id: Date.now() + Math.random().toString().slice(2, 6) });
    this.setRoutine(routine);
  },
  deletePeriod(day, id) {
    const routine = this.getRoutine();
    routine[day] = routine[day].filter(p => p.id !== id);
    this.setRoutine(routine);
  },

  // Exams
  getExams() { return this.get('exams', []); },
  setExams(exams) { this.set('exams', exams); },
  addExam(exam) {
    const exams = this.getExams();
    exams.push({ ...exam, id: Date.now() + Math.random().toString().slice(2, 6) });
    this.setExams(exams);
  },
  deleteExam(id) {
    this.setExams(this.getExams().filter(e => e.id !== id));
  },

  // Semesters (Academic Hub)
  getSemesters() { return this.get('semesters', []); },
  setSemesters(semesters) { this.set('semesters', semesters); },
  addSemester(sem) {
    const sems = this.getSemesters();
    sems.push({ ...sem, id: Date.now() + Math.random().toString().slice(2, 6), courses: [] });
    this.setSemesters(sems);
  },

  // Transactions (Money)
  getTransactions() { return this.get('transactions', []); },
  setTransactions(txns) { this.set('transactions', txns); },
  addTransaction(txn) {
    const txns = this.getTransactions();
    txns.push({ ...txn, id: Date.now() + Math.random().toString().slice(2, 6), date: new Date().toISOString() });
    this.setTransactions(txns);
  },
  deleteTransaction(id) {
    this.setTransactions(this.getTransactions().filter(t => t.id !== id));
  },

  // Notes
  getNotes() { return this.get('notes', []); },
  setNotes(notes) { this.set('notes', notes); },
  addNote(note) {
    const notes = this.getNotes();
    notes.push({ ...note, id: Date.now() + Math.random().toString().slice(2, 6), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    this.setNotes(notes);
  },
  updateNote(id, updates) {
    const notes = this.getNotes().map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
    this.setNotes(notes);
  },
  deleteNote(id) {
    this.setNotes(this.getNotes().filter(n => n.id !== id));
  },

  // Debts (Lend/Borrow)
  getDebts() { return this.get('debts', []); },
  setDebts(debts) { this.set('debts', debts); },
  addDebt(debt) {
    const debts = this.getDebts();
    debts.push({ ...debt, id: Date.now() + Math.random().toString().slice(2, 6), date: debt.date || new Date().toISOString(), settled: false });
    this.setDebts(debts);
  },
  deleteDebt(id) {
    this.setDebts(this.getDebts().filter(d => d.id !== id));
  },

  // Savings Goals
  getSavingsGoals() { return this.get('savings_goals', []); },
  setSavingsGoals(goals) { this.set('savings_goals', goals); },
  addSavingsGoal(goal) {
    const goals = this.getSavingsGoals();
    goals.push({ ...goal, id: Date.now() + Math.random().toString().slice(2, 6), currentAmount: goal.initialAmount || 0 });
    this.setSavingsGoals(goals);
  },
  deleteSavingsGoal(id) {
    this.setSavingsGoals(this.getSavingsGoals().filter(g => g.id !== id));
  },

  // Focus sessions (Detox)
  getFocusSessions() { return this.get('focus_sessions', []); },
  addFocusSession(session) {
    const sessions = this.getFocusSessions();
    sessions.push({ ...session, id: Date.now() + Math.random().toString().slice(2, 6) });
    this.set('focus_sessions', sessions);
  },

  // Settings
  getSettings() { return this.get('settings', { language: 'en', targetCGPA: 3.80, totalCreditsRequired: 144 }); },
  setSettings(settings) { this.set('settings', settings); },

  // XP & Level
  getXP() { return this.get('xp', { total: 0, level: 1 }); },
  addXP(amount) {
    const xp = this.getXP();
    xp.total += amount;
    xp.level = Math.floor(xp.total / 100) + 1;
    this.set('xp', xp);
    return xp;
  },

  // Quick links
  getQuickLinks() { return this.get('quick_links', []); },
  addQuickLink(link) {
    const links = this.getQuickLinks();
    links.push({ ...link, id: Date.now() + Math.random().toString().slice(2, 6) });
    this.set('quick_links', links);
  },
  removeQuickLink(id) {
    this.set('quick_links', this.getQuickLinks().filter(l => l.id !== id));
  }
};
