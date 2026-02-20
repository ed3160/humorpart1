/**
 * Column name in caption_votes that stores 1 (upvote) or -1 (downvote).
 * Set NEXT_PUBLIC_CAPTION_VOTES_VOTE_COLUMN in .env.local to match your Supabase table.
 * In Supabase: Table Editor → caption_votes → use the exact column header (e.g. vote_value, score, rating).
 */
export const CAPTION_VOTES_VOTE_COLUMN =
  process.env.NEXT_PUBLIC_CAPTION_VOTES_VOTE_COLUMN ?? "vote_value";
