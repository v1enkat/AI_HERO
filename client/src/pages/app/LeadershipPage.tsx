import { useState } from 'react';
import {
  leadershipLessons,
  rewriteEmailLLM,
  generatePitchLLM,
  negotiationScriptLLM,
} from '../../services/aiEngine';

export function LeadershipPage() {
  const [emailIn, setEmailIn] = useState('');
  const [emailTone, setEmailTone] = useState('confident');
  const [emailOut, setEmailOut] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [pitchRole, setPitchRole] = useState('');
  const [pitchAch, setPitchAch] = useState('');
  const [pitchOut, setPitchOut] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);

  const [lesson, setLesson] = useState(leadershipLessons[0]!);

  const [negCur, setNegCur] = useState('');
  const [negDes, setNegDes] = useState('');
  const [negReason, setNegReason] = useState('');
  const [negOut, setNegOut] = useState('');
  const [negLoading, setNegLoading] = useState(false);

  const rewrite = async () => {
    setEmailLoading(true);
    setEmailOut('');
    try {
      setEmailOut(await rewriteEmailLLM(emailIn, emailTone));
    } finally {
      setEmailLoading(false);
    }
  };

  const pitch = async () => {
    setPitchLoading(true);
    setPitchOut('');
    try {
      setPitchOut(await generatePitchLLM(pitchRole, pitchAch));
    } finally {
      setPitchLoading(false);
    }
  };

  const neg = async () => {
    setNegLoading(true);
    setNegOut('');
    try {
      setNegOut(await negotiationScriptLLM(negCur, negDes, negReason));
    } finally {
      setNegLoading(false);
    }
  };

  const nextLesson = () => {
    const idx = Math.floor(Math.random() * leadershipLessons.length);
    setLesson(leadershipLessons[idx]!);
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">👑 Leadership Suite</h1>
        <p className="page-sub">Build confidence, rewrite emails, and lead stronger</p>
      </div>

      <div className="leadership-grid">
        <div className="lead-card">
          <h3>✍️ Smart Email Rewriter</h3>
          <p className="lead-desc">
            Paste your email draft and AI will make it sound more confident and assertive.
          </p>
          <textarea
            className="lead-textarea"
            rows={5}
            placeholder="Paste your email draft here..."
            value={emailIn}
            onChange={(e) => setEmailIn(e.target.value)}
          />
          <div className="lead-actions">
            <select value={emailTone} onChange={(e) => setEmailTone(e.target.value)}>
              <option value="confident">Confident</option>
              <option value="assertive">Assertive</option>
              <option value="diplomatic">Diplomatic</option>
              <option value="friendly">Friendly but firm</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={rewrite} disabled={emailLoading}>
              🧠 Rewrite
            </button>
          </div>
          {(emailOut || emailLoading) && (
            <div className="lead-output">
              <div className="lo-label">AI Rewrite:</div>
              <div className={'lo-text' + (emailLoading ? ' llm-loading' : '')}>{emailOut}</div>
              {emailOut && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => navigator.clipboard.writeText(emailOut)}
                >
                  📋 Copy
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lead-card">
          <h3>🎤 Elevator Pitch Generator</h3>
          <p className="lead-desc">AI creates a compelling pitch for your role or business.</p>
          <input
            type="text"
            className="lead-input"
            placeholder="Your role (e.g., Marketing Manager)"
            value={pitchRole}
            onChange={(e) => setPitchRole(e.target.value)}
          />
          <input
            type="text"
            className="lead-input"
            placeholder="Key achievement or goal"
            value={pitchAch}
            onChange={(e) => setPitchAch(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={pitch} disabled={pitchLoading}>
            🧠 Generate Pitch
          </button>
          {(pitchOut || pitchLoading) && (
            <div className="lead-output">
              <div className="lo-label">Your Elevator Pitch:</div>
              <div className={'lo-text' + (pitchLoading ? ' llm-loading' : '')}>{pitchOut}</div>
            </div>
          )}
        </div>

        <div className="lead-card">
          <h3>📚 Daily Leadership Micro-Lesson</h3>
          <div className="micro-lesson" id="microLesson">
            <div className="ml-topic">{lesson.topic}</div>
            <div className="ml-content">{lesson.content}</div>
            <div className="ml-action">{lesson.action}</div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={nextLesson}>
            Next Lesson →
          </button>
        </div>

        <div className="lead-card">
          <h3>💪 Salary Negotiation Coach</h3>
          <p className="lead-desc">Get AI-generated scripts for your next negotiation.</p>
          <input
            type="text"
            className="lead-input"
            placeholder="Current salary (e.g., ₹50,000)"
            value={negCur}
            onChange={(e) => setNegCur(e.target.value)}
          />
          <input
            type="text"
            className="lead-input"
            placeholder="Desired salary"
            value={negDes}
            onChange={(e) => setNegDes(e.target.value)}
          />
          <input
            type="text"
            className="lead-input"
            placeholder="Key reason (e.g., 2 years of strong results)"
            value={negReason}
            onChange={(e) => setNegReason(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={neg} disabled={negLoading}>
            🧠 Generate Script
          </button>
          {(negOut || negLoading) && (
            <div className="lead-output">
              <div className="lo-label">Negotiation Script:</div>
              <div className={'lo-text' + (negLoading ? ' llm-loading' : '')}>{negOut}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
