import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CreditCard, Smartphone, Banknote, CheckCircle, ArrowLeft, Truck, Store, Wrench, Printer, Palette, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, setIsLoginModalOpen } = useAuth();
  const [delivery, setDelivery] = useState('home');
  const [payment, setPayment] = useState('upi');
  const [workflow, setWorkflow] = useState('PRINT_ONLY'); // 'PRINT_ONLY' | 'PRINT_SETUP' | 'FULL_DESIGN'
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    mobile: user?.phone || '',
    email: user?.email || '',
    address: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        mobile: prev.mobile || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const workflowFee = workflow === 'PRINT_SETUP' ? 150 : workflow === 'FULL_DESIGN' ? 250 : 0;
  const finalTotal = (delivery === 'home' ? total : subtotal) + workflowFee;

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in or register to complete your order placement.');
      setIsLoginModalOpen(true);
      return;
    }

    if (!form.name || !form.mobile || (delivery === 'home' && (!form.address || !form.pincode))) {
      setErrorMsg('Please complete all required shipping & contact fields.');
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    const orderNum = `ORD-${Math.floor(80000 + Math.random() * 10000)}`;

    try {
      // 1. Fetch current product prices directly from Supabase for security validation
      const productIds = items.map(i => i.id || i._id).filter(Boolean);
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, price, name')
        .in('id', productIds);

      const priceMap = new Map();
      if (Array.isArray(dbProducts)) {
        dbProducts.forEach(p => priceMap.set(p.id, Number(p.price)));
      }

      // Re-calculate validated items and total
      const validatedItems = items.map(item => {
        const validatedUnitPrice = priceMap.has(item.id) ? priceMap.get(item.id) : Number(item.price || 0);
        return {
          productId: item.id || item._id,
          name: item.name,
          colour: item.selectedOptions?.colour || 'White',
          size: item.selectedOptions?.size || 'M',
          printLocation: item.selectedOptions?.printLocation || 'Front Center',
          printRatio: item.selectedOptions?.printRatio || '4:5',
          quantity: Number(item.quantity || 1),
          price: validatedUnitPrice,
          customText: item.selectedOptions?.customText || '',
          customDesignName: item.selectedOptions?.customDesign || '',
          customDesignUrl: item.selectedOptions?.customDesignUrl || '',
        };
      });

      const validatedSubtotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validatedDeliveryFee = delivery === 'home' ? (validatedSubtotal >= 999 ? 0 : 79) : 0;
      const validatedTotal = validatedSubtotal + validatedDeliveryFee + workflowFee;

      // 2. Insert Header Record into Supabase `orders` table
      const orderPayload = {
        order_number: orderNum,
        user_id: user?.id || null,
        customer_name: form.name.trim(),
        phone: form.mobile.trim(),
        email: form.email?.trim() || user?.email || '',
        items: validatedItems,
        total_amount: validatedTotal,
        delivery_method: delivery,
        delivery_address: delivery === 'home' ? form.address.trim() : 'ScreenArts Calicut Studio Pickup',
        pincode: delivery === 'home' ? form.pincode.trim() : '673001',
        payment_status: 'Pending',
        order_status: 'Pending',
        print_specs: {
          subtotal: validatedSubtotal,
          deliveryFee: validatedDeliveryFee,
          workflow: workflow,
        },
        created_at: new Date().toISOString(),
      };

      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id, order_number')
        .single();

      if (orderError) {
        console.error('Database Order Insertion Error:', orderError.message);
        setErrorMsg(orderError.message || 'Unable to place order in database. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 3. Insert Detail Records into Supabase `order_items` table (safely catch if table schema is pending)
      try {
        const parentOrderId = String(createdOrder?.id || orderNum);
        const orderItemsPayload = validatedItems.map(it => ({
          order_id: parentOrderId,
          product_id: it.productId || null,
          product_name: it.name,
          size: it.size,
          colour: it.colour,
          quantity: it.quantity,
          unit_price: it.price,
          print_position: it.printLocation,
          custom_design_url: it.customDesignUrl || null,
        }));
        await supabase.from('order_items').insert(orderItemsPayload);
      } catch (err) {
        console.warn('Notice inserting detail order_items:', err.message);
      }

      setPlacedOrderNumber(orderNum);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Order creation exception:', err);
      setErrorMsg(err.message || 'Failed to complete order. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page page-enter">
        <div className="container">
          <div className="checkout-success">
            <div className="checkout-success__icon">
              <CheckCircle size={64} />
            </div>
            <span className="badge badge-gold">ORDER CONFIRMED</span>
            <h1 className="heading-2 mt-2">Order {placedOrderNumber} Placed! 🎉</h1>
            <p className="subheading mt-3">
              Thank you {form.name}! We've logged your order at ScreenArts Studio Calicut.
            </p>
            
            <div className="mt-6 p-4 bg-cream rounded-2xl border max-w-md mx-auto text-left text-xs">
              <p><strong>Order Number:</strong> <span className="text-green font-bold">{placedOrderNumber}</span></p>
              <p className="mt-1"><strong>Service Workflow:</strong> {workflow.replace('_', ' ')}</p>
              <p className="mt-1"><strong>Fulfillment:</strong> {delivery === 'pickup' ? '🏬 Calicut Studio Pickup' : '🚚 Home Delivery'}</p>
            </div>

            <div className="checkout-success__ctas mt-6 flex justify-center gap-4">
              <Link to={`/orders?num=${placedOrderNumber}`} className="btn btn-primary btn-lg">
                <Eye size={18} /> Track Order Status
              </Link>
              <Link to="/shop" className="btn btn-outline btn-lg">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <Link to="/cart" className="checkout-back">
          <ArrowLeft size={18} /> Back to Cart
        </Link>

        <h1 className="heading-2 mt-4">Checkout & Service Selection</h1>

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          {/* Left: Form */}
          <div className="checkout-form">
            {/* Service Workflow Selection */}
            <div className="checkout-section">
              <h3 className="checkout-section__title">1. Select Service Workflow</h3>
              <p className="text-xs text-muted mb-3">Choose how ScreenArts Calicut prepares your artwork for printing</p>

              <div className="grid grid-3 gap-3">
                <button
                  type="button"
                  className={`checkout-delivery-option ${workflow === 'PRINT_ONLY' ? 'active' : ''}`}
                  onClick={() => setWorkflow('PRINT_ONLY')}
                >
                  <Printer size={22} />
                  <div>
                    <h4 className="text-xs font-bold">PRINT ONLY</h4>
                    <p className="text-xs text-muted">You provide final print-ready artwork</p>
                    <span className="badge badge-green mt-1">Included (Free)</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`checkout-delivery-option ${workflow === 'PRINT_SETUP' ? 'active' : ''}`}
                  onClick={() => setWorkflow('PRINT_SETUP')}
                >
                  <Wrench size={22} />
                  <div>
                    <h4 className="text-xs font-bold">PRINT + SETUP</h4>
                    <p className="text-xs text-muted">We calibrate colors & prepress setup</p>
                    <span className="badge badge-gold mt-1">+₹150</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`checkout-delivery-option ${workflow === 'FULL_DESIGN' ? 'active' : ''}`}
                  onClick={() => setWorkflow('FULL_DESIGN')}
                >
                  <Palette size={22} />
                  <div>
                    <h4 className="text-xs font-bold">FULL DESIGN</h4>
                    <p className="text-xs text-muted">ScreenArts team creates full artwork</p>
                    <span className="badge badge-orange mt-1">+₹250</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="checkout-section mt-6">
              <h3 className="checkout-section__title">2. Contact Information</h3>
              <div className="checkout-field-grid">
                <div className="checkout-field">
                  <label className="label">Full Name *</label>
                  <input className="input" type="text" required value={form.name} onChange={handleChange('name')} placeholder="Your full name" />
                </div>
                <div className="checkout-field">
                  <label className="label">Mobile Number *</label>
                  <input className="input" type="tel" required value={form.mobile} onChange={handleChange('mobile')} placeholder="+91 94473 XXXXX" />
                </div>
                <div className="checkout-field checkout-field--full">
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={handleChange('email')} placeholder="your@email.com" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="checkout-section mt-6">
              <h3 className="checkout-section__title">3. Delivery Method</h3>
              <div className="checkout-delivery-options">
                <button
                  type="button"
                  className={`checkout-delivery-option ${delivery === 'home' ? 'active' : ''}`}
                  onClick={() => setDelivery('home')}
                >
                  <Truck size={24} />
                  <div>
                    <h4>Home Delivery</h4>
                    <p>Delivered across Kerala in 2-4 business days</p>
                  </div>
                </button>
                <button
                  type="button"
                  className={`checkout-delivery-option ${delivery === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDelivery('pickup')}
                >
                  <Store size={24} />
                  <div>
                    <h4>ScreenArts Store Pickup</h4>
                    <p>Pick up from our Calicut Studio (Mavoor Rd) — Free</p>
                  </div>
                </button>
              </div>

              {delivery === 'home' && (
                <div className="checkout-field-grid mt-4">
                  <div className="checkout-field checkout-field--full">
                    <label className="label">Address *</label>
                    <textarea className="input" rows="3" required value={form.address} onChange={handleChange('address')} placeholder="Full delivery address" />
                  </div>
                  <div className="checkout-field">
                    <label className="label">Pincode *</label>
                    <input className="input" type="text" required value={form.pincode} onChange={handleChange('pincode')} placeholder="673XXX" />
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="checkout-section mt-6">
              <h3 className="checkout-section__title">4. Payment Method</h3>
              <div className="checkout-payment-options">
                {[
                  { id: 'upi', icon: <Smartphone size={20} />, label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'card', icon: <CreditCard size={20} />, label: 'Card', desc: 'Credit / Debit Card' },
                  { id: 'cod', icon: <Banknote size={20} />, label: 'Cash', desc: 'Pay on pickup/delivery' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`checkout-payment-option ${payment === opt.id ? 'active' : ''}`}
                    onClick={() => setPayment(opt.id)}
                  >
                    {opt.icon}
                    <div>
                      <h4>{opt.label}</h4>
                      <p>{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="checkout-summary">
            <div className="checkout-summary__card">
              <h3 className="checkout-summary__title">Order Summary</h3>
              
              <div className="checkout-summary__items">
                {items.map(item => (
                  <div key={item.cartItemId} className="checkout-summary__item">
                    <div className="checkout-summary__item-info">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity} • {item.selectedOptions?.colour} / {item.selectedOptions?.size}</p>
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="checkout-summary__rows">
                <div className="checkout-summary__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="checkout-summary__row">
                  <span>Service Workflow</span>
                  <span>{workflowFee > 0 ? `+${formatPrice(workflowFee)}` : 'Free'}</span>
                </div>
                <div className="checkout-summary__row">
                  <span>Delivery Fee</span>
                  <span>{delivery === 'home' ? (deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)) : 'FREE'}</span>
                </div>
                <div className="divider" />
                <div className="checkout-summary__row checkout-summary__total">
                  <span>Total Payable</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg mt-6" style={{ width: '100%' }}>
                Place Order ({formatPrice(finalTotal)})
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
