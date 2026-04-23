import { z } from "zod";

export const createRedditStoryProjectSchema = z.object({
  maxDurationSeconds: z
    .number()
    .int()
    .min(15, "Max duration must be at least 15 seconds")
    .max(180, "Max duration must be 180 seconds or less")
    .optional(),
  voice: z.string().min(1, "Voice is required").max(80),
  startImmediately: z.boolean().default(true)
});

export type CreateRedditStoryProjectValues = z.infer<typeof createRedditStoryProjectSchema>;
