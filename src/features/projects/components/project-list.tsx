import { EmptyState } from "@/components/common/empty-state";
import { appRoutes } from "@/lib/constants/routes";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

export function ProjectList({ projects, searchQuery = "" }: { projects: Project[]; searchQuery?: string }) {
  if (!projects.length) {
    if (searchQuery.trim()) {
      return <EmptyState title="No matching projects" description="Try a different project name." />;
    }

    return (
      <EmptyState
        title="No projects yet"
        description="Upload a source video or use a YouTube link to start clipping."
        ctaHref={appRoutes.createProject}
        ctaLabel="Create Project"
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
