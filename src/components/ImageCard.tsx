"use client";

import Image from "next/image";
import type { ImageRow } from "@/types/database";
import { formatCaption } from "@/lib/caption";
import { VoteButtons } from "@/components/VoteButtons";

export function ImageCard({
  row,
  currentVote,
  voteColumn,
  sizes = "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw",
  priority = false,
}: {
  row: ImageRow;
  currentVote: 1 | -1 | null;
  voteColumn: string;
  sizes?: string;
  priority?: boolean;
}) {
  const caption = formatCaption(
    row.additional_context ?? row.image_description ?? null
  );
  const hasImage = row.url != null && row.url !== "";

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-neutral-200 dark:border-foreground/10 bg-white dark:bg-neutral-900 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-neutral-900 dark:text-neutral-100">
      <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
        {hasImage ? (
          <Image
            src={row.url!}
            alt={caption ?? "Image"}
            fill
            sizes={sizes}
            priority={priority}
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
          <p className="text-sm text-neutral-800 dark:text-foreground/90 leading-tight break-words">
            {caption}
          </p>
        </div>
      )}
      <VoteButtons captionId={row.id} initialVote={currentVote} voteColumn={voteColumn} />
    </article>
  );
}
