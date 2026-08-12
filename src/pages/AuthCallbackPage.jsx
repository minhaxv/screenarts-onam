import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Exchange token / session from URL or Hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setErrorMsg(error.message || 'Verification link failed or expired.');
          return;
        }

        if (session?.user) {
          // Sync profile to database
          const userId = session.user.id;
          const email = session.user.email;
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0] || 'Customer';
          const phone = session.user.phone || session.user.user_metadata?.phone || '';

          try {
            await supabase.from('profiles').upsert(
              {
                id: userId,
                email: email,
                full_name: name,
                phone: phone,
                role: 'customer',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );
          } catch (e) {}

          setStatus('success');
          setTimeout(() => {
            navigate('/account');
          }, 1500);
        } else {
          // Listen for onAuthStateChange if session exchange takes a moment
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              setStatus('success');
              setTimeout(() => {
                navigate('/account');
              }, 1200);
            }
          });

          setTimeout(() => {
            if (!user) {
              setStatus('error');
              setErrorMsg('Session verification timed out. Please try signing in again.');
            }
          }, 4000);

          return () => subscription?.unsubscribe();
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg('Authentication error. Please sign in directly.');
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

  return (
    <div className="container py-16 page-enter" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card p-8 text-center max-w-md w-full" style={{ borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        {status === 'verifying' && (
          <div>
            <RefreshCw size={40} className="spin mx-auto text-gold mb-4" />
            <h2 className="heading-3 mb-2">Verifying Authentication</h2>
            <p className="text-muted text-xs">Confirming your email and establishing your session...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle2 size={48} className="mx-auto text-green mb-4" style={{ color: '#16A34A' }} />
            <h2 className="heading-3 mb-2">Email Confirmed! 🎉</h2>
            <p className="text-muted text-xs">Your account is verified. Redirecting to your account dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle size={48} className="mx-auto text-red mb-4" style={{ color: '#DC2626' }} />
            <h2 className="heading-3 mb-2">Verification Error</h2>
            <p className="text-muted text-xs mb-4">{errorMsg}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/account')}>
              Go to Account Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
