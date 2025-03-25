import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Only in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Only available in development mode" }, { status: 403 });
  }

  return NextResponse.json({
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set",
      SUPABASE_URL: process.env.SUPABASE_URL ? "⚠️ Legacy variable set" : "✓ Not using legacy variable",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "⚠️ Legacy variable set" : "✓ Not using legacy variable",
      SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? "⚠️ Legacy variable set" : "✓ Not using legacy variable",
    },
    timestamp: new Date().toISOString()
  });
} 