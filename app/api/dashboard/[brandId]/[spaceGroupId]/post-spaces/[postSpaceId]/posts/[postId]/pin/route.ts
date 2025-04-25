import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { canEditPost } from "@/lib/auth/permissions";
import { ZodError } from "zod";
import { paramsSchema, type RouteParams } from "@/lib/validators/postUpdate";

/* ────────────────────────────────  POST  ──────────────────────────────── */
export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> },
) {
  /* 1 · Auth */
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

  /* 2 · Params */
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

  /* 3 · Permisos */
  if (!(await canEditPost(userId, brandId, spaceGroupId, postId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 4 · Toggle pin */
  const result = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUniqueOrThrow({
      where: { id: postId },
      select: { isPinned: true },
    });

    const updated = await tx.post.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
      select: {
        id: true,
        isPinned: true,
        updatedAt: true,
      },
    });

    return updated;
  });

  return NextResponse.json(result, { status: 200 });
}
