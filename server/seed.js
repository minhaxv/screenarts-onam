import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';
import { products, CATEGORIES } from '../src/data/products.js';
import { INITIAL_ORDERS } from '../src/data/adminMockData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/screenarts';

const seedDatabase = async () => {
  try {
    console.log(`⏳ Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    // Clear existing collections
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️ Cleared old database collections');

    // Seed Categories
    const seededCategories = await Category.insertMany(CATEGORIES);
    console.log(`🌱 Seeded ${seededCategories.length} Categories`);

    // Seed Products
    const seededProducts = await Product.insertMany(products);
    console.log(`🌱 Seeded ${seededProducts.length} Products`);

    // Seed Orders
    const seededOrders = await Order.insertMany(
      INITIAL_ORDERS.map((o) => ({
        orderId: o.id,
        customerName: o.customerName,
        phone: o.phone,
        email: o.email,
        deliveryMethod: o.deliveryMethod,
        deliveryAddress: o.deliveryAddress,
        pincode: o.pincode,
        items: o.items,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        orderDate: o.orderDate,
        status: o.status,
        printSpecs: o.printSpecs,
      }))
    );
    console.log(`🌱 Seeded ${seededOrders.length} Initial Production Orders`);

    console.log('🎉 MongoDB Database Seed Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
