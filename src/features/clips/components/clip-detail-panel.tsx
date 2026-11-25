"use client";
import { useState } from "react";
import { Captions, Info, Send, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadFailure } from "@/components/common/load-failure";
import { EmptyState } from "@/components/common/empty-state";
import { VideoPlayer } from "@/components/media/video-player";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { PublishForm } from "@/features/publishing/components/publish-form";
import { useClipSubtitleQuery } from "@/features/subtitles/hooks/use-clip-subtitle-query";
import { SubtitlePreview } from "@/features/subtitles/components/subtitle-preview";
import { formatDuration } from "@/lib/utils/format";
import type { CaptionPreset } from "@/features/projects/types";
import { captionPresets } from "@/features/subtitles/lib/caption-presets";
import type { CaptionPlacement, Clip, ClipRange, VerticalLayout } from "../types";
import { VerticalClipEditor } from "./vertical-clip-editor";
import { ClipActionsBar } from "./clip-actions-bar";
import { useReviewClipMutation } from "../hooks/use-review-clip-mutation";
export function ClipDetailPanel({ clip }: { clip?: Clip }) {
  return <ClipDetailContent key={clip?.id} clip={clip} />;
}

function ClipDetailContent({ clip }: { clip?: Clip }) {
  const [verticalLayout, setVerticalLayout] = useState<VerticalLayout | null>();
  const [rangeDraft, setRangeDraft] = useState<ClipRange>();
  const [captionPlacement, setCaptionPlacement] = useState<CaptionPlacement>();
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>();
  const [captionFontSize, setCaptionFontSize] = useState<number>();
  const { user } = useAuth();
  const subtitle = useClipSubtitleQuery(clip?.id);
  const channels = useChannelsQuery(Boolean(user?.id));
  const review = useReviewClipMutation(clip?.projectId ?? "");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tab, setTab] = useState<"captions" | "details">("captions");
  if (!clip)
    return (
      <EmptyState
        title="Choose a clip to preview"
        description="Your video and captions will appear here. Adjust the clip filter to see more results."
      />
    );
  const canEditLayout =
    clip.reviewStatus === "pending_review" && Boolean(clip.sourceVideoUrl) && !clip.outputUrl;
  const baseCaptionPreferences = captionPreset ? captionPresets[captionPreset] : subtitle.data?.preferences ?? captionPresets.bold_stroke;
  const captionPreferences = captionFontSize === undefined ? baseCaptionPreferences : { ...baseCaptionPreferences, fontSize: captionFontSize };
  const originalRange = { startTimeSeconds: clip.startTimeSeconds, endTimeSeconds: clip.endTimeSeconds };
  const range = canEditLayout && rangeDraft ? rangeDraft : originalRange;
  const clipRange = canEditLayout && rangeDraft && (
    rangeDraft.startTimeSeconds !== clip.startTimeSeconds || rangeDraft.endTimeSeconds !== clip.endTimeSeconds
  ) ? rangeDraft : undefined;
  const sourceSubtitles = subtitle.data?.sourceSegments ?? subtitle.data?.segments?.map((segment) => ({
    ...segment,
    start: segment.start + clip.startTimeSeconds,
    end: segment.end + clip.startTimeSeconds,
  }));
  const displayedSubtitles = clipRange && subtitle.data ? {
    ...subtitle.data,
    segments: sourceSubtitles?.filter((segment) => segment.end > range.startTimeSeconds && segment.start < range.endTimeSeconds)
      .map((segment) => ({
        ...segment,
        start: Math.max(segment.start - range.startTimeSeconds, 0),
        end: Math.min(segment.end, range.endTimeSeconds) - range.startTimeSeconds,
      })),
  } : subtitle.data;
  const isApproved = clip.reviewStatus === "approved";
  const isApproving = review.isPending && review.variables?.reviewStatus === "approved";
  const isProcessing = isApproving || (isApproved && (clip.renderStatus === "queued" || clip.renderStatus === "rendering"));
  const hasRender = isApproved && clip.renderStatus === "rendered" && Boolean(clip.outputUrl);
  const previewMessage = isProcessing ? "Processing…" : isApproved && !hasRender
    ? clip.renderStatus === "failed" ? "Render failed" : "Rendered video unavailable"
    : undefined;
  const canPublish = hasRender && clip.publishStatus !== "published";
  const message =
    clip.publishStatus === "published"
      ? "Published to YouTube."
      : clip.reviewStatus === "rejected"
        ? "This clip was rejected."
        : previewMessage
          ? undefined
          : clip.reviewStatus === "pending_review"
            ? "Watch the clip, then approve it for rendering."
            : "Your clip is ready to publish.";
  return (
    <section
      aria-label="Selected clip"
      className="overflow-hidden rounded-container border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold">{clip.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {formatDuration(range.endTimeSeconds - range.startTimeSeconds)} clip /{" "}
            {formatDuration(range.startTimeSeconds)} -{" "}
            {formatDuration(range.endTimeSeconds)} in source
          </p>
        </div>
        <StatusBadge
          tone={
            clip.reviewStatus === "approved"
              ? "success"
              : clip.reviewStatus === "rejected"
                ? "neutral"
                : "warning"
          }
        >
          {clip.reviewStatus}
        </StatusBadge>
      </div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 bg-slate-950 p-4 sm:p-6">
          {canEditLayout && clip.sourceVideoUrl && (
            <div hidden={isApproving}>
              <VerticalClipEditor
                src={clip.sourceVideoUrl}
                range={range}
                originalRange={originalRange}
                suspended={isApproving}
                onRangeChange={setRangeDraft}
                onLayout={setVerticalLayout}
                subtitleSegments={sourceSubtitles}
                captionPreferences={captionPreferences}
                captionPreset={captionPreset}
                captionPlacement={captionPlacement}
                hasCustomCaptionSize={captionFontSize !== undefined}
                onCaptionPresetChange={setCaptionPreset}
                onCaptionPlacementChange={setCaptionPlacement}
                onCaptionSizeChange={setCaptionFontSize}
              />
            </div>
          )}
          {previewMessage ? (
            <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-sm font-medium text-slate-100">
              {isProcessing && <Loader2 aria-hidden="true" className="size-6 animate-spin text-slate-300 motion-reduce:animate-none" />}
              {previewMessage}
            </div>
          ) : !canEditLayout && (
            <>
              <div className="mb-4 flex justify-between text-xs text-slate-300">
                <span>{clip.outputUrl ? "Rendered clip" : "Source preview"}</span>
                <span>9:16</span>
              </div>
              <div className="mx-auto max-w-[290px]">
                <VideoPlayer
                  src={
                    clip.reviewStatus === "rejected"
                      ? undefined
                      : isApproved ? clip.outputUrl : (clip.outputUrl ?? clip.sourceVideoUrl)
                  }
                  status={clip.renderStatus}
                  title={clip.title}
                  clipStartSeconds={
                    clip.outputUrl ? undefined : clip.startTimeSeconds
                  }
                  clipEndSeconds={clip.outputUrl ? undefined : clip.endTimeSeconds}
                  subtitleSegments={clip.outputUrl ? undefined : subtitle.data?.segments}
                />
              </div>
            </>
          )}
        </div>
        <div className="min-w-0 border-t xl:border-l xl:border-t-0">
          <div
            className="flex gap-1 border-b p-2"
            role="tablist"
            aria-label="Clip information"
          >
            {(["captions", "details"] as const).map((item) => (
              <button
                type="button"
                key={item}
                id={"tab-" + item}
                role="tab"
                tabIndex={tab === item ? 0 : -1}
                aria-selected={tab === item}
                onKeyDown={(e) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? "captions"
                        : e.key === "End"
                          ? "details"
                          : item === "captions"
                            ? "details"
                            : "captions";
                    setTab(next);
                    document.getElementById("tab-" + next)?.focus();
                  }
                }}
                aria-controls={"panel-" + item}
                onClick={() => setTab(item)}
                className={
                  "flex flex-1 items-center justify-center gap-2 rounded-control px-3 py-2 text-sm " +
                  (tab === item
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground hover:bg-background")
                }
              >
                {item === "captions" ? (
                  <Captions className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                {item === "captions" ? "Captions" : "Details"}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={"panel-" + tab}
            aria-labelledby={"tab-" + tab}
            className="p-4"
          >
            {tab === "captions" ? (
              subtitle.isPending ? (
                <p aria-busy="true" className="text-sm text-muted-foreground">
                  Loading captions...
                </p>
              ) : subtitle.isError ? (
                <LoadFailure
                  message="Captions could not be loaded."
                  onRetry={() => subtitle.refetch()}
                />
              ) : (
                <SubtitlePreview subtitle={displayedSubtitles} compact />
              )
            ) : (
              <div className="space-y-5 text-sm">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Why this moment
                  </p>
                  <p className="leading-6">
                    {clip.analysisReason ||
                      "A highlight selected from your source video."}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Highlight score
                  </p>
                  <p className="font-medium tabular-nums">
                    {Number.isFinite(clip.score) ? clip.score.toFixed(2) : "-"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Render status
                  </p>
                  <StatusBadge>{clip.renderStatus}</StatusBadge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4 border-t p-4 sm:p-5">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ClipActionsBar
            isPending={review.isPending}
            approveDisabled={canEditLayout && verticalLayout === undefined}
            reviewStatus={clip.reviewStatus}
            onApprove={() =>
              review.mutate({ clipId: clip.id, reviewStatus: "approved", verticalLayout: verticalLayout ?? undefined, clipRange, captionPlacement, captionPreset, captionFontSize })
            }
            onReject={() => {
              if (
                window.confirm(
                  "Reject this clip? Its preview will be removed and it cannot be published.",
                )
              )
                review.mutate({ clipId: clip.id, reviewStatus: "rejected" });
            }}
          />
          <Dialog
            open={publishOpen}
            onOpenChange={(open) => {
              if (!publishing) setPublishOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button type="button" disabled={!canPublish}>
                <Send className="h-4 w-4" />
                {clip.publishStatus === "published"
                  ? "Published"
                  : "Publish clip"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish clip</DialogTitle>
                <DialogDescription>
                  Choose a channel, review the title, and set visibility.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5">
                <PublishForm
                  clip={clip}
                  channels={channels.data ?? []}
                  projectId={clip.projectId}
                  onPendingChange={setPublishing}
                  onSuccess={() => setPublishOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
          {clip.youtubeVideoUrl ? (
            <a
              href={clip.youtubeVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Open on YouTube
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
