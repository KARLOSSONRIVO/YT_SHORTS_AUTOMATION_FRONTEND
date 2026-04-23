"use client";

import { useEffect, useState } from "react";
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

export function ClipDetailPanel({ clip }: { clip?: Clip }) {
  const { user } = useAuth();
  const subtitleQuery = useClipSubtitleQuery(clip?.id);
  const channelsQuery = useChannelsQuery(user?.id ?? "");
  const reviewMutation = useReviewClipMutation(clip?.projectId ?? "");
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishingClip, setIsPublishingClip] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const canOpenPublishForm =
    clip?.reviewStatus === "approved" &&
    clip.renderStatus === "rendered" &&
    clip.publishStatus !== "published";
  const publishStateMessage =
    clip?.publishStatus === "published"
      ? "This clip is already published."
      : clip?.reviewStatus !== "approved"
        ? "Approve the clip before opening the publish form."
        : clip?.renderStatus !== "rendered"
          ? "Wait for the render to finish before publishing."
          : undefined;
  const previewMessage =
    clip?.reviewStatus === "rejected"
      ? "Rejected clips are removed from publish and preview storage."
      : clip?.outputUrl
        ? "Clip preview is ready for playback."
        : clip?.reviewStatus === "approved"
          ? "Approved clip is waiting for its preview render."
          : "Review this clip and decide whether to approve or reject it.";

  useEffect(() => {
    if (!successToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessToast(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successToast]);

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
      {successToast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg">
          {successToast}
        </div>
      ) : null}
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
        <p className="mt-4 text-sm text-muted-foreground">{previewMessage}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Review</p>
            <p className="mt-2 text-sm font-semibold capitalize text-foreground">{clip.reviewStatus}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Publish</p>
            <p className="mt-2 text-sm font-semibold capitalize text-foreground">{clip.publishStatus}</p>
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
        <Dialog
          open={isPublishDialogOpen}
          onOpenChange={(open) => {
            if (isPublishingClip) {
              return;
            }

            setIsPublishDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="mt-4 w-full" disabled={!canOpenPublishForm} variant="outline">
              {clip.publishStatus === "published" ? "Already Published" : "Open Publish Form"}
            </Button>
          </DialogTrigger>
          {publishStateMessage ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">{publishStateMessage}</p>
          ) : null}
          {clip.youtubeVideoUrl ? (
            <a
              className="mt-2 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              href={clip.youtubeVideoUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open on YouTube
            </a>
          ) : null}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish clip</DialogTitle>
              <DialogDescription>Keep publishing in a drawer or dialog so review flow stays uninterrupted.</DialogDescription>
            </DialogHeader>
            <PublishForm
              clip={clip}
              channels={channelsQuery.data ?? []}
              projectId={clip.projectId}
              onPendingChange={setIsPublishingClip}
              onSuccess={() => {
                setIsPublishDialogOpen(false);
                setSuccessToast("Uploaded successfully.");
              }}
            />
          </DialogContent>
        </Dialog>
      </SectionCard>
      <SubtitlePreview subtitle={subtitleQuery.data} />
    </div>
  );
}
