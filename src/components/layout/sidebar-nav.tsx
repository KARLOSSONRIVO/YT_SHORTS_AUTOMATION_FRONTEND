import Link from "next/link";
import { Film, LayoutDashboard, Rocket, Settings2, UploadCloud } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: appRoutes.dashboard, label: "Overview", icon: LayoutDashboard },
  { href: appRoutes.uploadsNew, label: "Upload", icon: UploadCloud },
  { href: appRoutes.projects, label: "Projects", icon: Film },
  { href: appRoutes.publish, label: "Publish", icon: Rocket },
  { href: appRoutes.channels, label: "Channels", icon: Settings2 }
];

export function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col rounded-[32px] border border-border/70 bg-card/90 p-5 shadow-soft lg:flex">
      <div className="mb-8 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Shorts Studio</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Creator Ops</h2>
        <p className="mt-2 text-sm text-muted-foreground">Review faster, publish cleaner, stay inside the flow.</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-[28px] border border-border/80 bg-background/90 p-4">
        <p className="text-sm font-medium text-foreground">Pipeline health</p>
        <p className="mt-1 text-sm text-muted-foreground">Use the project pages for live stage tracking and job recovery.</p>
      </div>
    </aside>
  );
}
