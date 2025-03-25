import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://xucyvcodhzqaktyioejv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3l2Y29kaHpxYWt0eWlvZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMjA2NDQsImV4cCI6MjAzNjU5NjY0NH0.2bCz8VBRR6rjkzc5qZG-PzMgw3N0DPjQsugGG2UZHeo';
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try several different queries
    const results = {};
    
    // Test 1: Simple count
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      results['usersCount'] = { success: !countError, count, error: countError?.message };
    } catch (e: any) {
      results['usersCount'] = { success: false, error: e.message };
    }
    
    // Test 2: Fetch public schema tables
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname,tablename')
        .eq('schemaname', 'public')
        .limit(5);
      
      results['publicTables'] = { 
        success: !tablesError, 
        data: tables, 
        error: tablesError?.message 
      };
    } catch (e: any) {
      results['publicTables'] = { success: false, error: e.message };
    }
    
    // Test 3: Try auth.users if available
    try {
      const { data: authUsers, error: authUsersError } = await supabase
        .from('auth.users')
        .select('count')
        .limit(1);
      
      results['authUsers'] = { 
        success: !authUsersError, 
        data: authUsers, 
        error: authUsersError?.message 
      };
    } catch (e: any) {
      results['authUsers'] = { success: false, error: e.message };
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Query options test',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to test query options',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 