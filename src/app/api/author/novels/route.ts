import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import * as mime from "mime-types";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import * as z from 'zod';
import { 
  ensureDirectoryExists, 
  generateUniqueFilename, 
  getMimeType, 
  isValidImageType, 
  isValidFileSize, 
  saveImageFile 
} from '@/lib/imageUtils';
import { authOptions } from "@/lib/auth";

// Schema for novel creation
const novelSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS']),
  isAdult: z.boolean().default(false),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const isAdult = formData.get('isAdult') === 'true';
    const genresRaw = formData.get('genres') as string;
    const coverImage = formData.get('coverImage') as File | null;
    
    // Parse genres from JSON string
    let genres: string[] = [];
    try {
      genres = JSON.parse(genresRaw);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid genres format' }, { status: 400 });
    }

    // Validate the input
    try {
      novelSchema.parse({
        title,
        description,
        status,
        isAdult,
        genres,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Handle the cover image if provided
    let imageUrl = null;
    let imageBlob = null;
    let imageMimeType = null;

    if (coverImage) {
      // Convert the file to buffer
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      
      // Determine MIME type
      const mimeType = getMimeType(buffer);
      
      // Validate image type
      if (!isValidImageType(mimeType)) {
        return NextResponse.json(
          { error: 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.' },
          { status: 400 }
        );
      }
      
      // Validate file size (5MB limit)
      if (!isValidFileSize(buffer.length)) {
        return NextResponse.json(
          { error: 'Image size exceeds the 5MB limit.' },
          { status: 400 }
        );
      }

      // Save the image to the filesystem
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'novels');
      const filename = generateUniqueFilename(coverImage.name);
      saveImageFile(buffer, filename, uploadsDir);
      
      // Set the URL for database storage
      imageUrl = `/uploads/novels/${filename}`;
      imageBlob = buffer;
      imageMimeType = mimeType;
    }

    // Create the novel in the database
    const novel = await prisma.novel.create({
      data: {
        title,
        description,
        coverImage: imageUrl,
        coverBlob: imageBlob,
        imageMime: imageMimeType,
        status: status as 'ONGOING' | 'COMPLETED' | 'HIATUS',
        isAdult,
        authorId: user.id,
        genres: {
          create: genres.map(genreId => ({
            genre: {
              connect: {
                id: genreId,
              },
            },
          })),
        },
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return NextResponse.json({ novel }, { status: 201 });
  } catch (error) {
    console.error('Error creating novel:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the novel.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');

    // Build the query
    const query: any = {
      where: {
        authorId: user.id,
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            bookmarks: true,
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    // Add filters if provided
    if (status) {
      query.where.status = status;
    }

    // Add pagination if provided
    if (limit) {
      query.take = parseInt(limit);
    }
    if (skip) {
      query.skip = parseInt(skip);
    }

    // Get the novels
    const novels = await prisma.novel.findMany(query);

    // Get total count
    const totalCount = await prisma.novel.count({
      where: query.where,
    });

    return NextResponse.json({ novels, totalCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the novels.' },
      { status: 500 }
    );
  }
} 