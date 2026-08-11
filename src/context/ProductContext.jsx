import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts, CATEGORIES as initialCategories, designs as initialDesigns } from '../data/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
      return initialProducts;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
      return initialCategories;
    }
  });

  const [designs, setDesigns] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_designs');
      return saved ? JSON.parse(saved) : initialDesigns;
    } catch (e) {
      console.error('Failed to load designs from localStorage', e);
      return initialDesigns;
    }
  });

  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('screenarts_announcement') ||
      '🌼 ONAM SPECIAL — Custom T-Shirts Starting From ₹399 | Free Delivery on Orders Above ₹999';
  });

  const [studioPickupOpen, setStudioPickupOpen] = useState(() => {
    const saved = localStorage.getItem('screenarts_pickup');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('screenarts_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('screenarts_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('screenarts_designs', JSON.stringify(designs));
  }, [designs]);

  useEffect(() => {
    localStorage.setItem('screenarts_announcement', announcementText);
  }, [announcementText]);

  useEffect(() => {
    localStorage.setItem('screenarts_pickup', JSON.stringify(studioPickupOpen));
  }, [studioPickupOpen]);

  // Listen for cross-tab updates (Instant Sync when multi-tab open)
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'screenarts_products' && e.newValue) {
          setProducts(JSON.parse(e.newValue));
        }
        if (e.key === 'screenarts_categories' && e.newValue) {
          setCategories(JSON.parse(e.newValue));
        }
        if (e.key === 'screenarts_designs' && e.newValue) {
          setDesigns(JSON.parse(e.newValue));
        }
        if (e.key === 'screenarts_announcement' && e.newValue !== null) {
          setAnnouncementText(e.newValue);
        }
        if (e.key === 'screenarts_pickup' && e.newValue !== null) {
          setStudioPickupOpen(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Product CRUD operations
  const addProduct = (newProdData) => {
    const id = newProdData.id || `custom-prod-${Date.now()}`;
    const slug = newProdData.slug || newProdData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = {
      ...newProdData,
      id,
      slug,
      rating: newProdData.rating || 5.0,
      reviewsCount: newProdData.reviewsCount || 1,
      inStock: newProdData.inStock !== undefined ? newProdData.inStock : true,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updatedFields } : prod))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const toggleProductBadge = (id, badgeKey) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, [badgeKey]: !prod[badgeKey] } : prod
      )
    );
  };

  // Category CRUD
  const addCategory = (catData) => {
    const id = catData.id || `cat-${Date.now()}`;
    const slug = catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = { ...catData, id, slug };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Reset to default seed data
  const resetToDefaults = () => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setDesigns(initialDesigns);
    setAnnouncementText('🌼 ONAM SPECIAL — Custom T-Shirts Starting From ₹399 | Free Delivery on Orders Above ₹999');
    setStudioPickupOpen(true);
    localStorage.removeItem('screenarts_products');
    localStorage.removeItem('screenarts_categories');
    localStorage.removeItem('screenarts_designs');
    localStorage.removeItem('screenarts_announcement');
    localStorage.removeItem('screenarts_pickup');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        designs,
        announcementText,
        studioPickupOpen,
        setProducts,
        setCategories,
        setDesigns,
        setAnnouncementText,
        setStudioPickupOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductBadge,
        addCategory,
        deleteCategory,
        resetToDefaults,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
