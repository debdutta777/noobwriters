import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
  console.warn(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

// Client for public operations (use this on the client side)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin operations (only use on the server side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}); 