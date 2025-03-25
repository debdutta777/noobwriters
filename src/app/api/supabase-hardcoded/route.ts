import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Hardcoded credentials for testing
    const supabaseUrl = 'https://xucyvcodhzqaktyioejv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3l2Y29kaHpxYWt0eWlvZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMjA2NDQsImV4cCI6MjAzNjU5NjY0NH0.2bCz8VBRR6rjkzc5qZG-PzMgw3N0DPjQsugGG2UZHeo';
    
    // Create a direct Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test the connection with a simple public query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query Supabase: ' + error.message,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection is working properly',
      data,
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