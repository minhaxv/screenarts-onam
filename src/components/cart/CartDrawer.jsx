import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, TSHIRT_COLOURS } from '../../data/products';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, itemCount, subtotal, deliveryFee, total, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();

  if (!isCartOpen) return null;

  const getColourName = (id) => TSHIRT_COLOURS.find(c => c.id === id)?.name || id;

  return (
    <>
      <div className="overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-drawer__header">
          <h3><ShoppingBag size={20} /> Your Cart ({itemCount})</h3>
          <button onClick={() => setIsCartOpen(false)} className="cart-drawer__close">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
              Shop Onam Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map(item => (
                <div key={item.key} className="cart-drawer__item">
                  <div className="cart-drawer__item-image">
                    <div className="cart-drawer__item-placeholder" style={{ background: TSHIRT_COLOURS.find(c => c.id === item.colour)?.hex || '#fff' }}>
                      👕
                    </div>
                  </div>
                  <div className="cart-drawer__item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-drawer__item-meta">
                      {getColourName(item.colour)} · {item.size} · {item.printLocation}
                    </p>
                    <div className="cart-drawer__item-bottom">
                      <div className="qty-selector">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                        <span className="qty-value">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <span className="cart-drawer__item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button className="cart-drawer__item-remove" onClick={() => removeItem(item.key)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__summary">
                <div className="cart-drawer__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-drawer__summary-row">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="cart-drawer__summary-row cart-drawer__summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link
                to="/cart"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => setIsCartOpen(false)}
              >
                View Cart <ArrowRight size={18} />
              </Link>
              <Link
                to="/checkout"
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setIsCartOpen(false)}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
