"use client";

import {
  useEffect,
  useState,
  useId,
  cloneElement,
  isValidElement,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LoadingOverlay,
  type LoadingOverlayStep,
} from "@/components/common/loading-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { queryKeys } from "@/lib/api/query-keys";
import { SourceTabs } from "@/features/uploads/components/source-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { appRoutes } from "@/lib/constants/routes";
import {
  createAutomationProject,
  getAutomationProject,
  updateAutomationProject,
  uploadQueuedClip,
  validateAccount,
} from "../api";
import type { AutomationMode, ProjectInput } from "../types";

const detectedTimezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";
const today = new Date().toISOString().slice(0, 10);
type SavePhase = "idle" | "saving" | "uploading" | "opening";

export function CreateProjectForm({
  editProjectId,
}: {
  editProjectId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const channels = useChannelsQuery();
  const existing = useQuery({
    queryKey: ["automation-project", editProjectId],
    queryFn: () => getAutomationProject(editProjectId!),
    enabled: Boolean(editProjectId),
  });
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [language, setLanguage] = useState("en");
  const [uploadTime, setUploadTime] = useState("19:00");
  const [timezone, setTimezone] = useState(detectedTimezone);
  const [automationMode, setAutomationMode] = useState<AutomationMode>(
    "approval_before_upload",
  );
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [video, setVideo] = useState<File>();
  const [thumbnail, setThumbnail] = useState<File>();
  const [subtitles, setSubtitles] = useState<File>();
  const [phase, setPhase] = useState<SavePhase>("idle");
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduleDate, setScheduleDate] = useState(today);
  const [privacy, setPrivacy] = useState<"private" | "public" | "unlisted">(
    "private",
  );
  const [audience, setAudience] = useState<
    "not_made_for_kids" | "made_for_kids"
  >("not_made_for_kids");
  const [savedProjectId, setSavedProjectId] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  useEffect(() => {
    if (!video) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(video);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);
  const selectedAccount = channels.data?.find(
    (channel) => channel.id === accountId,
  );
  const accountCheck = useQuery({
    queryKey: ["account-validation", accountId],
    queryFn: () => validateAccount(accountId),
    enabled: Boolean(accountId),
    retry: 1,
  });

  useEffect(() => {
    if (!existing.data) return;
    const p = existing.data;
    setName(p.title);
    setAccountId(p.accountId);
    setLanguage(p.language);
    setUploadTime(p.uploadTime);
    setTimezone(p.timezone);
    setAutomationMode(p.automationMode);
    setAutomationEnabled(p.automationEnabled);
  }, [existing.data]);

  const valid = Boolean(
    name.trim().length >= 2 &&
    accountId &&
    language &&
    timezone &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(uploadTime) &&
    selectedAccount?.status === "connected" &&
    accountCheck.data?.authenticationActive &&
    (editProjectId || video) &&
    (!video || videoTitle.trim().length >= 2) &&
    (!editProjectId || existing.data),
  );
  const payload: ProjectInput = {
    name: name.trim(),
    contentType: "CLIP_UPLOAD",
    accountId,
    language,
    uploadTime,
    timezone,
    automationMode,
    automationEnabled,
  };
  const save = useMutation({
    meta: { successTitle: "Clip queue saved", errorTitle: "Clip queue could not be saved" },
    mutationFn: async () => {
      setPhase("saving");
      // Reuse a newly created queue if its file upload needs to be retried.
      const project = editProjectId
        ? await updateAutomationProject(editProjectId, payload)
        : savedProjectId
          ? await updateAutomationProject(savedProjectId, payload)
          : await createAutomationProject(payload);
      setSavedProjectId(project.id);
      if (video) {
        setPhase("uploading");
        const form = new FormData();
        form.append("video", video);
        if (thumbnail) form.append("thumbnail", thumbnail);
        if (subtitles) form.append("subtitles", subtitles);
        form.append("title", videoTitle.trim());
        form.append("description", description);
        form.append("hashtags", hashtags);
        form.append("language", language);
        form.append("privacyStatus", privacy);
        form.append("audienceSetting", audience);
        if (scheduleDate)
          form.append(
            "scheduledAt",
            zonedDateTime(scheduleDate, uploadTime, timezone),
          );
        await uploadQueuedClip(project.id, form);
      }
      return project;
    },
    onSuccess: async (project) => {
      setPhase("opening");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
        queryClient.invalidateQueries({
          queryKey: ["project-dashboard", project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["automation-project", project.id],
        }),
      ]);
      router.push(appRoutes.projects + "/" + project.id);
    },
    onError: () => setPhase("idle"),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <LoadingOverlay
        open={phase !== "idle"}
        title={phase === "opening" ? "Clip queue saved" : "Saving clip queue"}
        description={
          phase === "uploading"
            ? "Keep this tab open while your video uploads."
            : phase === "opening"
              ? "Opening your clip queue."
              : "Validating your channel and upload schedule."
        }
        steps={savingSteps(phase, Boolean(video), Boolean(editProjectId))}
      />
      <PageHeader
        title={editProjectId ? "Edit clip queue" : "Queue a finished clip"}
        description="Schedule a finished video for your connected YouTube channel."
      />
      {!editProjectId ? <SourceTabs active="queue" /> : null}
      {existing.isError ? (
        <p className="text-sm text-muted-foreground">
          Clip queue could not be loaded.{" "}
          <Button
            type="button"
            variant="outline"
            onClick={() => existing.refetch()}
          >
            Retry
          </Button>
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Clip queue setup</CardTitle>
          <CardDescription>
            Choose a connected account and an upload schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Project name" wide>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
            />
          </Field>
          <ClipFields
            video={video}
            setVideo={setVideo}
            previewUrl={previewUrl}
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            subtitles={subtitles}
            setSubtitles={setSubtitles}
            title={videoTitle}
            setTitle={setVideoTitle}
            description={description}
            setDescription={setDescription}
            hashtags={hashtags}
            setHashtags={setHashtags}
            privacy={privacy}
            setPrivacy={setPrivacy}
            audience={audience}
            setAudience={setAudience}
          />
          <Field label="YouTube account">
            <Select
              value={accountId}
              disabled={Boolean(editProjectId || savedProjectId)}
              onChange={(event) => setAccountId(event.target.value)}
            >
              <option value="">Choose a connected account</option>
              {channels.data?.map((channel) => (
                <option
                  key={channel.id}
                  value={channel.id}
                  disabled={channel.status !== "connected"}
                >
                  {channel.title}
                </option>
              ))}
            </Select>
            {channels.isError ? (
              <p className="text-sm text-muted-foreground">
                Accounts could not be loaded.
              </p>
            ) : null}
            {!channels.isPending &&
            !channels.data?.some(
              (channel) => channel.status === "connected",
            ) ? (
              <Link
                className="text-sm text-primary underline"
                href={appRoutes.channels}
              >
                Connect a YouTube account
              </Link>
            ) : null}
            {accountCheck.isError ||
            (accountCheck.data && !accountCheck.data.authenticationActive) ? (
              <p className="text-sm text-destructive">
                Reconnect this account in Channels.
              </p>
            ) : null}
          </Field>
          <Field label="Language">
            <Select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
            </Select>
          </Field>
          <Field label="Upload date">
            <Input
              type="date"
              value={scheduleDate}
              onChange={(event) => setScheduleDate(event.target.value)}
            />
          </Field>
          <Field label="Upload time">
            <Input
              type="time"
              value={uploadTime}
              onChange={(event) => setUploadTime(event.target.value)}
            />
          </Field>
          <Field label="Timezone">
            <Select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            >
              {Array.from(
                new Set([
                  timezone,
                  detectedTimezone,
                  "Asia/Manila",
                  "UTC",
                  "America/New_York",
                  "America/Los_Angeles",
                  "Europe/London",
                ]),
              ).map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </Select>
          </Field>
          <Field label="Approval mode">
            <Select
              value={automationMode}
              onChange={(event) =>
                setAutomationMode(event.target.value as AutomationMode)
              }
            >
              <option value="approval_before_upload">
                Approval Before Upload
              </option>
              <option value="fully_automatic">Fully Automatic</option>
              <option value="draft_only">Draft Only</option>
            </Select>
          </Field>
          <label className="flex items-center gap-3 rounded-control border p-4 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={automationEnabled}
              onChange={(event) => setAutomationEnabled(event.target.checked)}
            />
            <span>Enable scheduled clip uploads</span>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button
              type="button"
              size="lg"
              disabled={!valid || save.isPending || phase !== "idle"}
              onClick={() => save.mutate()}
            >
              {save.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : editProjectId ? (
                video ? (
                  "Save and queue clip"
                ) : (
                  "Save changes"
                )
              ) : (
                "Create queue and upload clip"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={"space-y-2 " + (wide ? "md:col-span-2" : "")}>
      <Label htmlFor={id}>{label}</Label>
      <div id={id + "-group"}>
        {Array.isArray(children)
          ? children.map((child, index) =>
              index === 0 &&
              child &&
              typeof child === "object" &&
              "type" in child
                ? cloneField(child, id)
                : child,
            )
          : cloneField(children, id)}
      </div>
    </div>
  );
}
function cloneField(child: React.ReactNode, id: string) {
  return isValidElement<{ id?: string }>(child)
    ? cloneElement(child, { id })
    : child;
}

function savingSteps(
  phase: SavePhase,
  uploadsClip: boolean,
  editing: boolean,
): LoadingOverlayStep[] {
  const order: Array<Exclude<SavePhase, "idle">> = uploadsClip
    ? ["saving", "uploading", "opening"]
    : ["saving", "opening"];
  const labels: Record<Exclude<SavePhase, "idle">, string> = {
    saving: editing
      ? "Saving project changes"
      : "Creating project and validating your channel",
    uploading: "Uploading your clip",
    opening: "Opening the project workspace",
  };
  const current = order.indexOf(phase as Exclude<SavePhase, "idle">);
  return order.map((key, index): LoadingOverlayStep => ({
    label: labels[key],
    state: index === current ? "active" : index < current ? "done" : "pending",
  }));
}

function ClipFields({
  video,
  setVideo,
  previewUrl,
  thumbnail,
  setThumbnail,
  subtitles,
  setSubtitles,
  title,
  setTitle,
  description,
  setDescription,
  hashtags,
  setHashtags,
  privacy,
  setPrivacy,
  audience,
  setAudience,
}: {
  video?: File;
  setVideo: (value: File | undefined) => void;
  previewUrl?: string;
  thumbnail?: File;
  setThumbnail: (value: File | undefined) => void;
  subtitles?: File;
  setSubtitles: (value: File | undefined) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  hashtags: string;
  setHashtags: (value: string) => void;
  privacy: "private" | "public" | "unlisted";
  setPrivacy: (value: "private" | "public" | "unlisted") => void;
  audience: "not_made_for_kids" | "made_for_kids";
  setAudience: (value: "not_made_for_kids" | "made_for_kids") => void;
}) {
  return (
    <>
      <div className="space-y-3 md:col-span-2">
        <Label>Upload Video File</Label>
        <label className="focus-within:ring-2 focus-within:ring-ring flex cursor-pointer flex-col items-center justify-center rounded-container border border-dashed bg-muted/10 p-6 text-center">
          <Upload className="mb-2 h-6 w-6 text-primary" />
          <span className="font-semibold">
            {video ? "Replace video" : "Choose a local video"}
          </span>
          <span className="text-xs text-muted-foreground">
            MP4, MOV, WebM, or MKV.{" "}
          </span>
          <input
            className="sr-only"
            aria-label="Choose video file"
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
            onChange={(event) => setVideo(event.target.files?.[0])}
          />
        </label>
        {video ? (
          <div className="rounded-control border p-3">
            <p className="mb-2 text-sm font-medium">{video.name}</p>
            {previewUrl ? (
              <video
                className="max-h-72 w-full rounded-control bg-black"
                controls
                src={previewUrl}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      <details className="md:col-span-2 rounded-control border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Thumbnail and caption file (optional)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Optional Thumbnail">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setThumbnail(event.target.files?.[0])}
            />
            {thumbnail ? (
              <p className="text-xs text-muted-foreground">{thumbnail.name}</p>
            ) : null}
          </Field>
          <Field label="Optional Subtitles">
            <Input
              type="file"
              accept=".srt,.vtt,text/vtt,application/x-subrip"
              onChange={(event) => setSubtitles(event.target.files?.[0])}
            />
            {subtitles ? (
              <p className="text-xs text-muted-foreground">{subtitles.name}</p>
            ) : null}
          </Field>
        </div>
      </details>
      <Field label="Video Title">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          placeholder="Short video title"
        />
      </Field>
      <Field label="Description" wide>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={5000}
        />
      </Field>
      <Field label="Hashtags" wide>
        <Input
          value={hashtags}
          onChange={(event) => setHashtags(event.target.value)}
          placeholder="#shorts #story"
        />
      </Field>
      <Field label="Privacy Status">
        <Select
          value={privacy}
          onChange={(event) => setPrivacy(event.target.value as typeof privacy)}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </Select>
      </Field>
      <Field label="Audience Setting">
        <Select
          value={audience}
          onChange={(event) =>
            setAudience(event.target.value as typeof audience)
          }
        >
          <option value="not_made_for_kids">Not made for kids</option>
          <option value="made_for_kids">Made for kids</option>
        </Select>
      </Field>
    </>
  );
}

function zonedDateTime(date: string, time: string, timeZone: string) {
  const parts = date.split("-").map(Number);
  const clock = time.split(":").map(Number);
  let value = Date.UTC(parts[0], parts[1] - 1, parts[2], clock[0], clock[1]);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (let index = 0; index < 2; index += 1) {
    const mapped = Object.fromEntries(
      formatter
        .formatToParts(new Date(value))
        .map((part) => [part.type, part.value]),
    );
    const rendered = Date.UTC(
      Number(mapped.year),
      Number(mapped.month) - 1,
      Number(mapped.day),
      Number(mapped.hour),
      Number(mapped.minute),
    );
    value +=
      Date.UTC(parts[0], parts[1] - 1, parts[2], clock[0], clock[1]) - rendered;
  }
  return new Date(value).toISOString();
}
