import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

interface Params {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
}

export default async function PostSpacePage({ params }: { params: Params }) {
    const { brandId, spaceGroupId, postSpaceId } = await params;

  /* 1 · verificar jerarquía --------------------------------------- */
  const postSpace = await prisma.postSpace.findFirst({
    where: {
      id: postSpaceId,
      spaceGroup: { id: spaceGroupId, brandId },
    },
    select: {
      id: true,
      name: true,
      posts: {
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
        },
      },
    },
  });

  if (!postSpace) return notFound();

  /* 2 · UI --------------------------------------------------------- */
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{postSpace.name}</h1>

      {postSpace.posts.length === 0 ? (
        <p className="text-gray-500">Sin posts todavía.</p>
      ) : (
        <ul className="space-y-4">
          {postSpace.posts.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              {p.title && (
                <h2 className="text-lg font-semibold mb-1">{p.title}</h2>
              )}
              <p className="whitespace-pre-line">{p.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
