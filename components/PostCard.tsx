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
        <img
          src={post.authorImage ?? "/avatar-placeholder.png"}
          alt={post.authorName}
          className="h-8 w-8 rounded-full object-cover"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {post.authorName}
          </span>

          {post.authorRole === "CREATOR" && (
            <Badge variant="secondary">Creator</Badge>
          )}

          <span className="text-xs text-muted-foreground">
            {post.relativeDate}
          </span>
        </div>
      </header>

      {/* contenido */}
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
        <Heart
          className={`mr-1 h-4 w-4 ${
            post.likesCount ? "fill-rose-600 text-rose-600" : "text-muted-foreground"
          }`}
        />
        {post.likesCount}
      </footer>
    </article>
  );
}