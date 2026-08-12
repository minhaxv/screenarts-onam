import { useState, useEffect } from 'react';
import { X, Mail, User, Phone, ShieldCheck, LogOut, Package, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Lock, UserPlus, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserLoginModal.css';

export default function UserLoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    authLoading,
    sendPhoneOtp,
    verifyPhoneOtp,
    loginWithEmail,
    signUpWithEmail,
    resetPassword,
    logoutUser,
  } = useAuth();

  const [authMode, setAuthMode] = useState('MOBILE'); // 'MOBILE' | 'EMAIL'
  const [emailSubTab, setEmailSubTab] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP' | 'FORGOT'
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'

  // Mobile Fields
  const [mobileNum, setMobileNum] = useState('');
  const [activeFormattedPhone, setActiveFormattedPhone] = useState('');

  // Email & Account Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
    setStep('FORM');
    setAuthMode('MOBILE');
    setEmailSubTab('LOGIN');
    setMobileNum('');
    setActiveFormattedPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
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

  // 1. MOBILE PHONE OTP — Send SMS OTP
  const handleSendMobileOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await sendPhoneOtp(mobileNum);
    if (res.success) {
      setActiveFormattedPhone(res.formattedPhone);
      setStep('OTP');
      setSuccessMsg(res.message);
      setResendTimer(60);
      setCanResend(false);
    } else {
      setErrorMsg(res.error);
    }
  };

  // 2. MOBILE PHONE OTP — Verify SMS OTP
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('Incorrect OTP.');
      return;
    }

    const res = await verifyPhoneOtp(activeFormattedPhone || mobileNum, cleanOtp);
    if (res.success) {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setErrorMsg(res.error);
    }
  };

  // 3. EMAIL — Login with Email & Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await loginWithEmail(email, password);
    if (res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setErrorMsg(res.error);
    }
  };

  // 4. EMAIL — Create Account
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = await signUpWithEmail(email, password, name, phone);
    if (res.success) {
      setSuccessMsg(res.message || 'Account created successfully!');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setErrorMsg(res.error);
    }
  };

  // 5. EMAIL — Forgot Password Reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await resetPassword(email);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-card page-enter" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="login-modal-close" onClick={handleClose} title="Close Modal">
          <X size={18} />
        </button>

        {user ? (
          /* LOGGED-IN PROFILE VIEW */
          <div className="user-profile-card text-center py-2">
            <div className="user-avatar-badge">
              {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="inline-flex items-center gap-1 badge badge-gold my-2" style={{ marginTop: '12px', marginBottom: '8px' }}>
              <ShieldCheck size={14} /> SUPABASE VERIFIED USER
            </div>
            <h3 className="heading-3 mt-1" style={{ fontSize: '18px', fontWeight: '800' }}>{user.name || 'Customer'}</h3>
            <p className="text-xs text-muted mb-4">{user.email || user.phone}</p>

            <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="/account"
                className="btn btn-primary btn-md w-full flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <User size={18} /> My Account Dashboard
              </a>
              <a
                href="/orders"
                className="btn btn-outline btn-md w-full flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <Package size={18} /> View Orders & Delivery Status
              </a>
              <button
                className="btn btn-ghost btn-sm text-red mt-2 flex items-center justify-center gap-1"
                style={{ color: '#DC2626', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: '6px' }}
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
          /* LOGIN / SIGNUP AUTHENTICATION UI */
          <div className="login-modal-content">
            {/* Header Brand Pill & Title */}
            <div className="text-center mb-4">
              <div className="brand-pill-header">
                <span className="brand-sparkle">✨</span>
                <span>SCREENARTS CALICUT</span>
              </div>
              <h3 className="heading-3 mt-2" style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0 4px 0' }}>
                {step === 'OTP'
                  ? 'Verify Mobile OTP'
                  : authMode === 'MOBILE'
                  ? 'Mobile Phone Login'
                  : emailSubTab === 'LOGIN'
                  ? 'Email Sign In'
                  : emailSubTab === 'SIGNUP'
                  ? 'Create New Account'
                  : 'Reset Password'}
              </h3>
              <p className="text-xs text-muted" style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                {step === 'OTP'
                  ? `SMS code sent to ${activeFormattedPhone || mobileNum}`
                  : authMode === 'MOBILE'
                  ? 'Sign in or create account using your 10-digit mobile number'
                  : emailSubTab === 'LOGIN'
                  ? 'Sign in with your registered email & password'
                  : emailSubTab === 'SIGNUP'
                  ? 'Create your customer account to manage orders'
                  : 'Enter your email to receive a password reset link'}
              </p>
            </div>

            {/* Top Selector: Mobile Number vs Email */}
            {step === 'FORM' && (
              <div className="auth-tab-bar mb-4">
                <button
                  type="button"
                  className={`auth-tab-btn ${authMode === 'MOBILE' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('MOBILE');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  <Smartphone size={14} /> Mobile Number
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${authMode === 'EMAIL' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('EMAIL');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  <Mail size={14} /> Email
                </button>
              </div>
            )}

            {/* Global Alerts */}
            {errorMsg && (
              <div className="auth-alert alert-error mb-3">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert alert-success mb-3">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ════════════ 1. MOBILE NUMBER MODE ════════════ */}
            {authMode === 'MOBILE' && step === 'FORM' && (
              <form onSubmit={handleSendMobileOtp} className="auth-form flex flex-col gap-3">
                <div className="auth-field">
                  <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>
                    Mobile Number *
                  </label>
                  <div className="auth-input-wrap flex items-center">
                    <span className="px-3 py-2 bg-cream font-bold text-sm text-charcoal border-r" style={{ padding: '0 12px', fontWeight: '700', color: '#1A1A2E' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      className="auth-input"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobileNum}
                      onChange={(e) => setMobileNum(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-md w-full mt-2"
                  disabled={authLoading || mobileNum.length < 10}
                >
                  {authLoading ? 'Sending OTP...' : 'Send SMS OTP'}
                </button>
              </form>
            )}

            {/* MOBILE OTP VERIFICATION SCREEN */}
            {authMode === 'MOBILE' && step === 'OTP' && (
              <form onSubmit={handleVerifyMobileOtp} className="auth-form flex flex-col gap-4">
                <div className="p-3 bg-cream rounded-xl border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} style={{ color: '#D4A843' }} />
                    <span className="text-xs font-bold text-charcoal">
                      {activeFormattedPhone || mobileNum}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                    style={{ fontSize: '11px', color: '#D4A843', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    onClick={() => {
                      setStep('FORM');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    <ArrowLeft size={12} /> Change Number
                  </button>
                </div>

                <div className="auth-field">
                  <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                    6-Digit SMS OTP *
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
                  className="btn btn-primary btn-md w-full"
                  disabled={authLoading || otp.length < 6}
                >
                  {authLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="text-center mt-2">
                  {canResend ? (
                    <button
                      type="button"
                      className="text-xs text-gold font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                      style={{ fontSize: '12px', color: '#D4A843', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      onClick={(e) => handleSendMobileOtp(e, true)}
                      disabled={authLoading}
                    >
                      <RefreshCw size={14} className={authLoading ? 'spin' : ''} /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-xs text-muted">
                      Resend OTP in <strong>{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* ════════════ 2. EMAIL MODE ════════════ */}
            {authMode === 'EMAIL' && (
              <div>
                {/* Email Sub-tabs */}
                <div className="flex border-b mb-4 text-xs font-bold" style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className={`py-2 px-4 ${emailSubTab === 'LOGIN' ? 'border-b-2 border-gold text-charcoal' : 'text-muted'}`}
                    style={{ border: 'none', background: 'transparent', borderBottom: emailSubTab === 'LOGIN' ? '2px solid #D4A843' : 'none', cursor: 'pointer', padding: '6px 12px' }}
                    onClick={() => { setEmailSubTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 ${emailSubTab === 'SIGNUP' ? 'border-b-2 border-gold text-charcoal' : 'text-muted'}`}
                    style={{ border: 'none', background: 'transparent', borderBottom: emailSubTab === 'SIGNUP' ? '2px solid #D4A843' : 'none', cursor: 'pointer', padding: '6px 12px' }}
                    onClick={() => { setEmailSubTab('SIGNUP'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Create Account
                  </button>
                </div>

                {/* EMAIL SIGN IN */}
                {emailSubTab === 'LOGIN' && (
                  <form onSubmit={handleEmailLogin} className="auth-form flex flex-col gap-3">
                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Email Address *</label>
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

                    <div className="auth-field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="label" style={{ fontSize: '12px', fontWeight: '700', display: 'block' }}>Password *</label>
                        <button
                          type="button"
                          className="text-xs text-gold font-bold hover:underline"
                          style={{ fontSize: '11px', color: '#D4A843', border: 'none', background: 'transparent', cursor: 'pointer' }}
                          onClick={() => { setEmailSubTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="auth-input-wrap">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          type="password"
                          className="auth-input"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-md w-full mt-2" disabled={authLoading}>
                      {authLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                )}

                {/* EMAIL CREATE ACCOUNT */}
                {emailSubTab === 'SIGNUP' && (
                  <form onSubmit={handleEmailSignUp} className="auth-form flex flex-col gap-3">
                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Full Name *</label>
                      <div className="auth-input-wrap">
                        <User size={18} className="auth-input-icon" />
                        <input
                          type="text"
                          className="auth-input"
                          required
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Email Address *</label>
                      <div className="auth-input-wrap">
                        <Mail size={18} className="auth-input-icon" />
                        <input
                          type="email"
                          className="auth-input"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Mobile Number (Optional)</label>
                      <div className="auth-input-wrap">
                        <Phone size={18} className="auth-input-icon" />
                        <input
                          type="tel"
                          className="auth-input"
                          placeholder="+91 94473 XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Password (min 8 characters) *</label>
                      <div className="auth-input-wrap">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          type="password"
                          className="auth-input"
                          required
                          minLength={8}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Confirm Password *</label>
                      <div className="auth-input-wrap">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          type="password"
                          className="auth-input"
                          required
                          minLength={8}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-md w-full mt-2" disabled={authLoading}>
                      {authLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                )}

                {/* EMAIL FORGOT PASSWORD */}
                {emailSubTab === 'FORGOT' && (
                  <form onSubmit={handleForgotPassword} className="auth-form flex flex-col gap-3">
                    <div className="auth-field">
                      <label className="label" style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Email Address *</label>
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

                    <button type="submit" className="btn btn-primary btn-md w-full mt-2" disabled={authLoading}>
                      {authLoading ? 'Sending...' : 'Send Password Reset Link'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-gold mt-1"
                      style={{ color: '#D4A843', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      onClick={() => setEmailSubTab('LOGIN')}
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Footer Notice */}
            <div className="auth-footer-notice mt-4 text-center">
              <span className="text-xs text-muted">Secured by <strong>Supabase Authentication</strong> • ScreenArts Calicut</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

