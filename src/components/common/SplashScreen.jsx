import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

let hasShownSplash = false;

export default function SplashScreen({ children }) {
  const { loading: authLoading, isSupabaseLive } = useAuth();
  const [visible, setVisible] = useState(!hasShownSplash);
  const [fading, setFading] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  useEffect(() => {
    if (hasShownSplash) {
      setVisible(false);
      return;
    }

    // Safety timeout in case network or backend hangs
    const safetyTimer = setTimeout(() => {
      if (authLoading) {
        setIsTimedOut(true);
      }
    }, 4000);

    return () => clearTimeout(safetyTimer);
  }, [authLoading]);

  useEffect(() => {
    if (hasShownSplash) return;

    if (!authLoading) {
      // Auth initialized cleanly
      if (prefersReducedMotion) {
        setVisible(false);
        hasShownSplash = true;
      } else {
        // Smooth gentle fade out
        setFading(true);
        const timer = setTimeout(() => {
          setVisible(false);
          hasShownSplash = true;
        }, 450);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, prefersReducedMotion]);

  const handleContinueAnyway = () => {
    setVisible(false);
    hasShownSplash = true;
  };

  if (!visible) {
    return children;
  }

  return (
    <>
      <div
        id="veroplan-splash-screen"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: '#F3F5E9',
          color: '#26351D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fading ? 0 : 1,
          transition: prefersReducedMotion ? 'none' : 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: fading ? 'none' : 'auto',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '360px',
            transform: fading ? 'scale(0.97)' : 'scale(1)',
            transition: prefersReducedMotion ? 'none' : 'transform 0.45s ease',
          }}
        >
          {/* Logo container */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(96, 107, 61, 0.25), 0 2px 8px rgba(34, 41, 31, 0.08)',
              marginBottom: '20px',
              border: '2px solid #C8DEA0',
              animation: prefersReducedMotion ? 'none' : 'logoReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
              background: '#FFFFFF',
            }}
          >
            <img
              src="/logo.jpg"
              alt="VeroPlan Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Product Title */}
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.03em',
              color: '#22291F',
            }}
          >
            Vero<span style={{ color: '#606B3D' }}>Plan</span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: '#606B3D',
              margin: '0 0 24px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Plan • Track • Achieve
          </p>

          {/* Active loader or timeout notice */}
          {isTimedOut ? (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#E7EED8',
                border: '1px solid #C8DEA0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#606B3D', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>Initialization is taking longer than expected</span>
              </div>
              <button
                onClick={handleContinueAnyway}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#606B3D',
                  color: '#F2F4EB',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} /> Continue to VeroPlan
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#849B54',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #C8DEA0',
                  borderTopColor: '#606B3D',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                }}
              />
              <span>Initializing workspace...</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Render children in background so they are ready when splash fades */}
      {children}
    </>
  );
}
