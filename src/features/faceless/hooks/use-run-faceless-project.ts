"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { runFacelessProject } from "../api/run-faceless-project";

export function useRunFacelessProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runFacelessProject(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byProject(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      ]);
    }
  });
}
