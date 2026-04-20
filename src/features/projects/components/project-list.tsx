import { EmptyState } from "@/components/common/empty-state";
import { appRoutes } from "@/lib/constants/routes";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No projects yet"
        description="Start with either a long-form source upload for clipping or a topic-led faceless story project."
        ctaHref={appRoutes.uploadsNew}
        ctaLabel="New Project"
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
