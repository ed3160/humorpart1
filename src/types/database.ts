/**
 * Row from the images table. Matches Supabase schema.
 */
export type ImageRow = {
  id: string;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  url: string | null;
  is_common_use: boolean | null;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean | null;
  image_description: string | null;
  celebrity_recognition: string | null;
};

/**
 * Row from the caption_votes table. One row per user per caption (unique on profile_id, caption_id).
 * Upvote = 1, downvote = -1. Column in DB is "value" (not "vote").
 */
export type CaptionVoteRow = {
  profile_id: string;
  caption_id: string;
  value: number; // 1 or -1
};
