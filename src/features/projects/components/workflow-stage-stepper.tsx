import { Check } from "lucide-react";
import type { WorkflowStage } from "../types";
const stages: Array<{ id: WorkflowStage; label: string }> = [
  { id: "ingest", label: "Upload" },
  { id: "transcription", label: "Transcribe" },
  { id: "analysis", label: "Find clips" },
  { id: "render", label: "Render" },
  { id: "review", label: "Review" },
  { id: "publish", label: "Publish" },
  { id: "completed", label: "Complete" },
];
export function WorkflowStageStepper({
  currentStage,
}: {
  currentStage: WorkflowStage;
}) {
  const active = stages.findIndex((s) => s.id === currentStage);
  return (
    <ol className="grid gap-4 sm:grid-cols-4 xl:grid-cols-7">
      {stages.map((stage, i) => (
        <li
          key={stage.id}
          aria-current={i === active ? "step" : undefined}
          className="flex items-center gap-2.5"
        >
          <span
            className={
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium " +
              (i <= active
                ? "bg-accent text-primary"
                : "bg-secondary text-muted-foreground")
            }
          >
            {i < active ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span
            className={
              "text-xs " +
              (i === active
                ? "font-semibold text-foreground"
                : "text-muted-foreground")
            }
          >
            {stage.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
