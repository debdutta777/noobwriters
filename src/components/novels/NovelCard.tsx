"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

type NovelAuthor = {
  id: string;
  name: string;
  image?: string;
};

export interface NovelCardProps {
  novel: {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    author?: {
      id: string;
      name: string;
      image?: string;
    };
    genres?: string[] | Array<{id: string, name: string}>;
    status?: string;
    rating?: number;
    viewCount?: number;
  };
}

export const NovelCard = ({ novel }: NovelCardProps) => {
  const {
    id,
    title,
    description,
    coverImage,
    author,
    genres = [], // Default to empty array if undefined
    status,
    rating = 0, // Default to 0 if undefined
    viewCount = 0, // Default to 0 if undefined
  } = novel;

  // Default placeholder image if cover is not available
  const imageUrl = coverImage || "/images/placeholder-cover.jpg";
  const authorName = author?.name || "Unknown Author";
  const authorImageUrl = author?.image || "/images/placeholder-author.jpg";

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/novel/${id}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse absolute" />
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
            onLoad={(e) => {
              // Hide the loading skeleton when image loads
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent) {
                const skeleton = parent.querySelector("div");
                if (skeleton) skeleton.classList.add("hidden");
              }
            }}
          />
          {status === "COMPLETED" && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
              Completed
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <h3 className="text-white font-bold text-lg truncate">{title}</h3>
            <p className="text-gray-300 text-sm truncate">{authorName}</p>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {genres && genres.length > 0 ? (
            genres.slice(0, 2).map((genre) => {
              // Handle both string and object genre formats
              const genreName = typeof genre === 'string' ? genre : genre.name;
              return (
                <Link
                  key={typeof genre === 'string' ? genre : genre.id}
                  href={`/browse?genre=${genreName}`}
                  className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  {genreName}
                </Link>
              );
            })
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">No genres</span>
          )}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-500 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{formatNumber(viewCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 