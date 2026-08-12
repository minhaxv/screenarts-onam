import { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, CheckCircle2, Eye, EyeOff, ShieldCheck, LogOut, Package } from 'lucide-react';
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
    logoutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await loginWithEmailPassword(email, password);
    if (res?.success) {
      setSuccessMsg('Welcome back! Successfully signed in with Supabase Email Auth.');
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } else {
      setErrorMsg(res?.error || 'Invalid email or password. Please check your credentials.');
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
      setErrorMsg(res?.error || 'Registration failed. Please check your details.');
    }
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
              <ShieldCheck size={14} /> SUPABASE VERIFIED USER
            </div>
            <h3 className="heading-3 mt-1">{user.name}</h3>
            <p className="text-xs text-muted mb-6">{user.email}</p>

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
                {activeTab === 'login' ? 'Email Account Sign In' : 'Create Email Account'}
              </h3>
              <p className="text-xs text-muted mt-1">
                Sign in with your Email & Password via Supabase Authentication
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
                <User size={14} /> Create Account
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
                      onClick={() => setErrorMsg('Password reset link sent to your email address.')}
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
                  {authLoading ? 'Authenticating...' : 'Sign In with Email'}
                </button>

                <div className="text-center text-xs text-muted mt-2">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    className="text-green font-bold underline"
                    onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                  >
                    Create Account Here
                  </button>
                </div>
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

                <button type="submit" className="btn btn-primary btn-md w-full mt-2" disabled={authLoading}>
                  {authLoading ? 'Creating Account...' : 'Create Account with Email'}
                </button>

                <div className="text-center text-xs text-muted mt-2">
                  Already have an email account?{' '}
                  <button
                    type="button"
                    className="text-green font-bold underline"
                    onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                  >
                    Sign In Here
                  </button>
                </div>
              </form>
            )}

            {/* Footer Notice */}
            <div className="auth-footer-notice">
              <span>Secured by <strong>Supabase Email Authentication</strong> • Calicut Studio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


