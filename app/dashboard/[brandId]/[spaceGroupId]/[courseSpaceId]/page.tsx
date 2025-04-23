// app/dashboard/[brandId]/[spaceGroupId]/[courseSpaceId]/page.tsx

import { prisma } from "@/lib/db";

interface Params {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
}

export default async function CourseSpacePage({ params }: { params: Params }) {
  // 1 · Desestructuramos params de forma asíncrona
  const { brandId, spaceGroupId, courseSpaceId } = await params;

  // 2 · Query mínima de validación — comprueba jerarquía correcta
  const courseSpace = await prisma.courseSpace.findFirst({
    where: {
      id: courseSpaceId,
      spaceGroup: {
        id: spaceGroupId,
        brandId,
      },
    },
    include: {
      _count: { select: { courses: true } },
    },
  });

  // 3 · Si no existe, renderizamos un fallback
  if (!courseSpace) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">No encontrado</h1>
        <p className="text-gray-500">El espacio de cursos no existe.</p>
      </div>
    );
  }

  // 4 · Render principal
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{courseSpace.title}</h1>
      <p className="text-gray-600">
        {courseSpace._count.courses} curso
        {courseSpace._count.courses === 1 ? "" : "s"} en este espacio.
      </p>
      <div className="mt-6 border rounded-lg p-6 text-gray-500">
        Todavía no has añadido cursos.
        <br />
        Usa el botón “Nuevo curso” cuando esté disponible.
      </div>
    </div>
  );
}
