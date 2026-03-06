// ============================
// Reports Page
// ============================
let reportPeriod = 'weekly';

function renderReports(container) {
    const tasks = Storage.getTasks();
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const sessions = Storage.getFocusSessions();
    const totalFocusMin = sessions.reduce((a, s) => a + (s.duration || 0), 0);
    const txns = Storage.getTransactions();
    const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const balance = income - expense;

    container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Reports</h1>
          <p class="page-desc">Activity Overview</p>
        </div>
        <div class="tab-group">
          <button class="tab-item ${reportPeriod === 'daily' ? 'active' : ''}" onclick="switchReportPeriod('daily')">DAILY REPORT</button>
          <button class="tab-item ${reportPeriod === 'weekly' ? 'active' : ''}" onclick="switchReportPeriod('weekly')">WEEKLY REPORT</button>
          <button class="tab-item ${reportPeriod === 'monthly' ? 'active' : ''}" onclick="switchReportPeriod('monthly')">MONTHLY REPORT</button>
          <button class="tab-item ${reportPeriod === 'yearly' ? 'active' : ''}" onclick="switchReportPeriod('yearly')">YEARLY REPORT</button>
          <button class="tab-item ${reportPeriod === 'archive' ? 'active' : ''}" onclick="switchReportPeriod('archive')">DAILY ARCHIVE</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="report-stats">
        <div class="glass-card-accent report-stat-card">
          <div class="report-stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div>
            <div class="report-stat-label">TASKS COMPLETED</div>
            <div class="report-stat-value">${completedTasks}</div>
          </div>
        </div>
        <div class="glass-card-accent report-stat-card">
          <div class="report-stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <div class="report-stat-label">FOCUS TIME</div>
            <div class="report-stat-value">${totalFocusMin} <span style="font-size:0.8rem;font-weight:400">minutes</span></div>
          </div>
        </div>
        <div class="glass-card-accent report-stat-card">
          <div class="report-stat-icon teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          </div>
          <div>
            <div class="report-stat-label">TOTAL INCOME</div>
            <div class="report-stat-value">৳${income}</div>
          </div>
        </div>
        <div class="glass-card-accent report-stat-card">
          <div class="report-stat-icon red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div>
            <div class="report-stat-label">TOTAL EXPENSE</div>
            <div class="report-stat-value">৳${expense}</div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="reports-charts">
        <!-- Productivity Score Chart -->
        <div class="glass-card-accent chart-card">
          <h3>Productivity Score</h3>
          <div class="chart-area">
            <canvas id="productivity-chart"></canvas>
          </div>
        </div>
        
        <!-- Money Donut -->
        <div class="glass-card-accent chart-card">
          <h3>Money</h3>
          <div class="chart-container" style="height:200px">
            <canvas id="money-chart"></canvas>
            <div class="chart-center-text">
              <span class="label">BALANCE</span>
              <span class="value">৳${balance}</span>
            </div>
          </div>
          <div class="donut-legend">
            <div class="legend-item">
              <div class="legend-left">
                <span class="legend-dot green"></span>
                <span>Income</span>
              </div>
              <span>৳${income}</span>
            </div>
            <div class="legend-item">
              <div class="legend-left">
                <span class="legend-dot red"></span>
                <span>Expense</span>
              </div>
              <span>৳${expense}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Draw charts
    setTimeout(() => {
        drawProductivityChart();
        drawMoneyChart(income, expense);
    }, 100);
}

function switchReportPeriod(period) {
    reportPeriod = period;
    navigateTo('reports');
}

function drawProductivityChart() {
    const canvas = document.getElementById('productivity-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= 5; i++) {
        const y = padding + (h - padding * 2) * (1 - i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(i.toString(), padding - 8, y + 4);
    }
    ctx.setLineDash([]);

    // X-axis labels (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }));
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    days.forEach((label, i) => {
        const x = padding + (w - padding * 2) * (i / (days.length - 1));
        ctx.fillText(label, x, h - 10);
    });

    // Draw line (placeholder data)
    const sessions = Storage.getFocusSessions();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const dayScore = sessions.filter(s => new Date(s.date).toDateString() === dayStr)
            .reduce((a, s) => a + (s.duration || 0), 0) / 60;
        data.push(Math.min(dayScore, 5));
    }

    if (data.some(d => d > 0)) {
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padding + (w - padding * 2) * (i / (data.length - 1));
            const y = padding + (h - padding * 2) * (1 - val / 5);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw dots
        data.forEach((val, i) => {
            const x = padding + (w - padding * 2) * (i / (data.length - 1));
            const y = padding + (h - padding * 2) * (1 - val / 5);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00FF88';
            ctx.fill();
        });
    }
}

function drawMoneyChart(income, expense) {
    const canvas = document.getElementById('money-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.parentElement.offsetWidth, 200);
    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;
    const innerRadius = radius * 0.65;
    const total = income + expense;

    if (total === 0) {
        // Draw empty ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        ctx.fill();
        return;
    }

    const incomeAngle = (income / total) * Math.PI * 2;

    // Income arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + incomeAngle);
    ctx.arc(cx, cy, innerRadius, -Math.PI / 2 + incomeAngle, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = '#00FF88';
    ctx.fill();

    // Expense arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2 + incomeAngle, -Math.PI / 2 + Math.PI * 2);
    ctx.arc(cx, cy, innerRadius, -Math.PI / 2 + Math.PI * 2, -Math.PI / 2 + incomeAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#ff4757';
    ctx.fill();
}
