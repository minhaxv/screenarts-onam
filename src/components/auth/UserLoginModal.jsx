import { useState } from 'react';
import { X, Phone, User, Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserLoginModal.css';

export default function UserLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, user, loginUser, logoutUser } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '1234' || otp.length === 4) {
      setStep('profile');
    } else {
      alert('Default test OTP is 1234');
      setStep('profile');
    }
  };

  const handleCompleteLogin = (e) => {
    e.preventDefault();
    loginUser(phone, name || 'Customer', email);
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setEmail('');
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
            <div className="w-16 h-16 bg-gold text-charcoal rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="badge badge-gold">SCREENARTS CUSTOMER</span>
            <h3 className="heading-3 mt-2">{user.name}</h3>
            <p className="text-sm text-muted">{user.phone} {user.email && `• ${user.email}`}</p>

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
          /* Login Flow */
          <div>
            <div className="text-center mb-6">
              <span className="badge badge-gold">
                <Sparkles size={14} /> ONAM CUSTOMER LOGIN
              </span>
              <h3 className="heading-3 mt-2">Welcome to ScreenArts</h3>
              <p className="text-xs text-muted mt-1">Sign in to track custom orders, save designs, & speed checkout</p>
            </div>

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
                <button type="submit" className="btn btn-primary btn-md mt-2">
                  Send OTP Code <ArrowRight size={16} />
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="p-3 bg-cream rounded-xl text-center text-xs">
                  Sent 4-digit code to <strong>+91 {phone}</strong>
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
              <form onSubmit={handleCompleteLogin} className="flex flex-col gap-4">
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
    </div>
  );
}
