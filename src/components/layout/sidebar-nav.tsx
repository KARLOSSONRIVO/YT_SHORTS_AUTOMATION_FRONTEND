"use client";

import Link from "next/link";
import { Film, LayoutDashboard, Rocket, Settings2, Plus } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: appRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: appRoutes.projects, label: "Projects", icon: Film },
  { href: appRoutes.publish, label: "Publish", icon: Rocket },
  { href: appRoutes.channels, label: "Channels", icon: Settings2 }
];

function initialsFrom(displayName?: string, email?: string) {
  const name = displayName?.trim();
  if (name) {
    const letters = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    if (letters) return letters;
  }
  const trimmedEmail = email?.trim();
  if (trimmedEmail) return trimmedEmail[0]!.toUpperCase();
  return "U";
}

export function SidebarContent({
  pathname,
  onNavigate
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const initials = initialsFrom(user?.displayName, user?.email);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-secondary/25 via-transparent to-transparent py-6 px-4">
      <div className="mb-10 px-2">
        <h1 className="font-display text-[1.6rem] font-medium tracking-tight text-primary">Studio Pro</h1>
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Automation Suite</p>
      </div>

      <nav className="flex-grow flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-control font-body transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-secondary text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-b before:from-primary before:to-accent before:content-['']"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-6 border-t border-border/60">
        <Button asChild className="w-full neon-glow-primary">
          <Link href={appRoutes.createProject} onClick={onNavigate}>
            <Plus className="h-5 w-5" />
            Create Project
          </Link>
        </Button>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-primary font-bold border border-border">
            {initials}
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">
              {user?.displayName ?? "Workspace"}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">
              {user?.email ?? "Not signed in"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden lg:flex h-full w-[280px] flex-col border-r border-border/60 bg-background">
      <SidebarContent pathname={pathname} />
    </aside>
  );
}
