export interface Clip {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
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
}

export interface ClipSubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface ClipSubtitle {
  clipId: string;
  content?: string;
  segments?: ClipSubtitleSegment[];
}
