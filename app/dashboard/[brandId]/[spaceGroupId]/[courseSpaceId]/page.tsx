"use client";

import { prisma } from "@/lib/db";

interface Params {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
}

export default async function CourseSpacePage({ params }: { params: Params }) {
  const { brandId, spaceGroupId, courseSpaceId } = params;

  /* 1 · Query mínima de validación — comprueba pertenencia en cadena */
  const courseSpace = await prisma.courseSpace.findFirst({
    where: {
      id: courseSpaceId,
      spaceGroup: {
        id: spaceGroupId,
        brandId, // asegura jerarquía correcta
      },
    },
    include: {
      _count: { select: { courses: true } },
    },
  });

  if (!courseSpace) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">No encontrado</h1>
        <p className="text-gray-500">El espacio de cursos no existe.</p>
      </div>
    );
  }

  /* 2 · Render */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{courseSpace.title}</h1>

      <p className="text-gray-600">
        {courseSpace._count.courses} curso
        {courseSpace._count.courses === 1 ? "" : "s"} en este espacio.
      </p>

      {/* Placeholder: aquí listarás los cursos */}
      <div className="mt-6 border rounded-lg p-6 text-gray-500">
        Todavía no has añadido cursos.
        <br />
        Usa el botón “Nuevo curso” cuando esté disponible.
      </div>
    </div>
  );
}
