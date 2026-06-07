"use client";

import dynamic from "next/dynamic";

// Client-only auth shell (no SSR prerender) — true client-side rendering.
const AuthShell = dynamic(
  () => import("@/components/auth-shell").then((m) => m.AuthShell),
  { ssr: false },
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
