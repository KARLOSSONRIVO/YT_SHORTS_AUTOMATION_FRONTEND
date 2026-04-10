"use client";

import { InlineError } from "@/components/common/inline-error";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectList } from "@/features/projects/components/project-list";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";

export default function DashboardPage() {
  const { user } = useAuth();
  const projectsQuery = useProjectsQuery(user?.id ?? "");
  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Operate the Shorts pipeline"
        description="This dashboard should feel like a creator control room: quick uploads, clear workflow state, and immediate access to review-ready clips."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total projects" value={String(projects.length)} hint="Source videos tracked in the system" />
        <StatCard
          label="Processing now"
          value={String(projects.filter((project) => project.status === "processing").length)}
          hint="Projects actively moving through the backend"
        />
        <StatCard
          label="Ready for review"
          value={String(projects.filter((project) => project.status === "review").length)}
          hint="Projects that need a human decision pass"
        />
      </div>
      {projectsQuery.isError ? (
        <InlineError message="Projects could not be loaded. Check the API base URL and backend availability." />
      ) : null}
      <ProjectList projects={projects} />
    </div>
  );
}
