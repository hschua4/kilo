"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  TargetIcon,
  UserIcon,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/goal", label: "Goal", icon: TargetIcon },
  { href: "/insights", label: "Insights", icon: SparklesIcon },
] as const;

/**
 * Kilo bottom navigation (Design Guidelines §10). Five slots with the center
 * action permanently reserved for logging weight.
 */
export function BottomNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <nav className="z-20 shrink-0 border-t border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-5 items-center px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <NavTab {...tabs[0]} active={isActive(tabs[0].href)} />
        <NavTab {...tabs[1]} active={isActive(tabs[1].href)} />

        <div className="flex items-center justify-center">
          <Link
            href="/log"
            aria-label="Log weight"
            className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
          >
            <PlusIcon className="size-6" />
          </Link>
        </div>

        <NavTab {...tabs[2]} active={isActive(tabs[2].href)} />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-full min-h-11 flex-col items-center justify-center gap-1 text-muted-foreground outline-none",
              isActive("/profile") && "text-foreground",
            )}
          >
            <UserIcon className="size-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon data-icon="inline-start" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-full min-h-11 flex-col items-center justify-center gap-1 transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
