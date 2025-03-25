import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get additional user details from database
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, image, bio, role, coins')
      .eq('id', user.id)
      .single();
    
    return userData;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
} 