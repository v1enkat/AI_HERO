const Dashboard = {
  render() {
    document.getElementById('greeting').textContent = AI.getGreeting();
    document.getElementById('userName').textContent = S.user.name || 'there';
    document.getElementById('aiBannerText').textContent = AI.getDashInsight();

    const done = S.tasks.filter(t => t.done).length;
    const pending = S.tasks.filter(t => !t.done).length;
    document.getElementById('dashTasksDone').textContent = done;
    document.getElementById('dashTasksPending').textContent = pending;

    const spent = S.expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = S.finance.income - spent;
    document.getElementById('dashBudgetLeft').textContent = '₹' + remaining.toLocaleString();

    const moodToday = S.moods.find(m => m.date === new Date().toISOString().slice(0, 10));
    document.getElementById('dashWellness').textContent = moodToday ? { great: '😄', good: '😊', okay: '😐', low: '😔', stressed: '😰' }[moodToday.mood] : '--';

    const phase = AI.getCyclePhase();
    document.getElementById('cycleIndicator').querySelector('.cycle-text').textContent = phase.phase !== 'unknown' ? phase.text.split(' ').slice(1).join(' ') : 'Set cycle';

    document.getElementById('energyBadge').querySelector('.energy-text').textContent = S.user.energy.charAt(0).toUpperCase() + S.user.energy.slice(1);

    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = S.tasks.filter(t => !t.done && t.scheduledTime).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
    const todayEvents = S.events.filter(e => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
    const schedItems = [...todayEvents.map(e => `<div class="sched-item"><div class="sched-time">${e.time}</div><div class="sched-bar ${e.type}"></div><div class="sched-info"><div class="sched-title">${esc(e.title)}</div><div class="sched-type">${e.type}</div></div></div>`),
      ...todayTasks.map(t => `<div class="sched-item"><div class="sched-time">${t.scheduledTime}</div><div class="sched-bar personal"></div><div class="sched-info"><div class="sched-title">${esc(t.text)}</div><div class="sched-type">task</div></div></div>`)
    ];
    document.getElementById('dashSchedule').innerHTML = schedItems.length ? schedItems.join('') : '<div class="empty-state">No events today. Add some or let AI plan!</div>';

    const sug = AI.getSuggestions();
    document.getElementById('dashSuggestions').innerHTML = sug.map(s => `<div class="suggestion-item"><span class="si-icon">${s.icon}</span><span class="si-text">${s.text}</span></div>`).join('');

    const cats = {};
    S.expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    const maxCat = Math.max(...Object.values(cats), 1);
    const colors = ['#7ECEC1', '#E8526F', '#D4A853', '#7EB5D6', '#C5A3CF', '#F08A6D'];
    document.getElementById('spendingBars').innerHTML = Object.entries(cats).length > 0
      ? Object.entries(cats).map(([k, v], i) => `<div class="spending-bar-row"><div class="sb-label">${k}</div><div class="sb-bar"><div class="sb-fill" style="width:${(v/maxCat)*100}%;background:${colors[i % colors.length]}"></div></div><div class="sb-value">₹${v.toLocaleString()}</div></div>`).join('')
      : '<div class="empty-state"><div class="empty-text">Log expenses to see spending chart</div></div>';
  }
};
