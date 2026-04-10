import { EmptyState } from "@/components/common/empty-state";
import { appRoutes } from "@/lib/constants/routes";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No projects yet"
        description="Upload a long-form source video to start a project and unlock clip review, subtitles, and publishing."
        ctaHref={appRoutes.uploadsNew}
        ctaLabel="Upload Video"
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
