import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

export default function AppLayout({ onOpenCustomizer }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('projecthub_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Global hotkey: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('projecthub:open-search'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          onOpenCustomizer={onOpenCustomizer}
        />
        <main className="page-container">
          <Outlet />
        </main>
        <MobileBottomNav onOpenMobileMenu={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
