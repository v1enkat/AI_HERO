import { NavLink } from 'react-router-dom';
import { Menu, Bell, UserRound, Zap, LayoutGrid } from 'lucide-react';
import { useHerAIStore } from '../../store/useHerAIStore';
import { getCyclePhase } from '../../services/aiEngine';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useHerAIStore((s) => s.user);
  const tasks = useHerAIStore((s) => s.tasks);
  const phase = getCyclePhase();
  const cycleShort =
    phase.phase !== 'unknown' ? phase.text.split(' ').slice(1).join(' ') : 'Set cycle';

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <button type="button" className="mobile-menu" onClick={onMenuClick} aria-label="Open menu">
            <Menu />
          </button>
          <NavLink to="/app/dashboard" className="topbar-brand" end>
            <span className="logo-mark topbar-logo-mark" aria-hidden>
              <LayoutGrid />
            </span>
            <span className="logo-text topbar-logo-text">
              Her<span className="logo-accent topbar-logo-accent"> AI</span>
            </span>
          </NavLink>
        </div>

        <div className="topbar-right">
          <div className="cycle-indicator" title="Cycle phase">
            <span className="cycle-dot" />
            <span className="cycle-text">{cycleShort}</span>
          </div>
          <div className="energy-badge" title="Current energy level">
            <span className="energy-icon" aria-hidden>
              <Zap />
            </span>
            <span className="energy-text">
              {user.energy.charAt(0).toUpperCase() + user.energy.slice(1)}
            </span>
          </div>
          <button type="button" className="notif-btn" title="Pending tasks" aria-label="Notifications">
            <Bell />
            {pending > 0 && <span className="notif-count">{Math.min(pending, 9)}</span>}
          </button>
          <div className="avatar" title="Profile">
            <UserRound strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </header>
  );
}
