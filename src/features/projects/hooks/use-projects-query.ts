"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getProjects } from "../api/get-projects";

export function useProjectsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: getProjects,
    enabled
  });
}
