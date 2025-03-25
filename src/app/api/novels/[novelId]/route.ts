import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    
    // Increment view count atomically
    await prisma.novel.update({
      where: { id: novelId },
      data: { viewCount: { increment: 1 } }
    });
    
    // Fetch the novel with related data
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        chapters: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: {
            chapterNumber: 'asc',
          },
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            viewCount: true,
            isPremium: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ novel });
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch novel' },
      { status: 500 }
    );
  }
} 