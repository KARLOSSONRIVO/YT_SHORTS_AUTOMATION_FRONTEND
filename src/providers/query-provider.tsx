"use client";

import { useState, type ReactNode } from "react";
import { useToast } from "@/components/common/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "@/lib/api/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const showToast = useToast();
  const [queryClient] = useState(() => createQueryClient(showToast));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
