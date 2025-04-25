import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { isMemberOrPublic } from "@/lib/auth/permissions";
import { z, ZodError } from "zod";
import { paramsSchema, RouteParams } from "@/lib/validators/postLikes";

/* ────────────────────────────────  POST  ──────────────────────────────── */
/**
 * Toggle de “like”.
 * ▸ Si el usuario nunca dio like → lo crea y suma 1 al contador.
 * ▸ Si ya existía → lo elimina y resta 1.
 * Devuelve { postId, liked, likesCount }.
 */
export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> },
) {
  /* 1 · Autenticación ------------------------------------------------ */
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
  let brandId: string,
    spaceGroupId: string,
    postSpaceId: string,
    postId: string;
  try {
    ({ brandId, spaceGroupId, postSpaceId, postId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId, postSpaceId, postId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 3 · Verificar acceso -------------------------------------------- */
  if (!(await isMemberOrPublic(userId, brandId, spaceGroupId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 4 · Verificar jerarquía ----------------------------------------- */
  const postExists = await prisma.post.findFirst({
    where: {
      id: postId,
      postSpace: {
        id: postSpaceId,
        spaceGroup: { id: spaceGroupId, brandId },
      },
    },
    select: { id: true },
  });

  if (!postExists) {
    return NextResponse.json(
      { error: "Post not found in this hierarchy" },
      { status: 404 },
    );
  }

  /* 5 · Toggle Like (transacción) ------------------------------------ */
  const result = await prisma.$transaction(async (tx) => {
    const existingLike = await tx.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    let liked: boolean;
    if (!existingLike) {
      /* Crear nuevo like + incrementar contador */
      await tx.postLike.create({ data: { postId, userId } });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      liked = true;
    } else {
      /* Quitar like + decrementar contador */
      await tx.postLike.delete({ where: { id: existingLike.id } });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      liked = false;
    }

    /* Consultar contador actualizado */
    const { likesCount } = await tx.post.findUniqueOrThrow({
      where: { id: postId },
      select: { likesCount: true },
    });

    return { postId, liked, likesCount };
  });

  return NextResponse.json(result, { status: 200 });
}
