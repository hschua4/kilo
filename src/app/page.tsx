"use client";

import dynamic from "next/dynamic";

// Client-only landing page (no SSR prerender) — true client-side rendering.
const HomeView = dynamic(
  () => import("@/components/home-view").then((m) => m.HomeView),
  { ssr: false },
);

export default function Home() {
  return <HomeView />;
}
