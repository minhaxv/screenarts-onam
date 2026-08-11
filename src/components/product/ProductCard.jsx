import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, TSHIRT_COLOURS } from '../../data/products';
import TShirtMockup from './TShirtMockup';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, { colour: selectedColour, size: 'L' });
  };

  const colourObj = TSHIRT_COLOURS.find(c => c.id === selectedColour);
  const colourHex = colourObj?.hex || '#FFFFFF';

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mockup Canvas */}
        <div className="product-card__image-wrap">
          <div className="product-card__mockup-bg">
            <TShirtMockup
              colour={selectedColour}
              colourHex={colourHex}
              graphicDesignName={product.name}
              printLocation={product.printLocation || 'front'}
            />
          </div>

          {/* Badges */}
          <div className="product-card__badges">
            {product.isNew && <span className="badge badge-green">NEW</span>}
            {product.isBestseller && <span className="badge badge-gold">BESTSELLER</span>}
          </div>

          {/* Hover Actions */}
          <div className={`product-card__actions ${isHovered ? 'visible' : ''}`}>
            <button
              className="product-card__action-btn"
              title="Quick View"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
            >
              <Eye size={18} />
            </button>
            <button
              className="product-card__action-btn"
              title="Wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart size={18} />
            </button>
            <button
              className="product-card__action-btn product-card__action-btn--primary"
              title="Add to Cart"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
            </button>
          </div>

          {/* Discount Tag */}
          {product.originalPrice > product.price && (
            <span className="product-card__discount">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="product-card__info">
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__pricing">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="product-card__original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Colour Dots */}
          <div className="product-card__colours">
            {product.colours.slice(0, 5).map(colId => {
              const col = TSHIRT_COLOURS.find(c => c.id === colId);
              return (
                <button
                  key={colId}
                  className={`colour-dot ${selectedColour === colId ? 'active' : ''}`}
                  style={{ backgroundColor: col?.hex }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColour(colId);
                  }}
                  title={col?.name}
                />
              );
            })}
            {product.colours.length > 5 && (
              <span className="product-card__more-colours">+{product.colours.length - 5}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="quickview-modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close" onClick={() => setShowQuickView(false)}>✕</button>
            <div className="quickview-grid">
              <div className="quickview-mockup">
                <TShirtMockup
                  colour={selectedColour}
                  colourHex={colourHex}
                  graphicDesignName={product.name}
                />
              </div>
              <div className="quickview-details">
                <span className="badge badge-gold">SCREENARTS ONAM</span>
                <h2>{product.name}</h2>
                <p className="quickview-price">{formatPrice(product.price)} <del>{formatPrice(product.originalPrice)}</del></p>
                <p className="quickview-desc">{product.description}</p>

                <div className="quickview-section">
                  <label>Select Colour: <strong>{colourObj?.name}</strong></label>
                  <div className="colour-picker-row">
                    {product.colours.map(cId => {
                      const c = TSHIRT_COLOURS.find(tc => tc.id === cId);
                      return (
                        <button
                          key={cId}
                          className={`colour-dot ${selectedColour === cId ? 'active' : ''}`}
                          style={{ backgroundColor: c?.hex }}
                          onClick={() => setSelectedColour(cId)}
                          title={c?.name}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="quickview-actions">
                  <button className="btn btn-primary" onClick={handleAddToCart}>
                    <ShoppingBag size={18} /> Add to Cart — {formatPrice(product.price)}
                  </button>
                  <Link to={`/product/${product.slug}`} className="btn btn-secondary">
                    Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
