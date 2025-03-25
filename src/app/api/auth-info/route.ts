import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Display environment variable information for debugging
    return NextResponse.json({
      status: 'success',
      message: 'Authentication configuration loaded',
      config: {
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
        supabaseUrlLength: (process.env.SUPABASE_URL || '').length,
        supabaseAnonKeyLength: (process.env.SUPABASE_ANON_KEY || '').length,
        supabaseAnonKeyFirstChars: (process.env.SUPABASE_ANON_KEY || '').substring(0, 10) + '...',
        publicSupabaseUrlLength: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').length,
        publicSupabaseAnonKeyLength: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').length,
        publicSupabaseAnonKeyFirstChars: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').substring(0, 10) + '...',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to get auth info',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 