"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { deleteProject } from "../api/delete-project";

export function useDeleteProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() }),
        queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) }),
        queryClient.removeQueries({ queryKey: queryKeys.jobs.byProject(projectId) }),
        queryClient.removeQueries({ queryKey: queryKeys.clips.byProject(projectId) })
      ]);
    }
  });
}
