const Leadership = {
  rewriteEmail() {
    const text = document.getElementById('emailInput').value;
    const tone = document.getElementById('emailTone').value;
    const result = AI.rewriteEmail(text, tone);
    document.getElementById('emailResult').textContent = result;
    document.getElementById('emailOutput').style.display = 'block';
  },
  generatePitch() {
    const role = document.getElementById('pitchRole').value;
    const achievement = document.getElementById('pitchAchievement').value;
    const result = AI.generatePitch(role, achievement);
    document.getElementById('pitchResult').textContent = result;
    document.getElementById('pitchOutput').style.display = 'block';
  },
  negotiationScript() {
    const result = AI.negotiationScript(
      document.getElementById('negCurrentSalary').value,
      document.getElementById('negDesiredSalary').value,
      document.getElementById('negReason').value
    );
    document.getElementById('negResult').textContent = result;
    document.getElementById('negOutput').style.display = 'block';
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
