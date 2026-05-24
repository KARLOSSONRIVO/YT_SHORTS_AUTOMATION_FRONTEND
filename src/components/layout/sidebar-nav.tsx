import Link from "next/link";
import { Film, LayoutDashboard, Rocket, Settings2, UploadCloud, Plus } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: appRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: appRoutes.projects, label: "Projects", icon: Film },
  { href: appRoutes.publish, label: "Publish", icon: Rocket },
  { href: appRoutes.channels, label: "Channels", icon: Settings2 }
];

export function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-background flex flex-col py-6 px-4 z-50 border-r border-border/40">
      <div className="mb-10 px-2">
        <h1 className="font-heading text-2xl font-bold text-primary tracking-tight">Studio Pro</h1>
        <p className="font-body text-sm text-muted-foreground">Automation Suite</p>
      </div>
      
      <nav className="flex-grow flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg font-body transition-all duration-200 ease-in-out",
                isActive 
                  ? "text-primary font-bold border-r-2 border-accent bg-card" 
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 pt-6 border-t border-border/40">
        <Link 
          href={appRoutes.uploadsNew}
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-200 neon-glow-primary"
        >
          <Plus className="h-5 w-5" />
          Create Project
        </Link>
        
        <div className="mt-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-card overflow-hidden flex items-center justify-center text-primary font-bold border border-border">
            WS
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">Workspace</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
