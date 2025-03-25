import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the handler using the auth options
const handler = NextAuth(authOptions);

// Export only the HTTP method handlers as required by Next.js 15
export { handler as GET, handler as POST }; 