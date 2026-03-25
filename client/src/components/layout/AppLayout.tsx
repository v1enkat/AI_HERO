import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')} id="sidebar">
        <div className="sidebar-header">
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
        <Outlet />
      </main>
    </>
  );
}
