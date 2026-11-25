import { apiRequest } from "@/lib/api/client";
import type { CaptionPreset } from "@/features/projects/types";
import type { CaptionPlacement, Clip, ClipRange, VerticalLayout } from "../types";

export interface ClipReview {
  clipId: string;
  reviewStatus: "approved" | "rejected";
  verticalLayout?: VerticalLayout;
  clipRange?: ClipRange;
  captionPlacement?: CaptionPlacement;
  captionPreset?: CaptionPreset;
  captionFontSize?: number;
}

export function reviewClip({ clipId, ...review }: ClipReview) {
  return apiRequest<Clip>(`/clip/${clipId}/review`, {
    method: "PATCH",
    json: review
  });
}
