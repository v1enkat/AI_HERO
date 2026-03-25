import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';
import { linkedinHeadlinesLLM, socialPostLLM } from '../../services/aiEngine';

export function BrandingPage() {
  const { toast } = useToast();
  const wins = useHerAIStore((s) => s.wins);
  const addWin = useHerAIStore((s) => s.addWin);
  const removeWin = useHerAIStore((s) => s.removeWin);

  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [liOut, setLiOut] = useState('');
  const [liLoading, setLiLoading] = useState(false);

  const [postTopic, setPostTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [postOut, setPostOut] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  const [winModal, setWinModal] = useState(false);
  const [winText, setWinText] = useState('');
  const [winDate, setWinDate] = useState(new Date().toISOString().slice(0, 10));

  const optimize = async () => {
    setLiLoading(true);
    setLiOut('');
    try {
      setLiOut(await linkedinHeadlinesLLM(role, skills));
    } finally {
      setLiLoading(false);
    }
  };

  const genPost = async () => {
    setPostLoading(true);
    setPostOut('');
    try {
      setPostOut(await socialPostLLM(postTopic, platform));
    } finally {
      setPostLoading(false);
    }
  };

  const submitWin = () => {
    const t = winText.trim();
    if (!t) return;
    addWin(t, winDate);
    setWinModal(false);
    setWinText('');
    toast('🏆 Win logged!', 'success');
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">✨ Personal Branding</h1>
        <p className="page-sub">Build your digital identity and track your success</p>
      </div>

      <div className="branding-grid">
        <div className="lead-card">
          <h3>💼 LinkedIn Headline Optimizer</h3>
          <input
            type="text"
            className="lead-input"
            placeholder="Your current role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            type="text"
            className="lead-input"
            placeholder="Top 3 skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={optimize} disabled={liLoading}>
            🧠 Optimize
          </button>
          {(liOut || liLoading) && (
            <div className="lead-output">
              <div className="lo-label">Optimized Headlines:</div>
              <div className={'lo-text' + (liLoading ? ' llm-loading' : '')}>{liOut}</div>
            </div>
          )}
        </div>

        <div className="lead-card">
          <h3>📱 Social Media Post Generator</h3>
          <input
            type="text"
            className="lead-input"
            placeholder="Topic or achievement to post about"
            value={postTopic}
            onChange={(e) => setPostTopic(e.target.value)}
          />
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter/X</option>
            <option value="instagram">Instagram</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={genPost} disabled={postLoading}>
            🧠 Generate Post
          </button>
          {(postOut || postLoading) && (
            <div className="lead-output">
              <div className={'lo-text' + (postLoading ? ' llm-loading' : '')}>{postOut}</div>
            </div>
          )}
        </div>

        <div className="lead-card wide">
          <h3>🏆 Success Timeline</h3>
          <p className="lead-desc">Track your wins and milestones.</p>
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={() => setWinModal(true)}>
              + Add Win
            </button>
          </div>
          <div className="success-timeline" id="successTimeline">
            {wins.length === 0 ? (
              <div className="empty-state">
                <div className="empty-text">Start logging your achievements!</div>
              </div>
            ) : (
              [...wins].reverse().map((w) => (
                <div key={w.id} className="win-item">
                  <div className="win-dot" />
                  <div className="win-date">{w.date}</div>
                  <div className="win-text">{w.text}</div>
                  <button type="button" className="gi-remove" onClick={() => removeWin(w.id)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal open={winModal} title="Log a Win" onClose={() => setWinModal(false)}>
        <label htmlFor="wt">Achievement</label>
        <input id="wt" value={winText} onChange={(e) => setWinText(e.target.value)} />
        <label htmlFor="wd">Date</label>
        <input id="wd" type="date" value={winDate} onChange={(e) => setWinDate(e.target.value)} />
        <button type="button" className="btn btn-primary" onClick={submitWin}>
          Add Win 🏆
        </button>
      </Modal>
    </section>
  );
}
