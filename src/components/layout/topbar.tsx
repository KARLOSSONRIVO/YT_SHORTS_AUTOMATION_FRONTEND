"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Settings2 } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
import { useAuth } from "@/features/auth/components/auth-provider";

function getPageTitle(pathname: string) {
  if (pathname === appRoutes.dashboard) return "Project overview";
  if (pathname === appRoutes.projects) return "Source video pipeline";
  if (pathname === appRoutes.publish) return "Queue approved clips";
  if (pathname.startsWith(appRoutes.channels)) return "YouTube channels";
  if (pathname === appRoutes.createProject) return "Create project";
  if (pathname.startsWith(`${appRoutes.projects}/`)) return "Project workspace";
  return "Studio Pro";
}

export function Topbar({
  pathname,
  navOpen,
  onOpenNav
}: {
  pathname: string;
  navOpen?: boolean;
  onOpenNav?: () => void;
}) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 lg:px-10 py-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          aria-expanded={navOpen ?? false}
          aria-controls="mobile-nav"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:text-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="rounded-full p-2 text-muted-foreground transition-colors hover:text-accent" title="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <Link
          aria-label="Settings"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:text-accent"
          href={appRoutes.channels}
          title="Settings"
        >
          <Settings2 className="h-5 w-5" />
        </Link>
        <button
          aria-label="Log out"
          className="ml-2 rounded-full border-l border-border/60 p-2 pl-5 text-muted-foreground transition-colors hover:text-accent"
          onClick={logout}
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
