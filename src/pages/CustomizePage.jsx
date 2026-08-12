import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Type, Palette as PaletteIcon, Image, ChevronRight, X, Plus, Minus, ArrowRight, PenTool, Crop } from 'lucide-react';
import { TSHIRT_COLOURS, SIZES, KIDS_SIZES, PRINT_LOCATIONS, PRINT_RATIOS, designs, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import TShirtMockup from '../components/product/TShirtMockup';
import './CustomizePage.css';

const TSHIRT_BASE_PRICE = 299;
const PRINT_PRICE = 150;

export default function CustomizePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [tshirtColour, setTshirtColour] = useState('white');
  const [sizeCategory, setSizeCategory] = useState('adult'); // 'adult' | 'kids'
  const [size, setSize] = useState('M');
  const [printLocation, setPrintLocation] = useState('front');
  const [printRatio, setPrintRatio] = useState('4:5'); // '1:1', '4:5', '3:4', 'A3', '16:9'
  const [quantity, setQuantity] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [customText, setCustomText] = useState('');
  const [textColour, setTextColour] = useState('#1A1A2E');
  const [activePanel, setActivePanel] = useState('design');
  const [printScale, setPrintScale] = useState(1);
  const [isRequestDesign, setIsRequestDesign] = useState(false);

  useEffect(() => {
    const designParam = searchParams.get('design');
    const reqParam = searchParams.get('requestDesign');
    if (designParam) {
      const match = designs.find(d => d.name.toLowerCase() === designParam.toLowerCase());
      if (match) setSelectedDesign(match);
    }
    if (reqParam === 'true') {
      setIsRequestDesign(true);
      setActivePanel('upload');
    }
  }, [searchParams]);

  const colourData = TSHIRT_COLOURS.find(c => c.id === tshirtColour);
  const ratioData = PRINT_RATIOS.find(r => r.id === printRatio);
  const designFee = isRequestDesign ? 250 : 0;
  const totalPrice = (TSHIRT_BASE_PRICE + PRINT_PRICE + designFee) * quantity;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localPreview = URL.createObjectURL(file);
      setUploadedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
      setUploadedPreview(localPreview);
      setSelectedDesign(null);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `artwork-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('custom-designs')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!error) {
          const { data: publicData } = supabase.storage.from('custom-designs').getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            setUploadedPreview(publicData.publicUrl);
            setUploadedFile(prev => ({ ...prev, publicUrl: publicData.publicUrl }));
          }
        }
      } catch (err) {
        console.warn('Artwork upload notice:', err.message);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const localPreview = URL.createObjectURL(file);
      setUploadedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
      setUploadedPreview(localPreview);
      setSelectedDesign(null);
    }
  };

  const handleAddToCart = async () => {
    const artworkUrl = uploadedFile?.publicUrl || uploadedPreview || '';

    // Save record to Supabase custom_designs table
    if (uploadedFile || isRequestDesign || selectedDesign) {
      try {
        await supabase.from('custom_designs').insert([
          {
            user_id: user?.id || null,
            customer_name: user?.name || 'Customer',
            phone: user?.phone || '',
            email: user?.email || '',
            file_url: artworkUrl || selectedDesign?.name || 'Custom Artwork',
            file_name: uploadedFile?.name || selectedDesign?.name || 'Custom Design',
            shirt_colour: colourData?.name || tshirtColour,
            print_location: printLocation,
            quantity: quantity,
            status: 'Pending',
          }
        ]);
      } catch (err) {}
    }

    addItem(
      {
        id: `custom-${Date.now()}`,
        name: selectedDesign ? `Custom: ${selectedDesign.name}` : customText ? `Custom Text: "${customText}"` : uploadedFile ? `Upload: ${uploadedFile.name}` : 'Custom Onam T-Shirt',
        price: TSHIRT_BASE_PRICE + PRINT_PRICE + designFee,
        images: { front: artworkUrl || '/images/custom-flatlay.png' },
      },
      {
        colour: tshirtColour,
        sizeCategory,
        size,
        quantity,
        printLocation,
        printRatio: ratioData?.name,
        printType: isRequestDesign ? 'Request Design' : 'Custom Print',
        customDesign: uploadedFile?.name || selectedDesign?.name,
        customDesignUrl: artworkUrl,
        customText,
      }
    );
    navigate('/cart');
  };

  const panels = [
    { id: 'design', label: 'ScreenArts Design', icon: <Image size={18} /> },
    { id: 'text', label: 'Custom Text', icon: <Type size={18} /> },
    { id: 'upload', label: 'Upload Artwork', icon: <Upload size={18} /> },
  ];

  const availableSizes = sizeCategory === 'adult' ? SIZES : KIDS_SIZES;

  return (
    <div className="customize-page page-enter">
      {/* Header */}
      <div className="customize-header">
        <div className="container">
          <span className="badge badge-gold">SCREENARTS STUDIO</span>
          <h1 className="heading-3 mt-1">Custom T-Shirt Builder</h1>
          <p className="text-muted">Configure sizing, print aspect ratios, colors, and graphics with real-time vector preview</p>
        </div>
      </div>

      <div className="container">
        <div className="customize-layout">
          {/* LEFT: Live Interactive SVG Preview */}
          <div className="customize-preview">
            <div className="customize-preview__sticky">
              <div className="customize-preview__canvas">
                <TShirtMockup
                  colour={tshirtColour}
                  colourHex={colourData?.hex || '#FFFFFF'}
                  printLocation={printLocation}
                  printRatio={printRatio}
                  graphicDesignName={selectedDesign?.name || ''}
                  graphicText={customText}
                  graphicTextColor={textColour}
                  customImage={uploadedPreview}
                  scale={printScale}
                  showPrintArea={true}
                />
              </div>
              <div className="customize-preview__info">
                <span className="badge badge-green">Live 2D Canvas</span>
                <p>Colour: <strong>{colourData?.name}</strong> • Size: <strong>{size} ({sizeCategory.toUpperCase()})</strong> • Ratio: <strong>{printRatio}</strong></p>
              </div>
            </div>
          </div>

          {/* CENTER: Studio Controls */}
          <div className="customize-controls">
            {/* T-shirt Colour */}
            <div className="customize-control-group">
              <h3 className="customize-control-label">1. Choose T-Shirt Colour</h3>
              <div className="customize-colour-grid">
                {TSHIRT_COLOURS.map(col => (
                  <button
                    key={col.id}
                    className={`customize-colour-btn ${tshirtColour === col.id ? 'active' : ''}`}
                    style={{ backgroundColor: col.hex }}
                    onClick={() => setTshirtColour(col.id)}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Category & Size Selection */}
            <div className="customize-control-group">
              <div className="flex justify-between items-center mb-2">
                <h3 className="customize-control-label mb-0">2. Select Garment Size</h3>
                <div className="size-category-toggle flex gap-1 bg-cream p-1 rounded-lg">
                  <button
                    className={`chip ${sizeCategory === 'adult' ? 'active' : ''}`}
                    style={{ fontSize: '11px', padding: '2px 10px' }}
                    onClick={() => { setSizeCategory('adult'); setSize('M'); }}
                  >
                    Adult Sizes
                  </button>
                  <button
                    className={`chip ${sizeCategory === 'kids' ? 'active' : ''}`}
                    style={{ fontSize: '11px', padding: '2px 10px' }}
                    onClick={() => { setSizeCategory('kids'); setSize('6-7Y'); }}
                  >
                    Kids Sizes (2-13Y)
                  </button>
                </div>
              </div>

              <div className="customize-size-grid">
                {availableSizes.map(s => (
                  <button
                    key={s}
                    className={`pdp__size-btn ${size === s ? 'active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Placement */}
            <div className="customize-control-group">
              <h3 className="customize-control-label">3. Print Placement</h3>
              <div className="customize-print-grid">
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

            {/* Print Aspect Ratio Selection */}
            <div className="customize-control-group">
              <h3 className="customize-control-label flex items-center gap-2">
                <Crop size={16} /> 4. Print Aspect Ratio & Dimensions
              </h3>
              <div className="customize-ratios-grid grid grid-3 gap-2">
                {PRINT_RATIOS.map(r => (
                  <button
                    key={r.id}
                    className={`pdp__print-loc ${printRatio === r.id ? 'active' : ''}`}
                    onClick={() => setPrintRatio(r.id)}
                    style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '10px' }}
                  >
                    <span className="font-bold text-xs">{r.icon} {r.name}</span>
                    <span className="text-xs text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>{r.dims}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Source Tabs */}
            <div className="customize-control-group">
              <h3 className="customize-control-label">5. Artwork & Customization</h3>
              <div className="customize-panel-tabs">
                {panels.map(p => (
                  <button
                    key={p.id}
                    className={`customize-panel-tab ${activePanel === p.id ? 'active' : ''}`}
                    onClick={() => setActivePanel(p.id)}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              {/* Design Panel */}
              {activePanel === 'design' && (
                <div className="customize-design-panel">
                  <p className="text-muted mb-4" style={{fontSize:'var(--text-sm)'}}>Select an official ScreenArts Onam design:</p>
                  <div className="customize-design-grid">
                    {designs.map(d => (
                      <button
                        key={d.id}
                        className={`customize-design-item ${selectedDesign?.id === d.id ? 'active' : ''}`}
                        onClick={() => { setSelectedDesign(d); setUploadedFile(null); setUploadedPreview(null); }}
                      >
                        <span className="customize-design-item__emoji">{d.preview}</span>
                        <span className="customize-design-item__name">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Panel */}
              {activePanel === 'text' && (
                <div className="customize-text-panel">
                  <label className="label">Custom Text / Slogan (Malayalam or English)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., ഹാപ്പി ഓണം / Onam Vibes"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    maxLength={45}
                  />
                  <label className="label mt-4">Print Text Colour</label>
                  <div className="customize-text-colours">
                    {['#1A1A2E', '#FFFFFF', '#2D6A4F', '#D4A843', '#E8772E', '#7B2D3B'].map(c => (
                      <button
                        key={c}
                        className={`colour-dot ${textColour === c ? 'active' : ''}`}
                        style={{ backgroundColor: c, width: 32, height: 32 }}
                        onClick={() => setTextColour(c)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Panel */}
              {activePanel === 'upload' && (
                <div className="customize-upload-panel">
                  <div
                    className="customize-upload-dropzone"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} />
                    <p>Drag & drop your design here</p>
                    <span>Supports high-resolution PNG, JPG or PDF</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {uploadedFile && (
                    <div className="customize-uploaded-file mt-3">
                      <span>📁 {uploadedFile.name} ({uploadedFile.size})</span>
                      <button onClick={() => { setUploadedFile(null); setUploadedPreview(null); }}><X size={16} /></button>
                    </div>
                  )}
                  
                  <div className="customize-need-help mt-4 p-4" style={{ background: '#FFFDF7', border: '1px dashed #D4A843', borderRadius: '16px' }}>
                    <p className="font-semibold text-charcoal">Need a Custom Design? We can create it for you.</p>
                    <p className="text-sm text-muted mt-1">Our in-house ScreenArts designers in Calicut will draft your concept.</p>
                    <button
                      className={`btn ${isRequestDesign ? 'btn-gold' : 'btn-outline'} btn-sm mt-3`}
                      onClick={() => setIsRequestDesign(!isRequestDesign)}
                    >
                      <PenTool size={16} /> {isRequestDesign ? '✓ Requested ScreenArts Designer (+₹250)' : 'Request a Custom Design (+₹250)'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Print Scale Adjustment */}
            <div className="customize-control-group">
              <h3 className="customize-control-label">6. Scale & Adjust Print Size</h3>
              <div className="customize-scale-row">
                <span>Scale:</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.1"
                  value={printScale}
                  onChange={e => setPrintScale(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span>{Math.round(printScale * 100)}%</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="customize-control-group">
              <h3 className="customize-control-label">7. Quantity</h3>
              <div className="qty-selector">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}><Minus size={16} /></button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="customize-summary">
            <div className="customize-summary__sticky">
              <div className="customize-summary__card">
                <h3 className="customize-summary__title">Order Summary</h3>
                <div className="customize-summary__rows">
                  <div className="customize-summary__row">
                    <span>Premium Cotton Tee ({colourData?.name})</span>
                    <span>{formatPrice(TSHIRT_BASE_PRICE)}</span>
                  </div>
                  <div className="customize-summary__row">
                    <span>Garment Size</span>
                    <span>{size} ({sizeCategory.toUpperCase()})</span>
                  </div>
                  <div className="customize-summary__row">
                    <span>Screen Print Ratio</span>
                    <span>{printRatio} ({ratioData?.dims.split(' ')[0]})</span>
                  </div>
                  <div className="customize-summary__row">
                    <span>Screen Printing Location</span>
                    <span>{PRINT_LOCATIONS.find(l => l.id === printLocation)?.name}</span>
                  </div>
                  {isRequestDesign && (
                    <div className="customize-summary__row">
                      <span>ScreenArts Design Setup Fee</span>
                      <span>{formatPrice(250)}</span>
                    </div>
                  )}
                  <div className="customize-summary__row">
                    <span>Quantity</span>
                    <span>×{quantity}</span>
                  </div>
                  <div className="divider" />
                  <div className="customize-summary__row customize-summary__total">
                    <span>Estimated Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="trust-mini-notes mt-4">
                  <p>✓ Printed at ScreenArts Calicut Studio</p>
                  <p>✓ 100% Super-combed cotton</p>
                  <p>✓ Express delivery before Thiruvonam</p>
                </div>

                <button className="btn btn-primary btn-lg mt-4" style={{width:'100%'}} onClick={handleAddToCart}>
                  Continue to Checkout — {formatPrice(totalPrice)} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
