import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sun,
  Calendar,
  Flag,
  FileText,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Boxes,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workspace-3d', label: '3D Workspace', icon: Boxes },
  { to: '/projects', label: 'Projects', icon: FolderKanban, badgeKey: 'activeProjects' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, badgeKey: 'inProgressTasks' },
  { to: '/my-day', label: 'My Day', icon: Sun, badgeKey: 'tasksDueToday' },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/milestones', label: 'Milestones', icon: Flag, badgeKey: 'pendingMilestones' },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { stats, workspace } = useWorkspace();
  const location = useLocation();

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('projecthub_sidebar_collapsed', JSON.stringify(nextState));
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Primary Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="brand-link" onClick={() => setMobileOpen(false)}>
            <div className="brand-logo-icon" style={{ padding: '2px', background: '#22291F', overflow: 'hidden' }}>
              <img
                src="/logo.jpg"
                alt="VeroPlan Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'calc(var(--radius-md) - 2px)' }}
              />
            </div>
            {!collapsed && (
              <div className="brand-text-container">
                <span className="brand-title" style={{ letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline' }}>
                  <span>Vero</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>Plan</span>
                </span>
                <span className="brand-badge" style={{ fontSize: '0.62rem', letterSpacing: '0.07em' }}>
                  Plan • Track • Achieve
                </span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Workspace pill when expanded */}
        {!collapsed && workspace && (
          <div
            style={{
              padding: '10px 14px',
              margin: '10px 12px 4px',
              background: 'rgba(200, 222, 160, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={16} color="var(--accent-color)" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {workspace.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Personal Workspace</div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count = item.badgeKey ? stats[item.badgeKey] : null;
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <div className="nav-icon">
                  <Icon size={19} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {count !== null && count > 0 && (
                      <span className="nav-badge-count">{count}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with collapse toggle button */}
        <div className="sidebar-footer">
          {!collapsed && (
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              v1.0.0 • SaaS Ready
            </span>
          )}
          <button
            className="collapse-toggle-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
