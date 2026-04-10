import { apiRequest } from "@/lib/api/client";
import type { Clip } from "../types";

export function getProjectClips(projectId: string) {
  return apiRequest<Clip[]>(`/clip?projectId=${encodeURIComponent(projectId)}`);
}
