import { createClient } from '@supabase/supabase-js';

const url = 'https://qysjkjvhtsrmiosoiagi.supabase.co';
const key = 'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

const supabase = createClient(url, key);

async function checkTables() {
  console.log('--- SUPABASE PROJECT DIAGNOSTIC ---');
  console.log('Project URL:', url);
  console.log('Project Reference ID: qysjkjvhtsrmiosoiagi');

  const tables = ['products', 'categories', 'profiles', 'orders', 'order_items', 'custom_designs', 'bulk_enquiries'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.log(`Table '${table}': ERROR/MISSING (${error.message})`);
      } else {
        console.log(`Table '${table}': EXISTS | Row Count: ${data ? data.length : 0}`);
        if (data && data.length > 0) {
          console.log(`   Sample records from '${table}':`, data.slice(0, 2).map(r => ({ id: r.id || r.name || r.order_number, name: r.name || r.customer_name || r.full_name || r.email })));
        }
      }
    } catch (err) {
      console.log(`Table '${table}': EXCEPTION (${err.message})`);
    }
  }
}

checkTables();
