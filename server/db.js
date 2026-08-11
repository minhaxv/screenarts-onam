import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import dotenv from 'dotenv';
import dns from 'dns';

// Ensure DNS SRV resolution succeeds on all local environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/screenarts';

let isConnected = false;

export const connectDB = async () => {
  try {
    if (isConnected || mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const client = new MongoClient(MONGODB_URI);
    try {
      attachDatabasePool(client);
    } catch (poolErr) {
      // Non-Vercel environment fallback
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected with Vercel Database Pool: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};
