import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Extract query parameters
    const genre = url.searchParams.get('genre');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const timeframe = url.searchParams.get('timeframe');
    const search = url.searchParams.get('search');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions: any = {
      // Only return published novels by default - use enum value
      status: {
        in: ['ONGOING', 'COMPLETED', 'HIATUS']
      }
    };
    
    // Add genre filter if provided
    if (genre && genre !== 'all') {
      whereConditions.genres = {
        has: genre
      };
    }
    
    // Add search functionality
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add timeframe filter
    if (timeframe) {
      const now = new Date();
      
      if (timeframe === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        whereConditions.updatedAt = { gte: weekAgo };
      } else if (timeframe === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        whereConditions.updatedAt = { gte: monthAgo };
      }
    }
    
    // Determine sort order
    const orderBy: any = {};
    orderBy[sort] = order.toLowerCase();
    
    // Fetch novels with author information and count chapters
    const novels = await prisma.novel.findMany({
      where: whereConditions,
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
            status: 'PUBLISHED',  // Use enum value instead of string
          },
          select: {
            id: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });
    
    // Count total novels (for pagination)
    const totalNovels = await prisma.novel.count({
      where: whereConditions,
    });
    
    // Format the response
    const formattedNovels = novels.map((novel) => ({
      id: novel.id,
      title: novel.title,
      description: novel.description,
      coverImage: novel.coverImage,
      status: novel.status,
      viewCount: novel.viewCount,
      averageRating: novel.averageRating,
      totalRatings: novel.totalRatings,
      genres: novel.genres,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
      author: novel.author,
      chaptersCount: novel.chapters.length,
    }));
    
    // Return the response
    return NextResponse.json({
      novels: formattedNovels,
      totalNovels,
      currentPage: page,
      totalPages: Math.ceil(totalNovels / limit),
    });
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch novels' },
      { status: 500 }
    );
  }
} 