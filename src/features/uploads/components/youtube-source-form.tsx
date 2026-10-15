"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appRoutes } from "@/lib/constants/routes";
import { createYouTubeSourceUpload } from "../api/create-upload";
import type { SubtitleStyleValues } from "../types";
import { defaultSubtitleStyleValues, SubtitleStyleFields } from "./subtitle-style-fields";
import { UploadProgressCard } from "./upload-progress-card";
import { youtubeSourceSchema, type YouTubeSourceFormValues } from "../schemas/youtube-source-schema";

export function YouTubeSourceForm() {
  const router = useRouter();
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyleValues>(defaultSubtitleStyleValues);
  const mutation = useMutation({ mutationFn: createYouTubeSourceUpload });
  const form = useForm<YouTubeSourceFormValues>({
    resolver: zodResolver(youtubeSourceSchema),
    defaultValues: {
      sourceUrl: "",
      title: "",
      description: "",
      hashtags: "shorts",
      targetClipCount: 5,
      language: "en"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        ...values,
        subtitlePreferences: subtitleStyle
      });
      router.push(`${appRoutes.projects}/${result.project.id}/review`);
    } catch {
      // The mutation state renders the recoverable error beneath the form.
    }
  });

  return (
    <div className="space-y-6">
      <LoadingOverlay
        open={mutation.isPending}
        title="Preparing YouTube source"
        description="Downloading the source temporarily, then sending it through transcription and clip analysis."
        steps={[
          { label: "Preparing the linked source", state: "active" },
          { label: "Finding candidate clips", state: "pending" },
          { label: "Opening clip review", state: "pending" }
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Link-first clipping</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Analyze a YouTube source</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Paste a video link, choose the subtitle design, and review the candidates before any clip is rendered or published.
          </p>
        </div>
        <Link2 className="hidden h-8 w-8 text-primary/70 sm:block" aria-hidden="true" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard
          title="YouTube source"
          description="The source is downloaded internally only so the existing transcription and clipping pipeline can process it."
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">YouTube video link</Label>
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                autoComplete="url"
                {...form.register("sourceUrl")}
              />
              {form.formState.errors.sourceUrl ? (
                <p className="text-sm text-rose-700">{form.formState.errors.sourceUrl.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Playlists are not accepted. Use a single video you have permission to process.</p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Project title</Label>
                <Input id="title" placeholder="Podcast highlights for April launch" {...form.register("title")} />
                {form.formState.errors.title ? <p className="text-sm text-rose-700">{form.formState.errors.title.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Transcript language</Label>
                <Select id="language" {...form.register("language")}>
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                  <option value="es">Spanish</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetClipCount">Candidate clips to find</Label>
                <Input id="targetClipCount" min={1} max={20} type="number" {...form.register("targetClipCount", { valueAsNumber: true })} />
                {form.formState.errors.targetClipCount ? (
                  <p className="text-sm text-rose-700">{form.formState.errors.targetClipCount.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Optional internal notes for this source." {...form.register("description")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input id="hashtags" placeholder="#shorts #interview" {...form.register("hashtags")} />
              </div>
            </div>

            <SubtitleStyleFields value={subtitleStyle} onChange={setSubtitleStyle} />

            <div className="rounded-control border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
              <p className="font-semibold">You stay in control of publishing</p>
              <p className="mt-1 text-muted-foreground">
                Nothing is published automatically. Review the candidates, approve only the clips you want rendered, then publish each selected clip yourself.
              </p>
            </div>

            {mutation.isError ? (
              <InlineError
                title="Source could not be prepared"
                message={mutation.error instanceof Error ? mutation.error.message : "Try another YouTube link."}
              />
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => router.push(appRoutes.createProject)}>
                Back to project types
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                {mutation.isPending ? "Preparing source..." : "Analyze YouTube Source"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <UploadProgressCard
            title="What happens next"
            description="The source is transcribed and analyzed in the background. This page opens the review workspace when candidate clips are ready."
          />
          <SectionCard title="The review loop">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">1. Analyze:</span> find promising moments from the transcript.</li>
              <li><span className="font-semibold text-foreground">2. Choose:</span> approve only the clips you want to render.</li>
              <li><span className="font-semibold text-foreground">3. Publish:</span> open the publish action for each finished clip.</li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
