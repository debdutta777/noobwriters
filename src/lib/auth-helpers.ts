import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper to get the server session
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Checks if the user is authenticated and returns the user
 * @returns User object or null
 */
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        userRole: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Authentication middleware for API routes
 * @param req - NextRequest object
 * @returns NextResponse or null
 */
export async function authMiddleware(req: NextRequest) {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  return null; // Continue to the route handler
}

/**
 * Checks if the user is authenticated and has the required role
 * @param req - NextRequest object
 * @param roles - Array of roles that are allowed
 * @returns NextResponse or null
 */
export async function roleMiddleware(req: NextRequest, roles: string[]) {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  
  return null; // Continue to the route handler
} 