"use client";

import dynamic from "next/dynamic";

// Client-only shell (no SSR prerender) — the whole authenticated app renders on
// the client.
const AppShell = dynamic(
  () => import("@/components/app-shell").then((m) => m.AppShell),
  { ssr: false },
);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
