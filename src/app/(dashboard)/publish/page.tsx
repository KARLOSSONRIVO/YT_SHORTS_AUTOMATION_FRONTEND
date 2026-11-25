"use client";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Send, Film } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/common/section-card";
import { EmptyState } from "@/components/common/empty-state";
import { LoadFailure } from "@/components/common/load-failure";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/media/video-player";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { useProjectClipsQuery } from "@/features/clips/hooks/use-project-clips-query";
import { PublishForm } from "@/features/publishing/components/publish-form";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { appRoutes } from "@/lib/constants/routes";
import { formatDuration } from "@/lib/utils/format";
export default function PublishPage() {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [clipId, setClipId] = useState("");
  const projects = useProjectsQuery(Boolean(user?.id));
  const project =
    projects.data?.find((p) => p.id === projectId) ??
    projects.data?.find((p) => p.status === "review") ??
    projects.data?.[0];
  const query = useProjectClipsQuery(
    project?.accountId ? "" : (project?.id ?? ""),
  );
  const channels = useChannelsQuery(Boolean(user?.id));
  const ready = (query.data ?? []).filter(
    (c) =>
      c.reviewStatus === "approved" &&
      c.renderStatus === "rendered" &&
      c.publishStatus !== "published",
  );
  const published = (query.data ?? []).filter(
    (c) => c.publishStatus === "published",
  );
  const selected = ready.find((c) => c.id === clipId) ?? ready[0];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Publishing"
        description="Review your final clips, choose a channel, and publish when you are ready."
      />
      {projects.isError ? (
        <LoadFailure
          message="Projects could not be loaded."
          onRetry={() => projects.refetch()}
        />
      ) : null}
      <div className="max-w-sm space-y-2">
        <Label htmlFor="publish-project">Project</Label>
        <Select
          id="publish-project"
          value={project?.id ?? ""}
          onChange={(e) => {
            setProjectId(e.target.value);
            setClipId("");
          }}
        >
          <option value="" disabled>
            Choose a project
          </option>
          {projects.data?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </Select>
      </div>
      {project?.accountId ? (
        <EmptyState
          title="This project uses a clip queue"
          description="Upload, schedule, and publish its finished clips from the project workspace."
          ctaHref={appRoutes.projects + "/" + project.id}
          ctaLabel="Open clip queue"
        />
      ) : query.isError ? (
        <LoadFailure
          message="Clips could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : query.isPending && project ? (
        <Skeleton className="h-80" aria-busy="true" />
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-container border bg-card">
            <div className="border-b px-4 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Send className="h-4 w-4" />
                Ready to publish
                <span className="ml-auto text-muted-foreground">
                  {ready.length}
                </span>
              </h2>
            </div>
            <div className="space-y-1 p-2">
              {ready.length ? (
                ready.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    aria-pressed={selected?.id === c.id}
                    onClick={() => {
                      setClipId(c.id);
                    }}
                    className={
                      "flex w-full items-start gap-3 rounded-control px-3 py-3 text-left " +
                      (selected?.id === c.id
                        ? "bg-accent"
                        : "hover:bg-background")
                    }
                  >
                    <Film className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-sm font-medium">
                        {c.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDuration(c.durationSeconds)}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-sm leading-6 text-muted-foreground">
                  Approved, rendered clips will appear here.
                </p>
              )}
            </div>
          </section>
          {selected ? (
            <SectionCard title="Publish clip" description={selected.title}>
              <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                  <VideoPlayer
                    title={selected.title}
                    src={selected.outputUrl}
                    status={selected.renderStatus}
                  />
                </div>
                <div>
                  <PublishForm
                    key={selected.id}
                    clip={selected}
                    channels={channels.data ?? []}
                    projectId={selected.projectId}
                  />
                </div>
              </div>
            </SectionCard>
          ) : (
            <EmptyState
              title="No clips ready to publish"
              description="Approve your favorite clips in the review workspace. They will appear here after rendering."
              ctaHref={
                project
                  ? appRoutes.projects + "/" + project.id + "/review"
                  : appRoutes.createProject
              }
              ctaLabel={project ? "Review clips" : "Start a project"}
            />
          )}
        </div>
      )}
      {!project?.accountId ? (
        <section className="overflow-hidden rounded-container border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">
              Published clips{" "}
              <span className="ml-1 text-muted-foreground">
                {published.length}
              </span>
            </h2>
          </div>
          {published.length ? (
            <div className="divide-y">
              {published.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">{c.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Published to YouTube
                    </p>
                    {c.localArchiveStorageKey ? (
                      <details className="mt-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer">
                          Archive details
                        </summary>
                        <p className="mt-1 break-all">
                          {c.localArchiveStorageKey
                            .split("/")
                            .slice(0, -1)
                            .join("/")}
                        </p>
                      </details>
                    ) : null}
                  </div>
                  {c.youtubeVideoUrl ? (
                    <a
                      className="inline-flex items-center gap-2 text-sm text-primary"
                      href={c.youtubeVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on YouTube
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Published clips from this project will be listed here.
            </p>
          )}
        </section>
      ) : null}
      {!channels.isPending &&
      !channels.data?.some((c) => c.status === "connected") ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-container border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Connect a YouTube channel before publishing.
          </p>
          <Button type="button" asChild variant="outline">
            <Link href={appRoutes.channels}>Manage channels</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
