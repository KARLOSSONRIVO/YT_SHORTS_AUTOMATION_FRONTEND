import { ReactNode } from "react";
import { Folder } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon = Folder
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: any;
}) {
  return (
    <div className="bg-card p-6 rounded-xl flex flex-col gap-2 border border-border/40 relative overflow-hidden group hover:border-border transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-500"></div>
      
      <span className="text-muted-foreground font-body text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      
      <div className="flex items-baseline gap-4 mt-2">
        <span className="font-heading text-4xl font-bold text-primary">{value}</span>
        {hint && (
          <span className="text-muted-foreground text-xs">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
