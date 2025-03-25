import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const chapterId = params.chapterId;
    
    // Fetch the chapter with related novel data
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: {
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
                chapterNumber: true,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { viewCount: { increment: 1 } }
    });

    // Check if user can access premium content
    const session = await auth();
    let canAccessPremium = false;

    if (chapter.isPremium && session?.user?.email) {
      // Check if the user has purchased this chapter
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });

      if (user) {
        const purchase = await prisma.purchase.findFirst({
          where: {
            userId: user.id,
            chapterId: chapterId
          }
        });

        canAccessPremium = !!purchase;
      }
    }

    // If premium and not purchased, hide content
    const chapterResponse = {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      content: (!chapter.isPremium || canAccessPremium) ? chapter.content : null,
      viewCount: chapter.viewCount,
      isPremium: chapter.isPremium,
      coinsCost: chapter.coinsCost,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    };

    // Format novel info
    const novelResponse = {
      id: chapter.novel.id,
      title: chapter.novel.title,
      coverImage: chapter.novel.coverImage,
      author: chapter.novel.author,
      chapters: chapter.novel.chapters
    };

    return NextResponse.json({ 
      chapter: chapterResponse, 
      novel: novelResponse, 
      canAccessPremium 
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
} 