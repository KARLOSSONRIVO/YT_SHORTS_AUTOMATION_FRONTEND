import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(100),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100)
});

export type RegisterValues = z.infer<typeof registerSchema>;
