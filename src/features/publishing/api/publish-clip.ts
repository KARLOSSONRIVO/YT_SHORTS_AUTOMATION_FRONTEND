import { apiRequest } from "@/lib/api/client";
import type { PublishPayload } from "../types";

export function publishClip(payload: PublishPayload) {
  return apiRequest<{ clipId: string; channelId: string; uploadHistoryId: string; youtubeVideoId?: string; videoUrl?: string }>("/publish", {
    method: "POST",
    json: payload
  });
}
