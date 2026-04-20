import { apiRequest } from "@/lib/api/client";
import type { PublishFacelessProjectValues } from "../schemas/publish-faceless-project-schema";

export function publishFacelessProject(projectId: string, payload: PublishFacelessProjectValues) {
  return apiRequest<{
    projectId: string;
    channelId: string;
    uploadHistoryId: string;
    youtubeVideoId?: string;
    videoUrl?: string;
  }>(
    `/project/${projectId}/publish`,
    {
      method: "POST",
      json: payload
    }
  );
}
