"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ImageRow } from "@/types/database";
import { ImageCard } from "@/components/ImageCard";
import { ViewSwitcher } from "@/components/ViewSwitcher";

const VOTE_COLUMN = "vote_value";

export function HomeContent() {
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [imageIdToCaptionId, setImageIdToCaptionId] = useState<Record<string, string>>({});
  const [captionTexts, setCaptionTexts] = useState<Record<string, string>>({});
  const [votesArray, setVotesArray] = useState<{ caption_id: string; vote: 1 | -1 }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: images, error: imgErr } = await supabase
        .from("images")
        .select("id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition")
        .order("created_datetime_utc", { ascending: false })
        .limit(250);

      if (imgErr) {
        setError(imgErr.message);
        setLoading(false);
        return;
      }

      const allRows = (images ?? []) as ImageRow[];
      const imageIds = allRows.map((r) => r.id);

      // Fetch votes first so we know which caption IDs the user voted on
      const { data: votes } = await supabase
        .from("caption_votes")
        .select(`caption_id, ${VOTE_COLUMN}`)
        .eq("profile_id", user.id)
        .limit(10000);

      const parsed = (votes ?? [])
        .map((v: Record<string, unknown>) => {
          const num = Number(v[VOTE_COLUMN]);
          return { caption_id: v.caption_id as string, vote: num === 1 ? 1 : num === -1 ? -1 : 0 };
        })
        .filter((v): v is { caption_id: string; vote: 1 | -1 } => v.vote !== 0);
      const votedCaptionIds = new Set(parsed.map((v) => v.caption_id));

      // Fetch captions in chunks of 100 image IDs
      const captionMap: Record<string, string> = {};
      const textMap: Record<string, string> = {};
      for (let i = 0; i < imageIds.length; i += 100) {
        const batch = imageIds.slice(i, i + 100);
        const { data: caps } = await supabase
          .from("captions")
          .select("id, image_id, content")
          .in("image_id", batch)
          .not("content", "is", null)
          .order("created_datetime_utc", { ascending: true })
          .limit(1000);
        (caps ?? []).forEach((c: { id: string; image_id: string; content: string }) => {
          // Prefer the caption the user already voted on
          if (!captionMap[c.image_id] || votedCaptionIds.has(c.id)) {
            captionMap[c.image_id] = c.id;
            textMap[c.image_id] = c.content;
          }
        });
      }
      // Only show images that have captions
      const imgRows = allRows.filter((r) => captionMap[r.id]);
      setRows(imgRows);
      setImageIdToCaptionId(captionMap);
      setCaptionTexts(textMap);
      setVotesArray(parsed);
      setLoading(false);

    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
          <p className="text-sm text-neutral-400">Loading</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold text-red-600">Error loading images</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <ViewSwitcher
        rows={rows}
        votesArray={votesArray}
        voteColumn={VOTE_COLUMN}
        imageIdToCaptionId={imageIdToCaptionId}
      >
        {rows.length === 0 ? (
          <p className="text-lg text-neutral-600 dark:text-neutral-400">No images yet.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 list-none p-0 m-0">
            {rows.map((row) => {
              const captionId = imageIdToCaptionId[row.id] ?? null;
              const currentVote = captionId ? (votesArray.find((x) => x.caption_id === captionId)?.vote ?? null) : null;
              return (
                <li key={row.id}>
                  <ImageCard
                    row={row}
                    captionId={captionId}
                    captionText={captionTexts[row.id] ?? null}
                    currentVote={currentVote === 1 ? 1 : currentVote === -1 ? -1 : null}
                    voteColumn={VOTE_COLUMN}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </ViewSwitcher>
    </main>
  );
}
