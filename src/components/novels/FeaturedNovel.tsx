"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNumber, truncateText } from "@/lib/utils";

export interface FeaturedNovelProps {
  novel: {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    author?: {
      id: string;
      name: string;
    };
    viewCount?: number;
    chaptersCount?: number;
    genres?: string[];
    status?: string;
  };
}

export const FeaturedNovel = ({ novel }: FeaturedNovelProps) => {
  if (!novel) {
    return null;
  }

  const formatCount = (count: number = 0) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cover Image */}
        <div className="relative h-64 md:h-auto">
          <Image
            src={novel.coverImage || '/images/default-cover.jpg'}
            alt={novel.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        {/* Content */}
        <div className="p-6 col-span-2">
          <h2 className="text-2xl font-bold mb-2">{novel.title}</h2>
          
          {novel.author && (
            <div className="mb-4">
              <span className="text-gray-600 dark:text-gray-400">by </span>
              <Link href={`/author/${novel.author.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {novel.author.name}
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {formatCount(novel.viewCount || 0)} views
            </div>
            {novel.chaptersCount !== undefined && (
              <div>
                <span>{novel.chaptersCount} chapters</span>
              </div>
            )}
            {novel.status && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                {novel.status}
              </div>
            )}
          </div>

          {/* Description */}
          {novel.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              {novel.description}
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {novel.genres && Array.isArray(novel.genres) && novel.genres.map((genre) => (
              <Link
                key={genre}
                href={`/browse?genre=${genre}`}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm"
              >
                {genre}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/novel/${novel.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Read Now
            </Link>
            <Link
              href={`/novel/${novel.id}`}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 