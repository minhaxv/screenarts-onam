import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronRight, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Onam Collection', path: '/shop' },
  { label: 'Customize', path: '/customize' },
  { label: 'Designs', path: '/designs' },
  { label: 'Track Order', path: '/orders' },
  { label: 'Bulk Orders', path: '/bulk-orders' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, setIsCartOpen, justAdded } = useCart();
  const { announcementText } = useProducts();
  const { user, setIsLoginModalOpen } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <>
      <div className="announcement-bar">
        <div className="container">
          <p className="announcement-bar__text mb-0">
            {announcementText}
          </p>
        </div>
      </div>

      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header__inner">
          <button
            className="header__menu-btn hide-desktop"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="header__logo">
            <span className="header__logo-screen">SCREEN</span>
            <span className="header__logo-arts">ARTS</span>
            <span className="header__logo-badge">ONAM'26</span>
          </Link>

          <nav className="header__nav hide-mobile">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`header__nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <button
              className="header__action-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              className="header__action-btn"
              onClick={() => setIsLoginModalOpen(true)}
              title={user ? `Logged in as ${user.name}` : "Customer Login"}
            >
              {user ? (
                <span className="badge badge-gold font-bold" style={{ fontSize: '11px' }}>
                  {user.name.split(' ')[0]}
                </span>
              ) : (
                <User size={20} />
              )}
            </button>
            <button
              className={`header__action-btn header__cart-btn ${justAdded ? 'bounce' : ''}`}
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="header__cart-badge">{itemCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="header__search">
            <div className="container">
              <div className="header__search-inner">
                <Search size={20} className="header__search-icon" />
                <input
                  type="text"
                  placeholder="Search Onam designs, T-shirts..."
                  className="header__search-input"
                  autoFocus
                />
                <button onClick={() => setIsSearchOpen(false)} className="header__search-close">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)} />}

      {/* Mobile Slide Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu__header">
          <Link to="/" className="header__logo" onClick={() => setIsMenuOpen(false)}>
            <span className="header__logo-screen">SCREEN</span>
            <span className="header__logo-arts">ARTS</span>
          </Link>
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-menu__nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="mobile-menu__link"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{link.label}</span>
              <ChevronRight size={18} />
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <Link to="/customize" className="btn btn-primary btn-lg" onClick={() => setIsMenuOpen(false)} style={{width:'100%'}}>
            Design Your Shirt
          </Link>
        </div>
      </div>
    </>
  );
}
