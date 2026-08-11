import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://qysjkjvhtsrmiosoiagi.supabase.co';
const supabaseKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

export const supabase = createClient(supabaseUrl, supabaseKey);
