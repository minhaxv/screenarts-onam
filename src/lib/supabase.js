import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://qysjkjvhtsrmiosoiagi.supabase.co';

const supabaseAnonKey =
  import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_3lMHnlhZOkp9B6ZP464KCg_oJ_ilZQH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

