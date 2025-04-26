import { prisma } from "@/lib/db";
import CourseHeader from "@/components/course-view/CourseHeader";
import ChapterAccordion from "@/components/course-view/ChapterAccordion";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Params {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
  courseId: string;
  lessonId: string;
}

export default async function LessonPage({ params }: { params: Params }) {
  const { brandId, spaceGroupId, courseSpaceId, courseId, lessonId } = params;

  /* 1 · Obtener curso + chapters + lesson seleccionada */
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
      image: true,
      description: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              contentUrl: true,
            },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  /* 2 · Encontrar la lesson actual */
  const flatLessons = course.chapters.flatMap((c) => c.lessons);
  const currentLesson = flatLessons.find((l) => l.id === lessonId);
  if (!currentLesson) return notFound();

  /* 3 · builder de href */
  const lessonHref = (lsId: string) =>
    `/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses/${courseId}/lessons/${lsId}`;

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[320px_1fr]">
      {/* Sidebar chapters */}
      <aside className="border-r border-border p-6 hidden lg:block">
        <ChapterAccordion
          chapters={course.chapters}
          lessonHref={lessonHref}
          currentLessonId={lessonId}
        />
      </aside>

      {/* Main content */}
      <main className="p-6">
        <CourseHeader
          backHref={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses/${courseId}`}
          title={currentLesson.title}
          description={currentLesson.description}
          image={course.image}
        />

        {/* Contenido principal de la lección */}
        {currentLesson.contentUrl ? (
          <iframe
            src={currentLesson.contentUrl}
            className="w-full h-[60vh] rounded-lg border border-border"
            allowFullScreen
          />
        ) : (
          <p className="text-muted-foreground">
            Esta lección aún no tiene contenido.
          </p>
        )}
      </main>
    </div>
  );
}
