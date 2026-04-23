"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Channel } from "@/features/channels/types";
import type { Clip } from "@/features/clips/types";
import { useProjectDetailQuery } from "@/features/projects/hooks/use-project-detail-query";
import { usePublishClipMutation } from "../hooks/use-publish-clip-mutation";
import { mergeDescriptionWithHashtags } from "../lib/hashtags";
import { publishClipSchema, type PublishClipValues } from "../schemas/publish-clip-schema";

export function PublishForm({
  clip,
  channels,
  projectId,
  onSuccess,
  onPendingChange
}: {
  clip: Clip;
  channels: Channel[];
  projectId?: string;
  onSuccess?: (result: { clipId: string; channelId: string; uploadHistoryId: string; youtubeVideoId?: string; videoUrl?: string }) => void;
  onPendingChange?: (isPending: boolean) => void;
}) {
  const mutation = usePublishClipMutation(projectId);
  const projectQuery = useProjectDetailQuery(projectId ?? "");
  const isPublishable =
    clip.reviewStatus === "approved" &&
    clip.renderStatus === "rendered" &&
    clip.publishStatus !== "published";
  const form = useForm<PublishClipValues>({
    resolver: zodResolver(publishClipSchema),
    defaultValues: {
      clipId: clip.id,
      channelId: "",
      title: clip.title,
      description: clip.description || "",
      hashtags: "shorts",
      privacyStatus: "private"
    }
  });

  useEffect(() => {
    if (!form.getValues("channelId") && channels.length) {
      form.setValue("channelId", channels[0].id, { shouldValidate: true });
    }
  }, [channels, form]);

  useEffect(() => {
    const savedHashtags = projectQuery.data?.hashtags?.trim();
    if (!savedHashtags) {
      return;
    }

    form.setValue("hashtags", savedHashtags, { shouldValidate: false });
  }, [form, projectQuery.data?.hashtags]);

  useEffect(() => {
    const projectTitle = projectQuery.data?.title?.trim();
    if (!projectTitle) {
      return;
    }

    const currentTitle = form.getValues("title").trim();
    if (!currentTitle || currentTitle === clip.title.trim()) {
      form.setValue("title", projectTitle, { shouldValidate: false });
    }
  }, [clip.title, form, projectQuery.data?.title]);

  useEffect(() => {
    const projectDescription = projectQuery.data?.description?.trim();
    if (!projectDescription) {
      return;
    }

    const currentDescription = form.getValues("description").trim();
    const clipDescription = (clip.description ?? "").trim();
    if (!currentDescription || currentDescription === clipDescription) {
      form.setValue("description", projectDescription, { shouldValidate: false });
    }
  }, [clip.description, form, projectQuery.data?.description]);

  useEffect(() => {
    onPendingChange?.(mutation.isPending);
  }, [mutation.isPending, onPendingChange]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync({
      ...values,
      description: mergeDescriptionWithHashtags(values.description ?? "", values.hashtags)
    });
    onSuccess?.(result);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {!isPublishable ? (
        <p className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {clip.reviewStatus === "rejected"
            ? "This clip was rejected, so publishing is locked."
            : clip.reviewStatus !== "approved"
              ? "Approve the clip first before publishing."
              : clip.publishStatus === "published"
                ? "This clip has already been published."
                : "Wait for the rendered clip before publishing."}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="channelId">Channel</Label>
        <Select id="channelId" {...form.register("channelId")}>
          <option value="">Select a channel</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.title} ({channel.externalChannelId})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Short title</Label>
        <Input id="title" {...form.register("title")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hashtags">Hashtags</Label>
        <Input id="hashtags" placeholder="shorts, ocean, story" {...form.register("hashtags")} />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas or spaces. We'll format them as #hashtags on publish.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="privacyStatus">Privacy</Label>
        <Select id="privacyStatus" {...form.register("privacyStatus")}>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </Select>
      </div>
      <Button className="w-full" disabled={mutation.isPending || !channels.length || !isPublishable} type="submit">
        {mutation.isPending ? "Queueing publish..." : "Publish to YouTube"}
      </Button>
    </form>
  );
}
