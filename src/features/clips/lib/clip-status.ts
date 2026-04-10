export function getReviewTone(status: string): "neutral" | "warning" | "success" | "error" {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  if (status === "pending_review") return "warning";
  return "neutral";
}
