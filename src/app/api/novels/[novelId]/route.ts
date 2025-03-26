import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: any
) {
  try {
    const { params } = context;
    const novelId = params.novelId;
    
    // Fetch the novel with its author and genres
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
        chapters: {
          where: {
            status: 'PUBLISHED'
          },
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            isPremium: true,
            coverImage: true,
            createdAt: true,
            wordCount: true,
          },
          orderBy: {
            chapterNumber: 'asc'
          },
        },
      },
    });

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    // Format the novel to simplify the response structure
    const formattedNovel = {
      ...novel,
      genres: novel.genres.map(g => g.genre),
    };

    return NextResponse.json({ novel: formattedNovel });
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the novel' },
      { status: 500 }
    );
  }
} 