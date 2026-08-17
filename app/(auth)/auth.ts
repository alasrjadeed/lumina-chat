import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import {
  createGuestUser,
  findOrCreateOAuthUser,
  getUser,
} from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "");
        const password = String(credentials.password ?? "");
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth sign-in: find or create user in our database
      if (
        account?.provider &&
        account.provider !== "credentials" &&
        account.provider !== "guest"
      ) {
        if (!account.providerAccountId || !user.email) {
          return false;
        }

        try {
          const dbUser = await findOrCreateOAuthUser({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: String(account.access_token ?? ""),
            refreshToken: String(account.refresh_token ?? ""),
            expiresAt: account.expires_at,
            tokenType: String(account.token_type ?? ""),
            scope: String(account.scope ?? ""),
            idToken: String(account.id_token ?? ""),
            sessionState: String(account.session_state ?? ""),
          });

          // Update the user object with our DB id and type
          user.id = dbUser.id;
          (user as { type: UserType }).type = "regular";
        } catch (error) {
          console.error("OAuth sign-in failed:", error);
          return false;
        }
      }

      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      // For OAuth, the id is set in the signIn callback
      if (
        account?.provider &&
        account.provider !== "credentials" &&
        account.provider !== "guest"
      ) {
        token.id = user.id as string;
        token.type = "regular";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
