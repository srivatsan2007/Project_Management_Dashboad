import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, forgotPassword, resendConfirmationEmail, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Email confirmation helper states
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const isEmailNotConfirmed = errorMessage.toLowerCase().includes('email not confirmed');

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(returnUrl, { replace: true });
    }
  }, [user, navigate, returnUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResendStatus(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      console.error('Sign in error:', err);
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setResendStatus({ type: 'error', text: 'Please enter your email address above first.' });
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      await resendConfirmationEmail(email.trim());
      setResendStatus({
        type: 'success',
        text: `Confirmation link resent to ${email.trim()}! Please check your inbox and spam folder.`
      });
    } catch (err) {
      setResendStatus({
        type: 'error',
        text: err.message || 'Could not resend email. Please try again in a few moments.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const copyConfirmSql = () => {
    const sql = `-- 1. Confirm all existing accounts immediately\nUPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;\n\n-- 2. Automatically confirm all future signups for any email address\nCREATE OR REPLACE FUNCTION public.auto_confirm_new_users()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;\n\nDROP TRIGGER IF EXISTS tr_auto_confirm_users ON auth.users;\nCREATE TRIGGER tr_auto_confirm_users\n  BEFORE INSERT ON auth.users\n  FOR EACH ROW\n  EXECUTE FUNCTION public.auto_confirm_new_users();`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsForgotLoading(true);
    setErrorMessage('');
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(false);
      }, 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to send password reset email.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Return to Dashboard / Public View */}
      <Link
        to="/"
        className="btn btn-ghost btn-sm"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <ArrowLeft size={16} /> Back to VeroPlan
      </Link>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 30px',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleUp 0.25s ease-out',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              margin: '0 auto 12px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px var(--accent-color-glow)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <img src="/logo.jpg" alt="VeroPlan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.65rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Sign in to <span>Vero</span><span style={{ color: 'var(--accent-color)' }}>Plan</span>
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Plan • Track • Achieve
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-status-danger-bg)',
              border: '1px solid rgba(217, 93, 93, 0.4)',
              color: 'var(--color-status-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{errorMessage}</div>
              {isEmailNotConfirmed && (
                <div style={{ fontSize: '0.785rem', marginTop: '4px', opacity: 0.9 }}>
                  Supabase requires your email to be confirmed before logging in. Choose one of the quick options below:
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dedicated "Email Not Confirmed" Resolution Box */}
        {isEmailNotConfirmed && (
          <div
            className="card"
            style={{
              padding: '16px',
              background: 'rgba(96, 107, 61, 0.08)',
              border: '1px solid var(--border-strong)',
              marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Mail size={16} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                How to activate your account:
              </span>
            </div>

            {/* Option 1: Resend email */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.4 }}>
                <strong>1. Check your email inbox</strong> (including Spam/Junk folder) at <code>{email || 'your email'}</code>.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={isResending ? 'spin' : ''} />
                {isResending ? 'Resending...' : 'Resend Confirmation Email'}
              </button>
              {resendStatus && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: resendStatus.type === 'success' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {resendStatus.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  {resendStatus.text}
                </div>
              )}
            </div>

            {/* Option 2: Turn off confirm email for ALL email IDs */}
            <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                <strong>2. Allow ANY email to log in immediately (Supabase setting):</strong>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.4 }}>
                In Supabase Dashboard → <em>Authentication → Providers → Email</em>, toggle <strong>"Confirm email" OFF</strong> and click <strong>Save</strong>. Then any email address can sign in instantly without confirmation!
              </p>
            </div>

            {/* Option 3: Copy Universal SQL */}
            <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                <strong>3. Or run Universal Auto-Confirm SQL in Supabase:</strong>
              </p>
              <button
                type="button"
                onClick={copyConfirmSql}
                className="btn btn-ghost btn-sm"
                style={{
                  width: '100%',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                }}
              >
                {copiedSql ? <Check size={14} style={{ color: 'var(--accent-color)' }} /> : <Copy size={14} />}
                {copiedSql ? 'Universal Auto-Confirm SQL Copied!' : 'Copy Universal SQL (Auto-Confirm Any Email)'}
              </button>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0 4px', color: 'var(--accent-color)' }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: '12px', fontWeight: 700 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
            style={{ fontWeight: 700, color: 'var(--accent-color)' }}
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowForgotModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {forgotSuccess ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <CheckCircle2 size={36} color="var(--color-status-success)" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px' }}>Reset Link Sent</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Check your inbox at <strong>{forgotEmail}</strong> for instructions to reset your password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Enter your registered email address and we will send you a password recovery link.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForgotModal(false)}
                      disabled={isForgotLoading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isForgotLoading}>
                      {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
