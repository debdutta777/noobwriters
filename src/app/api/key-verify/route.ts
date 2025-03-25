import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function GET() {
  try {
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3l2Y29kaHpxYWt0eWlvZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMjA2NDQsImV4cCI6MjAzNjU5NjY0NH0.2bCz8VBRR6rjkzc5qZG-PzMgw3N0DPjQsugGG2UZHeo';
    
    // Check if the key is a valid JWT format
    let isValidJwtFormat = false;
    let decodedToken: any = null;
    let tokenExpired = false;
    
    try {
      // Check JWT format (header.payload.signature)
      isValidJwtFormat = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/.test(supabaseKey);
      
      // Decode token
      if (isValidJwtFormat) {
        decodedToken = jwtDecode(supabaseKey);
        
        // Check if token is expired
        if (decodedToken.exp) {
          const expiryDate = new Date(decodedToken.exp * 1000);
          tokenExpired = expiryDate.getTime() < Date.now();
        }
      }
    } catch (e) {
      // Error decoding token
      console.error('Error decoding token:', e);
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'API key validation check',
      results: {
        keyLength: supabaseKey.length,
        isValidJwtFormat,
        tokenInfo: decodedToken ? {
          role: decodedToken.role,
          issuer: decodedToken.iss,
          issuedAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : null,
          expiresAt: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : null,
          tokenExpired
        } : null
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to validate API key',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 