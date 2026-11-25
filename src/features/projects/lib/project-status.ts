import type { ProjectStatus } from "../types";

const ACTIVE_STATUSES: ProjectStatus[] = [
  "queued",
  "processing",
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

export function getProjectTypeLabel() {
  return "Clipping";
}
