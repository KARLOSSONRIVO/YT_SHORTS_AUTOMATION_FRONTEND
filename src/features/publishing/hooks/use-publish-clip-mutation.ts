"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { publishClip } from "../api/publish-clip";

export function usePublishClipMutation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successTitle: "Clip queued for YouTube publishing", errorTitle: "Clip could not be queued" },
    mutationFn: publishClip,
    onSuccess: () => {
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.clips.byProject(projectId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      }
    }
  });
}
