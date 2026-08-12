import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('screenarts_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Helper to upsert user profile into Supabase public.profiles table
  const syncUserProfileToDatabase = async (userId, email, fullName = '', phone = '') => {
    if (!userId || !email) return;
    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          phone: phone || '',
          role: 'customer',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('Notice syncing Supabase profile:', error.message);
      }
    } catch (err) {
      console.warn('Notice syncing profile:', err.message);
    }
  };

  // Helper to map Supabase User session object to state
  const formatUserObject = (supabaseUser) => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Customer',
      phone: supabaseUser.phone || supabaseUser.user_metadata?.phone || '',
      role: 'customer',
    };
  };

  // Sync Supabase Auth State & restore session on startup
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session retrieval note:', error.message);
        }
        if (session?.user) {
          const formatted = formatUserObject(session.user);
          setUser(formatted);
          syncUserProfileToDatabase(session.user.id, session.user.email, formatted.name, formatted.phone);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Supabase session sync error:', err);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const formatted = formatUserObject(session.user);
        setUser(formatted);
        syncUserProfileToDatabase(session.user.id, session.user.email, formatted.name, formatted.phone);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('screenarts_admin_auth', adminAuthenticated ? 'true' : 'false');
  }, [adminAuthenticated]);

  // Email OTP Flow - Step 1: Send real OTP code to Email
  const sendOtp = async (email, metadata = {}) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Invalid email address' };
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: metadata.name || '',
            name: metadata.name || '',
            phone: metadata.phone || '',
          },
        },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('too many')) {
          return { success: false, error: 'Too many requests, please try again later' };
        }
        if (msg.includes('invalid') || msg.includes('email')) {
          return { success: false, error: 'Invalid email address' };
        }
        return { success: false, error: error.message || 'Authentication failed' };
      }

      return { success: true, message: 'Verification code sent' };
    } catch (err) {
      return { success: false, error: 'Too many requests, please try again later' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Email OTP Flow - Step 2: Verify OTP code
  const verifyOtp = async (email, token, metadata = {}) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanToken = token?.trim().replace(/\D/g, '');

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Invalid email address' };
    }
    if (!cleanToken || cleanToken.length < 6) {
      return { success: false, error: 'Invalid verification code' };
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('expired')) {
          return { success: false, error: 'Verification code expired' };
        }
        if (msg.includes('invalid') || msg.includes('otp') || msg.includes('token') || msg.includes('code')) {
          return { success: false, error: 'Invalid verification code' };
        }
        if (msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('attempts')) {
          return { success: false, error: 'Too many attempts' };
        }
        return { success: false, error: error.message || 'Authentication failed' };
      }

      if (data?.user || data?.session?.user) {
        const targetUser = data.user || data.session.user;
        const loggedUser = formatUserObject(targetUser);
        if (metadata.name) loggedUser.name = metadata.name;
        if (metadata.phone) loggedUser.phone = metadata.phone;

        setUser(loggedUser);
        await syncUserProfileToDatabase(loggedUser.id, loggedUser.email, loggedUser.name, loggedUser.phone);
        return { success: true, user: loggedUser };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      return { success: false, error: 'Authentication failed' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out user
  const logoutUser = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setUser(null);
      setAuthLoading(false);
    }
  };

  // Studio Admin Authentication (for studio backend)
  const loginAdmin = (passcode) => {
    if (passcode === '2026' || passcode === 'ScreenArts@2026' || passcode.toLowerCase() === 'admin') {
      setAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect Studio Admin Passcode.' };
  };

  const logoutAdmin = () => {
    setAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminAuthenticated,
        isLoginModalOpen,
        authLoading,
        initializing,
        setIsLoginModalOpen,
        sendOtp,
        verifyOtp,
        logoutUser,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
