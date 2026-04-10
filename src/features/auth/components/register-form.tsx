"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appRoutes } from "@/lib/constants/routes";
import { ApiError } from "@/lib/api/errors";
import { useAuth } from "./auth-provider";
import { registerSchema, type RegisterValues } from "../schemas/register-schema";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await registerUser(values);
      router.replace(appRoutes.dashboard);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Registration failed.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {formError ? <InlineError message={formError} /> : null}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" placeholder="Creator name" {...form.register("displayName")} />
        {form.formState.errors.displayName ? (
          <p className="text-sm text-rose-700">{form.formState.errors.displayName.message}</p>
        ) : null}
      </div>
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
        {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
