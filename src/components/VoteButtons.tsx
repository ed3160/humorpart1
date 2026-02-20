"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CAPTION_VOTES_VOTE_COLUMN } from "@/lib/caption-votes";

type Vote = 1 | -1 | null;

const UNDO_DURATION_MS = 4000;
const SAVED_FEEDBACK_MS = 2000;

export function VoteButtons({
  captionId,
  initialVote,
}: {
  captionId: string;
  initialVote: Vote;
}) {
  const [vote, setVote] = useState<Vote>(initialVote);
  const [loading, setLoading] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // Keep highlight in sync with DB after refresh or revalidation (SELECT on caption_votes)
  useEffect(() => {
    setVote(initialVote);
  }, [initialVote]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  async function submitVote(newVote: 1 | -1) {
    setLoading(true);
    setShowUndo(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("caption_votes").upsert(
        {
          profile_id: user.id,
          caption_id: captionId,
          [CAPTION_VOTES_VOTE_COLUMN]: newVote,
        },
        {
          onConflict: "profile_id,caption_id",
        }
      );

      if (!error) {
        setVote(newVote);
        setShowUndo(true);
        setShowSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setShowSaved(false), SAVED_FEEDBACK_MS);
        undoTimerRef.current = setTimeout(() => setShowUndo(false), UNDO_DURATION_MS);
      }
    } finally {
      setLoading(false);
    }
  }

  async function undo() {
    setShowUndo(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("caption_votes")
        .delete()
        .eq("profile_id", user.id)
        .eq("caption_id", captionId);

      if (!error) setVote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1 p-2 flex-wrap">
      <button
        type="button"
        onClick={() => submitVote(1)}
        disabled={loading}
        aria-label="Upvote"
        className={`rounded-lg p-1.5 transition-all duration-200 active:scale-95 ${
          vote === 1
            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        }`}
      >
        <span className="text-lg leading-none">↑</span>
      </button>
      <button
        type="button"
        onClick={() => submitVote(-1)}
        disabled={loading}
        aria-label="Downvote"
        className={`rounded-lg p-1.5 transition-all duration-200 active:scale-95 ${
          vote === -1
            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        }`}
      >
        <span className="text-lg leading-none">↓</span>
      </button>
      {showSaved && (
        <span className="text-xs font-medium text-green-600 dark:text-green-400" aria-live="polite">
          Saved
        </span>
      )}
      {showUndo && (
        <button
          type="button"
          onClick={undo}
          className="rounded-lg px-2 py-1 text-xs font-medium bg-foreground/10 text-foreground/80 hover:bg-foreground/20 transition-colors duration-200"
        >
          Undo
        </button>
      )}
    </div>
  );
}
