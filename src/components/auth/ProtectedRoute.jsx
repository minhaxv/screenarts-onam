import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, initializing, setIsLoginModalOpen } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!initializing && !user) {
      setIsLoginModalOpen(true);
    }
  }, [initializing, user, setIsLoginModalOpen]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen py-16 text-center text-muted">
        <div className="animate-spin text-gold mb-2">✨</div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
