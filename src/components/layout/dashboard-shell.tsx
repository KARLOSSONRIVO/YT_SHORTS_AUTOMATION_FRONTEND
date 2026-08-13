"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 overflow-x-hidden">
      <SidebarNav pathname={pathname} />
      
      {/* Main Content Area */}
      <main className="ml-[280px] min-h-screen">
        <Topbar pathname={pathname} />
        
        {/* Content Canvas */}
        <div className="p-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
