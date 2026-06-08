import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { HomeView } from "@/components/home-view";

// Server-rendered entry point. Authenticated users are redirected to the
// dashboard before any landing markup is sent, so opening the installed PWA
// (start_url "/") never flashes the marketing page. Reading the session marks
// this route dynamic.
export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  return <HomeView />;
}
