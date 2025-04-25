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
    /* Llama a tu endpoint de creación de post */
    // await fetch("/api/posts", { ... })
    setText("");
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
      <Avatar className="h-9 w-9">
        {/* sustituye por imagen del usuario */}
        <AvatarImage src="/avatar-placeholder.png" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <Input
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder="Share something"
        className="flex-1 bg-gray-900 placeholder:text-gray-500"
      />

      <Button size="sm" onClick={onSubmit} disabled={!text.trim()}>
        Post
      </Button>
    </div>
  );
}
