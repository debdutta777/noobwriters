'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-10">
          <Link href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300">
            Creator
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`hover:text-indigo-300 ${pathname === '/' ? 'text-indigo-400' : ''}`}>
              Home
            </Link>
            <Link href="/browse" className={`hover:text-indigo-300 ${pathname === '/browse' ? 'text-indigo-400' : ''}`}>
              Browse
            </Link>
            <Link href="/rankings" className={`hover:text-indigo-300 ${pathname === '/rankings' ? 'text-indigo-400' : ''}`}>
              Rankings
            </Link>
            <Link href="/latest" className={`hover:text-indigo-300 ${pathname === '/latest' ? 'text-indigo-400' : ''}`}>
              Latest
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/bookshelf" className={`hover:text-indigo-300 ${pathname === '/bookshelf' ? 'text-indigo-400' : ''}`}>
                Bookshelf
              </Link>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  {session?.user?.name ? (
                    <span>{session.user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <span>U</span>
                  )}
                </div>
                <span className="ml-2">{session?.user?.name || 'User'}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-4 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-indigo-300">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-4 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 