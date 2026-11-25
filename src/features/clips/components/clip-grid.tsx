import { EmptyState } from "@/components/common/empty-state";
import type { Clip } from "../types";
import { ClipCard } from "./clip-card";
export function ClipGrid({
  clips,
  selectedClipId,
  onSelect,
}: {
  clips: Clip[];
  selectedClipId?: string | null;
  onSelect: (clipId: string) => void;
}) {
  if (!clips.length)
    return (
      <EmptyState
        title="No clips in this view"
        description="Select another filter, or wait for your video to finish processing."
      />
    );
  return (
    <div className="space-y-1">
      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          selected={selectedClipId === clip.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
