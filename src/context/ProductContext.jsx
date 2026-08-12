import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as initialProducts, CATEGORIES as initialCategories, designs as initialDesigns } from '../data/products';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export function mapSupabaseToProduct(p) {
  return {
    id: p.id || p.slug,
    _id: p.id,
    name: p.name || 'Untitled Product',
    slug: p.slug || p.id,
    price: Number(p.price || 0),
    originalPrice: Number(p.original_price || p.price || 0),
    description: p.description || '',
    category: Array.isArray(p.category) ? p.category : [p.category || 'men'],
    tags: Array.isArray(p.tags) ? p.tags : [],
    colours: Array.isArray(p.colours) ? p.colours : ['white'],
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
    sizeType: p.size_type || 'adult',
    printLocation: p.print_location || 'front',
    printRatio: p.print_ratio || '4:5',
    imageType: p.image_type || 'vector',
    images: typeof p.images === 'object' && p.images !== null ? p.images : { front: p.imageUrl || '/images/custom-flatlay.png' },
    imageUrl: typeof p.images === 'object' && p.images?.front ? p.images.front : (p.imageUrl || '/images/custom-flatlay.png'),
    isNew: Boolean(p.is_new),
    isBestseller: Boolean(p.is_bestseller),
    inStock: p.in_stock !== false,
    isActive: p.is_active !== false,
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviews_count || 1),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export function mapProductToSupabase(p) {
  const id = String(p.id || p._id || `prod-${Date.now()}`);
  const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id,
    name: p.name,
    slug,
    price: Number(p.price || 0),
    original_price: Number(p.originalPrice || p.price || 0),
    description: p.description || '',
    category: Array.isArray(p.category) ? p.category : [p.category || 'men'],
    tags: Array.isArray(p.tags) ? p.tags : [],
    colours: Array.isArray(p.colours) ? p.colours : ['white'],
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
    size_type: p.sizeType || 'adult',
    print_location: p.printLocation || 'front',
    print_ratio: p.printRatio || '4:5',
    image_type: p.imageType || 'vector',
    images: p.images || { front: p.imageUrl || '/images/custom-flatlay.png' },
    is_new: Boolean(p.isNew),
    is_bestseller: Boolean(p.isBestseller),
    in_stock: p.inStock !== false,
    is_active: p.isActive !== false,
    rating: Number(p.rating || 5.0),
    reviews_count: Number(p.reviewsCount || 1),
    updated_at: new Date().toISOString(),
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch (e) {
      return initialProducts;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch (e) {
      return initialCategories;
    }
  });

  const [designs, setDesigns] = useState(() => {
    try {
      const saved = localStorage.getItem('screenarts_designs');
      return saved ? JSON.parse(saved) : initialDesigns;
    } catch (e) {
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

  const [isLoadingDB, setIsLoadingDB] = useState(false);

  // Upload image to Supabase Storage bucket 'product-images'
  const uploadProductImage = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Notice uploading to product-images storage:', error.message);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicData?.publicUrl || null;
    } catch (err) {
      console.warn('Storage upload error:', err.message);
      return null;
    }
  };

  // Seed Supabase with initial product dataset if empty or uninitialized
  const seedSupabaseIfNeeded = async () => {
    try {
      const recordsToSeed = initialProducts.map(mapProductToSupabase);
      const { error } = await supabase.from('products').upsert(recordsToSeed);
      if (!error) {
        console.log('Initialized and seeded Supabase products table successfully.');
      }
    } catch (err) {
      console.warn('Supabase auto-seed notice:', err.message);
    }
  };

  // Primary Database Fetch: Load Products directly from Supabase
  const fetchFromDatabase = useCallback(async () => {
    setIsLoadingDB(true);
    try {
      // 1. Fetch products from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(mapSupabaseToProduct);
        setProducts(formatted);
        localStorage.setItem('screenarts_products', JSON.stringify(formatted));
      } else if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
        await seedSupabaseIfNeeded();
      } else if (!data || data.length === 0) {
        await seedSupabaseIfNeeded();
      }

      // 2. Fetch Categories from Supabase
      try {
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!catErr && Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
          localStorage.setItem('screenarts_categories', JSON.stringify(catData));
        }
      } catch (catErr) {}
    } catch (err) {
      console.error('Supabase fetch error:', err.message);
    } finally {
      setIsLoadingDB(false);
    }
  }, []);

  useEffect(() => {
    fetchFromDatabase();
  }, [fetchFromDatabase]);

  // Subscribe to Supabase Realtime changes on products table
  useEffect(() => {
    let subscription;
    try {
      subscription = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchFromDatabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription notice:', err.message);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchFromDatabase]);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('screenarts_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('screenarts_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('screenarts_announcement', announcementText);
  }, [announcementText]);

  useEffect(() => {
    localStorage.setItem('screenarts_pickup', JSON.stringify(studioPickupOpen));
  }, [studioPickupOpen]);

  // Listen for cross-tab storage updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'screenarts_products' && e.newValue) {
          setProducts(JSON.parse(e.newValue));
        }
        if (e.key === 'screenarts_categories' && e.newValue) {
          setCategories(JSON.parse(e.newValue));
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

  // Real Database CREATE (INSERT) in Supabase
  const addProduct = async (newProdData) => {
    const id = String(newProdData.id || `prod-${Date.now()}`);
    const slug = newProdData.slug || newProdData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const formattedProduct = {
      ...newProdData,
      id,
      slug,
      rating: newProdData.rating || 5.0,
      reviewsCount: newProdData.reviewsCount || 1,
      inStock: newProdData.inStock !== undefined ? newProdData.inStock : true,
      isActive: newProdData.isActive !== undefined ? newProdData.isActive : true,
    };

    setProducts((prev) => [formattedProduct, ...prev.filter(p => p.id !== id && p.slug !== slug)]);

    try {
      const dbPayload = mapProductToSupabase(formattedProduct);
      const { error } = await supabase.from('products').upsert([dbPayload]);
      if (error) {
        console.warn('Notice saving product to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Supabase INSERT notice:', err.message);
    }

    return formattedProduct;
  };

  // Real Database UPDATE in Supabase
  const updateProduct = async (id, updatedFields) => {
    let updatedProduct;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === id || prod._id === id || prod.slug === id) {
          updatedProduct = { ...prod, ...updatedFields };
          return updatedProduct;
        }
        return prod;
      })
    );

    try {
      const existing = products.find(p => p.id === id || p._id === id || p.slug === id) || {};
      const merged = { ...existing, ...updatedFields, id: existing.id || id };
      const dbPayload = mapProductToSupabase(merged);

      const { error } = await supabase
        .from('products')
        .upsert([dbPayload]);

      if (error) {
        console.warn('Notice updating product in Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Supabase UPDATE notice:', err.message);
    }
  };

  // Real Database DELETE in Supabase
  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id && prod._id !== id && prod.slug !== id));

    try {
      await supabase
        .from('products')
        .delete()
        .or(`id.eq.${id},slug.eq.${id}`);
    } catch (err) {
      console.warn('Supabase DELETE notice:', err.message);
    }
  };

  // Toggle Active/Inactive Status in Supabase
  const toggleProductStatus = async (id) => {
    const target = products.find(p => p.id === id || p._id === id || p.slug === id);
    if (target) {
      const newStatus = !(target.isActive !== false);
      await updateProduct(id, { isActive: newStatus });
      return newStatus;
    }
    return true;
  };

  // Toggle Badge in Supabase
  const toggleProductBadge = (id, badgeKey) => {
    const target = products.find(p => p.id === id || p._id === id || p.slug === id);
    if (target) {
      const newValue = !target[badgeKey];
      updateProduct(id, { [badgeKey]: newValue });
    }
  };

  // Category CRUD Operations
  const addCategory = async (catData) => {
    const id = catData.id || `cat-${Date.now()}`;
    const slug = catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = { ...catData, id, slug };

    setCategories((prev) => [...prev, newCat]);

    try {
      await supabase.from('categories').upsert([newCat]);
    } catch (err) {}

    return newCat;
  };

  const deleteCategory = async (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id && cat.slug !== id));

    try {
      await supabase.from('categories').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch (err) {}
  };

  // Reset to Default Seed Data in Supabase
  const resetToDefaults = async () => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setDesigns(initialDesigns);
    setAnnouncementText('🌼 ONAM SPECIAL — Custom T-Shirts Starting From ₹399 | Free Delivery on Orders Above ₹999');
    setStudioPickupOpen(true);
    localStorage.removeItem('screenarts_products');
    localStorage.removeItem('screenarts_categories');
    localStorage.removeItem('screenarts_announcement');
    localStorage.removeItem('screenarts_pickup');

    try {
      await seedSupabaseIfNeeded();
    } catch (err) {}
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        designs,
        announcementText,
        studioPickupOpen,
        isLoadingDB,
        setProducts,
        setCategories,
        setDesigns,
        setAnnouncementText,
        setStudioPickupOpen,
        fetchFromDatabase,
        uploadProductImage,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
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
