import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {ctaHref && ctaLabel ? (
        <Button asChild className="mt-5">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
