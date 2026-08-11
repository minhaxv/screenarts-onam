import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product by slug or ID
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ slug: req.params.slug }, { id: req.params.slug }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = new Product({ ...req.body, slug });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update product by ID or slug
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { slug: req.params.id }, { id: req.params.id }] },
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE product by ID or slug
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      $or: [{ _id: req.params.id }, { slug: req.params.id }, { id: req.params.id }],
    });
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
