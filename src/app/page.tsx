import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { ImageRow } from "@/types/database";
import { LoginButton } from "@/components/LoginButton";

// Chosen so ~2 lines fill the caption area with "..." at the end of the second line
const MAX_CAPTION_CHARS = 52;

function truncateAtWordWithEllipsis(text: string, maxChars: number = MAX_CAPTION_CHARS): { display: string; hadMore: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return { display: trimmed, hadMore: false };
  const upToLimit = trimmed.slice(0, maxChars + 1);
  const lastSpace = upToLimit.lastIndexOf(" ");
  const cut = lastSpace > 0 ? lastSpace : maxChars;
  return {
    display: trimmed.slice(0, cut).trim() + "...",
    hadMore: true,
  };
}

function Card({ row }: { row: ImageRow }) {
  const rawCaption =
    row.additional_context ?? row.image_description ?? null;
  const result = rawCaption != null && rawCaption !== "" ? truncateAtWordWithEllipsis(rawCaption) : null;
  const caption = result ? (result.hadMore ? result.display : result.display + "...") : null;
  const hasImage = row.url != null && row.url !== "";

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-foreground/10 bg-white dark:bg-neutral-900 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col">
      <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
        {hasImage ? (
          <Image
            src={row.url!}
            alt={caption ?? "Image"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>
      {caption != null && caption !== "" && (
        <div className="p-3 min-w-0 flex-shrink-0">
          <p className="text-sm text-foreground/90 leading-tight break-words">
            {caption}
          </p>
        </div>
      )}
    </article>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
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

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6 md:mb-8">
        Images
      </h1>

      {rows.length === 0 ? (
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          No images yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 list-none p-0 m-0">
          {rows.map((row) => (
            <li key={row.id}>
              <Card row={row} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
