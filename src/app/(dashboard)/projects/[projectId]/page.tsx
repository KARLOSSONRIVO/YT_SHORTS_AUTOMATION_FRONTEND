"use client";

import { useParams } from "next/navigation";
import { InlineError } from "@/components/common/inline-error";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectAutomationDashboard } from "@/features/automation/components/project-automation-dashboard";
import { ProjectHeader } from "@/features/projects/components/project-header";
import { ProjectProgressPanel } from "@/features/projects/components/project-progress-panel";
import { JobTimeline } from "@/features/jobs/components/job-timeline";
import { useProjectJobsQuery } from "@/features/jobs/hooks/use-project-jobs-query";
import { useProjectDetailQuery } from "@/features/projects/hooks/use-project-detail-query";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = String(params.projectId);
  const projectQuery = useProjectDetailQuery(projectId);
  const jobsQuery = useProjectJobsQuery(projectId);

  if (projectQuery.isError) {
    return <InlineError message="Project details could not be loaded." />;
  }

  if (!projectQuery.data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (projectQuery.data.facelessSource === "daily_automation") {
    return <ProjectAutomationDashboard projectId={projectId} />;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={projectQuery.data} />
      <ProjectProgressPanel project={projectQuery.data} />
      <JobTimeline jobs={jobsQuery.data ?? []} />
    </div>
  );
}
