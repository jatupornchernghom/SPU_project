"use server";

import { signOut } from "@/lib/auth";

/**
 * Exported from its own "use server" file (rather than defined inline) so it
 * can be imported into Client Components — e.g. the Sidebar — per Next.js's
 * Server Actions rules. Runs entirely server-side, so the redirect uses the
 * real incoming request/AUTH_URL — not `next-auth/react`'s client-side
 * signOut(), whose base URL falls back to a hardcoded "http://localhost:3000"
 * on any host that doesn't expose NEXTAUTH_URL to the browser (i.e. always,
 * since it's not NEXT_PUBLIC_-prefixed).
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
