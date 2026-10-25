import React, { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const openAuthPrompt = ({
    title = 'Sign in to continue',
    message = 'Create an account or log in to securely save, manage, and collaborate on your personal projects.',
    actionType = 'default',
  } = {}) => {
    setModalConfig({
      title,
      message,
      actionType,
      returnUrl: location.pathname + location.search,
    });
  };

  const closeAuthPrompt = () => {
    setModalConfig(null);
  };

  const handleNavigateToLogin = () => {
    const returnUrl = modalConfig?.returnUrl || '/';
    closeAuthPrompt();
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleNavigateToRegister = () => {
    const returnUrl = modalConfig?.returnUrl || '/';
    closeAuthPrompt();
    navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthPrompt, closeAuthPrompt }}>
      {children}

      {/* Guest Authentication Popup Modal */}
      {modalConfig && (
        <div
          className="modal-backdrop"
          onClick={closeAuthPrompt}
          style={{ animation: 'fadeIn 0.2s ease-out', zIndex: 1100 }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4), 0 0 24px var(--accent-color-glow)',
              borderRadius: 'var(--card-radius)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(96, 107, 61, 0.2) 0%, rgba(34, 41, 31, 0.4) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={16} />
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {modalConfig.title}
                </h3>
              </div>

              <button
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={closeAuthPrompt}
                aria-label="Close authentication prompt"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 22px' }}>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  margin: '0 0 20px',
                }}
              >
                {modalConfig.message}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleNavigateToLogin}
                  style={{ width: '100%', padding: '11px', fontWeight: 600 }}
                >
                  <LogIn size={16} /> Login
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleNavigateToRegister}
                  style={{ width: '100%', padding: '11px', fontWeight: 600 }}
                >
                  <UserPlus size={16} /> Create account
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <div
              style={{
                padding: '12px 22px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Explore as guest anytime</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={closeAuthPrompt}
                style={{ fontSize: '0.75rem', padding: '2px 6px' }}
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return context;
}
