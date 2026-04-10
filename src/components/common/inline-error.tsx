import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function InlineError({
  title = "Something went wrong",
  message,
  action
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-rose-800">{message}</p>
        {action}
      </div>
    </div>
  );
}
