import { createClient } from "@/lib/supabase/server";
import type { ImageRow } from "@/types/database";
import { CAPTION_VOTES_VOTE_COLUMN } from "@/lib/caption-votes";
import { LoginButton } from "@/components/LoginButton";
import { ImageCard } from "@/components/ImageCard";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { ThemeToggleWrapper } from "@/components/ThemeToggleWrapper";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="flex items-center justify-end absolute top-4 right-4">
          <ThemeToggleWrapper />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Humor Project</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Sign in to view images
        </p>
        <LoginButton />
      </main>
    );
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold text-red-600">Error loading images</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {error.message}
        </p>
      </main>
    );
  }

  const rows = (images ?? []) as ImageRow[];
  const imageIds = rows.map((r) => r.id);

  const voteCol = CAPTION_VOTES_VOTE_COLUMN;
  const { data: votes, error: votesError } =
    imageIds.length > 0
      ? await supabase
          .from("caption_votes")
          .select("caption_id, " + voteCol)
          .eq("profile_id", user.id)
          .in("caption_id", imageIds)
      : { data: [] as { caption_id: string; [k: string]: unknown }[] | null, error: null };

  const votesRaw = (votes ?? []) as { caption_id: string; [k: string]: unknown }[];
  const votesArray = votesRaw
    .map((v) => {
      const raw = v[voteCol];
      const num = typeof raw === "number" ? raw : Number(raw);
      return { caption_id: v.caption_id, vote: num === 1 ? 1 : num === -1 ? -1 : 0 };
    })
    .filter((v): v is { caption_id: string; vote: 1 | -1 } => v.vote !== 0);

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      {votesError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
          Could not load your votes: {votesError.message}. Set <code className="bg-black/10 dark:bg-white/10 px-1 rounded">NEXT_PUBLIC_CAPTION_VOTES_VOTE_COLUMN</code> in .env.local to your table’s vote column name (see Table Editor → caption_votes).
        </div>
      )}
      <ViewSwitcher
        rows={rows}
        votesArray={votesArray}
        userId={user.id}
      >
        {rows.length === 0 ? (
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            No images yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 list-none p-0 m-0">
            {rows.map((row) => (
              <li key={row.id}>
                <ImageCard
                  row={row}
                  currentVote={
                    (() => {
                      const v = votesArray.find((x) => x.caption_id === row.id)?.vote;
                      return v === 1 ? 1 : v === -1 ? -1 : null;
                    })()
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </ViewSwitcher>
    </main>
  );
}
