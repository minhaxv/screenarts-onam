import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import testDbRoutes from './routes/testDbRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/test-db', testDbRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ScreenArts Onam MongoDB API Server Running',
    timestamp: new Date(),
  });
});

// Connect DB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ScreenArts MongoDB Express Server listening on http://localhost:${PORT}`);
  });
});
