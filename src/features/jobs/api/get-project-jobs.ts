import { apiRequest } from "@/lib/api/client";
import type { Job } from "../types";

export function getProjectJobs(projectId: string) {
  return apiRequest<Job[]>(`/job?projectId=${encodeURIComponent(projectId)}`);
}
