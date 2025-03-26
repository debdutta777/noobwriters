import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Handler for processing payments
export async function POST(request: Request) {
  try {
    // Get the authenticated user
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
      select: { id: true, walletCoins: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Extract payment details from request
    const { amount, paymentType, itemId, itemType } = await request.json();
    
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }
    
    // Example implementation - this would be replaced with actual payment processing
    // For now, just record the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: paymentType,
        status: 'COMPLETED',
        userId: user.id,
        metadata: {
          itemId,
          itemType
        }
      }
    });
    
    // If this is a coin purchase, add coins to the user's wallet
    if (paymentType === 'COIN_PURCHASE') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          walletCoins: user.walletCoins + amount
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      transaction,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// Handler for fetching payment history
export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find user
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
    
    // Get the user's transaction history
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      transactions
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
} 