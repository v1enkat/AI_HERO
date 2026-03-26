import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHerAIStore } from '../../store/useHerAIStore';
import {
  getDashInsight,
  getSuggestions,
  getCyclePhase,
} from '../../services/aiEngine';
import { calendarDateKey } from '../../utils/calendarDate';

const moodEmoji: Record<string, string> = {
  great: '😄',
  good: '😊',
  okay: '😐',
  low: '😔',
  stressed: '😰',
};

export function DashboardPage() {
  const userName = useHerAIStore((s) => s.user.name);
  const tasks = useHerAIStore((s) => s.tasks);
  const expenses = useHerAIStore((s) => s.expenses);
  const sideIncomes = useHerAIStore((s) => s.sideIncomes);
  const finance = useHerAIStore((s) => s.finance);
  const moods = useHerAIStore((s) => s.moods);
  const events = useHerAIStore((s) => s.events);

  const [bannerOpen, setBannerOpen] = useState(true);

  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.filter((t) => !t.done).length;
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const sideSum = sideIncomes.reduce((s, e) => s + e.amount, 0);
  const totalIncome = (finance.income || 0) + sideSum;
  const remaining = totalIncome - spent;
  const today = calendarDateKey();
  const moodToday = moods.find((m) => m.date === today);
  const wellnessDisplay = moodToday ? moodEmoji[moodToday.mood] ?? '--' : '--';

  const todayTasks = tasks
    .filter((t) => !t.done && t.scheduledTime)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  const todayEvents = events.filter((e) => e.date === today).sort((a, b) => a.time.localeCompare(b.time));

  const sug = getSuggestions();

  const cats: Record<string, number> = {};
  expenses.forEach((e) => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });
  const maxCat = Math.max(...Object.values(cats), 1);
  const colors = ['#7ECEC1', '#E8526F', '#D4A853', '#7EB5D6', '#C5A3CF', '#F08A6D'];

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {userName || 'there'} ✦
        </h1>
        <p className="page-sub">Here&apos;s your day at a glance</p>
      </div>

      {bannerOpen && (
        <div className="ai-banner">
          <div className="ai-banner-icon">🧠</div>
          <div className="ai-banner-content">
            <div className="ai-banner-title">AI Insight</div>
            <div className="ai-banner-text">{getDashInsight()}</div>
          </div>
          <button type="button" className="ai-banner-dismiss" onClick={() => setBannerOpen(false)}>
            ×
          </button>
        </div>
      )}

      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dsc-icon" style={{ background: 'rgba(126,206,193,0.15)', color: '#2a8a7a' }}>
            ✓
          </div>
          <div className="dsc-info">
            <div className="dsc-value">{done}</div>
            <div className="dsc-label">Tasks Done</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dsc-icon" style={{ background: 'rgba(232,82,111,0.12)', color: '#E8526F' }}>
            ◷
          </div>
          <div className="dsc-info">
            <div className="dsc-value">{pending}</div>
            <div className="dsc-label">Pending</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dsc-icon" style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853' }}>
            💰
          </div>
          <div className="dsc-info">
            <div className="dsc-value">₹{remaining.toLocaleString()}</div>
            <div className="dsc-label">Budget Left</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dsc-icon" style={{ background: 'rgba(197,163,207,0.15)', color: '#8B5A9A' }}>
            ♡
          </div>
          <div className="dsc-info">
            <div className="dsc-value">{wellnessDisplay}</div>
            <div className="dsc-label">Wellness</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card large">
          <div className="dc-header">
            <h3>Today&apos;s Schedule</h3>
            <Link to="/app/scheduler" className="dc-action">
              View All →
            </Link>
          </div>
          <div className="dc-body">
            {todayEvents.length === 0 && todayTasks.length === 0 ? (
              <div className="empty-state">No events today. Add some or let AI plan!</div>
            ) : (
              <>
                {todayEvents.map((e) => (
                  <div key={e.id} className="sched-item">
                    <div className="sched-time">{e.time}</div>
                    <div className={`sched-bar ${e.type}`} />
                    <div className="sched-info">
                      <div className="sched-title">{e.title}</div>
                      <div className="sched-type">{e.type}</div>
                    </div>
                  </div>
                ))}
                {todayTasks.map((t) => (
                  <div key={t.id} className="sched-item">
                    <div className="sched-time">{t.scheduledTime}</div>
                    <div className="sched-bar personal" />
                    <div className="sched-info">
                      <div className="sched-title">{t.text}</div>
                      <div className="sched-type">task</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dc-header">
            <h3>AI Suggestions</h3>
            <span className="dc-badge">Smart</span>
          </div>
          <div className="dc-body">
            {sug.map((s, i) => (
              <div key={i} className="suggestion-item">
                <span className="si-icon">{s.icon}</span>
                <span className="si-text">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dc-header">
            <h3>Quick Add</h3>
          </div>
          <div className="dc-body quick-add-grid">
            <Link to="/app/productivity" className="quick-btn">
              ➕ Task
            </Link>
            <Link to="/app/finance" className="quick-btn">
              💳 Expense
            </Link>
            <Link to="/app/home" className="quick-btn">
              🛒 Grocery
            </Link>
            <Link to="/app/wellness" className="quick-btn">
              😊 Mood
            </Link>
            <Link to="/app/learning" className="quick-btn">
              📚 Learn
            </Link>
            <Link to="/app/aichat" className="quick-btn">
              🧠 Ask AI
            </Link>
          </div>
        </div>

        <div className="dash-card">
          <div className="dc-header">
            <h3>Spending This Week</h3>
            <Link to="/app/finance" className="dc-action">
              Details →
            </Link>
          </div>
          <div className="dc-body">
            <div className="spending-bar-container">
              {Object.keys(cats).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-text">Log expenses to see spending chart</div>
                </div>
              ) : (
                Object.entries(cats).map(([k, v], i) => (
                  <div key={k} className="spending-bar-row">
                    <div className="sb-label">{k}</div>
                    <div className="sb-bar">
                      <div
                        className="sb-fill"
                        style={{
                          width: `${(v / maxCat) * 100}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                    <div className="sb-value">₹{v.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="page-sub" style={{ marginTop: '1.5rem', opacity: 0.85 }}>
        Cycle: {getCyclePhase().text} — data stays in your browser (localStorage).
      </p>
    </section>
  );
}
