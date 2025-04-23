import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { setupProfileSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId } = verifyJWT(token);

  const body = await req.json();
  const data = setupProfileSchema.parse(body);

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}