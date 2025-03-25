import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
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

// Helper function to verify novel ownership
async function verifyNovelOwnership(novelId: string, userId: string) {
  const novel = await prisma.novel.findUnique({
    where: {
      id: novelId,
      authorId: userId,
    },
  });
  
  return novel;
}

// GET a specific chapter
export async function GET(
  request: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId, chapterId } = params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify novel ownership
    const novel = await verifyNovelOwnership(novelId, session.user.id);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Get the chapter
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        novelId: novelId,
      },
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ chapter }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the chapter' },
      { status: 500 }
    );
  }
}

// PUT update a chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId, chapterId } = params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify novel ownership
    const novel = await verifyNovelOwnership(novelId, session.user.id);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Check if chapter exists
    const existingChapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        novelId: novelId,
      },
    });
    
    if (!existingChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
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
    let imagePath = existingChapter.coverImage;
    
    if (coverImage && coverImage.size > 0) {
      // Delete old image if it exists
      if (existingChapter.coverImage) {
        const oldImagePath = path.join(process.cwd(), 'public', existingChapter.coverImage);
        if (fs.existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }
      
      // Save new image
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
    
    // Update the chapter
    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        title,
        content,
        chapterNumber,
        status,
        isPremium,
        coinsCost,
        wordCount,
        coverImage: imagePath,
      },
    });
    
    return NextResponse.json({ chapter: updatedChapter }, { status: 200 });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the chapter' },
      { status: 500 }
    );
  }
}

// DELETE a chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { novelId, chapterId } = params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify novel ownership
    const novel = await verifyNovelOwnership(novelId, session.user.id);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found or you do not have permission to access it' },
        { status: 404 }
      );
    }
    
    // Get the chapter to delete
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        novelId: novelId,
      },
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Delete chapter image if it exists
    if (chapter.coverImage) {
      const imagePath = path.join(process.cwd(), 'public', chapter.coverImage);
      if (fs.existsSync(imagePath)) {
        await unlink(imagePath);
      }
    }
    
    // Delete the chapter
    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the chapter' },
      { status: 500 }
    );
  }
} 