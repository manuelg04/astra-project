import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paramsSchema, createPostSchema } from "@/lib/validators/post";
import { verifyJWT } from "@/lib/jwt";
import { canCreatePost, isMemberOrPublic } from "@/lib/auth/permissions";
import { uploadImageDataUrl, uploadBuffer } from "@/lib/s3";
import { ZodError } from "zod";

type RouteParams = {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
};

/* ────────────────────────────────  POST  ──────────────────────────────── */
export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  /* 1 · Auth --------------------------------------------------------- */
  const [, token] = (req.headers.get("authorization") ?? "").split(" ");
  if (!token)
    return NextResponse.json(
      { error: "Missing Bearer token" },
      { status: 401 }
    );

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  /* 2 · Parámetros --------------------------------------------------- */
  let brandId: string, spaceGroupId: string, postSpaceId: string;
  try {
    ({ brandId, spaceGroupId, postSpaceId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId, postSpaceId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 }
    );
  }

  /* 3 · Body --------------------------------------------------------- */
  let payload: {
    title?: string;
    message: string;
    attachments?: { dataUrl: string }[];
  };
  try {
    payload = createPostSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 }
    );
  }

  /* 4 · Permisos ----------------------------------------------------- */
  if (!(await canCreatePost(userId, brandId, spaceGroupId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 5 · Verificar jerarquía ----------------------------------------- */
  const postSpace = await prisma.postSpace.findFirst({
    where: {
      id: postSpaceId,
      spaceGroup: { id: spaceGroupId, brandId },
    },
    select: { id: true },
  });
  if (!postSpace) {
    return NextResponse.json(
      { error: "PostSpace not found in this hierarchy" },
      { status: 404 }
    );
  }

  /* 6 · Subir adjuntos ---------------------------------------------- */
  const attachmentsData: { url: string; type: "IMAGE" | "PDF" }[] = [];

  if (payload.attachments?.length) {
    for (const { dataUrl } of payload.attachments) {
      if (dataUrl.startsWith("data:image/")) {
        const url = await uploadImageDataUrl(dataUrl, "post-attachments");
        attachmentsData.push({ url, type: "IMAGE" });
      } else if (dataUrl.startsWith("data:application/pdf")) {
        const [, mime, base64] = dataUrl.match(
          /^data:(application\/pdf);base64,([a-zA-Z0-9+/=]+)$/i
        )!;
        const buffer = Buffer.from(base64, "base64");
        const url = await uploadBuffer(buffer, mime, "post-attachments");
        attachmentsData.push({ url, type: "PDF" });
      }
    }
  }

  /* 7 · Crear Post + adjuntos --------------------------------------- */
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        title: payload.title,
        message: payload.message,
        postSpaceId,
        creatorId: userId,
      },
    });

    if (attachmentsData.length) {
      await tx.postAttachment.createMany({
        data: attachmentsData.map((a) => ({ ...a, postId: created.id })),
      });
    }

    return tx.post.findUnique({
      where: { id: created.id },
      select: {
        id: true,
        title: true,
        message: true,
        likesCount: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        attachments: { select: { id: true, url: true, type: true } },
      },
    });
  });

  return NextResponse.json(post, { status: 201 });
}

/* ────────────────────────────────  GET  ──────────────────────────────── */
export async function GET(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  /* 1 · Auth opcional (para verificar membresía) -------------------- */
  const authHeader = req.headers.get("authorization") ?? "";
  const [, token] = authHeader.split(" ");
  let userId: string | null = null;
  if (token) {
    try {
      userId = verifyJWT(token).sub;
    } catch {
      /* sigue anónimo */
    }
  }

  /* 2 · Parámetros --------------------------------------------------- */
  let brandId: string, spaceGroupId: string, postSpaceId: string;
  try {
    ({ brandId, spaceGroupId, postSpaceId } = await context.params);
    paramsSchema.parse({ brandId, spaceGroupId, postSpaceId });
  } catch (err) {
    return NextResponse.json(
      { errors: (err as ZodError).errors },
      { status: 400 }
    );
  }

  /* 3 · Verificar acceso -------------------------------------------- */
  if (!(await isMemberOrPublic(userId, brandId, spaceGroupId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /* 4 · Listar Posts ------------------------------------------------- */
  const postsRaw = await prisma.post.findMany({
    where: { postSpaceId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      message: true,
      likesCount: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
      // ← solo necesitamos saber si EXISTE un like del usuario
      likes:
        userId !== null ? { where: { userId }, select: { id: true } } : false,
    },
  });

  /* 5 · Convertir a formato API ------------------------------------ */
  const posts = postsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    message: p.message,
    likesCount: p.likesCount,
    isPinned: p.isPinned,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    creator: p.creator,
    liked: userId !== null ? p.likes.length > 0 : false,
  }));

  return NextResponse.json({ data: posts }, { status: 200 });
}
