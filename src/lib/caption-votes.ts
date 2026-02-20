/**
 * Possible column names in caption_votes for the 1/-1 vote value.
 * We try these in order until one works (your Supabase table may use any of these).
 */
export const CAPTION_VOTES_VOTE_COLUMN_CANDIDATES = [
  "vote_value",
  "value",
  "vote",
  "score",
  "rating",
] as const;

/** Env override so you can force a column name without code change. */
export const CAPTION_VOTES_VOTE_COLUMN_ENV =
  process.env.NEXT_PUBLIC_CAPTION_VOTES_VOTE_COLUMN;
