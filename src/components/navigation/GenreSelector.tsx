"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface GenreSelectorProps {
  genres: string[];
  activeGenre?: string;
}

export const GenreSelector = ({ genres, activeGenre: propActiveGenre }: GenreSelectorProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const searchParams = useSearchParams();
  const activeGenre = propActiveGenre || searchParams.get("genre") || "";

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      
      return () => {
        scrollContainer.removeEventListener("scroll", checkScroll);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300; // Adjust as needed
    const currentScroll = scrollContainerRef.current.scrollLeft;
    
    scrollContainerRef.current.scrollTo({
      left: direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative flex items-center">
      {showLeftArrow && (
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-8 space-x-2 scroll-smooth"
      >
        <Link
          href="/browse"
          className={`py-1 px-4 text-sm rounded-full whitespace-nowrap ${
            !activeGenre
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          All Genres
        </Link>
        
        {genres.map((genre) => (
          <Link
            key={genre}
            href={`/browse?genre=${genre}`}
            className={`py-1 px-4 text-sm rounded-full whitespace-nowrap ${
              activeGenre === genre
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {genre}
          </Link>
        ))}
      </div>
      
      {showRightArrow && (
        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}; 