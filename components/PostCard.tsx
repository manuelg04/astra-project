"use client";

import { Pin, Heart } from "lucide-react";
import { toggleLike, PostFromApi } from "@/hooks/usePosts";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
  post: PostFromApi;
  onMutate: () => void; // revalida lista tras like
}

export default function PostCard({
  brandId,
  spaceGroupId,
  postSpaceId,
  post,
  onMutate,
}: Props) {
  const [optimisticLiked, setOptimisticLiked] = useState(post.liked);
  const [optimisticCount, setOptimisticCount] = useState(post.likesCount);
  const [isSending, setIsSending] = useState(false);

  const handleLike = async () => {
    if (isSending) return;

    const nextLiked = !optimisticLiked;
    setOptimisticLiked(nextLiked);
    setOptimisticCount((c) => c + (nextLiked ? 1 : -1));
    setIsSending(true);

    try {
      await toggleLike(brandId, spaceGroupId, postSpaceId, post.id);
      onMutate(); // revalidar contra el servidor
    } catch {
      // revertir si falla
      setOptimisticLiked(!nextLiked);
      setOptimisticCount((c) => c - (nextLiked ? 1 : -1));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <article
      className={`relative rounded-xl border border-border bg-card/70 p-5 transition-shadow hover:shadow-md ${
        post.isPinned ? "border-l-primary" : ""
      }`}
    >
      {post.isPinned && (
        <Pin
          className="absolute right-3 top-3 h-4 w-4 text-primary"
          aria-label="Pinned"
        />
      )}

      {/* encabezado */}
      <header className="mb-3 flex items-center gap-3">
        <Image
          src={post.creator.avatarUrl ?? "/avatar-placeholder.png"}
          alt={post.creator.name ?? "user"}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {post.creator.name ?? "Anon"}
          </span>

          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
      </header>

      {post.title && (
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          {post.title}
        </h2>
      )}
      <p className="whitespace-pre-line text-muted-foreground">
        {post.message}
      </p>

      {/* footer */}
      <footer className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <button
          className="flex items-center gap-1 focus:outline-none"
          onClick={handleLike}
        >
          <Heart
            className={`h-4 w-4 ${
              optimisticLiked ? "fill-rose-600 text-rose-600" : ""
            }`}
          />
          {optimisticCount}
        </button>
      </footer>
    </article>
  );
}
