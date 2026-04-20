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

export function getProjectTypeLabel(projectType: ProjectType) {
  return projectType === "faceless_story" ? "Faceless" : "Clipping";
}
