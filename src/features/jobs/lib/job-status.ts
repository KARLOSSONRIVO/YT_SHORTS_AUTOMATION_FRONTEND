export function getJobTone(status: string): "neutral" | "warning" | "success" | "error" {
  if (status === "completed") return "success";
  if (status === "active" || status === "queued") return "warning";
  if (status === "failed") return "error";
  return "neutral";
}
