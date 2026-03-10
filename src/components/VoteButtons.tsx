"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Vote = 1 | -1 | null;

export function VoteButtons({
  captionId,
  initialVote,
  voteColumn,
}: {
  captionId: string;
  initialVote: Vote;
  voteColumn: string;
}) {
  const [vote, setVote] = useState<Vote>(initialVote);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => { setVote(initialVote); }, [initialVote]);
  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  async function submitVote(newVote: 1 | -1) {
    setLoading(true);
    setVoteError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setVoteError("Sign in to vote"); return; }

      // Clicking the same vote again = undo
      if (vote === newVote) {
        const { error } = await supabase
          .from("caption_votes")
          .delete()
          .eq("profile_id", user.id)
          .eq("caption_id", captionId);
        if (!error) setVote(null);
        return;
      }

      const { error } = await supabase.from("caption_votes").upsert({
        profile_id: user.id,
        caption_id: captionId,
        [voteColumn]: newVote,
        created_datetime_utc: new Date().toISOString(),
        modified_datetime_utc: new Date().toISOString(),
      }, { onConflict: "profile_id,caption_id" });

      if (error) { setVoteError(error.message); return; }
      setVote(newVote);
      setFeedback("Saved");
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1">
      <button
        type="button"
        onClick={() => submitVote(1)}
        disabled={loading}
        aria-label="Upvote"
        className={`rounded-md p-1.5 transition-all duration-150 active:scale-90 ${
          vote === 1
            ? "bg-green-500/15 text-green-600 dark:text-green-400"
            : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </button>
      <button
        type="button"
        onClick={() => submitVote(-1)}
        disabled={loading}
        aria-label="Downvote"
        className={`rounded-md p-1.5 transition-all duration-150 active:scale-90 ${
          vote === -1
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </button>
      {feedback && (
        <span className="text-[10px] text-green-600 dark:text-green-400 ml-auto">{feedback}</span>
      )}
      {voteError && (
        <span className="text-[10px] text-red-500 ml-auto">{voteError}</span>
      )}
    </div>
  );
}
