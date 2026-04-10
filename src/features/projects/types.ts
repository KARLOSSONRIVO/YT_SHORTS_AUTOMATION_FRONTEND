export type ProjectStatus = "draft" | "processing" | "review" | "published" | "failed";
export type WorkflowStage = "ingest" | "transcription" | "analysis" | "render" | "review" | "publish" | "completed";

export interface ProjectSubtitlePreferences {
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  strokeColor: string;
  highlightColor: string;
  position: "bottom_center" | "top_center";
  maxCharsPerLine: number;
  maxLines: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workflowStage: WorkflowStage;
  subtitlePreferences?: ProjectSubtitlePreferences;
  createdAt?: string;
  updatedAt?: string;
}
