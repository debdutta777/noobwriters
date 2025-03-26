import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, getServerAuthSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const authCheck = await authMiddleware(req);
    if (authCheck) return authCheck; // If authCheck returns a response, it means there was an auth error

    // Get session
    const session = await getServerAuthSession();
    
    // Ensure session exists after middleware check
    if (!session) {
      return NextResponse.json({
        error: "Session not found"
      }, { status: 401 });
    }
    
    return NextResponse.json({
      status: "success",
      message: "Authentication working",
      session: {
        user: {
          id: session?.user?.id,
          name: session?.user?.name,
          email: session?.user?.email,
          userRole: session?.user?.userRole,
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json({
      status: "error",
      message: "Authentication test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 