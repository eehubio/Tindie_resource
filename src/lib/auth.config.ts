import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config — NO database or Node-only imports.
 * Used by middleware (Edge runtime). The full config in auth.ts
 * extends this and adds the Drizzle adapter + Credentials provider.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // real providers added in auth.ts (Node runtime)
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role || "user";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role || "user";
      return session;
    },
  },
};
