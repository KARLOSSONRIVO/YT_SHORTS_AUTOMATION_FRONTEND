import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import type { ToastContent } from "@/components/common/toast";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: Record<string, unknown> & { successTitle?: string; errorTitle?: string };
  }
}

export function createQueryClient(showToast: (toast: ToastContent) => void) {
  const failedQueries = new WeakSet<object>();
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (failedQueries.has(query)) return;
        failedQueries.add(query);
        showToast({ tone: "error", title: "Could not load data", message: error.message });
      },
      onSuccess: (_data, query) => { failedQueries.delete(query); },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _result, mutation) => {
        showToast({ tone: "error", title: mutation.meta?.errorTitle ?? "Action failed", message: error instanceof Error ? error.message : undefined });
      },
      onSuccess: (_data, _variables, _result, mutation) => {
        const title = mutation.meta?.successTitle;
        if (title) showToast({ tone: "success", title });
      },
    }),
    defaultOptions: {
      queries: { staleTime: 10_000, retry: 1, refetchOnWindowFocus: false },
    },
  });
}
