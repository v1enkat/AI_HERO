const Scheduler = {
  getDate() {
    const d = new Date();
    d.setDate(d.getDate() + S.schedulerOffset);
    return d;
  },
  openAdd() {
    const dt = this.getDate().toISOString().slice(0, 10);
    Modal.open('Add Event', `
      <label>Event Title</label>
      <input type="text" id="addEventTitle" placeholder="Meeting, errand, etc.">
      <label>Time</label>
      <input type="time" id="addEventTime" value="09:00">
      <label>Date</label>
      <input type="date" id="addEventDate" value="${dt}">
      <label>Type</label>
      <select id="addEventType"><option value="work">Work</option><option value="personal">Personal</option><option value="errand">Errand</option><option value="learning">Learning</option><option value="rest">Rest</option></select>
      <button class="btn btn-primary" onclick="Scheduler.add()">Add Event</button>
    `);
  },
  add() {
    const title = document.getElementById('addEventTitle').value.trim();
    if (!title) return;
    S.events.push({
      id: Date.now(),
      title,
      time: document.getElementById('addEventTime').value,
      date: document.getElementById('addEventDate').value,
      type: document.getElementById('addEventType').value
    });
    S.save();
    Modal.close();
    this.render();
    toast('📅 Event added!', 'success');
  },
  prevDay() { S.schedulerOffset--; this.render(); },
  nextDay() { S.schedulerOffset++; this.render(); },
  aiPlan() {
    const dt = this.getDate().toISOString().slice(0, 10);
    const existing = S.events.filter(e => e.date === dt);
    if (existing.length === 0) {
      const phase = AI.getCyclePhase();
      const templates = [
        { title: 'Morning routine & planning', time: '08:00', type: 'personal' },
        { title: 'Deep work / Focus block', time: '09:30', type: 'work' },
        { title: 'Quick break & stretch', time: '11:00', type: 'rest' },
        { title: 'Collaborative work / Meetings', time: '11:15', type: 'work' },
        { title: 'Lunch break', time: '13:00', type: 'rest' },
        { title: 'Afternoon tasks', time: '14:00', type: 'work' },
        { title: '10-min learning capsule', time: '15:30', type: 'learning' },
        { title: 'Wrap up & plan tomorrow', time: '17:00', type: 'personal' },
      ];
      if (phase.phase === 'menstrual') {
        templates[1].title = 'Light tasks (menstrual phase)';
        templates.splice(4, 0, { title: 'Extra rest — listen to your body', time: '12:30', type: 'rest' });
      }
      templates.forEach(t => {
        S.events.push({ id: Date.now() + Math.random(), ...t, date: dt });
      });
      S.save();
      toast('🧠 AI planned your day! Adjusted for your cycle phase.', 'success');
    } else {
      toast('Day already has events. Clear them first or add manually.', 'warning');
    }
    this.render();
  },
  render() {
    const d = this.getDate();
    const dt = d.toISOString().slice(0, 10);
    const opts = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('schedulerDate').textContent = S.schedulerOffset === 0 ? 'Today' : d.toLocaleDateString('en-US', opts);

    const wl = AI.workloadLevel();
    document.getElementById('workloadLevel').textContent = wl.level;
    document.getElementById('workloadFill').style.width = wl.pct + '%';
    document.getElementById('workloadFill').style.background = wl.color;
    document.getElementById('workloadNote').textContent = wl.note;

    const events = S.events.filter(e => e.date === dt).sort((a, b) => a.time.localeCompare(b.time));
    if (events.length === 0) {
      document.getElementById('scheduleTimeline').innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">No events scheduled. Let AI plan your day!</div></div>';
      return;
    }
    document.getElementById('scheduleTimeline').innerHTML = events.map(e => `
      <div class="sched-item">
        <div class="sched-time">${e.time}</div>
        <div class="sched-bar ${e.type}"></div>
        <div class="sched-info">
          <div class="sched-title">${esc(e.title)}</div>
          <div class="sched-type">${e.type}</div>
        </div>
        <button class="ti-delete" onclick="Scheduler.remove(${JSON.stringify(e.id)})">×</button>
      </div>
    `).join('');
  },
  remove(id) {
    S.events = S.events.filter(e => e.id !== id);
    S.save();
    this.render();
  }
};
