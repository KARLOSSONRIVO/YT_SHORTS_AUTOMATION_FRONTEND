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
    <div className="min-h-screen bg-surface-base text-on-surface font-body overflow-x-hidden selection:bg-primary selection:text-white flex flex-col md:flex-row">
      <section className="hidden md:flex flex-1 relative flex-col justify-between p-10 bg-surface-base overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent blur-[100px]"></div>
        </div>
        <div className="relative z-10">
          <span className="font-heading tracking-widest text-primary uppercase mb-6 block font-semibold text-xs">STUDIO PRO</span>
          <h1 className="font-heading text-5xl font-bold text-white max-w-xl mb-4">Review faster. Publish cleaner.</h1>
          <p className="font-body text-lg text-muted-foreground max-w-lg">
            A focused control room for long-form uploads, AI clip generation, review workflows, and YouTube publishing.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-xl transition-all hover:bg-secondary group cursor-default">
            <span className="material-symbols-outlined text-accent mb-2 block">cloud_upload</span>
            <h3 className="font-heading font-semibold text-white text-base mb-1">Upload</h3>
            <p className="font-body text-sm text-muted-foreground">High-speed ingestion for long-form raw assets.</p>
          </div>
          <div className="bg-card p-6 rounded-xl transition-all hover:bg-secondary group cursor-default">
            <span className="material-symbols-outlined text-primary mb-2 block">rate_review</span>
            <h3 className="font-heading font-semibold text-white text-base mb-1">Review</h3>
            <p className="font-body text-sm text-muted-foreground">Frame-accurate feedback for creative teams.</p>
          </div>
          <div className="bg-card p-6 rounded-xl transition-all hover:bg-secondary group cursor-default">
            <span className="material-symbols-outlined text-ring mb-2 block">send</span>
            <h3 className="font-heading font-semibold text-white text-base mb-1">Publish</h3>
            <p className="font-body text-sm text-muted-foreground">One-click distribution to global platforms.</p>
          </div>
        </div>
      </section>
      
      <section className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-[440px]">
          <div className="bg-card p-10 rounded-xl shadow-2xl border border-border/10">
            <div className="mb-10">
              <span className="font-heading font-semibold text-xs tracking-widest text-primary uppercase mb-2 block">STUDIO PRO</span>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">{title}</h2>
              <p className="font-body text-base text-muted-foreground">{description}</p>
            </div>
            
            {children}
            
            <div className="mt-10 text-center">
              <p className="font-body text-sm text-muted-foreground">
                {footerLabel}{" "}
                <Link className="text-accent font-bold hover:underline ml-1 transition-colors" href={footerHref}>
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center items-center gap-6">
            <nav className="flex gap-4">
              <a className="font-heading font-semibold text-xs text-muted-foreground hover:text-white transition-colors" href="#">Terms</a>
              <a className="font-heading font-semibold text-xs text-muted-foreground hover:text-white transition-colors" href="#">Privacy</a>
              <a className="font-heading font-semibold text-xs text-muted-foreground hover:text-white transition-colors" href="#">Help</a>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}
