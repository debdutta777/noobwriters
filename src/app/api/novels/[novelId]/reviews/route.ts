import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Get reviews for a novel
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    const novelId = params.novelId;
    
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    
    // Get reviews with user information
    const reviews = await prisma.review.findMany({
      where: { novelId },
      orderBy: {
        createdAt: 'desc',
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
    const totalReviews = await prisma.review.count({
      where: { novelId },
    });
    
    // Get average rating
    const ratingStats = await prisma.review.aggregate({
      where: { novelId },
      _avg: {
        rating: true,
      },
      _count: true,
    });
    
    return NextResponse.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      averageRating: ratingStats._avg.rating || 0,
      totalRatings: ratingStats._count,
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
  context: any
) {
  try {
    const { params } = context;
    const novelId = params.novelId;
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { rating, content } = await req.json();
    
    if (!rating || rating < 1 || rating > 5) {
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
    
    // Check if novel exists
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
    });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    // Check if user has already reviewed this novel
    const existingReview = await prisma.review.findFirst({
      where: {
        novelId,
        userId: user.id,
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this novel' },
        { status: 400 }
      );
    }
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        content: content || '',
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
    
    // Update novel's rating
    const updatedRatingStats = await prisma.review.aggregate({
      where: { novelId },
      _avg: {
        rating: true,
      },
      _count: true,
    });
    
    await prisma.novel.update({
      where: { id: novelId },
      data: {
        averageRating: updatedRatingStats._avg.rating || 0,
        totalRatings: updatedRatingStats._count,
      },
    });
    
    return NextResponse.json({
      review,
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
  context: any
) {
  try {
    const { params } = context;
    const novelId = params.novelId;
    
    const url = new URL(req.url);
    const reviewId = url.searchParams.get('reviewId');
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
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
      select: { id: true, userRole: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the author of the review or an admin
    if (review.userId !== user.id && user.userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }
    
    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });
    
    // Update novel's rating
    const updatedRatingStats = await prisma.review.aggregate({
      where: { novelId },
      _avg: {
        rating: true,
      },
      _count: true,
    });
    
    await prisma.novel.update({
      where: { id: novelId },
      data: {
        averageRating: updatedRatingStats._avg.rating || 0,
        totalRatings: updatedRatingStats._count,
      },
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