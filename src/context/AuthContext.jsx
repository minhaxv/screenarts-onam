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

  // Helper to format Indian phone numbers into E.164 (+91XXXXXXXXXX)
  const formatPhoneE164 = (rawPhone) => {
    if (!rawPhone) return '';
    const digits = rawPhone.toString().replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (rawPhone.startsWith('+')) {
      return rawPhone;
    }
    return `+91${digits}`;
  };

  // 1. MOBILE PHONE OTP — Send SMS OTP
  const sendPhoneOtp = async (phoneNum) => {
    const formattedPhone = formatPhoneE164(phoneNum);
    const digitsOnly = formattedPhone.replace(/\D/g, '');

    if (digitsOnly.length < 12) {
      return { success: false, error: 'Enter a valid 10-digit mobile number.' };
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('too many')) {
          return { success: false, error: 'Too many attempts.' };
        }
        return { success: false, error: 'Unable to send OTP.' };
      }

      return { success: true, formattedPhone, message: `OTP sent to ${formattedPhone}` };
    } catch (err) {
      return { success: false, error: 'Unable to send OTP.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. MOBILE PHONE OTP — Verify SMS OTP
  const verifyPhoneOtp = async (phoneNum, otpCode) => {
    const formattedPhone = formatPhoneE164(phoneNum);
    const cleanToken = otpCode?.trim().replace(/\D/g, '');

    if (!cleanToken || cleanToken.length < 6) {
      return { success: false, error: 'Incorrect OTP.' };
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: cleanToken,
        type: 'sms',
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('expired')) {
          return { success: false, error: 'OTP expired.' };
        }
        if (msg.includes('invalid') || msg.includes('otp') || msg.includes('token') || msg.includes('code')) {
          return { success: false, error: 'Incorrect OTP.' };
        }
        if (msg.includes('rate') || msg.includes('limit') || msg.includes('429') || msg.includes('attempts')) {
          return { success: false, error: 'Too many attempts.' };
        }
        return { success: false, error: 'Incorrect OTP.' };
      }

      if (data?.user || data?.session?.user) {
        const targetUser = data.user || data.session.user;
        const loggedUser = formatUserObject(targetUser);
        setUser(loggedUser);
        await syncUserProfileToDatabase(loggedUser.id, loggedUser.email || `${formattedPhone.replace(/\D/g, '')}@phone.screenarts.online`, loggedUser.name, formattedPhone);
        return { success: true, user: loggedUser };
      }

      return { success: false, error: 'Incorrect OTP.' };
    } catch (err) {
      return { success: false, error: 'Incorrect OTP.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. EMAIL LOGIN — Sign In with Password
  const loginWithEmail = async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Incorrect email or password.' };
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('confirm') || msg.includes('unconfirmed')) {
          return { success: false, error: 'Please confirm your email.' };
        }
        return { success: false, error: 'Incorrect email or password.' };
      }

      if (data?.user || data?.session?.user) {
        const targetUser = data.user || data.session.user;
        const loggedUser = formatUserObject(targetUser);
        setUser(loggedUser);
        await syncUserProfileToDatabase(loggedUser.id, loggedUser.email, loggedUser.name, loggedUser.phone);
        return { success: true, user: loggedUser };
      }

      return { success: false, error: 'Incorrect email or password.' };
    } catch (err) {
      return { success: false, error: 'Incorrect email or password.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Helper to resolve production email redirect URL
  const getAuthRedirectUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/auth/callback`;
    }
    return 'https://www.screenarts.online/auth/callback';
  };

  // 4. EMAIL SIGNUP — Create Account
  const signUpWithEmail = async (email, password, name, phone = '') => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }
    if (!name?.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const redirectUrl = getAuthRedirectUrl();

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name.trim(),
            name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message || 'Account creation failed.' };
      }

      if (data?.user) {
        const loggedUser = formatUserObject(data.user);
        setUser(loggedUser);
        await syncUserProfileToDatabase(data.user.id, cleanEmail, name.trim(), phone.trim());
        return { success: true, user: loggedUser, message: 'Account created successfully! Check your email to confirm.' };
      }

      return { success: true, message: 'Account created! Please check your email for confirmation.' };
    } catch (err) {
      return { success: false, error: 'Account creation failed.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. FORGOT PASSWORD — Reset Password Request
  const resetPassword = async (email) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }

    const redirectUrl = getAuthRedirectUrl();

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: 'Unable to send password reset email.' };
      }

      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err) {
      return { success: false, error: 'Unable to send password reset email.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Email OTP Flow - Step 1: Send real OTP code to Email
  const sendOtp = async (email, metadata = {}) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }

    const redirectUrl = getAuthRedirectUrl();

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
          data: {
            full_name: metadata.name || '',
            name: metadata.name || '',
            phone: metadata.phone || '',
          },
        },
      });

      if (error) {
        return { success: false, error: 'Unable to send verification code.' };
      }

      return { success: true, message: 'Verification code sent.' };
    } catch (err) {
      return { success: false, error: 'Unable to send verification code.' };
    } finally {
      setAuthLoading(false);
    }
  };

  // Email OTP Flow - Step 2: Verify OTP code
  const verifyOtp = async (email, token, metadata = {}) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanToken = token?.trim().replace(/\D/g, '');

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (!cleanToken || cleanToken.length < 6) {
      return { success: false, error: 'Incorrect OTP.' };
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        return { success: false, error: 'Incorrect OTP.' };
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

      return { success: false, error: 'Authentication failed.' };
    } catch (err) {
      return { success: false, error: 'Authentication failed.' };
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
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithEmail,
        signUpWithEmail,
        resetPassword,
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
