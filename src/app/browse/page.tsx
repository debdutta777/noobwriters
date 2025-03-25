'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NovelCard } from '@/components/novels/NovelCard';
import { GenreSelector } from '@/components/navigation/GenreSelector';
import Link from 'next/link';

// List of all genres, matching those in your database
const genres = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Adventure",
  "Mystery",
  "Horror",
  "Thriller",
  "Historical",
  "Comedy",
  "Drama",
  "Action",
  "Urban Fantasy",
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const genreFilter = searchParams.get('genre') || 'all';
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch novels with optional genre filter
        const url = genreFilter !== 'all' 
          ? `/api/novels?genre=${genreFilter}&limit=20` 
          : '/api/novels?limit=20';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch novels');
        }
        
        const data = await response.json();
        setNovels(data.novels || []);
      } catch (err) {
        console.error('Error fetching novels:', err);
        setError('Failed to load novels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, [genreFilter]);

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar with genre filter */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 md:p-6 md:min-h-screen md:border-r border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Browse Novels</h2>
        <GenreSelector genres={genres} activeGenre={genreFilter} />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6">
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
        
        {/* Display novels */}
        {!loading && !error && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {genreFilter === 'all' ? 'All Novels' : `${genreFilter} Novels`}
            </h1>
            
            {novels.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {novels.map(novel => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  No novels found for this genre.
                </p>
                {genreFilter !== 'all' && (
                  <Link href="/browse" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Browse All Novels
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 