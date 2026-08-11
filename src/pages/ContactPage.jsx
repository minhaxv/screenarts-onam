import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import './ContactPage.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page page-enter">
      <div className="contact-hero">
        <div className="container">
          <span className="badge badge-gold">SCREENARTS CALICUT</span>
          <h1 className="heading-1 mt-2">Get in Touch with Our Studio</h1>
          <p className="subheading mt-2">Custom T-Shirt Printing & Design Experts in Calicut, Kerala</p>
        </div>
      </div>

      <div className="container mt-12">
        <div className="grid grid-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Details */}
          <div className="card-cream p-8 rounded-3xl border">
            <h3 className="heading-3 mb-6">ScreenArts Studio Details</h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="stat-card__icon bg-gold text-charcoal p-3 rounded-2xl">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-base">Studio Address</h4>
                  <p className="text-sm text-muted mt-1">ScreenArts Printing Studio, Near Cyberpark / Mavoor Road, Calicut (Kozhikode), Kerala 673001</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="stat-card__icon bg-green text-white p-3 rounded-2xl">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-base">Phone & WhatsApp</h4>
                  <p className="text-sm text-muted mt-1">+91 94473 55667 / +91 495 272 8899</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="stat-card__icon bg-orange text-white p-3 rounded-2xl">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-base">Email Contact</h4>
                  <p className="text-sm text-muted mt-1">onam@screenarts.in / support@screenarts.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="stat-card__icon bg-charcoal text-white p-3 rounded-2xl">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-base">Working Hours</h4>
                  <p className="text-sm text-muted mt-1">Monday – Saturday: 9:00 AM – 8:00 PM (Onam Special Express Shift Active)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-white p-8 rounded-3xl shadow-lg border">
            <h3 className="heading-3 mb-4">Send Us a Message</h3>
            {submitted ? (
              <div className="text-center py-8 text-green">
                <CheckCircle2 size={48} className="mx-auto mb-2" />
                <h4 className="font-bold text-lg">Message Sent Successfully!</h4>
                <p className="text-xs text-muted mt-1">Our Calicut team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="input"
                    required
                    placeholder="+91 94473 XXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Message / Enquiry</label>
                  <textarea
                    className="input"
                    rows="4"
                    required
                    placeholder="Tell us about your custom T-shirt print requirement..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-md mt-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
