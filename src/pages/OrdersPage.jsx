import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle2, Truck, Store, AlertCircle, FileText, ArrowLeft, Phone, MapPin, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';
import './OrdersPage.css';

const ORDER_STATUS_STEPS = [
  { id: 'Pending', label: 'Order Received', desc: 'Order logged at ScreenArts Studio' },
  { id: 'Design Review', label: 'Design Review', desc: 'ScreenArts prepress team inspecting artwork' },
  { id: 'Artwork Approved', label: 'Proof Approved', desc: 'Artwork ready for high-def printing' },
  { id: 'Production', label: 'In DTG Printing', desc: 'Printing on 100% super-combed cotton' },
  { id: 'Ready', label: 'Ready for Pickup / Dispatch', desc: 'Garment cured and quality checked' },
  { id: 'Shipped', label: 'Out for Delivery / Shipped', desc: 'Handed to courier / ready at Calicut Studio' },
  { id: 'Completed', label: 'Completed', desc: 'Order delivered successfully' },
];

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('num') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = async (query) => {
    const cleanQuery = query?.trim();
    if (!cleanQuery) return;
    setLoading(true);
    setError(null);

    try {
      // Direct database query on Supabase orders table by order_number, phone, or email
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!dbError && data) {
        setOrder({
          orderNumber: data.order_number,
          workflow: data.workflow || 'PRINT_ONLY',
          customerName: data.customer_name,
          phone: data.phone,
          email: data.email || '',
          deliveryMethod: data.delivery_method || 'home',
          deliveryAddress: data.delivery_address || '',
          pincode: data.pincode || '',
          items: Array.isArray(data.items) ? data.items : [],
          totalAmount: Number(data.total_amount || 0),
          paymentStatus: data.payment_status || 'Pending',
          status: data.order_status || 'Pending',
          createdAt: data.created_at,
        });
      } else {
        setError(`No order found matching "${cleanQuery}". Please check your Order Number (e.g. ORD-8096) or Phone Number.`);
        setOrder(null);
      }
    } catch (err) {
      setError('Unable to locate order. Please enter your full Order Number or Phone Number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrder(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  const getStepIndex = (statusStr) => {
    if (statusStr === 'Cancelled') return -1;
    const idx = ORDER_STATUS_STEPS.findIndex(s => s.id.toLowerCase() === (statusStr || '').toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="orders-page page-enter">
      <div className="orders-hero">
        <div className="container">
          <span className="badge badge-gold">SCREENARTS TRACKER</span>
          <h1 className="heading-1 mt-2">Track Your Onam T-Shirt Order</h1>
          <p className="subheading mt-2">Enter your Order Number (e.g., ORD-8096) or registered Phone Number</p>
        </div>
      </div>

      <div className="container">
        {/* Order Search Box */}
        <div className="orders-search-card card-white p-6 rounded-2xl shadow-md max-w-xl mx-auto -mt-8 relative z-10">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="input-wrap flex-1 flex items-center bg-cream rounded-xl px-4 border">
              <Search size={20} className="text-muted mr-2" />
              <input
                type="text"
                className="input border-none bg-transparent"
                placeholder="Enter Order Number or Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md">
              Track Status
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-12 text-muted">
            <Clock size={32} className="animate-spin mx-auto mb-2 text-gold" />
            <p>Searching ScreenArts Calicut Studio Database...</p>
          </div>
        )}

        {error && !loading && (
          <div className="orders-error-card max-w-xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-charcoal">{error}</p>
          </div>
        )}

        {/* Order Details Result */}
        {order && !loading && (
          <div className="order-details-wrapper max-w-3xl mx-auto mt-8">
            <div className="card-white p-8 rounded-3xl shadow-lg border">
              {/* Header Info */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-6">
                <div>
                  <span className="badge badge-gold">{order.orderNumber}</span>
                  <h2 className="heading-3 mt-2">{order.customerName}</h2>
                  <p className="text-sm text-muted">{order.phone} • {order.email}</p>
                </div>
                <div className="text-right">
                  <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {order.status}
                  </span>
                  <span className="block font-extrabold text-2xl text-green mt-2">{formatPrice(order.totalAmount)}</span>
                  <span className="text-xs text-muted">Payment: {order.paymentStatus}</span>
                </div>
              </div>

              {/* Order Workflow Type Badge */}
              <div className="workflow-banner mt-6 p-4 rounded-2xl bg-cream border flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-muted">ORDER SERVICE WORKFLOW</span>
                  <h4 className="font-extrabold text-base text-charcoal mt-1">
                    {order.workflow === 'PRINT_ONLY' ? '🖨️ Print Only (Customer Artwork Provided)' :
                     order.workflow === 'PRINT_SETUP' ? '🛠️ Print + Prepress Setup (ScreenArts Studio Prepared)' :
                     '🎨 Full Design (ScreenArts Custom Artwork Design Created)'}
                  </h4>
                </div>
                <span className="badge badge-green">{order.deliveryMethod === 'pickup' ? '🏬 Calicut Store Pickup' : '🚚 Home Delivery'}</span>
              </div>

              {/* Status Timeline */}
              {order.status === 'Cancelled' ? (
                <div className="p-6 bg-red-50 rounded-2xl border border-red-200 mt-6 text-center text-red-600">
                  <AlertCircle size={28} className="mx-auto mb-1" />
                  <h4 className="font-bold">This Order Was Cancelled</h4>
                  <p className="text-xs">If you have questions regarding refund or cancellation, please contact ScreenArts Studio Calicut.</p>
                </div>
              ) : (
                <div className="order-timeline mt-8">
                  <h4 className="font-bold text-sm text-charcoal mb-6">Production & Delivery Status Timeline</h4>
                  <div className="timeline-steps">
                    {ORDER_STATUS_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.id} className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                          <div className="timeline-step__node">
                            {isDone ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                          </div>
                          <div className="timeline-step__content">
                            <h5 className="font-bold text-sm">{step.label}</h5>
                            <p className="text-xs text-muted">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="order-items-spec mt-8 pt-6 border-t">
                <h4 className="font-bold text-base mb-4">Ordered Items ({order.items.length})</h4>
                <div className="flex flex-col gap-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-cream rounded-xl border">
                      <div>
                        <h5 className="font-bold text-sm">{it.name}</h5>
                        <p className="text-xs text-muted">Colour: {it.colour} • Size: {it.size} • Print: {it.printLocation || 'Front Center'}</p>
                        {it.customText && <p className="text-xs text-orange font-medium mt-1">Custom Text: "{it.customText}"</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm">×{it.quantity}</span>
                        <span className="block text-xs text-muted">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="delivery-spec-card mt-6 p-4 rounded-xl border bg-white flex items-center gap-3">
                {order.deliveryMethod === 'pickup' ? <Store size={24} className="text-gold" /> : <Truck size={24} className="text-green" />}
                <div>
                  <h5 className="font-bold text-sm">Fulfillment Destination</h5>
                  <p className="text-xs text-muted">
                    {order.deliveryMethod === 'pickup'
                      ? 'ScreenArts Calicut Studio Store Pickup (Near Cyberpark / Mavoor Road, Calicut)'
                      : `${order.deliveryAddress} • Pincode: ${order.pincode}`}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center pt-4 border-t">
                <Link to="/shop" className="btn btn-outline btn-sm">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <a href="tel:+919447355667" className="btn btn-primary btn-sm">
                  <Phone size={16} /> Contact Studio Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
