import { prisma } from "@/lib/db";
import CourseHeader from "@/components/course-view/CourseHeader";
import ChapterAccordion from "@/components/course-view/ChapterAccordion";
import { notFound } from "next/navigation";
import Link from "next/link";
import CourseContent from "@/components/course-view/CourseContent";

interface Params {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
  courseId: string;
}

export default async function CoursePage({ params }: { params: Params }) {
  /* 1 · Destructurar IDs */
  const { brandId, spaceGroupId, courseSpaceId, courseId } = params;

  /* 2 · Obtener curso + chapters + lessons con Prisma */
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      courseSpace: {
        id: courseSpaceId,
        spaceGroup: { id: spaceGroupId, brandId },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      courseSpaceId: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  /* 3 · Build lesson href helper */
  const lessonHref = (lessonId: string) =>
    `/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses/${courseId}/lessons/${lessonId}`;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <CourseHeader
        backHref={`/dashboard/${brandId}/${spaceGroupId}/course-spaces/${courseSpaceId}/courses`}
        title={course.name}
        description={course.description}
        image={course.image}
      />

      {/* Contenido + botón agregar */}
      <CourseContent
        brandId={brandId}
        spaceGroupId={spaceGroupId}
        courseSpaceId={courseSpaceId}
        courseId={courseId}
        initialChapters={course.chapters}
      />
    </div>
  );
}