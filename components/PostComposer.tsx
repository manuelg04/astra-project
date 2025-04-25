"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPost } from "@/hooks/usePosts";
import { getUserProfile } from "@/lib/auth";

interface Props {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
  onCreated: () => void; // ← para revalidar SWR
}

export default function PostComposer({
  brandId,
  spaceGroupId,
  postSpaceId,
  onCreated,
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] =
    useState<Awaited<ReturnType<typeof getUserProfile>>>();

  /* carga perezosa del user */
  if (user === undefined) {
    getUserProfile().then(setUser);
  }

  const onSubmit = async () => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await createPost(brandId, spaceGroupId, postSpaceId, {
        message: text.trim(),
      });
      setText("");
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user?.avatarUrl ?? ""} />
        <AvatarFallback>
          {user?.fullName
            ? user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
            : "U"}
        </AvatarFallback>
      </Avatar>

      <Input
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder="Share something"
        className="flex-1 bg-secondary placeholder:text-muted-foreground"
      />

      <Button size="sm" onClick={onSubmit} disabled={!text.trim() || isSending}>
        {isSending ? "Enviando…" : "Post"}
      </Button>
    </div>
  );
}
