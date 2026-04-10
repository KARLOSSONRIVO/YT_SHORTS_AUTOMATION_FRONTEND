import { apiRequest } from "@/lib/api/client";
import type { AuthUser, RegisterInput } from "../types";

export function register(input: RegisterInput) {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    json: input
  });
}
