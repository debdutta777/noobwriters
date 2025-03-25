'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthorDashboard() {
  const { data: session, status } = useSession();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch novels if the user is authenticated
    if (status === 'authenticated') {
      fetchNovels();
    }
  }, [status]);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/author/novels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch novels');
      }
      
      const data = await response.json();
      setNovels(data.novels || []);
    } catch (error) {
      console.error('Error fetching novels:', error);
      setError('Failed to load your novels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need to be signed in to access this page.</p>
          <Link
            href="/auth/signin"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Author Dashboard</h1>
        <Link
          href="/author/create-novel"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Create New Novel
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Novels</h2>
        
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading your novels...</p>
        ) : novels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((novel: any) => (
              <div 
                key={novel.id} 
                className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                  {novel.coverImage ? (
                    <img 
                      src={novel.coverImage} 
                      alt={novel.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500 dark:text-gray-400">No Cover</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{novel.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Status: {novel.status}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {novel._aggr_count_chapters} Chapters
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      href={`/author/edit-novel/${novel.id}`}
                      className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Edit Novel
                    </Link>
                    <Link
                      href={`/author/novel/${novel.id}/chapters`}
                      className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
                    >
                      Manage Chapters
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any novels yet.</p>
            <Link
              href="/author/create-novel"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Start Writing Your First Novel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 