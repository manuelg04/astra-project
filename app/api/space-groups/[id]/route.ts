// app/api/space-groups/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

export async function PATCH(
  req: Request,
  ctx: { params: { id: Promise<string> } },
) {
  const id = await ctx.params.id;
  console.log("PATCH request for space group ID:", id);

  /* 1 · Auth ------------------------------------------------------- */
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");
  if (!token) {
    console.log("Auth error: No token provided");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    userId = verifyJWT(token).sub;
    console.log("Authenticated user ID:", userId);
  } catch {
    console.log("Auth error: Invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2 · Body ------------------------------------------------------- */
  const body = (await req.json()) as {
    name: string;
    price: number;
    isPublic: boolean;
    color?: string | null;
    emoji?: string | null;
  };
  console.log("Request body:", body);

  /* 3 · Verificar pertenencia ------------------------------------- */
  const exists = await prisma.spaceGroup.findFirst({
    where: { id, brand: { creatorId: userId } },
    select: { id: true },
  });
  if (!exists) {
    console.log("Space group not found or not owned by user");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.log("Space group exists and belongs to user");

  /* 4 · Update ----------------------------------------------------- */
  const updated = await prisma.spaceGroup.update({
    where: { id },
    data: {
      name: body.name,
      price: body.price,
      isPublic: body.isPublic,
      color: body.color?.replace(/^#/, ""),
      emoji: body.emoji,
      pricingType: body.price > 0 ? "PAID" : "FREE",
    },
    select: {
      id: true,
      name: true,
      price: true,
      pricingType: true,
      isPublic: true,
      color: true,
      emoji: true,
    },
  });
  console.log("Updated space group:", updated);

  return NextResponse.json(updated, { status: 200 });
}
