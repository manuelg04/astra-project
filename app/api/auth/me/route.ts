import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sub: userId } = verifyJWT(token);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          email: user.email,
          name: user.name ?? "",
          avatarUrl: user.avatarUrl ?? null,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}