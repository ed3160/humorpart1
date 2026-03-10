"use client";

import Image from "next/image";
import type { ImageRow } from "@/types/database";
import { VoteButtons } from "@/components/VoteButtons";

export function ImageCard({
  row,
  captionId,
  captionText,
  currentVote,
  voteColumn,
  sizes = "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw",
  priority = false,
}: {
  row: ImageRow;
  captionId: string | null;
  captionText?: string | null;
  currentVote: 1 | -1 | null;
  voteColumn: string;
  sizes?: string;
  priority?: boolean;
}) {
  const caption = captionText ?? row.additional_context ?? row.image_description ?? null;
  const hasImage = row.url != null && row.url !== "";

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
        {hasImage ? (
          <Image
            src={row.url!}
            alt={caption ?? "Image"}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs">
            No image
          </div>
        )}
      </div>
      {caption && (
        <p className="px-3 pt-2.5 pb-1 text-xs leading-snug text-neutral-700 dark:text-neutral-300 line-clamp-3">
          {caption}
        </p>
      )}
      {captionId != null && (
        <VoteButtons captionId={captionId} initialVote={currentVote} voteColumn={voteColumn} />
      )}
    </article>
  );
}
