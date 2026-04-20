import { cn } from "@/lib/utils";
import type { ProjectType, WorkflowStage } from "../types";

const uploadedVideoStages: WorkflowStage[] = ["ingest", "transcription", "analysis", "render", "review", "publish", "completed"];
const facelessStages: WorkflowStage[] = ["draft", "script", "audio", "subtitles", "scenes", "render", "completed"];

export function WorkflowStageStepper({
  currentStage,
  projectType
}: {
  currentStage: WorkflowStage;
  projectType: ProjectType;
}) {
  const stages = projectType === "faceless_story" ? facelessStages : uploadedVideoStages;
  const activeIndex = stages.indexOf(currentStage);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
              index <= activeIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            )}
          >
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stage</p>
            <p className="truncate text-sm font-medium capitalize text-foreground">{stage}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
