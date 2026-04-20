import { SectionCard } from "@/components/common/section-card";
import type { Project } from "../types";
import { WorkflowStageStepper } from "./workflow-stage-stepper";

export function ProjectProgressPanel({ project }: { project: Project }) {
  return (
    <SectionCard
      title="Workflow progress"
      description={
        project.projectType === "faceless_story"
          ? "This project tracks the script, narration, subtitles, scene generation, and final vertical render."
          : "This card is the project-level summary. Keep it readable and let the job timeline carry the deeper execution detail."
      }
    >
      <WorkflowStageStepper currentStage={project.workflowStage} projectType={project.projectType} />
    </SectionCard>
  );
}
