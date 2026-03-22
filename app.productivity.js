const Productivity = {
  openAdd() {
    Modal.open('Add Task', `
      <label>Task</label>
      <input type="text" id="addTaskText" placeholder="What needs to be done?">
      <label>Priority</label>
      <select id="addTaskPriority"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select>
      <label>Category</label>
      <select id="addTaskCat"><option value="work">Work</option><option value="personal">Personal</option><option value="errand">Errand</option><option value="learning">Learning</option></select>
      <label>Scheduled Time (optional)</label>
      <input type="time" id="addTaskTime">
      <button class="btn btn-primary" onclick="Productivity.add()">Add Task</button>
    `);
  },
  add() {
    const text = document.getElementById('addTaskText').value.trim();
    if (!text) return;
    S.tasks.push({
      id: Date.now(),
      text,
      priority: document.getElementById('addTaskPriority').value,
      category: document.getElementById('addTaskCat').value,
      scheduledTime: document.getElementById('addTaskTime').value || null,
      done: false,
      created: new Date().toISOString()
    });
    S.save();
    Modal.close();
    this.render();
    toast('✅ Task added!', 'success');
  },
  toggle(id) {
    const t = S.tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; S.save(); this.render(); }
  },
  remove(id) {
    S.tasks = S.tasks.filter(t => t.id !== id);
    S.save();
    this.render();
  },
  setEnergy(level) {
    S.user.energy = level;
    S.save();
    document.querySelectorAll('.et-btn').forEach(b => b.classList.toggle('active', b.dataset.level === level));
    document.getElementById('energySuggestion').textContent = AI.getEnergyTip(level);
  },
  autoSchedule() {
    const msg = AI.autoScheduleTasks();
    toast('🧠 ' + msg, 'success');
    this.render();
  },
  startFocus(minutes = 25) {
    if (S.focusTimer) return;
    let remaining = minutes * 60;
    const bar = document.getElementById('focusTimerBar');
    bar.style.display = 'flex';
    const update = () => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      document.getElementById('focusTime').textContent = `${m}:${s.toString().padStart(2, '0')}`;
      document.getElementById('focusFill').style.width = ((1 - remaining / (minutes * 60)) * 100) + '%';
      if (remaining <= 0) { this.stopFocus(); toast('🎉 Focus block complete! Take a break.', 'success'); return; }
      remaining--;
    };
    update();
    S.focusTimer = setInterval(update, 1000);
  },
  stopFocus() {
    clearInterval(S.focusTimer);
    S.focusTimer = null;
    document.getElementById('focusTimerBar').style.display = 'none';
  },
  render() {
    const filter = document.getElementById('taskFilter')?.value || 'all';
    let tasks = [...S.tasks];
    if (filter === 'today') tasks = tasks.filter(t => t.created?.startsWith(new Date().toISOString().slice(0, 10)));
    if (filter === 'pending') tasks = tasks.filter(t => !t.done);
    if (filter === 'done') tasks = tasks.filter(t => t.done);

    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] || 1) - (p[b.priority] || 1);
    });

    if (tasks.length === 0) {
      document.getElementById('taskList').innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No tasks yet. Add your first task!</div></div>';
      return;
    }

    document.getElementById('taskList').innerHTML = tasks.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <button class="ti-check ${t.done ? 'checked' : ''}" onclick="Productivity.toggle(${t.id})">✓</button>
        <div class="ti-body">
          <div class="ti-text">${esc(t.text)}</div>
          <div class="ti-meta">
            <span class="ti-priority ${t.priority}">${t.priority}</span>
            <span>${t.category}</span>
            ${t.scheduledTime ? `<span>⏰ ${t.scheduledTime}</span>` : ''}
          </div>
        </div>
        ${t.scheduledTime ? '' : `<button class="btn btn-sm" onclick="Productivity.startFocus()" title="Start focus block">▶</button>`}
        <button class="ti-delete" onclick="Productivity.remove(${t.id})">×</button>
      </div>
    `).join('');
  }
};
