import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Building2, School, Heart, Calendar, Package, ArrowRight, CheckCircle } from 'lucide-react';
import { BULK_PRICING, TSHIRT_COLOURS, formatPrice } from '../data/products';
import './BulkOrdersPage.css';

const GROUP_TYPES = [
  { icon: <GraduationCap size={24} />, label: 'College Groups' },
  { icon: <Building2 size={24} />, label: 'Companies' },
  { icon: <School size={24} />, label: 'Schools' },
  { icon: <Users size={24} />, label: 'Friends' },
  { icon: <Heart size={24} />, label: 'Families' },
  { icon: <Calendar size={24} />, label: 'Events' },
];

export default function BulkOrdersPage() {
  const [quantity, setQuantity] = useState(25);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', group: '', qty: '25', notes: '' });

  const currentTier = BULK_PRICING.find(t => quantity >= t.min && quantity <= t.max) || BULK_PRICING[BULK_PRICING.length - 1];
  const estimatedTotal = currentTier.price * quantity;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bulk-page page-enter">
      {/* Hero */}
      <div className="bulk-hero">
        <div className="container text-center">
          <span className="section-label">Bulk Orders</span>
          <h1 className="heading-1 mt-2">Planning Onam for a Crowd?</h1>
          <p className="subheading mt-2">
            Special rates for groups. Custom printed T-shirts for everyone.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Group Types */}
        <div className="bulk-groups">
          {GROUP_TYPES.map(g => (
            <div key={g.label} className="bulk-group-card">
              <div className="bulk-group-card__icon">{g.icon}</div>
              <span className="bulk-group-card__label">{g.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing Table */}
        <div className="bulk-pricing-section">
          <h2 className="heading-3 text-center mb-6">Bulk Pricing</h2>
          <div className="bulk-pricing-table">
            {BULK_PRICING.map((tier, i) => (
              <div key={i} className={`bulk-pricing-card ${currentTier === tier ? 'active' : ''}`}>
                <span className="bulk-pricing-card__qty">{tier.label}</span>
                <span className="bulk-pricing-card__price">{formatPrice(tier.price)}</span>
                <span className="bulk-pricing-card__unit">per T-shirt</span>
              </div>
            ))}
          </div>

          {/* Calculator */}
          <div className="bulk-calculator mt-8">
            <h3 className="heading-4 text-center mb-4">Quick Estimate</h3>
            <div className="bulk-calculator__inner">
              <div className="bulk-calculator__input">
                <label className="label">Number of T-shirts</label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="bulk-range"
                />
                <div className="bulk-calculator__qty-display">
                  <span className="bulk-calculator__qty-number">{quantity}</span>
                  <span>T-shirts</span>
                </div>
              </div>
              <div className="bulk-calculator__result">
                <span className="bulk-calculator__rate">{formatPrice(currentTier.price)}/pc</span>
                <span className="bulk-calculator__total">Estimated: <strong>{formatPrice(estimatedTotal)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Form */}
        <div className="bulk-quote-section" id="quote-form">
          <h2 className="heading-3 text-center mb-6">Get a Bulk Quote</h2>
          {submitted ? (
            <div className="bulk-quote-success">
              <CheckCircle size={48} />
              <h3 className="heading-4 mt-4">Quote Request Sent! 🎉</h3>
              <p className="text-muted mt-2">We'll get back to you within 24 hours with your custom bulk pricing.</p>
              <Link to="/" className="btn btn-primary mt-4">Back to Home</Link>
            </div>
          ) : (
            <form className="bulk-quote-form" onSubmit={handleSubmit}>
              <div className="checkout-field-grid">
                <div className="checkout-field">
                  <label className="label">Your Name *</label>
                  <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" />
                </div>
                <div className="checkout-field">
                  <label className="label">Phone Number *</label>
                  <input className="input" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="checkout-field">
                  <label className="label">Group Type</label>
                  <select className="input select" value={form.group} onChange={e => setForm({...form, group: e.target.value})}>
                    <option value="">Select...</option>
                    {GROUP_TYPES.map(g => <option key={g.label} value={g.label}>{g.label}</option>)}
                  </select>
                </div>
                <div className="checkout-field">
                  <label className="label">Quantity</label>
                  <input className="input" type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} min="5" />
                </div>
                <div className="checkout-field checkout-field--full">
                  <label className="label">Notes / Requirements</label>
                  <textarea className="input" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Tell us about your requirements..." />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg mt-6">
                <Package size={20} /> Get Bulk Quote <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
