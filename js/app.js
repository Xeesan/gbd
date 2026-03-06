// ============================
// Main App Router & Utilities
// ============================
let currentPage = 'dashboard';

function navigateTo(page) {
    currentPage = page;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
    });

    // Close sidebar on mobile after navigation
    closeSidebar();

    // Render page
    const container = document.getElementById('page-container');
    container.scrollTop = 0;

    switch (page) {
        case 'dashboard': renderDashboard(container); break;
        case 'planner': renderPlanner(container); break;
        case 'routine': renderRoutine(container); break;
        case 'exams': renderExams(container); break;
        case 'academic-hub': renderAcademicHub(container); break;
        case 'money': renderMoney(container); break;
        case 'notes': renderNotes(container); break;
        case 'detox': renderDetox(container); break;
        case 'reports': renderReports(container); break;
        case 'profile': renderProfile(container); break;
        default: renderDashboard(container);
    }
}

function updateHeaderDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    document.getElementById('header-date').textContent = formatted;
}

// ============================
// Daily Summary - show once per day
// ============================
function showDailySummary() {
    const today = new Date().toDateString();
    const lastShown = Storage.get('daily_summary_last_shown', '');

    // Only show once per day
    if (lastShown === today) return;

    const tasks = Storage.getTasks();
    const completedToday = tasks.filter(t => {
        const d = new Date(t.createdAt);
        return t.status === 'done' && d.toDateString() === today;
    }).length;

    const sessions = Storage.getFocusSessions();
    const todaySessions = sessions.filter(s => {
        const d = new Date(s.date);
        return d.toDateString() === today;
    });
    const totalFocusMin = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    document.getElementById('modal-focus').textContent = (totalFocusMin / 60).toFixed(1) + 'h';
    document.getElementById('modal-planner').textContent = completedToday;
    document.getElementById('daily-summary-modal').style.display = 'flex';
}

function closeDailySummary() {
    document.getElementById('daily-summary-modal').style.display = 'none';
    // Mark as shown for today
    Storage.set('daily_summary_last_shown', new Date().toDateString());
}

// ============================
// Mobile Sidebar Toggle
// ============================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// ============================
// Utilities
// ============================
function toggleLanguage() {
    alert('Language toggle is a visual feature. Bengali translation coming soon!');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
}

function getCurrentDayName() {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    const user = Storage.getUser();
    if (user) {
        showApp();
    } else {
        showAuth();
    }
});
