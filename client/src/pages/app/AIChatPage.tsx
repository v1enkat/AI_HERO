import { useState } from 'react';
import { useHerAIStore } from '../../store/useHerAIStore';
import { chatLLM, isGroqConfigured } from '../../services/aiEngine';

export function AIChatPage() {
  const chatHistory = useHerAIStore((s) => s.chatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setError(null);
    setLoading(true);
    try {
      await chatLLM(msg);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setError(
        `AI request failed: ${detail} — Check Settings → AI (Groq) or your .env key, or try another model via VITE_GROQ_MODEL.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">🧠 AI HER-AI Assistant</h1>
        <p className="page-sub">Your personal AI that understands your whole life</p>
        {!isGroqConfigured() && (
          <p
            className="page-sub"
            style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}
          >
            No LLM path configured — using built-in rules. Set <code>GROQ_API_KEY</code> in the project root{' '}
            <code>.env</code> (recommended) or add a key in Settings / <code>VITE_GROQ_API_KEY</code> for
            browser-direct mode.
          </p>
        )}
      </div>

      <div className="chat-container">
        <div className="chat-messages" id="chatMessages">
          {chatHistory.length === 0 && !loading && (
            <div className="chat-msg ai">
              <div className="cm-avatar">🧠</div>
              <div className="cm-bubble">
                <div className="cm-text">
                  Hi! I&apos;m HER-AI. Ask me about your tasks, budget, mood, schedule, or anything on your
                  mind.
                </div>
              </div>
            </div>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} className={'chat-msg ' + (m.role === 'user' ? 'user' : 'ai')}>
              <div className="cm-avatar">{m.role === 'user' ? '👩' : '🧠'}</div>
              <div className="cm-bubble">
                <div className="cm-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg ai">
              <div className="cm-avatar">🧠</div>
              <div className="cm-bubble">
                <div className="cm-text typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
        {error && (
          <p style={{ color: 'var(--rose)', padding: '0 1rem', fontSize: '0.9rem' }}>{error}</p>
        )}
        <div className="chat-input-area">
          <input
            type="text"
            id="chatInput"
            className="chat-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={loading}
          />
          <button type="button" className="btn btn-primary chat-send" onClick={send} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
