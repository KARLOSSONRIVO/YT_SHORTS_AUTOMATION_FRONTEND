"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { appRoutes } from "@/lib/constants/routes";

export default function HomePage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    router.replace(user ? appRoutes.dashboard : appRoutes.login);
  }, [isReady, router, user]);

  return null;
}
