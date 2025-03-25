'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const error = searchParams.get('error');
    
    switch (error) {
      case 'CredentialsSignin':
        setErrorMessage('Invalid email or password. Please try again.');
        break;
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        setErrorMessage('Error signing in with authentication provider. Please try again.');
        break;
      case 'OAuthAccountNotLinked':
        setErrorMessage('The email is already associated with another account. Please sign in using the original provider.');
        break;
      case 'EmailSignin':
        setErrorMessage('Error sending the email. Please try again.');
        break;
      case 'SessionRequired':
        setErrorMessage('You must be signed in to access this page.');
        break;
      case 'Configuration':
        setErrorMessage('There is a problem with the server configuration. Please contact support.');
        break;
      case 'AccessDenied':
        setErrorMessage('You do not have permission to access this resource.');
        break;
      default:
        setErrorMessage('An unknown error occurred. Please try again.');
        break;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Return to Sign In
          </Link>
          
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 