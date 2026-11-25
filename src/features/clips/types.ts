import type { CaptionPreset, ProjectSubtitlePreferences } from "@/features/projects/types";

export interface CaptionPlacement {
  x: number;
  y: number;
}

export interface SourceCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type VerticalLayout =
  | { mode: "gameplay"; gameplay: SourceCrop }
  | { mode: "split" | "facecam"; gameplay: SourceCrop; camera: SourceCrop };

export interface ClipRange {
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export interface Clip extends ClipRange {
  captionPlacement?: CaptionPlacement;
  captionPreset?: CaptionPreset;
  captionFontSize?: number;
  id: string;
  projectId: string;
  title: string;
  hashtags?: string;
  description?: string;
  durationSeconds: number;
  score: number;
  reviewStatus: "pending_review" | "approved" | "rejected";
  renderStatus: "queued" | "rendering" | "rendered" | "failed";
  publishStatus: "not_ready" | "queued" | "published" | "failed";
  sourceVideoUrl?: string;
  outputStorageKey?: string;
  outputUrl?: string;
  subtitleStorageKey?: string;
  analysisReason?: string;
  publishedAt?: string;
  youtubeVideoId?: string;
  youtubeVideoUrl?: string;
  localArchiveStorageKey?: string;
  localArchiveMetadataKey?: string;
}

export interface ClipSubtitleSegment {
  start: number;
  end: number;
  text: string;
  words?: Array<{ start: number; end: number; text: string }>;
}

export interface ClipSubtitle {
  clipId: string;
  content?: string;
  segments?: ClipSubtitleSegment[];
  sourceSegments?: ClipSubtitleSegment[];
  preferences?: ProjectSubtitlePreferences;
}
