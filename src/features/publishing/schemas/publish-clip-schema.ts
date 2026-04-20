import { z } from "zod";

export const publishClipSchema = z.object({
  clipId: z.string().min(1),
  channelId: z.string().min(1, "Select a YouTube channel"),
  title: z.string().min(3).max(100),
  description: z.string().max(5000).default(""),
  hashtags: z.string().max(300).default("shorts"),
  privacyStatus: z.enum(["private", "public", "unlisted"])
});

export type PublishClipValues = z.infer<typeof publishClipSchema>;
