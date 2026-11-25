import { SectionCard } from "@/components/common/section-card";
import type { Project } from "../types";
import { WorkflowStageStepper } from "./workflow-stage-stepper";

export function ProjectProgressPanel({ project }: { project: Project }) {
  return (
    <SectionCard
      title="Workflow progress"
      description="Track source processing, clip review, and publishing."
    >
      <WorkflowStageStepper
        currentStage={project.workflowStage}
      />
    </SectionCard>
  );
}
