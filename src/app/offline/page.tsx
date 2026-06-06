import { ActivityIcon } from "lucide-react";
import type { Metadata } from "next";

// Cached by the service worker at install time and shown when a navigation
// fails offline. Kept fully static so it renders without any network or auth.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Offline — Kilo",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ActivityIcon className="size-6" />
      </span>
      <h1 className="text-lg font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Kilo needs a connection to load your latest weigh-ins. Check your
        network and try again — your data is safe.
      </p>
    </div>
  );
}
