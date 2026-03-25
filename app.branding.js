const Branding = {
  async optimizeLinkedIn() {
    const resultEl = document.getElementById('linkedinResult');
    const outputEl = document.getElementById('linkedinOutput');

    outputEl.style.display = 'block';
    resultEl.textContent = '';
    resultEl.parentElement.classList.add('llm-loading');

    const result = await AI.linkedinHeadlinesLLM(
      document.getElementById('linkedinRole').value,
      document.getElementById('linkedinSkills').value
    );
    resultEl.textContent = result;
    resultEl.parentElement.classList.remove('llm-loading');
  },
  async generatePost() {
    const resultEl = document.getElementById('postResult');
    const outputEl = document.getElementById('postOutput');

    outputEl.style.display = 'block';
    resultEl.textContent = '';
    resultEl.parentElement.classList.add('llm-loading');

    const result = await AI.socialPostLLM(
      document.getElementById('postTopic').value,
      document.getElementById('postPlatform').value
    );
    resultEl.textContent = result;
    resultEl.parentElement.classList.remove('llm-loading');
  },
  openAddWin() {
    Modal.open('Log a Win', `
      <label>Achievement</label>
      <input type="text" id="addWinText" placeholder="What did you accomplish?">
      <label>Date</label>
      <input type="date" id="addWinDate" value="${new Date().toISOString().slice(0, 10)}">
      <button class="btn btn-primary" onclick="Branding.addWin()">Add Win 🏆</button>
    `);
  },
  addWin() {
    const text = document.getElementById('addWinText').value.trim();
    if (!text) return;
    S.wins.push({ id: Date.now(), text, date: document.getElementById('addWinDate').value });
    S.save();
    Modal.close();
    this.render();
    toast('🏆 Win logged! Keep building your success story.', 'success');
  },
  render() {
    if (S.wins.length === 0) {
      document.getElementById('successTimeline').innerHTML = '<div class="empty-state"><div class="empty-text">Start logging your achievements!</div></div>';
    } else {
      document.getElementById('successTimeline').innerHTML = S.wins.slice().reverse().map(w => `
        <div class="win-item">
          <div class="win-dot"></div>
          <div class="win-date">${w.date}</div>
          <div class="win-text">${esc(w.text)}</div>
        </div>
      `).join('');
    }
  }
};
