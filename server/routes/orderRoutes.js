import express from 'express';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single order by orderNumber or ID
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { orderNumber: req.params.orderNumber.toUpperCase() },
        { phone: req.params.orderNumber },
        { _id: req.params.orderNumber.match(/^[0-9a-fA-F]{24}$/) ? req.params.orderNumber : null },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  try {
    const orderNumber = `ORD-${Math.floor(8000 + Math.random() * 1000)}`;
    const newOrder = new Order({
      ...req.body,
      orderNumber,
      workflow: req.body.workflow || 'PRINT_ONLY',
      status: 'Pending',
    });
    const saved = await newOrder.save();

    // Auto update/create customer record
    if (req.body.phone) {
      await Customer.findOneAndUpdate(
        { phone: req.body.phone },
        {
          name: req.body.customerName,
          phone: req.body.phone,
          email: req.body.email || '',
          address: req.body.deliveryAddress || '',
          pincode: req.body.pincode || '',
          $inc: { totalOrders: 1, totalSpent: req.body.totalAmount || 0 },
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update order status or details
router.put('/:id', async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
