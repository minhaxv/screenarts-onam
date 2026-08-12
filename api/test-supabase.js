import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL || 'https://qysjkjvhtsrmiosoiagi.supabase.co';
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

  if (!url || !key) {
    return res.status(500).json({
      success: false,
      message: 'Supabase environment variables are missing.',
    });
  }

  try {
    const supabase = createClient(url, key);
    // Ping Supabase auth health or JWKS
    const response = await fetch(process.env.SUPABASE_JWKS_URL || `${url}/auth/v1/.well-known/jwks.json`);
    const jwksData = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Supabase connected successfully',
      supabaseUrl: url,
      jwksVerified: Array.isArray(jwksData?.keys),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Supabase Connection Failed: ${error.message}`,
    });
  }
}
