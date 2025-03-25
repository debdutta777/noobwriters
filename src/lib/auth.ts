import { supabaseClient } from "./supabase";
import { prisma } from "./prisma";
import { hash } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export async function signUp(email: string, password: string, name: string) {
  try {
    // Create user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Hash the password for our database
    const hashedPassword = await hash(password, 10);

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        password: hashedPassword,
        role: "READER",
      },
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Update password error:", error);
    return { success: false, error: error.message };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.userRole,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}; 