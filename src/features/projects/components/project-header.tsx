"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRunFacelessProjectMutation } from "@/features/faceless/hooks/use-run-faceless-project";
import type { Project } from "../types";
import { getProjectTone, getProjectTypeLabel } from "../lib/project-status";

export function ProjectHeader({ project }: { project: Project }) {
  const runMutation = useRunFacelessProjectMutation(project.id);
  const showRunButton = project.projectType === "faceless_story" && (project.status === "draft" || project.status === "failed");

  return (
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
        <div className="flex items-center gap-3">
          <Badge variant="outline">{getProjectTypeLabel(project.projectType)}</Badge>
          <StatusBadge tone={getProjectTone(project.status)}>{project.status}</StatusBadge>
          {project.projectType === "uploaded_video" ? (
            <Button asChild variant="outline">
              <Link href={`/projects/${project.id}/review`}>Open Review</Link>
            </Button>
          ) : null}
          {showRunButton ? (
            <Button disabled={runMutation.isPending} onClick={() => runMutation.mutate()}>
              {runMutation.isPending ? "Starting..." : project.status === "failed" ? "Run Again" : "Start Automation"}
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
