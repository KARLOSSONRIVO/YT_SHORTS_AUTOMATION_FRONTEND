"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/common/section-card";
import { InlineError } from "@/components/common/inline-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appRoutes } from "@/lib/constants/routes";
import { queryKeys } from "@/lib/api/query-keys";
import { useCreateUploadMutation } from "../hooks/use-create-upload";
import {
  uploadVideoSchema,
  type UploadVideoValues,
} from "../schemas/upload-video-schema";
import type { SubtitleStyleValues } from "../types";
import { UploadDropzone } from "./upload-dropzone";
import { SourceTabs } from "./source-tabs";
import {
  SubtitleStyleFields,
  defaultSubtitleStyleValues,
} from "./subtitle-style-fields";
export function UploadForm() {
  const router = useRouter(),
    client = useQueryClient();
  const mutation = useCreateUploadMutation();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [style, setStyle] = useState<SubtitleStyleValues>(
    defaultSubtitleStyleValues,
  );
  const form = useForm<UploadVideoValues>({
    resolver: zodResolver(uploadVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      hashtags: "shorts",
      ...defaultSubtitleStyleValues,
    },
  });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({ ...values, preset: style.preset });
      await client.invalidateQueries({ queryKey: queryKeys.projects.all });
      router.push(appRoutes.projects + "/" + result.project.id);
    } catch {
      /* The shared toast reports the request failure. */
    }
  });
  const setCaptionStyle = (next: SubtitleStyleValues) => {
    setStyle(next);
    const keys = [
      "fontFamily",
      "fontSize",
      "fillColor",
      "strokeColor",
      "highlightColor",
      "position",
      "maxCharsPerLine",
      "maxLines",
    ] as const;
    keys.forEach((key) =>
      form.setValue(key, next[key], { shouldValidate: true }),
    );
  };
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="New clipping project"
        description="Start with a video. Choose the highlights you want to keep."
      />
      <SourceTabs active="file" />
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionCard
          title="Source video"
          description="Upload the original video you want to clip."
        >
          <UploadDropzone
            file={selectedFile}
            onFileSelect={(file) => {
              setSelectedFile(file);
              if (file) {
                form.setValue("video", file, { shouldValidate: true });
                if (!form.getValues("title"))
                  form.setValue("title", file.name.replace(/\.[^.]+$/, ""), {
                    shouldValidate: true,
                  });
              }
            }}
            error={form.formState.errors.video?.message}
          />
          <div className="mt-5">
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
          </div>
        </SectionCard>
        <SectionCard
          title="Caption style"
          description="Applied when your approved clips are rendered."
        >
          <SubtitleStyleFields value={style} onChange={setCaptionStyle} />
        </SectionCard>
        <details className="rounded-container border bg-card p-5">
          <summary className="cursor-pointer text-sm font-medium">
            Project details{" "}
            <span className="ml-1 font-normal text-muted-foreground">
              (optional)
            </span>
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
        {Object.keys(form.formState.errors).some(
          (key) => !["title", "video"].includes(key),
        ) ? (
          <InlineError message="Check the caption settings and project details before continuing." />
        ) : null}
        <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            You review every clip before publishing.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(appRoutes.projects)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mutation.isPending ? "Uploading video..." : "Find clips"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
