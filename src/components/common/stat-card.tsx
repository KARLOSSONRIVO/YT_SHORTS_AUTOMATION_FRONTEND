import { Folder, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon = Folder
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="group relative flex flex-col gap-2 overflow-hidden p-6 transition-all hover:border-border">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-primary/5 blur-[40px] transition-all duration-500 group-hover:bg-primary/10"></div>

      <span className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>

      <div className="mt-2 flex items-baseline gap-4">
        <span className="font-heading text-4xl font-bold text-primary">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
