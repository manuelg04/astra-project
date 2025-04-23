import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

/* ------------------------------------------------------------------
   GET /api/onboarding
   Cabecera:  Authorization: Bearer <JWT>
   Respuesta: { completed: boolean, brandId?: string }
------------------------------------------------------------------ */
export async function GET(req: Request) {
  /* 1 · Autenticación ------------------------------------------------ */
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

  /* 2 · ¿Existe al menos una Brand del usuario? ---------------------- */
  const brand = await prisma.brand.findFirst({
    where: { creatorId: userId },
    select: { id: true },
  });

  /* 3 · Respuesta ---------------------------------------------------- */
  return NextResponse.json(
    brand
      ? { completed: true, brandId: brand.id }
      : { completed: false },
    { status: 200 },
  );
}