import express from 'express';
import Product from '../models/Product.js';
import { supabase } from '../supabaseSync.js';

const router = express.Router();

function mapSupabaseToProduct(p) {
  return {
    id: p.id || p.slug,
    _id: p.id,
    name: p.name,
    slug: p.slug,
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

function mapProductToSupabase(p) {
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

// GET all products from Supabase (with MongoDB fallback)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      return res.json(data.map(mapSupabaseToProduct));
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product by slug or ID
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      return res.json(mapSupabaseToProduct(data[0]));
    }

    const product = await Product.findOne({
      $or: [{ slug: req.params.slug }, { id: req.params.slug }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new product in Supabase & MongoDB
router.post('/', async (req, res) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fullProduct = { ...req.body, slug };

    try {
      const dbPayload = mapProductToSupabase(fullProduct);
      await supabase.from('products').insert([dbPayload]);
    } catch (sbErr) {}

    try {
      const newProduct = new Product(fullProduct);
      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
    } catch (mgErr) {
      return res.status(201).json(fullProduct);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update product by ID or slug in Supabase & MongoDB
router.put('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    const dbPayload = mapProductToSupabase({ ...req.body, id: targetId });

    try {
      await supabase
        .from('products')
        .update(dbPayload)
        .or(`id.eq.${targetId},slug.eq.${targetId}`);
    } catch (sbErr) {}

    let updatedProduct;
    try {
      updatedProduct = await Product.findOneAndUpdate(
        { $or: [{ _id: targetId }, { slug: targetId }, { id: targetId }] },
        req.body,
        { new: true }
      );
    } catch (mgErr) {}

    res.json(updatedProduct || req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE product by ID or slug from Supabase & MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;

    try {
      await supabase
        .from('products')
        .delete()
        .or(`id.eq.${targetId},slug.eq.${targetId}`);
    } catch (sbErr) {}

    try {
      await Product.findOneAndDelete({
        $or: [{ _id: targetId }, { slug: targetId }, { id: targetId }],
      });
    } catch (mgErr) {}

    res.json({ message: 'Product deleted successfully', id: targetId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

