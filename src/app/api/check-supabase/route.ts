import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Supabase integration has been disabled - using MongoDB instead'
  });
} 