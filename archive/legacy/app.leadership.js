const Leadership = {
  async rewriteEmail() {
    const text = document.getElementById('emailInput').value;
    const tone = document.getElementById('emailTone').value;
    const outputEl = document.getElementById('emailOutput');
    const resultEl = document.getElementById('emailResult');

    outputEl.style.display = 'block';
    resultEl.textContent = '';
    resultEl.parentElement.classList.add('llm-loading');

    const result = await AI.rewriteEmailLLM(text, tone);
    resultEl.textContent = result;
    resultEl.parentElement.classList.remove('llm-loading');
  },
  async generatePitch() {
    const role = document.getElementById('pitchRole').value;
    const achievement = document.getElementById('pitchAchievement').value;
    const outputEl = document.getElementById('pitchOutput');
    const resultEl = document.getElementById('pitchResult');

    outputEl.style.display = 'block';
    resultEl.textContent = '';
    resultEl.parentElement.classList.add('llm-loading');

    const result = await AI.generatePitchLLM(role, achievement);
    resultEl.textContent = result;
    resultEl.parentElement.classList.remove('llm-loading');
  },
  async negotiationScript() {
    const resultEl = document.getElementById('negResult');
    const outputEl = document.getElementById('negOutput');

    outputEl.style.display = 'block';
    resultEl.textContent = '';
    resultEl.parentElement.classList.add('llm-loading');

    const result = await AI.negotiationScriptLLM(
      document.getElementById('negCurrentSalary').value,
      document.getElementById('negDesiredSalary').value,
      document.getElementById('negReason').value
    );
    resultEl.textContent = result;
    resultEl.parentElement.classList.remove('llm-loading');
  },
  nextLesson() {
    const lessons = AI.leadershipLessons;
    const idx = Math.floor(Math.random() * lessons.length);
    const l = lessons[idx];
    document.getElementById('microLesson').innerHTML = `
      <div class="ml-topic">${l.topic}</div>
      <div class="ml-content">${l.content}</div>
      <div class="ml-action">${l.action}</div>
    `;
  }
};
