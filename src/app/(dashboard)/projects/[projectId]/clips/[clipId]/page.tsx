"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClipDetailPanel } from "@/features/clips/components/clip-detail-panel";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";

export default function ClipDetailPage() {
  const params = useParams<{ projectId: string; clipId: string }>();
  const projectId = String(params.projectId);
  const clipId = String(params.clipId);
  const clipsQuery = useProjectClipsQuery(projectId);
  const clip = clipsQuery.data?.find((item) => item.id === clipId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clip"
        title="Clip detail"
        description="Use the standalone clip page for focused QA, metadata editing, and publish prep when the reviewer wants a single-clip view."
      />
      <ClipDetailPanel clip={clip} />
    </div>
  );
}
