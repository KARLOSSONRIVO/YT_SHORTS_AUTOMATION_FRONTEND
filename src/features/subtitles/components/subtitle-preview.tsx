import { SectionCard } from "@/components/common/section-card";
import type { ClipSubtitle } from "@/features/clips/types";

export function SubtitlePreview({ subtitle }: { subtitle?: ClipSubtitle }) {
  return (
    <SectionCard
      title="Subtitle preview"
      description="For V1, keep this read-only. It gives reviewers confidence without forcing subtitle editing to land on day one."
    >
      <div className="space-y-3">
        {subtitle?.segments?.length ? (
          subtitle.segments.slice(0, 6).map((segment, index) => (
            <div key={`${segment.start}-${index}`} className="rounded-2xl bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {segment.start}s - {segment.end}s
              </p>
              <p className="mt-1 text-sm text-foreground">{segment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Subtitle segments will appear here after the subtitle endpoint responds.</p>
        )}
      </div>
    </SectionCard>
  );
}
