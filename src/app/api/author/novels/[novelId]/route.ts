import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET a specific novel
export async function GET(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId } = params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the novel with its genres
    const novel = await prisma.novel.findUnique({
      where: {
        id: novelId,
        authorId: session.user.id,
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Format the genres to simplify the structure
    const formattedNovel = {
      ...novel,
      genres: novel.genres.map(g => g.genre),
    };
    
    return NextResponse.json({ novel: formattedNovel }, { status: 200 });
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the novel' },
      { status: 500 }
    );
  }
} 