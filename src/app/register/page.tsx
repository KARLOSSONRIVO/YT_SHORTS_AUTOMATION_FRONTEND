"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useAuth } from "@/features/auth/components/auth-provider";
import { RegisterForm } from "@/features/auth/components/register-form";
import { appRoutes } from "@/lib/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user) {
      router.replace(appRoutes.dashboard);
    }
  }, [isReady, router, user]);

  return (
    <AuthShell
      title="Create your Shorts Studio account"
      description="Start with a simple email/password account, then move directly into the dashboard flow."
      footerHref={appRoutes.login}
      footerLabel="Already have an account?"
      footerLinkText="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
