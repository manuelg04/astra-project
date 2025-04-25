import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  paramsSchema,
  createPostSpaceSchema,
} from "@/lib/validators/postSpace";
import { verifyJWT } from "@/lib/jwt";
import { isBrandAdmin } from "@/lib/auth/permissions";
import { ZodError } from "zod";

type RouteParams = { brandId: string; spaceGroupId: string };

export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> },
) {
  /* 1 · Auth --------------------------------------------------------- */
  const [, token] = (req.headers.get("authorization") ?? "").split(" ");
  if (!token)
    return NextResponse.json(
      { error: "Missing Bearer token" },
      { status: 401 },
    );

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  /* 2 · Parámetros --------------------------------------------------- */
  let brandId: string, spaceGroupId: string;
  try {
    ({ brandId, spaceGroupId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 3 · Body --------------------------------------------------------- */
  let payload: { name: string; description?: string | null };
  try {
    payload = createPostSpaceSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 4 · Permisos ----------------------------------------------------- */
  if (!(await isBrandAdmin(userId, brandId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 5 · Verificar jerarquía ----------------------------------------- */
  const group = await prisma.spaceGroup.findFirst({
    where: { id: spaceGroupId, brandId },
    select: { id: true },
  });
  if (!group) {
    return NextResponse.json(
      { error: "SpaceGroup not found in this hierarchy" },
      { status: 404 },
    );
  }

  /* 6 · Crear PostSpace --------------------------------------------- */
  const postSpace = await prisma.postSpace.create({
    data: {
      name: payload.name,
      description: payload.description,
      spaceGroupId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(postSpace, { status: 201 });
}
