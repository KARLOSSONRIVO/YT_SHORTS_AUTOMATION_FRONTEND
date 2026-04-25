import { apiRequest } from "@/lib/api/client";

export function deleteProject(projectId: string) {
  return apiRequest<{ projectId: string; deleted: boolean }>(`/projects/${projectId}`, {
    method: "DELETE"
  });
}
