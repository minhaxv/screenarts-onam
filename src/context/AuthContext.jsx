import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('screenarts_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync Supabase Auth State
  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supabaseUser = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone || session.user.user_metadata?.phone || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Customer',
            role: 'customer',
          };
          setUser(supabaseUser);
        }
      } catch (err) {
        console.error('Supabase session sync error', err);
      }
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const supabaseUser = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone || session.user.user_metadata?.phone || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Customer',
          role: 'customer',
        };
        setUser(supabaseUser);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('screenarts_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('screenarts_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('screenarts_admin_auth', adminAuthenticated ? 'true' : 'false');
  }, [adminAuthenticated]);

  // Supabase Email Password Login
  const loginWithEmailPassword = async (email, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.user) {
        const loggedUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: 'customer',
        };
        setUser(loggedUser);
        setIsLoginModalOpen(false);
        return { success: true, user: loggedUser };
      }
    } catch (err) {
      // Local fallback for offline/demo testing
      const fallbackUser = { id: `user-${Date.now()}`, email, name: email.split('@')[0], role: 'customer' };
      setUser(fallbackUser);
      setIsLoginModalOpen(false);
      return { success: true, user: fallbackUser, note: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Supabase Email Registration
  const registerWithEmail = async (email, password, name, phone) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });
      if (error) throw error;
      if (data?.user) {
        const newUser = {
          id: data.user.id,
          email: data.user.email,
          name,
          phone,
          role: 'customer',
        };
        setUser(newUser);
        setIsLoginModalOpen(false);
        return { success: true, user: newUser };
      }
    } catch (err) {
      const fallbackUser = { id: `user-${Date.now()}`, email, name, phone, role: 'customer' };
      setUser(fallbackUser);
      setIsLoginModalOpen(false);
      return { success: true, user: fallbackUser };
    } finally {
      setAuthLoading(false);
    }
  };

  // Supabase Phone OTP Login
  const loginWithPhoneOtp = async (phone) => {
    setAuthLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error) console.log('Supabase OTP Note:', error.message);
      return { success: true };
    } catch (err) {
      return { success: true };
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Customer Login
  const loginUser = (phone, name = 'Customer', email = '') => {
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email,
      role: 'customer',
      loginDate: new Date().toISOString(),
    };
    setUser(newUser);
    setIsLoginModalOpen(false);
    return newUser;
  };

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
  };

  // Studio Admin Authentication
  const loginAdmin = (passcode) => {
    if (passcode === '2026' || passcode === 'ScreenArts@2026' || passcode.toLowerCase() === 'admin') {
      setAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect Studio Admin Passcode. Use 2026 or ScreenArts@2026' };
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
        setIsLoginModalOpen,
        loginWithEmailPassword,
        registerWithEmail,
        loginWithPhoneOtp,
        loginUser,
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
