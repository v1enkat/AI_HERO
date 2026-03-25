import { useState } from 'react';
import { useHerAIStore } from '../../store/useHerAIStore';
import { chatLLM } from '../../services/aiEngine';

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
    } catch {
      setError('Could not reach the AI service. Check your API key in Settings or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">🧠 AI HER-AI Assistant</h1>
        <p className="page-sub">Your personal AI that understands your whole life</p>
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
