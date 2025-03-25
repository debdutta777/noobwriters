import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// SECURITY WARNING: This endpoint should only be used in development
// and should be removed in production!

export async function POST(req: NextRequest) {
  // Verify we're in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({
      status: "error",
      message: "This endpoint is only available in development mode",
    }, { status: 403 });
  }
  
  try {
    const { supabaseUrl, supabaseKey, serviceRole } = await req.json();
    
    // Basic validation
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: "error",
        message: "Missing required parameters",
      }, { status: 400 });
    }

    // Test the provided credentials
    try {
      const testClient = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await testClient.auth.getSession();
      
      if (error) {
        return NextResponse.json({
          status: "error",
          message: "Invalid Supabase credentials",
          error: error.message,
        }, { status: 400 });
      }
      
      // Set the environment variables in memory
      process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseKey;
      
      if (serviceRole) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRole;
      }
      
      return NextResponse.json({
        status: "success",
        message: "Environment variables updated",
        environmentVariables: {
          NEXT_PUBLIC_SUPABASE_URL: "✅ Updated",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "✅ Updated",
          SUPABASE_SERVICE_ROLE_KEY: serviceRole ? "✅ Updated" : "⚠️ Not provided",
        }
      });
    } catch (error: any) {
      return NextResponse.json({
        status: "error",
        message: "Failed to test Supabase credentials",
        error: error.message,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Failed to process request",
      error: error.message,
    }, { status: 500 });
  }
} 