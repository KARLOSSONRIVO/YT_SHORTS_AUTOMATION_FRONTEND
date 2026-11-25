"use client";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { ClipDetailPanel } from "./clip-detail-panel";
import { ClipGrid } from "./clip-grid";
import type { Project } from "@/features/projects/types";
import type { Clip } from "../types";
export function ClipReviewShell({
  clips,
}: {
  project?: Project;
  clips: Clip[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("source");
  const visible = clips
    .filter((c) => filter === "all" || c.reviewStatus === filter)
    .sort((a, b) =>
      sort === "score"
        ? b.score - a.score
        : a.startTimeSeconds - b.startTimeSeconds,
    );
  const selected = visible.find((c) => c.id === selectedId) ?? visible[0];
  const pending = clips.filter(
    (c) => c.reviewStatus === "pending_review",
  ).length;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
      <section
        aria-label="Candidate clips"
        className="order-2 overflow-hidden rounded-container border bg-card lg:order-1"
      >
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Clips{" "}
              <span className="ml-1 text-muted-foreground">{clips.length}</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {pending} to review
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label="Filter clips"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 px-2 text-xs"
            >
              <option value="all">All clips</option>
              <option value="pending_review">Needs review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Select
              aria-label="Sort clips"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 px-2 text-xs"
            >
              <option value="source">Source order</option>
              <option value="score">Highest score</option>
            </Select>
          </div>
        </div>
        <div className="max-h-[700px] overflow-y-auto p-2">
          <ClipGrid
            clips={visible}
            selectedClipId={selected?.id}
            onSelect={(id) => {
              setSelectedId(id);
              if (window.innerWidth < 1024)
                document
                  .getElementById("clip-inspector")
                  ?.scrollIntoView({ behavior: "instant", block: "start" });
            }}
          />
        </div>
      </section>
      <div
        id="clip-inspector"
        className="order-1 min-w-0 scroll-mt-4 lg:order-2"
      >
        <ClipDetailPanel key={selected?.id ?? "empty"} clip={selected} />
      </div>
    </div>
  );
}
