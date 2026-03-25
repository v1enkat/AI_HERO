import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';
import { getEnergyTip, runAutoScheduleTasks } from '../../services/aiEngine';

export function ProductivityPage() {
  const { toast } = useToast();
  const user = useHerAIStore((s) => s.user);
  const tasks = useHerAIStore((s) => s.tasks);
  const addTask = useHerAIStore((s) => s.addTask);
  const toggleTask = useHerAIStore((s) => s.toggleTask);
  const removeTask = useHerAIStore((s) => s.removeTask);
  const setUser = useHerAIStore((s) => s.setUser);

  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCat, setNewCat] = useState('work');
  const [newTime, setNewTime] = useState('');
  const [energyTip, setEnergyTip] = useState(() => getEnergyTip(user.energy));
  const [focusOn, setFocusOn] = useState(false);
  const [focusLeft, setFocusLeft] = useState(0);
  const focusRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setEnergyTip(getEnergyTip(user.energy));
  }, [user.energy]);

  useEffect(() => {
    return () => {
      if (focusRef.current) clearInterval(focusRef.current);
    };
  }, []);

  let list = [...tasks];
  if (filter === 'today') {
    const d = new Date().toISOString().slice(0, 10);
    list = list.filter((t) => t.created?.startsWith(d));
  } else if (filter === 'pending') list = list.filter((t) => !t.done);
  else if (filter === 'done') list = list.filter((t) => t.done);

  list.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const recommended = (t: (typeof tasks)[0]) => {
    if (t.done) return '';
    const energy = user.energy;
    if (energy === 'high' && t.priority === 'high') return 'energy-recommended';
    if (energy === 'medium' && t.priority === 'medium') return 'energy-recommended';
    if (energy === 'low' && t.priority === 'low') return 'energy-recommended';
    if (energy === 'low' && t.priority === 'high') return 'energy-dimmed';
    if (energy === 'high' && t.priority === 'low') return 'energy-dimmed';
    return '';
  };

  const badge = (t: (typeof tasks)[0]) => {
    const cls = recommended(t);
    if (cls === 'energy-recommended') return <span className="energy-match">⚡ Do now</span>;
    if (cls === 'energy-dimmed') return <span className="energy-defer">💤 Defer</span>;
    return null;
  };

  const submitTask = () => {
    const text = newText.trim();
    if (!text) return;
    addTask({
      text,
      priority: newPriority,
      category: newCat,
      scheduledTime: newTime || null,
    });
    setModalOpen(false);
    setNewText('');
    setNewTime('');
    toast('✅ Task added!', 'success');
  };

  const setEnergy = (level: 'high' | 'medium' | 'low') => {
    setUser({ energy: level });
    setEnergyTip(getEnergyTip(level));
  };

  const autoSchedule = () => {
    const msg = runAutoScheduleTasks();
    toast('🧠 ' + msg, 'success');
  };

  const startFocus = (minutes = 25) => {
    if (focusRef.current) return;
    let remaining = minutes * 60;
    setFocusOn(true);
    setFocusLeft(remaining);
    focusRef.current = setInterval(() => {
      remaining--;
      setFocusLeft(remaining);
      if (remaining <= 0) {
        if (focusRef.current) clearInterval(focusRef.current);
        focusRef.current = null;
        setFocusOn(false);
        toast('🎉 Focus block complete! Take a break.', 'success');
      }
    }, 1000);
  };

  const stopFocus = () => {
    if (focusRef.current) clearInterval(focusRef.current);
    focusRef.current = null;
    setFocusOn(false);
  };

  const m = Math.floor(focusLeft / 60);
  const s = focusLeft % 60;
  const total = 25 * 60;
  const fillPct = focusOn ? (1 - focusLeft / total) * 100 : 0;

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">⚡ Productivity Engine</h1>
        <p className="page-sub">AI plans your day based on energy levels</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Add Task
          </button>
          <button type="button" className="btn btn-ghost" onClick={autoSchedule}>
            🧠 AI Auto-Schedule
          </button>
        </div>
        <div className="toolbar-right">
          <select
            className="select-like"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 8 }}
          >
            <option value="all">All Tasks</option>
            <option value="today">Today</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="energy-tracker">
        <h3>How is your energy right now?</h3>
        <div className="energy-buttons">
          {(['high', 'medium', 'low'] as const).map((level) => (
            <button
              key={level}
              type="button"
              className={'et-btn' + (user.energy === level ? ' active' : '')}
              onClick={() => setEnergy(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <p className="energy-suggestion" id="energySuggestion">
          {energyTip}
        </p>
      </div>

      {focusOn && (
        <div className="focus-timer-bar">
          <span className="ft-label">Focus</span>
          <span className="ft-time">
            {m}:{s.toString().padStart(2, '0')}
          </span>
          <div className="ft-progress">
            <div className="ft-fill" style={{ width: `${fillPct}%` }} />
          </div>
          <button type="button" className="btn btn-sm" onClick={stopFocus}>
            Stop
          </button>
        </div>
      )}

      <div className="task-list" id="taskList">
        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No tasks yet. Add your first task!</div>
          </div>
        ) : (
          list.map((t) => (
            <div key={t.id} className={`task-item ${t.done ? 'done' : ''} ${recommended(t)}`}>
              <button
                type="button"
                className={'ti-check' + (t.done ? ' checked' : '')}
                onClick={() => toggleTask(t.id)}
              >
                ✓
              </button>
              <div className="ti-body">
                <div className="ti-text">
                  {t.text} {badge(t)}
                </div>
                <div className="ti-meta">
                  <span className={`ti-priority ${t.priority}`}>{t.priority}</span>
                  <span>{t.category}</span>
                  {t.scheduledTime && <span>⏰ {t.scheduledTime}</span>}
                </div>
              </div>
              {!t.scheduledTime && (
                <button
                  type="button"
                  className="btn btn-sm"
                  title="Start focus block"
                  onClick={() => startFocus(25)}
                >
                  ▶
                </button>
              )}
              <button type="button" className="ti-delete" onClick={() => removeTask(t.id)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} title="Add Task" onClose={() => setModalOpen(false)}>
        <label htmlFor="taskText">Task</label>
        <input
          id="taskText"
          type="text"
          placeholder="What needs to be done?"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <label htmlFor="taskPri">Priority</label>
        <select
          id="taskPri"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
        >
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
        <label htmlFor="taskCat">Category</label>
        <select id="taskCat" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="errand">Errand</option>
          <option value="learning">Learning</option>
        </select>
        <label htmlFor="taskTime">Scheduled Time (optional)</label>
        <input
          id="taskTime"
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <button type="button" className="btn btn-primary" onClick={submitTask}>
          Add Task
        </button>
      </Modal>
    </section>
  );
}
