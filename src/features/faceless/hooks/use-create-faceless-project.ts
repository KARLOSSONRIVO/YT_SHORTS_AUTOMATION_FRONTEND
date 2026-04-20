"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { createFacelessProject } from "../api/create-faceless-project";
import { runFacelessProject } from "../api/run-faceless-project";

interface CreateFacelessProjectInput {
  userId: string;
  title?: string;
  description?: string;
  topic: string;
  platforms: Array<"youtube" | "tiktok">;
  targetDurationSeconds: number;
  stylePreset: string;
  voice: string;
  tone?: string;
  audience?: string;
  startImmediately?: boolean;
}

export function useCreateFacelessProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ startImmediately = true, ...input }: CreateFacelessProjectInput) => {
      const project = await createFacelessProject(input);

      let automationQueued = false;
      if (startImmediately) {
        try {
          await runFacelessProject(project.id);
          automationQueued = true;
        } catch {
          automationQueued = false;
        }
      }

      return { project, automationQueued };
    },
    onSuccess: async ({ project }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.list(project.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byProject(project.id) })
      ]);
    }
  });
}
