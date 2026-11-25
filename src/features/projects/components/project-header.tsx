"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/lib/constants/routes";
import { useDeleteProjectMutation } from "../hooks/use-delete-project-mutation";
import type { Project } from "../types";
import { getProjectTone } from "../lib/project-status";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const deleteMutation = useDeleteProjectMutation(project.id);
  const [deletePhase, setDeletePhase] = useState<
    "idle" | "deleting" | "redirecting"
  >("idle");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${project.title}" and all of its related files, renders, and publish archives? This can't be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletePhase("deleting");

    try {
      await deleteMutation.mutateAsync();
      setDeletePhase("redirecting");
      router.push(appRoutes.projects);
    } catch {
      setDeletePhase("idle");
    }
  };

  return (
    <div className="space-y-2">
      <LoadingOverlay
        open={deletePhase !== "idle"}
        tone="destructive"
        title={
          deletePhase === "redirecting" ? "Project deleted" : "Deleting project"
        }
        description={
          deletePhase === "redirecting"
            ? "Taking you back to your projects."
            : "Removing renders, subtitles, transcripts, and publish archives. This can take a moment."
        }
        steps={[
          {
            label: "Removing project files and archives",
            state: deletePhase === "deleting" ? "active" : "done",
          },
          {
            label: "Returning to your projects",
            state: deletePhase === "redirecting" ? "active" : "pending",
          },
        ]}
      />
      <PageHeader
        eyebrow="Clipping project"
        title={project.title}
        description={
          project.description || "Source video project for clipping and review."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={getProjectTone(project.status)}>
              {project.status}
            </StatusBadge>
            {project.projectType === "uploaded_video" ? (
              <Button type="button" asChild>
                <Link href={`/projects/${project.id}/review`}>
                  Review clips
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-rose-50 hover:text-destructive"
              disabled={deletePhase !== "idle"}
              onClick={handleDelete}
            >
              {deletePhase !== "idle" ? "Deleting..." : "Delete project"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
