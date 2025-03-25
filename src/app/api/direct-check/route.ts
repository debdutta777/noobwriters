import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = 'https://xucyvcodhzqaktyioejv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3l2Y29kaHpxYWt0eWlvZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMjA2NDQsImV4cCI6MjAzNjU5NjY0NH0.2bCz8VBRR6rjkzc5qZG-PzMgw3N0DPjQsugGG2UZHeo';
    
    // Test if the Supabase API is reachable
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
    });
    
    const responseStatus = response.status;
    let responseBody = '';
    
    try {
      responseBody = await response.text();
    } catch (e) {
      // Ignore errors getting the response body
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Direct API check completed',
      results: {
        url: `${supabaseUrl}/rest/v1/users?select=id&limit=1`,
        statusCode: responseStatus,
        responseBody: responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : ''),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to perform direct API check',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 