// app/api/dashboard/[brandId]/[spaceGroupId]/[courseSpaceId]/courses/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadImageDataUrl } from "@/lib/s3";
import { paramsSchema, createCourseSchema } from "@/lib/validators/course";
import { ZodError } from "zod";

type RouteParams = {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
};

export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> }, // ⬅️  EL OBJETO ES LA PROMESA
) {
  /* 1 · Await de `params` ----------------------------------------- */
  let brandId: string, spaceGroupId: string, courseSpaceId: string;
  try {
    ({ brandId, spaceGroupId, courseSpaceId } = await context.params);
  } catch {
    return NextResponse.json(
      { error: "Invalid route parameters" },
      { status: 400 },
    );
  }

  /* 2 · Validación -------------------------------------------------- */
  try {
    paramsSchema.parse({ brandId, spaceGroupId, courseSpaceId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 3 · Body -------------------------------------------------------- */
  let payload: { name: string; description?: string; image?: string };
  try {
    payload = createCourseSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 4 · Jerarquía --------------------------------------------------- */
  const space = await prisma.courseSpace.findFirst({
    where: {
      id: courseSpaceId,
      spaceGroup: { id: spaceGroupId, brandId },
    },
    select: { id: true },
  });
  if (!space) {
    return NextResponse.json(
      { error: "CourseSpace not found in this hierarchy" },
      { status: 404 },
    );
  }

  /* 5 · Upload (si viene) ------------------------------------------ */
  let imageUrl: string | null = null;
  if (payload.image) {
    try {
      imageUrl = await uploadImageDataUrl(payload.image, "course-images");
    } catch {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 },
      );
    }
  }

  /* 6 · Crear curso ------------------------------------------------- */
  const course = await prisma.course.create({
    data: {
      name: payload.name,
      description: payload.description,
      image: payload.image,
      courseSpaceId: space.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  /* 7 · OK ---------------------------------------------------------- */
  return NextResponse.json(course, { status: 201 });
}
