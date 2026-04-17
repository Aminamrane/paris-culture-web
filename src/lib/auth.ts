import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabaseAdmin } from "./supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "lumina-secret-key-fallback-2025",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fallback admin account (works without DB)
        if (
          credentials.email === "admin@lumina.fr" &&
          credentials.password === "Lumina2026!"
        ) {
          return { id: "admin-1", email: "admin@lumina.fr", name: "Admin", role: "admin", certified: true };
        }

        try {
          const bcrypt = await import("bcryptjs");

          const { data: user } = await supabaseAdmin
            .from("users")
            .select("id, email, name, password, role, certified")
            .eq("email", credentials.email as string)
            .single();

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            certified: user.certified,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.certified = (user as { certified?: boolean }).certified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session.user as { certified?: boolean }).certified = token.certified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
