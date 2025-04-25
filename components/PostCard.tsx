import { Pin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Post {
  id: string;
  title: string | null;
  message: string;
  isPinned: boolean;
  likesCount: number;
  relativeDate: string;
  authorName: string;
  authorImage: string | null;
  authorRole: string | null;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article
      className={`relative rounded-xl border border-gray-700 bg-gray-800/60 p-5 transition-shadow hover:shadow-md ${
        post.isPinned ? "border-l-blue-500" : ""
      }`}
    >
      {/* icono de fijado */}
      {post.isPinned && (
        <Pin
          className="absolute right-3 top-3 h-4 w-4 text-blue-400"
          aria-label="Pinned"
        />
      )}

      {/* encabezado con avatar, nombre, badge y fecha */}
      <header className="mb-3 flex items-center gap-3">
        <img
          src={post.authorImage ?? "/avatar-placeholder.png"}
          alt={post.authorName}
          className="h-8 w-8 rounded-full object-cover"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-100">
            {post.authorName}
          </span>

          {post.authorRole === "CREATOR" && (
            <Badge variant="default">Creator</Badge>
          )}

          <span className="text-xs text-gray-500">{post.relativeDate}</span>
        </div>
      </header>

      {/* contenido */}
      {post.title && (
        <h2 className="mb-1 text-lg font-semibold text-gray-100">
          {post.title}
        </h2>
      )}
      <p className="whitespace-pre-line text-gray-300">{post.message}</p>

      {/* footer con likes */}
      <footer className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <Heart
          className={`mr-1 h-4 w-4 ${
            post.likesCount ? "fill-rose-600 text-rose-600" : "text-gray-500"
          }`}
        />
        {post.likesCount}
      </footer>
    </article>
  );
}
