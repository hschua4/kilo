"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActivityIcon } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { BottomNav } from "@/components/bottom-nav";
import { Spinner } from "@/components/ui/spinner";

/**
 * Authenticated app shell. Rendered client-only (see the layout's dynamic
 * import with `ssr: false`) so the session check and chrome never run during
 * the build-time prerender pass.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/sign-in");
  }, [isPending, session, router]);

  // Gate the authenticated shell on the client until the session resolves.
  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const user = session.user;

  return (
    // Fixed-height shell so the document itself never scrolls. Only `main`
    // scrolls internally — this keeps the mobile browser chrome from
    // collapsing/expanding (which made the fixed bottom nav jump on navigation).
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="z-10 shrink-0 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ActivityIcon className="size-4" />
            </span>
            Kilo
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 pt-6 py-6 pb-44">
        {children}
      </main>

      <BottomNav name={user.name} email={user.email} />
    </div>
  );
}
