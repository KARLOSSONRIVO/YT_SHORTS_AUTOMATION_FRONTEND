"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { publishFacelessProject } from "../api/publish-faceless-project";
import type { PublishFacelessProjectValues } from "../schemas/publish-faceless-project-schema";

export function usePublishFacelessProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublishFacelessProjectValues) => publishFacelessProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    }
  });
}
