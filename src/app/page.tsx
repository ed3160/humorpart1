import { createClient } from "@/lib/supabase/server";
import type { ImageRow } from "@/types/database";
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

  const { data: votes } =
    imageIds.length > 0
      ? await supabase
          .from("caption_votes")
          .select("caption_id, vote")
          .eq("profile_id", user.id)
          .in("caption_id", imageIds)
      : { data: [] };

  const votesArray = (votes ?? []).map((v: { caption_id: string; vote: number }) => ({
    caption_id: v.caption_id,
    vote: v.vote === 1 ? 1 : -1,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <ViewSwitcher rows={rows} votesArray={votesArray}>
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
