"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { queryKeys } from "@/lib/api/query-keys";
import { appRoutes } from "@/lib/constants/routes";
import {
  deleteAutomationProject,
  uploadNextClip,
  getProjectDashboard,
  pauseAutomation,
  removeQueuedClip,
  reorderQueuedClips,
  replaceQueuedClip,
  resumeAutomation,
  retryQueuedClip,
  scheduleQueuedClip,
  uploadQueuedClipNow,
} from "../api";
import type { QueuedClip } from "../types";

const pretty = (value?: string) =>
  value
    ? value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "-";
const when = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Not yet";
const tone = (status: string): "neutral" | "warning" | "success" | "error" =>
  status === "uploaded" || status === "active"
    ? "success"
    : status === "failed" || status === "rejected" || status === "error"
      ? "error"
      : status === "paused" || status === "awaiting_approval"
        ? "warning"
        : "neutral";

export function ProjectAutomationDashboard({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter(),
    client = useQueryClient();
  const [deletePhase, setDeletePhase] = useState<
    "idle" | "deleting" | "redirecting"
  >("idle");
  const dashboard = useQuery({
    queryKey: ["project-dashboard", projectId],
    queryFn: () => getProjectDashboard(projectId),
    refetchInterval: 10000,
  });
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
  const run = useMutation({
    meta: { successTitle: "Next clip queued for upload" },
    mutationFn: () => uploadNextClip(projectId),
    onSuccess: refresh,
  });
  const pause = useMutation({
    meta: { successTitle: "Automation paused" },
    mutationFn: () => pauseAutomation(projectId),
    onSuccess: refresh,
  });
  const resume = useMutation({
    meta: { successTitle: "Automation resumed" },
    mutationFn: () => resumeAutomation(projectId),
    onSuccess: refresh,
  });
  const clipUpload = useMutation({
    meta: { successTitle: "Clip queued for upload" },
    mutationFn: (id: string) => uploadQueuedClipNow(projectId, id),
    onSuccess: refresh,
  });
  const clipRetry = useMutation({
    meta: { successTitle: "Clip queued for retry" },
    mutationFn: (id: string) => retryQueuedClip(projectId, id),
    onSuccess: refresh,
  });
  const clipRemove = useMutation({
    meta: { successTitle: "Clip removed from queue" },
    mutationFn: (id: string) => removeQueuedClip(projectId, id),
    onSuccess: refresh,
  });
  const clipReorder = useMutation({
    meta: { successTitle: "Clip order saved" },
    mutationFn: (ids: string[]) => reorderQueuedClips(projectId, ids),
    onSuccess: refresh,
  });
  const clipReplace = useMutation({
    meta: { successTitle: "Queued clip replaced" },
    mutationFn: (input: { id: string; file: File }) =>
      replaceQueuedClip(projectId, input.id, input.file),
    onSuccess: refresh,
  });
  const clipSchedule = useMutation({
    meta: { successTitle: "Clip schedule saved" },
    mutationFn: (input: { id: string; scheduledAt: string }) =>
      scheduleQueuedClip(projectId, input.id, input.scheduledAt),
    onSuccess: refresh,
  });
  const remove = useMutation({
    meta: { successTitle: "Project deleted" },
    mutationFn: () => deleteAutomationProject(projectId),
    onMutate: () => setDeletePhase("deleting"),
    onSuccess: async () => {
      setDeletePhase("redirecting");
      await client.invalidateQueries({ queryKey: queryKeys.projects.all });
      router.push(appRoutes.projects);
    },
    onError: () => setDeletePhase("idle"),
  });
  if (dashboard.isError && deletePhase === "idle")
    return (
      <div className="space-y-2 py-3 text-sm text-muted-foreground">
        Project dashboard could not be loaded.{" "}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => dashboard.refetch()}
        >
          Retry
        </Button>
      </div>
    );
  if (!dashboard.data)
    return (
      <p className="text-muted-foreground">Loading project dashboard...</p>
    );
  const data = dashboard.data,
    project = data.project;
  const clips = data.clips ?? [];
  const move = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= clips.length) return;
    const ids = clips.map((clip) => clip.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    clipReorder.mutate(ids);
  };
  return (
    <div className="space-y-6">
      <LoadingOverlay
        open={deletePhase !== "idle"}
        tone="destructive"
        title={
          deletePhase === "redirecting" ? "Project deleted" : "Deleting project"
        }
        description={
          deletePhase === "redirecting"
            ? "Taking you back to your projects."
            : "Removing pending local assets, queued clips, and renders. Published history is preserved."
        }
        steps={[
          {
            label: "Removing project assets and queue",
            state: deletePhase === "deleting" ? "active" : "done",
          },
          {
            label: "Returning to your projects",
            state: deletePhase === "redirecting" ? "active" : "pending",
          },
        ]}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {data.account.channelName + " / " + pretty(project.automationMode)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" asChild variant="outline">
            <Link href={appRoutes.createProject + "?edit=" + projectId}>
              <Edit3 />
              Edit Project
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-rose-50"
            disabled={deletePhase !== "idle"}
            onClick={() => {
              if (
                window.confirm(
                  "Delete this project and pending local assets? Published history is preserved.",
                )
              )
                remove.mutate();
            }}
          >
            <Trash2 />
            Delete Project
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<CalendarClock />}
          label="Next Scheduled Run"
          value={when(project.nextRunAt)}
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Last Scheduled Run"
          value={when(project.lastRunAt)}
        />
        <Metric
          icon={<UploadCloud />}
          label="Last Upload"
          value={when(data.lastUpload)}
        />
        <Metric
          icon={<Clock3 />}
          label="Current Job Status"
          value={pretty(data.currentJobStatus)}
        />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge tone={tone(project.automationStatus)}>
                {pretty(project.automationStatus)}
              </StatusBadge>
              <span className="text-sm text-muted-foreground">
                Uploads scheduled at{" "}
                {project.uploadTime + " · " + project.timezone}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Scheduled clips upload at the configured time. Pending clips
              require approval before upload.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => run.mutate()}
              disabled={run.isPending || data.currentJobStatus !== "idle"}
            >
              <PlayCircle />
              {run.isPending ? "Uploading..." : "Upload Next Due Clip"}
            </Button>
            {project.automationEnabled ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => pause.mutate()}
                disabled={pause.isPending}
              >
                <PauseCircle />
                Pause Automation
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => resume.mutate()}
                disabled={resume.isPending}
              >
                <PlayCircle />
                Resume Automation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Clip Queue</CardTitle>
              <CardDescription>
                Manage the order and upload time of your finished clips.
              </CardDescription>
            </div>
            <Button type="button" asChild>
              <Link
                href={
                  appRoutes.createProject + "?edit=" + projectId + "&addClip=1"
                }
              >
                Add Clip
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {clips.length ? (
            clips.map((clip, index) => (
              <ClipRow
                key={clip.id}
                clip={clip}
                first={index === 0}
                last={index === clips.length - 1}
                moveUp={() => move(index, -1)}
                moveDown={() => move(index, 1)}
                upload={() => clipUpload.mutate(clip.id)}
                retry={() => clipRetry.mutate(clip.id)}
                remove={() => clipRemove.mutate(clip.id)}
                replace={(file) => clipReplace.mutate({ id: clip.id, file })}
                schedule={(scheduledAt) =>
                  clipSchedule.mutate({ id: clip.id, scheduledAt })
                }
              />
            ))
          ) : (
            <Empty text="No clips are queued." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Project Activity</CardTitle>
          <CardDescription>
            Scheduling, uploads, queue changes, and errors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.activity.length ? (
            data.activity.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-control border p-4"
              >
                {item.severity === "error" ? (
                  <AlertTriangle className="text-destructive" />
                ) : (
                  <CheckCircle2 className="text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {when(item.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <Empty text="No activity has been recorded yet." />
          )}
        </CardContent>
      </Card>
      {data.recentErrors.length ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentErrors.map((error, index) => (
              <div
                key={(error.clipId ?? "error") + index}
                className="rounded-control bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error.message}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-3 font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-control border border-dashed p-5 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
function ClipRow({
  clip,
  first,
  last,
  moveUp,
  moveDown,
  upload,
  retry,
  remove,
  replace,
  schedule,
}: {
  clip: QueuedClip;
  first: boolean;
  last: boolean;
  moveUp: () => void;
  moveDown: () => void;
  upload: () => void;
  retry: () => void;
  remove: () => void;
  replace: (file: File) => void;
  schedule: (value: string) => void;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  return (
    <div className="rounded-control border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{clip.title}</p>
          <p className="text-xs text-muted-foreground">
            {clip.durationSeconds.toFixed(1) +
              " sec · " +
              (clip.width ?? "?") +
              "x" +
              (clip.height ?? "?") +
              " · " +
              when(clip.scheduledAt)}
          </p>
        </div>
        <StatusBadge tone={tone(clip.status)}>
          {pretty(clip.status)}
        </StatusBadge>
      </div>
      {clip.error ? (
        <p className="mt-2 text-xs text-destructive">{clip.error}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={first || clip.status === "uploaded"}
          onClick={moveUp}
        >
          <ArrowUp />
          Move Up
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={last || clip.status === "uploaded"}
          onClick={moveDown}
        >
          <ArrowDown />
          Move Down
        </Button>
        {["pending", "scheduled"].includes(clip.status) ? (
          <Button type="button" size="sm" onClick={upload}>
            Upload Now
          </Button>
        ) : null}
        {clip.status === "failed" ? (
          <Button type="button" size="sm" onClick={retry}>
            <RefreshCw />
            Retry Upload
          </Button>
        ) : null}
        {["pending", "scheduled", "failed", "draft"].includes(clip.status) ? (
          <>
            <label className="cursor-pointer rounded-control border px-3 py-2 text-xs">
              Replace File
              <input
                aria-label="Replace clip file"
                className="sr-only"
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) replace(file);
                }}
              />
            </label>
            <Input
              className="h-9 w-auto"
              aria-label="Clip upload date and time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!scheduledAt}
              onClick={() => schedule(new Date(scheduledAt).toISOString())}
            >
              Schedule
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={remove}
            >
              Remove
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
