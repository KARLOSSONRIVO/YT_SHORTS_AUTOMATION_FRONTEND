"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appRoutes } from "@/lib/constants/routes";
import { useCreateUploadMutation } from "../hooks/use-create-upload";
import { uploadVideoSchema, type UploadVideoValues } from "../schemas/upload-video-schema";
import { UploadDropzone } from "./upload-dropzone";
import { UploadProgressCard } from "./upload-progress-card";

export function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const mutation = useCreateUploadMutation();
  const form = useForm<UploadVideoValues>({
    resolver: zodResolver(uploadVideoSchema),
    defaultValues: {
      userId,
      title: "",
      description: "",
      fontFamily: "Montserrat ExtraBold",
      fontSize: 64,
      fillColor: "#FFFFFF",
      strokeColor: "#000000",
      highlightColor: "#FFD54A",
      position: "bottom_center",
      maxCharsPerLine: 28,
      maxLines: 2
    }
  });

  useEffect(() => {
    if (selectedFile) {
      form.setValue("video", selectedFile, { shouldValidate: true });
    }
  }, [form, selectedFile]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);
    router.push(`${appRoutes.projects}/${result.project.id}`);
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <SectionCard
        title="Upload source video"
        description="Keep this form tight. The follow-up project page becomes the main command center for processing and review."
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          <UploadDropzone
            file={selectedFile}
            onFileSelect={setSelectedFile}
            error={form.formState.errors.video?.message}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Project title</Label>
              <Input id="title" placeholder="Podcast highlights for April launch" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-sm text-rose-700">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional internal notes for the source upload." {...form.register("description")} />
              {form.formState.errors.description ? (
                <p className="text-sm text-rose-700">{form.formState.errors.description.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="rounded-[28px] border border-border/70 bg-background/80 p-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">Subtitle style for final Shorts render</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These settings are stored on the project and reused when the backend renders the final vertical Shorts video.
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
                  <div className="space-y-2">
                    <Label htmlFor="position">Subtitle position</Label>
                    <select
                      id="position"
                      className="flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                      {...form.register("position")}
                    >
                      <option value="bottom_center">Bottom center</option>
                      <option value="top_center">Top center</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCharsPerLine">Max chars per line</Label>
                    <Input
                      id="maxCharsPerLine"
                      min={12}
                      max={42}
                      type="number"
                      {...form.register("maxCharsPerLine", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLines">Max lines</Label>
                    <Input id="maxLines" min={1} max={4} type="number" {...form.register("maxLines", { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push(appRoutes.dashboard)}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Starting workflow..." : "Create Project"}
            </Button>
          </div>
        </form>
      </SectionCard>
      <div className="space-y-6">
        <UploadProgressCard
          title="What happens next"
          description="After upload, we route the user straight into the project page where ingest, transcription, clip analysis, and render states are polled."
        />
        <SectionCard title="Operator notes">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Use the project page for live pipeline progress.</li>
            <li>Move review decisions into the clip workspace.</li>
            <li>Keep publish actions separate from initial upload.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
