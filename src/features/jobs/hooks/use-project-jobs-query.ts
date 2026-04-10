"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getProjectJobs } from "../api/get-project-jobs";

export function useProjectJobsQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.byProject(projectId),
    queryFn: () => getProjectJobs(projectId),
    enabled: Boolean(projectId) && enabled,
    refetchInterval: 5000
  });
}
