import Link from "next/link";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-container border border-dashed bg-card px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-container bg-secondary text-muted-foreground">
        <Film className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {ctaHref && ctaLabel ? (
        <Button type="button" asChild className="mt-5">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
