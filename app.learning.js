const Learning = {
  setStyle(s) { S.user.learningStyle = s; S.save(); },
  openAdd() {
    Modal.open('Add Skill to Learn', `
      <label>Skill Name</label>
      <input type="text" id="addSkillName" placeholder="e.g., Excel, Python, Public Speaking">
      <button class="btn btn-primary" onclick="Learning.addSkill()">Add Skill</button>
    `);
  },
  addSkill() {
    const name = document.getElementById('addSkillName').value.trim();
    if (!name) return;
    S.skills.push({ id: Date.now(), name, progress: 0, minutes: 0 });
    S.save();
    Modal.close();
    this.render();
    toast('🎓 Skill added! Start learning with AI Instructor below.', 'success');
  },
  async sendMsg() {
    const input = document.getElementById('instructorInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('instructorMessages');
    container.innerHTML += `<div class="ic-msg user">${esc(msg)}</div>`;

    const thinkingId = 'inst-thinking-' + Date.now();
    container.innerHTML += `<div class="ic-msg ai" id="${thinkingId}"><span class="ic-label">AI Instructor</span><span class="typing-indicator"><span></span><span></span><span></span></span></div>`;
    container.scrollTop = container.scrollHeight;

    try {
      const response = await AI.instructorChatLLM(msg, S.user.learningStyle);
      const el = document.getElementById(thinkingId);
      if (el) el.innerHTML = `<span class="ic-label">AI Instructor</span>${response.replace(/\n/g, '<br>')}`;
    } catch (e) {
      const fallback = AI.instructorChat(msg, S.user.learningStyle);
      const el = document.getElementById(thinkingId);
      if (el) el.innerHTML = `<span class="ic-label">AI Instructor</span>${fallback.replace(/\n/g, '<br>')}`;
    }
    container.scrollTop = container.scrollHeight;

    if (S.skills.length > 0) {
      S.skills[0].minutes += 10;
      S.skills[0].progress = Math.min(100, S.skills[0].progress + 5);
      S.save();
      this.render();
    }
  },
  render() {
    const total = S.skills.reduce((s, k) => s + k.minutes, 0);
    document.getElementById('lpMinutes').textContent = total;
    document.getElementById('lpSkills').textContent = S.skills.length;
    const streak = S.moods.length;
    document.getElementById('lpStreak').textContent = Math.min(streak, 30);

    if (S.skills.length === 0) {
      document.getElementById('skillPath').innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-text">Tell AI what you want to learn!</div><button class="btn btn-primary" onclick="Learning.openAdd()">+ Add Skill to Learn</button></div>';
      return;
    }
    document.getElementById('skillPath').innerHTML = S.skills.map(s => `
      <div class="skill-card">
        <h4>📘 ${esc(s.name)}</h4>
        <div class="skill-progress-bar"><div class="skill-progress-fill" style="width:${s.progress}%"></div></div>
        <div class="skill-meta">${s.progress}% complete · ${s.minutes} min learned</div>
      </div>
    `).join('');
  }
};
