import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Get reviews for a novel
export async function GET(
  req: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    
    // Fetch the reviews with user information
    const reviews = await prisma.rating.findMany({
      where: { 
        novelId 
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get total reviews count for pagination
    const totalReviews = await prisma.rating.count({
      where: { novelId },
    });

    // Calculate average rating
    const averageRating = await prisma.rating.aggregate({
      where: { novelId },
      _avg: {
        score: true,
      }
    });

    return NextResponse.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      averageRating: averageRating._avg.score || 0
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Add a review to a novel
export async function POST(
  req: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { score, review } = await req.json();
    
    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find user by email
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

    // Check if the user has already reviewed this novel
    const existingReview = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        novelId,
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.rating.update({
        where: {
          id: existingReview.id,
        },
        data: {
          score,
          review,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return NextResponse.json({
        review: updatedReview,
        message: 'Review updated successfully',
      });
    }

    // Create new review
    const newReview = await prisma.rating.create({
      data: {
        score,
        review,
        userId: user.id,
        novelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update novel's average rating
    const averageRating = await prisma.rating.aggregate({
      where: { novelId },
      _avg: {
        score: true,
      }
    });

    await prisma.novel.update({
      where: { id: novelId },
      data: { rating: averageRating._avg.score || 0 }
    });

    return NextResponse.json({
      review: newReview,
      message: 'Review added successfully',
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}

// Delete a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const novelId = params.novelId;
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user by email
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

    // Check if the review exists and belongs to the user
    const review = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        novelId,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.rating.delete({
      where: {
        id: review.id,
      },
    });

    // Update novel's average rating
    const averageRating = await prisma.rating.aggregate({
      where: { novelId },
      _avg: {
        score: true,
      }
    });

    await prisma.novel.update({
      where: { id: novelId },
      data: { rating: averageRating._avg.score || 0 }
    });

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 