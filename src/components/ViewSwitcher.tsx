"use client";

import { useState, useMemo } from "react";
import type { ImageRow } from "@/types/database";
import { StudyView } from "./StudyView";
import { ThemeToggle } from "./ThemeProvider";

type ViewMode = "grid" | "study";

export function ViewSwitcher({
  rows,
  votesArray,
  voteColumn,
  imageIdToCaptionId,
  children,
}: {
  rows: ImageRow[];
  votesArray: { caption_id: string; vote: number }[];
  voteColumn: string;
  imageIdToCaptionId: Record<string, string>;
  children: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const voteByCaptionId = useMemo(() => {
    const m = new Map<string, 1 | -1>();
    votesArray.forEach((v) => m.set(v.caption_id, v.vote === 1 ? 1 : -1));
    return m;
  }, [votesArray]);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Images</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Rate each caption with ↑ (upvote) or ↓ (downvote). Your vote is saved to the database; refresh to see it persist.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1 bg-foreground/10 flex">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-neutral-800 text-foreground shadow"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("study")}
              aria-pressed={viewMode === "study"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "study"
                  ? "bg-white dark:bg-neutral-800 text-foreground shadow"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Study
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {viewMode === "grid" ? children : <StudyView rows={rows} voteByCaptionId={voteByCaptionId} voteColumn={voteColumn} imageIdToCaptionId={imageIdToCaptionId} />}
    </>
  );
}
