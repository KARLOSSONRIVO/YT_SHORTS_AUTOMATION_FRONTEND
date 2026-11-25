"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/toast";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const showToast = useToast();
  useEffect(() => {
    showToast({ tone: "error", title: "Something went wrong", message: "Try reopening this screen." });
  }, [showToast]);
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-8">
      <p className="text-sm text-muted-foreground">This screen could not be displayed.</p>
      <Button type="button" onClick={reset}>Try again</Button>
    </div>
  );
}
