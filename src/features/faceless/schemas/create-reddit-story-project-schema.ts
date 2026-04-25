import { z } from "zod";

export const createRedditStoryProjectSchema = z.object({
  maxDurationSeconds: z
    .number()
    .int()
    .min(15, "Max duration must be at least 15 seconds")
    .max(180, "Max duration must be 180 seconds or less")
    .optional(),
  voice: z.string().min(1, "Voice is required").max(80),
  fontFamily: z.string().min(1, "Font family is required").max(120),
  fontSize: z.number().int().min(24, "Font size must be at least 24").max(120, "Font size must be 120 or less"),
  fillColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Fill color must be a valid hex color"),
  strokeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Stroke color must be a valid hex color"),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Highlight color must be a valid hex color"),
  startImmediately: z.boolean().default(true)
});

export type CreateRedditStoryProjectValues = z.infer<typeof createRedditStoryProjectSchema>;
