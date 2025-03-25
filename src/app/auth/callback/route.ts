import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";

  if (code) {
    try {
      // Exchange code for session
      const { error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin));
      }

      // Redirect to the login page to use NextAuth
      return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent("Account verified! Please log in.")}`, requestUrl.origin));
    } catch (error) {
      console.error("Callback error:", error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin));
    }
  }

  // If no code, redirect to login page
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
} 