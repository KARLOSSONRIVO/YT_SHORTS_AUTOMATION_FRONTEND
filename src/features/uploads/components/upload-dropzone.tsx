"use client";

import { UploadCloud, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  file,
  onFileSelect,
  error
}: {
  file?: File;
  onFileSelect: (file: File | undefined) => void;
  error?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-10 text-center transition",
        error ? "border-rose-300 bg-rose-50" : "border-border bg-card hover:bg-accent/40"
      )}
    >
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0])}
      />
      {file ? <Video className="h-10 w-10 text-primary" /> : <UploadCloud className="h-10 w-10 text-primary" />}
      <p className="mt-4 text-lg font-semibold text-foreground">
        {file ? file.name : "Drop a long-form video or click to browse"}
      </p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        MP4, MOV, or WebM. Keep the upload surface simple and let the project page handle the long-running workflow.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </label>
  );
}
