'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ChapterDetailPage() {
  const params = useParams();
  const novelId = params.novelId as string;
  const chapterId = params.chapterId as string;
  const router = useRouter();
  const { data: session } = useSession();
  const commentSectionRef = useRef(null);
  
  const [chapter, setChapter] = useState(null);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canAccessPremium, setCanAccessPremium] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [totalCommentPages, setTotalCommentPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    const fetchChapterDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch chapter details
        const response = await fetch(`/api/chapters/${chapterId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapter details');
        }
        
        const data = await response.json();
        setChapter(data.chapter);
        setNovel(data.novel);
        setCanAccessPremium(data.canAccessPremium);
      } catch (err) {
        console.error('Error fetching chapter details:', err);
        setError('Failed to load chapter details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchChapterDetails();
    }
  }, [chapterId]);

  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!chapterId) return;
      
      setCommentsLoading(true);
      setCommentsError('');
      
      try {
        const response = await fetch(`/api/chapters/${chapterId}/comments?page=${commentPage}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data.comments);
        setTotalComments(data.totalComments);
        setTotalCommentPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setCommentsError('Failed to load comments');
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [chapterId, commentPage]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (!commentContent.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: commentContent 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Reset form and refresh comments
      setCommentContent('');
      
      // Refresh comments - go to first page
      setCommentPage(1);
      const commentsResponse = await fetch(`/api/chapters/${chapterId}/comments?page=1&limit=10`);
      const commentsData = await commentsResponse.json();
      
      setComments(commentsData.comments);
      setTotalComments(commentsData.totalComments);
      setTotalCommentPages(commentsData.totalPages);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (!replyContent.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reply');
      }
      
      // Reset form and refresh comments
      setReplyContent('');
      setReplyTo(null);
      
      // Refresh comments
      const commentsResponse = await fetch(`/api/chapters/${chapterId}/comments?page=${commentPage}&limit=10`);
      const commentsData = await commentsResponse.json();
      
      setComments(commentsData.comments);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Refresh comments
      const commentsResponse = await fetch(`/api/chapters/${chapterId}/comments?page=${commentPage}&limit=10`);
      const commentsData = await commentsResponse.json();
      
      setComments(commentsData.comments);
      setTotalComments(commentsData.totalComments);
      setTotalCommentPages(commentsData.totalPages);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4 flex justify-center">
          <Link 
            href={`/novel/${novelId}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Novel
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Chapter not found.
        </div>
        <div className="mt-4 flex justify-center">
          <Link 
            href={`/novel/${novelId}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Novel
          </Link>
        </div>
      </div>
    );
  }

  // Find previous and next chapters
  const chapterIndex = novel.chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = chapterIndex > 0 ? novel.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < novel.chapters.length - 1 ? novel.chapters[chapterIndex + 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Chapter Header */}
      <div className="mb-8">
        <Link 
          href={`/novel/${novel.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to {novel.title}
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Chapter {chapter.chapterNumber}: {chapter.title}
        </h1>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
          <span className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {chapter.viewCount || 0} views
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {new Date(chapter.updatedAt).toLocaleDateString()}
          </span>
          <button
            onClick={scrollToComments}
            className="ml-auto text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {totalComments} Comments
          </button>
        </div>
      </div>
      
      {/* Chapter Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        {chapter.isPremium && !canAccessPremium ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Premium Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This chapter is premium content. Purchase it to continue reading.
            </p>
            <button
              // Replace this with your purchase logic
              onClick={() => alert('Purchase functionality to be implemented')}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Purchase for {chapter.coinsCost || 5} Coins
            </button>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            {chapter.content ? (
              <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No content available for this chapter.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Chapter Navigation */}
      <div className="flex justify-between mb-8">
        {prevChapter ? (
          <Link
            href={`/novel/${novel.id}/chapter/${prevChapter.id}`}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous Chapter
          </Link>
        ) : (
          <div></div>
        )}
        
        {nextChapter ? (
          <Link
            href={`/novel/${novel.id}/chapter/${nextChapter.id}`}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            Next Chapter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <div></div>
        )}
      </div>
      
      {/* Comments Section */}
      <div ref={commentSectionRef} className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({totalComments})
        </h2>
        
        {/* Comment Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Leave a Comment
          </h3>
          {session ? (
            <form onSubmit={handleAddComment}>
              <div className="mb-4">
                <textarea
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Share your thoughts about this chapter..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to leave a comment.
              </p>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
        
        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : commentsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {commentsError}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {/* Comment */}
                <div className="flex items-start space-x-4">
                  <div className="rounded-full overflow-hidden h-12 w-12 relative bg-gray-200">
                    {comment.user?.image ? (
                      <Image 
                        src={comment.user.image} 
                        alt={comment.user.name || 'User'} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.user?.name || 'Anonymous User'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {session && (comment.user?.id === session.user.id || session.user.userRole === 'ADMIN') && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </div>
                    {session && (
                      <button 
                        onClick={() => setReplyTo(comment.id)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Reply Form */}
                {replyTo === comment.id && session && (
                  <div className="ml-16 mt-4">
                    <form onSubmit={(e) => handleAddReply(e, comment.id)}>
                      <div className="mb-2">
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Write a reply..."
                          required
                        ></textarea>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyContent.trim()}
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-16 mt-4 space-y-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 pt-2">
                        <div className="flex items-start space-x-3">
                          <div className="rounded-full overflow-hidden h-8 w-8 relative bg-gray-200">
                            {reply.user?.image ? (
                              <Image 
                                src={reply.user.image} 
                                alt={reply.user.name || 'User'} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {reply.user?.name || 'Anonymous User'}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {session && (reply.user?.id === session.user.id || session.user.userRole === 'ADMIN') && (
                                <button 
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div className="mt-1 text-gray-700 dark:text-gray-300 text-sm">
                              {reply.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Pagination */}
            {totalCommentPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCommentPage(prev => Math.max(prev - 1, 1))}
                    disabled={commentPage === 1}
                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 border-t border-b border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {commentPage} of {totalCommentPages}
                  </span>
                  <button
                    onClick={() => setCommentPage(prev => Math.min(prev + 1, totalCommentPages))}
                    disabled={commentPage === totalCommentPages}
                    className="px-3 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No comments yet. Be the first to comment on this chapter!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 