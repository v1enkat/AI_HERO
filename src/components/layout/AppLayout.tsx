import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutGrid, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useHerAIStore } from '../../store/useHerAIStore';

export function AppLayout() {
  const theme = useHerAIStore((s) => s.settings.theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-mark" aria-hidden>
              <LayoutGrid />
            </span>
            <span className="logo-text">
              HER<span className="logo-accent">-AI</span>
            </span>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <Menu size={20} />
          </button>
        </div>
        <Sidebar onNavigate={closeSidebar} />
      </aside>

      <div
        className={'sidebar-overlay' + (sidebarOpen ? ' active' : '')}
        onClick={closeSidebar}
        aria-hidden
      />

      <main className="main" id="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </main>
    </>
  );
}
