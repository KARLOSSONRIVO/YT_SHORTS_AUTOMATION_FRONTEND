"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectList } from "@/features/projects/components/project-list";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";

export default function ProjectsPage() {
  const { user } = useAuth();
  const projectsQuery = useProjectsQuery(Boolean(user?.id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Source video pipeline"
        description="This is the all-projects view: status scanning, routing into active work, and recovery when a project fails mid-pipeline."
      />
      <ProjectList projects={projectsQuery.data ?? []} />
    </div>
  );
}
