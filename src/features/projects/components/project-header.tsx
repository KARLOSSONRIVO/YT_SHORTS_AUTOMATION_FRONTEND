"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRunFacelessProjectMutation } from "@/features/faceless/hooks/use-run-faceless-project";
import { appRoutes } from "@/lib/constants/routes";
import { ApiError } from "@/lib/api/errors";
import { useDeleteProjectMutation } from "../hooks/use-delete-project-mutation";
import type { Project } from "../types";
import { getProjectTone, getProjectTypeLabel } from "../lib/project-status";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const runMutation = useRunFacelessProjectMutation(project.id);
  const deleteMutation = useDeleteProjectMutation(project.id);
  const showRunButton = project.projectType === "faceless_story" && (project.status === "draft" || project.status === "failed");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${project.title}" and all of its related files, renders, and publish archives? This can't be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync();
      router.push(appRoutes.projects);
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : "Project deletion failed.");
    }
  };

  return (
    <div className="space-y-2">
      <PageHeader
        eyebrow={project.projectType === "faceless_story" ? "Faceless Project" : "Project"}
        title={project.title}
        description={
          project.description ||
          (project.projectType === "faceless_story"
            ? "Topic-led vertical video project for script, narration, subtitles, scenes, and final render."
            : "Source video project for automatic clip generation and review.")
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{getProjectTypeLabel(project.projectType)}</Badge>
            <StatusBadge tone={getProjectTone(project.status)}>{project.status}</StatusBadge>
            {project.projectType === "uploaded_video" ? (
              <Button asChild variant="outline">
                <Link href={`/projects/${project.id}/review`}>Open Review</Link>
              </Button>
            ) : null}
            {showRunButton ? (
              <Button disabled={runMutation.isPending || deleteMutation.isPending} onClick={() => runMutation.mutate()}>
                {runMutation.isPending ? "Starting..." : project.status === "failed" ? "Run Again" : "Start Automation"}
              </Button>
            ) : null}
            <Button variant="destructive" disabled={deleteMutation.isPending || runMutation.isPending} onClick={handleDelete}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        }
      />
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
    </div>
  );
}
