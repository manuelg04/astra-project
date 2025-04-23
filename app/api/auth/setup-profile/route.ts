import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { setupProfileSchema } from "@/lib/validators";
import { uploadImageDataUrl } from "@/lib/s3";

export async function POST(req: Request) {
  /* 1 · Autenticación por Bearer token ------------------------------ */
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    const payload = verifyJWT(token);
    userId = payload.sub;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2 · Validar payload con Zod ------------------------------------ */
  const body = await req.json();
  const data = setupProfileSchema.parse(body); // name, phone, avatarUrl?

  /* 3 · Si viene avatar en data-URL, súbelo a S3 ------------------- */
  let finalAvatarUrl: string | null = null;

  if (data.avatarUrl) {
    try {
      finalAvatarUrl = await uploadImageDataUrl(data.avatarUrl, "avatars");
    } catch (err) {
      console.error("S3 upload error", err);
      return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 },
      );
    }
  }
  /* 4 · Actualizar usuario en BBDD --------------------------------- */
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      avatarUrl: finalAvatarUrl,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
