import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}

let clientInstance: ReturnType<typeof createBrowserSupabaseClient>;

export function getSupabaseBrowser() {
  if (!clientInstance) {
    clientInstance = createBrowserSupabaseClient();
  }
  return clientInstance;
} 