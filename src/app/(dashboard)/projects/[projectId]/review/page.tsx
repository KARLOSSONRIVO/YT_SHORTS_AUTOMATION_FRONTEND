"use client";

import { useParams } from "next/navigation";
import { InlineError } from "@/components/common/inline-error";
import { PageHeader } from "@/components/layout/page-header";
import { ClipReviewShell } from "@/features/clips/components/clip-review-shell";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";
import { useProjectDetailQuery } from "@/features/projects/hooks/use-project-detail-query";

export default function ProjectReviewPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = String(params.projectId);
  const projectQuery = useProjectDetailQuery(projectId);
  const clipsQuery = useProjectClipsQuery(projectId);

  if (projectQuery.isError || clipsQuery.isError) {
    return <InlineError message="The review workspace could not be loaded." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="Generated clip review"
        description="Approve, reject, preview subtitles, and hand approved clips off to publishing without leaving the workspace."
      />
      <ClipReviewShell project={projectQuery.data} clips={clipsQuery.data ?? []} />
    </div>
  );
}
