import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "Shorts Studio",
  description: "Frontend dashboard for a YouTube Shorts automation workflow."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-body text-foreground antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
