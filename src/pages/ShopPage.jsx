import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3x3, LayoutList, Grid2x2, Sparkles } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { useProducts } from '../context/ProductContext';
import './ShopPage.css';

export default function ShopPage() {
  const { products, categories } = useProducts();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || 'all';
  const [activeCategory, setActiveCategory] = useState(catParam);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState(4); // 4 = 4-col 4:5 fashion ratio, 3 = 3-col 3:4 ratio, 2 = 2-col large ratio

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.isActive !== false);
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => Array.isArray(p.category) ? p.category.includes(activeCategory) : p.category === activeCategory);
    }
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
    return filtered;
  }, [products, activeCategory, sortBy]);

  return (
    <div className="shop-page page-enter">
      {/* Hero */}
      <div className="shop-hero">
        <div className="container">
          <span className="badge badge-gold">SCREENARTS ONAM 2026</span>
          <h1 className="heading-1 mt-2">Onam T-Shirt Collection</h1>
          <p className="subheading mt-2">Fresh designs inspired by Kerala. Custom printed in Calicut.</p>
        </div>
      </div>

      <div className="container">
        {/* Filters & Grid Ratio Bar */}
        <div className="shop-toolbar">
          <div className="shop-categories">
            <button
              className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Designs
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`chip ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="shop-controls-right flex items-center gap-3">
            {/* Grid Ratio Switcher */}
            <div className="grid-ratio-switcher hide-mobile">
              <button
                className={`ratio-btn ${gridCols === 4 ? 'active' : ''}`}
                onClick={() => setGridCols(4)}
                title="4-Column 4:5 Fashion Ratio"
              >
                <Grid3x3 size={16} /> <span>4:5</span>
              </button>
              <button
                className={`ratio-btn ${gridCols === 3 ? 'active' : ''}`}
                onClick={() => setGridCols(3)}
                title="3-Column 3:4 Classic Ratio"
              >
                <Grid2x2 size={16} /> <span>3:4</span>
              </button>
              <button
                className={`ratio-btn ${gridCols === 2 ? 'active' : ''}`}
                onClick={() => setGridCols(2)}
                title="2-Column Large Ratio"
              >
                <LayoutList size={16} /> <span>Large</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="shop-sort">
              <SlidersHorizontal size={16} />
              <select className="shop-sort__select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="featured">Featured Onam Designs</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-4">
          <p className="shop-results-count mb-0">{filteredProducts.length} Onam designs found</p>
          <span className="text-xs text-muted">Showing 4:5 Fashion Aspect Ratio Mockups</span>
        </div>

        {/* Product Grid */}
        <div className={`grid shop-grid ${gridCols === 4 ? 'grid-4' : gridCols === 3 ? 'grid-3' : 'grid-2'}`}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="shop-empty">
            <p>No designs found in this category.</p>
            <button className="btn btn-outline mt-4" onClick={() => setActiveCategory('all')}>
              View All Designs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
