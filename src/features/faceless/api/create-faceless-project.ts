import { apiRequest } from "@/lib/api/client";
import type { Project } from "@/features/projects/types";

export function createFacelessProject(input: {
  userId: string;
  title?: string;
  description?: string;
  topic: string;
  platforms: Array<"youtube">;
  targetDurationSeconds: number;
  stylePreset: string;
  voice: string;
  tone?: string;
  audience?: string;
}) {
  return apiRequest<Project>("/projects", {
    method: "POST",
    json: input
  });
}
