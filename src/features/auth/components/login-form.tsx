"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appRoutes } from "@/lib/constants/routes";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "./auth-provider";
import { loginSchema, type LoginValues } from "../schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login(values);
      router.replace(searchParams.get("next") || appRoutes.dashboard);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Login failed.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {formError ? <InlineError message={formError} /> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="you@example.com" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-rose-700">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="At least 8 characters" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-rose-700">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
