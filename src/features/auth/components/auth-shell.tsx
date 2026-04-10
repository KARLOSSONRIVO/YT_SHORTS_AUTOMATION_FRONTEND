import type { ReactNode } from "react";
import Link from "next/link";
import { appRoutes } from "@/lib/constants/routes";

export function AuthShell({
  title,
  description,
  children,
  footerLabel,
  footerHref,
  footerLinkText
}: {
  title: string;
  description: string;
  children: ReactNode;
  footerLabel: string;
  footerHref: string;
  footerLinkText: string;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[36px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,247,237,0.96),rgba(255,255,255,0.9))] p-10 shadow-soft lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Shorts Studio</p>
            <h1 className="mt-6 font-heading text-5xl font-semibold tracking-tight text-foreground">
              Review faster. Publish cleaner.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              A focused control room for long-form uploads, AI clip generation, review workflows, and YouTube publishing.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-border/80 bg-white/80 p-4">
              <p className="text-sm font-semibold text-foreground">Upload</p>
              <p className="mt-2 text-sm text-muted-foreground">Start a project from a source video and track each processing stage.</p>
            </div>
            <div className="rounded-[28px] border border-border/80 bg-white/80 p-4">
              <p className="text-sm font-semibold text-foreground">Review</p>
              <p className="mt-2 text-sm text-muted-foreground">Approve or reject clips in a fast two-pane workspace.</p>
            </div>
            <div className="rounded-[28px] border border-border/80 bg-white/80 p-4">
              <p className="text-sm font-semibold text-foreground">Publish</p>
              <p className="mt-2 text-sm text-muted-foreground">Connect a YouTube channel and queue Shorts with confidence.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[36px] border border-border/70 bg-card/95 p-8 shadow-soft sm:p-10">
            <Link href={appRoutes.login} className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Shorts Studio
            </Link>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-6 text-sm text-muted-foreground">
              {footerLabel}{" "}
              <Link className="font-semibold text-primary" href={footerHref}>
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
