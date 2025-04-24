// app/dashboard/[brandId]/[spaceGroupId]/[courseSpaceId]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Pencil, Eye } from "lucide-react";
import { prisma } from "@/lib/db";

interface Params {
  brandId: string;
  spaceGroupId: string;
  courseSpaceId: string;
}

interface CourseWithCount {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: { chapters: number };
}

export default async function CourseSpacePage({ params }: { params: Params }) {
  const { brandId, spaceGroupId, courseSpaceId } = await params;

  // 1 · Validar jerarquía y obtener datos del espacio
  const courseSpace = await prisma.courseSpace.findFirst({
    where: {
      id: courseSpaceId,
      spaceGroup: {
        id: spaceGroupId,
        brandId,
      },
    },
    select: {
      title: true,
    },
  });

  if (!courseSpace) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <h1 className="text-2xl font-semibold text-red-400">No encontrado</h1>
        <p className="mt-2 text-gray-400">
          El espacio de cursos no existe o no tienes permiso para verlo.
        </p>
        <Link href={`/dashboard/${brandId}/${spaceGroupId}`}>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Volver al Grupo
          </button>
        </Link>
      </div>
    );
  }

  // 2 · Obtener cursos reales
  const courses = await prisma.course.findMany({
    where: { courseSpaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{courseSpace.title}</h1>
        <p className="text-gray-400">
          {courses.length} curso{courses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="bg-gray-800 p-10 rounded-xl border border-gray-700 shadow-lg max-w-md">
            <Pencil className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-semibold mb-3">No hay cursos</h2>
            <p className="text-gray-400 mb-6">Empieza creando uno</p>
            <Link
              href={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses/create`}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md">
                Crear curso
              </button>
            </Link>
          </div>
        </div>
      ) : (
        /* Grid de cursos */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col hover:scale-[1.03] transition"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={course.image ?? "/images/placeholder.jpg"}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold mb-1">{course.name}</h2>
                  <p className="text-sm text-gray-400">
                    {course._count.chapters} chapter
                    {course._count.chapters !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/dashboard/${brandId}/${spaceGroupId}/${courseSpaceId}/courses/${course.id}`}
                    className="flex-1 mr-2"
                  >
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Ver curso</span>
                    </button>
                  </Link>
                  <button className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 px-3 rounded-md flex items-center space-x-1">
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
