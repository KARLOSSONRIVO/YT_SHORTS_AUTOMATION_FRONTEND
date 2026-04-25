import { z } from "zod";

export const publishFacelessProjectSchema = z.object({
  channelId: z.string().min(1, "Select a YouTube channel"),
  title: z.string().min(1, "Add a title").max(100, "Keep the title under 100 characters"),
  description: z.string().max(5000, "Keep the description under 5000 characters").default(""),
  hashtags: z.string().max(300, "Keep hashtags concise").default("shorts"),
  privacyStatus: z.enum(["private", "public", "unlisted"]).default("private")
});

export type PublishFacelessProjectValues = z.infer<typeof publishFacelessProjectSchema>;
