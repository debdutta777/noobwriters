import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { prisma } from "./prisma";
import { supabaseClient } from "./supabase";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try to authenticate with Supabase first
          const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            // If Supabase auth fails, fall back to our database
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
            });

            if (!user || !user.password) {
              return null;
            }

            const isPasswordValid = await compare(credentials.password, user.password);

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              userRole: user.userRole,
            };
          }

          // If Supabase auth succeeded, get or create the user in our database
          let user = await prisma.user.findUnique({
            where: {
              email: authData.user.email,
            },
          });

          if (!user) {
            // Create the user in our database if they don't exist yet
            user = await prisma.user.create({
              data: {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata.full_name || authData.user.email.split('@')[0],
                userRole: "READER",
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            userRole: user.userRole,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.userRole = token.userRole as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userRole = user.userRole;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 