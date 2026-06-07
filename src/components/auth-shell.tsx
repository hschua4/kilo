"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActivityIcon } from "lucide-react";
import { useSession } from "@/lib/auth-client";

/**
 * Auth pages shell. Rendered client-only (see the layout's dynamic import with
 * `ssr: false`) so the session redirect never runs during the prerender pass.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) router.replace("/dashboard");
  }, [session, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ActivityIcon className="size-5" />
          </span>
          <span className="text-lg">Kilo</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
