import { apiRequest } from "@/lib/api/client";
import type { PublishPayload } from "../types";

export function publishClip(payload: PublishPayload) {
  return apiRequest<{ queued: boolean; clipId: string }>("/publish", {
    method: "POST",
    json: payload
  });
}
