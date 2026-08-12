import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, authLoading, initializing, setIsLoginModalOpen } = useAuth();

  useEffect(() => {
    if (!initializing && !user) {
      setIsLoginModalOpen(true);
    }
  }, [initializing, user, setIsLoginModalOpen]);

  if (initializing || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen py-16 text-center text-muted" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spin text-gold mb-2">✨</div>
        <p className="font-bold text-charcoal">Verifying Administrator Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Allow access to AdminPage (which has Studio Passcode 2026 unlock screen)
  return children;
}
