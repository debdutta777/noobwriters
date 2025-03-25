"use client";

import { useSupabase } from "@/context/SupabaseProvider";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { ReactNode, useEffect, createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, isLoading: supabaseLoading, signOut } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id: string | null;
    role: string | null;
  }>({
    id: null,
    role: null,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!supabaseLoading) {
        if (user) {
          try {
            // Fetch additional user data from Prisma-managed app_users table
            const supabase = getSupabaseBrowser();
            const { data, error } = await supabase
              .from('app_users')
              .select('id, userRole')
              .eq('id', user.id)
              .single();

            if (error) {
              console.error('Error fetching user data:', error);
              setUserData({ id: user.id, role: 'READER' });
            } else if (data) {
              setUserData({ id: data.id, role: data.userRole });
            }
          } catch (error) {
            console.error('Error in user data fetch:', error);
            setUserData({ id: user.id, role: 'READER' });
          }
        } else {
          setUserData({ id: null, role: null });
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, supabaseLoading]);

  const logout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    isAuthenticated: !!session,
    isLoading: isLoading || supabaseLoading,
    userId: userData.id,
    userRole: userData.role,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 