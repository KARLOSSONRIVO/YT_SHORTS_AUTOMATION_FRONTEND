"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getProjectClips } from "../api/get-project-clips";

export function useProjectClipsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.clips.byProject(projectId),
    queryFn: () => getProjectClips(projectId),
    enabled: Boolean(projectId),
    refetchInterval: 5000
  });
}
