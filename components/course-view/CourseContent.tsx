"use client";

import { useState } from "react";
import ChapterAccordion from "./ChapterAccordion";
import AddChapterModal from "./AddChapterModel";
import { ChapterFromApi } from "@/hooks/useCourses";

interface Props {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
  courseId: string;
  initialChapters: ChapterFromApi[];
}

export default function CourseContent({
  brandId,
  spaceGroupId,
  courseSpaceId,
  courseId,
  initialChapters,
}: Props) {
  const [chapters, setChapters] = useState(initialChapters);

  const lessonHref = (lessonId: string) =>
    `/dashboard/${brandId}/${spaceGroupId}/course-spaces/${courseSpaceId}/courses/${courseId}/lessons/${lessonId}`;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Contenido del curso</h2>
        <AddChapterModal
          brandId={brandId}
          spaceGroupId={spaceGroupId}
          courseSpaceId={courseSpaceId}
          courseId={courseId}
          onCreated={(ch) => setChapters((prev) => [...prev, ch])}
        />
      </div>

      {chapters.length === 0 ? (
        <p className="text-muted-foreground">
          Este curso no tiene capítulos aún.
        </p>
      ) : (
        <ChapterAccordion chapters={chapters} lessonHref={lessonHref} />
      )}
    </>
  );
}