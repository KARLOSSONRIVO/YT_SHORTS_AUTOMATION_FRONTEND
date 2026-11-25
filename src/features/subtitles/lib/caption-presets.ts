import type { CaptionPreset, ProjectSubtitlePreferences } from "@/features/projects/types";

export const CAPTION_FONT_SIZE = { min: 24, max: 120 } as const;

const boldStroke = {
  preset: "bold_stroke",
  fontFamily: "Anton",
  fontSize: 92,
  fillColor: "#FFFFFF",
  strokeColor: "#000000",
  highlightColor: "#FFFFFF",
  position: "middle_center",
  maxCharsPerLine: 18,
  maxLines: 2,
} as const;

export const captionPresets = {
  bold_stroke: boldStroke,
  red_highlight: { ...boldStroke, preset: "red_highlight", fontSize: 88, highlightColor: "#E53935", position: "bottom_center", maxCharsPerLine: 22 },
  karaoke: { ...boldStroke, preset: "karaoke", fontSize: 84, highlightColor: "#7C3AED", position: "bottom_center", maxCharsPerLine: 20 },
} satisfies Record<CaptionPreset, ProjectSubtitlePreferences>;

export const captionPresetLabels: Record<CaptionPreset, string> = {
  bold_stroke: "Bold Stroke",
  red_highlight: "Red Highlight",
  karaoke: "Karaoke",
};

export function captionFontFamily(fontFamily: string) {
  return fontFamily === "Anton" ? '"Anton", "Arial Black", sans-serif' : '"DejaVu Sans", Arial, sans-serif';
}
