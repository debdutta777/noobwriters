import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const tests = {
      environmentVariables: {
        nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
        nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set",
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set",
        // Legacy variables - should not be used
        legacySupabaseUrl: process.env.SUPABASE_URL ? "⚠️ Set (legacy)" : "✓ Not used",
        legacySupabaseAnonKey: process.env.SUPABASE_ANON_KEY ? "⚠️ Set (legacy)" : "✓ Not used",
        legacySupabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE ? "⚠️ Set (legacy)" : "✓ Not used",
      },
      clientTest: null,
      adminTest: null,
    };

    // Test the client connection
    try {
      const clientResponse = await supabaseClient.auth.getSession();
      tests.clientTest = {
        success: !clientResponse.error,
        message: clientResponse.error ? clientResponse.error.message : "Connection successful",
        data: clientResponse.error ? null : "Session data available",
      };
    } catch (error: any) {
      tests.clientTest = {
        success: false,
        message: error.message,
        error: error,
      };
    }

    // Test the admin connection
    try {
      const adminResponse = await supabaseAdmin.auth.getSession();
      tests.adminTest = {
        success: !adminResponse.error,
        message: adminResponse.error ? adminResponse.error.message : "Connection successful",
        data: adminResponse.error ? null : "Session data available",
      };
    } catch (error: any) {
      tests.adminTest = {
        success: false,
        message: error.message,
        error: error,
      };
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection test",
      tests,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Test Supabase error:", error);
    return NextResponse.json({
      status: "error",
      message: "Test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 