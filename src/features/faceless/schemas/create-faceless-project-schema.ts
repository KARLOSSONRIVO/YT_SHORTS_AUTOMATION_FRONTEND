import { z } from "zod";

export const createFacelessProjectSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(5000).optional(),
  topic: z.string().min(2, "Topic must be at least 2 characters").max(240),
  targetDurationSeconds: z.coerce.number().int().min(15).max(180),
  stylePreset: z.string().min(1, "Style preset is required").max(160),
  voice: z.string().min(1, "Voice is required").max(80),
  tone: z.string().max(80).optional(),
  audience: z.string().max(120).optional(),
  startImmediately: z.boolean().default(true)
});

export type CreateFacelessProjectValues = z.infer<typeof createFacelessProjectSchema>;
