import { EmptyState } from "@/components/common/empty-state";
import { appRoutes } from "@/lib/constants/routes";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No projects yet"
        description="Choose a niche and YouTube account to create one unique 60-second faceless story each day."
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
