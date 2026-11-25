"use client";
import Link from "next/link";
import { ChevronRight, Menu, Scissors } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";

function pageName(pathname: string) {
  if (pathname.includes("/review") || pathname.includes("/clips/"))
    return "Clip review";
  if (pathname.startsWith("/projects/new")) return "New project";
  if (pathname.startsWith("/projects/")) return "Project";
  if (pathname === "/projects") return "Projects";
  if (pathname === "/publish") return "Publishing";
  if (pathname.includes("/channels")) return "Channels";
  return "Overview";
}
export function Topbar({
  pathname,
  onOpenNav,
  navOpen,
}: {
  pathname: string;
  onOpenNav: () => void;
  navOpen: boolean;
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-controls="mobile-nav"
          aria-expanded={navOpen}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-control hover:bg-secondary lg:hidden"
          onClick={onOpenNav}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href={appRoutes.dashboard}
          className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
        >
          Workspace
        </Link>
        <ChevronRight
          className="hidden h-3.5 w-3.5 text-muted-foreground sm:block"
          aria-hidden="true"
        />
        <span className="truncate text-sm font-medium">
          {pageName(pathname)}
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Video clipping</span>
      </span>
    </header>
  );
}
