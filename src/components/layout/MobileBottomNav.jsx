import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sun,
  Boxes,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const BOTTOM_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban, badgeKey: 'activeProjects' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, badgeKey: 'inProgressTasks' },
  { to: '/my-day', label: 'My Day', icon: Sun, badgeKey: 'tasksDueToday' },
  { to: '/workspace-3d', label: '3D World', icon: Boxes },
];

export default function MobileBottomNav() {
  const { stats } = useWorkspace();

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
    </nav>
  );
}
