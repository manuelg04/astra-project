import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

export async function GET(req: Request) {
  /* 1 · Autenticación ---------------------------------------------- */
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2 · Consulta optimizada ---------------------------------------- */
  const brands = await prisma.brand.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "asc" },
    include: {
      spaceGroups: {
        orderBy: { createdAt: "asc" },
        include: {
          courseSpaces: {
            orderBy: { createdAt: "asc" },
            include: {
              _count: {
                select: { courses: true },
              },
            },
          },
          postSpaces: {
            orderBy: { createdAt: "asc" },
            include: {
              _count: {
                select: { posts: true },
              },
            },
          },
        },
      },
    },
  });

  /* 3 · Mapeo: cursosCount para cada CourseSpace ------------------- */
  const payload = brands.map((b) => ({
    ...b,
    spaceGroups: b.spaceGroups.map((sg) => ({
      ...sg,
      courseSpaces: sg.courseSpaces.map((cs) => ({
        id: cs.id,
        title: cs.title,
        description: cs.description,
        createdAt: cs.createdAt,
        updatedAt: cs.updatedAt,
        coursesCount: cs._count.courses,
      })),
    })),
  }));

  return NextResponse.json({ brands: payload }, { status: 200 });
}
