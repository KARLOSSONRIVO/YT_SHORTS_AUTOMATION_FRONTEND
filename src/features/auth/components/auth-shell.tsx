import type { ReactNode } from "react";
import Link from "next/link";
import { Scissors, Film, ClipboardCheck, Send } from "lucide-react";
export function AuthShell({
  title,
  description,
  children,
  footerLabel,
  footerHref,
  footerLinkText,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footerLabel: string;
  footerHref: string;
  footerLinkText: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex xl:p-16">
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-white text-slate-950">
            <Scissors className="h-4 w-4" />
          </span>
          Studio Pro
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-sm text-slate-400">
            A workspace built for clipping
          </p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Make more of every video.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
            Find the moments worth sharing. Review your highlights, add
            captions, and publish to YouTube.
          </p>
          <ol className="mt-10 divide-y divide-white/15 border-y border-white/15">
            {[
              {
                icon: Film,
                title: "Start with your source",
                text: "Upload a video or paste a YouTube link.",
              },
              {
                icon: ClipboardCheck,
                title: "Choose your best moments",
                text: "Preview each clip and review the captions.",
              },
              {
                icon: Send,
                title: "Publish when you are ready",
                text: "You choose the channel and visibility.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-4 py-5">
                <span className="pt-0.5 text-xs text-slate-400">
                  0{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {text}
                  </p>
                </div>
                <Icon className="mt-1 h-4 w-4 text-slate-400" />
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-slate-500">Source. Select. Share.</p>
      </section>
      <main className="flex items-center justify-center bg-card px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <Scissors className="h-5 w-5 text-primary" />
            Studio Pro
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-8 mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          {children}
          <p className="mt-7 text-center text-sm text-muted-foreground">
            {footerLabel}{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href={footerHref}
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
