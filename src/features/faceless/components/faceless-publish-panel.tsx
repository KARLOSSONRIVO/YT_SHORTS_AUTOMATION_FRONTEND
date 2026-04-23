"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { SectionCard } from "@/components/common/section-card";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import type { Project } from "@/features/projects/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/errors";
import { mergeDescriptionWithHashtags } from "@/features/publishing/lib/hashtags";
import {
  publishFacelessProjectSchema,
  type PublishFacelessProjectValues
} from "../schemas/publish-faceless-project-schema";
import { usePublishFacelessProjectMutation } from "../hooks/use-publish-faceless-project-mutation";

export function FacelessPublishPanel({ project }: { project: Project }) {
  const { user } = useAuth();
  const channelsQuery = useChannelsQuery(user?.id ?? "");
  const mutation = usePublishFacelessProjectMutation(project.id);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [latestVideoUrl, setLatestVideoUrl] = useState<string | null>(project.publishInfo?.videoUrl ?? null);
  const form = useForm<PublishFacelessProjectValues>({
    resolver: zodResolver(publishFacelessProjectSchema),
    defaultValues: {
      channelId: "",
      title: project.title,
      description: project.description ?? "",
      hashtags: "shorts",
      privacyStatus: "private"
    }
  });

  useEffect(() => {
    if (!form.getValues("channelId") && channelsQuery.data?.length) {
      form.setValue("channelId", channelsQuery.data[0].id, { shouldValidate: true });
    }
  }, [channelsQuery.data, form]);

  useEffect(() => {
    setLatestVideoUrl(project.publishInfo?.videoUrl ?? null);
  }, [project.publishInfo?.videoUrl]);

  useEffect(() => {
    if (!successToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessToast(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successToast]);

  const canPublish =
    project.projectType === "faceless_story" && (project.status === "completed" || project.status === "published");
  const alreadyUploaded = Boolean(latestVideoUrl);
  const uploadedAtLabel = useMemo(() => {
    if (!project.publishInfo?.uploadedAt) {
      return null;
    }

    const uploadedAt = new Date(project.publishInfo.uploadedAt);
    return Number.isNaN(uploadedAt.getTime()) ? null : uploadedAt.toLocaleString();
  }, [project.publishInfo?.uploadedAt]);
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "The upload did not finish. Please try again."
        : null;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync({
      ...values,
      description: mergeDescriptionWithHashtags(values.description ?? "", values.hashtags)
    });

    const uploadedUrl =
      result.videoUrl ?? (result.youtubeVideoId ? `https://www.youtube.com/watch?v=${result.youtubeVideoId}` : null);
    setLatestVideoUrl(uploadedUrl);
    setSuccessToast("Uploaded successfully.");
  });

  return (
    <SectionCard
      title="Publish final video"
      description="Choose one of your saved YouTube accounts and post the finished faceless render without reconnecting the channel."
    >
      {successToast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg">
          {successToast}
        </div>
      ) : null}
      {!canPublish ? (
        <p className="text-sm text-muted-foreground">
          Finish the render first, then you can pick any connected YouTube account and publish from here.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          {errorMessage ? <InlineError message={errorMessage} /> : null}
          {alreadyUploaded ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
              <p className="text-sm font-semibold">Uploaded successfully.</p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <a className="font-medium underline underline-offset-2" href={latestVideoUrl ?? "#"} rel="noreferrer" target="_blank">
                  Open the YouTube video
                </a>
                {uploadedAtLabel ? <span className="text-emerald-900/80">Uploaded at {uploadedAtLabel}</span> : null}
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="faceless-channelId">Channel</Label>
            <Select id="faceless-channelId" {...form.register("channelId")}>
              <option value="">Select a channel</option>
              {(channelsQuery.data ?? []).map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title} ({channel.externalChannelId})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="faceless-title">Video title</Label>
            <Input id="faceless-title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faceless-description">Description</Label>
            <Textarea id="faceless-description" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faceless-hashtags">Hashtags</Label>
            <Input id="faceless-hashtags" placeholder="shorts, ocean, story" {...form.register("hashtags")} />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas or spaces. We&apos;ll append them as hashtags when posting.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="faceless-privacyStatus">Privacy</Label>
            <Select id="faceless-privacyStatus" {...form.register("privacyStatus")}>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </Select>
          </div>
          <Button className="w-full" disabled={alreadyUploaded || mutation.isPending || !(channelsQuery.data?.length)} type="submit">
            {alreadyUploaded ? "Already uploaded" : mutation.isPending ? "Publishing..." : "Publish to YouTube"}
          </Button>
          {!channelsQuery.data?.length ? (
            <p className="text-sm text-muted-foreground">
              Connect at least one YouTube account in Settings, then it will show up here for switching.
            </p>
          ) : null}
        </form>
      )}
    </SectionCard>
  );
}
