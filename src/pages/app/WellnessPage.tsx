import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';
import { getCyclePhase } from '../../services/aiEngine';

const moodEmoji: Record<string, string> = {
  great: '😄',
  good: '😊',
  okay: '😐',
  low: '😔',
  stressed: '😰',
};
const moodColor: Record<string, string> = {
  great: 'rgba(126,206,193,0.2)',
  good: 'rgba(126,206,193,0.12)',
  okay: 'rgba(212,168,83,0.15)',
  low: 'rgba(232,82,111,0.12)',
  stressed: 'rgba(232,82,111,0.2)',
};

export function WellnessPage() {
  const { toast } = useToast();
  const moods = useHerAIStore((s) => s.moods);
  const sleepLog = useHerAIStore((s) => s.sleepLog);
  const cycle = useHerAIStore((s) => s.cycle);
  const logMood = useHerAIStore((s) => s.logMood);
  const setCycle = useHerAIStore((s) => s.setCycle);
  const addSleep = useHerAIStore((s) => s.addSleep);

  const [startDate, setStartDate] = useState(cycle.startDate);
  const [endDate, setEndDate] = useState(cycle.endDate ?? '');
  const [length, setLength] = useState(String(cycle.length || 28));
  const [sleepH, setSleepH] = useState('');
  const [sleepQ, setSleepQ] = useState('good');
  const [breaksOn, setBreaksOn] = useState(false);
  const breakRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStartDate(cycle.startDate);
    setEndDate(cycle.endDate ?? '');
    setLength(String(cycle.length || 28));
  }, [cycle.startDate, cycle.endDate, cycle.length]);

  useEffect(() => {
    return () => {
      if (breakRef.current) clearInterval(breakRef.current);
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayMood = moods.find((m) => m.date === today)?.mood;

  const score = useMemo(() => {
    let sc = 50;
    if (todayMood) {
      const moodScores: Record<string, number> = {
        great: 90,
        good: 75,
        okay: 50,
        low: 30,
        stressed: 20,
      };
      sc = moodScores[todayMood] ?? 50;
    }
    const lastSleep = sleepLog[sleepLog.length - 1];
    if (lastSleep) {
      if (lastSleep.hours >= 7 && lastSleep.hours <= 9) sc += 10;
      if (lastSleep.quality === 'great') sc += 5;
      if (lastSleep.quality === 'poor') sc -= 10;
    }
    return Math.max(0, Math.min(100, sc));
  }, [todayMood, sleepLog]);

  const phase = getCyclePhase();
  const dashOffset = 339.3 * (1 - score / 100);

  const daysSinceLastPeriodStart = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    return Math.max(0, diff);
  }, [startDate]);

  const cycleIntervalDays = parseInt(length, 10) || 28;

  /** Advisory tied to the same “days since last period” count shown above (current cycle length so far). */
  const daysSinceAdvisory = useMemo(() => {
    if (daysSinceLastPeriodStart == null) return null;
    if (daysSinceLastPeriodStart > 35) {
      return 'This may be due to delayed or absent ovulation caused by stress, hormonal imbalance, pregnancy, thyroid disorders, or PCOS.';
    }
    return null;
  }, [daysSinceLastPeriodStart]);

  /** Short-cycle note: uses typical interval from the form so we don’t warn on day 1–20 of a normal cycle. */
  const shortCycleAdvisory = useMemo(() => {
    if (cycleIntervalDays >= 21) return null;
    return 'This may be due to hormonal imbalance, stress, thyroid issues, or conditions like PCOS, leading to early ovulation and shorter cycles.';
  }, [cycleIntervalDays]);

  const cycleIntervalNote = daysSinceAdvisory ?? shortCycleAdvisory;

  const updateCycle = () => {
    let safeEnd = endDate;
    if (startDate && safeEnd && safeEnd < startDate) {
      safeEnd = startDate;
      setEndDate(safeEnd);
      toast('Last day of period cannot be before the start date.', 'info');
    }
    setCycle({
      startDate,
      endDate: safeEnd,
      length: cycleIntervalDays,
    });
  };

  const onSleep = () => {
    const h = parseFloat(sleepH);
    if (!h) return;
    addSleep(h, sleepQ);
    setSleepH('');
    toast('😴 Sleep logged!', 'success');
  };

  const toggleBreaks = (on: boolean) => {
    setBreaksOn(on);
    if (breakRef.current) {
      clearInterval(breakRef.current);
      breakRef.current = null;
    }
    if (on) {
      breakRef.current = setInterval(() => {
        const tips = [
          'Take 5 deep breaths.',
          'Drink a glass of water.',
          'Look at something 20 feet away for 20 seconds.',
          'Stand up and stretch for 30 seconds.',
        ];
        toast(tips[Math.floor(Math.random() * tips.length)]!, 'info');
      }, 45 * 60 * 1000);
      toast('⏰ Break reminders enabled (every 45 min)', 'success');
    } else {
      toast('Break reminders disabled', 'info');
    }
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">💜 Wellness Guardian</h1>
        <p className="page-sub">Cycle-aware self-care, mood tracking, and stress management</p>
      </div>

      <div className="wellness-top">
        <div className="well-card">
          <h3>How are you feeling?</h3>
          <div className="mood-selector">
            {(['great', 'good', 'okay', 'low', 'stressed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={'mood-btn' + (todayMood === m ? ' active' : '')}
                onClick={() => {
                  logMood(m);
                  toast('💜 Mood logged!', 'success');
                }}
              >
                {moodEmoji[m]}
                <span style={{ textTransform: 'capitalize' }}>{m}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="well-card">
          <h3>Wellness Score</h3>
          <div className="wellness-score-ring">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(197,163,207,0.2)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#wellGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="339.3"
                strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="wellGrad">
                  <stop offset="0%" stopColor="#7ECEC1" />
                  <stop offset="100%" stopColor="#C5A3CF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="score-value" id="wellScoreValue">
              {score}
            </div>
          </div>
        </div>
      </div>

      <div className="well-card wide">
        <h3>🌙 Cycle Tracker</h3>
        <p className="lead-desc">Track your cycle and get phase-specific recommendations.</p>
        <div className="cycle-tracker-grid">
          <div className="ct-input-group">
            <label htmlFor="csd">Start date of your last period:</label>
            <input
              id="csd"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={updateCycle}
            />
            <label htmlFor="ced">Last day of your last period:</label>
            <input
              id="ced"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={updateCycle}
            />
            <label htmlFor="cl">Average days between period starts:</label>
            <input
              id="cl"
              type="number"
              min={15}
              max={60}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              onBlur={updateCycle}
            />
          </div>
          <div className="ct-phase-display" id="cyclePhaseDisplay">
            <div className="ct-days-since-block">
              <div className="ct-phase-name">Since your last period</div>
              {startDate ? (
                <>
                  <div className="ct-days-since-value">
                    <div className="ct-days-since-line-main">
                      <span className="ct-days-since-num">{daysSinceLastPeriodStart}</span>
                      <span className="ct-days-since-unit">
                        {daysSinceLastPeriodStart === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <div className="ct-days-since-caption">since the start of your last period</div>
                  </div>
                  {cycleIntervalNote ? (
                    <p className="ct-cycle-advisory">{cycleIntervalNote}</p>
                  ) : null}
                </>
              ) : (
                <div className="ct-phase-day">Enter your period dates on the left to see how many days have passed.</div>
              )}
            </div>
            <div className="ct-phase-divider" />
            <div className="ct-phase-name" id="ctPhaseName">
              {phase.text}
            </div>
            <div className="ct-phase-day" id="ctPhaseDay">
              {phase.day ? `Day ${phase.day} of your cycle` : ''}
            </div>
            <div className="ct-recommendations" id="ctRecommendations">
              {phase.recs}
            </div>
          </div>
        </div>
      </div>

      <div className="well-card wide">
        <h3>Mood History</h3>
        <div className="mood-history" id="moodHistory">
          {moods.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">Log your mood daily to see patterns</div>
            </div>
          ) : (
            moods.slice(-30).map((m) => (
              <div
                key={m.date + m.mood}
                className="mood-dot"
                style={{ background: moodColor[m.mood] ?? 'rgba(0,0,0,0.1)' }}
                title={`${m.date}: ${m.mood}`}
              >
                {moodEmoji[m.mood] ?? '•'}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="well-card">
        <h3>⏰ Smart Break Reminder</h3>
        <p className="lead-desc">Get reminded to take breaks based on your work patterns.</p>
        <div className="break-toggle">
          <label className="toggle">
            <input
              type="checkbox"
              checked={breaksOn}
              onChange={(e) => toggleBreaks(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
          <span>Break reminders every 45 minutes</span>
        </div>
        <div className="break-rituals" id="breakRituals">
          <div className="ritual">🧘 5 deep breaths</div>
          <div className="ritual">💧 Drink water</div>
          <div className="ritual">👀 Look at something 20ft away for 20 seconds</div>
          <div className="ritual">🚶 Quick stretch or walk</div>
        </div>
      </div>

      <div className="well-card">
        <h3>😴 Sleep Log</h3>
        <div className="sleep-input">
          <label htmlFor="sh">Hours slept last night:</label>
          <input
            id="sh"
            type="number"
            min={0}
            max={14}
            step={0.5}
            placeholder="7.5"
            value={sleepH}
            onChange={(e) => setSleepH(e.target.value)}
          />
          <label htmlFor="sq">Sleep quality:</label>
          <select id="sq" value={sleepQ} onChange={(e) => setSleepQ(e.target.value)}>
            <option value="great">Great - woke up refreshed</option>
            <option value="good">Good - slept well</option>
            <option value="okay">Okay - could be better</option>
            <option value="poor">Poor - tossed and turned</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={onSleep}>
            Log Sleep
          </button>
        </div>
      </div>
    </section>
  );
}
