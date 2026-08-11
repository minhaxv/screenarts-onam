import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Palette, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './MobileBottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
  { path: '/customize', icon: Palette, label: 'Customize' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="mobile-bottom-nav hide-desktop">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-bottom-nav__item ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-bottom-nav__icon-wrap">
              <Icon size={20} />
              {item.label === 'Cart' && itemCount > 0 && (
                <span className="mobile-bottom-nav__badge">{itemCount}</span>
              )}
            </div>
            <span className="mobile-bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
