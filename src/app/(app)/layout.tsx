import Link from "next/link";
import { ActivityIcon } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ActivityIcon className="size-4" />
            </span>
            ScaleIq
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 pb-28">
        {children}
      </main>

      <BottomNav name={user.name} email={user.email} />
    </div>
  );
}
