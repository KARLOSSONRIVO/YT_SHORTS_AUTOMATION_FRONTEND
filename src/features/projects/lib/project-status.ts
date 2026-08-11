import type { ProjectStatus, ProjectType } from "../types";

const ACTIVE_STATUSES: ProjectStatus[] = [
  "queued",
  "processing",
  "writing_script",
  "generating_audio",
  "generating_subtitles",
  "generating_images",
  "animating_scenes",
  "rendering"
];

export function getProjectTone(status: ProjectStatus): "neutral" | "warning" | "success" | "error" {
  if (ACTIVE_STATUSES.includes(status)) return "warning";
  if (status === "published" || status === "review" || status === "completed") return "success";
  if (status === "failed") return "error";
  return "neutral";
}

export function isProjectActive(status: ProjectStatus) {
  return ACTIVE_STATUSES.includes(status);
}

export function getProjectTypeLabel(projectType: ProjectType, contentType?: "FACELESS_NICHE" | "REDDIT_STORY" | "CLIP_UPLOAD") {
  if (contentType === "FACELESS_NICHE") return "Faceless Niche Story";
  if (contentType === "REDDIT_STORY") return "Reddit Story";
  if (contentType === "CLIP_UPLOAD") return "Clip Upload";
  return projectType === "faceless_story" ? "Faceless" : "Clip Upload";
}
