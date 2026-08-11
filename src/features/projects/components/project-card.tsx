import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/format";
import { getProjectTypeLabel } from "../lib/project-status";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="bg-card p-5 rounded-xl border border-border/40 hover:border-border transition-all duration-300 h-full flex flex-col hover:bg-secondary/20 relative overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        
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
            <span className="flex items-center gap-1 group-hover:underline">
              Open workspace
            </span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
