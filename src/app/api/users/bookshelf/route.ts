import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Check if novel is in user's bookshelf
export async function GET(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const novelId = url.searchParams.get('novelId');
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the novel is in the user's bookshelf
    const bookshelfEntry = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        novelId: novelId
      }
    });

    return NextResponse.json({
      inBookshelf: !!bookshelfEntry
    });
  } catch (error) {
    console.error('Error checking bookshelf:', error);
    return NextResponse.json(
      { error: 'Failed to check bookshelf' },
      { status: 500 }
    );
  }
}

// Add novel to user's bookshelf
export async function POST(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { novelId } = await req.json();
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add novel to bookshelf
    await prisma.bookmark.create({
      data: {
        userId: user.id,
        novelId: novelId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Novel added to bookshelf'
    });
  } catch (error) {
    console.error('Error adding to bookshelf:', error);
    return NextResponse.json(
      { error: 'Failed to add novel to bookshelf' },
      { status: 500 }
    );
  }
}

// Remove novel from user's bookshelf
export async function DELETE(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const novelId = url.searchParams.get('novelId');
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove novel from bookshelf
    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        novelId: novelId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Novel removed from bookshelf'
    });
  } catch (error) {
    console.error('Error removing from bookshelf:', error);
    return NextResponse.json(
      { error: 'Failed to remove novel from bookshelf' },
      { status: 500 }
    );
  }
} 