import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Package, Palette, MapPin, Settings, LogOut, ShieldCheck, ChevronRight, Clock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';
import './AccountPage.css';

export default function AccountPage() {
  const { user, logoutUser, setIsLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userOrders, setUserOrders] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch User's Orders from Supabase
        const { data: dbOrders } = await supabase
          .from('orders')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email},phone.eq.${user.phone}`)
          .order('created_at', { ascending: false });

        if (Array.isArray(dbOrders)) {
          setUserOrders(dbOrders);
        }

        // Fetch User's Custom Artwork Designs
        const { data: dbDesigns } = await supabase
          .from('custom_designs')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .order('created_at', { ascending: false });

        if (Array.isArray(dbDesigns)) {
          setCustomDesigns(dbDesigns);
        }
      } catch (err) {
        console.warn('Notice loading account data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, setIsLoginModalOpen]);

  if (!user) {
    return (
      <div className="container text-center py-16 page-enter" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="heading-3">Customer Account Access</h2>
        <p className="text-muted mt-2">Please sign in or create an account to view your dashboard.</p>
        <button className="btn btn-primary mt-4" onClick={() => setIsLoginModalOpen(true)}>
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: profileForm.email,
        full_name: profileForm.name,
        phone: profileForm.phone,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setMsg('Profile updated successfully!');
      } else {
        setMsg('Failed to update profile.');
      }
    } catch (err) {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page page-enter">
      {/* Account Hero Header */}
      <div className="account-hero">
        <div className="container">
          <div className="account-user-banner flex items-center gap-4">
            <div className="account-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div>
              <span className="badge badge-gold">SCREENARTS CUSTOMER</span>
              <h1 className="heading-2 mt-1 mb-0">{user.name || 'ScreenArts Customer'}</h1>
              <p className="text-muted text-xs mt-1">{user.email || user.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="account-layout">
          {/* Navigation Sidebar */}
          <aside className="account-sidebar">
            <nav className="account-nav flex flex-col gap-2">
              <button
                className={`account-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> My Profile & Details
              </button>

              <button
                className={`account-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} /> My Orders ({userOrders.length})
              </button>

              <button
                className={`account-nav-btn ${activeTab === 'designs' ? 'active' : ''}`}
                onClick={() => setActiveTab('designs')}
              >
                <Palette size={18} /> Custom Designs ({customDesigns.length})
              </button>

              <button
                className={`account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={18} /> Saved Addresses
              </button>

              <button
                className={`account-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} /> Account Settings
              </button>

              <button
                className="account-nav-btn text-red mt-4"
                style={{ color: '#DC2626' }}
                onClick={() => {
                  logoutUser();
                  navigate('/');
                }}
              >
                <LogOut size={18} /> Log Out
              </button>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="account-main">
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="account-card card p-6">
                <h3 className="heading-4 mb-4">Customer Profile</h3>
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  {msg && <div className="p-3 bg-cream rounded-xl text-xs font-bold text-charcoal">{msg}</div>}

                  <div className="checkout-field">
                    <label className="label">Full Name</label>
                    <input
                      className="input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="checkout-field">
                    <label className="label">Email Address</label>
                    <input
                      className="input"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Your email address"
                    />
                  </div>

                  <div className="checkout-field">
                    <label className="label">Mobile Phone Number</label>
                    <input
                      className="input"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-md self-start" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="account-card card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="heading-4 mb-0">My Orders & Purchases</h3>
                  <Link to="/shop" className="btn btn-outline btn-sm">Shop Onam Collection</Link>
                </div>

                {userOrders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{ord.order_number}</span>
                            <span className="badge badge-gold">{ord.order_status || 'Pending'}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">
                            Date: {new Date(ord.created_at).toLocaleDateString()} • {Array.isArray(ord.items) ? ord.items.length : 1} items
                          </p>
                          <p className="text-xs font-bold text-charcoal mt-1">
                            Total: {formatPrice(ord.total_amount)}
                          </p>
                        </div>
                        <Link to={`/orders?num=${encodeURIComponent(ord.order_number)}`} className="btn btn-ghost btn-sm">
                          Track Status <ChevronRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted">
                    <Package size={40} className="mx-auto text-gold mb-2" />
                    <p className="font-bold text-charcoal">No orders placed yet.</p>
                    <p className="text-xs">When you place an order, track status and receipt here.</p>
                    <Link to="/shop" className="btn btn-primary btn-sm mt-4">Start Shopping</Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. CUSTOM DESIGNS TAB */}
            {activeTab === 'designs' && (
              <div className="account-card card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="heading-4 mb-0">My Custom T-Shirt Artwork</h3>
                  <Link to="/customize" className="btn btn-primary btn-sm">🎨 Create Custom T-Shirt</Link>
                </div>

                {customDesigns.length > 0 ? (
                  <div className="grid grid-2 gap-4">
                    {customDesigns.map((d) => (
                      <div key={d.id} className="p-4 border rounded-xl bg-white flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{d.file_name || 'Custom Artwork'}</span>
                          <span className="badge badge-green">{d.status || 'Pending'}</span>
                        </div>
                        <p className="text-xs text-muted">Garment: {d.shirt_colour} | Qty: {d.quantity}</p>
                        {d.file_url && d.file_url.startsWith('http') && (
                          <img src={d.file_url} alt="Custom Design" className="w-full h-32 object-contain rounded bg-cream p-2 border mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted">
                    <Palette size={40} className="mx-auto text-gold mb-2" />
                    <p className="font-bold text-charcoal">No custom designs uploaded yet.</p>
                    <Link to="/customize" className="btn btn-primary btn-sm mt-4">Upload Custom Design</Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="account-card card p-6">
                <h3 className="heading-4 mb-4">Saved Delivery Addresses</h3>
                <div className="p-4 border rounded-xl bg-cream flex justify-between items-center">
                  <div>
                    <span className="badge badge-gold mb-1">DEFAULT ADDRESS</span>
                    <p className="font-bold text-sm text-charcoal">{user.name || 'Customer'}</p>
                    <p className="text-xs text-muted">Mavoor Road, Calicut, Kerala • 673001</p>
                    <p className="text-xs text-muted">Phone: {user.phone || '+91 94473 55667'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="account-card card p-6">
                <h3 className="heading-4 mb-4">Account Settings & Security</h3>
                <div className="flex flex-col gap-4">
                  <div className="p-4 border rounded-xl bg-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">Supabase Session Status</p>
                      <p className="text-xs text-muted">Secured with Supabase Auth</p>
                    </div>
                    <span className="badge badge-green">ACTIVE SESSION</span>
                  </div>

                  <button className="btn btn-outline text-red btn-md self-start" style={{ color: '#DC2626' }} onClick={logoutUser}>
                    <LogOut size={16} /> Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
