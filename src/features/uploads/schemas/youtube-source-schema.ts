import { z } from "zod";

const isYouTubeUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtu.be" || hostname.endsWith(".youtube.com");
  } catch {
    return false;
  }
};

export const youtubeSourceSchema = z.object({
  sourceUrl: z
    .string()
    .trim()
    .url("Enter a valid YouTube video link.")
    .refine(isYouTubeUrl, "Use a YouTube watch, short, or youtu.be link."),
  title: z.string().trim().min(3, "Project title must be at least 3 characters.").max(160),
  description: z.string().max(5000).optional(),
  hashtags: z.string().max(300).optional(),
  language: z.string().min(2).max(12)
});

export type YouTubeSourceFormValues = z.infer<typeof youtubeSourceSchema>;
