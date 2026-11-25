"use client";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./mobile-nav";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:p-3 focus:text-white"
      >
        Skip to content
      </a>
      <SidebarNav pathname={pathname} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} />
      <div className="min-h-screen lg:ml-[232px]">
        <Topbar
          pathname={pathname}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
        />
        <main
          id="workspace-content"
          className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
