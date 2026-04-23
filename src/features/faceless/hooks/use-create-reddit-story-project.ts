"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { createRedditStoryProject } from "../api/create-reddit-story-project";
import { runFacelessProject } from "../api/run-faceless-project";

interface CreateRedditStoryProjectInput {
  maxDurationSeconds?: number;
  voice: string;
  startImmediately?: boolean;
}

export function useCreateRedditStoryProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ startImmediately = true, ...input }: CreateRedditStoryProjectInput) => {
      const project = await createRedditStoryProject(input);

      if (startImmediately) {
        await runFacelessProject(project.id);
      }

      return { project, automationQueued: startImmediately };
    },
    onSuccess: async ({ project }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byProject(project.id) })
      ]);
    }
  });
}
