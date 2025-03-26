import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    const chapterId = params.chapterId;
    
    // Get the session to check if the user is logged in
    const session = await auth();
    
    // Increment view count
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { viewCount: { increment: 1 } }
    });
    
    // Get the chapter with novel information
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
            genres: {
              include: {
                genre: true,
              }
            }
          }
        }
      }
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Check if the chapter is published
    if (chapter.status !== 'PUBLISHED') {
      // If not published, check if the user is the author
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'This chapter is not yet published' },
          { status: 403 }
        );
      }
      
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (!user || user.id !== chapter.novel.authorId) {
        return NextResponse.json(
          { error: 'This chapter is not yet published' },
          { status: 403 }
        );
      }
    }
    
    // Check if the chapter is premium and if the user can access it
    let canAccessPremium = false;
    
    if (chapter.isPremium) {
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { 
            id: true,
            premiumUntil: true,
            walletCoins: true,
          }
        });
        
        if (user) {
          // Check if user has active premium subscription
          if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
            canAccessPremium = true;
          }
          
          // Check if the user has already purchased this chapter
          const purchase = await prisma.chapterPurchase.findFirst({
            where: {
              userId: user.id,
              chapterId: chapter.id
            }
          });
          
          if (purchase) {
            canAccessPremium = true;
          }
          
          // Check if the user is the author
          if (user.id === chapter.novel.authorId) {
            canAccessPremium = true;
          }
        }
      }
      
      // If the user can't access premium content, remove the content
      if (!canAccessPremium) {
        const previewLength = 1000; // Characters to show as preview
        chapter.content = chapter.content.substring(0, previewLength) + '...';
      }
    }
    
    // Format the response
    const formattedNovel = {
      ...chapter.novel,
      genres: chapter.novel.genres.map(g => g.genre),
    };
    
    const formattedChapter = {
      ...chapter,
      novel: formattedNovel,
    };
    
    return NextResponse.json({
      chapter: formattedChapter,
      canAccessPremium,
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
} 