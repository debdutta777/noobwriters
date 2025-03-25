'use client';

import { useState, useEffect } from 'react';
import { NovelCard } from '@/components/novels/NovelCard';
import Link from 'next/link';

export default function LatestPage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('updated'); // 'updated' or 'created'

  useEffect(() => {
    const fetchLatestNovels = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch latest novels based on filter (updated or created date)
        const sort = filter === 'updated' ? 'updatedAt' : 'createdAt';
        const response = await fetch(`/api/novels?sort=${sort}&order=desc&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch latest novels');
        }
        
        const data = await response.json();
        setNovels(data.novels || []);
      } catch (err) {
        console.error('Error fetching latest novels:', err);
        setError('Failed to load latest novels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNovels();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Latest Novels</h1>
        
        {/* Filter selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('updated')}
            className={`px-4 py-2 rounded ${
              filter === 'updated'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Recently Updated
          </button>
          <button
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded ${
              filter === 'created'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Newly Added
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
      
      {/* Display novels */}
      {!loading && !error && (
        novels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {novels.map(novel => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No novels found.
            </p>
            <Link href="/browse" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Browse All Novels
            </Link>
          </div>
        )
      )}
    </div>
  );
} 