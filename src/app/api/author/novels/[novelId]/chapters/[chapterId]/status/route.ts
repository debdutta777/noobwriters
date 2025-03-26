import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PATCH endpoint to update chapter status
export async function PATCH(
  request: Request,
  context: any
) {
  try {
    const { params } = context;
    const { novelId, chapterId } = params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify novel ownership
    const novel = await prisma.novel.findUnique({
      where: {
        id: novelId,
        authorId: session.user.id,
      },
    });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        novelId: novelId,
      },
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Extract new status from request body
    const data = await request.json();
    const { status } = data;
    
    if (!status || !['DRAFT', 'PUBLISHED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status provided. Status must be either "DRAFT" or "PUBLISHED"' },
        { status: 400 }
      );
    }
    
    // Update the chapter status
    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        status: status as "DRAFT" | "PUBLISHED",
      },
    });
    
    return NextResponse.json({ chapter: updatedChapter }, { status: 200 });
  } catch (error) {
    console.error('Error updating chapter status:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the chapter status' },
      { status: 500 }
    );
  }
} 