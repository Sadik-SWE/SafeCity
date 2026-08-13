import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export function isValidSupabaseConfig(url, key) {
  if (!url || !key) return false;
  const cleanUrl = String(url).trim().toLowerCase();
  const cleanKey = String(key).trim();

  if (
    !cleanUrl.startsWith('https://') ||
    cleanUrl.includes('your-project') ||
    cleanUrl.includes('placeholder') ||
    cleanUrl.includes('example.com')
  ) {
    return false;
  }

  if (
    cleanKey.length < 20 ||
    cleanKey.includes('your-anon-key') ||
    cleanKey.includes('your-service-role-key') ||
    cleanKey.includes('placeholder')
  ) {
    return false;
  }

  return true;
}

export const isSupabaseConfigured = isValidSupabaseConfig(supabaseUrl, supabaseKey);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

if (isSupabaseConfigured) {
  console.log('⚡ Supabase Client initialized on Server!');
} else {
  console.log('ℹ️ Supabase using local persistent database engine.');
}
