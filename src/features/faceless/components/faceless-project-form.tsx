"use client";

import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/components/auth-provider";
import { apiBinaryRequest } from "@/lib/api/client";
import { appRoutes } from "@/lib/constants/routes";
import { fallbackFacelessVoices } from "../lib/fallback-voices";
import { useCreateFacelessProjectMutation } from "../hooks/use-create-faceless-project";
import { useFacelessVoicesQuery } from "../hooks/use-faceless-voices-query";
import {
  createFacelessProjectSchema,
  type CreateFacelessProjectValues
} from "../schemas/create-faceless-project-schema";

const PREVIEW_BLOCKED_LANGUAGES = new Set(["Japanese"]);

export function FacelessProjectForm() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateFacelessProjectMutation();
  const voicesQuery = useFacelessVoicesQuery(Boolean(user?.id));
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const form = useForm<CreateFacelessProjectValues>({
    resolver: zodResolver(createFacelessProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      topic: "",
      targetDurationSeconds: 45,
      stylePreset: "cinematic documentary",
      facelessRenderMode: "image_story",
      voice: "af_sarah",
      tone: "mysterious and cinematic",
      audience: "curious viewers who enjoy myth and history",
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
    const result = await mutation.mutateAsync({ ...values, platforms: ["youtube"] });
    router.push(`${appRoutes.projects}/${result.project.id}`);
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
        title="Create faceless story project"
        description="Start with a topic and let the project page track script, audio, subtitles, scenes, and the final vertical render."
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="topic">Story topic</Label>
              <Textarea
                id="topic"
                placeholder="The mystery of Atlantis and how an empire vanished beneath the sea."
                {...form.register("topic")}
              />
              {form.formState.errors.topic ? (
                <p className="text-sm text-rose-700">{form.formState.errors.topic.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Project title</Label>
              <Input id="title" placeholder="The Lost City of Atlantis" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-sm text-rose-700">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional internal notes for this faceless video." {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDurationSeconds">Target duration</Label>
              <Input
                id="targetDurationSeconds"
                min={15}
                max={180}
                type="number"
                {...form.register("targetDurationSeconds", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
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
                  <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Loading Kokoro voices...</p>
                    <p className="text-sm text-muted-foreground">
                      Pulling the available voices from the local model before we show the dropdown choices.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedVoiceOption ? `${selectedVoiceOption.label} (${selectedVoiceOption.voice})` : "No voice selected"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedVoiceOption
                        ? `${selectedVoiceOption.language} · ${selectedVoiceOption.gender}${selectedVoiceOption.quality_grade ? ` · Grade ${selectedVoiceOption.quality_grade}` : ""}`
                        : "Choose a voice to see the preview details."}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Example line: "{selectedVoiceOption?.sample_text ?? "In the last few months, this faceless channel has exploded."}"
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
                {voicesQuery.isError ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Using the local fallback voice list until the backend voice catalog is refreshed.
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Japanese Kokoro voices are currently unavailable in this project.
                </p>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="stylePreset">Visual style</Label>
              <Input id="stylePreset" placeholder="cinematic documentary" {...form.register("stylePreset")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="facelessRenderMode">Story format</Label>
              <Select id="facelessRenderMode" {...form.register("facelessRenderMode")}>
                <option value="image_story">Image story</option>
                <option value="animation_story">Animation story</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Image story uses generated scene images. Animation story sends those images to a Hugging Face image-to-video model before rendering.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input id="tone" placeholder="mysterious and cinematic" {...form.register("tone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Input id="audience" placeholder="history and mystery fans" {...form.register("audience")} />
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/70 px-4 py-4 md:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-primary"
                {...form.register("startImmediately")}
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">Start the faceless pipeline right away</span>
                <span className="block text-sm text-muted-foreground">
                  If this is off, we create the project and let you trigger the run from the project page.
                </span>
              </span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push(appRoutes.dashboard)}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Creating project..." : "Create Project"}
            </Button>
          </div>
        </form>
      </SectionCard>
      <div className="space-y-6">
        <SectionCard title="What happens next">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Generate the script from your topic and tone.</li>
            <li>Build narration, subtitles, scene images, and the final render.</li>
            <li>Use the project page to monitor jobs and recover a failed stage.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Good starting inputs">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Keep the topic specific enough to imply a beginning, conflict, and payoff.</li>
            <li>Use a duration between 30 and 60 seconds for the cleanest Shorts pacing.</li>
            <li>Save extra visual direction for the style field instead of overloading the topic.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
