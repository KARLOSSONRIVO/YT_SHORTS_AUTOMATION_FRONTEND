import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, Geist, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Studio Pro",
  description: "Frontend dashboard for a YouTube Shorts automation workflow."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${sora.variable} ${fraunces.variable} ${plexMono.variable} min-h-screen bg-background font-body text-foreground antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
