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
  updatePost,
  PostFromApi,
} from "@/hooks/usePosts";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  /* ══════════════════════ Estado general ══════════════════════ */
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editMessage, setEditMessage] = useState(post.message);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  const performDeleteAction = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePost(brandId, spaceGroupId, postSpaceId, post.id);
      onMutate();
    } finally {
      setIsDeleting(false);
    }
  };

  /* -------- save edición -------- */
  const handleSave = async () => {
    if (!editMessage.trim()) {
      setErrorMsg("El mensaje no puede estar vacío.");
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updatePost(
        brandId,
        spaceGroupId,
        postSpaceId,
        post.id,
        {
          title: editTitle.trim() ? editTitle.trim() : null,
          message: editMessage.trim(),
        },
      );
      setIsEditing(false);
      onMutate();
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ══════════════════════ Render ══════════════════════ */
  return (
    <article
      className={`relative rounded-xl border border-border bg-card/70 p-5 transition-shadow hover:shadow-md ${
        post.isPinned ? "border-l-primary" : ""
      }`}
    >
      {/* menú ⋯ */}
      {!isEditing && (
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
              <DropdownMenuItem
                onClick={handlePinToggle}
                disabled={isPinning}
              >
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

              {/* --- Edit (inline) --- */}
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit post
              </DropdownMenuItem>

              {/* --- Delete (Confirmation Dialog) --- */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Eliminar esta publicación?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible y eliminará permanentemente la
                      publicación.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={performDeleteAction}
                      disabled={isDeleting}
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
      )}

      {post.isPinned && !isEditing && (
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

      {/* =================== CONTENIDO =================== */}
      {isEditing ? (
        <div className="space-y-3">
          <Input
            placeholder="Título (opcional)"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            rows={4}
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            className="resize-none"
          />

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(post.title ?? "");
                setEditMessage(post.message);
                setErrorMsg(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {post.title && (
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              {post.title}
            </h2>
          )}
          <p className="whitespace-pre-line text-muted-foreground">
            {post.message}
          </p>
        </>
      )}

      {/* footer */}
      {!isEditing && (
        <footer className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <button
            className="flex items-center gap-1 focus:outline-none"
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart
              className={`h-4 w-4 ${
                optimisticLiked ? "fill-rose-600 text-rose-600" : ""
              }`}
            />
            {optimisticCount}
          </button>
        </footer>
      )}
    </article>
  );
}