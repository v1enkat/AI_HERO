function calendarDateKeyLocal(d) {
  d = d || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function parseSleepHoursVal(raw) {
  if (raw == null || raw === '') return null;
  var n = typeof raw === 'number' ? raw : parseFloat(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function escapeBreakHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function incrementWellnessValidBreakLegacy() {
  if (!S.wellnessBreakReminders) {
    S.wellnessBreakReminders = { enabled: false, dayKey: '', validBreaksCount: 0 };
  }
  if (!S.wellnessBreakTaskCount) {
    S.wellnessBreakTaskCount = { dateKey: '', count: 0 };
  }
  var today = calendarDateKeyLocal();
  var w = S.wellnessBreakReminders;
  var btc = S.wellnessBreakTaskCount;
  var fromBr = w.dayKey === today ? Number(w.validBreaksCount) || 0 : 0;
  var fromBtc = btc.dateKey === today ? Number(btc.count) || 0 : 0;
  var next = Math.max(fromBr, fromBtc) + 1;
  S.wellnessBreakReminders = { enabled: w.enabled, dayKey: today, validBreaksCount: next };
  S.wellnessBreakTaskCount = { dateKey: today, count: next };
  S.save();
}

const Wellness = {
  logMood(mood, btn) {
    const today = calendarDateKeyLocal();
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
    const today = calendarDateKeyLocal();
    var todayMood = S.moods.find(function (m) {
      return m.date === today;
    });

    var currentWellnessScore = 50;
    if (todayMood) {
      var moodScores = { great: 90, good: 75, okay: 50, low: 30, stressed: 20 };
      currentWellnessScore = moodScores[todayMood.mood] || 50;
    }

    var br = S.wellnessBreakReminders || { enabled: false, dayKey: '', validBreaksCount: 0 };
    var btc = S.wellnessBreakTaskCount;
    var fromBr = br.dayKey === today ? Number(br.validBreaksCount) || 0 : 0;
    var fromBtc = btc && btc.dateKey === today ? Number(btc.count) || 0 : 0;
    var breaksToday = Math.max(fromBr, fromBtc);
    currentWellnessScore += 10 * breaksToday;

    var sc = Math.min(100, currentWellnessScore);

    var todaysSleep = S.sleepLog.filter(function (e) {
      return e.date === today;
    });
    var sleepEntry = todaysSleep.length ? todaysSleep[todaysSleep.length - 1] : null;

    if (sleepEntry) {
      var h = parseSleepHoursVal(sleepEntry.hours);
      if (h != null && h > 0) {
        if (h >= 7) {
          sc = 100;
        } else {
          sc -= 5 * (7 - h);
        }
      }
    }

    sc = Math.round(Math.max(0, Math.min(100, sc)));
    document.getElementById('wellScoreValue').textContent = sc;
    const offset = 339.3 * (1 - sc / 100);
    document.getElementById('wellScoreCircle').setAttribute('stroke-dashoffset', offset);
  },
  logSleep() {
    const raw = document.getElementById('sleepHours').value;
    const hours = parseFloat(String(raw).replace(',', '.'));
    if (!Number.isFinite(hours) || hours <= 0) return;
    const date = calendarDateKeyLocal();
    const quality = document.getElementById('sleepQuality').value;
    S.sleepLog = S.sleepLog.filter(function (e) {
      return e.date !== date;
    });
    S.sleepLog.push({ date: date, hours: hours, quality: quality });
    S.save();
    toast('😴 Sleep logged!', 'success');
    this.updateWellnessScore();
  },
  _startBreakInterval() {
    var self = this;
    if (S.breakTimer) {
      clearInterval(S.breakTimer);
      S.breakTimer = null;
    }
    S.breakTimer = setInterval(function () {
      var acts = S.breakActivities || [];
      var msg =
        acts.length > 0
          ? acts[Math.floor(Math.random() * acts.length)]
          : 'Time for a break. Add your own activities above for ideas next time.';
      document.getElementById('breakTip').textContent = msg;
      document.getElementById('breakPopup').style.display = 'flex';
      // Scoring is based on completed break tasks, not reminder ticks.
    }, 45 * 60 * 1000);
  },
  toggleBreaks() {
    const on = document.getElementById('breakToggle').checked;
    if (!S.wellnessBreakReminders) {
      S.wellnessBreakReminders = { enabled: false, dayKey: '', validBreaksCount: 0 };
    }
    S.wellnessBreakReminders = {
      enabled: on,
      dayKey: S.wellnessBreakReminders.dayKey,
      validBreaksCount: S.wellnessBreakReminders.validBreaksCount
    };
    S.save();

    if (on) {
      this._startBreakInterval();
      toast('⏰ Break reminders enabled (every 45 min)', 'success');
    } else {
      if (S.breakTimer) {
        clearInterval(S.breakTimer);
        S.breakTimer = null;
      }
      toast('Break reminders disabled', 'info');
    }
    this.updateWellnessScore();
  },
  dismissBreak() {
    document.getElementById('breakPopup').style.display = 'none';
  },
  addBreakActivity() {
    var input = document.getElementById('breakActivityInput');
    if (!input) return;
    var t = input.value.trim().slice(0, 200);
    if (!t) return;
    if (!S.breakActivities) S.breakActivities = [];
    if (S.breakActivities.length >= 40) {
      toast('Maximum 40 activities', 'info');
      return;
    }
    S.breakActivities.push(t);
    input.value = '';
    S.save();
    toast('Break activity added', 'success');
    this.renderBreakActivities();
  },
  removeBreakActivity(i) {
    if (!S.breakActivities || i < 0 || i >= S.breakActivities.length) return;
    S.breakActivities.splice(i, 1);
    S.save();
    this.renderBreakActivities();
  },
  completeBreakActivity(i) {
    if (!S.breakActivities || i < 0 || i >= S.breakActivities.length) return;
    incrementWellnessValidBreakLegacy();
    toast('+10 wellness: break task completed', 'success');
    S.breakActivities.splice(i, 1);
    S.save();
    this.renderBreakActivities();
    this.updateWellnessScore();
  },
  renderBreakActivities() {
    var el = document.getElementById('breakRituals');
    if (!el) return;
    var items = S.breakActivities || [];
    if (items.length === 0) {
      el.innerHTML =
        '<div class="empty-state break-activities-empty"><div class="empty-text">No activities yet — add one above.</div></div>';
      return;
    }
    var self = this;
    el.innerHTML = items
      .map(function (text, i) {
        var safe = escapeBreakHtml(text);
        return (
          '<div class="ritual ritual-custom"><span class="ritual-text">' +
          safe +
          '</span><button type="button" class="ritual-complete" data-break-complete-idx="' +
          i +
          '">Done</button><button type="button" class="ritual-remove" aria-label="Remove" data-break-idx="' +
          i +
          '">×</button></div>'
        );
      })
      .join('');
    el.querySelectorAll('.ritual-complete').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-break-complete-idx'), 10);
        self.completeBreakActivity(idx);
      };
    });
    el.querySelectorAll('.ritual-remove').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-break-idx'), 10);
        self.removeBreakActivity(idx);
      };
    });
  },
  render() {
    if (S.moods.length === 0) {
      document.getElementById('moodHistory').innerHTML = '<div class="empty-state"><div class="empty-text">Log your mood daily to see patterns</div></div>';
    } else {
      const moodEmoji = { great: '😄', good: '😊', okay: '😐', low: '😔', stressed: '😰' };
      const moodColor = { great: 'rgba(126,206,193,0.2)', good: 'rgba(126,206,193,0.12)', okay: 'rgba(212,168,83,0.15)', low: 'rgba(232,82,111,0.12)', stressed: 'rgba(232,82,111,0.2)' };
      document.getElementById('moodHistory').innerHTML = S.moods.slice(-30).map(m => `<div class="mood-dot" style="background:${moodColor[m.mood]}" title="${m.date}: ${m.mood}">${moodEmoji[m.mood]}</div>`).join('');
    }

    const today = calendarDateKeyLocal();
    const todayMood = S.moods.find(m => m.date === today);
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', todayMood && b.dataset.mood === todayMood.mood));

    if (S.cycle.startDate) {
      document.getElementById('cycleStartDate').value = S.cycle.startDate;
      document.getElementById('cycleLength').value = S.cycle.length;
      this.updateCycle();
    }

    var br = S.wellnessBreakReminders || { enabled: false, dayKey: '', validBreaksCount: 0 };
    var toggleEl = document.getElementById('breakToggle');
    if (toggleEl) toggleEl.checked = !!br.enabled;
    if (br.enabled && !S.breakTimer) {
      this._startBreakInterval();
    }
    if (!br.enabled && S.breakTimer) {
      clearInterval(S.breakTimer);
      S.breakTimer = null;
    }

    this.renderBreakActivities();
    this.updateWellnessScore();
  }
};
