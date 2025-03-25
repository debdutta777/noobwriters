"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SupabaseConfigPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [serviceRole, setServiceRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [updateResults, setUpdateResults] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch current test results on load
  useEffect(() => {
    async function fetchTestResults() {
      try {
        const response = await fetch("/api/test-supabase");
        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        console.error("Failed to fetch test results:", error);
      }
    }

    fetchTestResults();
  }, []);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/test-supabase");
      const data = await response.json();
      setTestResults(data);
    } catch (error: any) {
      setError(error.message || "Failed to test Supabase connection");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUpdateResults(null);
    
    try {
      const response = await fetch("/api/set-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supabaseUrl,
          supabaseKey,
          serviceRole,
        }),
      });
      
      const data = await response.json();
      setUpdateResults(data);
      
      if (data.status === "error") {
        setError(data.message);
      } else {
        // Re-test after updating
        const testResponse = await fetch("/api/test-supabase");
        const testData = await testResponse.json();
        setTestResults(testData);
      }
    } catch (error: any) {
      setError(error.message || "Failed to update environment variables");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Configuration</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Warning:</strong> This page is for development purposes only and should not be accessible in production.
          <br />
          <Link href="/SUPABASE_ENV_SETUP.md" className="underline">Read the Supabase setup guide</Link> for more information.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-gray-800 dark:text-white">
            {testResults ? (
              <div>
                <h3 className="font-medium mb-2">Environment Variables</h3>
                <ul className="mb-4 space-y-1">
                  {Object.entries(testResults.tests.environmentVariables).map(([key, value]: [string, any]) => (
                    <li key={key} className="flex items-center">
                      <span className="font-medium mr-2">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
                
                <h3 className="font-medium mb-2">Client Test</h3>
                <div className={`p-3 rounded mb-4 ${testResults.tests.clientTest?.success ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                  <p>{testResults.tests.clientTest?.message}</p>
                </div>
                
                <h3 className="font-medium mb-2">Admin Test</h3>
                <div className={`p-3 rounded ${testResults.tests.adminTest?.success ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                  <p>{testResults.tests.adminTest?.message}</p>
                </div>
                
                <button 
                  onClick={handleTest}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Testing..." : "Re-test Connection"}
                </button>
              </div>
            ) : (
              <p>Loading test results...</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Update Configuration</h2>
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:text-white">
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label htmlFor="supabaseUrl" className="block text-sm font-medium mb-1">
                  Supabase URL (NEXT_PUBLIC_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  id="supabaseUrl"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="https://your-project.supabase.co"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="supabaseKey" className="block text-sm font-medium mb-1">
                  Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="text"
                  id="supabaseKey"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="eyJhbGci..."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="serviceRole" className="block text-sm font-medium mb-1">
                  Supabase Service Role (SUPABASE_SERVICE_ROLE_KEY)
                </label>
                <input
                  type="text"
                  id="serviceRole"
                  value={serviceRole}
                  onChange={(e) => setServiceRole(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="eyJhbGci..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The service role key is highly privileged, use it carefully
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Configuration"}
              </button>
            </form>
            
            {updateResults && (
              <div className={`mt-4 p-3 rounded ${updateResults.status === "success" ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                <p className="font-medium">{updateResults.message}</p>
                {updateResults.environmentVariables && (
                  <ul className="mt-2">
                    {Object.entries(updateResults.environmentVariables).map(([key, value]: [string, any]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 