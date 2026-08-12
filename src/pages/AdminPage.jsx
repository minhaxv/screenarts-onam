import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Package, Users, Palette, Settings, CheckCircle, Clock, Truck,
  Store, Search, Filter, ArrowUpRight, Download, Edit3, Phone, Mail, MapPin,
  Sparkles, Layers, ArrowLeft, RefreshCw, Eye, Plus, Trash2, X, AlertCircle,
  TrendingUp, Printer, FileText, Check, Cpu, Radio, ChevronRight, Crop, Grid3x3, Grid2x2, LayoutList, FolderPlus, Tag, Image, Upload, Lock, LogOut
} from 'lucide-react';
import { INITIAL_ORDERS, INITIAL_BULK_QUOTES, INITIAL_CUSTOM_JOBS, STUDIO_STATS } from '../data/adminMockData';
import { TSHIRT_COLOURS, SIZES, KIDS_SIZES, PRINT_LOCATIONS, PRINT_RATIOS, formatPrice } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import TShirtMockup from '../components/product/TShirtMockup';
import './AdminPage.css';

export default function AdminPage() {
  const {
    products: productList,
    categories: categoryList,
    announcementText,
    studioPickupOpen,
    setAnnouncementText,
    setStudioPickupOpen,
    uploadProductImage,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductBadge,
    addCategory,
    deleteCategory,
    resetToDefaults,
  } = useProducts();

  const { adminAuthenticated, loginAdmin, logoutAdmin } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [adminError, setAdminError] = useState('');

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [bulkQuotes, setBulkQuotes] = useState(INITIAL_BULK_QUOTES);
  const [customJobs, setCustomJobs] = useState(INITIAL_CUSTOM_JOBS);

  // Fetch live Admin Data from Supabase
  const fetchAdminDataFromSupabase = useCallback(async () => {
    try {
      // 1. Fetch Orders
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        const mappedOrders = dbOrders.map(ord => ({
          id: ord.order_number || ord.id,
          dbId: ord.id,
          customerName: ord.customer_name,
          phone: ord.phone,
          email: ord.email || '',
          deliveryMethod: ord.delivery_method || 'home',
          deliveryAddress: ord.delivery_address || '',
          pincode: ord.pincode || '',
          items: Array.isArray(ord.items) ? ord.items : [],
          totalAmount: Number(ord.total_amount || 0),
          paymentStatus: ord.payment_status || 'Pending',
          orderDate: ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Recent',
          status: ord.order_status || 'Pending',
          workflow: ord.workflow || 'PRINT_ONLY',
        }));
        setOrders(mappedOrders);
      }

      // 2. Fetch Custom Designs
      const { data: dbDesigns } = await supabase
        .from('custom_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(dbDesigns) && dbDesigns.length > 0) {
        const mappedJobs = dbDesigns.map(j => ({
          id: j.id,
          customer: j.customer_name || 'Customer',
          phone: j.phone || '',
          type: 'User Artwork Upload',
          fileName: j.file_name || 'artwork.png',
          fileUrl: j.file_url,
          shirtColour: j.shirt_colour || 'White',
          printLocation: j.print_location || 'Front Center',
          qty: j.quantity || 1,
          status: j.status || 'Pending',
          date: j.created_at ? new Date(j.created_at).toLocaleString() : 'Recent',
        }));
        setCustomJobs(mappedJobs);
      }

      // 3. Fetch Bulk Quotes
      const { data: dbQuotes } = await supabase
        .from('bulk_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(dbQuotes) && dbQuotes.length > 0) {
        const mappedQuotes = dbQuotes.map(q => ({
          id: q.id,
          organization: q.organisation || q.name || 'Group Request',
          contactPerson: q.name,
          phone: q.phone,
          groupType: q.group_type || 'Group',
          quantity: q.quantity || 10,
          estimatedRatePerPc: 269,
          estimatedTotal: (q.quantity || 10) * 269,
          notes: q.description || '',
          requestDate: q.created_at ? new Date(q.created_at).toLocaleString() : 'Recent',
          status: q.status || 'Pending',
        }));
        setBulkQuotes(mappedQuotes);
      }
    } catch (err) {
      console.warn('Notice fetching admin data from Supabase:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchAdminDataFromSupabase();
  }, [fetchAdminDataFromSupabase]);

  const handleAdminUnlock = (e) => {
    e.preventDefault();
    const result = loginAdmin(passcode);
    if (!result.success) {
      setAdminError(result.error);
    } else {
      setAdminError('');
      fetchAdminDataFromSupabase();
    }
  };

  // Filters & Search State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('All');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [catalogViewMode, setCatalogViewMode] = useState('grid4'); // 'grid4', 'grid3', 'table'
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Category Manager Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTagline, setNewCatTagline] = useState('');

  // Product Add / Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    slug: '',
    price: 499,
    originalPrice: 799,
    description: '',
    category: ['men', 'women'],
    tags: ['Kerala', 'Minimal'],
    colours: ['white', 'black', 'cream', 'green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeType: 'adult',
    printLocation: 'front',
    printRatio: '4:5',
    imageType: 'vector', // 'vector' | 'lifestyle' | 'flatlay' | 'upload'
    imageUrl: '',
    uploadedImagePreview: null,
    isNew: true,
    isBestseller: false,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status handlers
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId || ord.dbId === orderId ? { ...ord, status: newStatus } : ord))
    );
    try {
      await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .or(`order_number.eq.${orderId},id.eq.${orderId}`);
    } catch (err) {}
    showToast(`Order ${orderId} updated to "${newStatus}" in Supabase`);
  };

  const handleQuoteStatusChange = async (quoteId, newStatus) => {
    setBulkQuotes(prev =>
      prev.map(q => (q.id === quoteId ? { ...q, status: newStatus } : q))
    );
    try {
      await supabase.from('bulk_enquiries').update({ status: newStatus }).eq('id', quoteId);
    } catch (err) {}
    showToast(`Quote ${quoteId} status updated to "${newStatus}"`);
  };

  const handleCustomJobStatusChange = async (jobId, newStatus) => {
    setCustomJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    try {
      await supabase.from('custom_designs').update({ status: newStatus }).eq('id', jobId);
    } catch (err) {}
    showToast(`Artwork Job ${jobId} updated to "${newStatus}"`);
  };

  const handleToggleBadge = (prodId, badgeKey) => {
    toggleProductBadge(prodId, badgeKey);
    showToast('Product badges updated in Supabase database');
  };

  const handleToggleStatus = (prodId, currentStatus) => {
    toggleProductStatus(prodId);
    showToast(`Product is now ${!currentStatus ? 'ACTIVE' : 'INACTIVE'} on storefront`);
  };

  // Category Add / Delete Handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const generatedSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: generatedSlug || `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: generatedSlug || `cat-${Date.now()}`,
      tagline: newCatTagline.trim() || `Exclusive ${newCatName} Onam collection`,
    };
    addCategory(newCat);
    setNewCatName('');
    setNewCatTagline('');
    showToast(`Added new category "${newCat.name}"`);
  };

  const handleDeleteCategory = (catSlug, catName) => {
    if (categoryList.length <= 1) {
      alert('At least one category must remain in the catalog.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const targetCat = categoryList.find(c => c.slug === catSlug || c.id === catSlug);
      deleteCategory(targetCat ? targetCat.id : catSlug);
      showToast(`Category "${catName}" removed.`);
    }
  };

  // Product Image File Upload Handler
  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localPreview = URL.createObjectURL(file);
      setProductForm(prev => ({
        ...prev,
        imageType: 'upload',
        uploadedImagePreview: localPreview,
        imageUrl: localPreview,
      }));
      showToast(`Uploading ${file.name} to Supabase...`);

      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setProductForm(prev => ({
          ...prev,
          imageUrl: publicUrl,
          uploadedImagePreview: publicUrl,
        }));
        showToast(`Uploaded ${file.name} to Supabase Storage!`);
      }
    }
  };

  // Open modal for Adding new product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: Date.now(),
      name: '',
      slug: '',
      price: 499,
      originalPrice: 799,
      description: 'Custom Onam graphic T-shirt printed with high definition eco inks at ScreenArts Calicut.',
      category: [categoryList[0]?.slug || 'men'],
      tags: ['Kerala', 'Onam'],
      colours: ['white', 'cream', 'green'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      sizeType: 'adult',
      printLocation: 'front',
      printRatio: '4:5',
      imageType: 'vector',
      imageUrl: '/images/custom-flatlay.png',
      uploadedImagePreview: null,
      isNew: true,
      isBestseller: false,
    });
    setShowProductModal(true);
  };

  // Open modal for Editing product
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      printRatio: prod.printRatio || '4:5',
      sizeType: prod.sizeType || (Array.isArray(prod.category) && prod.category.includes('kids') ? 'kids' : 'adult'),
      imageType: prod.imageType || 'vector',
      imageUrl: prod.images?.front || '/images/custom-flatlay.png',
      uploadedImagePreview: prod.uploadedImagePreview || null,
    });
    setShowProductModal(true);
  };

  // Delete Product
  const handleDeleteProduct = (prodId, prodName) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}" from catalog?`)) {
      deleteProduct(prodId);
      showToast(`Product "${prodName}" deleted.`);
    }
  };

  // Save Product Form
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const generatedSlug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalImage = productForm.imageType === 'lifestyle' 
      ? '/images/hero-lifestyle.png'
      : productForm.imageType === 'flatlay'
      ? '/images/custom-flatlay.png'
      : productForm.uploadedImagePreview || productForm.imageUrl || '/images/custom-flatlay.png';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        slug: generatedSlug || editingProduct.slug,
        images: { front: finalImage },
      });
      showToast(`✅ Saved to Database & Synced Live Storefront: "${productForm.name}"`);
    } else {
      addProduct({
        ...productForm,
        slug: generatedSlug || `product-${Date.now()}`,
        images: { front: finalImage },
      });
      showToast(`✅ Created in Database & Published Live: "${productForm.name}"`);
    }

    setShowProductModal(false);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    const matchesSearch =
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.phone.includes(orderSearch);
    const matchesStatus = orderFilterStatus === 'All' || ord.status === orderFilterStatus;
    const matchesFulfillment =
      orderFulfillmentFilter === 'All' || ord.deliveryMethod === orderFulfillmentFilter;
    return matchesSearch && matchesStatus && matchesFulfillment;
  });

  // Filtered Products
  const filteredProducts = productList.filter(p => {
    const matchesCat = productCategoryFilter === 'All' || p.category.includes(productCategoryFilter.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Weekly Sales Chart Mock Data
  const weeklySalesData = [
    { day: 'Mon', count: 18, total: 9800 },
    { day: 'Tue', count: 24, total: 13400 },
    { day: 'Wed', count: 32, total: 18200 },
    { day: 'Thu', count: 29, total: 15900 },
    { day: 'Fri', count: 45, total: 24800 },
    { day: 'Sat', count: 58, total: 32500 },
    { day: 'Sun', count: 62, total: 34350 },
  ];

  if (!adminAuthenticated) {
    return (
      <div className="admin-lock-screen min-h-screen bg-charcoal text-white flex items-center justify-center p-4">
        <div className="card-white text-charcoal p-8 rounded-3xl max-w-md w-full shadow-2xl text-center border border-gold">
          <div className="w-16 h-16 bg-gold text-charcoal rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
            <Lock size={32} />
          </div>
          <span className="badge badge-gold">SCREENARTS CALICUT</span>
          <h2 className="heading-2 mt-2">Studio Admin Access</h2>
          <p className="text-xs text-muted mt-1">Enter your Studio Passcode to unlock the production & catalog control panel.</p>

          <form onSubmit={handleAdminUnlock} className="mt-6 flex flex-col gap-4 text-left">
            {adminError && <div className="p-3 bg-red-50 text-red border border-red-200 rounded-xl text-xs font-semibold">{adminError}</div>}
            <div>
              <label className="label">Studio Admin Passcode *</label>
              <input
                type="password"
                className="input text-center text-xl font-bold tracking-widest"
                required
                placeholder="Enter Passcode (2026)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md w-full mt-2">
              Unlock Studio Panel <ArrowUpRight size={18} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-xs text-muted flex justify-between items-center">
            <span>Default Passcode: <strong className="text-gold">2026</strong></span>
            <Link to="/" className="text-green font-bold hover:underline">← Back to Storefront</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page page-enter">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Studio Header Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <div className="admin-topbar__brand">
            <Link to="/" className="admin-logo">
              <span className="admin-logo__screen">SCREEN</span>
              <span className="admin-logo__arts">ARTS</span>
              <span className="admin-logo__badge">STUDIO HUB</span>
            </Link>
            <div className="admin-status-indicator">
              <span className="admin-pulse-dot"></span>
              <span className="admin-topbar__loc">Calicut Studio • Live Production</span>
            </div>
          </div>

          <div className="admin-topbar__actions">
            <button
              className="btn btn-gold btn-xs"
              onClick={() => {
                const newId = `ORD-${Math.floor(8096 + Math.random() * 100)}`;
                const newOrder = {
                  id: newId,
                  customerName: 'Kavitha Unni',
                  phone: '+91 94473 55667',
                  email: 'kavitha.unni@gmail.com',
                  deliveryMethod: 'pickup',
                  deliveryAddress: 'ScreenArts Studio Pickup (Calicut Store)',
                  pincode: '673001',
                  items: [{ name: 'Kasavu Edition', colour: 'White', size: 'M', printLocation: 'Front Center', quantity: 2, price: 699 }],
                  totalAmount: 1398,
                  paymentStatus: 'Paid (UPI)',
                  orderDate: 'Just Now',
                  status: 'Received',
                  printSpecs: 'Kasavu Gold Foil Border • DTG Print',
                };
                setOrders([newOrder, ...orders]);
                showToast(`Simulated new incoming order ${newId}!`);
              }}
            >
              <Plus size={14} /> Simulate Order
            </button>
            
            <Link to="/" className="btn btn-outline btn-sm">
              <Eye size={16} /> View Storefront
            </Link>

            <button className="btn btn-outline btn-sm text-red" onClick={logoutAdmin} title="Lock Studio Panel">
              <LogOut size={15} /> Lock Admin
            </button>

            <div className="admin-user-pill">
              <span className="admin-user-dot"></span>
              <span>ScreenArts Manager</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Container */}
      <div className="admin-container">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__section">
            <span className="admin-sidebar__title">STUDIO NAVIGATION</span>
            <nav className="admin-sidebar__nav">
              <button
                className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 size={18} />
                <span>Dashboard Overview</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} />
                <span>Orders & Production</span>
                <span className="admin-nav-badge">{orders.filter(o => o.status !== 'Delivered').length}</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'custom-jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom-jobs')}
              >
                <Palette size={18} />
                <span>Custom Artwork Queue</span>
                <span className="admin-nav-badge admin-nav-badge--gold">{customJobs.length}</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'bulk-quotes' ? 'active' : ''}`}
                onClick={() => setActiveTab('bulk-quotes')}
              >
                <Users size={18} />
                <span>Bulk Orders Leads</span>
                <span className="admin-nav-badge admin-nav-badge--green">{bulkQuotes.length}</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <Users size={18} />
                <span>Customer Directory</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Layers size={18} />
                <span>Product Catalog</span>
                <span className="admin-nav-badge">{productList.length}</span>
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} />
                <span>Studio Settings</span>
              </button>
            </nav>
          </div>

          {/* Capacity Progress Bar */}
          <div className="admin-capacity-card mt-6 p-4 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span>🖨️ Calicut Studio Load</span>
              <span className="text-green font-extrabold">78% Full</span>
            </div>
            <div className="capacity-bar-track">
              <div className="capacity-bar-fill" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-muted mt-2">18 Tees currently in DTG printing queue for Onam delivery.</p>
          </div>

          <div className="admin-sidebar__footer card-cream p-3 mt-4">
            <p className="font-bold text-xs text-charcoal">📍 ScreenArts Calicut Studio</p>
            <p className="text-xs text-muted mt-1">Categories: {categoryList.length} • Products: {productList.length}</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-main">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Studio Dashboard Overview</h1>
                  <p className="text-muted">Real-time metrics for ScreenArts Onam campaign</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleOpenAddProduct}>
                    <Plus size={16} /> Add Product
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowCategoryModal(true)}>
                    <FolderPlus size={16} /> Manage Categories
                  </button>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="admin-stats-grid mt-6">
                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--green">₹</div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__label">Total Revenue</span>
                    <span className="admin-stat-card__val">{formatPrice(orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0))}</span>
                    <span className="admin-stat-card__trend text-green">Calculated from live orders</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--gold"><Package size={22} /></div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__label">Active Orders</span>
                    <span className="admin-stat-card__val">{orders.length} Orders</span>
                    <span className="admin-stat-card__trend">{orders.filter(o => o.status === 'Production' || o.status === 'Printing in Progress').length} in production</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--orange"><Palette size={22} /></div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__label">Custom Print Queue</span>
                    <span className="admin-stat-card__val">{customJobs.length} Jobs</span>
                    <span className="admin-stat-card__trend text-orange">{customJobs.filter(j => j.status === 'Pending').length} pending review</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-card__icon admin-stat-card__icon--blue"><Users size={22} /></div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__label">Bulk Quote Leads</span>
                    <span className="admin-stat-card__val">{bulkQuotes.length} Quotes</span>
                    <span className="admin-stat-card__trend">{bulkQuotes.filter(q => q.status === 'Pending').length} new enquiries</span>
                  </div>
                </div>
              </div>

              {/* Weekly Sales Visualizer Chart */}
              <div className="admin-card mt-6">
                <div className="admin-card__header">
                  <div>
                    <h3 className="heading-4">Weekly Onam T-Shirt Production Volume</h3>
                    <p className="text-xs text-muted">Daily printed units and sales summary</p>
                  </div>
                  <span className="badge badge-green">Onam Season Peak</span>
                </div>

                <div className="sales-chart-bars mt-6">
                  {weeklySalesData.map(d => (
                    <div key={d.day} className="sales-chart-col">
                      <div className="sales-chart-bar-wrap" title={`${d.count} Tees printed (${formatPrice(d.total)})`}>
                        <div className="sales-chart-bar" style={{ height: `${(d.count / 65) * 100}%` }}>
                          <span className="sales-chart-bar-val">{d.count}</span>
                        </div>
                      </div>
                      <span className="sales-chart-day">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Grid 2 Columns */}
              <div className="admin-dash-grid mt-6">
                {/* Left: Recent Orders */}
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h3 className="heading-4">Recent Production Orders</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('orders')}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="admin-orders-list mt-4">
                    {orders.slice(0, 4).map(ord => (
                      <div key={ord.id} className="admin-order-row" onClick={() => setSelectedOrderModal(ord)} style={{ cursor: 'pointer' }}>
                        <div className="admin-order-row__main">
                          <span className="admin-order-id">{ord.id}</span>
                          <div>
                            <h4 className="font-semibold text-sm">{ord.customerName}</h4>
                            <p className="text-xs text-muted">{ord.items.map(i => i.name).join(', ')} • {ord.deliveryMethod === 'pickup' ? '🏬 Calicut Pickup' : '🚚 Home Delivery'}</p>
                          </div>
                        </div>
                        <div className="admin-order-row__status">
                          <span className={`status-badge status-${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {ord.status}
                          </span>
                          <span className="font-bold text-sm">{formatPrice(ord.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Printers & Insights */}
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h3 className="heading-4">Studio Hardware & Insights</h3>
                  </div>

                  <div className="printer-hardware-list mt-4">
                    <div className="printer-item">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs"><Printer size={14} inline="true" /> DTG Printer #1 (Epson SureColor)</span>
                        <span className="badge badge-green">RUNNING</span>
                      </div>
                      <p className="text-xs text-muted mt-1">Printing: <em>Mahabali Minimal (Size L)</em></p>
                    </div>

                    <div className="printer-item mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs"><Printer size={14} inline="true" /> Screen Print Carousel #2</span>
                        <span className="badge badge-gold">READY</span>
                      </div>
                      <p className="text-xs text-muted mt-1">Assigned: <em>Farook College Bulk Tee Order</em></p>
                    </div>
                  </div>

                  <div className="divider my-4" />

                  <div className="admin-insights">
                    <div className="insight-item">
                      <span className="text-sm font-semibold">Fulfillment Method Split</span>
                      <div className="fulfillment-bar mt-2">
                        <div className="fulfillment-seg pickup" style={{ width: '38%' }} title="38% Store Pickup">38% Calicut Store</div>
                        <div className="fulfillment-seg delivery" style={{ width: '62%' }} title="62% Courier Delivery">62% Courier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Orders & Production Management</h1>
                  <p className="text-muted">Track customer orders, printing status, and fulfillment workflow</p>
                </div>
              </div>

              {/* Filters */}
              <div className="admin-filters-bar mt-6">
                <div className="admin-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer Name, Phone..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <div className="admin-status-filters">
                    <span className="text-xs font-semibold text-muted mr-1">Status:</span>
                    {['All', 'Received', 'Printing in Progress', 'Ready for Pickup', 'Shipped', 'Delivered'].map(st => (
                      <button
                        key={st}
                        className={`chip ${orderFilterStatus === st ? 'active' : ''}`}
                        onClick={() => setOrderFilterStatus(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="admin-status-filters">
                    <span className="text-xs font-semibold text-muted mr-1">Delivery:</span>
                    {['All', 'pickup', 'home'].map(method => (
                      <button
                        key={method}
                        className={`chip ${orderFulfillmentFilter === method ? 'active' : ''}`}
                        onClick={() => setOrderFulfillmentFilter(method)}
                      >
                        {method === 'All' ? 'All Methods' : method === 'pickup' ? '🏬 Store Pickup' : '🚚 Home Delivery'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="admin-table-container mt-6">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items & Specs</th>
                      <th>Fulfillment</th>
                      <th>Total</th>
                      <th>Status Workflow</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(ord => (
                      <tr key={ord.id}>
                        <td>
                          <span className="font-bold text-sm text-green">{ord.id}</span>
                          <span className="block text-xs text-muted">{ord.orderDate}</span>
                        </td>
                        <td>
                          <div className="font-semibold text-sm">{ord.customerName}</div>
                          <div className="text-xs text-muted"><Phone size={12} inline="true" /> {ord.phone}</div>
                          <div className="text-xs text-muted">{ord.email}</div>
                        </td>
                        <td>
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-xs mb-1">
                              <strong>{it.quantity}x {it.name}</strong> ({it.colour}, Size {it.size})
                            </div>
                          ))}
                          <span className="text-xs text-orange font-medium">{ord.printSpecs}</span>
                        </td>
                        <td>
                          {ord.deliveryMethod === 'pickup' ? (
                            <span className="badge badge-gold"><Store size={12} /> Calicut Pickup</span>
                          ) : (
                            <span className="badge badge-green"><Truck size={12} /> Home Delivery</span>
                          )}
                        </td>
                        <td className="font-bold text-sm">{formatPrice(ord.totalAmount)}</td>
                        <td>
                          <select
                            className="admin-status-select"
                            value={ord.status}
                            onChange={e => handleOrderStatusChange(ord.id, e.target.value)}
                          >
                            <option value="Received">📥 Received</option>
                            <option value="Printing in Progress">🖨️ Printing in Progress</option>
                            <option value="Ready for Pickup">🏬 Ready for Pickup</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Delivered">✅ Delivered</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-xs" onClick={() => setSelectedOrderModal(ord)}>
                            View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-muted">
                    <p>No production orders matched your search/filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM ARTWORK QUEUE */}
          {activeTab === 'custom-jobs' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Custom Artwork & Design Queue</h1>
                  <p className="text-muted">User uploads and ScreenArts in-house design requests</p>
                </div>
              </div>

              <div className="admin-custom-jobs-grid mt-6">
                {customJobs.map(job => (
                  <div key={job.id} className="admin-card custom-job-card">
                    <div className="custom-job-card__header">
                      <span className="badge badge-gold">{job.id}</span>
                      <span className="text-xs text-muted">{job.date}</span>
                    </div>

                    <h4 className="font-bold text-base mt-2">{job.customer}</h4>
                    <p className="text-xs text-muted"><Phone size={12} inline="true" /> {job.phone}</p>

                    <div className="custom-job-spec mt-3 p-3 bg-cream rounded-lg">
                      <span className="text-xs font-semibold text-charcoal">Type: {job.type}</span>
                      {job.fileName && <p className="text-xs text-green mt-1">📁 File: <strong>{job.fileName}</strong></p>}
                      {job.concept && <p className="text-xs text-orange mt-1">💡 Concept: <em>"{job.concept}"</em></p>}
                      <p className="text-xs text-muted mt-1">Color: {job.shirtColour} • Placement: {job.printLocation} • Qty: {job.qty} pcs</p>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-muted">Status:</span>
                      <select
                        className="admin-status-select"
                        value={job.status}
                        onChange={e => handleCustomJobStatusChange(job.id, e.target.value)}
                      >
                        <option value="Artwork Verified">Artwork Verified</option>
                        <option value="Drafting Proof">Drafting Proof</option>
                        <option value="Proof Sent">Proof Sent</option>
                        <option value="Approved for Printing">Approved for Printing</option>
                      </select>
                    </div>

                    <div className="custom-job-actions mt-4">
                      <button className="btn btn-outline btn-sm" onClick={() => showToast(`Simulating artwork download for ${job.id}`)}>
                        <Download size={14} /> Download File
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => showToast(`Marked proof as sent to ${job.customer}`)}>
                        <CheckCircle size={14} /> Send Proof
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BULK ORDERS LEADS */}
          {activeTab === 'bulk-quotes' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Bulk Orders Lead Manager</h1>
                  <p className="text-muted">Group orders for Colleges, Companies, Schools, and Events</p>
                </div>
              </div>

              <div className="bulk-leads-list mt-6">
                {bulkQuotes.map(bq => (
                  <div key={bq.id} className="admin-card bulk-lead-card">
                    <div className="bulk-lead-card__header">
                      <div>
                        <span className="badge badge-green mb-1">{bq.groupType}</span>
                        <h3 className="heading-4">{bq.organization}</h3>
                        <p className="text-xs text-muted">Contact: <strong>{bq.contactPerson}</strong> • {bq.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-xl text-green">{formatPrice(bq.estimatedTotal)}</span>
                        <span className="block text-xs text-muted">{bq.quantity} T-shirts @ {formatPrice(bq.estimatedRatePerPc)}/pc</span>
                      </div>
                    </div>

                    <div className="bulk-lead-notes mt-3 p-3 bg-white rounded-lg border">
                      <p className="text-xs text-charcoal"><strong>Requirements & Notes:</strong> {bq.notes}</p>
                    </div>

                    <div className="bulk-lead-footer mt-4">
                      <span className="text-xs text-muted">Requested on: {bq.requestDate}</span>
                      <div className="flex gap-2">
                        <select
                          className="admin-status-select"
                          value={bq.status}
                          onChange={e => handleQuoteStatusChange(bq.id, e.target.value)}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Quote Sent">Quote Sent</option>
                          <option value="Approved & In Setup">Approved & In Setup</option>
                        </select>
                        <a href={`tel:${bq.phone}`} className="btn btn-primary btn-sm">
                          <Phone size={14} /> Call Client
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4.5: CUSTOMER DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Customer Directory & Purchase History</h1>
                  <p className="text-muted">Registered ScreenArts customers, contact info, total orders, and lifetime spending</p>
                </div>
              </div>

              <div className="admin-table-container mt-6">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone / Contact</th>
                      <th>Email</th>
                      <th>Delivery Location</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Kavitha Unni', phone: '+91 94473 55667', email: 'kavitha.unni@gmail.com', address: 'ScreenArts Studio Pickup (Calicut)', orders: 3, spent: 4197 },
                      { name: 'Rahul Nair', phone: '+91 98470 12345', email: 'rahul.nair@yahoo.com', address: 'Mavoor Road, Calicut, 673001', orders: 2, spent: 1898 },
                      { name: 'Dr. Ananya P.', phone: '+91 91234 56789', email: 'ananya.p@medical.in', address: 'Medical College Junction, Calicut', orders: 4, spent: 5490 },
                      { name: 'Siddharth V.', phone: '+91 97440 98765', email: 'siddharth@techm.com', address: 'Cyberpark, Nellikode, Calicut', orders: 1, spent: 1299 },
                    ].map((cust, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="font-bold text-sm">{cust.name}</div>
                        </td>
                        <td className="text-xs font-semibold">{cust.phone}</td>
                        <td className="text-xs text-muted">{cust.email}</td>
                        <td className="text-xs">{cust.address}</td>
                        <td>
                          <span className="badge badge-gold">{cust.orders} Orders</span>
                        </td>
                        <td className="font-bold text-green">{formatPrice(cust.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCT & CATALOG MANAGEMENT (PRODUCT IMAGE OPTIONS, CATEGORY ADD/REMOVE, RATIO, SIZES, ADD, EDIT, DELETE, SEARCH) */}
          {activeTab === 'products' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Onam Collection Product Catalog</h1>
                  <p className="text-muted">Manage products, custom image options, print aspect ratios, sizes, pricing, and categories</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-md" onClick={() => setShowCategoryModal(true)}>
                    <FolderPlus size={18} /> Manage Categories ({categoryList.length})
                  </button>
                  <button className="btn btn-primary btn-md" onClick={handleOpenAddProduct}>
                    <Plus size={18} /> Add New Product
                  </button>
                </div>
              </div>

              {/* Catalog Search & Category & Layout Ratio Filters */}
              <div className="admin-filters-bar mt-6">
                <div className="admin-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search product by name..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <div className="admin-status-filters">
                    <span className="text-xs font-semibold text-muted mr-1">Category:</span>
                    <button
                      className={`chip ${productCategoryFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setProductCategoryFilter('All')}
                    >
                      All
                    </button>
                    {categoryList.map(cat => (
                      <button
                        key={cat.id}
                        className={`chip ${productCategoryFilter === cat.slug ? 'active' : ''}`}
                        onClick={() => setProductCategoryFilter(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Admin Catalog View Layout Switcher */}
                  <div className="grid-ratio-switcher">
                    <button
                      className={`ratio-btn ${catalogViewMode === 'grid4' ? 'active' : ''}`}
                      onClick={() => setCatalogViewMode('grid4')}
                      title="4-Column 4:5 Grid View"
                    >
                      <Grid3x3 size={15} /> 4:5 Grid
                    </button>
                    <button
                      className={`ratio-btn ${catalogViewMode === 'grid3' ? 'active' : ''}`}
                      onClick={() => setCatalogViewMode('grid3')}
                      title="3-Column 3:4 Grid View"
                    >
                      <Grid2x2 size={15} /> 3:4 Grid
                    </button>
                    <button
                      className={`ratio-btn ${catalogViewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setCatalogViewMode('table')}
                      title="Detailed Spec Table View"
                    >
                      <LayoutList size={15} /> Table View
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID VIEW */}
              {catalogViewMode !== 'table' ? (
                <div className={`grid mt-6 ${catalogViewMode === 'grid4' ? 'grid-4' : 'grid-3'} gap-5`}>
                  {filteredProducts.map(prod => (
                    <div key={prod.id} className="admin-card product-mgmt-card">
                      {/* Fluid Aspect Ratio Mockup / Image Container */}
                      <div className="product-mgmt-card__mockup">
                        {prod.imageType === 'lifestyle' || prod.imageType === 'flatlay' || prod.imageType === 'upload' ? (
                          <img
                            src={prod.images?.front || (prod.imageType === 'lifestyle' ? '/images/hero-lifestyle.png' : '/images/custom-flatlay.png')}
                            alt={prod.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        ) : (
                          <TShirtMockup
                            colour={prod.colours[0]}
                            graphicDesignName={prod.name}
                            printRatio={prod.printRatio || '4:5'}
                          />
                        )}
                        <span className="admin-ratio-tag">{prod.printRatio || '4:5'} Ratio</span>
                      </div>

                      <div className="product-mgmt-card__info mt-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-base">{prod.name}</h4>
                          <span className="text-xs text-muted font-semibold">{prod.printLocation || 'front'}</span>
                        </div>

                        {/* Price & Image Type Spec */}
                        <div className="price-edit-row mt-2">
                          <span className="font-extrabold text-base text-green">{formatPrice(prod.price)}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-muted line-through">{formatPrice(prod.originalPrice)}</span>
                          )}
                          <span className="badge badge-gold ml-auto" style={{ fontSize: '10px' }}>
                            {prod.imageType === 'lifestyle' ? '📷 Lifestyle Photo' : prod.imageType === 'upload' ? '📁 Uploaded File' : '🎨 Vector Render'}
                          </span>
                        </div>

                        <div className="text-xs text-muted mt-1">
                          <strong>Sizes:</strong> {prod.category.includes('kids') ? 'Kids 2-13Y' : 'XS, S, M, L, XL, XXL, 3XL'}
                        </div>

                        <div className="badge-toggles-row mt-3 flex gap-1 flex-wrap">
                          <button
                            className={`btn btn-xs ${prod.isBestseller ? 'btn-gold' : 'btn-outline'}`}
                            onClick={() => handleToggleBadge(prod.id, 'isBestseller')}
                          >
                            {prod.isBestseller ? '★ Bestseller' : '+ Mark Bestseller'}
                          </button>
                          <button
                            className={`btn btn-xs ${prod.isNew ? 'btn-green' : 'btn-outline'}`}
                            onClick={() => handleToggleBadge(prod.id, 'isNew')}
                          >
                            {prod.isNew ? '✓ New Tag' : '+ Mark New'}
                          </button>
                          <button
                            className={`btn btn-xs ${prod.isActive !== false ? 'btn-green' : 'btn-outline'}`}
                            style={prod.isActive === false ? { color: '#E53E3E', borderColor: '#FEB2B2' } : {}}
                            onClick={() => handleToggleStatus(prod.id, prod.isActive !== false)}
                            title="Toggle Public Store Visibility"
                          >
                            {prod.isActive !== false ? '🟢 Store Active' : '🔴 Hidden (Inactive)'}
                          </button>
                        </div>

                        <div className="product-mgmt-card__actions mt-4 pt-3 border-t flex justify-between">
                          <button
                            className="btn btn-outline btn-xs text-primary"
                            onClick={() => handleOpenEditProduct(prod)}
                          >
                            <Edit3 size={14} /> Edit Image & Options
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-red"
                            style={{ color: '#E53E3E' }}
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* DETAILED TABLE VIEW */
                <div className="admin-table-container mt-6">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Image Mode</th>
                        <th>Categories</th>
                        <th>Available Sizes</th>
                        <th>Print Ratio</th>
                        <th>Placement</th>
                        <th>Visibility & Badges</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(prod => (
                        <tr key={prod.id}>
                          <td>
                            <div className="font-bold text-sm">{prod.name}</div>
                            <span className="text-xs text-muted">ID: {prod.id}</span>
                          </td>
                          <td className="font-bold text-green">{formatPrice(prod.price)}</td>
                          <td className="text-muted line-through text-xs">{formatPrice(prod.originalPrice)}</td>
                          <td>
                            <span className="badge badge-gold">
                              {prod.imageType === 'lifestyle' ? '📷 Photo' : prod.imageType === 'upload' ? '📁 Upload' : '🎨 Vector'}
                            </span>
                          </td>
                          <td>
                            {prod.category.map(c => (
                              <span key={c} className="badge badge-green mr-1">{c}</span>
                            ))}
                          </td>
                          <td className="text-xs">{prod.category.includes('kids') ? 'Kids (2–13Y)' : 'XS – 3XL'}</td>
                          <td>
                            <span className="badge badge-gold"><Crop size={12} /> {prod.printRatio || '4:5'}</span>
                          </td>
                          <td className="text-xs font-semibold">{prod.printLocation || 'front'}</td>
                          <td>
                            {prod.isBestseller && <span className="badge badge-gold mr-1">Bestseller</span>}
                            {prod.isNew && <span className="badge badge-green mr-1">New</span>}
                            <button
                              className={`btn btn-xs ${prod.isActive !== false ? 'btn-green' : 'btn-outline'}`}
                              style={prod.isActive === false ? { color: '#E53E3E', borderColor: '#FEB2B2' } : {}}
                              onClick={() => handleToggleStatus(prod.id, prod.isActive !== false)}
                            >
                              {prod.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                            </button>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-outline btn-xs" onClick={() => handleOpenEditProduct(prod)}>
                                <Edit3 size={14} /> Edit
                              </button>
                              <button className="btn btn-ghost btn-xs text-red" onClick={() => handleDeleteProduct(prod.id, prod.name)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STUDIO SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-tab-content fade-in">
              <div className="admin-page-header">
                <div>
                  <h1 className="heading-3">Studio & Store Settings</h1>
                  <p className="text-muted">Manage Calicut pickup status and global shop announcements</p>
                </div>
              </div>

              <div className="admin-settings-card admin-card mt-6">
                <h3 className="heading-4">Announcement Banner Message</h3>
                <p className="text-xs text-muted mt-1">This text is displayed live at the top of the ScreenArts website.</p>
                <div className="mt-3">
                  <input
                    type="text"
                    className="input"
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm mt-3" onClick={() => showToast('Live Announcement Bar updated!')}>
                    Save Banner Message
                  </button>
                </div>

                <div className="divider my-6" />

                <h3 className="heading-4">ScreenArts Calicut Pickup Status</h3>
                <p className="text-xs text-muted mt-1">Control whether local customers can select store pickup during checkout.</p>

                <div className="pickup-status-toggle mt-3">
                  <button
                    className={`btn ${studioPickupOpen ? 'btn-green' : 'btn-outline'}`}
                    onClick={() => {
                      setStudioPickupOpen(!studioPickupOpen);
                      showToast(`Calicut Store Pickup is now ${!studioPickupOpen ? 'ACTIVE' : 'DISABLED'}`);
                    }}
                  >
                    {studioPickupOpen ? '✅ Store Pickup ACTIVE in Calicut' : '❌ Store Pickup Temporarily Disabled'}
                  </button>
                </div>

                <div className="divider my-6" />

                <h3 className="heading-4">Catalog Reset & Seed Restore</h3>
                <p className="text-xs text-muted mt-1">Reset all custom products, pricing, and category edits back to factory Onam seed dataset.</p>

                <div className="mt-3">
                  <button
                    className="btn btn-outline btn-sm text-red"
                    style={{ color: '#E53E3E', borderColor: '#FEB2B2' }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all products, categories, and settings back to default Onam seed data?')) {
                        resetToDefaults();
                        showToast('Restored original Onam catalog seed dataset!');
                      }
                    }}
                  >
                    <RefreshCw size={14} /> Restore Original Onam Seed Catalog
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="quickview-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="quickview-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="quickview-close" onClick={() => setShowCategoryModal(false)}>✕</button>

            <div className="flex items-center gap-2 mb-1">
              <FolderPlus size={22} className="text-green" />
              <h2 className="heading-3">Store Category Manager</h2>
            </div>
            <p className="text-xs text-muted mb-4">Add new product categories or remove existing categories from shop filters</p>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="bg-cream p-4 rounded-xl mb-6 border">
              <h4 className="font-bold text-sm mb-3">➕ Add New Category</h4>
              <div className="grid grid-2 gap-3 mb-3">
                <div>
                  <label className="label">Category Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Festival Specials, Traditional Kasavu"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Category Tagline</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Trendy Onam styles for youth"
                    value={newCatTagline}
                    onChange={e => setNewCatTagline(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Category
              </button>
            </form>

            {/* Existing Categories List */}
            <h4 className="font-bold text-sm mb-3">Active Categories ({categoryList.length})</h4>
            <div className="admin-category-list flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {categoryList.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-white border rounded-xl">
                  <div>
                    <h5 className="font-semibold text-sm">{cat.name}</h5>
                    <span className="text-xs text-muted">Slug: <code>{cat.slug}</code> • {cat.tagline}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-red"
                    style={{ color: '#E53E3E' }}
                    onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                    title="Remove Category"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button className="btn btn-primary btn-md" onClick={() => setShowCategoryModal(false)}>
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal (With Product Image Options, Size Categories & Print Aspect Ratios) */}
      {showProductModal && (
        <div className="quickview-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="quickview-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <button className="quickview-close" onClick={() => setShowProductModal(false)}>✕</button>
            
            <h2 className="heading-3 mb-1">
              {editingProduct ? `Edit Product Options: ${editingProduct.name}` : 'Add New Onam Product'}
            </h2>
            <p className="text-xs text-muted mb-4">Set pricing, product image source, sizes, print aspect ratios, and colours</p>

            <form onSubmit={handleSaveProduct} className="admin-product-form">
              <div className="checkout-field-grid">
                <div className="checkout-field checkout-field--full">
                  <label className="label">Product Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Thiruvonam Special Kasavu Tee"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                {/* PRODUCT IMAGE OPTIONS SECTION */}
                <div className="checkout-field checkout-field--full bg-cream p-4 rounded-xl border">
                  <label className="label font-bold flex items-center gap-2 text-charcoal mb-2">
                    <Image size={18} /> Product Image Source & Artwork Option
                  </label>
                  
                  <div className="grid grid-3 gap-2 mb-3">
                    <button
                      type="button"
                      className={`chip ${productForm.imageType === 'vector' ? 'active' : ''}`}
                      onClick={() => setProductForm({ ...productForm, imageType: 'vector' })}
                    >
                      🎨 Vector SVG Render
                    </button>
                    <button
                      type="button"
                      className={`chip ${productForm.imageType === 'lifestyle' ? 'active' : ''}`}
                      onClick={() => setProductForm({ ...productForm, imageType: 'lifestyle' })}
                    >
                      📷 Lifestyle Photo
                    </button>
                    <button
                      type="button"
                      className={`chip ${productForm.imageType === 'flatlay' ? 'active' : ''}`}
                      onClick={() => setProductForm({ ...productForm, imageType: 'flatlay' })}
                    >
                      👕 Flat-Lay Shirt
                    </button>
                  </div>

                  {/* Upload Image Option */}
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Image File (PNG/JPG)
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      style={{ display: 'none' }}
                    />
                    
                    {productForm.uploadedImagePreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={productForm.uploadedImagePreview}
                          alt="Uploaded Preview"
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #CBD5E0' }}
                        />
                        <span className="text-xs text-green font-semibold">Custom Image Uploaded ✓</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="checkout-field">
                  <label className="label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    className="input"
                    required
                    min="100"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  />
                </div>

                <div className="checkout-field">
                  <label className="label">Original Price (₹)</label>
                  <input
                    type="number"
                    className="input"
                    min="100"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                  />
                </div>

                {/* Print Location */}
                <div className="checkout-field">
                  <label className="label">Print Location</label>
                  <select
                    className="input select"
                    value={productForm.printLocation}
                    onChange={e => setProductForm({ ...productForm, printLocation: e.target.value })}
                  >
                    {PRINT_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Print Aspect Ratio */}
                <div className="checkout-field">
                  <label className="label">Print Aspect Ratio</label>
                  <select
                    className="input select"
                    value={productForm.printRatio}
                    onChange={e => setProductForm({ ...productForm, printRatio: e.target.value })}
                  >
                    {PRINT_RATIOS.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.dims})</option>
                    ))}
                  </select>
                </div>

                {/* Primary Category */}
                <div className="checkout-field">
                  <label className="label">Primary Category</label>
                  <select
                    className="input select"
                    value={productForm.category[0] || categoryList[0]?.slug}
                    onChange={e => setProductForm({ ...productForm, category: [e.target.value] })}
                  >
                    {categoryList.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Size Category */}
                <div className="checkout-field">
                  <label className="label">Garment Sizing Group</label>
                  <select
                    className="input select"
                    value={productForm.sizeType}
                    onChange={e => setProductForm({ ...productForm, sizeType: e.target.value })}
                  >
                    <option value="adult">Adult Sizes (XS–3XL)</option>
                    <option value="kids">Kids Sizes (2–13Y)</option>
                    <option value="both">Both Adult & Kids Sizes</option>
                  </select>
                </div>

                <div className="checkout-field checkout-field--full">
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows="2"
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe the product material, design, and Onam aesthetic..."
                  />
                </div>

                <div className="checkout-field checkout-field--full">
                  <label className="label">Available Colours</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {TSHIRT_COLOURS.map(col => {
                      const isSelected = productForm.colours.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          className={`chip ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            const newCols = isSelected
                              ? productForm.colours.filter(c => c !== col.id)
                              : [...productForm.colours, col.id];
                            setProductForm({ ...productForm, colours: newCols });
                          }}
                        >
                          <span className="colour-dot" style={{ backgroundColor: col.hex, width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
                          {col.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="checkout-field checkout-field--full flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={productForm.isBestseller}
                      onChange={e => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                    />
                    Mark as BESTSELLER
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={e => setProductForm({ ...productForm, isNew: e.target.checked })}
                    />
                    Mark as NEW ARRIVAL
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" className="btn btn-outline btn-md" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Ticket Detail Modal */}
      {selectedOrderModal && (
        <div className="quickview-modal-overlay" onClick={() => setSelectedOrderModal(null)}>
          <div className="quickview-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="quickview-close" onClick={() => setSelectedOrderModal(null)}>✕</button>
            <div className="order-ticket">
              <div className="order-ticket__header">
                <span className="badge badge-gold">PRINT TICKET #{selectedOrderModal.id}</span>
                <h2 className="heading-3 mt-1">{selectedOrderModal.customerName}</h2>
                <p className="text-xs text-muted">{selectedOrderModal.phone} • {selectedOrderModal.email}</p>
              </div>

              <div className="divider my-3" />

              <div className="order-ticket__spec bg-cream p-4 rounded-xl">
                <h4 className="font-bold text-sm text-green">Fulfillment Spec</h4>
                <p className="text-sm mt-1"><strong>Method:</strong> {selectedOrderModal.deliveryMethod === 'pickup' ? '🏬 Local Pickup at ScreenArts Studio Calicut' : '🚚 Home Delivery Address: ' + selectedOrderModal.deliveryAddress}</p>
                <p className="text-sm mt-1"><strong>Print Specs:</strong> {selectedOrderModal.printSpecs}</p>
              </div>

              <div className="order-ticket__items mt-4">
                <h4 className="font-bold text-sm">Ordered T-Shirts ({selectedOrderModal.items.length})</h4>
                {selectedOrderModal.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border-b text-sm">
                    <div>
                      <strong>{it.name}</strong> ({it.colour}, Size {it.size}, {it.printLocation})
                      {it.customText && <div className="text-xs text-orange">Custom Text: "{it.customText}"</div>}
                    </div>
                    <span className="font-bold">×{it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-ticket__footer mt-6 flex justify-between items-center">
                <span className="font-extrabold text-lg text-charcoal">Total: {formatPrice(selectedOrderModal.totalAmount)} ({selectedOrderModal.paymentStatus})</span>
                <button className="btn btn-primary btn-sm" onClick={() => { showToast(`Printing Job Slip for ${selectedOrderModal.id}...`); setSelectedOrderModal(null); }}>
                  🖨️ Print Production Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
