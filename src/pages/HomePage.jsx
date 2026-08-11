import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Palette, PenTool, Package, CheckCircle, Star, Users, Sparkles, Zap, Gift } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ProductCard from '../components/product/ProductCard';
import TShirtMockup from '../components/product/TShirtMockup';
import { designs, DESIGN_FILTERS, BULK_PRICING, formatPrice } from '../data/products';
import { useProducts } from '../context/ProductContext';
import './HomePage.css';

function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}s` } : {}}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="home page-enter">
      <HeroSection />
      <CategorySection />
      <CollectionSection />
      <CustomizationSection />
      <ThreeWaysSection />
      <DesignGallerySection />
      <FamilySection />
      <HowItWorksSection />
      <BulkOrdersSection />
      <TrustSection />
    </div>
  );
}

/* ═══ HERO ═══ */
function HeroSection() {
  return (
    <section className="hero">
      {/* Animated Pookalam Background Accents */}
      <div className="hero__pookalam hero__pookalam--1"></div>
      <div className="hero__pookalam hero__pookalam--2"></div>
      <div className="hero__pookalam hero__pookalam--3"></div>

      <div className="container hero__container">
        <div className="hero__content">
          <span className="section-label">ScreenArts Onam Campaign</span>
          <h1 className="heading-hero hero__title">
            THIS ONAM,<br />
            <span className="hero__title-accent">WEAR YOUR STORY.</span>
          </h1>
          <p className="hero__subtitle">
            Custom Onam T-shirts made for you, your family, your friends and your team.
          </p>
          <div className="hero__ctas">
            <Link to="/customize" className="btn btn-primary btn-lg">
              <Palette size={20} /> Design Your Shirt
            </Link>
            <Link to="/shop" className="btn btn-outline btn-lg">
              Shop Onam Collection <ArrowRight size={18} />
            </Link>
          </div>

          {/* Floating Feature Badges */}
          <div className="hero__labels">
            <span className="hero__label hero__label--1 badge badge-white">✨ Custom Prints</span>
            <span className="hero__label hero__label--2 badge badge-white">🌴 Kerala Designs</span>
            <span className="hero__label hero__label--3 badge badge-white">🖨️ Made by ScreenArts</span>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__image-card">
            <img
              src="/images/hero-lifestyle.png"
              alt="ScreenArts Onam Lifestyle T-Shirt Collection"
              className="hero__lifestyle-img"
            />
            <div className="hero__visual-badge badge badge-gold">
              <Star size={14} /> ScreenArts Calicut Studio
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ CATEGORIES ═══ */
function CategorySection() {
  const { categories } = useProducts();
  const categoryImages = {
    men: '/images/hero-lifestyle.png',
    women: '/images/custom-flatlay.png',
    kids: '/images/family-lifestyle.png',
    couples: '/images/hero-lifestyle.png',
    family: '/images/family-lifestyle.png',
    college: '/images/custom-flatlay.png',
  };
  
  return (
    <section className="section section-cream">
      <div className="container">
        <RevealSection>
          <div className="text-center mb-8">
            <span className="section-label">Shop by Category</span>
            <h2 className="heading-2 mt-2">Who are you celebrating with?</h2>
          </div>
        </RevealSection>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <RevealSection key={cat.id || cat.slug || i} delay={i * 0.1}>
              <Link to={`/shop?cat=${cat.slug}`} className="category-card">
                <div className="category-card__image">
                  <img
                    src={categoryImages[cat.slug] || '/images/hero-lifestyle.png'}
                    alt={cat.name}
                    className="category-card__img"
                  />
                  <div className="category-card__img-overlay"></div>
                </div>
                <div className="category-card__overlay">
                  <h3 className="category-card__name">{cat.name}</h3>
                  <p className="category-card__tagline">{cat.tagline}</p>
                  <span className="category-card__arrow"><ArrowRight size={20} /></span>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ COLLECTION ═══ */
function CollectionSection() {
  const { products } = useProducts();
  const activeProducts = products.filter(p => p.isActive !== false);
  return (
    <section className="section">
      <div className="container">
        <RevealSection>
          <div className="text-center mb-8">
            <span className="section-label">Onam Collection</span>
            <h2 className="heading-2 mt-2">Made for Onam</h2>
            <p className="subheading mt-2">Fresh designs inspired by Kerala.</p>
          </div>
        </RevealSection>

        <div className="grid grid-5 products-grid">
          {activeProducts.slice(0, 10).map((product, i) => (
            <RevealSection key={product.id} delay={i * 0.05}>
              <ProductCard product={product} />
            </RevealSection>
          ))}
        </div>

        <RevealSection>
          <div className="text-center mt-8">
            <Link to="/shop" className="btn btn-outline btn-lg">
              View All {activeProducts.length} Onam Designs <ArrowRight size={18} />
            </Link>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ═══ CUSTOMIZATION ═══ */
function CustomizationSection() {
  const [selectedColor, setSelectedColor] = useState('white');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  return (
    <section className="section-lg section-cream">
      <div className="container">
        <div className="customize-section">
          <RevealSection className="customize-section__content">
            <span className="section-label">Custom Printing</span>
            <h2 className="heading-1 mt-2">Got Your Own Design?</h2>
            <p className="subheading mt-3">Upload it. We print it. You wear it.</p>

            <div className="customize-steps">
              {[
                { num: '01', label: 'Choose your T-shirt' },
                { num: '02', label: 'Upload your design' },
                { num: '03', label: 'Position your print' },
                { num: '04', label: 'Preview' },
                { num: '05', label: 'Order' },
              ].map(step => (
                <div key={step.num} className="customize-step">
                  <span className="customize-step__num">{step.num}</span>
                  <span className="customize-step__label">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="customize-ctas mt-6">
              <Link to="/customize" className="btn btn-primary btn-lg">
                <Palette size={20} /> Start Customizing
              </Link>
            </div>

            <div className="customize-need-design mt-6">
              <p className="text-muted">Need a design? We can create it for you.</p>
              <Link to="/customize?requestDesign=true" className="btn btn-gold btn-sm mt-2">
                <PenTool size={16} /> Get a Design
              </Link>
            </div>
          </RevealSection>

          <RevealSection className="customize-section__visual" delay={0.2}>
            <div className="customize-tshirt-card">
              <div className="customize-tshirt-preview__shirt">
                <TShirtMockup
                  colour={selectedColor}
                  colourHex={selectedColor === 'white' ? '#FFFFFF' : selectedColor === 'green' ? '#2D6A4F' : selectedColor === 'cream' ? '#FDF5E6' : '#1A1A2E'}
                  customImage={uploadedFile}
                  graphicDesignName={uploadedFile ? '' : 'YOUR ARTWORK HERE'}
                  showPrintArea={true}
                />
              </div>

              <div className="customize-color-row">
                <span>Color:</span>
                {['white', 'cream', 'green', 'black'].map(c => (
                  <button
                    key={c}
                    className={`colour-dot ${selectedColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: c === 'white' ? '#FFF' : c === 'cream' ? '#FDF5E6' : c === 'green' ? '#2D6A4F' : '#1A1A2E' }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>

              <label className="customize-upload-zone">
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                <Upload size={24} />
                <p>{uploadedFile ? '✅ Artwork Uploaded! Click to change' : 'Drag & drop your design here'}</p>
                <span>PNG, JPG or PDF</span>
              </label>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ═══ THREE WAYS TO ORDER ═══ */
function ThreeWaysSection() {
  const ways = [
    {
      icon: <Upload size={28} />,
      title: 'PRINT ONLY',
      desc: 'You already have the final design. Send it to us and we\'ll print it.',
      cta: 'Upload Design',
      link: '/customize?mode=print-only',
      featured: false,
    },
    {
      icon: <Package size={28} />,
      title: 'PRINT + SETUP',
      desc: 'Your design is ready. We\'ll handle the print settings and production setup.',
      cta: 'Choose This',
      link: '/customize?mode=setup',
      featured: false,
    },
    {
      icon: <PenTool size={28} />,
      title: 'FULL DESIGN',
      desc: 'Have an idea but no design? Tell us what you want and our design team will create it.',
      cta: 'Request a Design',
      link: '/customize?mode=request-design',
      featured: true,
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <RevealSection>
          <div className="text-center mb-8">
            <span className="section-label">How to Order</span>
            <h2 className="heading-2 mt-2">Three Ways to Get Your T-Shirt</h2>
          </div>
        </RevealSection>

        <div className="three-ways-grid">
          {ways.map((way, i) => (
            <RevealSection key={i} delay={i * 0.15}>
              <div className={`three-ways-card ${way.featured ? 'three-ways-card--featured' : ''}`}>
                {way.featured && <span className="three-ways-card__popular badge badge-gold">⭐ Most Popular</span>}
                <div className="three-ways-card__icon">{way.icon}</div>
                <h3 className="three-ways-card__title">{way.title}</h3>
                <p className="three-ways-card__desc">{way.desc}</p>
                <Link to={way.link} className={`btn ${way.featured ? 'btn-gold' : 'btn-outline'} btn-lg`} style={{width:'100%'}}>
                  {way.cta} <ArrowRight size={16} />
                </Link>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ DESIGN GALLERY PREVIEW ═══ */
function DesignGallerySection() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredDesigns = activeFilter === 'All'
    ? designs
    : designs.filter(d => d.tags.includes(activeFilter));

  return (
    <section className="section section-cream">
      <div className="container">
        <RevealSection>
          <div className="text-center mb-6">
            <span className="section-label">Design Gallery</span>
            <h2 className="heading-2 mt-2">Pick a Design. Make It Yours.</h2>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="design-filters">
            {DESIGN_FILTERS.map((f) => (
              <button
                key={f}
                className={`chip ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </RevealSection>

        <div className="scroll-container mt-6 design-scroll">
          {filteredDesigns.map((design) => (
            <div key={design.id} className="scroll-item design-card">
              <div className="design-card__preview">
                <span className="design-card__emoji">{design.preview}</span>
              </div>
              <h4 className="design-card__name">{design.name}</h4>
              <div className="design-card__tags">
                {design.tags.slice(0, 2).map(t => (
                  <span key={t} className="badge badge-green">{t}</span>
                ))}
              </div>
              <Link to={`/customize?design=${encodeURIComponent(design.name)}`} className="btn btn-sm btn-secondary mt-2" style={{width:'100%'}}>
                Customize
              </Link>
            </div>
          ))}
        </div>

        <RevealSection>
          <div className="text-center mt-6">
            <Link to="/designs" className="btn btn-outline btn-lg">
              Explore Full Gallery ({designs.length} Designs) <ArrowRight size={18} />
            </Link>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ═══ FAMILY / GROUP ═══ */
function FamilySection() {
  const groups = [
    { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
    { emoji: '👫', label: 'Friends' },
    { emoji: '🎓', label: 'College' },
    { emoji: '🏢', label: 'Office' },
    { emoji: '🎉', label: 'Events' },
  ];

  return (
    <section className="family-section">
      <div className="container">
        <div className="family-section__inner">
          <RevealSection className="family-section__content">
            <span className="section-label text-white" style={{color:'var(--kasavu-gold-light)'}}>Family & Groups</span>
            <h2 className="heading-1 text-white mt-2">
              One Family.<br />
              One Onam.<br />
              <span style={{color:'var(--kasavu-gold-light)'}}>One Look.</span>
            </h2>
            <p className="mt-4" style={{color:'rgba(255,255,255,0.85)', maxWidth:'440px', fontSize:'var(--text-lg)'}}>
              Coordinated Onam T-shirts for your family, college squad, office team or friend group. ScreenArts makes everyone look united!
            </p>

            <div className="family-groups mt-6">
              {groups.map(g => (
                <div key={g.label} className="family-group-chip">
                  <span>{g.emoji}</span>
                  <span>{g.label}</span>
                </div>
              ))}
            </div>

            <Link to="/shop?cat=family" className="btn btn-gold btn-lg mt-6">
              <Users size={20} /> Create Family T-Shirts
            </Link>
          </RevealSection>

          <RevealSection className="family-section__visual" delay={0.2}>
            <div className="family-photo-card">
              <img
                src="/images/family-lifestyle.png"
                alt="Kerala Family wearing coordinated ScreenArts Onam T-Shirts"
                className="family-photo-img"
              />
              <div className="family-photo-badge badge badge-green">
                🌼 Kerala Family Onam Edition
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ═══ HOW IT WORKS ═══ */
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Choose a design', desc: 'Pick from our collection or upload your own', icon: <Sparkles size={28} /> },
    { num: '02', title: 'Customize', desc: 'Choose colour, size, placement and more', icon: <Palette size={28} /> },
    { num: '03', title: 'We print', desc: 'Premium printing at our Calicut studio', icon: <Zap size={28} /> },
    { num: '04', title: 'You celebrate', desc: 'Wear your custom Onam tee with pride', icon: <Gift size={28} /> },
  ];

  return (
    <section className="section">
      <div className="container">
        <RevealSection>
          <div className="text-center mb-8">
            <span className="section-label">How It Works</span>
            <h2 className="heading-2 mt-2">Four Simple Steps</h2>
          </div>
        </RevealSection>

        <div className="how-it-works-grid">
          {steps.map((step, i) => (
            <RevealSection key={i} delay={i * 0.15}>
              <div className="how-step">
                <div className="how-step__icon">{step.icon}</div>
                <span className="how-step__num">{step.num}</span>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__desc">{step.desc}</p>
                {i < 3 && <div className="how-step__connector hide-mobile"></div>}
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ BULK ORDERS TEASER ═══ */
function BulkOrdersSection() {
  return (
    <section className="section section-cream">
      <div className="container">
        <div className="bulk-section">
          <RevealSection className="bulk-section__content">
            <span className="section-label">Bulk Orders</span>
            <h2 className="heading-2 mt-2">Planning Onam for a Crowd?</h2>
            <p className="subheading mt-3">
              Special tiered rates for college groups, companies, schools, friends, families, associations and events.
            </p>

            <div className="bulk-pricing-mini mt-6">
              {BULK_PRICING.map((tier, i) => (
                <div key={i} className="bulk-pricing-chip">
                  <span className="bulk-pricing-chip__qty">{tier.label}</span>
                  <span className="bulk-pricing-chip__price">{formatPrice(tier.price)}/pc</span>
                </div>
              ))}
            </div>

            <Link to="/bulk-orders" className="btn btn-secondary btn-lg mt-6">
              <Package size={20} /> Get Bulk Quote
            </Link>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

/* ═══ TRUST ═══ */
function TrustSection() {
  const points = [
    'Quality printing',
    'Multiple T-shirt colours',
    'Custom designs',
    'Bulk orders',
    'Local pickup in Calicut',
    'Delivery options across India',
  ];

  return (
    <section className="trust-section">
      <div className="container">
        <RevealSection>
          <div className="trust-header text-center">
            <span className="section-label">Why Choose ScreenArts</span>
            <h2 className="heading-2 mt-2">Printed by ScreenArts, Calicut</h2>
            <p className="text-muted mt-2">Crafted with passion right here in Kerala.</p>
          </div>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="trust-grid">
            {points.map((p, i) => (
              <div key={i} className="trust-card">
                <CheckCircle size={22} className="trust-icon" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
