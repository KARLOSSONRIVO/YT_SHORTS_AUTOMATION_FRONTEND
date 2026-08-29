"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingOverlayStep = {
  label: string;
  state: "done" | "active" | "pending";
};

/**
 * Full-screen blocking loading screen for operations that outlive a single
 * request — it stays mounted through the follow-up navigation, so the user is
 * never left looking at an idle page. Blocks input to prevent double submits.
 */
export function LoadingOverlay({
  open,
  title,
  description,
  steps,
  tone = "primary"
}: {
  open: boolean;
  title: string;
  description?: string;
  steps?: LoadingOverlayStep[];
  tone?: "primary" | "destructive";
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = "loading-overlay-arc-" + useId().replace(/:/g, "");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      containerRef.current?.focus();
    }
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  const accentText = tone === "destructive" ? "text-destructive" : "text-primary";
  const accentGlow = tone === "destructive" ? "bg-destructive/20" : "bg-primary/20";
  const accentCore = tone === "destructive" ? "bg-destructive" : "bg-primary";
  const arcFrom = tone === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--primary))";
  const arcTo = tone === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--accent))";

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6 backdrop-blur-md focus:outline-none"
    >
      <div className="w-full max-w-sm rounded-container border border-border bg-card/95 p-8 text-center shadow-soft">
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className={cn("absolute inset-1 rounded-full blur-xl", accentGlow)} />
          <span className="absolute inset-0 rounded-full border border-border" />
          <svg
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full animate-spin motion-reduce:animate-none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor={arcFrom} />
                <stop offset="1" stopColor={arcTo} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke={"url(#" + gradientId + ")"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="118 64"
            />
          </svg>
          <span className={cn("relative h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none", accentCore)} />
        </span>

        <h2 className="mt-5 font-heading text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}

        {steps?.length ? (
          <ol className="mt-6 space-y-2.5 text-left">
            {steps.map((step) => (
              <li key={step.label} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {step.state === "done" ? <Check className={cn("h-4 w-4", accentText)} /> : null}
                  {step.state === "active" ? (
                    <Loader2 className={cn("h-4 w-4 animate-spin motion-reduce:animate-none", accentText)} />
                  ) : null}
                  {step.state === "pending" ? (
                    <span className="h-2 w-2 rounded-full border border-muted-foreground/50" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    step.state === "active" ? "font-medium text-foreground" : "text-muted-foreground",
                    step.state === "pending" ? "text-muted-foreground/70" : ""
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
