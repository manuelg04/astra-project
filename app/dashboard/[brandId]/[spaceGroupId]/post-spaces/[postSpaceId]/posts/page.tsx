"use client";

import React from "react";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import { usePosts, PostFromApi } from "@/hooks/usePosts";

interface Params {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
}

/* 1) indicamos que `params` es una **promesa** */
export default function PostSpacePage({ params }: { params: Promise<Params> }) {
  /* 2) lo desenvolvemos con React.use() */
  const { brandId, spaceGroupId, postSpaceId } = React.use(params);

  const { posts, isLoading, error, mutate } = usePosts(
    brandId,
    spaceGroupId,
    postSpaceId,
  );

  return (
    <main className="flex flex-col gap-6 px-4 pb-12 md:px-6 lg:px-8">
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Posts
        </h1>

        <PostComposer
          brandId={brandId}
          spaceGroupId={spaceGroupId}
          postSpaceId={postSpaceId}
          onCreated={mutate}
        />
      </header>

      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          All posts
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : error ? (
          <p className="text-red-500 text-sm">Error al cargar publicaciones</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aún no hay publicaciones. ¡Sé el primero en compartir algo!
          </p>
        ) : (
          posts.map((post: PostFromApi) => (
            <PostCard key={post.id} post={post} onMutate={mutate} />
          ))
        )}
      </section>
    </main>
  );
}
