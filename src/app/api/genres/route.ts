import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all genres from the database
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: 'asc', // Sort alphabetically
      },
    });

    return NextResponse.json({ genres }, { status: 200 });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching genres.' },
      { status: 500 }
    );
  }
} 