import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Zap,
  CalendarDays,
  GraduationCap,
  Home,
  Wallet,
  Crown,
  Sparkles,
  HeartPulse,
  Brain,
  Settings,
  House,
  Presentation,
  Wrench,
} from 'lucide-react';

const nav: { to: string; page: string; Icon: LucideIcon; label: string }[] = [
  { to: '/app/dashboard', page: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/productivity', page: 'productivity', Icon: Zap, label: 'Productivity' },
  { to: '/app/scheduler', page: 'scheduler', Icon: CalendarDays, label: 'Smart Scheduler' },
  { to: '/app/learning', page: 'learning', Icon: GraduationCap, label: 'Learning' },
  { to: '/app/home', page: 'home', Icon: Home, label: 'Home Life' },
  { to: '/app/finance', page: 'finance', Icon: Wallet, label: 'Finance' },
  { to: '/app/leadership', page: 'leadership', Icon: Crown, label: 'Leadership' },
  { to: '/app/branding', page: 'branding', Icon: Sparkles, label: 'Branding' },
  { to: '/app/wellness', page: 'wellness', Icon: HeartPulse, label: 'Wellness' },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav className="sidebar-nav">
        {nav.map(({ to, page, Icon, label }) => (
          <NavLink
            key={page}
            to={to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            onClick={onNavigate}
          >
            <span className="nav-icon" aria-hidden>
              <Icon />
            </span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/app/aichat"
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          onClick={onNavigate}
        >
          <span className="nav-icon" aria-hidden>
            <Brain />
          </span>
          <span className="nav-label">AI Chat</span>
        </NavLink>
        <NavLink
          to="/app/settings"
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          onClick={onNavigate}
        >
          <span className="nav-icon" aria-hidden>
            <Settings />
          </span>
          <span className="nav-label">Settings</span>
        </NavLink>
        <div className="nav-divider">
          <NavLink to="/" className="nav-item" onClick={onNavigate}>
            <span className="nav-icon" aria-hidden>
              <House />
            </span>
            <span className="nav-label">Landing</span>
          </NavLink>
          <a href="/presentation.html" className="nav-item">
            <span className="nav-icon" aria-hidden>
              <Presentation />
            </span>
            <span className="nav-label">Presentation</span>
          </a>
          <a href="/architecture.html" className="nav-item">
            <span className="nav-icon" aria-hidden>
              <Wrench />
            </span>
            <span className="nav-label">Architecture</span>
          </a>
        </div>
      </div>
    </>
  );
}
