import { useState, useEffect } from 'react';
import { X, Mail, ShieldCheck, LogOut, Package, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserLoginModal.css';

export default function UserLoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    authLoading,
    sendOtp,
    verifyOtp,
    logoutUser,
  } = useAuth();

  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Countdown Timer
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 'OTP' && resendTimer > 0 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer, canResend]);

  if (!isLoginModalOpen) return null;

  const resetForm = () => {
    setStep('EMAIL');
    setEmail('');
    setOtp('');
    setErrorMsg('');
    setSuccessMsg('');
    setResendTimer(60);
    setCanResend(false);
  };

  const handleClose = () => {
    setIsLoginModalOpen(false);
    resetForm();
  };

  // Step 1: Send OTP to Email
  const handleSendEmail = async (e, isResend = false) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Invalid email address');
      return;
    }

    const res = await sendOtp(cleanEmail);
    if (res.success) {
      setStep('OTP');
      setSuccessMsg('Verification code sent to your email.');
      setResendTimer(60);
      setCanResend(false);
    } else {
      setErrorMsg(res.error || 'Failed to send verification code');
    }
  };

  // Step 2: Verify 6-digit OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('Invalid verification code');
      return;
    }

    const res = await verifyOtp(email, cleanOtp);
    if (res.success) {
      setSuccessMsg('Authentication successful! Welcome.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Invalid verification code');
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-card page-enter" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="login-modal-close"
          onClick={handleClose}
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {user ? (
          /* LOGGED-IN DASHBOARD VIEW */
          <div className="user-profile-card text-center py-2">
            <div className="user-avatar-badge">
              {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="inline-flex items-center gap-1 badge badge-gold my-2" style={{ marginTop: '12px', marginBottom: '8px' }}>
              <ShieldCheck size={14} /> SUPABASE VERIFIED USER
            </div>
            <h3 className="heading-3 mt-1" style={{ fontSize: '18px', fontWeight: '800' }}>{user.name || 'Customer'}</h3>
            <p className="text-xs text-muted mb-6">{user.email}</p>

            <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="/orders"
                className="btn btn-primary btn-md w-full flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <Package size={18} /> View My Orders & Delivery Status
              </a>
              <a
                href="/customize"
                className="btn btn-outline btn-md w-full flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                🎨 Create Custom Onam T-Shirt
              </a>
              <button
                className="btn btn-ghost btn-sm text-red mt-2 flex items-center justify-center gap-1"
                style={{ color: '#DC2626', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: '8px' }}
                onClick={() => {
                  logoutUser();
                  handleClose();
                }}
              >
                <LogOut size={16} /> Sign Out Account
              </button>
            </div>
          </div>
        ) : (
          /* UNIFIED PASSWORDLESS EMAIL OTP AUTHENTICATION */
          <div className="login-modal-content">
            {/* Header Pill & Title */}
            <div className="text-center mb-5">
              <div className="brand-pill-header">
                <span className="brand-sparkle">✨</span>
                <span>SCREENARTS CALICUT</span>
              </div>
              <h3 className="heading-3 mt-2" style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0 4px 0' }}>
                {step === 'EMAIL' ? 'Email Authentication' : 'Enter Verification Code'}
              </h3>
              <p className="text-xs text-muted" style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                {step === 'EMAIL'
                  ? 'Enter your email to sign in or create an account automatically'
                  : `Verification code sent to ${email}`}
              </p>
            </div>

            {/* Global Alerts */}
            {errorMsg && (
              <div className="auth-alert alert-error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert alert-success">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* STEP 1: EMAIL INPUT SCREEN */}
            {step === 'EMAIL' && (
              <form onSubmit={(e) => handleSendEmail(e)} className="auth-form flex flex-col gap-4">
                <div className="auth-field">
                  <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Email Address *
                  </label>
                  <div className="auth-input-wrap">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-md w-full mt-2"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Sending OTP Code...' : 'Continue with Email'}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP CODE VERIFICATION SCREEN */}
            {step === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="auth-form flex flex-col gap-4">
                {/* Active Target Email Badge */}
                <div
                  className="p-3 bg-cream rounded-xl border flex items-center justify-between"
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#FAF7F2',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} style={{ color: '#D4A843', flexShrink: 0 }} />
                    <span className="text-xs font-bold text-charcoal truncate" style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E' }}>
                      {email}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                    style={{ fontSize: '11px', color: '#D4A843', fontWeight: '700', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    onClick={() => {
                      setStep('EMAIL');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    <ArrowLeft size={12} /> Change
                  </button>
                </div>

                {/* 6-Digit Code Input */}
                <div className="auth-field">
                  <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    Verification Code (OTP) *
                  </label>
                  <div className="auth-input-wrap">
                    <KeyRound size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="auth-input otp-code-input"
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ letterSpacing: '6px', fontSize: '18px', fontWeight: '800' }}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-md w-full mt-2"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={authLoading || otp.length < 6}
                >
                  {authLoading ? 'Verifying Code...' : 'Verify & Continue'}
                </button>

                {/* Resend OTP Section */}
                <div className="text-center mt-3" style={{ textAlign: 'center', marginTop: '12px' }}>
                  {canResend ? (
                    <button
                      type="button"
                      className="text-xs text-gold font-bold hover:underline inline-flex items-center gap-1"
                      style={{ fontSize: '12px', color: '#D4A843', fontWeight: '700', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      onClick={(e) => handleSendEmail(e, true)}
                      disabled={authLoading}
                    >
                      <RefreshCw size={14} className={authLoading ? 'animate-spin' : ''} /> Resend Code
                    </button>
                  ) : (
                    <span className="text-xs text-muted" style={{ fontSize: '12px', color: '#94A3B8' }}>
                      Resend code in <strong style={{ color: '#1A1A2E' }}>{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* Footer Notice */}
            <div className="auth-footer-notice">
              <span>Secured by <strong>Supabase Email OTP Authentication</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
