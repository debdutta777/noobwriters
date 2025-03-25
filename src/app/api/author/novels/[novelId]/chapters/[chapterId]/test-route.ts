import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { novelId: string; chapterId: string } }
) {
  try {
    const novelId = context.params.novelId;
    const chapterId = context.params.chapterId;
    
    return NextResponse.json({ novelId, chapterId, message: "Test route handler" }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
} 