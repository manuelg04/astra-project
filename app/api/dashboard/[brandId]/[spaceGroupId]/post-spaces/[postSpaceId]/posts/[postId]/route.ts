import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { canEditPost, canDeletePost } from "@/lib/auth/permissions";
import { ZodError } from "zod";
import {
  paramsSchema,
  updatePostSchema,
  type RouteParams,
} from "@/lib/validators/postUpdate";
import { Prisma } from "@prisma/client";

/* ────────────────────────────────  PATCH  ─────────────────────────────── */
export async function PATCH(
    req: Request,
    context: { params: Promise<RouteParams> },
  ) {
    /* 1 · Auth --------------------------------------------------------- */
    const [, token] = (req.headers.get("authorization") ?? "").split(" ");
    if (!token)
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  
    let userId: string;
    try {
      userId = verifyJWT(token).sub;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  
    /* 2 · Params ------------------------------------------------------- */
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
  
    /* 3 · Body --------------------------------------------------------- */
    let payload: { title?: string | null; message?: string };
    try {
      payload = updatePostSchema.parse(await req.json());
    } catch (err) {
      return NextResponse.json(
        { errors: (err as ZodError).errors },
        { status: 400 },
      );
    }
  
    /* 4 · Permisos ----------------------------------------------------- */
    if (!(await canEditPost(userId, brandId, spaceGroupId, postId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    /* 5 · Construir objeto data sin keys undefined -------------------- */
    const data: Prisma.PostUpdateInput = {};
    if (payload.title !== undefined) data.title = payload.title; // puede ser null
    if (payload.message !== undefined) data.message = payload.message; // string
  
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }
  
    /* 6 · Update ------------------------------------------------------- */
    const updated = await prisma.post.update({
      where: { id: postId },
      data,
      select: {
        id: true,
        title: true,
        message: true,
        isPinned: true,
        likesCount: true,
        updatedAt: true,
      },
    });
  
    return NextResponse.json(updated, { status: 200 });
  }

/* ───────────────────────────────  DELETE  ─────────────────────────────── */
export async function DELETE(
  req: Request,
  context: { params: Promise<RouteParams> },
) {
  /* 1 · Auth */
  const [, token] = (req.headers.get("authorization") ?? "").split(" ");
  if (!token)
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  /* 2 · Params */
  let brandId: string, spaceGroupId: string, postSpaceId: string, postId: string;
  try {
    ({ brandId, spaceGroupId, postSpaceId, postId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId, postSpaceId, postId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 },
    );
  }

  /* 3 · Permisos */
  if (!(await canDeletePost(userId, brandId, spaceGroupId, postId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 4 · Borrar */
  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true }, { status: 200 });
}