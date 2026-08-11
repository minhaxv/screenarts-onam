import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/screenarts';

let isConnected = false;

export const connectDB = async () => {
  try {
    if (isConnected || mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Initialize MongoClient and attach Vercel Functions Database Pool
    const client = new MongoClient(MONGODB_URI);
    try {
      attachDatabasePool(client);
    } catch (poolErr) {
      // Optional logging for non-Vercel environment
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected with Vercel Database Pool: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Running with fallback state until MongoDB Atlas credentials are confirmed.');
  }
};
