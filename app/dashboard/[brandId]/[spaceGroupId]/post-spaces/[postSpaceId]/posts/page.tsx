import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import PostComposer from "@/components/PostComposer";
import PostCard, { Post } from "@/components/PostCard";

interface Params {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
}

/**
 *  Vista offline: usa datos dummy.
 *  Cuando conectes tu backend reemplaza `mockPosts`.
 */
export default async function PostSpacePage({ params }: { params: Params }) {
  const { brandId, spaceGroupId, postSpaceId } = await params;
  /* —— datos simulados ————————————————————————— */
  const mockPosts: Post[] = [
    {
      id: "p1",
      title: null,
      message: "ewr",
      isPinned: false,
      likesCount: 1,
      relativeDate: formatDistanceToNow(
        new Date(Date.now() - 6 * 60 * 60 * 1000),
        { addSuffix: true, locale: es },
      ),
      authorName: "pasto",
      authorImage: "/avatar-placeholder.png",
      authorRole: "CREATOR",
    },
  ];
  /* ———————————————————————————————————————— */

  return (
    <main className="flex flex-col gap-6 px-4 pb-12 md:px-6 lg:px-8">
      {/* cabecera + composer */}
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Posts</h1>
        <PostComposer postSpaceId={postSpaceId} />
      </header>

      {/* lista de posts */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-gray-400">
          All posts
        </h2>

        {mockPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Aún no hay publicaciones. ¡Sé el primero en compartir algo!
          </p>
        ) : (
          mockPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </main>
  );
}
