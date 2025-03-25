"use client";

import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AuthStatusPage() {
  const { data: session, status } = useSession();
  const { isAuthenticated, userId, userRole, isLoading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Status</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">NextAuth Session Status</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-700 dark:text-gray-300">Status: <span className="font-medium">{status}</span></p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Session Data:</p>
            <pre className="bg-gray-100 p-3 rounded dark:bg-gray-700 dark:text-gray-300 overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Auth Context Status</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-700 dark:text-gray-300">Is Loading: <span className="font-medium">{isLoading ? "Yes" : "No"}</span></p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">Is Authenticated: <span className="font-medium">{isAuthenticated ? "Yes" : "No"}</span></p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">User ID: <span className="font-medium">{userId || "Not set"}</span></p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">User Role: <span className="font-medium">{userRole || "Not set"}</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link 
          href="/login" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </Link>
        <Link 
          href="/register" 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Go to Register
        </Link>
        <Link 
          href="/" 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
} 