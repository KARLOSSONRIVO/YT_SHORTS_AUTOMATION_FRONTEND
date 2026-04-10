"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes } from "@/lib/constants/routes";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace(`${appRoutes.login}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, pathname, router, user]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing your workspace...</p>
      </div>
    );
  }

  return <>{children}</>;
}
