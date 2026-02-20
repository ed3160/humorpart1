const MAX_CAPTION_CHARS = 52;

export function truncateAtWordWithEllipsis(
  text: string,
  maxChars: number = MAX_CAPTION_CHARS
): { display: string; hadMore: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return { display: trimmed, hadMore: false };
  const upToLimit = trimmed.slice(0, maxChars + 1);
  const lastSpace = upToLimit.lastIndexOf(" ");
  const cut = lastSpace > 0 ? lastSpace : maxChars;
  return {
    display: trimmed.slice(0, cut).trim() + "...",
    hadMore: true,
  };
}

export function formatCaption(raw: string | null): string | null {
  if (raw == null || raw === "") return null;
  const result = truncateAtWordWithEllipsis(raw);
  return result.hadMore ? result.display : result.display + "...";
}
