"use client";
import Link from "next/link";
import { Plus, FolderOpen, Clock3, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadFailure } from "@/components/common/load-failure";
import { StatCard } from "@/components/common/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectLibrary } from "@/features/projects/components/project-library";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { isProjectActive } from "@/features/projects/lib/project-status";
import { appRoutes } from "@/lib/constants/routes";
export default function DashboardPage() {
  const { user } = useAuth();
  const query = useProjectsQuery(Boolean(user?.id));
  const projects = query.data ?? [];
  return (
    <div className="space-y-7">
      <PageHeader
        title="Your workspace"
        description="Turn source videos into clips worth sharing."
        actions={
          <Button type="button" asChild>
            <Link href={appRoutes.createProject}>
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Projects"
          value={query.isPending ? "-" : String(projects.length)}
          hint="Source videos and clip queues"
          icon={FolderOpen}
        />
        <StatCard
          label="Processing"
          value={
            query.isPending
              ? "-"
              : String(projects.filter((p) => isProjectActive(p.status)).length)
          }
          hint="Clips are being prepared"
          icon={Clock3}
        />
        <StatCard
          label="Ready to review"
          value={
            query.isPending
              ? "-"
              : String(projects.filter((p) => p.status === "review").length)
          }
          hint="Projects waiting for your decision"
          icon={ClipboardCheck}
        />
      </div>
      {query.isError ? (
        <LoadFailure
          message="Projects could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : null}
      <div>
        <h2 className="mb-4 text-base font-semibold">Recent projects</h2>
        <ProjectLibrary
          projects={projects}
          loading={query.isPending}
          limit={6}
        />
      </div>
    </div>
  );
}
