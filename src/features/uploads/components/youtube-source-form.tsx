"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Link2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { SectionCard } from "@/components/common/section-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appRoutes } from "@/lib/constants/routes";
import { queryKeys } from "@/lib/api/query-keys";
import { createYouTubeSourceUpload } from "../api/create-upload";
import {
  defaultSubtitleStyleValues,
  SubtitleStyleFields,
} from "./subtitle-style-fields";
import { SourceTabs } from "./source-tabs";
import {
  youtubeSourceSchema,
  type YouTubeSourceFormValues,
} from "../schemas/youtube-source-schema";
export function YouTubeSourceForm() {
  const router = useRouter(),
    client = useQueryClient();
  const [subtitleStyle, setSubtitleStyle] = useState(
    defaultSubtitleStyleValues,
  );
  const mutation = useMutation({
    mutationFn: createYouTubeSourceUpload,
    meta: { successTitle: "YouTube video imported", errorTitle: "Video could not be prepared" },
  });
  const form = useForm<YouTubeSourceFormValues>({
    resolver: zodResolver(youtubeSourceSchema),
    defaultValues: {
      sourceUrl: "",
      title: "",
      description: "",
      hashtags: "shorts",
      language: "en",
    },
  });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        ...values,
        subtitlePreferences: subtitleStyle,
      });
      await client.invalidateQueries({ queryKey: queryKeys.projects.all });
      router.push(`${appRoutes.projects}/${result.project.id}/review`);
    } catch {
      /* The shared toast reports the request failure. */
    }
  });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <LoadingOverlay
        open={mutation.isPending}
        title="Preparing your video"
        description="Your source is being downloaded and checked. Keep this tab open."
        steps={[
          { label: "Preparing source video", state: "active" },
          { label: "Finding highlights", state: "pending" },
          { label: "Opening clip review", state: "pending" },
        ]}
      />
      <PageHeader
        title="New clipping project"
        description="Start with a video. Choose the highlights you want to keep."
      />
      <SourceTabs active="youtube" />
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionCard
          title="YouTube source"
          description="Paste a link to a single video."
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">YouTube video link</Label>
              <Input
                id="sourceUrl"
                type="url"
                autoComplete="url"
                placeholder="https://www.youtube.com/watch?v=..."
                {...form.register("sourceUrl")}
              />
              {form.formState.errors.sourceUrl ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sourceUrl.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Project name</Label>
              <Input
                id="title"
                placeholder="e.g. Weekly interview highlights"
                {...form.register("title")}
              />
              {form.formState.errors.title ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Transcript language</Label>
              <Select id="language" {...form.register("language")}>
                <option value="en">English</option>
                <option value="fil">Filipino</option>
                <option value="es">Spanish</option>
              </Select>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Caption style"
          description="Applied when your approved clips are rendered."
        >
          <SubtitleStyleFields
            value={subtitleStyle}
            onChange={setSubtitleStyle}
          />
        </SectionCard>
        <details className="rounded-container border bg-card p-5">
          <summary className="cursor-pointer text-sm font-medium">
            Project details{" "}
            <span className="text-muted-foreground">(optional)</span>
          </summary>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                placeholder="#shorts #interview"
                {...form.register("hashtags")}
              />
            </div>
          </div>
        </details>
        {form.formState.errors.description || form.formState.errors.hashtags ? (
          <InlineError message="Check the description and hashtags in Project details." />
        ) : null}
        <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            You review every clip before publishing.
          </p>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {mutation.isPending ? "Preparing video..." : "Find clips"}
          </Button>
        </div>
      </form>
    </div>
  );
}
