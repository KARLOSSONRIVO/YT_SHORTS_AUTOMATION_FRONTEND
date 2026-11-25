import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
const variants = {
  success: "success",
  warning: "warning",
  error: "destructive",
  neutral: "outline",
} as const;
const labels: Record<string, string> = {
  pending_review: "Needs review",
  not_ready: "Not published",
  queued: "Queued",
  processing: "Processing",
  draft: "Draft",
  fully_automatic: "Automatic",
  approval_before_upload: "Approval required",
  draft_only: "Draft only",
};
export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof variants;
}) {
  const text =
    typeof children === "string"
      ? (labels[children] ??
        children.replaceAll("_", " ").replace(/^./, (x) => x.toUpperCase()))
      : children;
  return <Badge variant={variants[tone]}>{text}</Badge>;
}
