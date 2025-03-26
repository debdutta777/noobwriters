'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

// Add StarRating component
const StarRating = ({ rating, onChange, interactive = false }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} p-1`}
        >
          <svg 
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default function NovelDetailPage() {
  const params = useParams();
  const novelId = params.novelId as string;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [novel, setNovel] = useState(null);
  const [inBookshelf, setInBookshelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New state for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);

  // Format number helper function
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchNovelDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch novel details
        const response = await fetch(`/api/novels/${novelId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch novel details');
        }
        
        const data = await response.json();
        setNovel(data.novel);
        
        // Check if novel is in user's bookshelf if logged in
        if (session?.user) {
          try {
            const bookshelfResponse = await fetch(`/api/users/bookshelf?novelId=${novelId}`);
            if (bookshelfResponse.ok) {
              const bookshelfData = await bookshelfResponse.json();
              setInBookshelf(bookshelfData.inBookshelf);
            } else {
              // Silently fail bookshelf check - this isn't critical functionality
              console.error('Failed to check bookshelf status:', await bookshelfResponse.text());
            }
          } catch (bookshelfError) {
            console.error('Error checking bookshelf:', bookshelfError);
          }
        }
      } catch (err) {
        console.error('Error fetching novel details:', err);
        setError('Failed to load novel details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (novelId) {
      fetchNovelDetails();
    }
  }, [novelId, session]);

  // Add useEffect for loading reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!novelId) return;
      
      setReviewsLoading(true);
      setReviewsError('');
      
      try {
        const response = await fetch(`/api/novels/${novelId}/reviews?page=${reviewPage}&limit=5`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setTotalReviewPages(data.totalPages);

        // Check if user has already left a review
        if (session?.user) {
          const userReviewExists = data.reviews.find(review => 
            review.user?.email === session.user.email
          );
          
          if (userReviewExists) {
            setUserReview(userReviewExists.review || '');
            setUserRating(userReviewExists.score);
            setShowReviewForm(false);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewsError('Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [novelId, reviewPage, session]);

  const handleAddToBookshelf = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch('/api/users/bookshelf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ novelId }),
      });
      
      if (response.ok) {
        setInBookshelf(true);
      }
    } catch (error) {
      console.error('Error adding to bookshelf:', error);
    }
  };

  const handleRemoveFromBookshelf = async () => {
    try {
      const response = await fetch(`/api/users/bookshelf?novelId=${novelId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setInBookshelf(false);
      }
    } catch (error) {
      console.error('Error removing from bookshelf:', error);
    }
  };

  // Add review submission handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (userRating < 1) {
      alert('Please select a rating');
      return;
    }
    
    setReviewSubmitting(true);
    
    try {
      const response = await fetch(`/api/novels/${novelId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          score: userRating, 
          review: userReview 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      // Refresh reviews
      const reviewsResponse = await fetch(`/api/novels/${novelId}/reviews?page=1&limit=5`);
      const reviewsData = await reviewsResponse.json();
      
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
      setTotalReviews(reviewsData.totalReviews);
      setTotalReviewPages(reviewsData.totalPages);
      setReviewPage(1);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/novels/${novelId}/reviews`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      // Reset user review
      setUserReview('');
      setUserRating(0);
      
      // Refresh reviews
      const reviewsResponse = await fetch(`/api/novels/${novelId}/reviews?page=1&limit=5`);
      const reviewsData = await reviewsResponse.json();
      
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
      setTotalReviews(reviewsData.totalReviews);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
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
            href="/browse"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Browse Other Novels
          </Link>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Novel not found.
        </div>
        <div className="mt-4 flex justify-center">
          <Link 
            href="/browse"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Browse Available Novels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Novel Cover */}
          <div className="md:w-1/3 relative h-80 md:h-auto">
            <Image
              src={novel.coverImage || '/images/default-cover.jpg'}
              alt={novel.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          
          {/* Novel Details */}
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {novel.title}
            </h1>
            
            {novel.author && (
              <div className="mb-4">
                <span className="text-gray-600 dark:text-gray-400">by </span>
                <Link 
                  href={`/author/${novel.author.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {novel.author.name}
                </Link>
              </div>
            )}
            
            {/* Rating display */}
            <div className="flex items-center mb-4">
              <StarRating rating={Math.round(averageRating)} onChange={null} interactive={false} />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            {/* Status and Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              {novel.status && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {novel.status}
                </span>
              )}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{formatNumber(novel.viewCount || 0)} views</span>
              </div>
            </div>
            
            {/* Description */}
            {novel.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {novel.description}
                </p>
              </div>
            )}
            
            {/* Genres */}
            {novel.genres && novel.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {novel.genres.map((genre) => {
                    // Handle both string and object genre formats
                    const genreName = typeof genre === 'string' ? genre : genre.name;
                    const genreId = typeof genre === 'string' ? genre : genre.id;
                    
                    return (
                      <Link
                        key={genreId}
                        href={`/browse?genre=${genreName}`}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {genreName}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {novel.chapters && novel.chapters.length > 0 ? (
                <Link
                  href={`/novel/${novel.id}/chapter/${novel.chapters[0].id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Start Reading
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  No Chapters Available
                </button>
              )}
              
              {session ? (
                inBookshelf ? (
                  <button
                    onClick={handleRemoveFromBookshelf}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remove from Bookshelf
                  </button>
                ) : (
                  <button
                    onClick={handleAddToBookshelf}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Add to Bookshelf
                  </button>
                )
              ) : (
                <Link
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Login to Add to Bookshelf
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chapters Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Chapters
        </h2>
        
        {novel.chapters && novel.chapters.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
            {novel.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/novel/${novel.id}/chapter/${chapter.id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Ch. {chapter.chapterNumber}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{chapter.title}</span>
                  </div>
                  {chapter.isPremium && (
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                      Premium
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No chapters available yet.
            </p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reviews
          </h2>
          {session && !showReviewForm && userRating === 0 && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && session && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Write a Review
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating 
                  rating={userRating} 
                  onChange={setUserRating} 
                  interactive={true} 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  id="review"
                  rows={4}
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Share your thoughts about this novel..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || userRating < 1}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Existing Review */}
        {session && userRating > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="rounded-full overflow-hidden h-12 w-12 relative bg-gray-200">
                  {session.user.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
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
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {session.user.name || 'You'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Your review
                  </div>
                  <StarRating rating={userRating} onChange={null} interactive={false} />
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setShowReviewForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDeleteReview}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
            {userReview && (
              <div className="mt-3 text-gray-700 dark:text-gray-300">
                {userReview}
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviewsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {reviewsError}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              review.user?.email !== session?.user?.email && (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full overflow-hidden h-12 w-12 relative bg-gray-200">
                      {review.user?.image ? (
                        <Image 
                          src={review.user.image} 
                          alt={review.user.name || 'User'} 
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
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {review.user?.name || 'Anonymous User'}
                      </div>
                      <div className="flex">
                        <StarRating rating={review.score} onChange={null} interactive={false} />
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review && (
                        <div className="mt-2 text-gray-700 dark:text-gray-300">
                          {review.review}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            ))}

            {/* Pagination */}
            {totalReviewPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
                    disabled={reviewPage === 1}
                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 border-t border-b border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {reviewPage} of {totalReviewPages}
                  </span>
                  <button
                    onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
                    disabled={reviewPage === totalReviewPages}
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
              No reviews yet. Be the first to review this novel!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 