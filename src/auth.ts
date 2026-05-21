import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const email = (credentials.email as string).trim();
        const password = (credentials.password as string).trim();

        console.log("Attempting login for:", email);

        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (userRecord.length === 0) {
          console.log("User not found in DB");
          return null;
        }

        const user = userRecord[0];
        console.log("Input password:", password);
        console.log("Input password length:", password.length);
        console.log("DB hash:", user.password);
        console.log("DB hash length:", user.password.length);
        
        const passwordsMatch = await bcrypt.compare(password, user.password);

        console.log("Password match result:", passwordsMatch);

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: `${user.name} ${user.surname}`,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
