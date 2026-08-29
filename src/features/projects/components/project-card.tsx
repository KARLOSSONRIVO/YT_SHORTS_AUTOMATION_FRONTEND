import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils/format";
import { getProjectTypeLabel } from "../lib/project-status";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:bg-secondary/20">
        {/* Glow effect on hover */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-[40px] transition-all duration-500 group-hover:bg-primary/20 group-hover:opacity-100"></div>

        <div className="mb-4 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {getProjectTypeLabel(project.projectType, project.contentType)}
            </span>
            <h4 className="font-heading text-lg font-bold text-foreground line-clamp-1">{project.title}</h4>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground flex-grow mb-6 relative z-10">
          {project.description || "No internal description yet."}
        </p>

        <div className="mt-auto relative z-10 space-y-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {project.updatedAt ? formatRelativeDate(project.updatedAt) : "Just now"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-medium text-primary pt-1">
            <span className="flex items-center gap-1 group-hover:underline">Open workspace</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
