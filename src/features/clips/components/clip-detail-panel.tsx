"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { VideoPlayer } from "@/components/media/video-player";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { PublishForm } from "@/features/publishing/components/publish-form";
import { useClipSubtitleQuery } from "@/features/subtitles/hooks/use-clip-subtitle-query";
import { SubtitlePreview } from "@/features/subtitles/components/subtitle-preview";
import type { Clip } from "../types";
import { ClipActionsBar } from "./clip-actions-bar";
import { useReviewClipMutation } from "../hooks/use-review-clip-mutation";

const previewStateLabel: Record<Clip["renderStatus"], string> = {
  queued: "This clip is waiting for a render pass. Approved clips can be published once the render is ready.",
  rendering: "This clip is already being rendered. You can keep reviewing while the final Short finishes processing.",
  rendered: "Rendered clip is ready for playback.",
  failed: "Render failed. Use the source segment preview to keep reviewing while you inspect the job timeline."
};

export function ClipDetailPanel({ clip }: { clip?: Clip }) {
  const { user } = useAuth();
  const subtitleQuery = useClipSubtitleQuery(clip?.id);
  const channelsQuery = useChannelsQuery(user?.id ?? "");
  const reviewMutation = useReviewClipMutation(clip?.projectId ?? "");

  if (!clip) {
    return (
      <SectionCard
        title="Select a clip"
        description="Use this right rail for focused preview, subtitle confidence checks, metadata review, and publish actions."
      >
        <p className="text-sm text-muted-foreground">Choose a clip from the grid to inspect it in detail.</p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title={clip.title}
        description={clip.analysisReason || "No analysis reason provided yet."}
        action={<StatusBadge tone={clip.publishStatus === "published" ? "success" : "warning"}>{clip.publishStatus}</StatusBadge>}
      >
        <VideoPlayer
          src={clip.outputUrl ?? clip.sourceVideoUrl}
          status={clip.renderStatus}
          title={clip.title}
          clipStartSeconds={clip.outputUrl ? undefined : clip.startTimeSeconds}
          clipEndSeconds={clip.outputUrl ? undefined : clip.endTimeSeconds}
          subtitleSegments={subtitleQuery.data?.segments}
        />
        <p className="mt-4 text-sm text-muted-foreground">{previewStateLabel[clip.renderStatus]}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Review</p>
            <p className="mt-2 text-sm font-semibold capitalize text-foreground">{clip.reviewStatus}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Render</p>
            <p className="mt-2 text-sm font-semibold capitalize text-foreground">{clip.renderStatus}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Score</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{clip.score}</p>
          </div>
        </div>
        <div className="mt-5">
          <ClipActionsBar
            isPending={reviewMutation.isPending}
            reviewStatus={clip.reviewStatus}
            onApprove={() => reviewMutation.mutate({ clipId: clip.id, reviewStatus: "approved" })}
            onReject={() => reviewMutation.mutate({ clipId: clip.id, reviewStatus: "rejected" })}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full" disabled={clip.renderStatus !== "rendered"} variant="outline">
              Open Publish Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish clip</DialogTitle>
              <DialogDescription>Keep publishing in a drawer or dialog so review flow stays uninterrupted.</DialogDescription>
            </DialogHeader>
            <PublishForm clip={clip} channels={channelsQuery.data ?? []} projectId={clip.projectId} />
          </DialogContent>
        </Dialog>
      </SectionCard>
      <SubtitlePreview subtitle={subtitleQuery.data} />
    </div>
  );
}
