import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CreditCard, Smartphone, Banknote, CheckCircle, ArrowLeft, Truck, Store, Wrench, Printer, Palette, Eye, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState('');
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
    console.log('==================================================');
    console.log('1. PLACE_ORDER_CLICKED');

    // 2. AUTHENTICATION CHECK
    console.log('2. AUTH_USER');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const activeUser = authData?.user || (user?.id ? user : null);

    if (authError) {
      console.error('AUTH_USER_ERROR:', {
        error: authError,
        message: authError.message,
        code: authError.code || authError.status,
        details: authError.details || null,
        hint: authError.hint || null,
        status: authError.status || 401
      });
    }

    if (!activeUser || !activeUser.id) {
      console.warn('AUTH_USER_FAILED: No active authenticated user session', { authData, authError, contextUser: user });
      setErrorMsg('Please log in before placing your order.');
      setIsLoginModalOpen(true);
      return;
    }

    if (!form.name || !form.mobile || (delivery === 'home' && (!form.address || !form.pincode))) {
      console.warn('FORM_VALIDATION_STOPPED: Shipping details incomplete', form);
      setErrorMsg('Please complete all required shipping & contact fields.');
      return;
    }

    // 3. CART CHECK
    console.log('3. CART_ITEMS', { itemsCount: items?.length, items });
    if (!items || items.length === 0) {
      console.warn('CART_ITEMS_EMPTY: Cart is empty');
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    const orderNum = `ORD-${Math.floor(80000 + Math.random() * 10000)}`;

    try {
      // 4. PRODUCT VALIDATION
      console.log('4. PRODUCT_VALIDATION');
      const productIds = items.map(i => i.id || i.productId || i._id).filter(Boolean);
      
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('id, price, name, is_active')
        .in('id', productIds);

      if (prodErr) {
        console.error('PRODUCT_VALIDATION_ERROR:', {
          error: prodErr,
          message: prodErr.message,
          code: prodErr.code,
          details: prodErr.details,
          hint: prodErr.hint,
          status: prodErr.status
        });
        setErrorMsg(`Unable to verify product details from database: ${prodErr.message}`);
        setIsSubmitting(false);
        return;
      }

      const priceMap = new Map();
      const activeMap = new Map();
      if (Array.isArray(dbProducts)) {
        dbProducts.forEach(p => {
          priceMap.set(p.id, Number(p.price));
          activeMap.set(p.id, p.is_active !== false);
        });
      }

      // Re-calculate validated items from DB prices
      const validatedItems = items.map(item => {
        const itemPId = item.id || item.productId || item._id;
        const validatedUnitPrice = priceMap.has(itemPId) ? priceMap.get(itemPId) : Number(item.price || 0);
        return {
          productId: itemPId,
          name: item.name,
          colour: item.selectedOptions?.colour || item.colour || 'White',
          size: item.selectedOptions?.size || item.size || 'M',
          printLocation: item.selectedOptions?.printLocation || item.printLocation || 'Front Center',
          printRatio: item.selectedOptions?.printRatio || item.printRatio || '4:5',
          quantity: Number(item.quantity || 1),
          price: validatedUnitPrice,
          customText: item.selectedOptions?.customText || item.customText || '',
          customDesignName: item.selectedOptions?.customDesign || item.customDesign || '',
          customDesignUrl: item.selectedOptions?.customDesignUrl || item.customDesignUrl || '',
        };
      });

      const validatedSubtotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const validatedDeliveryFee = delivery === 'home' ? (validatedSubtotal >= 999 ? 0 : 79) : 0;
      const validatedTotal = validatedSubtotal + validatedDeliveryFee + workflowFee;

      if (isNaN(validatedSubtotal) || isNaN(validatedDeliveryFee) || isNaN(validatedTotal) || validatedTotal <= 0) {
        console.error('PRICE_CALCULATION_INVALID:', { validatedSubtotal, validatedDeliveryFee, validatedTotal });
        setErrorMsg('Invalid price calculation detected. Please refresh your cart and try again.');
        setIsSubmitting(false);
        return;
      }

      // 5. ORDER PAYLOAD PREPARATION (Matches exact Supabase public.orders schema)
      const orderPayload = {
        order_number: orderNum,
        user_id: activeUser.id,
        customer_name: form.name.trim(),
        phone: form.mobile.trim(),
        email: form.email?.trim() || activeUser.email || '',
        items: validatedItems,
        total_amount: Number(validatedTotal),
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
      console.log('5. ORDER_PAYLOAD', orderPayload);

      // 6. ORDERS INSERT
      console.log('6. ORDERS_INSERT');
      const orderInsertResult = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      // 7. ORDER INSERT RESULT
      console.log('7. ORDER_INSERT_RESULT', {
        data: orderInsertResult.data,
        error: orderInsertResult.error,
        message: orderInsertResult.error?.message,
        code: orderInsertResult.error?.code,
        details: orderInsertResult.error?.details,
        hint: orderInsertResult.error?.hint,
        status: orderInsertResult.status,
        statusText: orderInsertResult.statusText
      });

      if (orderInsertResult.error) {
        console.error('ORDERS_INSERT_FAILED:', {
          error: orderInsertResult.error,
          message: orderInsertResult.error.message,
          code: orderInsertResult.error.code,
          details: orderInsertResult.error.details,
          hint: orderInsertResult.error.hint,
          status: orderInsertResult.status
        });
        setErrorMsg(`Unable to place order. Database Error [${orderInsertResult.error.code || orderInsertResult.status}]: ${orderInsertResult.error.message}`);
        setIsSubmitting(false);
        return;
      }

      const createdOrder = orderInsertResult.data;
      const parentOrderId = String(createdOrder?.id || orderNum);
      
      // 8. ORDER ID
      console.log('8. ORDER_ID', parentOrderId);

      // 9. ORDER ITEMS INSERT
      console.log('9. ORDER_ITEMS_INSERT');
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

      const orderItemsResult = await supabase
        .from('order_items')
        .insert(orderItemsPayload)
        .select();

      // 10. ORDER ITEMS RESULT
      console.log('10. ORDER_ITEMS_RESULT', {
        data: orderItemsResult.data,
        error: orderItemsResult.error,
        message: orderItemsResult.error?.message,
        code: orderItemsResult.error?.code,
        details: orderItemsResult.error?.details,
        hint: orderItemsResult.error?.hint,
        status: orderItemsResult.status,
        statusText: orderItemsResult.statusText
      });

      if (orderItemsResult.error) {
        console.error('ORDER_ITEMS_INSERT_FAILED:', {
          error: orderItemsResult.error,
          message: orderItemsResult.error.message,
          code: orderItemsResult.error.code,
          details: orderItemsResult.error.details,
          hint: orderItemsResult.error.hint,
          status: orderItemsResult.status
        });
        // Clean up orphaned header order if order_items failed
        await supabase.from('orders').delete().eq('id', parentOrderId);
        setErrorMsg(`Unable to save order detail items [${orderItemsResult.error.code || orderItemsResult.status}]: ${orderItemsResult.error.message}`);
        setIsSubmitting(false);
        return;
      }

      // 11. CART CLEAR
      console.log('11. CART_CLEAR');
      clearCart();

      // 12. REDIRECT
      console.log('12. REDIRECT');
      setPlacedOrderNumber(orderNum);
      setOrderPlaced(true);
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

        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Checkout Interrupted</p>
              <p className="text-xs font-normal mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

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

              <button type="submit" className="btn btn-primary btn-lg mt-6" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Processing Order...
                  </span>
                ) : (
                  `Place Order (${formatPrice(finalTotal)})`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
