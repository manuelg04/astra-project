import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";
import {
  paramsSchema,
  createChapterSchema,
  type RouteParams,
} from "@/lib/validators/chapter";

/* ────────────────────────────────  POST  ─────────────────────────────── */
export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> },
) {
  /* 1 · Obtener y validar params ------------------------------------ */
  let brandId: string,
    spaceGroupId: string,
    courseSpaceId: string,
    courseId: string;
  try {
    ({ brandId, spaceGroupId, courseSpaceId, courseId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId, courseSpaceId, courseId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors ?? "Invalid route params" },
      { status: 400 },
    );
  }

  /* 2 · Validar body ------------------------------------------------- */
  let payload: { title: string };
  try {
    payload = createChapterSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 3 · Verificar jerarquía curso ----------------------------------- */
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      courseSpace: {
        id: courseSpaceId,
        spaceGroup: { id: spaceGroupId, brandId },
      },
    },
    select: { id: true },
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found in this hierarchy" },
      { status: 404 },
    );
  }

  /* 4 · Calcular posición ------------------------------------------- */
  const maxPos = await prisma.courseChapter.aggregate({
    where: { courseId },
    _max: { position: true },
  });

  const nextPosition = (maxPos._max.position ?? 0) + 1;

  /* 5 · Crear capítulo ---------------------------------------------- */
  const chapter = await prisma.courseChapter.create({
    data: {
      title: payload.title.trim(),
      position: nextPosition,
      courseId: course.id,
    },
    select: {
      id: true,
      title: true,
      lessons: { select: { id: true, title: true } }, // vacío inicialmente
    },
  });

  /* 6 · OK ----------------------------------------------------------- */
  return NextResponse.json(chapter, { status: 201 });
}