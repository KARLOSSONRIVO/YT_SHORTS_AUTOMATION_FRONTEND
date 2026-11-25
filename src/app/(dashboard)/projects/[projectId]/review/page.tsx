"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoadFailure } from "@/components/common/load-failure";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ClipReviewShell } from "@/features/clips/components/clip-review-shell";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";
import { useProjectDetailQuery } from "@/features/projects/hooks/use-project-detail-query";
export default function ProjectReviewPage() {
  const params = useParams<{ projectId: string }>(),
    id = String(params.projectId);
  const project = useProjectDetailQuery(id),
    clips = useProjectClipsQuery(id);
  if (project.isError || clips.isError)
    return (
      <LoadFailure
        message="The review workspace could not be loaded."
        onRetry={() => {
          project.refetch();
          clips.refetch();
        }}
      />
    );
  return (
    <div className="space-y-5">
      <Link
        href={"/projects/" + id}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Project details
      </Link>
      <PageHeader
        title={project.data?.title || "Clip review"}
        description="Preview each highlight. Approve the clips you want to render and publish."
      />
      {project.isPending || clips.isPending ? (
        <Skeleton className="h-96" aria-busy="true" />
      ) : (
        <ClipReviewShell project={project.data} clips={clips.data ?? []} />
      )}
    </div>
  );
}
