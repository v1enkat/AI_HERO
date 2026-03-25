import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useHerAIStore } from '../../store/useHerAIStore';

export function SettingsPage() {
  const { toast } = useToast();
  const user = useHerAIStore((s) => s.user);
  const settings = useHerAIStore((s) => s.settings);
  const setUser = useHerAIStore((s) => s.setUser);
  const setSettings = useHerAIStore((s) => s.setSettings);
  const resetAll = useHerAIStore((s) => s.resetAll);

  const [name, setName] = useState(user.name);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [provider, setProvider] = useState(settings.apiProvider);
  const [lang, setLang] = useState(settings.lang);
  const [theme, setTheme] = useState(settings.theme);

  useEffect(() => {
    setName(user.name);
    setApiKey(settings.apiKey);
    setProvider(settings.apiProvider);
    setLang(settings.lang);
    setTheme(settings.theme);
  }, [user.name, settings.apiKey, settings.apiProvider, settings.lang, settings.theme]);

  const save = () => {
    setUser({ name });
    setSettings({ apiKey, apiProvider: provider, lang, theme });
    document.body.dataset.theme = theme;
    toast('⚙️ Settings saved!', 'success');
  };

  const exportData = () => {
    const raw = JSON.stringify(
      useHerAIStore.getState(),
      (_, v) => (typeof v === 'function' ? undefined : v),
      2
    );
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'herai-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('📥 Data exported!', 'success');
  };

  const clearData = () => {
    if (confirm('Are you sure? This will delete all your data.')) {
      resetAll();
      document.body.dataset.theme = 'light';
      toast('Data cleared. Page will reload.', 'info');
      window.location.reload();
    }
  };

  return (
    <section className="page active">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-sub">Profile, AI keys, theme, and data</p>
      </div>

      <div className="well-card wide">
        <h3>Profile</h3>
        <label htmlFor="settingName">Your name</label>
        <input
          id="settingName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How should I greet you?"
        />
      </div>

      <div className="well-card wide">
        <h3>AI (Groq)</h3>
        <p className="lead-desc">
          Add a Groq API key for richer chat and tools, or leave blank to use built-in rule-based responses.
          You can also set <code>VITE_GROQ_API_KEY</code> in a <code>.env</code> file for local dev.
        </p>
        <label htmlFor="settingApiKey">API key</label>
        <input
          id="settingApiKey"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="gsk_..."
        />
        <label htmlFor="settingApiProvider">Provider</label>
        <select
          id="settingApiProvider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="builtin">Built-in (no cloud LLM)</option>
          <option value="groq">Groq</option>
        </select>
        <label htmlFor="settingLang">Language</label>
        <select id="settingLang" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
        </select>
      </div>

      <div className="well-card wide">
        <h3>Appearance</h3>
        <label htmlFor="settingTheme">Theme</label>
        <select
          id="settingTheme"
          value={theme}
          onChange={(e) => {
            const t = e.target.value as 'light' | 'dark';
            setTheme(t);
            document.body.dataset.theme = t;
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="toolbar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save settings
        </button>
        <button type="button" className="btn btn-ghost" onClick={exportData}>
          Export JSON
        </button>
        <button type="button" className="btn btn-ghost" onClick={clearData} style={{ color: 'var(--rose)' }}>
          Clear all data
        </button>
      </div>
    </section>
  );
}
