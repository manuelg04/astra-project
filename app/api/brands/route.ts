import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

import { uploadBuffer } from "@/lib/s3";
import { Prisma } from "@prisma/client";
import { createCommunitySchema } from "@/lib/validators";

/* ------------------------------------------------------------------ */
/*  POST /api/brands – On-boarding inicial de comunidad                */
/*  Body: multipart/form-data                                          */
/*    name           → string  (required)                              */
/*    logo           → File    (optional)                              */
/*    pricingType    → "FREE" | "PAID" (required)                      */
/*    price          → integer > 0  (required if pricingType = PAID)   */
/*    contentType    → "courses"    (actualmente la única opción)      */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  /* 1 · Autenticación ------------------------------------------------ */
  const authHeader = req.headers.get("authorization") ?? "";
  const [, jwt] = authHeader.split(" ");
  if (!jwt)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    userId = verifyJWT(jwt).sub;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2 · Parseo & validación (multipart/form-data) -------------------- */
  const form = await req.formData();

  const raw = {
    name: form.get("name"),
    pricingType: form.get("pricingType"),
    price: form.get("price"),
    contentType: form.get("contentType"),
  };

  const data = createCommunitySchema.parse({
    name: raw.name,
    pricingType: raw.pricingType,
    price: raw.price,
    contentType: raw.contentType,
  });

  /* 3 · Procesar logo (si viene) ------------------------------------ */
  let logoUrl: string | undefined;
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const buffer = Buffer.from(await logo.arrayBuffer());
    logoUrl = await uploadBuffer(buffer, logo.type, "brands");
  }

  /* 4 · Regla de unicidad Brand name (por creador) ------------------ */
  const alreadyExists = await prisma.brand.findFirst({
    where: { name: data.name, creatorId: userId },
    select: { id: true },
  });
  if (alreadyExists)
    return NextResponse.json(
      { error: "Brand name already exists" },
      { status: 409 },
    );

  /* 5 · Persistencia atómica ---------------------------------------- */
  const result = await prisma.$transaction(async (tx) => {
    /* 5.1 · Brand ---------------------------------------------------- */
    const brand = await tx.brand.create({
      data: {
        name: data.name,
        logoUrl,
        creatorId: userId,
      },
    });

    /* 5.2 · SpaceGroup ---------------------------------------------- */
    const spaceGroup = await tx.spaceGroup.create({
      data: {
        name: data.name,
        logoUrl,
        price:
          data.pricingType === "PAID"
            ? new Prisma.Decimal(data.price!)
            : new Prisma.Decimal(0),
        brandId: brand.id,
      },
    });

    /* 5.3 · CourseSpace (único tipo de contenido por ahora) --------- */
    const courseSpace =
      data.contentType === "courses"
        ? await tx.courseSpace.create({
            data: {
              title: "Cursos",
              spaceGroupId: spaceGroup.id,
            },
          })
        : null;

    return { brand, spaceGroup, courseSpace };
  });

  /* 6 · Respuesta estructurada -------------------------------------- */
  const payload = {
    brand: {
      ...result.brand,
      spaceGroups: [
        {
          ...result.spaceGroup,
          courseSpaces: result.courseSpace ? [result.courseSpace] : [],
        },
      ],
    },
  };

  return NextResponse.json(payload, { status: 201 });
}
