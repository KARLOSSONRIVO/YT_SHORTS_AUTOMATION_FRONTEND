export function formatHashtags(input: string): string {
  const normalizedTokens = input
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.replace(/^#+/, "").replace(/[^\p{L}\p{N}_-]+/gu, "").toLowerCase())
    .filter(Boolean);

  const uniqueTokens = Array.from(new Set(normalizedTokens));
  return uniqueTokens.map((token) => `#${token}`).join(" ");
}

export function mergeDescriptionWithHashtags(description: string, hashtagsInput: string): string {
  const cleanDescription = description.trim();
  const hashtagLine = formatHashtags(hashtagsInput);

  if (!hashtagLine) {
    return cleanDescription;
  }

  if (!cleanDescription) {
    return hashtagLine;
  }

  return `${cleanDescription}\n\n${hashtagLine}`;
}
