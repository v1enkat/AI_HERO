const Wellness = {
  logMood(mood, btn) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = S.moods.findIndex(m => m.date === today);
    if (existing >= 0) S.moods[existing].mood = mood;
    else S.moods.push({ date: today, mood });
    S.save();
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    toast('💜 Mood logged!', 'success');
    this.render();
    this.updateWellnessScore();
  },
  openMood() {
    Router.go('wellness');
  },
  updateCycle() {
    S.cycle.startDate = document.getElementById('cycleStartDate').value;
    S.cycle.length = parseInt(document.getElementById('cycleLength').value) || 28;
    S.save();
    const phase = AI.getCyclePhase();
    document.getElementById('ctPhaseName').textContent = phase.text;
    document.getElementById('ctPhaseDay').textContent = phase.day ? `Day ${phase.day} of your cycle` : '';
    document.getElementById('ctRecommendations').innerHTML = phase.recs || '';
    document.getElementById('cycleIndicator').querySelector('.cycle-text').textContent = phase.phase !== 'unknown' ? phase.text.split(' ').slice(1).join(' ') : 'Set cycle';
  },
  updateWellnessScore() {
    let score = 50;
    const today = new Date().toISOString().slice(0, 10);
    const todayMood = S.moods.find(m => m.date === today);
    if (todayMood) {
      const moodScores = { great: 90, good: 75, okay: 50, low: 30, stressed: 20 };
      score = moodScores[todayMood.mood] || 50;
    }
    const lastSleep = S.sleepLog[S.sleepLog.length - 1];
    if (lastSleep) {
      if (lastSleep.hours >= 7 && lastSleep.hours <= 9) score += 10;
      if (lastSleep.quality === 'great') score += 5;
      if (lastSleep.quality === 'poor') score -= 10;
    }
    score = Math.max(0, Math.min(100, score));
    document.getElementById('wellScoreValue').textContent = score;
    const offset = 339.3 * (1 - score / 100);
    document.getElementById('wellScoreCircle').setAttribute('stroke-dashoffset', offset);
  },
  logSleep() {
    const hours = parseFloat(document.getElementById('sleepHours').value);
    if (!hours) return;
    S.sleepLog.push({
      date: new Date().toISOString().slice(0, 10),
      hours,
      quality: document.getElementById('sleepQuality').value
    });
    S.save();
    toast('😴 Sleep logged!', 'success');
    this.updateWellnessScore();
  },
  toggleBreaks() {
    const on = document.getElementById('breakToggle').checked;
    if (on) {
      S.breakTimer = setInterval(() => {
        const tips = [
          'Take 5 deep breaths. Inhale 4 seconds, hold 4, exhale 4.',
          'Drink a glass of water. Hydration boosts focus.',
          'Look at something 20 feet away for 20 seconds (20-20-20 rule).',
          'Stand up and stretch for 30 seconds.',
          'Close your eyes and relax your shoulders for 1 minute.'
        ];
        document.getElementById('breakTip').textContent = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById('breakPopup').style.display = 'flex';
      }, 45 * 60 * 1000);
      toast('⏰ Break reminders enabled (every 45 min)', 'success');
    } else {
      clearInterval(S.breakTimer);
      S.breakTimer = null;
      toast('Break reminders disabled', 'info');
    }
  },
  dismissBreak() {
    document.getElementById('breakPopup').style.display = 'none';
  },
  render() {
    if (S.moods.length === 0) {
      document.getElementById('moodHistory').innerHTML = '<div class="empty-state"><div class="empty-text">Log your mood daily to see patterns</div></div>';
    } else {
      const moodEmoji = { great: '😄', good: '😊', okay: '😐', low: '😔', stressed: '😰' };
      const moodColor = { great: 'rgba(126,206,193,0.2)', good: 'rgba(126,206,193,0.12)', okay: 'rgba(212,168,83,0.15)', low: 'rgba(232,82,111,0.12)', stressed: 'rgba(232,82,111,0.2)' };
      document.getElementById('moodHistory').innerHTML = S.moods.slice(-30).map(m => `<div class="mood-dot" style="background:${moodColor[m.mood]}" title="${m.date}: ${m.mood}">${moodEmoji[m.mood]}</div>`).join('');
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayMood = S.moods.find(m => m.date === today);
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', todayMood && b.dataset.mood === todayMood.mood));

    if (S.cycle.startDate) {
      document.getElementById('cycleStartDate').value = S.cycle.startDate;
      document.getElementById('cycleLength').value = S.cycle.length;
      this.updateCycle();
    }

    this.updateWellnessScore();
  }
};
