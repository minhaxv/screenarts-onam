import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI environment variable is missing.',
    });
  }

  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    try {
      attachDatabasePool(client);
    } catch (poolErr) {
      // Non-Vercel environment fallback
    }

    await client.connect();
    const db = client.db('screenarts');
    await db.command({ ping: 1 });
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'MongoDB connected successfully',
    });
  } catch (error) {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }

    // Sanitize error message to prevent exposing credentials or URIs
    let sanitizedError = error.message || 'Database connection error';
    sanitizedError = sanitizedError.replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb+srv://<hidden-credentials>@');

    return res.status(500).json({
      success: false,
      message: `Database Connection Failed: ${sanitizedError}`,
    });
  }
}
