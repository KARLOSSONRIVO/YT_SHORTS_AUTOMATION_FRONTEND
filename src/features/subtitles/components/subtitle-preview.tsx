import type { ClipSubtitle } from "@/features/clips/types";
import { formatDuration } from "@/lib/utils/format";
export function SubtitlePreview({
  subtitle,
  compact,
}: {
  subtitle?: ClipSubtitle;
  compact?: boolean;
}) {
  return (
    <section
      aria-label="Caption transcript"
      className={compact ? "" : "rounded-container border bg-card p-5"}
    >
      {!compact ? (
        <h2 className="mb-4 text-base font-semibold">Captions</h2>
      ) : null}
      <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
        {subtitle?.segments?.length ? (
          subtitle.segments.map((segment) => (
            <div key={`${segment.start}-${segment.end}-${segment.text}`}>
              <p className="mb-1 text-[11px] text-muted-foreground tabular-nums">
                {formatDuration(segment.start)} - {formatDuration(segment.end)}
              </p>
              <p className="break-words text-sm leading-6">{segment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Captions will appear once this clip has been transcribed.
          </p>
        )}
      </div>
    </section>
  );
}
