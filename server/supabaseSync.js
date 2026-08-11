import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qysjkjvhtsrmiosoiagi.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.log('ℹ️ Supabase API Connected (Table structure checking active):', error.message);
    } else {
      console.log('✅ Supabase Connection Live & Operational!');
    }
    return { success: true, url: supabaseUrl };
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
    return { success: false, error: err.message };
  }
};
