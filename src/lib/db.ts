import { supabaseClient, supabaseAdmin } from "./supabase";
import { prisma } from "./prisma";
import { Prisma } from '@prisma/client';

type NovelFilterParams = {
  limit?: number;
  offset?: number;
  genre?: string | null;
  status?: string | null;
  orderBy?: string;
  search?: string | null;
};

// Novel operations
export async function getNovels({
  limit = 10,
  offset = 0,
  genre = null,
  status = null,
  orderBy = "createdAt",
  search = null
}: NovelFilterParams) {
  try {
    // Build where conditions
    const where: Prisma.NovelWhereInput = {};
    
    if (genre) {
      where.genres = {
        some: {
          genre: {
            name: {
              equals: genre,
              mode: 'insensitive'
            }
          }
        }
      };
    }
    
    if (status) {
      where.status = status as any;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get novels with relations
    const novels = await prisma.novel.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        genres: {
          include: {
            genre: true
          }
        },
        _count: {
          select: {
            bookmarks: true,
            ratings: true,
            chapters: true
          }
        }
      },
      orderBy: {
        [orderBy]: 'desc'
      },
      skip: offset,
      take: limit
    });
    
    return { success: true, novels };
  } catch (error: any) {
    console.error("Get novels error:", error);
    return { success: false, error: error.message };
  }
}

export async function getNovelById(id: string) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true
          }
        },
        genres: {
          include: {
            genre: true
          }
        },
        chapters: {
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            isPremium: true,
            coinsCost: true,
            createdAt: true,
            wordCount: true,
            viewCount: true
          },
          orderBy: {
            chapterNumber: 'asc'
          }
        },
        _count: {
          select: {
            bookmarks: true,
            ratings: true,
            chapters: true
          }
        }
      }
    });
    
    if (!novel) {
      throw new Error("Novel not found");
    }
    
    // Calculate average rating
    const ratings = await prisma.rating.findMany({
      where: { novelId: id },
      select: { score: true }
    });
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;
    
    return {
      success: true,
      novel: {
        ...novel,
        avgRating
      }
    };
  } catch (error: any) {
    console.error("Get novel error:", error);
    return { success: false, error: error.message };
  }
}

// Chapter operations
export async function getChapterById(id: string, userId?: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            genres: {
              include: {
                genre: true
              }
            }
          }
        }
      }
    });
    
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    
    // Check if user has access to premium chapter
    let hasAccess = !chapter.isPremium;
    
    if (chapter.isPremium && userId) {
      // Check if author
      if (chapter.novel.authorId === userId) {
        hasAccess = true;
      } else {
        // Check if purchased
        const purchase = await prisma.purchase.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId: id
            }
          }
        });
        
        hasAccess = !!purchase;
      }
    }
    
    // Increment view count
    await prisma.chapter.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
    // Update reading history if userId provided
    if (userId) {
      await prisma.readingHistory.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId: id
          }
        },
        update: {
          lastReadAt: new Date()
        },
        create: {
          userId,
          novelId: chapter.novelId,
          chapterId: id,
          progress: 0,
          lastReadAt: new Date()
        }
      });
    }
    
    return {
      success: true,
      chapter: {
        ...chapter,
        hasAccess
      }
    };
  } catch (error: any) {
    console.error("Get chapter error:", error);
    return { success: false, error: error.message };
  }
}

// User operations
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            novels: true,
            comments: true,
            following: true,
            followedBy: true
          }
        }
      }
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return { success: true, user };
  } catch (error: any) {
    console.error("Get user error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserNovels(userId: string) {
  try {
    const novels = await prisma.novel.findMany({
      where: {
        authorId: userId
      },
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        _count: {
          select: {
            bookmarks: true,
            ratings: true,
            chapters: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return { success: true, novels };
  } catch (error: any) {
    console.error("Get user novels error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId
      },
      include: {
        novel: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            genres: {
              include: {
                genre: true
              }
            },
            _count: {
              select: {
                bookmarks: true,
                ratings: true,
                chapters: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, bookmarks };
  } catch (error: any) {
    console.error("Get user bookmarks error:", error);
    return { success: false, error: error.message };
  }
}

// Bookmark operations
export async function toggleBookmark(userId: string, novelId: string) {
  try {
    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_novelId: {
          userId,
          novelId
        }
      }
    });
    
    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      
      return { success: true, bookmarked: false };
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId,
          novelId
        }
      });
      
      return { success: true, bookmarked: true };
    }
  } catch (error: any) {
    console.error("Toggle bookmark error:", error);
    return { success: false, error: error.message };
  }
}

// Rating operations
export async function rateNovel(userId: string, novelId: string, score: number, review?: string) {
  try {
    // Check if rating exists
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_novelId: {
          userId,
          novelId
        }
      }
    });
    
    if (existingRating) {
      // Update rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          score,
          review
        }
      });
    } else {
      // Create rating
      await prisma.rating.create({
        data: {
          userId,
          novelId,
          score,
          review
        }
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Rate novel error:", error);
    return { success: false, error: error.message };
  }
} 