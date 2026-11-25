"use client";
import { Film, Check } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { getReviewTone } from "../lib/clip-status";
import type { Clip } from "../types";
export function ClipCard({
  clip,
  selected,
  onSelect,
}: {
  clip: Clip;
  selected?: boolean;
  onSelect: (clipId: string) => void;
}) {
  const media = clip.outputUrl || clip.sourceVideoUrl;
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls="clip-inspector"
      onClick={() => onSelect(clip.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-accent"
          : "border-transparent bg-card hover:bg-background",
      )}
    >
      <span
        className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-control bg-slate-900 text-white/60"
        aria-hidden="true"
      >
        {media ? (
          <video
            src={media}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none h-full w-full object-cover"
            onLoadedMetadata={(e) => {
              if (!clip.outputUrl)
                e.currentTarget.currentTime = clip.startTimeSeconds;
            }}
          />
        ) : (
          <Film className="h-5 w-5" />
        )}
        <span className="absolute bottom-1 right-1 rounded-control bg-black/80 px-1 text-[10px] text-white tabular-nums">
          {formatDuration(clip.durationSeconds)}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-sm font-medium">
          {clip.title}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge tone={getReviewTone(clip.reviewStatus)}>
            {clip.reviewStatus}
          </StatusBadge>
          {selected ? <Check className="h-3 w-3 text-primary" /> : null}
        </span>
        <span className="mt-1.5 block text-xs text-muted-foreground tabular-nums">
          {formatDuration(clip.startTimeSeconds)} -{" "}
          {formatDuration(clip.endTimeSeconds)}
        </span>
      </span>
    </button>
  );
}
