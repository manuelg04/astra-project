"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  postSpaceId: string;
}

export default function PostComposer({ postSpaceId }: Props) {
  const [text, setText] = useState("");

  const onSubmit = async () => {
    if (!text.trim()) return;
    /* TODO: llamada al endpoint de creación */
    setText("");
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatar-placeholder.png" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <Input
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder="Share something"
        className="flex-1 bg-secondary placeholder:text-muted-foreground"
      />

      <Button size="sm" onClick={onSubmit} disabled={!text.trim()}>
        Post
      </Button>
    </div>
  );
}