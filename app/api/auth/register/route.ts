import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const data = registerSchema.parse(body);

  if (data.password !== data.confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 },
    );
  }

  const duplicate = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: await hashPassword(data.password),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}