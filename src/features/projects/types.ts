export type ProjectType = "uploaded_video";

export type ProjectStatus =
  | "draft"
  | "queued"
  | "processing"
  | "rendering"
  | "review"
  | "published"
  | "completed"
  | "failed";

export type WorkflowStage =
  | "draft"
  | "ingest"
  | "transcription"
  | "analysis"
  | "render"
  | "review"
  | "publish"
  | "completed";

export type CaptionPreset = "bold_stroke" | "red_highlight" | "karaoke";

export interface ProjectSubtitlePreferences {
  preset?: CaptionPreset | "custom";
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  strokeColor: string;
  highlightColor: string;
  position: "bottom_center" | "top_center" | "middle_center";
  maxCharsPerLine: number;
  maxLines: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  hashtags?: string;
  projectType: ProjectType;
  contentType?: "CLIP_UPLOAD";
  accountId?: string;
  automationEnabled?: boolean;
  automationStatus?: "active" | "paused" | "running" | "error";
  platforms?: Array<"youtube">;
  status: ProjectStatus;
  workflowStage: WorkflowStage;
  subtitlePreferences?: ProjectSubtitlePreferences;
  publishInfo?: {
    youtubeVideoId: string;
    videoUrl: string;
    uploadedAt?: string;
    title?: string;
    privacyStatus?: "private" | "public" | "unlisted";
  } | null;
  createdAt?: string;
  updatedAt?: string;
}
