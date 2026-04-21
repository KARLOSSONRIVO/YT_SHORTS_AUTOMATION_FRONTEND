import { z } from "zod";

export const uploadVideoSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(160),
  description: z.string().max(5000).optional(),
  hashtags: z.string().max(300, "Keep hashtags concise").default("shorts"),
  targetClipCount: z.coerce.number().int().min(1).max(20).default(5),
  fontFamily: z.string().min(1, "Font family is required").max(120),
  fontSize: z.coerce.number().int().min(24).max(120),
  fillColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #FFFFFF"),
  strokeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #000000"),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #FFD54A"),
  position: z.enum(["bottom_center", "top_center"]),
  maxCharsPerLine: z.coerce.number().int().min(12).max(42),
  maxLines: z.coerce.number().int().min(1).max(4),
  video: z
    .instanceof(File, { message: "A source video is required" })
    .refine((file) => file.size > 0, "A source video is required")
});

export type UploadVideoValues = z.infer<typeof uploadVideoSchema>;
