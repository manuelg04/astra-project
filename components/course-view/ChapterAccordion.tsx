"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import LessonItem from "./LessonItem";

interface Lesson {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  chapters: Chapter[];
  lessonHref: (lessonId: string) => string; // builder
  currentLessonId?: string | null;
}

export default function ChapterAccordion({
  chapters,
  lessonHref,
  currentLessonId,
}: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {chapters.map((ch) => {
        const isOpen = open === ch.id;
        return (
          <div key={ch.id} className="border border-border rounded-lg">
            {/* Header */}
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left"
              onClick={() => setOpen(isOpen ? null : ch.id)}
            >
              <span className="font-medium">{ch.title}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Lessons */}
            {isOpen && ch.lessons.length > 0 && (
              <div className="px-2 pb-3 space-y-1">
                {ch.lessons.map((ls) => (
                  <LessonItem
                    key={ls.id}
                    href={lessonHref(ls.id)}
                    title={ls.title}
                    isActive={ls.id === currentLessonId}
                  />
                ))}
              </div>
            )}

            {isOpen && ch.lessons.length === 0 && (
              <p className="px-4 pb-4 text-sm text-muted-foreground">
                No hay lecciones en este capítulo todavía.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}