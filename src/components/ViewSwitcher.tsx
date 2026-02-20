"use client";

import { useState, useMemo } from "react";
import type { ImageRow } from "@/types/database";
import { StudyView } from "./StudyView";
import { ThemeToggle } from "./ThemeProvider";

type ViewMode = "grid" | "study";

export function ViewSwitcher({
  rows,
  votesArray,
  userId,
  children,
}: {
  rows: ImageRow[];
  votesArray: { caption_id: string; vote: number }[];
  userId: string;
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
            Vote with ↑/↓; you’ll see “Saved” when it’s stored. Refresh the page to confirm your vote stayed (arrow stays highlighted).
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500 font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Your votes loaded: <strong>{votesArray.length}</strong></span>
            <span>·</span>
            <span>
              User ID: <code className="select-all bg-black/5 dark:bg-white/10 px-1 rounded">{userId.slice(0, 8)}…</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(userId)}
                className="ml-1 text-neutral-500 hover:text-foreground underline"
              >
                Copy full ID
              </button>
            </span>
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

      {viewMode === "grid" ? children : <StudyView rows={rows} voteByCaptionId={voteByCaptionId} />}
    </>
  );
}
