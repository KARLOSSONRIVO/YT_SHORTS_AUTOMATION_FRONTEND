"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
