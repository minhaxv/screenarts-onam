import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ShoppingBag } from 'lucide-react';
import { designs, DESIGN_FILTERS, TSHIRT_COLOURS, SIZES, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import './DesignGalleryPage.css';

export default function DesignGalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [quickCustomize, setQuickCustomize] = useState({ colour: 'white', size: 'M', quantity: 1 });
  const { addItem } = useCart();

  const filtered = activeFilter === 'All'
    ? designs
    : designs.filter(d => d.tags.includes(activeFilter));

  const handleQuickAdd = (design) => {
    addItem(
      { id: `design-${design.id}`, name: design.name, price: 499, images: {} },
      { colour: quickCustomize.colour, size: quickCustomize.size, quantity: quickCustomize.quantity }
    );
  };

  return (
    <div className="gallery-page page-enter">
      <div className="gallery-hero">
        <div className="container text-center">
          <span className="section-label">Design Gallery</span>
          <h1 className="heading-1 mt-2">Pick a Design. Make It Yours.</h1>
          <p className="subheading mt-2">Choose from our Onam collection and customize it your way.</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="gallery-filters">
          {DESIGN_FILTERS.map(f => (
            <button
              key={f}
              className={`chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {filtered.map(design => (
            <div
              key={design.id}
              className={`gallery-card ${selectedDesign?.id === design.id ? 'selected' : ''}`}
              onClick={() => setSelectedDesign(design)}
            >
              <div className="gallery-card__preview">
                <span className="gallery-card__emoji">{design.preview}</span>
              </div>
              <div className="gallery-card__info">
                <h3 className="gallery-card__name">{design.name}</h3>
                <div className="gallery-card__tags">
                  {design.tags.map(t => (
                    <span key={t} className="badge badge-green">{t}</span>
                  ))}
                </div>
                <p className="gallery-card__price">From {formatPrice(499)}</p>
                <div className="gallery-card__ctas">
                  <Link to="/customize" className="btn btn-sm btn-secondary">
                    <Palette size={14} /> Customize
                  </Link>
                  <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); handleQuickAdd(design); }}>
                    <ShoppingBag size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="gallery-empty">
            <p>No designs found for this filter.</p>
            <button className="btn btn-outline mt-4" onClick={() => setActiveFilter('All')}>View All</button>
          </div>
        )}
      </div>
    </div>
  );
}
