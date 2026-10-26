import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sun,
  Menu,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const BOTTOM_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban, badgeKey: 'activeProjects' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, badgeKey: 'inProgressTasks' },
  { to: '/my-day', label: 'My Day', icon: Sun, badgeKey: 'tasksDueToday' },
];

export default function MobileBottomNav({ onOpenMobileMenu }) {
  const { stats } = useWorkspace();
  const location = useLocation();

  const isMoreActive = ![
    '/',
    '/projects',
    '/tasks',
    '/my-day',
  ].some((path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const count = item.badgeKey && stats ? stats[item.badgeKey] : 0;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <div className="mobile-nav-icon-wrapper">
              <IconComponent size={20} />
              {count > 0 && <span className="mobile-nav-badge">{count}</span>}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        className={`mobile-nav-button ${isMoreActive ? 'active' : ''}`}
        onClick={onOpenMobileMenu}
        aria-label="Open full workspace navigation"
      >
        <div className="mobile-nav-icon-wrapper">
          <Menu size={20} />
          {stats?.pendingMilestones > 0 && (
            <span className="mobile-nav-badge">{stats.pendingMilestones}</span>
          )}
        </div>
        <span className="mobile-nav-label">More</span>
      </button>
    </nav>
  );
}
