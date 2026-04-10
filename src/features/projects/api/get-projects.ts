import { apiRequest } from "@/lib/api/client";
import type { Project } from "../types";

export function getProjects(userId: string) {
  return apiRequest<Project[]>(`/project?userId=${encodeURIComponent(userId)}`);
}
