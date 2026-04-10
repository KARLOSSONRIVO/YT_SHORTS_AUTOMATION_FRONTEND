export function getProjectTone(status: string): "neutral" | "warning" | "success" | "error" {
  if (status === "processing") return "warning";
  if (status === "published" || status === "review") return "success";
  if (status === "failed") return "error";
  return "neutral";
}
