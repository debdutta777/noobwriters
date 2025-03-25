'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RankingsPage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    const fetchTopNovels = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch novels sorted by view count
        const response = await fetch(`/api/novels?sort=viewCount&order=desc&timeframe=${timeframe}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rankings');
        }
        
        const data = await response.json();
        setNovels(data.novels || []);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError('Failed to load rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopNovels();
  }, [timeframe]);

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Novel Rankings</h1>
        
        {/* Timeframe selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 rounded ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            This Week
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Rankings list */}
      {!loading && !error && (
        novels.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
            {novels.map((novel, index) => (
              <div key={novel.id} className="p-4 flex items-center">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="w-16 h-24 relative ml-3 flex-shrink-0">
                  <Image
                    src={novel.coverImage || '/images/default-cover.jpg'}
                    alt={novel.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <Link href={`/novel/${novel.id}`} className="text-lg font-semibold hover:text-blue-600 block">
                    {novel.title}
                  </Link>
                  <div className="flex flex-wrap mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>by {novel.author?.name || 'Unknown Author'}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {formatCount(novel.viewCount || 0)} views
                    </span>
                    {novel.chaptersCount !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{novel.chaptersCount} chapters</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap">
                    {novel.genres && novel.genres.slice(0, 3).map(genre => (
                      <Link 
                        key={genre} 
                        href={`/browse?genre=${genre}`}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-2 mb-1"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No novels found.
            </p>
          </div>
        )
      )}
    </div>
  );
} 