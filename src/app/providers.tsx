"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ToastProvider>
  );
}
