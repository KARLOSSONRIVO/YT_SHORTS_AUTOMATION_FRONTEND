import Link from "next/link";
import { Film, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatRelativeDate } from "@/lib/utils/format";
import { getProjectTone } from "../lib/project-status";
import type { Project } from "../types";
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group min-w-0 overflow-hidden rounded-container border bg-card transition-colors hover:border-primary/50"
    >
      <div className="flex h-28 items-center justify-center border-b bg-secondary/50">
        <Film className="h-9 w-9 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {project.accountId ? "Clip queue" : "Source video"}
          </span>
          <StatusBadge tone={getProjectTone(project.status)}>
            {project.status}
          </StatusBadge>
        </div>
        <h2 className="truncate text-sm font-semibold group-hover:text-primary">
          {project.title}
        </h2>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {project.updatedAt
              ? formatRelativeDate(project.updatedAt)
              : "Just added"}
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
