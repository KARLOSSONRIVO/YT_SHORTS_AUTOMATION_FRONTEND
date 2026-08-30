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
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-48 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute right-[-12rem] top-1/4 h-[36rem] w-[36rem] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-accent-2/[0.08] blur-[130px]" />
      </div>
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
