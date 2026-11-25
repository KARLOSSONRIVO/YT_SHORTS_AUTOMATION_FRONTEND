"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ProjectSubtitlePreferences } from "@/features/projects/types";
import type { SubtitleStylePreset, SubtitleStyleValues } from "../types";
import { captionFontFamily, captionPresets as presetValues } from "@/features/subtitles/lib/caption-presets";

type PresetId = Exclude<SubtitleStylePreset, "custom">;

const presetOptions: Array<{
  id: PresetId;
  label: string;
  description: string;
  sample: string;
  highlightIndex: number;
}> = [
  {
    id: "bold_stroke",
    label: "Bold Stroke",
    description: "Large, chunky white type with a thick outline",
    sample: "MAKE IT COUNT",
    highlightIndex: -1,
  },
  {
    id: "red_highlight",
    label: "Red Highlight",
    description: "Red active-word emphasis for key moments",
    sample: "THIS IS IMPORTANT",
    highlightIndex: 2,
  },
  {
    id: "karaoke",
    label: "Karaoke",
    description: "Words light up in time with the speaker",
    sample: "WATCH EVERY WORD",
    highlightIndex: 1,
  },
];

export const defaultSubtitleStyleValues: SubtitleStyleValues = presetValues.bold_stroke;

export function SubtitleStyleFields({
  value,
  onChange,
}: {
  value: SubtitleStyleValues;
  onChange: (next: SubtitleStyleValues) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const applyPreset = (preset: PresetId) => {
    onChange(presetValues[preset]);
  };

  const update = <K extends keyof ProjectSubtitlePreferences>(
    key: K,
    next: ProjectSubtitlePreferences[K],
  ) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="min-w-0 space-y-4">
      <div
        role="group"
        aria-label="Subtitle design presets"
        className="grid min-w-0 gap-3 md:grid-cols-3"
      >
        {presetOptions.map((preset) => {
          const selected = value.preset === preset.id;
          const colors =
            value.preset === preset.id
              ? { ...presetValues[preset.id], ...value }
              : presetValues[preset.id];
          const sampleWords = preset.sample.split(" ");
          return (
            <button
              type="button"
              key={preset.id}

              aria-pressed={selected}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "min-w-0 rounded-control border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-muted/10 hover:bg-muted/30",
              )}
            >
              <span
                aria-hidden="true"
                className="flex min-h-20 w-full min-w-0 items-center justify-center overflow-hidden rounded-control bg-slate-900 px-3 py-4 text-center"
              >
                <span
                  className="block w-full min-w-0 max-w-full break-words text-center text-[clamp(1.1rem,3vw,1.6rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]"
                  style={{
                    color: colors.fillColor,
                    fontFamily: captionFontFamily(colors.fontFamily),
                    fontWeight: colors.fontFamily === "Anton" ? 400 : 700,
                    textShadow: `1px 1px 0 ${colors.strokeColor}, -1px -1px 0 ${colors.strokeColor}, 1px -1px 0 ${colors.strokeColor}, -1px 1px 0 ${colors.strokeColor}`,
                  }}
                >
                  {sampleWords.map((word, index) => {
                    const highlighted = index === preset.highlightIndex;
                    return (
                      <span
                        key={`${word}-${index}`}
                        style={{
                          color:
                            highlighted && preset.id === "karaoke"
                              ? colors.fillColor
                              : highlighted
                                ? colors.highlightColor
                                : colors.fillColor,
                          backgroundColor:
                            highlighted && preset.id === "karaoke"
                              ? colors.highlightColor
                              : undefined,
                          borderRadius:
                            highlighted && preset.id === "karaoke"
                              ? "0.22em"
                              : undefined,
                          padding:
                            highlighted && preset.id === "karaoke"
                              ? "0.06em 0.12em"
                              : undefined,
                        }}
                      >
                        {word}
                        {index < sampleWords.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </span>
              </span>
              <span className="mt-3 block text-sm font-semibold text-foreground">
                {preset.label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"

        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-control border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Fine-tune subtitle settings</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            advancedOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {advancedOpen ? (
        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subtitle-font-family">Font family</Label>
            <Select
              id="subtitle-font-family"
              value={value.fontFamily}
              onChange={(event) => update("fontFamily", event.target.value)}
            >
              <option value="Anton">Anton</option>
              <option value="DejaVu Sans">DejaVu Sans</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-font-size">Font size</Label>
            <Input
              id="subtitle-font-size"
              type="number"
              min={24}
              max={120}
              value={value.fontSize}
              onChange={(event) =>
                update("fontSize", Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-fill-color">Fill color</Label>
            <Input
              id="subtitle-fill-color"
              type="color"
              className="cursor-pointer p-1"
              value={value.fillColor}
              onChange={(event) => update("fillColor", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-stroke-color">Outline color</Label>
            <Input
              id="subtitle-stroke-color"
              type="color"
              className="cursor-pointer p-1"
              value={value.strokeColor}
              onChange={(event) => update("strokeColor", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-highlight-color">Highlight color</Label>
            <Input
              id="subtitle-highlight-color"
              type="color"
              className="cursor-pointer p-1"
              value={value.highlightColor}
              onChange={(event) => update("highlightColor", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-position">Subtitle position</Label>
            <Select
              id="subtitle-position"
              value={value.position}
              onChange={(event) =>
                update(
                  "position",
                  event.target.value as ProjectSubtitlePreferences["position"],
                )
              }
            >
              <option value="top_center">Top center</option>
              <option value="middle_center">Middle center</option>
              <option value="bottom_center">Bottom center</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-max-chars">Max characters per line</Label>
            <Input
              id="subtitle-max-chars"
              type="number"
              min={12}
              max={42}
              value={value.maxCharsPerLine}
              onChange={(event) =>
                update("maxCharsPerLine", Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle-max-lines">Maximum lines</Label>
            <Input
              id="subtitle-max-lines"
              type="number"
              min={1}
              max={4}
              value={value.maxLines}
              onChange={(event) =>
                update("maxLines", Number(event.target.value))
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
