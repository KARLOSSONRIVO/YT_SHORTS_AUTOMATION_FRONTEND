"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { Clip } from "../types";
import { reviewClip } from "../api/review-clip";

export function useReviewClipMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clipId, reviewStatus }: { clipId: string; reviewStatus: "approved" | "rejected" }) =>
      reviewClip(clipId, reviewStatus),
    onMutate: async ({ clipId, reviewStatus }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clips.byProject(projectId) });
      const previousClips = queryClient.getQueryData<Clip[]>(queryKeys.clips.byProject(projectId));

      queryClient.setQueryData<Clip[]>(queryKeys.clips.byProject(projectId), (current = []) =>
        current.map((clip) =>
          clip.id === clipId
            ? {
                ...clip,
                reviewStatus,
                publishStatus: reviewStatus === "approved" ? "queued" : "not_ready",
                ...(reviewStatus === "rejected"
                  ? {
                      outputStorageKey: undefined,
                      outputUrl: undefined,
                      renderStatus: "queued" as const
                    }
                  : {})
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
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clips.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    }
  });
}
