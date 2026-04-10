"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_30%)]" />
      <div className="absolute inset-0 -z-10 bg-dashboard-grid bg-[size:36px_36px] opacity-30" />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        <SidebarNav pathname={pathname} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
