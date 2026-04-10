"use client";

import { Button } from "@/components/ui/button";

export function ClipActionsBar({
  onApprove,
  onReject,
  isPending
}: {
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button className="flex-1" disabled={isPending} onClick={onApprove}>
        Approve Clip
      </Button>
      <Button className="flex-1" disabled={isPending} onClick={onReject} variant="outline">
        Reject Clip
      </Button>
    </div>
  );
}
