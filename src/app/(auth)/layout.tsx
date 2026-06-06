import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ActivityIcon } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

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
          <span className="text-lg">ScaleIQ</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
