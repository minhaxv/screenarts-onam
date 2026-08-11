import { useState } from 'react';
import { X, Phone, User, Mail, Lock, Sparkles, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
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
    loginUser,
    logoutUser,
  } = useAuth();

  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (isRegister) {
      const res = await registerWithEmail(email, password, name, phone);
      if (!res.success) setErrorMsg(res.error || 'Registration failed');
    } else {
      const res = await loginWithEmailPassword(email, password);
      if (!res.success) setErrorMsg(res.error || 'Login failed');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      await loginWithPhoneOtp(phone);
      setStep('otp');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setStep('profile');
  };

  const handleCompletePhoneLogin = (e) => {
    e.preventDefault();
    loginUser(phone, name || 'Customer', email);
    setStep('phone');
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card card-white rounded-3xl p-8 shadow-2xl relative max-w-md w-full">
        <button
          className="login-modal-close btn-ghost p-2 rounded-full absolute top-4 right-4"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <X size={20} />
        </button>

        {user ? (
          /* User Profile View */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gold text-charcoal rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="badge badge-gold">SUPABASE VERIFIED CUSTOMER</span>
            <h3 className="heading-3 mt-2">{user.name}</h3>
            <p className="text-sm text-muted">{user.email || user.phone}</p>

            <div className="mt-6 flex flex-col gap-2">
              <a href="/orders" className="btn btn-outline btn-md w-full" onClick={() => setIsLoginModalOpen(false)}>
                📦 View My Orders & Tracking
              </a>
              <button
                className="btn btn-ghost btn-sm text-red mt-2"
                onClick={() => {
                  logoutUser();
                  setIsLoginModalOpen(false);
                }}
              >
                Sign Out Account
              </button>
            </div>
          </div>
        ) : (
          /* Login & Register View */
          <div>
            <div className="text-center mb-6">
              <span className="badge badge-gold">
                <Sparkles size={14} /> ONAM CUSTOMER LOGIN
              </span>
              <h3 className="heading-3 mt-2">
                {method === 'email' ? (isRegister ? 'Create ScreenArts Account' : 'Supabase Email Sign In') : 'Phone OTP Login'}
              </h3>
              <p className="text-xs text-muted mt-1">Sign in with Supabase Auth to track orders & save custom designs</p>
            </div>

            {/* Auth Method Toggle Bar */}
            <div className="flex bg-cream p-1 rounded-xl mb-6 border">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white shadow-sm text-charcoal' : 'text-muted'}`}
                onClick={() => { setMethod('email'); setErrorMsg(''); }}
              >
                ✉️ Email & Password
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white shadow-sm text-charcoal' : 'text-muted'}`}
                onClick={() => { setMethod('phone'); setErrorMsg(''); }}
              >
                📱 Mobile OTP
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 text-red border border-red-200 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* EMAIL METHOD */}
            {method === 'email' && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                {isRegister && (
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                      <User size={18} className="text-muted mr-2" />
                      <input
                        type="text"
                        className="input border-none bg-transparent"
                        required
                        placeholder="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Email Address *</label>
                  <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                    <Mail size={18} className="text-muted mr-2" />
                    <input
                      type="email"
                      className="input border-none bg-transparent"
                      required
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password *</label>
                  <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                    <Lock size={18} className="text-muted mr-2" />
                    <input
                      type="password"
                      className="input border-none bg-transparent"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="label">Mobile Phone (Optional)</label>
                    <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                      <Phone size={18} className="text-muted mr-2" />
                      <input
                        type="tel"
                        className="input border-none bg-transparent"
                        placeholder="+91 94473 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-md mt-2" disabled={authLoading}>
                  {authLoading ? 'Authenticating with Supabase...' : isRegister ? 'Create Supabase Account' : 'Sign In with Supabase'}
                </button>

                <div className="text-center text-xs text-muted mt-2">
                  {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    className="text-green font-bold underline"
                    onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
                  >
                    {isRegister ? 'Sign In Here' : 'Register New Account'}
                  </button>
                </div>
              </form>
            )}

            {/* PHONE METHOD */}
            {method === 'phone' && (
              <div>
                {step === 'phone' && (
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                    <div>
                      <label className="label">Mobile Number *</label>
                      <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                        <Phone size={18} className="text-muted mr-2" />
                        <input
                          type="tel"
                          className="input border-none bg-transparent"
                          required
                          placeholder="+91 94473 XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-md mt-2" disabled={authLoading}>
                      {authLoading ? 'Sending Supabase SMS OTP...' : 'Send OTP Code'} <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div className="p-3 bg-cream rounded-xl text-center text-xs">
                      Sent OTP code to <strong>+91 {phone}</strong>
                      <span className="block text-gold font-bold mt-1">(Test OTP: 1234)</span>
                    </div>
                    <div>
                      <label className="label">Enter 4-Digit OTP *</label>
                      <input
                        type="text"
                        maxLength={4}
                        className="input text-center font-bold text-xl tracking-widest"
                        required
                        placeholder="1 2 3 4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-md">
                      Verify & Continue
                    </button>
                  </form>
                )}

                {step === 'profile' && (
                  <form onSubmit={handleCompletePhoneLogin} className="flex flex-col gap-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                        <User size={18} className="text-muted mr-2" />
                        <input
                          type="text"
                          className="input border-none bg-transparent"
                          required
                          placeholder="e.g. Kavitha Unni"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address (Optional)</label>
                      <div className="input-wrap flex items-center bg-cream rounded-xl px-3 border">
                        <Mail size={18} className="text-muted mr-2" />
                        <input
                          type="email"
                          className="input border-none bg-transparent"
                          placeholder="kavitha@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-md mt-2">
                      <CheckCircle2 size={18} /> Complete Sign In
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
