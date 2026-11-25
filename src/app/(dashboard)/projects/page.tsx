"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { LoadFailure } from "@/components/common/load-failure";
import { useAuth } from "@/features/auth/components/auth-provider";
import { ProjectLibrary } from "@/features/projects/components/project-library";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { appRoutes } from "@/lib/constants/routes";
export default function ProjectsPage() {
  const { user } = useAuth();
  const query = useProjectsQuery(Boolean(user?.id));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Your source videos, highlights, and finished clip queues."
        actions={
          <Button type="button" asChild>
            <Link href={appRoutes.createProject}>
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        }
      />
      {query.isError ? (
        <LoadFailure
          message="Projects could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : (
        <ProjectLibrary projects={query.data ?? []} loading={query.isPending} />
      )}
    </div>
  );
}
