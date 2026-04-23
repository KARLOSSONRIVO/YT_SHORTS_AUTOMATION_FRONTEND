import { apiRequest } from "@/lib/api/client";
import type { Project } from "@/features/projects/types";

export function createRedditStoryProject(input: {
  maxDurationSeconds?: number;
  voice: string;
}) {
  return apiRequest<Project>("/projects/reddit/trending", {
    method: "POST",
    json: input
  });
}
