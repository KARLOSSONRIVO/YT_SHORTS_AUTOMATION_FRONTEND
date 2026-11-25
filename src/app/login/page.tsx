"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useAuth } from "@/features/auth/components/auth-provider";
import { appRoutes } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user) {
      router.replace(appRoutes.dashboard);
    }
  }, [isReady, router, user]);

  return (
    <AuthShell
      title="Sign in to your workspace"
      description="Use your account to upload source videos, monitor processing, review clips, and publish Shorts."
      footerHref={appRoutes.register}
      footerLabel="Need an account?"
      footerLinkText="Create one"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading sign in...</p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
