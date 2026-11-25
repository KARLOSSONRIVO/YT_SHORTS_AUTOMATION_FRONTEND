"use client";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ClipActionsBar({
  onApprove,
  onReject,
  isPending,
  approveDisabled,
  reviewStatus,
}: {
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
  approveDisabled?: boolean;
  reviewStatus: "pending_review" | "approved" | "rejected";
}) {
  const locked = reviewStatus !== "pending_review";
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending || locked}
        onClick={onReject}
      >
        <X className="h-4 w-4" />
        Reject
      </Button>
      <Button
        type="button"
        variant={locked ? "secondary" : "default"}
        disabled={isPending || locked || approveDisabled}
        onClick={onApprove}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {reviewStatus === "approved" ? "Approved" : "Approve clip"}
      </Button>
    </div>
  );
}
