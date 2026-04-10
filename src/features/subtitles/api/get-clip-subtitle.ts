import { apiRequest } from "@/lib/api/client";
import type { ClipSubtitle } from "@/features/clips/types";

export function getClipSubtitle(clipId: string) {
  return apiRequest<ClipSubtitle>(`/subtitle/clips/${clipId}`);
}
