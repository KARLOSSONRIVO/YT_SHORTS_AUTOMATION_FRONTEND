import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  showTitle = true,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  showTitle?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {showTitle && eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p> : null}
        {showTitle ? <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">{title}</h1> : null}
        {description ? <p className={showTitle ? "mt-2 max-w-2xl text-sm text-muted-foreground" : "max-w-2xl text-sm text-muted-foreground"}>{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
