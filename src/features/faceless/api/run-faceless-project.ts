import { apiRequest } from "@/lib/api/client";

export function runFacelessProject(projectId: string) {
  return apiRequest<{ id: string; projectId: string; status: string }>(`/projects/${projectId}/run`, {
    method: "POST"
  });
}
