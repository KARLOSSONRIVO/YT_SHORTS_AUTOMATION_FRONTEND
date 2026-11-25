import type { ClipRange, ClipSubtitleSegment } from "@/features/clips/types";
import type { ProjectSubtitlePreferences } from "@/features/projects/types";

type TimedText = Pick<ClipSubtitleSegment, "start" | "end" | "text">;
export type CaptionBlock = { start: number; end: number; lines: TimedText[][]; words: TimedText[] };

export function buildCaptionBlocks(
  segments: ClipSubtitleSegment[], range: ClipRange, preferences: Pick<ProjectSubtitlePreferences, "maxCharsPerLine" | "maxLines">
) {
  const { startTimeSeconds: start, endTimeSeconds: end } = range;
  const words = segments.flatMap((segment) => segment.words?.length ? segment.words : [segment])
    .filter((word) => word.end > start && word.start < end && word.text.trim())
    .map((word) => ({ start: Math.max(start, word.start), end: Math.min(end, word.end), text: word.text.trim() }))
    .sort((a, b) => a.start - b.start);
  const blocks: CaptionBlock[] = [];
  let lines: TimedText[][] = [];
  let lineLength = 0;
  let previous: TimedText | undefined;

  function finishBlock() {
    if (!lines.length) return;
    const blockWords = lines.flat();
    blocks.push({ start: blockWords[0].start, end: Math.max(...blockWords.map((word) => word.end)), lines, words: blockWords });
    lines = [];
    lineLength = 0;
  }

  for (const word of words) {
    const length = [...word.text].length;
    const wrap = lineLength > 0 && lineLength + 1 + length > preferences.maxCharsPerLine;
    if ((previous && word.start - previous.end > 0.8) || (wrap && lines.length >= preferences.maxLines)) finishBlock();
    if (!lines.length || wrap) {
      lines.push([]);
      lineLength = 0;
    }
    lines[lines.length - 1].push(word);
    lineLength += (lineLength ? 1 : 0) + length;
    previous = word;
  }
  finishBlock();
  return blocks.map((block, index) => ({ ...block, end: Math.min(block.end, blocks[index + 1]?.start ?? end) }));
}

export function activeCaptionWord(block: CaptionBlock, time: number) {
  return block.words.find((word, index) => word.start <= time && time < (block.words[index + 1]?.start ?? block.end));
}
