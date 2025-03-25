import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Simple HTML sanitizer to prevent XSS attacks
const sanitizeHtml = (html: string): string => {
  // This is a very basic sanitizer - in production you would use a library like DOMPurify
  // or a server-side sanitizer
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
};

// GET all chapters for a novel
export async function GET(
  request: NextRequest,
  context: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId } = await Promise.resolve(context.params);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify that the novel belongs to the current user
    const novel = await prisma.novel.findUnique({
      where: {
        id: novelId,
        authorId: session.user.id,
      },
    });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Get all chapters for this novel
    const chapters = await prisma.chapter.findMany({
      where: {
        novelId: novelId,
      },
      orderBy: {
        chapterNumber: 'asc',
      },
    });
    
    return NextResponse.json({ chapters }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching chapters' },
      { status: 500 }
    );
  }
}

// POST create a new chapter
export async function POST(
  request: NextRequest,
  context: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId } = await Promise.resolve(context.params);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify that the novel belongs to the current user
    const novel = await prisma.novel.findUnique({
      where: {
        id: novelId,
        authorId: session.user.id,
      },
    });
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    let content = formData.get('content') as string;
    
    // Sanitize the HTML content to prevent XSS attacks
    content = sanitizeHtml(content);
    
    const chapterNumber = parseInt(formData.get('chapterNumber') as string);
    const status = formData.get('status') as string;
    const isPremium = formData.get('isPremium') === 'true';
    const coinsCost = parseInt(formData.get('coinsCost') as string) || 0;
    const wordCount = parseInt(formData.get('wordCount') as string) || 0;
    
    // Handle image upload if present
    const coverImage = formData.get('coverImage') as File;
    let imagePath = null;
    
    if (coverImage && coverImage.size > 0) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const fileName = `chapter-${novelId}-${uuidv4()}.${coverImage.name.split('.').pop()}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chapters');
      
      // Ensure the upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imagePath = `/uploads/chapters/${fileName}`;
    }
    
    // Create the chapter
    const chapter = await prisma.chapter.create({
      data: {
        title,
        content,
        chapterNumber,
        status,
        isPremium,
        coinsCost,
        wordCount,
        coverImage: imagePath,
        novel: {
          connect: {
            id: novelId,
          },
        },
      },
    });
    
    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the chapter' },
      { status: 500 }
    );
  }
} 