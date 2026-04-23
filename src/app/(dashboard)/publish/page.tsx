"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/common/section-card";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";
import type { Clip } from "@/features/clips/types";
import { PublishForm } from "@/features/publishing/components/publish-form";
import { useProjectDetailQuery } from "@/features/projects/hooks/use-project-detail-query";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import type { Project } from "@/features/projects/types";

function PublishedProjectCard({
  project,
  expanded,
  onToggle
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}) {
  const clipsQuery = useProjectClipsQuery(project.projectType === "uploaded_video" ? project.id : "");
  const projectDetailQuery = useProjectDetailQuery(project.projectType === "faceless_story" ? project.id : "");

  const publishedClips = useMemo(
    () => (project.projectType === "uploaded_video" ? (clipsQuery.data ?? []).filter((clip) => clip.publishStatus === "published") : []),
    [clipsQuery.data, project.projectType]
  );
  const facelessPublishInfo = project.projectType === "faceless_story" ? projectDetailQuery.data?.publishInfo : null;

  const hasPublishedItems =
    publishedClips.length > 0 || Boolean(facelessPublishInfo?.youtubeVideoId || facelessPublishInfo?.videoUrl);

  if (!hasPublishedItems) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-border bg-background">
      <button
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
        onClick={onToggle}
        type="button"
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {project.projectType === "faceless_story" ? "Faceless" : "Clipping"}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {project.projectType === "faceless_story" ? "1 published video" : `${publishedClips.length} published clip${publishedClips.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <p className="text-lg font-semibold text-foreground">{project.title}</p>
          <p className="text-sm text-muted-foreground">
            {expanded ? "Click to hide published items." : "Click to show published items for this project."}
          </p>
        </div>
        <span className="text-sm font-medium text-primary">{expanded ? "Hide" : "Open"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-border px-5 py-4">
          {project.projectType === "uploaded_video" ? (
            <div className="space-y-3">
              {publishedClips.map((clip) => (
                <PublishedClipRow key={clip.id} clip={clip} />
              ))}
            </div>
          ) : facelessPublishInfo ? (
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{facelessPublishInfo.title ?? project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {facelessPublishInfo.uploadedAt
                      ? `Published ${new Date(facelessPublishInfo.uploadedAt).toLocaleString()}`
                      : "Published to YouTube"}
                  </p>
                </div>
                {facelessPublishInfo.videoUrl ? (
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href={facelessPublishInfo.videoUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open on YouTube
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PublishedClipRow({ clip }: { clip: Clip }) {
  const archiveFolder = clip.localArchiveStorageKey
    ? clip.localArchiveStorageKey.split("/").slice(0, -1).join("/")
    : undefined;

  return (
    <div className="rounded-2xl border border-border bg-muted/20 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{clip.title}</p>
          {archiveFolder ? (
            <p className="text-sm text-muted-foreground">Folder: {archiveFolder}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Archive folder is not available for this older publish.</p>
          )}
        </div>
        {clip.youtubeVideoUrl ? (
          <Link
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={clip.youtubeVideoUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open on YouTube
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function PublishPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const projectsQuery = useProjectsQuery(userId);
  const reviewProject = projectsQuery.data?.find((project) => project.status === "review") ?? projectsQuery.data?.[0];
  const clipsQuery = useProjectClipsQuery(reviewProject?.id ?? "");
  const channelsQuery = useChannelsQuery(userId);
  const clips = clipsQuery.data ?? [];
  const publishableClip = clips.find(
    (clip) => clip.reviewStatus === "approved" && clip.renderStatus === "rendered" && clip.publishStatus !== "published"
  );
  const hasApprovedClip = clips.some((clip) => clip.reviewStatus === "approved");
  const allApprovedClipsPublished =
    hasApprovedClip &&
    !publishableClip &&
    clips.every((clip) => clip.reviewStatus !== "approved" || clip.publishStatus === "published");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish"
        title="Queue approved clips"
        description="Treat publishing as the final confirmation step. Channel state, metadata, and privacy settings should all be visible here."
      />
      <SectionCard
        title="Publish selected clip"
        description="In V1 this page can act as a simple publishing fallback outside the review workspace."
      >
        {publishableClip ? (
          <div className="mx-auto max-w-2xl">
            <PublishForm clip={publishableClip} channels={channelsQuery.data ?? []} projectId={publishableClip.projectId} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {allApprovedClipsPublished
              ? "All approved clips for this project are already published."
              : "No approved clips are ready to publish yet."}
          </p>
        )}
      </SectionCard>
      <SectionCard
        title="Published by project"
        description="Open a project card to see the clips or faceless video already published from that project."
      >
        <div className="space-y-4">
          {(projectsQuery.data ?? []).map((project) => (
            <PublishedProjectCard
              key={project.id}
              expanded={expandedProjectId === project.id}
              onToggle={() => setExpandedProjectId((current) => (current === project.id ? null : project.id))}
              project={project}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
