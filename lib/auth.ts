import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";

import { db } from "./db";

// get google auth secrets
function getGoogleCredentials() {
  // get env variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // throw error if env variables are missing
  if (!clientId || clientId.length === 0) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID environment variable."
    );
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error(
      "Missing GOOGLE_CLIENT_SECRET environment variable."
    );
  }

  // return env variables
  return {
    clientId,
    clientSecret,
  };
}

// auth options
export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt", // use JWTs for session
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    })
  ],
  callbacks: {
    // add user info to token
    async jwt({ token, user }) {
      // get user from database
      const dbUser = (await db.get(`user:${token.id}`)) as User | null;

      // if user doesn't exist in database, return token
      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      // if user exists in database, return user info in token
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
      }
    },
    // add user info to session
    async session({ session, token }) {
      // if token exists, add user info to session
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      // return session
      return session;
    },

    // redirect to dashboard after login
    redirect() {
      return '/dashboard';
    }
  },
}
