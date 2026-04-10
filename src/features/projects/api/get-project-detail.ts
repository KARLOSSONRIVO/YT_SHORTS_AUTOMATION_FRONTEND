import { apiRequest } from "@/lib/api/client";
import type { Project } from "../types";

export function getProjectDetail(projectId: string) {
  return apiRequest<Project>(`/project/${projectId}`);
}
