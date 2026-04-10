import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

const variants = {
  success: "success",
  warning: "warning",
  error: "destructive",
  neutral: "outline"
} as const;

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: keyof typeof variants;
}) {
  return <Badge variant={variants[tone]}>{children}</Badge>;
}
