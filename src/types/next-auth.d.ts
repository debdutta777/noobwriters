import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userRole?: string;
    }
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userRole?: string;
  }
} 