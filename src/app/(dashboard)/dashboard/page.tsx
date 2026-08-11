"use client";

import { InlineError } from "@/components/common/inline-error";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectList } from "@/features/projects/components/project-list";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { isProjectActive } from "@/features/projects/lib/project-status";

export default function DashboardPage() {
  const { user } = useAuth();
  const projectsQuery = useProjectsQuery(Boolean(user?.id));
  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Project dashboard"
        description="Monitor your daily niche projects, story generation, approvals, and YouTube uploads."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total projects" value={String(projects.length)} hint="Daily faceless-story projects" />
        <StatCard
          label="Processing now"
          value={String(projects.filter((project) => isProjectActive(project.status)).length)}
          hint="Projects actively generating or rendering"
        />
        <StatCard
          label="Ready for review"
          value={String(projects.filter((project) => project.status === "review").length)}
          hint="Stories waiting for approval"
        />
      </div>
      {projectsQuery.isError ? (
        <InlineError message="Projects could not be loaded. Check the API base URL and backend availability." />
      ) : null}
      <ProjectList projects={projects} />
    </div>
  );
}
