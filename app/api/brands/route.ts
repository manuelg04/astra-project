import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { createBrandSchema } from "@/lib/validators";

export async function POST(req: Request) {
  /* 1 · Autenticación ------------------------------------------------ */
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2 · Validación --------------------------------------------------- */
  let data;
  try {
    const body = await req.json();
    data = createBrandSchema.parse(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  /* 3 · Reglas de negocio (único nombre por creador) ----------------- */
  const exists = await prisma.brand.findFirst({
    where: { name: data.name, creatorId: userId },
  });
  if (exists)
    return NextResponse.json(
      { error: "Brand name already exists" },
      { status: 409 },
    );

  /* 4 · Persistencia ------------------------------------------------- */
  const brand = await prisma.brand.create({
    data: {
      name: data.name,
      emoji: data.emoji,
      color: data.color?.replace(/^#/, ""),
      logoUrl: data.logoUrl,
      creatorId: userId,
    },
    select: { id: true, name: true },
  });

  return NextResponse.json({ brand }, { status: 201 });
}