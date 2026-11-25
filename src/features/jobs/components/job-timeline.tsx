import { StatusBadge } from "@/components/common/status-badge";
import { SectionCard } from "@/components/common/section-card";
import { formatRelativeDate } from "@/lib/utils/format";
import { getJobTone } from "../lib/job-status";
import type { Job } from "../types";

export function JobTimeline({ jobs }: { jobs: Job[] }) {
  return (
    <SectionCard
      title="Processing timeline"
      description="Follow processing progress and check any errors."
    >
      <div className="space-y-4">
        {jobs.length ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-3 rounded-control border border-border bg-background/80 p-4 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {job.type.includes("transcription")
                    ? "Transcribing video"
                    : job.type.includes("analysis")
                      ? "Finding highlights"
                      : job.type.includes("render")
                        ? "Rendering clip"
                        : job.type.includes("publish")
                          ? "Publishing clip"
                          : "Preparing source"}
                </p>
                <details className="mt-1 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Task details</summary>
                  <p className="mt-2">
                    {job.type} / {job.queueName}
                  </p>
                </details>
                {job.progress ? <JobProgress progress={job.progress} /> : null}
                {job.errorMessage ? (
                  <p className="mt-2 text-sm text-rose-700">
                    {job.errorMessage}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-muted-foreground">
                  {job.startedAt ? (
                    <p>Started {formatRelativeDate(job.startedAt)}</p>
                  ) : null}
                  {job.completedAt ? (
                    <p>Ended {formatRelativeDate(job.completedAt)}</p>
                  ) : null}
                </div>
                <StatusBadge tone={getJobTone(job.status)}>
                  {job.status}
                </StatusBadge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Processing activity will appear here after your video is uploaded.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

function JobProgress({ progress }: { progress: NonNullable<Job["progress"]> }) {
  const percent = Math.max(0, Math.min(100, Math.round(progress.percent ?? 0)));
  const hasKnownTotal =
    typeof progress.total === "number" && progress.total > 0;
  const current = Math.min(
    progress.current ?? 0,
    progress.total ?? progress.current ?? 0,
  );

  return (
    <div className="mt-3 max-w-xl">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="truncate">{progress.message ?? "Processing..."}</span>
        <span className="shrink-0 font-medium text-foreground">
          {hasKnownTotal ? `${current}/${progress.total}` : `${percent}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
