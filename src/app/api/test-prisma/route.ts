import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test the Prisma connection with a simple query
    // Try to create a test genre
    const genreName = `Test Genre ${new Date().toISOString()}`;
    
    const genre = await prisma.genre.create({
      data: {
        name: genreName
      }
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Prisma connection is working properly',
      data: {
        createdGenre: genre
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Prisma test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to connect to database with Prisma',
      error: error,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 