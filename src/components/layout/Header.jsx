import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Sparkles,
  SlidersHorizontal,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import GlobalSearchModal from '../common/GlobalSearchModal';
import QuickTaskModal from '../common/QuickTaskModal';
import NotificationDrawer from '../common/NotificationDrawer';

const PAGE_TITLES = {
  '/': { title: 'Personal Dashboard', breadcrumb: 'Overview' },
  '/workspace-3d': { title: '3D Project Workspace', breadcrumb: '3D World' },
  '/projects': { title: 'Project Management', breadcrumb: 'Projects' },
  '/tasks': { title: 'Task Workspace & Kanban', breadcrumb: 'Tasks' },
  '/my-day': { title: 'My Day Planner', breadcrumb: 'Planning' },
  '/calendar': { title: 'Master Calendar', breadcrumb: 'Timeline' },
  '/milestones': { title: 'Milestones & Roadmaps', breadcrumb: 'Milestones' },
  '/documents': { title: 'Document Vault', breadcrumb: 'Documents' },
  '/analytics': { title: 'Analytics & Reporting', breadcrumb: 'Reports' },
  '/activity': { title: 'Audit Trail & Activity', breadcrumb: 'Logs' },
  '/settings': { title: 'System & User Settings', breadcrumb: 'Preferences' },
};

export default function Header({ onToggleMobileSidebar, onOpenCustomizer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, updateTheme } = useTheme();
  const { user, isGuest, isSupabaseLive, signOut } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const { notifications } = useWorkspace();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: 'VeroPlan',
    breadcrumb: 'System',
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const cycleTheme = () => {
    if (theme === 'dark-olive') {
      updateTheme('light-sage');
    } else if (theme === 'light-sage') {
      updateTheme('custom-accent');
    } else {
      updateTheme('dark-olive');
    }
  };

  const handleQuickAddClick = () => {
    if (isGuest) {
      openAuthPrompt({
        title: 'Sign in to add tasks',
        message: 'Create an account or log in to plan and track tasks across your personal projects.',
        actionType: 'create_task',
      });
      return;
    }
    setIsQuickAddOpen(true);
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="app-header">
        {/* Left Side: Mobile Menu & Page Breadcrumbs */}
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={onToggleMobileSidebar}
            aria-label="Open mobile navigation"
          >
            <Menu size={20} />
          </button>
          <div className="header-page-info">
            <span className="header-breadcrumb">{currentPage.breadcrumb}</span>
            <h1 className="header-page-title">{currentPage.title}</h1>
          </div>
        </div>

        {/* Center: Global Search shortcut */}
        <div className="header-center">
          <button
            className="header-search-btn"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search records"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={15} color="var(--accent-color)" />
              <span>Search projects, tasks, docs...</span>
            </div>
            <span className="search-shortcut-key">Ctrl K</span>
          </button>
        </div>

        {/* Right Side: Actions, Theme, Auth / Profile */}
        <div className="header-right">
          {/* Mobile Search Button */}
          <button
            className="btn btn-ghost btn-icon mobile-search-btn"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search records"
            title="Search projects, tasks, docs"
          >
            <Search size={18} color="var(--accent-color)" />
          </button>

          {/* Quick Add Task */}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleQuickAddClick}
            title="Create new task quickly"
            aria-label="Quick Add task"
          >
            <Plus size={16} />
            <span className="hide-on-mobile">Quick Add</span>
          </button>

          {/* Customize Dashboard shortcut (shows on / route) */}
          {location.pathname === '/' && onOpenCustomizer && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenCustomizer}
              title="Enter Dashboard Customization mode"
              aria-label="Customize dashboard"
            >
              <SlidersHorizontal size={15} color="var(--accent-color)" />
              <span className="hide-on-mobile">Customize</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={cycleTheme}
            title={`Current Theme: ${theme}. Click to switch theme.`}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark-olive' && <Sun size={18} color="var(--accent-color)" />}
            {theme === 'light-sage' && <Moon size={18} color="var(--color-primary-olive)" />}
            {theme === 'custom-accent' && <Sparkles size={18} color="var(--accent-color)" />}
          </button>

          {/* Notifications Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color)',
                    boxShadow: '0 0 6px var(--accent-color)',
                  }}
                />
              )}
            </button>
            <NotificationDrawer
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Guest or Authenticated Profile Menu */}
          {isGuest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid var(--accent-color)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-primary-olive)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
                title={user?.email || 'User Account'}
              >
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '220px',
                    padding: '8px 0',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-strong)',
                  }}
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {user?.user_metadata?.full_name || 'Personal Account'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                  </div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      textAlign: 'left',
                    }}
                  >
                    <User size={15} /> Account Settings
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '9px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-status-danger)',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Search and Quick Add Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickTaskModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </>
  );
}
