"use client";

import Link from "next/link";
import {
  Scissors,
  LayoutDashboard,
  FolderOpen,
  Send,
  Radio,
  Plus,
  LogOut,
} from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: appRoutes.dashboard, label: "Overview", icon: LayoutDashboard },
  { href: appRoutes.projects, label: "Projects", icon: FolderOpen },
  { href: appRoutes.publish, label: "Publishing", icon: Send },
  { href: appRoutes.channels, label: "Channels", icon: Radio },
];

export function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-card px-4 py-5">
      <Link
        href={appRoutes.dashboard}
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2 py-2 text-lg font-semibold tracking-tight"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-white">
          <Scissors className="h-4 w-4" />
        </span>
        Studio Pro
      </Link>
      <p className="mb-7 mt-1 pl-12 text-xs text-muted-foreground">
        Clipping workspace
      </p>
      <Button type="button" asChild className="mb-6 w-full justify-start">
        <Link href={appRoutes.createProject} onClick={onNavigate}>
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </Button>
      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === appRoutes.projects
              ? pathname.startsWith(href) &&
                !pathname.startsWith(appRoutes.createProject)
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition-colors",
                isActive
                  ? "bg-accent font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t pt-4">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
            {(user?.displayName || "U").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.displayName || "Workspace"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex w-[232px] flex-col border-r bg-card">
      <SidebarContent pathname={pathname} />
    </aside>
  );
}
