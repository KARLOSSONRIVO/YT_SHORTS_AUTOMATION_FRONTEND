"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { FacelessProjectForm } from "@/features/faceless/components/faceless-project-form";
import { UploadForm } from "@/features/uploads/components/upload-form";

export default function UploadPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"clipping" | "faceless">("clipping");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Project"
        title="Choose the workflow you want to start"
        description="Use the same dashboard for both source-video clipping and faceless story generation. Pick the path that matches the asset you want to produce."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("clipping")}
          className={[
            "rounded-xl border px-5 py-5 text-left transition",
            mode === "clipping"
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:bg-accent"
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground">Clip from uploaded video</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bring in a long-form source video, then move through ingest, transcription, clip analysis, review, and publishing.
              </p>
            </div>
            <Badge variant={mode === "clipping" ? "default" : "outline"}>Clipping</Badge>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode("faceless")}
          className={[
            "rounded-xl border px-5 py-5 text-left transition",
            mode === "faceless"
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:bg-accent"
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground">Generate faceless story video</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start from a topic, then let the pipeline build the script, narration, subtitles, scenes, and final vertical story render.
              </p>
            </div>
            <Badge variant={mode === "faceless" ? "default" : "outline"}>Faceless</Badge>
          </div>
        </button>
      </div>
      {mode === "clipping" ? <UploadForm userId={user?.id ?? ""} /> : <FacelessProjectForm userId={user?.id ?? ""} />}
    </div>
  );
}
