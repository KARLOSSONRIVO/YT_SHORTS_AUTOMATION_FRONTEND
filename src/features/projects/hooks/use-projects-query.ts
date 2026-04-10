"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getProjects } from "../api/get-projects";

export function useProjectsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.projects.list(userId),
    queryFn: () => getProjects(userId),
    enabled: Boolean(userId)
  });
}
