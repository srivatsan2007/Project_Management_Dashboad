import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { dataService } from '../services/dataService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase auth getSession warning:', error.message);
          }
          if (currentSession?.user) {
            setUser(currentSession.user);
            setSession(currentSession);
          } else {
            // Guest mode
            setUser(null);
            setSession(null);
          }
        } catch (err) {
          console.warn('Supabase auth initialization error:', err);
          setUser(null);
          setSession(null);
        } finally {
          setLoading(false);
        }

        // Listen for live auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          setSession(newSession);
          const currentUser = newSession?.user || null;
          setUser(currentUser);
          setLoading(false);
          if (currentUser) {
            try {
              await dataService.syncLocalToCloud(currentUser);
            } catch (syncErr) {
              console.warn('Cloud sync on auth change warning:', syncErr);
            }
          }
          // Trigger data refresh across the app
          window.dispatchEvent(new CustomEvent('veroplan:data-changed', { detail: { auth: true } }));
        });

        return () => subscription.unsubscribe();
      } else {
        // No Supabase client configured - Guest mode by default
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your .env credentials.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setUser(data.user);
    setSession(data.session);
    try {
      await dataService.syncLocalToCloud(data.user);
    } catch (syncErr) {
      console.warn('Cloud sync on sign-in warning:', syncErr);
    }
    return data;
  };

  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your .env credentials.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setUser(data.user || null);
    setSession(data.session || null);
    return data;
  };

  const resendConfirmationEmail = async (email) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your .env credentials.');
    }
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    window.dispatchEvent(new CustomEvent('veroplan:data-changed', { detail: { auth: false } }));
  };

  const forgotPassword = async (email) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        isGuest: !user,
        isSupabaseLive: isSupabaseConfigured,
        signIn,
        signUp,
        resendConfirmationEmail,
        signOut,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

