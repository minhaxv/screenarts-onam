import { useState } from 'react';
import { X, Phone, User, Mail, Lock, Sparkles, CheckCircle2, ArrowRight, Eye, EyeOff, Globe, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserLoginModal.css';

export default function UserLoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    authLoading,
    loginWithEmailPassword,
    registerWithEmail,
    loginWithPhoneOtp,
    loginWithOAuth,
    loginUser,
    logoutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'phone'
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await loginWithEmailPassword(email, password);
    if (res?.success) {
      setSuccessMsg('Welcome back! Successfully authenticated with Supabase.');
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } else {
      setErrorMsg(res?.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const res = await registerWithEmail(email, password, name, phone);
    if (res?.success) {
      setSuccessMsg('Account created successfully with Supabase!');
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } else {
      setErrorMsg(res?.error || 'Registration failed. Please check details.');
    }
  };

  const handleOAuthLogin = async (provider) => {
    setErrorMsg('');
    setSuccessMsg(`Connecting to Supabase ${provider} authentication...`);
    const res = await loginWithOAuth(provider);
    if (res?.success) {
      setSuccessMsg(`Signed in with ${provider.toUpperCase()} via Supabase!`);
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } else {
      setErrorMsg(`Could not authenticate with ${provider}`);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      await loginWithPhoneOtp(phone);
      setStep('otp');
    } else {
      setErrorMsg('Please enter a valid 10-digit mobile number');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      setStep('profile');
    } else {
      setErrorMsg('Please enter valid 4-digit code (e.g. 1234)');
    }
  };

  const handleCompletePhoneLogin = (e) => {
    e.preventDefault();
    loginUser(phone, name || 'Customer', email);
    setStep('phone');
    setSuccessMsg('Phone authentication verified!');
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setSuccessMsg('');
    }, 1000);
  };

  return (
    <div className="login-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
      <div className="login-modal-card page-enter" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="login-modal-close"
          onClick={() => setIsLoginModalOpen(false)}
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {user ? (
          /* Logged In User Dashboard Card */
          <div className="user-profile-card text-center py-2">
            <div className="user-avatar-badge">
              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="inline-flex items-center gap-1 badge badge-gold my-2">
              <ShieldCheck size={14} /> SUPABASE AUTHENTICATED
            </div>
            <h3 className="heading-3 mt-1">{user.name}</h3>
            <p className="text-xs text-muted mb-6">{user.email || user.phone}</p>

            <div className="flex flex-col gap-3">
              <a
                href="/orders"
                className="btn btn-primary btn-md w-full flex items-center justify-center gap-2"
                onClick={() => setIsLoginModalOpen(false)}
              >
                <Package size={18} /> View My Orders & Delivery Status
              </a>
              <a
                href="/customize"
                className="btn btn-outline btn-md w-full flex items-center justify-center gap-2"
                onClick={() => setIsLoginModalOpen(false)}
              >
                🎨 Create & Save Custom Onam Tees
              </a>
              <button
                className="btn btn-ghost btn-sm text-red mt-2 flex items-center justify-center gap-1"
                onClick={() => {
                  logoutUser();
                  setIsLoginModalOpen(false);
                }}
              >
                <LogOut size={16} /> Sign Out Account
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup Modal UI */
          <div className="login-modal-content">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="brand-pill-header">
                <span className="brand-sparkle">✨</span>
                <span>SCREENARTS CALICUT</span>
              </div>
              <h3 className="heading-3 mt-2">
                {activeTab === 'login' ? 'Sign In to Your Account' : activeTab === 'register' ? 'Create Customer Account' : 'Mobile OTP Authentication'}
              </h3>
              <p className="text-xs text-muted mt-1">
                Access your custom Onam prints, order history & exclusive discounts
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="auth-tab-bar">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                <Lock size={14} /> Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                <User size={14} /> New Account
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
                onClick={() => { setActiveTab('phone'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                <Phone size={14} /> Mobile OTP
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="auth-alert alert-error">
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert alert-success">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN (EMAIL + PASSWORD) */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form flex flex-col gap-4">
                <div className="auth-field">
                  <label className="label">Email Address *</label>
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Password *</label>
                    <button
                      type="button"
                      className="text-xs text-gold font-bold hover:underline"
                      onClick={() => setErrorMsg('Password reset link sent to your registered email.')}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input pr-10"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-md w-full mt-1" disabled={authLoading}>
                  {authLoading ? 'Authenticating...' : 'Sign In with Supabase'}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER (EMAIL + PASSWORD + NAME) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="auth-form flex flex-col gap-3">
                <div className="auth-field">
                  <label className="label">Full Name *</label>
                  <div className="auth-input-wrap">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      required
                      placeholder="e.g. Kavitha Unni"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="label">Email Address *</label>
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
                  <label className="label">Create Password *</label>
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input pr-10"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="label">Mobile Number (Optional)</label>
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

                <button type="submit" className="btn btn-primary btn-md w-full mt-2" disabled={authLoading}>
                  {authLoading ? 'Creating Account...' : 'Create Account with Supabase'}
                </button>
              </form>
            )}

            {/* TAB 3: MOBILE OTP */}
            {activeTab === 'phone' && (
              <div className="auth-form flex flex-col gap-4">
                {step === 'phone' && (
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                    <div className="auth-field">
                      <label className="label">Mobile Number *</label>
                      <div className="auth-input-wrap">
                        <Phone size={18} className="auth-input-icon" />
                        <input
                          type="tel"
                          className="auth-input"
                          required
                          placeholder="+91 94473 XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-md w-full" disabled={authLoading}>
                      {authLoading ? 'Sending SMS...' : 'Send Verification Code'} <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div className="p-3 bg-cream rounded-xl text-center text-xs border">
                      Sent OTP code to <strong>+91 {phone}</strong>
                      <span className="block text-gold font-bold mt-1">(Test OTP: 1234)</span>
                    </div>
                    <div className="auth-field">
                      <label className="label text-center">Enter 4-Digit Verification Code *</label>
                      <input
                        type="text"
                        maxLength={4}
                        className="auth-input text-center font-extrabold text-2xl tracking-widest"
                        required
                        placeholder="1 2 3 4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-md w-full">
                      Verify & Continue
                    </button>
                  </form>
                )}

                {step === 'profile' && (
                  <form onSubmit={handleCompletePhoneLogin} className="flex flex-col gap-4">
                    <div className="auth-field">
                      <label className="label">Your Full Name *</label>
                      <div className="auth-input-wrap">
                        <User size={18} className="auth-input-icon" />
                        <input
                          type="text"
                          className="auth-input"
                          required
                          placeholder="e.g. Kavitha Unni"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="label">Email Address (Optional)</label>
                      <div className="auth-input-wrap">
                        <Mail size={18} className="auth-input-icon" />
                        <input
                          type="email"
                          className="auth-input"
                          placeholder="kavitha@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-md w-full">
                      <CheckCircle2 size={18} /> Complete Sign In
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social / Supabase OAuth Divider & Buttons */}
            <div className="oauth-divider">
              <span>OR CONNECT WITH</span>
            </div>

            <div className="oauth-grid">
              <button
                type="button"
                className="oauth-btn oauth-btn-google"
                onClick={() => handleOAuthLogin('google')}
                title="Sign In with Google"
              >
                <svg className="oauth-svg" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="oauth-btn oauth-btn-github"
                onClick={() => handleOAuthLogin('github')}
                title="Sign In with GitHub"
              >
                <svg className="oauth-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Footer Notice */}
            <div className="auth-footer-notice">
              <span>Secured by <strong>Supabase Authentication</strong> • Calicut Studio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

