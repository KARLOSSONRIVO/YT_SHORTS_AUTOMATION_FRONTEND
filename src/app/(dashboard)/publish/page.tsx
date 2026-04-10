"use client";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/common/section-card";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";
import { PublishForm } from "@/features/publishing/components/publish-form";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";

export default function PublishPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const projectsQuery = useProjectsQuery(userId);
  const reviewProject = projectsQuery.data?.find((project) => project.status === "review") ?? projectsQuery.data?.[0];
  const clipsQuery = useProjectClipsQuery(reviewProject?.id ?? "");
  const channelsQuery = useChannelsQuery(userId);
  const approvedClip = clipsQuery.data?.find((clip) => clip.reviewStatus === "approved") ?? clipsQuery.data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish"
        title="Queue approved clips"
        description="Treat publishing as the final confirmation step. Channel state, metadata, and privacy settings should all be visible here."
      />
      <SectionCard title="Publish selected clip" description="In V1 this page can act as a simple publishing fallback outside the review workspace.">
        {approvedClip ? (
          <div className="mx-auto max-w-2xl">
            <PublishForm clip={approvedClip} channels={channelsQuery.data ?? []} projectId={approvedClip.projectId} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No approved clips are ready to publish yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
