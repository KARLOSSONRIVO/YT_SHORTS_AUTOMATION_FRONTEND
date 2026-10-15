import type { Clip } from "@/features/clips/types";
import { formatHashtags } from "./hashtags";

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "being", "because", "could", "does", "doing", "from", "have", "into",
  "just", "like", "more", "most", "much", "only", "over", "really", "some", "than", "that", "their",
  "them", "then", "there", "they", "this", "very", "what", "when", "where", "which", "while", "with",
  "would", "your", "you", "its", "it's", "we", "we're", "were", "we'll", "i", "i'm", "i'll", "you'll",
  "that's", "can", "could", "did", "get", "going", "know", "like", "okay", "want", "will", "ahead",
  "almost", "bitch", "damn", "doesn't", "doesnt", "don't", "dont", "fucking", "good", "grab", "guys",
  "isn't", "isnt", "open", "right", "shit", "sorry", "take", "wait", "wasn't", "wasnt", "yeah", "anything",
  "attention", "automatically", "been", "done", "fine"
]);

const words = (text: string) =>
  text
    .toLowerCase()
    .match(/[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?/g)
    ?.filter((word) => word.length >= 4 && !STOP_WORDS.has(word)) ?? [];

const isIncompleteSentence = (text: string): boolean => {
  const normalized = text.replace(/[.!?]+$/, "").trim();
  return /\.{2,}\s*$/.test(text) ||
    /\b(?:and|or|but|because|if|when|while|to|with|for|from|of|in|on|at|as|than|that|which|who|where|you're|we're|i'm|it's|is|are|was|were|can|could|will|would|should|be)$/i.test(normalized);
};

const sentenceTitle = (text: string): string => {
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => ({
      text: sentence.replace(/[.!?]+$/, "").trim(),
      hasHookPunctuation: /[!?]\s*$/.test(sentence),
      incomplete: isIncompleteSentence(sentence)
    }))
    .map(({ text: sentence, hasHookPunctuation, incomplete }) => ({ sentence, hasHookPunctuation, incomplete }))
    .filter(Boolean);
  const ranked = sentences
    .map(({ sentence, hasHookPunctuation, incomplete }, index) => ({
      sentence,
      index,
      wordCount: sentence.split(/\s+/).length,
      contentCount: words(sentence).length,
      hookBonus: hasHookPunctuation ? 2 : 0,
      incomplete
    }))
    .filter((candidate) => !candidate.incomplete && candidate.wordCount >= 3 && candidate.wordCount <= 14 && (candidate.contentCount >= 2 || (candidate.hookBonus > 0 && candidate.contentCount >= 1)))
    .sort(
      (left, right) =>
        right.contentCount + right.hookBonus - (left.contentCount + left.hookBonus) ||
        left.wordCount - right.wordCount ||
        left.index - right.index
    );
  const sentence = (ranked[0]?.sentence ?? text.trim().split(/\s+/).slice(0, 10).join(" ")).trim();
  if (!sentence) return "Generated clip";
  return sentence
    .split(/\s+/)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1).toLowerCase()}`)
    .join(" ");
};

export function getSuggestedPublishMetadata(clip: Clip, projectHashtags?: string) {
  const sourceText = clip.analysisReason?.trim() || clip.description?.trim() || clip.title.trim();
  const title = sentenceTitle(sourceText) || clip.title || "Generated clip";
  const counts = new Map<string, number>();

  for (const word of words(sourceText)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const transcriptTags = [...counts.entries()]
    .sort(([leftWord, leftCount], [rightWord, rightCount]) => rightCount - leftCount || leftWord.localeCompare(rightWord))
    .map(([word]) => word)
    .slice(0, 5);

  return {
    title: title.slice(0, 100),
    hashtags: clip.hashtags?.trim() || formatHashtags([projectHashtags ?? "", ...transcriptTags, "shorts"].join(" "))
  };
}
