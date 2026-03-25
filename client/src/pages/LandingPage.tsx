import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="react-landing">
      <div className="react-landing-card">
        <div className="react-landing-icon" aria-hidden>
          <LayoutGrid />
        </div>
        <div className="react-landing-inner">
          <p className="react-landing-badge">AI HEROS · LIFE OPERATING SYSTEM</p>
          <h1 className="react-landing-title">
            AI HER<span className="logo-accent">-AI</span>
          </h1>
          <p className="react-landing-sub">
            The first Life OS for women — productivity, finance, wellness, learning, and more in one
            cycle-aware experience.
          </p>
          <div className="react-landing-actions">
            <Link to="/app/dashboard" className="btn btn-primary">
              Open the app →
            </Link>
            <a href="/presentation.html" className="btn btn-ghost">
              View presentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
