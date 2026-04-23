"use client";

import { Button } from "@/components/ui/button";

export function ClipActionsBar({
  onApprove,
  onReject,
  isPending,
  reviewStatus
}: {
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
  reviewStatus: "pending_review" | "approved" | "rejected";
}) {
  const reviewLocked = reviewStatus !== "pending_review";

  return (
    <div className="flex gap-3">
      <Button className="flex-1" disabled={isPending || reviewLocked} onClick={onApprove}>
        Approve Clip
      </Button>
      <Button className="flex-1" disabled={isPending || reviewLocked} onClick={onReject} variant="outline">
        Reject Clip
      </Button>
    </div>
  );
}
