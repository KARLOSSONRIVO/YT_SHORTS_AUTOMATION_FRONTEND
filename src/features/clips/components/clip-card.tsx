import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { getReviewTone } from "../lib/clip-status";
import type { Clip } from "../types";

export function ClipCard({
  clip,
  selected,
  onSelect
}: {
  clip: Clip;
  selected?: boolean;
  onSelect: (clipId: string) => void;
}) {
  return (
    <button className="w-full text-left" onClick={() => onSelect(clip.id)} type="button">
      <Card
        className={cn(
          "h-full overflow-hidden transition",
          selected ? "border-primary ring-2 ring-primary/30" : "hover:-translate-y-0.5"
        )}
      >
        <div className="relative aspect-[9/12] bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(17,24,39,0.95))]">
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.92))] px-4 py-4 text-xs text-white/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 capitalize">
              {clip.renderStatus}
            </span>
            <span>{clip.outputUrl ? "Rendered preview" : clip.sourceVideoUrl ? "Source preview" : "No preview yet"}</span>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="line-clamp-2 text-sm font-semibold text-foreground">{clip.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDuration(clip.durationSeconds)}</p>
            </div>
            <StatusBadge tone={getReviewTone(clip.reviewStatus)}>{clip.reviewStatus}</StatusBadge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Score {clip.score}</span>
            <span className="capitalize">{clip.publishStatus}</span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
