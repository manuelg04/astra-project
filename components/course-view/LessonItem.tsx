"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface Props {
  href: string;
  title: string;
  isActive: boolean;
}

export default function LessonItem({ href, title, isActive }: Props) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer
        ${isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`}
      >
        <PlayCircle className="h-4 w-4 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
    </Link>
  );
}
