import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Try common env var names (fallbacks) to avoid misconfiguration
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[supabaseClient] VITE_SUPABASE_URL or Supabase key is missing. Verify your .env local variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
