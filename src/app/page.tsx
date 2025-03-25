'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NovelCard } from "@/components/novels/NovelCard";
import { FeaturedNovel } from "@/components/novels/FeaturedNovel";
import { GenreSelector } from "@/components/navigation/GenreSelector";
import { useSession } from 'next-auth/react';

// Genres list only
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

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [trendingNovels, setTrendingNovels] = useState([]);
  const [recentNovels, setRecentNovels] = useState([]);
  const [featuredNovel, setFeaturedNovel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine the correct link for "Start Writing" based on auth state
  const startWritingLink = isAuthenticated ? '/author/dashboard' : '/auth/signup';

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      try {
        // Fetch trending novels (by view count)
        const trendingResponse = await fetch('/api/novels?sort=viewCount&order=desc&limit=5');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingNovels(trendingData.novels || []);
          
          // Set the first trending novel as featured if available
          if (trendingData.novels && trendingData.novels.length > 0) {
            setFeaturedNovel(trendingData.novels[0]);
          }
        }
        
        // Fetch recent novels
        const recentResponse = await fetch('/api/novels?sort=updatedAt&order=desc&limit=5');
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setRecentNovels(recentData.novels || []);
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomePageData();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="md:max-w-2xl mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover your next favorite novel
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Explore thousands of stories from talented authors around the
              world. Read, write, and connect with the Creator community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/browse"
                className="bg-white text-indigo-600 px-6 py-3 rounded-md font-medium shadow-md hover:bg-indigo-50 transition-colors"
              >
                Browse Novels
              </Link>
              <Link
                href={startWritingLink}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-indigo-700 transition-colors"
              >
                Start Writing
              </Link>
            </div>
          </div>
          <div className="relative w-full md:w-1/3 h-64 md:h-96">
            <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-2xl transform rotate-6"></div>
            <div className="absolute top-0 left-0 w-3/4 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-2xl transform -rotate-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4 bg-white rounded-lg shadow-lg p-2">
                <div className="absolute inset-0 m-2 bg-gray-100 flex flex-col">
                  <div className="h-1/2 bg-indigo-200 rounded-t-sm"></div>
                  <div className="p-4">
                    <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-300 rounded mb-4"></div>
                    <div className="h-2 w-full bg-gray-200 rounded my-1"></div>
                    <div className="h-2 w-full bg-gray-200 rounded my-1"></div>
                    <div className="h-2 w-4/5 bg-gray-200 rounded my-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Selector */}
      <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GenreSelector genres={genres} />
        </div>
      </section>

      {/* Featured Novel Section */}
      {featuredNovel && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Novel
            </h2>
            <FeaturedNovel novel={featuredNovel} />
          </div>
        </section>
      )}

      {/* Trending Novels Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trending Novels
            </h2>
            <Link
              href="/rankings"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : trendingNovels.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingNovels.map(novel => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No trending novels available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Updates
            </h2>
            <Link
              href="/latest"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : recentNovels.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentNovels.map(novel => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No recent updates available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sign-in Message for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-10 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In to Access More Novels
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Create an account or sign in to read and upload novels. Writers can publish their own stories
                and readers can enjoy content from talented authors.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-white border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            How Creator Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Create an Account
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sign up as a reader to enjoy novels or as an author to publish your own stories.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Read or Write
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse through novels or start writing your own chapters with our user-friendly editor.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Engage & Earn
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interact with the community through comments and ratings. Authors can earn through premium content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
