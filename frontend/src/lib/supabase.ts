import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnon);

if (!supabaseConfigured) {
  console.warn(
    '[CardioXAI] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Auth features will not work until you create a frontend/.env file.'
  );
}

// createClient throws if supabaseUrl is empty — only call it with valid values.
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnon)
  : null;
