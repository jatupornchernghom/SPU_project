import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      restaurantId?: string;
    };
  }

  interface User {
    role?: UserRole;
    restaurantId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    restaurantId?: string;
  }
}

/** Google sign-in creates student accounts for this domain only. */
const STUDENT_EMAIL_DOMAIN = "spumail.net";

// Only offered when the OAuth client is configured, so the app still runs
// (credentials only) on machines without AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Required when self-hosting outside Vercel (Render, Railway, Fly, Docker,
  // etc.) — Auth.js can't auto-detect the platform's host the way it does on
  // Vercel, so it rejects every request as an "UntrustedHost" unless told to
  // trust the incoming Host header. Safe here since NEXTAUTH_URL also pins
  // the expected origin.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectToDatabase();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
        if (!user) return null;

        // Accounts created through Google have no password.
        if (!user.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId?.toString(),
        };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            // `hd` pre-selects the university Google Workspace account in the
            // chooser; it's only a hint, so signIn() below enforces the rule.
            authorization: { params: { hd: STUDENT_EMAIL_DOMAIN, prompt: "select_account" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase();
      if (!email || profile?.email_verified !== true) return "/login?error=GoogleEmail";

      await connectToDatabase();
      // An existing account with this address (including staff / restaurant
      // accounts an admin created) signs in as that account. Otherwise only
      // university addresses may sign up, always as a student.
      if (await User.exists({ email })) return true;
      if (!email.endsWith(`@${STUDENT_EMAIL_DOMAIN}`)) return "/login?error=GoogleDomain";

      await User.create({
        name: profile.name?.trim() || email.split("@")[0],
        email,
        avatar: typeof profile.picture === "string" ? profile.picture : undefined,
        role: "STUDENT",
      });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // `user` here is Google's profile — swap in our own account.
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email?.toLowerCase() });
        if (!dbUser) return null;
        token.id = dbUser._id.toString();
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.restaurantId = dbUser.restaurantId?.toString();
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      if (token.restaurantId) session.user.restaurantId = token.restaurantId;
      return session;
    },
  },
});
