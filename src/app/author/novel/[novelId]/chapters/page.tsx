'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

type Chapter = {
  id: string;
  title: string;
  chapterNumber: number;
  status: string;
  isPremium: boolean;
  coinsCost: number;
  coverImage?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};

type Novel = {
  id: string;
  title: string;
  status: string;
  coverImage?: string;
};

export default function ChaptersPage() {
  const { novelId } = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchNovelAndChapters();
    }
  }, [authStatus, novelId]);
  
  const fetchNovelAndChapters = async () => {
    try {
      setLoading(true);
      
      // Fetch novel details
      const novelResponse = await fetch(`/api/author/novels/${novelId}`);
      if (!novelResponse.ok) {
        throw new Error('Failed to fetch novel details');
      }
      const novelData = await novelResponse.json();
      setNovel(novelData.novel);
      
      // Fetch chapters
      const chaptersResponse = await fetch(`/api/author/novels/${novelId}/chapters`);
      if (!chaptersResponse.ok) {
        throw new Error('Failed to fetch chapters');
      }
      const chaptersData = await chaptersResponse.json();
      setChapters(chaptersData.chapters || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load novel and chapters data');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePublishStatusChange = async (chapterId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/author/novels/${novelId}/chapters/${chapterId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update chapter status');
      }
      
      // Update the chapters list with the new status
      setChapters(prevChapters => 
        prevChapters.map(chapter => 
          chapter.id === chapterId 
            ? { ...chapter, status: newStatus } 
            : chapter
        )
      );
    } catch (error) {
      console.error('Error updating chapter status:', error);
      setError('Failed to update chapter status');
    }
  };
  
  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/author/novels/${novelId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }
      
      // Remove the deleted chapter from the list
      setChapters(prevChapters => 
        prevChapters.filter(chapter => chapter.id !== chapterId)
      );
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setError('Failed to delete chapter');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chapters...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/author/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dashboard
                </Link>
                <span>→</span>
                <span>{novel?.title || 'Novel'}</span>
              </div>
              <h1 className="text-3xl font-bold mt-2">Manage Chapters</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/author/novel/${novelId}/chapters/new/edit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add New Chapter
              </Link>
              <Link
                href={`/author/edit-novel/${novelId}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Edit Novel Details
              </Link>
            </div>
          </div>
          
          {/* Novel header card */}
          {novel && (
            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                {novel.coverImage ? (
                  <img 
                    src={novel.coverImage} 
                    alt={novel.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Cover
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{novel.title}</h2>
                <div className="flex items-center mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    novel.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : novel.status === 'HIATUS'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {novel.status}
                  </span>
                  <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                    {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            <span>{error}</span>
            <button
              type="button"
              className="float-right"
              onClick={() => setError('')}
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Chapters list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {chapters.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No chapters yet. Start creating your first chapter!
              </p>
              <Link
                href={`/author/novel/${novelId}/chapters/new/edit`}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add New Chapter
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chapter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Words
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {chapters
                    .sort((a, b) => a.chapterNumber - b.chapterNumber)
                    .map((chapter) => (
                      <tr key={chapter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3">
                              {chapter.coverImage ? (
                                <img 
                                  src={chapter.coverImage} 
                                  alt="" 
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Chapter {chapter.chapterNumber}: {chapter.title}
                              </div>
                              {chapter.isPremium && (
                                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                  Premium ({chapter.coinsCost} coins)
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chapter.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {chapter.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {chapter.wordCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(chapter.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(chapter.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {chapter.status === 'DRAFT' ? (
                              <button
                                onClick={() => handlePublishStatusChange(chapter.id, 'PUBLISHED')}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePublishStatusChange(chapter.id, 'DRAFT')}
                                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                              >
                                Unpublish
                              </button>
                            )}
                            <Link
                              href={`/author/novel/${novelId}/chapters/${chapter.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 