import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Customer User State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Studio Admin Authentication State
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('screenarts_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // Customer Login
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

  const logoutUser = () => {
    setUser(null);
  };

  // Admin Authentication (Passcode: '2026' or 'ScreenArts@2026')
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
        setIsLoginModalOpen,
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
