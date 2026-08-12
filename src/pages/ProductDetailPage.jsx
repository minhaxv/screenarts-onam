import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Palette, Heart, Share2, Minus, Plus, Truck, Shield, Crop } from 'lucide-react';
import { TSHIRT_COLOURS, SIZES, KIDS_SIZES, PRINT_LOCATIONS, PRINT_RATIOS, SIZE_CHART, KIDS_SIZE_CHART, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import TShirtMockup from '../components/product/TShirtMockup';
import ProductCard from '../components/product/ProductCard';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { products } = useProducts();
  const activeProducts = products.filter(p => p.isActive !== false);
  const { slug } = useParams();
  const product = activeProducts.find(p => p.slug === slug || String(p.id) === slug);
  const { addItem } = useCart();

  const [selectedColour, setSelectedColour] = useState(product?.colours?.[0] || 'white');
  const [sizeType, setSizeType] = useState('adult'); // 'adult' or 'kids'
  const [selectedSize, setSelectedSize] = useState('M');
  const [printRatio, setPrintRatio] = useState('4:5');
  const [quantity, setQuantity] = useState(1);
  const [printLocation, setPrintLocation] = useState(product?.printLocation || 'front');
  const [activeView, setActiveView] = useState('front');
  const [activeTab, setActiveTab] = useState('size-guide');
  const [sizeChartMode, setSizeChartMode] = useState('adult');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container text-center py-16 page-enter" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="heading-3">Product Not Found</h2>
        <p className="text-muted mt-2">The requested product is unavailable or has been removed from the database.</p>
        <Link to="/shop" className="btn btn-primary mt-4">Browse Collection</Link>
      </div>
    );
  }

  const colourData = TSHIRT_COLOURS.find(c => c.id === selectedColour);
  const ratioData = PRINT_RATIOS.find(r => r.id === printRatio);

  const handleAdd = () => {
    addItem(product, {
      colour: selectedColour,
      size: selectedSize,
      sizeType,
      quantity,
      printLocation,
      printRatio: ratioData?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const views = [
    { id: 'front', label: 'Front View' },
    { id: 'back', label: 'Back View' },
    { id: 'lifestyle', label: 'Lifestyle View' },
  ];

  const relatedProducts = activeProducts.filter(p => p.id !== product?.id).slice(0, 4);
  const currentSizes = sizeType === 'adult' ? SIZES : KIDS_SIZES;
  const currentChart = sizeChartMode === 'adult' ? SIZE_CHART : KIDS_SIZE_CHART;

  return (
    <div className="pdp page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div className="pdp__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Onam Collection</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="pdp__main">
          {/* Left: Interactive Mockup Canvas */}
          <div className="pdp__images">
            <div className="pdp__image-main">
              {activeView === 'lifestyle' ? (
                <img
                  src="/images/hero-lifestyle.png"
                  alt={`${product.name} Onam Lifestyle`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                />
              ) : (
                <TShirtMockup
                  colour={selectedColour}
                  colourHex={colourData?.hex || '#FFFFFF'}
                  graphicDesignName={product.name}
                  printLocation={activeView === 'back' ? 'back' : printLocation}
                  printRatio={printRatio}
                />
              )}
              <span className="pdp__image-view-label">{activeView.toUpperCase()} VIEW • {printRatio} RATIO</span>
            </div>

            <div className="pdp__image-thumbs">
              {views.map(v => (
                <button
                  key={v.id}
                  className={`pdp__thumb ${activeView === v.id ? 'active' : ''}`}
                  onClick={() => setActiveView(v.id)}
                >
                  <span className="pdp__thumb-label">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="pdp__info">
            <div className="pdp__badges-row">
              <span className="badge badge-gold">SCREENARTS ONAM EDITION</span>
              {product.isNew && <span className="badge badge-green">NEW</span>}
              {product.isBestseller && <span className="badge badge-orange">BESTSELLER</span>}
            </div>

            <h1 className="pdp__name">{product.name}</h1>
            
            <div className="pdp__pricing">
              <span className="pdp__price">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="pdp__original-price">{formatPrice(product.originalPrice)}</span>
                  <span className="badge badge-orange">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="pdp__description">{product.description}</p>

            {/* Colour Picker */}
            <div className="pdp__option">
              <label className="label">Available Colours: <strong>{colourData?.name}</strong></label>
              <div className="pdp__colours">
                {product.colours.map(colId => {
                  const col = TSHIRT_COLOURS.find(c => c.id === colId);
                  return (
                    <button
                      key={colId}
                      className={`colour-dot pdp__colour-dot ${selectedColour === colId ? 'active' : ''}`}
                      style={{ backgroundColor: col?.hex, width: 32, height: 32 }}
                      onClick={() => setSelectedColour(colId)}
                      title={col?.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Category & Picker */}
            <div className="pdp__option">
              <div className="flex justify-between items-center mb-2">
                <label className="label mb-0">Select Size: <strong>{selectedSize} ({sizeType.toUpperCase()})</strong></label>
                <div className="flex gap-1 bg-cream p-1 rounded-lg">
                  <button
                    className={`chip ${sizeType === 'adult' ? 'active' : ''}`}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => { setSizeType('adult'); setSelectedSize('M'); }}
                  >
                    Adult
                  </button>
                  <button
                    className={`chip ${sizeType === 'kids' ? 'active' : ''}`}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => { setSizeType('kids'); setSelectedSize('6-7Y'); }}
                  >
                    Kids (2-13Y)
                  </button>
                </div>
              </div>

              <div className="pdp__sizes">
                {currentSizes.map(size => (
                  <button
                    key={size}
                    className={`pdp__size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Aspect Ratio */}
            <div className="pdp__option">
              <label className="label flex items-center gap-1">
                <Crop size={16} /> Print Aspect Ratio & Print Dimensions
              </label>
              <div className="grid grid-3 gap-2 mt-1">
                {PRINT_RATIOS.slice(0, 3).map(r => (
                  <button
                    key={r.id}
                    className={`pdp__print-loc ${printRatio === r.id ? 'active' : ''}`}
                    onClick={() => setPrintRatio(r.id)}
                    style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px' }}
                  >
                    <span className="font-bold text-xs">{r.icon} {r.name}</span>
                    <span className="text-xs text-muted" style={{ fontSize: '10px' }}>{r.dims.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print Position */}
            <div className="pdp__option">
              <label className="label">Print Position</label>
              <div className="pdp__print-locations">
                {PRINT_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    className={`pdp__print-loc ${printLocation === loc.id ? 'active' : ''}`}
                    onClick={() => setPrintLocation(loc.id)}
                  >
                    <span>{loc.icon}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="pdp__option">
              <label className="label">Quantity</label>
              <div className="qty-selector">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}><Minus size={16} /></button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="pdp__ctas">
              <button className={`btn btn-primary btn-lg pdp__add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                <ShoppingBag size={20} />
                {added ? 'Added to Cart ✓' : `Add to Cart — ${formatPrice(product.price * quantity)}`}
              </button>
              <Link to={`/customize?design=${encodeURIComponent(product.name)}`} className="btn btn-outline btn-lg">
                <Palette size={20} /> Customize This Design
              </Link>
            </div>

            {/* Delivery & Trust Meta */}
            <div className="pdp__meta mt-6">
              <div className="pdp__meta-item">
                <Truck size={18} /> <span>ScreenArts Express Delivery across Kerala & India</span>
              </div>
              <div className="pdp__meta-item">
                <Shield size={18} /> <span>Printed in Calicut Studio • Quality Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Size Guide, Delivery, Print Info, Care */}
        <div className="pdp__tabs mt-12">
          <div className="pdp__tab-headers">
            {[
              { id: 'size-guide', label: 'Size & Ratio Guide' },
              { id: 'delivery', label: 'Delivery & Pickup Info' },
              { id: 'print', label: 'Print Quality' },
              { id: 'care', label: 'Care Instructions' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`pdp__tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pdp__tab-content">
            {activeTab === 'size-guide' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-base text-charcoal">Measurements Chart ({sizeChartMode === 'adult' ? 'Adult Sizes' : 'Kids Sizes'})</h4>
                  <div className="flex gap-2">
                    <button
                      className={`chip ${sizeChartMode === 'adult' ? 'active' : ''}`}
                      onClick={() => setSizeChartMode('adult')}
                    >
                      Adult Size Chart
                    </button>
                    <button
                      className={`chip ${sizeChartMode === 'kids' ? 'active' : ''}`}
                      onClick={() => setSizeChartMode('kids')}
                    >
                      Kids Size Chart (2-13Y)
                    </button>
                  </div>
                </div>

                <table className="pdp__size-table">
                  <thead>
                    <tr>{currentChart.headers.map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {currentChart.rows.map((row, i) => (
                      <tr key={i} className={row[0] === selectedSize || row[0].startsWith(selectedSize) ? 'highlighted' : ''}>
                        {row.map((cell, j) => <td key={j}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'delivery' && (
              <div className="pdp__tab-text">
                <p><strong>🚚 Home Delivery:</strong> Ships across Kerala and All India. Orders are processed within 2-4 business days.</p>
                <p><strong>🏬 ScreenArts Store Pickup (Calicut):</strong> Pick up directly from our Calicut studio for zero shipping cost.</p>
                <p><strong>🌼 Onam Offer:</strong> Free delivery on all orders above ₹999.</p>
              </div>
            )}
            {activeTab === 'print' && (
              <div className="pdp__tab-text">
                <p><strong>Print Method:</strong> High-definition Direct-to-Garment (DTG) and Screen Printing at ScreenArts Calicut.</p>
                <p><strong>Print Ratios Supported:</strong> 1:1 Square, 4:5 Portrait, 3:4 Classic (A4), A3 Maxi, 16:9 Banner.</p>
                <p><strong>Fabric:</strong> 100% Super-combed breathable organic cotton with Kasavu gold border options.</p>
              </div>
            )}
            {activeTab === 'care' && (
              <div className="pdp__tab-text">
                <p>• Turn garment inside out before washing</p>
                <p>• Cold machine wash with mild detergent</p>
                <p>• Tumble dry low or dry flat in shade</p>
                <p>• Do not iron directly over printed artwork</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="pdp__related mt-12 mb-12">
          <h2 className="heading-3 mb-6">Complete Your Onam Look</h2>
          <div className="grid grid-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
