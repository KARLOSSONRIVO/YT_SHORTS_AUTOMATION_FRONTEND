"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Channel } from "@/features/channels/types";
import type { Clip } from "@/features/clips/types";
import { usePublishClipMutation } from "../hooks/use-publish-clip-mutation";
import { publishClipSchema, type PublishClipValues } from "../schemas/publish-clip-schema";

export function PublishForm({
  clip,
  channels,
  projectId
}: {
  clip: Clip;
  channels: Channel[];
  projectId?: string;
}) {
  const mutation = usePublishClipMutation(projectId);
  const form = useForm<PublishClipValues>({
    resolver: zodResolver(publishClipSchema),
    defaultValues: {
      clipId: clip.id,
      channelId: channels[0]?.id ?? "",
      title: clip.title,
      description: clip.description || "",
      privacyStatus: "private"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="channelId">Channel</Label>
        <Select id="channelId" {...form.register("channelId")}>
          <option value="">Select a channel</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.title}
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
        <Label htmlFor="privacyStatus">Privacy</Label>
        <Select id="privacyStatus" {...form.register("privacyStatus")}>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </Select>
      </div>
      <Button className="w-full" disabled={mutation.isPending || !channels.length} type="submit">
        {mutation.isPending ? "Queueing publish..." : "Publish to YouTube"}
      </Button>
    </form>
  );
}
