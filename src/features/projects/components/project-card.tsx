import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils/format";
import { getProjectTone, getProjectTypeLabel } from "../lib/project-status";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block transition hover:-translate-y-0.5">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {getProjectTypeLabel(project.projectType)}
              </Badge>
              <CardTitle className="font-heading">{project.title}</CardTitle>
            </div>
            <StatusBadge tone={getProjectTone(project.status)}>{project.status}</StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description || "No internal description yet."}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Stage</p>
              <p className="font-medium capitalize text-foreground">{project.workflowStage}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Updated</p>
              <p className="font-medium text-foreground">
                {project.updatedAt ? formatRelativeDate(project.updatedAt) : "Just now"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-primary">
            <span>Open project</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
