"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RegisterRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If user is already authenticated, redirect to author dashboard/create page
    if (status === 'authenticated' && session) {
      router.push('/author/dashboard');
    } else if (status === 'unauthenticated') {
      // If not authenticated, redirect to the new signup page
      router.push('/auth/signup');
    }
    // If status is 'loading', we'll wait
  }, [router, session, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
} 