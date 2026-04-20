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
import { getApiBaseUrl } from "@/lib/api/client";
import { appRoutes } from "@/lib/constants/routes";
import { fallbackFacelessVoices } from "../lib/fallback-voices";
import { useCreateFacelessProjectMutation } from "../hooks/use-create-faceless-project";
import { useFacelessVoicesQuery } from "../hooks/use-faceless-voices-query";
import {
  createFacelessProjectSchema,
  type CreateFacelessProjectValues
} from "../schemas/create-faceless-project-schema";

const platformOptions: Array<{ value: "youtube" | "tiktok"; label: string }> = [
  { value: "youtube", label: "YouTube Shorts" },
  { value: "tiktok", label: "TikTok" }
];

const PREVIEW_BLOCKED_LANGUAGES = new Set(["Japanese"]);

export function FacelessProjectForm({ userId }: { userId: string }) {
  const router = useRouter();
  const mutation = useCreateFacelessProjectMutation();
  const voicesQuery = useFacelessVoicesQuery(Boolean(userId));
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const form = useForm<CreateFacelessProjectValues>({
    resolver: zodResolver(createFacelessProjectSchema),
    defaultValues: {
      userId,
      title: "",
      description: "",
      topic: "",
      platforms: ["youtube", "tiktok"],
      targetDurationSeconds: 45,
      stylePreset: "cinematic documentary",
      voice: "af_sarah",
      tone: "mysterious and cinematic",
      audience: "curious viewers who enjoy myth and history",
      startImmediately: true
    }
  });

  const selectedPlatforms = form.watch("platforms");
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
    setPreviewSrc(null);
  }, [selectedVoice]);

  const togglePlatform = (platform: "youtube" | "tiktok") => {
    const current = form.getValues("platforms");
    const next = current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform];
    form.setValue("platforms", next, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);
    router.push(`${appRoutes.projects}/${result.project.id}`);
  });

  const loadVoicePreview = () => {
    if (!selectedVoice) {
      return;
    }
    setPreviewSrc(`${getApiBaseUrl()}/projects/faceless/voices/${encodeURIComponent(selectedVoice)}/preview?ts=${Date.now()}`);
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
                      <Button type="button" variant="outline" disabled={!selectedVoiceOption} onClick={loadVoicePreview}>
                        {previewSrc ? "Refresh voice preview" : "Play voice preview"}
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
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input id="tone" placeholder="mysterious and cinematic" {...form.register("tone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Input id="audience" placeholder="history and mystery fans" {...form.register("audience")} />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label>Target platforms</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {platformOptions.map((platform) => {
                  const active = selectedPlatforms.includes(platform.value);

                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => togglePlatform(platform.value)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left text-sm transition",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      ].join(" ")}
                    >
                      <p className="font-semibold text-foreground">{platform.label}</p>
                      <p className="mt-1 text-xs">Store platform intent on the project from the start.</p>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.platforms ? (
                <p className="text-sm text-rose-700">{form.formState.errors.platforms.message}</p>
              ) : null}
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
