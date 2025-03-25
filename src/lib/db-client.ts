import { supabaseClient, supabaseAdmin } from "./supabase";

// Novel operations
export async function getNovels({ 
  limit = 10, 
  offset = 0, 
  genre = null, 
  status = null, 
  search = null 
}) {
  try {
    let query = supabaseClient
      .from('novels')
      .select(`
        *,
        author:users!authorId(*),
        genres!inner(*),
        bookmarks_count:bookmarks(count),
        ratings_count:ratings(count),
        chapters_count:chapters(count)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (genre) {
      query = query.eq('genres.name', genre);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, novels: data };
  } catch (error: any) {
    console.error("Get novels error:", error);
    return { success: false, error: error.message };
  }
}

export async function getNovelById(id: string) {
  try {
    // Get novel with author and genre info
    const { data: novel, error: novelError } = await supabaseClient
      .from('novels')
      .select(`
        *,
        author:users!authorId(id, name, image, bio),
        genres(*),
        chapters(
          id, title, chapter_number, is_premium, coins_cost, created_at, word_count, view_count
        )
      `)
      .eq('id', id)
      .single();

    if (novelError) throw novelError;
    if (!novel) throw new Error("Novel not found");

    // Get ratings info
    const { data: ratings, error: ratingsError } = await supabaseClient
      .from('ratings')
      .select('score')
      .eq('novel_id', id);

    if (ratingsError) throw ratingsError;

    // Calculate average rating
    const avgRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;

    // Get counts
    const { data: counts, error: countsError } = await supabaseClient
      .from('novels')
      .select(`
        bookmarks_count:bookmarks(count),
        ratings_count:ratings(count),
        chapters_count:chapters(count)
      `)
      .eq('id', id)
      .single();

    if (countsError) throw countsError;

    return {
      success: true,
      novel: {
        ...novel,
        avgRating,
        _count: {
          bookmarks: counts.bookmarks_count,
          ratings: counts.ratings_count,
          chapters: counts.chapters_count
        }
      },
    };
  } catch (error: any) {
    console.error("Get novel error:", error);
    return { success: false, error: error.message };
  }
}

// Chapter operations
export async function getChapterById(id: string, userId?: string) {
  try {
    const { data: chapter, error: chapterError } = await supabaseClient
      .from('chapters')
      .select(`
        *,
        novel:novels(
          *,
          author:users!authorId(id, name, image),
          genres(*)
        )
      `)
      .eq('id', id)
      .single();

    if (chapterError) throw chapterError;
    if (!chapter) throw new Error("Chapter not found");

    // Check if user has access to premium chapter
    let hasAccess = !chapter.is_premium;
    
    if (chapter.is_premium && userId) {
      // Check if author
      if (chapter.novel.author.id === userId) {
        hasAccess = true;
      } else {
        // Check if purchased
        const { data: purchase, error: purchaseError } = await supabaseClient
          .from('purchases')
          .select()
          .eq('user_id', userId)
          .eq('chapter_id', id)
          .maybeSingle();
        
        if (purchaseError) throw purchaseError;
        
        hasAccess = !!purchase;
      }
    }

    // Increment view count
    const { error: updateError } = await supabaseAdmin
      .from('chapters')
      .update({ view_count: chapter.view_count + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    // Update reading history if userId provided
    if (userId) {
      const { error: historyError } = await supabaseAdmin
        .from('reading_history')
        .upsert({
          user_id: userId,
          novel_id: chapter.novel.id,
          chapter_id: id,
          progress: 0,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,chapter_id'
        });

      if (historyError) throw historyError;
    }

    return {
      success: true,
      chapter: {
        ...chapter,
        hasAccess,
      },
    };
  } catch (error: any) {
    console.error("Get chapter error:", error);
    return { success: false, error: error.message };
  }
}

// User operations
export async function getUserById(id: string) {
  try {
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select(`
        id, name, email, image, bio, role, created_at, coins,
        novels_count:novels(count),
        comments_count:comments(count),
        following_count:follows!followerId(count),
        followers_count:follows!followingId(count)
      `)
      .eq('id', id)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    return { 
      success: true, 
      user: {
        ...user,
        _count: {
          novels: user.novels_count,
          comments: user.comments_count,
          following: user.following_count,
          followedBy: user.followers_count
        }
      } 
    };
  } catch (error: any) {
    console.error("Get user error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserNovels(userId: string) {
  try {
    const { data: novels, error } = await supabaseClient
      .from('novels')
      .select(`
        *,
        genres(*),
        bookmarks_count:bookmarks(count),
        ratings_count:ratings(count),
        chapters_count:chapters(count)
      `)
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      novels: novels.map(novel => ({
        ...novel,
        _count: {
          bookmarks: novel.bookmarks_count,
          ratings: novel.ratings_count,
          chapters: novel.chapters_count
        }
      }))
    };
  } catch (error: any) {
    console.error("Get user novels error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    const { data: bookmarks, error } = await supabaseClient
      .from('bookmarks')
      .select(`
        id,
        created_at,
        novel:novels(
          *,
          author:users!authorId(id, name, image),
          genres(*),
          bookmarks_count:bookmarks(count),
          ratings_count:ratings(count),
          chapters_count:chapters(count)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      bookmarks: bookmarks.map(b => ({
        id: b.id,
        createdAt: b.created_at,
        novel: {
          ...b.novel,
          _count: {
            bookmarks: b.novel.bookmarks_count,
            ratings: b.novel.ratings_count,
            chapters: b.novel.chapters_count
          }
        }
      })),
    };
  } catch (error: any) {
    console.error("Get user bookmarks error:", error);
    return { success: false, error: error.message };
  }
}

// Bookmark operations
export async function toggleBookmark(userId: string, novelId: string) {
  try {
    // Check if bookmark exists
    const { data: existingBookmark, error: checkError } = await supabaseClient
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabaseAdmin
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (deleteError) throw deleteError;
      
      return { success: true, bookmarked: false };
    } else {
      // Add bookmark
      const { error: createError } = await supabaseAdmin
        .from('bookmarks')
        .insert({
          user_id: userId,
          novel_id: novelId
        });

      if (createError) throw createError;
      
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
    const { data: existingRating, error: checkError } = await supabaseClient
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingRating) {
      // Update rating
      const { error: updateError } = await supabaseAdmin
        .from('ratings')
        .update({
          score,
          review
        })
        .eq('id', existingRating.id);

      if (updateError) throw updateError;
    } else {
      // Create rating
      const { error: createError } = await supabaseAdmin
        .from('ratings')
        .insert({
          user_id: userId,
          novel_id: novelId,
          score,
          review
        });

      if (createError) throw createError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Rate novel error:", error);
    return { success: false, error: error.message };
  }
} 