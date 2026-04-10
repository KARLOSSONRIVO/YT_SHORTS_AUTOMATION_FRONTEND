import { apiRequest } from "@/lib/api/client";
import type { AuthUser, LoginInput } from "../types";

export function login(input: LoginInput) {
  return apiRequest<AuthUser>("/auth/login", {
    method: "POST",
    json: input
  });
}
