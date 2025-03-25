import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase credentials are missing',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    // Log the first few characters of the key for debugging
    const maskedKey = supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 5);
    
    // Create a direct Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test the connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query Supabase: ' + error.message,
        details: {
          urlLength: supabaseUrl.length,
          keyPreview: maskedKey,
        },
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection is working properly',
      data,
      details: {
        urlLength: supabaseUrl.length,
        keyPreview: maskedKey,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Supabase test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to connect to Supabase',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 