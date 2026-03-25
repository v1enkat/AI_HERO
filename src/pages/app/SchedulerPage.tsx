import { useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';
import { getCyclePhase, workloadLevel } from '../../services/aiEngine';

export function SchedulerPage() {
  const { toast } = useToast();
  const events = useHerAIStore((s) => s.events);
  const schedulerOffset = useHerAIStore((s) => s.schedulerOffset);
  const setSchedulerOffset = useHerAIStore((s) => s.setSchedulerOffset);
  const addEvent = useHerAIStore((s) => s.addEvent);
  const removeEvent = useHerAIStore((s) => s.removeEvent);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState('');
  const [type, setType] = useState('work');

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + schedulerOffset);
    return d;
  }, [schedulerOffset]);

  const dt = viewDate.toISOString().slice(0, 10);
  const dateLabel =
    schedulerOffset === 0
      ? 'Today'
      : viewDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });

  const dayEvents = events
    .filter((e) => e.date === dt)
    .sort((a, b) => a.time.localeCompare(b.time));

  const wl = workloadLevel();

  const openAdd = () => {
    setTitle('');
    setTime('09:00');
    setDate(dt);
    setType('work');
    setModalOpen(true);
  };

  const submitEvent = () => {
    const t = title.trim();
    if (!t) return;
    addEvent({ title: t, time, date: date || dt, type });
    setModalOpen(false);
    toast('📅 Event added!', 'success');
  };

  const aiPlan = () => {
    const existing = events.filter((e) => e.date === dt);
    if (existing.length > 0) {
      toast('Day already has events. Clear them first or add manually.', 'warning');
      return;
    }
    const phase = getCyclePhase();
    const templates: { title: string; time: string; type: string }[] = [
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
      templates[1]!.title = 'Light tasks (menstrual phase)';
      templates.splice(4, 0, {
        title: 'Extra rest — listen to your body',
        time: '12:30',
        type: 'rest',
      });
    }
    templates.forEach((t) => {
      addEvent({ ...t, date: dt });
    });
    toast('🧠 AI planned your day! Adjusted for your cycle phase.', 'success');
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">📅 Smart Scheduler</h1>
        <p className="page-sub">Cycle-aware planning & workload balance</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            + Add Event
          </button>
          <button type="button" className="btn btn-ghost" onClick={aiPlan}>
            🧠 AI Auto-Plan
          </button>
        </div>
        <div className="toolbar-right">
          <button type="button" className="btn btn-sm" onClick={() => setSchedulerOffset((n) => n - 1)}>
            ←
          </button>
          <span className="scheduler-date" id="schedulerDate">
            {dateLabel}
          </span>
          <button type="button" className="btn btn-sm" onClick={() => setSchedulerOffset((n) => n + 1)}>
            →
          </button>
        </div>
      </div>

      <div className="workload-indicator" id="workloadBar">
        <div className="wi-label">
          Workload: <strong id="workloadLevel">{wl.level}</strong>
        </div>
        <div className="wi-bar">
          <div
            className="wi-fill"
            id="workloadFill"
            style={{ width: `${wl.pct}%`, background: wl.color }}
          />
        </div>
        <div className="wi-note" id="workloadNote">
          {wl.note}
        </div>
      </div>

      <div className="schedule-timeline" id="scheduleTimeline">
        {dayEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-text">No events scheduled. Let AI plan your day!</div>
          </div>
        ) : (
          dayEvents.map((e) => (
            <div key={e.id} className="sched-item">
              <div className="sched-time">{e.time}</div>
              <div className={`sched-bar ${e.type}`} />
              <div className="sched-info">
                <div className="sched-title">{e.title}</div>
                <div className="sched-type">{e.type}</div>
              </div>
              <button type="button" className="ti-delete" onClick={() => removeEvent(e.id)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} title="Add Event" onClose={() => setModalOpen(false)}>
        <label htmlFor="evTitle">Event Title</label>
        <input
          id="evTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting, errand, etc."
        />
        <label htmlFor="evTime">Time</label>
        <input id="evTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <label htmlFor="evDate">Date</label>
        <input id="evDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label htmlFor="evType">Type</label>
        <select id="evType" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="errand">Errand</option>
          <option value="learning">Learning</option>
          <option value="rest">Rest</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={submitEvent}>
          Add Event
        </button>
      </Modal>
    </section>
  );
}
