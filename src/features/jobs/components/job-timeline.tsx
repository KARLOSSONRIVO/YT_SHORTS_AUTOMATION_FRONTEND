import { StatusBadge } from "@/components/common/status-badge";
import { SectionCard } from "@/components/common/section-card";
import { formatRelativeDate } from "@/lib/utils/format";
import { getJobTone } from "../lib/job-status";
import type { Job } from "../types";

export function JobTimeline({ jobs }: { jobs: Job[] }) {
  return (
    <SectionCard
      title="Processing timeline"
      description="Map queue activity into human-readable states. This is where failed stages should become actionable."
    >
      <div className="space-y-4">
        {jobs.length ? (
          jobs.map((job) => (
            <div key={job.id} className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-background/80 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{job.type}</p>
                <p className="mt-1 text-sm text-muted-foreground">{job.queueName}</p>
                {job.errorMessage ? <p className="mt-2 text-sm text-rose-700">{job.errorMessage}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-muted-foreground">
                  {job.startedAt ? <p>Started {formatRelativeDate(job.startedAt)}</p> : null}
                  {job.completedAt ? <p>Ended {formatRelativeDate(job.completedAt)}</p> : null}
                </div>
                <StatusBadge tone={getJobTone(job.status)}>{job.status}</StatusBadge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Jobs will appear here once the backend starts ingesting the project.</p>
        )}
      </div>
    </SectionCard>
  );
}
