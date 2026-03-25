import { useState } from 'react';
import { useHerAIStore } from '../../store/useHerAIStore';
import { instructorChat } from '../../services/aiEngine';

export function LearningPage() {
  const learningStyle = useHerAIStore((s) => s.user.learningStyle);
  const setUser = useHerAIStore((s) => s.setUser);
  const instructorTopic = useHerAIStore((s) => s.instructorTopic);
  const instructorWeek = useHerAIStore((s) => s.instructorWeek);

  const [input, setInput] = useState('');
  const [log, setLog] = useState<{ role: 'you' | 'ai'; text: string }[]>([]);

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setLog((l) => [...l, { role: 'you', text: msg }]);
    const reply = instructorChat(msg);
    setLog((l) => [...l, { role: 'ai', text: reply }]);
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">🎓 AI Learning Hub</h1>
        <p className="page-sub">Personalized instructor adapted to your learning style</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <select
            id="learningStyle"
            value={learningStyle}
            onChange={(e) => setUser({ learningStyle: e.target.value })}
          >
            <option value="visual">🎨 Visual Learner</option>
            <option value="reading">📖 Reading/Writing</option>
            <option value="practical">🔧 Hands-On / Practical</option>
            <option value="auditory">🎧 Auditory</option>
          </select>
        </div>
      </div>

      <div className="instructor-status" style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.85 }}>
        {instructorTopic ? (
          <>
            Active course: <strong>{instructorTopic}</strong> · Week index {instructorWeek + 1}
          </>
        ) : (
          <>Type a topic (Excel, Python, Communication, Design) to start.</>
        )}
      </div>

      <div
        className="learning-chat-log"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          minHeight: 280,
          maxHeight: 420,
          overflowY: 'auto',
          marginBottom: '1rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {log.length === 0 ? (
          <div className="empty-state">
            <div className="empty-text">Message the instructor below — try &quot;Excel&quot; or &quot;week 1&quot;.</div>
          </div>
        ) : (
          log.map((line, i) => (
            <div
              key={i}
              style={{
                marginBottom: '0.75rem',
                color: line.role === 'you' ? 'var(--rose)' : 'var(--text)',
              }}
            >
              <strong>{line.role === 'you' ? 'You' : 'Instructor'}:</strong> {line.text}
            </div>
          ))
        )}
      </div>

      <div className="chat-input-row" style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask for a lesson, practice, quiz, or next week..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-primary" onClick={send}>
          Send
        </button>
      </div>
    </section>
  );
}
