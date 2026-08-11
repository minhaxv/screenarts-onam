import express from 'express';
import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

const router = express.Router();

router.get('/', async (req, res) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI environment variable is missing.',
    });
  }

  let client;
  try {
    client = new MongoClient(uri);
    try {
      attachDatabasePool(client);
    } catch (poolErr) {
      // Local fallback
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

    let sanitizedError = error.message || 'Database connection error';
    sanitizedError = sanitizedError.replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb+srv://<hidden-credentials>@');

    return res.status(500).json({
      success: false,
      message: `Database Connection Failed: ${sanitizedError}`,
    });
  }
});

export default router;
