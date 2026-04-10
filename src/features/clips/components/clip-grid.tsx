import { EmptyState } from "@/components/common/empty-state";
import type { Clip } from "../types";
import { ClipCard } from "./clip-card";

export function ClipGrid({
  clips,
  selectedClipId,
  onSelect
}: {
  clips: Clip[];
  selectedClipId?: string | null;
  onSelect: (clipId: string) => void;
}) {
  if (!clips.length) {
    return (
      <EmptyState
        title="No clips yet"
        description="The source video is probably still being transcribed, analyzed, or rendered. Keep polling here while the backend pipeline progresses."
      />
    );
  }

  return (
    <div className="grid content-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} selected={selectedClipId === clip.id} onSelect={onSelect} />
      ))}
    </div>
  );
}
