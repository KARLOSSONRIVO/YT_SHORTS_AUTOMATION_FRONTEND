import { apiRequest } from "@/lib/api/client";
import type { Clip } from "../types";

export function reviewClip(clipId: string, reviewStatus: "approved" | "rejected") {
  return apiRequest<Clip>(`/clip/${clipId}/review`, {
    method: "PATCH",
    json: { reviewStatus }
  });
}
