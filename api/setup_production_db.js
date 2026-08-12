import { createClient } from '@supabase/supabase-js';

const url = 'https://qysjkjvhtsrmiosoiagi.supabase.co';
const key = 'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

const supabase = createClient(url, key);

async function cleanAndPrepareDatabase() {
  console.log('--- PREPARING PRODUCTION SUPABASE DATABASE ---');

  try {
    // Delete sample/seeded rows from products table
    const { error: deleteErr } = await supabase
      .from('products')
      .delete()
      .neq('id', 'non_existent_id_for_delete_all');

    if (deleteErr) {
      console.warn('Notice deleting sample products:', deleteErr.message);
    } else {
      console.log('Successfully cleared sample rows from products table.');
    }

    // Verify row counts across tables
    const tables = ['products', 'categories', 'profiles', 'orders', 'order_items', 'custom_designs', 'bulk_enquiries'];
    for (const t of tables) {
      const { data, error } = await supabase.from(t).select('*');
      if (error) {
        console.log(`Table '${t}': MISSING/NEEDS SCHEMA SCRIPT (${error.message})`);
      } else {
        console.log(`Table '${t}': READY | Row Count: ${data ? data.length : 0}`);
      }
    }
  } catch (err) {
    console.error('Database setup exception:', err.message);
  }
}

cleanAndPrepareDatabase();
