import { z } from "zod";

export const createFacelessProjectSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  title: z.string().max(120).optional(),
  description: z.string().max(5000).optional(),
  topic: z.string().min(2, "Topic must be at least 2 characters").max(240),
  platforms: z.array(z.enum(["youtube", "tiktok"])).min(1, "Choose at least one target platform"),
  targetDurationSeconds: z.coerce.number().int().min(15).max(180),
  stylePreset: z.string().min(1, "Style preset is required").max(160),
  voice: z.string().min(1, "Voice is required").max(80),
  tone: z.string().max(80).optional(),
  audience: z.string().max(120).optional(),
  startImmediately: z.boolean().default(true)
});

export type CreateFacelessProjectValues = z.infer<typeof createFacelessProjectSchema>;
