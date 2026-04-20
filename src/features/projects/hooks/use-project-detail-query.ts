"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { isProjectActive } from "../lib/project-status";
import { getProjectDetail } from "../api/get-project-detail";

export function useProjectDetailQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProjectDetail(projectId),
    enabled: Boolean(projectId),
    refetchInterval: (query) => (query.state.data?.status && isProjectActive(query.state.data.status) ? 4000 : false)
  });
}
