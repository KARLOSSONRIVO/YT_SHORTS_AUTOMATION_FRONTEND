"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/lib/constants/routes";
import { ApiError } from "@/lib/api/errors";
import { useDeleteProjectMutation } from "../hooks/use-delete-project-mutation";
import type { Project } from "../types";
import { getProjectTone, getProjectTypeLabel } from "../lib/project-status";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const deleteMutation = useDeleteProjectMutation(project.id);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePhase, setDeletePhase] = useState<"idle" | "deleting" | "redirecting">("idle");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${project.title}" and all of its related files, renders, and publish archives? This can't be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setDeletePhase("deleting");

    try {
      await deleteMutation.mutateAsync();
      setDeletePhase("redirecting");
      router.push(appRoutes.projects);
    } catch (error) {
      setDeletePhase("idle");
      setDeleteError(error instanceof ApiError ? error.message : "Project deletion failed.");
    }
  };

  return (
    <div className="space-y-2">
      <LoadingOverlay
        open={deletePhase !== "idle"}
        tone="destructive"
        title={deletePhase === "redirecting" ? "Project deleted" : "Deleting project"}
        description={
          deletePhase === "redirecting"
            ? "Taking you back to your projects."
            : "Removing renders, subtitles, transcripts, and publish archives. This can take a moment."
        }
        steps={[
          {
            label: "Removing project files and archives",
            state: deletePhase === "deleting" ? "active" : "done"
          },
          {
            label: "Returning to your projects",
            state: deletePhase === "redirecting" ? "active" : "pending"
          }
        ]}
      />
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
            <Button variant="destructive" disabled={deletePhase !== "idle"} onClick={handleDelete}>
              {deletePhase !== "idle" ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        }
      />
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
    </div>
  );
}
