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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      <SidebarNav pathname={pathname} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} />

      <main className="min-h-screen lg:ml-[280px]">
        <Topbar pathname={pathname} navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />

        <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
