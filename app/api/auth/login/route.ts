import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { signJWT } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signJWT({ sub: user.id, email: user.email });

  return NextResponse.json({ token }, { status: 200 });
}
