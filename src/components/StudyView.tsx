"use client";

import { useState, useCallback, useEffect } from "react";
import type { ImageRow } from "@/types/database";
import { ImageCard } from "@/components/ImageCard";

export function StudyView({
  rows,
  voteByCaptionId,
  voteColumn,
}: {
  rows: ImageRow[];
  voteByCaptionId: Map<string, 1 | -1>;
  voteColumn: string;
}) {
  const [index, setIndex] = useState(0);
  const current = rows[index];
  const nextRow = rows[index + 1];

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % rows.length);
  }, [rows.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + rows.length) % rows.length);
  }, [rows.length]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  if (rows.length === 0) return null;
  const currentVote = current ? (voteByCaptionId.get(current.id) ?? null) : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md mx-auto relative">
        <div key={current.id} className="transition-opacity duration-300">
          <ImageCard
            row={current}
            currentVote={currentVote}
            voteColumn={voteColumn}
            sizes="(max-width: 768px) 100vw, 28rem"
            priority
          />
        </div>

        {/* Preload next image for smooth transition */}
        {nextRow?.url && (
          <div
            className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
            aria-hidden
          >
            <img src={nextRow.url} alt="" fetchPriority="high" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous"
          className="rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground px-5 py-3 min-h-[44px] font-medium transition-all duration-200 active:scale-95 touch-manipulation"
        >
          ← Previous
        </button>
        <span className="text-sm text-foreground/60 tabular-nums py-2">
          {index + 1} / {rows.length}
        </span>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next"
          className="rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground px-5 py-3 min-h-[44px] font-medium transition-all duration-200 active:scale-95 touch-manipulation"
        >
          Next →
        </button>
      </div>
      <p className="text-xs text-foreground/50">Use ← → arrow keys to navigate</p>
    </div>
  );
}
