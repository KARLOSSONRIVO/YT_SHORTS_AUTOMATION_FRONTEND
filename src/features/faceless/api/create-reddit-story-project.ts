import { apiRequest } from "@/lib/api/client";
import type { Project } from "@/features/projects/types";

export function createRedditStoryProject(input: {
  maxDurationSeconds?: number;
  voice: string;
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  strokeColor: string;
  highlightColor: string;
}) {
  return apiRequest<Project>("/projects/reddit/trending", {
    method: "POST",
    json: {
      maxDurationSeconds: input.maxDurationSeconds,
      voice: input.voice,
      subtitlePreferences: {
        fontFamily: input.fontFamily,
        fontSize: input.fontSize,
        fillColor: input.fillColor,
        strokeColor: input.strokeColor,
        highlightColor: input.highlightColor
      }
    }
  });
}
