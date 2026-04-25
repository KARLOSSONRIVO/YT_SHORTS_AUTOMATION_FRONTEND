"use client";

import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { InlineError } from "@/components/common/inline-error";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/features/auth/components/auth-provider";
import { apiBinaryRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { appRoutes } from "@/lib/constants/routes";
import { useCreateRedditStoryProjectMutation } from "../hooks/use-create-reddit-story-project";
import { useFacelessVoicesQuery } from "../hooks/use-faceless-voices-query";
import { fallbackFacelessVoices } from "../lib/fallback-voices";
import {
  createRedditStoryProjectSchema,
  type CreateRedditStoryProjectValues
} from "../schemas/create-reddit-story-project-schema";

const PREVIEW_BLOCKED_LANGUAGES = new Set(["Japanese"]);

export function RedditStoryProjectForm() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateRedditStoryProjectMutation();
  const voicesQuery = useFacelessVoicesQuery(Boolean(user?.id));
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateRedditStoryProjectValues>({
    resolver: zodResolver(createRedditStoryProjectSchema),
    defaultValues: {
      maxDurationSeconds: undefined,
      voice: "af_sarah",
      fontFamily: "Montserrat ExtraBold",
      fontSize: 64,
      fillColor: "#FFFFFF",
      strokeColor: "#000000",
      highlightColor: "#FFD54A",
      startImmediately: true
    }
  });

  const selectedVoice = form.watch("voice");
  const allVoiceOptions = voicesQuery.isLoading
    ? []
    : voicesQuery.data?.length
      ? voicesQuery.data
      : voicesQuery.isError
        ? fallbackFacelessVoices
        : [];
  const voiceOptions = useMemo(
    () => allVoiceOptions.filter((voice) => !PREVIEW_BLOCKED_LANGUAGES.has(voice.language)),
    [allVoiceOptions]
  );
  const voiceCatalogSummary = useMemo(() => {
    if (voicesQuery.isLoading) {
      return "Loading Kokoro voices from the backend...";
    }

    if (voicesQuery.isError) {
      return `Using the local fallback voice list (${voiceOptions.length} voices) until the backend voice catalog is refreshed.`;
    }

    if (voiceOptions.length > 0) {
      return `Loaded ${voiceOptions.length} Kokoro voices from the backend catalog. Open the dropdown to see the full list.`;
    }

    return "No voices are currently available.";
  }, [voiceOptions.length, voicesQuery.isError, voicesQuery.isLoading]);
  const selectedVoiceOption = useMemo(
    () => voiceOptions.find((voice) => voice.voice === selectedVoice) ?? null,
    [selectedVoice, voiceOptions]
  );

  useEffect(() => {
    if (!voiceOptions.length) {
      return;
    }

    const currentVoice = form.getValues("voice");
    const voiceExists = voiceOptions.some((voice) => voice.voice === currentVoice);
    if (!voiceExists) {
      form.setValue("voice", voiceOptions[0].voice, { shouldValidate: true });
    }
  }, [form, voiceOptions]);

  useEffect(() => {
    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
    }
    setPreviewSrc(null);
  }, [selectedVoice]);

  useEffect(() => {
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await mutation.mutateAsync(values);
      router.push(`${appRoutes.projects}/${result.project.id}`);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We created the Reddit project but could not start the pipeline automatically."
      );
    }
  });

  const loadVoicePreview = async () => {
    if (!selectedVoice) {
      return;
    }

    setIsPreviewLoading(true);
    try {
      const audioBlob = await apiBinaryRequest(
        `/projects/faceless/voices/${encodeURIComponent(selectedVoice)}/preview?ts=${Date.now()}`
      );
      const nextPreviewSrc = URL.createObjectURL(audioBlob);
      setPreviewSrc((currentPreviewSrc) => {
        if (currentPreviewSrc) {
          URL.revokeObjectURL(currentPreviewSrc);
        }
        return nextPreviewSrc;
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <SectionCard
        title="Create faceless Reddit story project"
        description="Pull the freshest unused trending Reddit story automatically, narrate it, subtitle it, and render it against your provided gameplay template."
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          {formError ? <InlineError title="Reddit story did not start" message={formError} /> : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="maxDurationSeconds">Max duration cap</Label>
              <Input
                id="maxDurationSeconds"
                min={15}
                max={180}
                type="number"
                placeholder="Optional"
                {...form.register("maxDurationSeconds", {
                  setValueAs: (value) => (value === "" || value === undefined ? undefined : Number(value))
                })}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Leave this blank if you want the story itself to determine the length.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="voice">Voice</Label>
              <Select id="voice" disabled={voicesQuery.isLoading || voiceOptions.length === 0} {...form.register("voice")}>
                {voicesQuery.isLoading ? <option value="">Loading Kokoro voices...</option> : null}
                {!voicesQuery.isLoading && voiceOptions.length === 0 ? <option value="">No voices available</option> : null}
                {voiceOptions.map((voice) => (
                  <option key={voice.voice} value={voice.voice}>
                    {voice.label} - {voice.language}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">{voiceCatalogSummary}</p>
              <div className="rounded-xl border border-border/80 bg-background/70 px-4 py-3">
                {voicesQuery.isLoading ? (
                  <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
                    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Loading Kokoro voices...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedVoiceOption ? `${selectedVoiceOption.label} (${selectedVoiceOption.voice})` : "No voice selected"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedVoiceOption
                        ? `${selectedVoiceOption.language} · ${selectedVoiceOption.gender}${selectedVoiceOption.quality_grade ? ` · Grade ${selectedVoiceOption.quality_grade}` : ""}`
                        : "Choose a voice to preview the Reddit narration."}
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      <Button type="button" variant="outline" disabled={!selectedVoiceOption || isPreviewLoading} onClick={loadVoicePreview}>
                        {isPreviewLoading ? "Loading preview..." : previewSrc ? "Refresh voice preview" : "Play voice preview"}
                      </Button>
                      {previewSrc ? (
                        <audio key={previewSrc} controls className="w-full">
                          <source src={previewSrc} type="audio/wav" />
                        </audio>
                      ) : null}
                    </div>
                  </>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Japanese Kokoro voices are currently unavailable in this project.
                </p>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="rounded-[28px] border border-border/70 bg-background/80 p-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">Subtitle style for Reddit story render</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These settings only apply to Reddit-story subtitles and are reused on rerenders.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font family</Label>
                    <Input id="fontFamily" placeholder="Montserrat ExtraBold" {...form.register("fontFamily")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font size</Label>
                    <Input id="fontSize" min={24} max={120} type="number" {...form.register("fontSize", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fillColor">Fill color</Label>
                    <Input id="fillColor" type="color" {...form.register("fillColor")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strokeColor">Stroke color</Label>
                    <Input id="strokeColor" type="color" {...form.register("strokeColor")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highlightColor">Highlight color</Label>
                    <Input id="highlightColor" type="color" {...form.register("highlightColor")} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Reddit-story subtitles stay in the middle and keep the single-word pacing automatically.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/70 px-4 py-4 md:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-primary"
                {...form.register("startImmediately")}
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">Start the Reddit story pipeline right away</span>
                <span className="block text-sm text-muted-foreground">
                  We create the project, fetch the freshest trending post, then queue narration, subtitles, and the final render.
                </span>
              </span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push(appRoutes.dashboard)}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Creating Reddit project..." : "Create Reddit Project"}
            </Button>
          </div>
        </form>
      </SectionCard>
      <div className="space-y-6">
        <SectionCard title="What happens next">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Fetch the highest-ranked fresh Reddit self-post from the built-in story feed.</li>
            <li>Skip any story that already exists in the database and move to the next best candidate.</li>
            <li>Use the story itself to drive pacing, only trimming when it would run past your optional max cap.</li>
            <li>Use the Reddit post title as both the project title and the default YouTube title.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Good starting inputs">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>We automatically search story-heavy subreddits like AskReddit, tifu, confession, and offmychest.</li>
            <li>Use the duration cap only when you want to keep long posts from running too far.</li>
            <li>Pick a voice first, then preview it to make sure the pacing fits the story tone.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
