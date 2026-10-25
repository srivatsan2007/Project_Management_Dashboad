import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Flag, AlertCircle, Info } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useWorkspace();
  const drawerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'task_due':
        return <Clock size={16} color="var(--accent-color)" />;
      case 'overdue':
        return <AlertCircle size={16} color="var(--color-status-danger)" />;
      case 'milestone':
        return <Flag size={16} color="var(--color-status-warning)" />;
      default:
        return <Info size={16} color="var(--color-status-info)" />;
    }
  };

  return (
    <div ref={drawerRef} className="notification-popover">
      <div className="notification-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="var(--accent-color)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="badge badge-pistachio">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            onClick={markAllNotificationsAsRead}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No notifications right now</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) {
                  navigate(notif.link);
                  onClose();
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: notif.is_read ? 500 : 700, fontSize: '0.85rem' }}>
                    {notif.title}
                  </span>
                  {!notif.is_read && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                      }}
                    />
                  )}
                </div>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {notif.message}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
