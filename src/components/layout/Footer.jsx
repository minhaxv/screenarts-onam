import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Kasavu Border */}
      <div className="footer__kasavu-border"></div>
      
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="header__logo-screen">SCREEN</span>
              <span className="header__logo-arts">ARTS</span>
            </Link>
            <p className="footer__tagline">
              Custom printing &amp; design from Calicut, Kerala.
              Making Onam special, one T-shirt at a time.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="WhatsApp"><MessageCircle size={20} /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer__col">
            <h4 className="footer__col-title">Shop</h4>
            <Link to="/shop" className="footer__link">Onam Collection</Link>
            <Link to="/shop?cat=men" className="footer__link">Men</Link>
            <Link to="/shop?cat=women" className="footer__link">Women</Link>
            <Link to="/shop?cat=kids" className="footer__link">Kids</Link>
            <Link to="/shop?cat=family" className="footer__link">Family</Link>
            <Link to="/designs" className="footer__link">Design Gallery</Link>
          </div>

          {/* Services */}
          <div className="footer__col">
            <h4 className="footer__col-title">Services & Tracking</h4>
            <Link to="/customize" className="footer__link">Custom T-Shirts</Link>
            <Link to="/orders" className="footer__link">Track Order Status</Link>
            <Link to="/bulk-orders" className="footer__link">Bulk Orders</Link>
            <Link to="/contact" className="footer__link">Contact Us</Link>
            <Link to="/admin" className="footer__link" style={{ color: 'var(--kasavu-gold-light)' }}>🖨️ Studio Admin</Link>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <div className="footer__contact-item">
              <MapPin size={16} />
              <span>ScreenArts, Calicut, Kerala</span>
            </div>
            <div className="footer__contact-item">
              <Phone size={16} />
              <span>+91 XXX XXX XXXX</span>
            </div>
            <div className="footer__contact-item">
              <Mail size={16} />
              <span>hello@screenarts.in</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} ScreenArts, Calicut. All rights reserved.</p>
          <p className="footer__made">Made with 🌼 for Onam</p>
        </div>
      </div>
    </footer>
  );
}
