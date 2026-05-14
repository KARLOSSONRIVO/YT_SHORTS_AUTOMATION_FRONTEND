import { apiRequest } from "@/lib/api/client";
import type { Project } from "@/features/projects/types";

export function createFacelessProject(input: {
  title?: string;
  description?: string;
  topic: string;
  platforms: Array<"youtube">;
  targetDurationSeconds: number;
  stylePreset: string;
  scriptFramework?: "psychology_truth" | "history_story";
  facelessRenderMode?: "image_story" | "animation_story";
  voice: string;
  tone?: string;
  audience?: string;
}) {
  return apiRequest<Project>("/projects", {
    method: "POST",
    json: input
  });
}
