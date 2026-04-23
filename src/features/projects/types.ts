export type ProjectType = "uploaded_video" | "faceless_story";

export type ProjectStatus =
  | "draft"
  | "queued"
  | "processing"
  | "writing_script"
  | "generating_audio"
  | "generating_subtitles"
  | "generating_images"
  | "animating_scenes"
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
  | "script"
  | "audio"
  | "subtitles"
  | "scenes"
  | "render"
  | "review"
  | "publish"
  | "completed";

export interface ProjectSubtitlePreferences {
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
  topic?: string;
  platforms?: Array<"youtube">;
  targetDurationSeconds?: number;
  stylePreset?: string;
  voice?: string;
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
