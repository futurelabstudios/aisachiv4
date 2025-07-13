import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be defined in the environment');
}

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY); 