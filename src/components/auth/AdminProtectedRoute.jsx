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

  // Check if role is admin
  if (user.role !== 'admin') {
    return (
      <div className="container text-center py-16 page-enter" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card p-8 text-center max-w-md w-full" style={{ borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <ShieldAlert size={48} className="mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="heading-3 mb-2" style={{ color: '#1A1A2E' }}>403 — Unauthorized Access</h2>
          <p className="text-muted text-xs mb-4">
            Your account (<strong>{user.email || user.phone}</strong>) has customer access privileges only. Administrator rights are required to access this area.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/account" className="btn btn-primary btn-sm">
              <UserCheck size={16} /> Go to Customer Account
            </Link>
            <Link to="/" className="btn btn-ghost btn-sm">
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
