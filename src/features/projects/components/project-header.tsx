import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { Project } from "../types";
import { getProjectTone } from "../lib/project-status";

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <PageHeader
      eyebrow="Project"
      title={project.title}
      description={project.description || "Source video project for automatic clip generation and review."}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge tone={getProjectTone(project.status)}>{project.status}</StatusBadge>
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}/review`}>Open Review</Link>
          </Button>
        </div>
      }
    />
  );
}
