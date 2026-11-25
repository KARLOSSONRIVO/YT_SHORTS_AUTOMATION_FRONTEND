"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { Clip } from "../types";
import { reviewClip } from "../api/review-clip";

export function useReviewClipMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successTitle: "Clip review saved", errorTitle: "Clip review could not be saved" },
    mutationFn: reviewClip,
    onMutate: async ({ clipId, reviewStatus }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clips.byProject(projectId) });
      if (reviewStatus === "approved") return;
      const previousClips = queryClient.getQueryData<Clip[]>(queryKeys.clips.byProject(projectId));

      queryClient.setQueryData<Clip[]>(queryKeys.clips.byProject(projectId), (current = []) =>
        current.map((clip) =>
          clip.id === clipId
            ? {
                ...clip,
                reviewStatus,
                publishStatus: "not_ready",
                outputStorageKey: undefined,
                outputUrl: undefined,
                renderStatus: "queued"
              }
            : clip
        )
      );

      return { previousClips };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousClips) {
        queryClient.setQueryData(queryKeys.clips.byProject(projectId), context.previousClips);
      }
    },
    onSuccess: (updatedClip) => {
      if (updatedClip) {
        queryClient.setQueryData<Clip[]>(queryKeys.clips.byProject(projectId), (current) =>
          current?.map((clip) => clip.id === updatedClip.id ? updatedClip : clip)
        );
      }
    },
    onSettled: (_data, _error, { clipId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clips.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.clips.subtitle(clipId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    }
  });
}
