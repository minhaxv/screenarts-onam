import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, TSHIRT_COLOURS } from '../data/products';
import './CartPage.css';

export default function CartPage() {
  const { items, itemCount, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();

  const getColourName = (id) => TSHIRT_COLOURS.find(c => c.id === id)?.name || id;
  const getColourHex = (id) => TSHIRT_COLOURS.find(c => c.id === id)?.hex || '#fff';

  if (items.length === 0) {
    return (
      <div className="cart-page page-enter">
        <div className="container">
          <div className="cart-empty">
            <span className="cart-empty__icon">🛒</span>
            <h2 className="heading-3">Your cart is empty</h2>
            <p className="text-muted mt-2">Add some Onam T-shirts to get started!</p>
            <div className="cart-empty__ctas mt-6">
              <Link to="/shop" className="btn btn-primary btn-lg">
                <ShoppingBag size={20} /> Shop Onam Collection
              </Link>
              <Link to="/customize" className="btn btn-outline btn-lg">
                Design Your Own
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="cart-header">
          <h1 className="heading-2">Your Cart</h1>
          <span className="text-muted">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item__image">
                  <div className="cart-item__placeholder" style={{ background: getColourHex(item.colour) }}>
                    👕
                  </div>
                </div>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <div className="cart-item__meta">
                    <span>Colour: {getColourName(item.colour)}</span>
                    <span>Size: {item.size}</span>
                    <span>Print: {item.printLocation}</span>
                    {item.printType === 'custom' && <span className="badge badge-green">Custom</span>}
                  </div>
                </div>
                <div className="cart-item__qty">
                  <div className="qty-selector">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="cart-item__price">
                  <span className="price">{formatPrice(item.price * item.quantity)}</span>
                  {item.quantity > 1 && (
                    <span className="price-small text-muted">{formatPrice(item.price)} each</span>
                  )}
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item.key)}>
                  <X size={18} />
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <Link to="/shop" className="btn btn-ghost">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <button className="btn btn-ghost" style={{color:'var(--error)'}} onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="cart-summary__card">
              <h3 className="cart-summary__title">Order Summary</h3>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span className="text-green font-semibold">FREE</span> : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="cart-summary__free-delivery">
                  Add {formatPrice(999 - subtotal)} more for free delivery
                </p>
              )}
              <div className="divider" />
              <div className="cart-summary__row cart-summary__total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-lg mt-4" style={{width:'100%'}}>
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
