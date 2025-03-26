"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  userRole: null,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Internal provider that uses the session
function AuthState({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    userRole: null,
    logout: async () => {},
  });

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ callbackUrl: "/" });
    };

    setAuthState({
      isAuthenticated: !!session?.user,
      isLoading: status === "loading",
      userId: session?.user?.id || null,
      userRole: session?.user?.userRole || null,
      logout: handleLogout,
    });
  }, [session, status]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthState>{children}</AuthState>
    </SessionProvider>
  );
}

// HOC to protect routes that require authentication
export function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Please log in to view this page.</p>
          <a 
            href="/login" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// HOC to protect routes that require specific roles
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[]
): React.FC<P> {
  return function RoleProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Please log in to view this page.</p>
          <a 
            href="/login" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      );
    }
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access this page.</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
} 