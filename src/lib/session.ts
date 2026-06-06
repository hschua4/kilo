import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Returns the current Better Auth session, or null if unauthenticated. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** For server components/pages: redirects to /sign-in when not authenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

/** For route handlers: returns the user or null (caller returns 401). */
export async function getApiUser() {
  const session = await getSession();
  return session?.user ?? null;
}
