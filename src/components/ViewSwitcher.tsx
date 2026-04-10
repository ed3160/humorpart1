"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ImageRow } from "@/types/database";
import { StudyView } from "./StudyView";
import { ThemeToggle } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/client";

type ViewMode = "grid" | "study";

export function ViewSwitcher({
  rows,
  votesArray,
  voteColumn,
  imageIdToCaptionId,
  captionTexts,
  userProfile,
  children,
}: {
  rows: ImageRow[];
  votesArray: { caption_id: string; vote: number }[];
  voteColumn: string;
  imageIdToCaptionId: Record<string, string>;
  captionTexts: Record<string, string>;
  userProfile: { name: string; avatar: string } | null;
  children: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("study");

  const voteByCaptionId = useMemo(() => {
    const m = new Map<string, 1 | -1>();
    votesArray.forEach((v) => m.set(v.caption_id, v.vote === 1 ? 1 : -1));
    return m;
  }, [votesArray]);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Crackd</h1>
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800 flex">
            <button
              type="button"
              onClick={() => setViewMode("study")}
              aria-pressed={viewMode === "study"}
              title="View one image at a time"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "study"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
              }`}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              title="Browse all images at once"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
              }`}
            >
              Gallery
            </button>
          </div>
          <Link
            href="/generate"
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Upload
          </Link>
          <ThemeToggle />
          {userProfile && (
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              title="Sign out"
              className="rounded-full hover:ring-2 hover:ring-neutral-400 transition-all"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </header>

      {viewMode === "grid" ? children : <StudyView rows={rows} voteByCaptionId={voteByCaptionId} voteColumn={voteColumn} imageIdToCaptionId={imageIdToCaptionId} captionTexts={captionTexts} />}
    </>
  );
}
