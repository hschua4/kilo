"use client";

import { useEffect, useRef } from "react";
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
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/sign-in");
  }, [isPending, session, router]);

  // iOS PWA bug: on launch from the home screen, the home-indicator region
  // isn't measured yet, so `env(safe-area-inset-bottom)` evaluates too large and
  // the bottom nav renders with an extra gap. The value only corrects once the
  // visual viewport settles, and the sole trigger for that (short of the user
  // swiping) is a scroll — a reflow or resize event won't recompute `env()`.
  // So we reproduce a 1px scroll once on launch, scoped to iOS standalone where
  // the bug exists. `pageshow` (not mount) is the real PWA-launch signal and
  // also covers bfcache restores.
  useEffect(() => {
    if (isPending || !session?.user) return;
    const nav = navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (!isStandalone) return;

    function settleSafeArea() {
      const el = mainRef.current;
      if (!el) return;
      requestAnimationFrame(() => {
        el.scrollTop = 1;
        requestAnimationFrame(() => {
          el.scrollTop = 0;
        });
      });
    }

    settleSafeArea();
    window.addEventListener("pageshow", settleSafeArea);
    return () => window.removeEventListener("pageshow", settleSafeArea);
  }, [isPending, session]);

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

      <main
        ref={mainRef}
        className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 py-6"
      >
        {children}
      </main>

      <BottomNav name={user.name} email={user.email} />
    </div>
  );
}
