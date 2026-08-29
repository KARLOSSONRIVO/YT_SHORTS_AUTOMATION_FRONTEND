"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { InlineError } from "@/components/common/inline-error";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectList } from "@/features/projects/components/project-list";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { isProjectActive } from "@/features/projects/lib/project-status";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const projectsQuery = useProjectsQuery(Boolean(user?.id));
  const projects = projectsQuery.data ?? [];
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => project.title.toLowerCase().includes(normalizedSearchQuery));

  return (
    <div className="space-y-6">
      <PageHeader
        showTitle={false}
        eyebrow="Overview"
        title="Project overview"
        description="Monitor your daily niche projects, story generation, approvals, and YouTube uploads."
      />
      <div className="relative max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search projects"
          className="pl-11"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search projects..."
          type="search"
          value={searchQuery}
        />
      </div>
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
      <ProjectList projects={filteredProjects} searchQuery={searchQuery} />
    </div>
  );
}
