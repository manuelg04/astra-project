"use client";

import {
  Pin,
  Heart,
  MoreHorizontal,
  Edit,
  Trash2,
  PinOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  toggleLike,
  pinPost,
  deletePost,
  PostFromApi,
} from "@/hooks/usePosts";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
  post: PostFromApi;
  onMutate: () => void; // revalida lista tras cambios
}

export default function PostCard({
  brandId,
  spaceGroupId,
  postSpaceId,
  post,
  onMutate,
}: Props) {
  /* -------- like optimista -------- */
  const [optimisticLiked, setOptimisticLiked] = useState(post.liked);
  const [optimisticCount, setOptimisticCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    const nextLiked = !optimisticLiked;
    setOptimisticLiked(nextLiked);
    setOptimisticCount((c) => c + (nextLiked ? 1 : -1));
    setIsLiking(true);
    try {
      await toggleLike(brandId, spaceGroupId, postSpaceId, post.id);
      onMutate();
    } catch {
      setOptimisticLiked(!nextLiked);
      setOptimisticCount((c) => c - (nextLiked ? 1 : -1));
    } finally {
      setIsLiking(false);
    }
  };

  /* -------- pin / unpin -------- */
  const [isPinning, setIsPinning] = useState(false);
  const handlePinToggle = async () => {
    if (isPinning) return;
    setIsPinning(true);
    try {
      await pinPost(brandId, spaceGroupId, postSpaceId, post.id);
      onMutate();
    } finally {
      setIsPinning(false);
    }
  };

  /* -------- delete -------- */
  const [isDeleting, setIsDeleting] = useState(false);
  // Renamed original handleDelete to performDeleteAction for clarity
  const performDeleteAction = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePost(brandId, spaceGroupId, postSpaceId, post.id);
      onMutate(); // Revalidate list after successful deletion
    } catch (error) {
      console.error("Failed to delete post:", error);
      // Optionally show an error message to the user
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`relative rounded-xl border border-border bg-card/70 p-5 transition-shadow hover:shadow-md ${
        post.isPinned ? "border-l-primary" : ""
      }`}
    >
      {/* menú ⋯ */}
      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-md p-1 hover:bg-muted focus:outline-none"
              aria-label="Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {/* --- Pin / Unpin --- */}
            <DropdownMenuItem onClick={handlePinToggle} disabled={isPinning}>
              {post.isPinned ? (
                <>
                  <PinOff className="mr-2 h-4 w-4" />
                  Unpin post
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-4 w-4" />
                  Pin post
                </>
              )}
            </DropdownMenuItem>

            {/* --- Edit (Placeholder Dialog) --- */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* Use onSelect to prevent dropdown closing */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit post
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Abrir modal de edición: implementa el flujo que prefieras.
                    (This is a placeholder).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {/* <AlertDialogAction>Continue</AlertDialogAction> */}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* --- Delete (Confirmation Dialog) --- */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* Use onSelect to prevent dropdown closing */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                  disabled={isDeleting} // Disable trigger if already deleting
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible y eliminará permanentemente la
                    publicación.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={performDeleteAction} // Call the actual delete logic on confirm
                    disabled={isDeleting} // Disable confirm button during deletion
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {post.isPinned && (
        <Pin
          className="absolute left-3 top-3 h-4 w-4 text-primary"
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
          disabled={isLiking} // Disable like button while processing
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