"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/common/section-card";
import type { Project } from "@/features/projects/types";
import type { Clip } from "../types";
import { ClipDetailPanel } from "./clip-detail-panel";
import { ClipGrid } from "./clip-grid";

export function ClipReviewShell({
  project,
  clips
}: {
  project?: Project;
  clips: Clip[];
}) {
  const initialClipId = clips[0]?.id ?? null;
  const [selectedClipId, setSelectedClipId] = useState<string | null>(initialClipId);

  useEffect(() => {
    if (!selectedClipId && clips[0]) {
      setSelectedClipId(clips[0].id);
    }
  }, [clips, selectedClipId]);

  const selectedClip = useMemo(() => clips.find((clip) => clip.id === selectedClipId), [clips, selectedClipId]);

  return (
    <SectionCard
      title={project ? `${project.title} review queue` : "Review queue"}
      description="Use a two-pane review flow: fast clip scanning on the left and focused preview plus actions on the right."
    >
      <div className="mb-6 grid gap-3 rounded-[28px] border border-border/70 bg-background/80 p-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending Review</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {clips.filter((clip) => clip.reviewStatus === "pending_review").length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rendered</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {clips.filter((clip) => clip.renderStatus === "rendered").length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Queued For Render</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {clips.filter((clip) => clip.renderStatus === "queued" || clip.renderStatus === "rendering").length}
          </p>
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="min-w-0">
          <ClipGrid clips={clips} onSelect={setSelectedClipId} selectedClipId={selectedClipId} />
        </div>
        <div className="xl:sticky xl:top-6">
          <ClipDetailPanel clip={selectedClip} />
        </div>
      </div>
    </SectionCard>
  );
}
