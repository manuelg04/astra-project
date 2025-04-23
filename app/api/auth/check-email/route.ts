import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emailSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = emailSchema.parse(body);

  const exists = await prisma.user.findUnique({ where: { email } });

  return NextResponse.json({ exists: Boolean(exists) }, { status: 200 });
}
