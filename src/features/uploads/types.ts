import type { Project } from "@/features/projects/types";
import type { Job } from "@/features/jobs/types";
import type { ProjectSubtitlePreferences } from "@/features/projects/types";

export type SubtitleStylePreset = "bold_stroke" | "red_highlight" | "karaoke" | "custom";

export interface SubtitleStyleValues extends ProjectSubtitlePreferences {
  preset: SubtitleStylePreset;
}

export interface YouTubeSourceInput {
  sourceUrl: string;
  title: string;
  description?: string;
  hashtags?: string;
  targetClipCount: number;
  language: string;
  subtitlePreferences: ProjectSubtitlePreferences;
}

export interface UploadResponse {
  project: Project;
  sourceVideo: {
    id: string;
    storageKey: string;
    mimeType: string;
    originalFileName: string;
    sizeBytes: number;
    sourceUrl?: string;
  };
  job: Pick<Job, "id" | "queueName" | "status"> & {
    externalJobId?: string;
  };
}
